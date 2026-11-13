import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type ProcessOutcome = {
	/** シグナルで終わったときは -1。 */
	exitCode: number;
	/** プロセスを終わらせたシグナルの名前(SIGSEGV など)。 */
	signal: string | null;
	timedOut: boolean;
	stdout: string;
	stderr: string;
	stdoutTruncated: boolean;
	stderrTruncated: boolean;
	timeMs: number;
	/** プロセスが同時に使った物理メモリの最大値(KB)。 */
	peakMemoryKb: number;
};

export type ProcessOptions = {
	cwd?: string;
	stdin?: string;
	timeoutMs: number;
	/** 標準出力と標準エラー出力のそれぞれについて、取り込む量の上限。 */
	outputLimitBytes: number;
	/** 中断されたら、プロセスを止めて CanceledError を投げる。 */
	signal?: AbortSignal;
};

/** 処理が中断されたことを表す。新しいソースのコンパイルに切り替えたときに起きる。 */
export class CanceledError extends Error {
	constructor() {
		super("Canceled because a newer source arrived.");
	}
}

export type MeasuredOptions = ProcessOptions & {
	stackBytes: number;
	/** ensureLauncher が返した起動プログラム。無ければ prlimit と Bun の計測で代用する。 */
	launcher: string | null;
	/** 起動プログラムが結果を書くファイル。実行のたびに別の名前にする。 */
	reportFile: string;
};

/** 起動プログラムが自分で止めるのを待つ猶予。これを過ぎたらサーバーが止める。 */
const LAUNCHER_GRACE_MS = 2000;

// 同じ番号に別名があるので(SIGABRT と SIGIOT など)、先に定義された名前を使う。
const SIGNAL_NAMES = new Map<number, string>();
for (const [name, number] of Object.entries(os.constants.signals)) {
	if (!SIGNAL_NAMES.has(number)) SIGNAL_NAMES.set(number, name);
}

/** 上限まで取り込み、残りは読み捨てる。読み続けないと、子プロセスが出力で詰まる。 */
async function collectOutput(stream: ReadableStream<Uint8Array>, limit: number): Promise<{
	text: string;
	truncated: boolean
}> {
	const chunks: Uint8Array[] = [];
	let length = 0;
	let truncated = false;
	const reader = stream.getReader();
	for (; ;) {
		const {done, value} = await reader.read();
		if (done) break;
		const writable = Math.min(value.length, limit - length);
		if (writable > 0) chunks.push(writable === value.length ? value : value.subarray(0, writable));
		length += writable;
		if (writable < value.length) truncated = true;
	}
	return {text: Buffer.concat(chunks).toString("utf8"), truncated};
}

type SpawnResult = Omit<ProcessOutcome, "timedOut"> & {killed: boolean; canceled: boolean};

/** Linux では別のプロセスグループで起動し、g++ が起動した cc1plus なども一緒に止める。 */
const USE_PROCESS_GROUP = process.platform !== "win32";

async function spawnAndCollect(cmd: string[], options: ProcessOptions, killAfterMs: number): Promise<SpawnResult> {
	const started = performance.now();
	const proc = Bun.spawn({
		cmd,
		cwd: options.cwd,
		stdin: options.stdin === undefined ? "ignore" : Buffer.from(options.stdin, "utf8"),
		stdout: "pipe",
		stderr: "pipe",
		detached: USE_PROCESS_GROUP,
	});
	const stop = (): void => {
		try {
			if (USE_PROCESS_GROUP) process.kill(-proc.pid, "SIGKILL");
			else proc.kill("SIGKILL");
		} catch {
			// もう終わっている
		}
	};
	let killed = false;
	let canceled = false;
	const timer = setTimeout(() => {
		killed = true;
		stop();
	}, killAfterMs);
	const cancel = (): void => {
		canceled = true;
		stop();
	};
	if (options.signal?.aborted) cancel();
	options.signal?.addEventListener("abort", cancel, {once: true});
	try {
		const [stdout, stderr] = await Promise.all([
			collectOutput(proc.stdout, options.outputLimitBytes),
			collectOutput(proc.stderr, options.outputLimitBytes),
			proc.exited,
		]);
		return {
			exitCode: proc.exitCode ?? -1,
			signal: proc.signalCode,
			killed,
			canceled,
			stdout: stdout.text,
			stderr: stderr.text,
			stdoutTruncated: stdout.truncated,
			stderrTruncated: stderr.truncated,
			timeMs: Math.round(performance.now() - started),
			peakMemoryKb: Math.round((proc.resourceUsage()?.maxRSS ?? 0) / 1024),
		};
	} finally {
		clearTimeout(timer);
		options.signal?.removeEventListener("abort", cancel);
	}
}

/** コンパイルなどのコマンドを実行する。制限時間を過ぎたら止め、中断されたら CanceledError を投げる。 */
export async function runCommand(cmd: string[], options: ProcessOptions): Promise<ProcessOutcome> {
	const {killed, canceled, ...result} = await spawnAndCollect(cmd, options, options.timeoutMs);
	if (canceled) throw new CanceledError();
	return {...result, timedOut: killed};
}

function readReport(reportFile: string): Map<string, number> | null {
	try {
		const fields = new Map<string, number>();
		for (const line of fs.readFileSync(reportFile, "utf8").split("\n")) {
			const [name, value] = line.split(" ");
			if (name && value !== undefined) fields.set(name, Number(value));
		}
		return fields;
	} catch {
		return null;
	} finally {
		fs.rmSync(reportFile, {force: true});
	}
}

let prlimitAvailable: boolean | null = null;

function hasPrlimit(): boolean {
	prlimitAvailable ??= findOnPath("prlimit") !== null;
	return prlimitAvailable;
}

/** 解答を実行し、時間とメモリを測る。スタックの上限を上げ、制限時間を過ぎたら止める。 */
export async function runMeasured(cmd: string[], options: MeasuredOptions): Promise<ProcessOutcome> {
	if (options.launcher === null) {
		const wrapped = hasPrlimit() ? ["prlimit", `--stack=${options.stackBytes}`, ...cmd] : cmd;
		return runCommand(wrapped, options);
	}
	const launcherCommand = [options.launcher, options.reportFile, String(options.stackBytes), String(options.timeoutMs), ...cmd];
	const {killed, canceled: _canceled, ...result} = await spawnAndCollect(launcherCommand, options, options.timeoutMs + LAUNCHER_GRACE_MS);
	const report = readReport(options.reportFile);
	if (report === null) {
		if (killed) return {...result, exitCode: -1, signal: "SIGKILL", timedOut: true, timeMs: options.timeoutMs};
		throw new Error(`The launcher did not report a result (exit code ${result.exitCode}). ${result.stderr.trim()}`);
	}
	const signalNumber = report.get("signal") ?? 0;
	return {
		...result,
		exitCode: report.get("exit") ?? -1,
		signal: signalNumber > 0 ? SIGNAL_NAMES.get(signalNumber) ?? `signal ${signalNumber}` : null,
		timedOut: report.get("timeout") === 1,
		timeMs: Math.round((report.get("wall_us") ?? 0) / 1000),
		peakMemoryKb: report.get("maxrss_kb") ?? 0,
	};
}

/** PATH から命令を探し、見つかった場所を返す。 */
export function findOnPath(command: string, searchPath = process.env.PATH ?? ""): string | null {
	for (const dir of searchPath.split(path.delimiter)) {
		if (!dir) continue;
		const candidate = path.join(dir, command);
		try {
			fs.accessSync(candidate, fs.constants.X_OK);
			if (fs.statSync(candidate).isFile()) return candidate;
		} catch {
			// 次のフォルダを探す
		}
	}
	return null;
}

/**
 * 起動プログラムを C コンパイラでビルドする。コンパイラが無いかビルドできなければ null を返し、
 * 呼び出し側は Bun の計測で代用する。
 */
export async function ensureLauncher(sourceFile: string, outputFile: string, compilers: readonly string[]): Promise<string | null> {
	for (const compiler of compilers) {
		try {
			const result = await runCommand(
				[compiler, "-x", "c", "-O2", sourceFile, "-o", outputFile],
				{timeoutMs: 30_000, outputLimitBytes: 64 * 1024},
			);
			if (result.exitCode === 0 && fs.existsSync(outputFile)) return outputFile;
		} catch {
			// 次のコンパイラを試す
		}
	}
	return null;
}
