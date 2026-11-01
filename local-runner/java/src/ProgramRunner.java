import java.io.*;
import java.lang.management.*;
import java.lang.reflect.*;
import java.net.*;
import java.nio.charset.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

import com.sun.management.ThreadMXBean;

/**
 * コンパイル済みクラスを実行する専任クラスです。
 * <p>
 * 使い捨ての {@link URLClassLoader} でクラスを隔離ロードし、リフレクションで {@code main} を呼び、
 * 出力捕捉（{@link BoundedCapture}）と JVM グローバル状態の差し替え（{@link StandardStreamsGuard}）を
 * 用いて実行時間・標準出力・標準エラーを収集します。
 * </p>
 */
final class ProgramRunner {
	private static final long NANOS_PER_MILLI = 1_000_000L;
	private static final int DEFAULT_CAPTURE_LIMIT_BYTES = 2 << 20;
	/**
	 * 出力バッファの環境変数名
	 */
	private static final String CAPTURE_LIMIT_ENV = "LOCAL_RUNNER_CAPTURE_LIMIT_BYTES";
	/**
	 * 標準出力/標準エラーで保持する最大バイト数
	 */
	private static final int MAX_CAPTURE_BYTES = resolveCaptureLimitBytes();

	/**
	 * JVM 全体の累積アロケーション量を測る MXBean（HotSpot 拡張）。計測不可なら null（改善2）。
	 */
	private static final ThreadMXBean THREAD_MX = resolveThreadMx();
	/**
	 * 提出コードを実行する専用スレッドのスタックサイズ（バイト）。既定 256 MiB。
	 * 競プロで多い深い再帰が、ユーザーが大スタックスレッドのイディオムを書かなくても通るようにする。
	 * {@code LOCAL_RUNNER_RUN_STACK_BYTES} で上書き可能。
	 */
	private static final long RUN_THREAD_STACK_BYTES = resolveRunThreadStackBytes();
	/**
	 * 共通プールの処理が終わるのを待つ上限（ミリ秒）。ワーカーがアイドルへ戻るまでの僅かな間を吸収する。
	 */
	private static final long QUIESCENCE_WAIT_MILLIS = 100L;

	private static ThreadMXBean resolveThreadMx() {
		final java.lang.management.ThreadMXBean bean = ManagementFactory.getThreadMXBean();
		if (bean instanceof ThreadMXBean sun && sun.isThreadAllocatedMemorySupported()) {
			sun.setThreadAllocatedMemoryEnabled(true);
			return sun;
		}
		return null;
	}

	/**
	 * 大スタックのスレッドへ処理を移すイディオムがあるので、実行スレッドだけでなく全スレッドの合計を測る。
	 * 実行中は他の要求を処理しないため、差分はほぼ提出コードの分になる。
	 */
	private static long totalAllocatedBytes() {
		return THREAD_MX != null ? THREAD_MX.getTotalThreadAllocatedBytes() : -1L;
	}

	private static long resolveRunThreadStackBytes() {
		final long defaultBytes = 256L * 1024 * 1024;
		final String raw = System.getenv("LOCAL_RUNNER_RUN_STACK_BYTES");
		if (raw == null || raw.isBlank()) return defaultBytes;
		try {
			final long parsed = Long.parseLong(raw.trim());
			return parsed > 0 ? parsed : defaultBytes;
		} catch (final NumberFormatException ignored) {
			return defaultBytes;
		}
	}

	/**
	 * 提出コードが作ったスレッドを返す。スレッドは親のグループを継承するので、実行ごとのグループで見分けられる。
	 */
	private static Thread[] liveThreads(final ThreadGroup group) {
		final Thread[] threads = new Thread[group.activeCount() + 16];
		return Arrays.copyOf(threads, group.enumerate(threads));
	}

	/**
	 * JVM は非デーモンスレッドがすべて終わるまで終了しないので、提出先と同じく main の後もそれらの終了を待つ。
	 * 終わらないスレッドは提出先でも TLE になる。ここでも TS 側のタイムアウトで打ち切られる。
	 */
	private static void awaitNonDaemonThreads(final ThreadGroup group) throws InterruptedException {
		boolean waited;
		do {
			waited = false;
			for (final Thread thread : liveThreads(group)) {
				if (thread.isDaemon()) continue;
				thread.join();
				waited = true;
			}
		} while (waited);
	}

	/**
	 * 実行後も動き続けるスレッドがあれば true。提出先では JVM の終了とともに消えるが、常駐 JVM には生き残る。
	 * 共通プールのワーカーは専用のグループに属し、アイドルのまま残るのが正常なので、処理の有無で判断する。
	 */
	private static boolean hasLeftoverThreads(final ThreadGroup group) {
		return liveThreads(group).length > 0 || !ForkJoinPool.commonPool().awaitQuiescence(QUIESCENCE_WAIT_MILLIS, TimeUnit.MILLISECONDS);
	}

	/**
	 * 出力保持上限を決定します。
	 *
	 * @return 上限バイト数
	 */
	private static int resolveCaptureLimitBytes() {
		final String raw = System.getenv(CAPTURE_LIMIT_ENV);
		if (raw == null || raw.isBlank()) return DEFAULT_CAPTURE_LIMIT_BYTES;
		try {
			final int parsed = Integer.parseInt(raw.trim());
			if (parsed <= 0) return DEFAULT_CAPTURE_LIMIT_BYTES;
			return parsed;
		} catch (final NumberFormatException ignored) {
			return DEFAULT_CAPTURE_LIMIT_BYTES;
		}
	}

	/**
	 * 指定クラスの {@code main} メソッドを呼び出します。
	 *
	 * @param classLoader   実行対象のクラスローダー
	 * @param mainClassName 実行対象クラス名
	 * @throws ReflectiveOperationException リフレクションに失敗した場合
	 */
	private static void invokeMain(final URLClassLoader classLoader, final String mainClassName) throws ReflectiveOperationException {
		final Class<?> mainClass = Class.forName(mainClassName, true, classLoader);
		final Method mainMethod = mainClass.getMethod("main", String[].class);
		final int modifiers = mainMethod.getModifiers();
		if (!Modifier.isPublic(modifiers) || !Modifier.isStatic(modifiers)) {
			throw new NoSuchMethodException(mainClassName + ".main(String[]) must be public static.");
		}
		mainMethod.invoke(null, (Object) new String[0]);
	}

	/**
	 * 例外から実行対象クラスおよびその内部クラスに関連するスタックトレースのみを抽出します。
	 *
	 * @param throwable     例外
	 * @param mainClassName 実行対象クラス名
	 * @return 抽出済みスタックトレース
	 */
	private static String filterMainStackTrace(final Throwable throwable, final String mainClassName) {
		Throwable cause = throwable instanceof InvocationTargetException targetException ? targetException.getTargetException() : throwable;

		StringBuilder sb = new StringBuilder();
		sb.append(cause.toString()).append("\n");
		for (StackTraceElement element : cause.getStackTrace()) {
			String className = element.getClassName();
			if (className.equals(mainClassName) || className.startsWith(mainClassName + "$"))
				sb.append("\tat ").append(element).append("\n");
		}
		return sb.toString();
	}

	/**
	 * 指定クラスを実行します。
	 *
	 * @param classDirectory クラスファイルを含むディレクトリ
	 * @param mainClassName  実行対象クラス名
	 * @param standardInput  標準入力の内容
	 * @return 実行結果
	 */
	ExecutionResult run(final Path classDirectory, final String mainClassName, final byte[] standardInput) {
		final AtomicReference<Throwable> uncaughtError = new AtomicReference<>();
		final BoundedCapture stdoutBuffer = new BoundedCapture(MAX_CAPTURE_BYTES);
		final BoundedCapture stderrBuffer = new BoundedCapture(MAX_CAPTURE_BYTES);
		final PrintStream redirectedOut = new PrintStream(stdoutBuffer, true, StandardCharsets.UTF_8);
		final PrintStream redirectedErr = new PrintStream(stderrBuffer, true, StandardCharsets.UTF_8);

		final ThreadGroup runGroup = new ThreadGroup("atcoder-run");
		// アロケーション量は実行スレッドの開始直後と全スレッドの終了後の差分で測る（従来は main スレッドで測っていたため
		// プロトコル処理分が混ざっていた）。[0]=開始前 / [1]=終了後、計測不可なら -1。
		final long[] allocSnapshot = {-1L, -1L};
		boolean leftoverThreads = false;

		final long startTime = System.nanoTime();
		long endTime = -1L;
		try (StandardStreamsGuard guard = new StandardStreamsGuard(standardInput, redirectedOut, redirectedErr, uncaughtError); URLClassLoader classLoader = new URLClassLoader(new URL[]{classDirectory.toUri().toURL()}, ClassLoader.getSystemClassLoader())) {
			guard.setContextClassLoader(classLoader);
			final Runnable body = () -> {
				allocSnapshot[0] = totalAllocatedBytes();
				try {
					invokeMain(classLoader, mainClassName);
				} catch (final Throwable throwable) {
					uncaughtError.compareAndSet(null, throwable);
				}
			};
			// 大きめのスタックを持つ専用スレッドで実行する。これにより
			// (1) 競プロで多い深い再帰が StackOverflow になりにくく（大スタックスレッドのイディオム不要）、
			// (2) StackOverflow がディスパッチャ本体スレッドではなく実行スレッド側に閉じる。
			// 提出コードのスレッドはこのスレッドの属性を継承するので、通常の main と同じ非デーモンにする。
			final Thread runThread = new Thread(runGroup, body, "atcoder-run", RUN_THREAD_STACK_BYTES);
			runThread.setContextClassLoader(classLoader);
			runThread.start();
			runThread.join();
			awaitNonDaemonThreads(runGroup);
			endTime = System.nanoTime();
			allocSnapshot[1] = totalAllocatedBytes();
			// 残ったスレッドが復元後の標準入出力（＝プロトコル経路）に触れないよう、差し替えたままにする。
			// この JVM は結果を返した直後に終了する（Dispatcher が halt）。
			leftoverThreads = hasLeftoverThreads(runGroup);
			if (leftoverThreads) guard.keepStreamsRedirected();
		} catch (final Throwable throwable) {
			uncaughtError.compareAndSet(null, throwable);
		}
		final long timeMillis = ((endTime >= 0 ? endTime : System.nanoTime()) - startTime) / NANOS_PER_MILLI;
		final long allocBefore = allocSnapshot[0];
		final long allocAfter = allocSnapshot[1];
		final long memoryBytes = (allocBefore >= 0 && allocAfter >= 0) ? Math.max(0L, allocAfter - allocBefore) : -1L;

		int exitCode = 0;
		final Throwable error = uncaughtError.get();
		if (error != null) {
			exitCode = 1;
			redirectedErr.print(filterMainStackTrace(error, mainClassName));
		}
		redirectedOut.flush();
		redirectedErr.flush();

		return new ExecutionResult(exitCode, timeMillis, stdoutBuffer.toByteArray(), stderrBuffer.toByteArray(), stdoutBuffer.isTruncated(), stderrBuffer.isTruncated(), memoryBytes, leftoverThreads);
	}
}
