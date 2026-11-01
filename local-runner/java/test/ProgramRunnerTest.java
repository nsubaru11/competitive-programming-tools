import java.io.*;
import java.nio.charset.*;
import java.nio.file.*;

public final class ProgramRunnerTest {
	private static final PrintStream ORIGINAL_OUT = System.out;
	private static final PrintStream ORIGINAL_ERR = System.err;
	private static final InputStream ORIGINAL_IN = System.in;

	public static void main(final String[] args) throws Exception {
		final Path root = Files.createTempDirectory("program-runner-test-");
		try {
			final ExecutionResult unjoined = run(root, "unjoined", """
					public class Main {
						public static void main(String[] args) {
							new Thread(null, () -> {
								try { Thread.sleep(200); } catch (InterruptedException e) {}
								System.out.println("answer");
							}, "worker", 1L << 26).start();
						}
					}
					""");
			check(text(unjoined.stdout()).trim().equals("answer"), "output of an unjoined thread was lost: " + text(unjoined.stdout()));
			check(unjoined.timeMillis() >= 200, "time ignored the unjoined thread: " + unjoined.timeMillis());
			check(!unjoined.leftoverThreads(), "finished thread was reported as leftover");

			final ExecutionResult stdin = run(root, "stdin", """
					import java.util.Scanner;
					public class Main {
						public static void main(String[] args) {
							new Thread(() -> System.out.println(new Scanner(System.in).nextInt() + 1)).start();
						}
					}
					""", "41\n");
			check(text(stdin.stdout()).trim().equals("42"), "unjoined thread could not read stdin: " + text(stdin.stdout()));

			final ExecutionResult failed = run(root, "failed", """
					public class Main {
						public static void main(String[] args) {
							new Thread(() -> { throw new IllegalStateException("boom"); }).start();
						}
					}
					""");
			check(failed.exitCode() == 1, "exception in an unjoined thread was lost");

			final ExecutionResult allocated = run(root, "allocated", """
					public class Main {
						public static void main(String[] args) {
							new Thread(() -> System.out.println(new byte[10_000_000].length)).start();
						}
					}
					""");
			check(allocated.memoryBytes() >= 10_000_000L, "allocation of an unjoined thread was not measured: " + allocated.memoryBytes());

			final ExecutionResult daemon = run(root, "daemon", """
					public class Main {
						public static void main(String[] args) {
							Thread thread = new Thread(() -> {
								try { Thread.sleep(2000); } catch (InterruptedException e) {}
							});
							thread.setDaemon(true);
							thread.start();
							System.out.println("done");
						}
					}
					""");
			check(text(daemon.stdout()).trim().equals("done"), "daemon thread changed the output");
			check(daemon.leftoverThreads(), "running daemon thread was not reported");
			check(System.out != ORIGINAL_OUT, "streams were restored while a thread was left over");
			restoreStreams();

			final String parallel = """
					import java.util.stream.IntStream;
					public class Main {
						public static void main(String[] args) {
							System.out.println(IntStream.range(0, 1_000_000).parallel().asLongStream().sum());
						}
					}
					""";
			for (int i = 0; i < 3; i++) {
				final ExecutionResult result = run(root, "parallel" + i, parallel);
				check(text(result.stdout()).trim().equals("499999500000"), "parallel stream failed: " + text(result.stdout()));
				check(!result.leftoverThreads(), "idle common pool workers restarted the JVM");
				check(System.out == ORIGINAL_OUT, "streams were not restored");
			}

			final ExecutionResult async = run(root, "async", """
					import java.util.concurrent.CompletableFuture;
					public class Main {
						public static void main(String[] args) {
							CompletableFuture.runAsync(() -> {
								try { Thread.sleep(2000); } catch (InterruptedException e) {}
							});
						}
					}
					""");
			check(async.leftoverThreads(), "running common pool task was not reported");
			restoreStreams();
			ORIGINAL_OUT.println("program runner smoke test: OK");
		} finally {
			restoreStreams();
			try (var files = Files.walk(root)) {
				for (final Path path : files.sorted(java.util.Comparator.reverseOrder()).toList())
					Files.deleteIfExists(path);
			}
		}
	}

	private static ExecutionResult run(final Path root, final String name, final String source) throws IOException {
		return run(root, name, source, "");
	}

	private static ExecutionResult run(final Path root, final String name, final String source, final String input) throws IOException {
		final Path directory = Files.createDirectories(root.resolve(name));
		final Path sourceFile = directory.resolve("Main.java");
		Files.writeString(sourceFile, source, StandardCharsets.UTF_8);
		final Path classes = directory.resolve("classes");
		final CompileResult compiled = new JavaCompilerService().compile(sourceFile, classes);
		check(compiled.exitCode() == 0, compiled.diagnostics());
		return new ProgramRunner().run(classes, "Main", input.getBytes(StandardCharsets.UTF_8));
	}

	private static void restoreStreams() {
		System.setIn(ORIGINAL_IN);
		System.setOut(ORIGINAL_OUT);
		System.setErr(ORIGINAL_ERR);
	}

	private static String text(final byte[] bytes) {
		return new String(bytes, StandardCharsets.UTF_8);
	}

	private static void check(final boolean condition, final String message) {
		if (!condition) throw new AssertionError(message);
	}
}
