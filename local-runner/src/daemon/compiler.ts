import {spawnSync} from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {LocalRunnerRunResponse} from "@atcoder-tools/shared";
import type {CompileEntry} from "../types";
import * as config from "../config";
import {EMBEDDED_FILES, extractEmbeddedFile} from "./embedded";
import * as formatter from "../utils/formatter";
import * as logging from "../utils/logging";
import * as filesystem from "../utils/filesystem";
import {isPathLike} from "../settings/settings";
import * as dispatcher from "./dispatcher";
import {runCommand} from "./processRunner";

// 設定の languages.java.command がパスなら、同じフォルダの javac を使う。命令の名前なら、どちらも PATH から探す。
const JAVA_COMMAND = config.SETTINGS.languages.java.command;
const JAVA_BIN_DIR = isPathLike(JAVA_COMMAND) ? path.dirname(config.resolveConfiguredPath(JAVA_COMMAND)) : null;

export const JAVA_PATH = JAVA_BIN_DIR === null ? JAVA_COMMAND : config.resolveConfiguredPath(JAVA_COMMAND);
export const JAVAC_PATH = JAVA_BIN_DIR === null ? "javac" : path.join(JAVA_BIN_DIR, "javac");
export const JAVA_ENV: NodeJS.ProcessEnv = JAVA_BIN_DIR === null
	? process.env
	: {...process.env, PATH: JAVA_BIN_DIR + path.delimiter + process.env.PATH};

/**
 * Dispatcher ソースディレクトリ配下の *.java をすべて列挙する。
 * Dispatcher は複数ファイル（Request/Response/ProtocolCodec/MessageChannel/Executor 等）で構成されるため、
 * 単一ファイルではなくディレクトリ全体をコンパイル対象・鮮度判定対象とする。
 */
function listDispatcherSources(): string[] {
	const sourceDir = path.dirname(config.resolveDispatcherSourceFile());
	return fs
		.readdirSync(sourceDir)
		.filter((name) => name.endsWith(".java") && name !== "WarmUp.java")
		.map((name) => path.join(sourceDir, name));
}

/** 与えたソース群の最新 mtime（ミリ秒）を返す。 */
function newestSourceMtime(sources: string[]): number {
	return sources.reduce((max, file) => Math.max(max, fs.statSync(file).mtimeMs), 0);
}

const compileCache = new Map<string, Promise<CompileEntry>>();

export function warmUpJavaTools() {
	logging.logInfo("Warm up javac/java...");
	spawnSync(JAVA_PATH, ["-version"], {env: JAVA_ENV, stdio: "ignore"});
	spawnSync(JAVAC_PATH, ["-version"], {env: JAVA_ENV, stdio: "ignore"});
}

export function getJavaVersion() {
	try {
		const result = spawnSync(JAVA_PATH, ["-version"], {
			env: JAVA_ENV,
			encoding: "utf8",
		});
		const output = result.stderr || result.stdout || "";
		const match = output.match(/version "([^"]+)"/);
		if (!match) {
			return "Unknown";
		}
		const rawVersion = match[1];
		if (rawVersion.startsWith("1.")) {
			const legacyMatch = rawVersion.match(/^1\.(\d+)/);
			return legacyMatch ? legacyMatch[1] : rawVersion;
		}
		const modernMatch = rawVersion.match(/^(\d+)/);
		return modernMatch ? modernMatch[1] : rawVersion;
	} catch {
		return "Unknown";
	}
}

export const JAVA_VERSION = getJavaVersion();
/** JDK が提出先より新しいときに javac の --release へ渡す値。それ以外は空文字列。 */
export const JAVAC_RELEASE = Number(JAVA_VERSION) > Number(config.TARGET_JAVA_VERSION) ? config.TARGET_JAVA_VERSION : "";
export const RUNNER_LABEL = process.platform === "linux"
	? `Java ${JAVA_VERSION} (WSL Daemon Local)`
	: `Java ${JAVA_VERSION} (Daemon Local)`;

function hashCode(sourceCode: string) {
	const digest = crypto.createHash("md5").update(`java=${JAVA_VERSION}\nencoding=UTF-8\n${sourceCode}`).digest("hex");
	return `${sourceCode.length.toString(16)}-${digest}`;
}

export function getProgramId(sourceCode: string) {
	return hashCode(sourceCode);
}

function cleanupOldCache() {
	if (compileCache.size <= config.RUNNER_CONFIG.maxCacheSize) {
		return;
	}
	const oldestHash = compileCache.keys().next().value;
	if (!oldestHash) return;
	const oldestEntryPromise = compileCache.get(oldestHash);
	compileCache.delete(oldestHash);
	if (!oldestEntryPromise) {
		return;
	}
	oldestEntryPromise.then((entry) => {
		if (entry && entry.rootDir) {
			filesystem.removeDirectory(entry.rootDir);
		}
		return null;
	});
}

/** 常駐 JVM のクラスパスを返す。配布用の実行ファイルでは埋め込んだ jar を、ソースから動かすときはコンパイルしたクラスを使う。 */
export async function prepareDispatcherClasspath(): Promise<string> {
	const jar = await extractEmbeddedFile(EMBEDDED_FILES.dispatcherJar, config.RUNNER_CONFIG.dispatcherJarFile);
	if (jar !== null) return jar;
	await compileDispatcher();
	return config.RUNNER_CONFIG.dispatcherBuildDir;
}

async function compileDispatcher() {
	filesystem.ensureDirectory(config.RUNNER_CONFIG.dispatcherBuildDir);
	const sources = listDispatcherSources();
	// ソース未変更ならキャッシュ済み Dispatcher.class を再利用し、毎起動の javac を省く。
	// （複数ファイル構成なので src 配下 *.java の最新 mtime で判定する。
	//   TLE で dispatcher が SIGKILL→再起動する際の回復も速くなる）
	try {
		if (fs.existsSync(config.DISPATCHER_CLASS_FILE)) {
			const sourceMtime = newestSourceMtime(sources);
			const classMtime = fs.statSync(config.DISPATCHER_CLASS_FILE).mtimeMs;
			if (classMtime >= sourceMtime) {
				return;
			}
		}
	} catch {
		// stat 失敗時は通常コンパイルにフォールバック
	}
	const result = await runCommand(
		[JAVAC_PATH, "-encoding", "UTF-8", "-g", "-d", config.RUNNER_CONFIG.dispatcherBuildDir, ...sources],
		{env: JAVA_ENV, timeoutMs: config.RUNNER_CONFIG.compileTimeoutMs, outputLimitBytes: config.RUNNER_CONFIG.outputLimitBytes},
	);
	if (result.exitCode !== 0 || result.timedOut || !fs.existsSync(config.DISPATCHER_CLASS_FILE)) {
		throw new Error(result.stderr || "Failed to compile Dispatcher.java.");
	}
}

// マーカー欠落時とコンパイル失敗時のフォールバック検出（ソース正規表現）。
// コンパイルに成功したときは Java 側のバイトコード検査（COMPILED.requiresIsolation）を使う。
// バイトコード検査(IsolationAnalyzer.DANGEROUS_MEMBERS)と検出範囲を揃えるため、
// System.setOut/setErr/setIn・setProperty 系・Locale/TimeZone.setDefault・
// addShutdownHook/removeShutdownHook・Runtime.exec・ProcessBuilder も対象に含める。
// 正規表現なのでコメント/文字列に一致して過検出しうるが、その場合は隔離（安全側）へ倒れるだけで問題ない。
const ISOLATION_SOURCE_PATTERNS: readonly RegExp[] = [
	/\bSystem\s*\.\s*exit\s*\(/,
	/\bSystem\s*\.\s*(?:setOut|setErr|setIn)\s*\(/,
	/\bSystem\s*\.\s*(?:setProperty|setProperties|clearProperty|setSecurityManager)\s*\(/,
	/\bRuntime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*(?:exit|halt|addShutdownHook|removeShutdownHook|exec)\s*\(/,
	/\bnew\s+ProcessBuilder\b/,
	/\bFileDescriptor\s*\.\s*(?:in|out|err)\b/,
	/\bLocale\s*\.\s*setDefault\s*\(/,
	/\bTimeZone\s*\.\s*setDefault\s*\(/,
];

function requiresIsolatedProcess(sourceCode: string) {
	return ISOLATION_SOURCE_PATTERNS.some((pattern) => pattern.test(sourceCode));
}

function isolationMarkerPath(rootDir: string) {
	return path.join(rootDir, ".isolation");
}

// バイトコード検査の結果をディスクに残し、再起動後のキャッシュヒットでも一貫して使えるようにする。
function writeIsolationMarker(rootDir: string, requiresIsolation: boolean) {
	try {
		fs.writeFileSync(isolationMarkerPath(rootDir), requiresIsolation ? "1" : "0", "utf8");
	} catch {
	}
}

function readIsolationMarker(rootDir: string, sourceCode: string): boolean {
	try {
		const raw = fs.readFileSync(isolationMarkerPath(rootDir), "utf8").trim();
		if (raw === "1") return true;
		if (raw === "0") return false;
	} catch {
	}
	return requiresIsolatedProcess(sourceCode);
}

async function compileSource(sourceCode: string, hash: string): Promise<CompileEntry> {
	filesystem.ensureDirectory(config.RUNNER_CONFIG.compileRootDir);
	const rootDir = path.join(config.RUNNER_CONFIG.compileRootDir, hash);
	const classDir = path.join(rootDir, "classes");
	const sourceFile = path.join(rootDir, "Main.java");
	const classFile = path.join(classDir, "Main.class");

	if (fs.existsSync(sourceFile) && fs.existsSync(classFile)) {
		const existingSource = fs.readFileSync(sourceFile, "utf8");
		if (existingSource === sourceCode) {
			logging.logInfo(formatter.formatCompileSummary("java", "CACHED", hash));
			return {
				rootDir,
				classDir,
				mainClass: "Main",
				requiresIsolatedProcess: readIsolationMarker(rootDir, sourceCode),
				status: "compiled",
				error: null,
			};
		}
	}

	filesystem.removeDirectory(rootDir);
	filesystem.ensureDirectory(classDir);
	fs.writeFileSync(sourceFile, sourceCode, "utf8");

	// 常駐 Dispatcher 内の javac でコンパイルし、外部 javac の JVM 起動コストを回避する。
	const compileStart = Date.now();
	const compileResult = await dispatcher.queueDispatcherCompile(sourceFile, classDir);
	const timedOut = !!compileResult.timedOut;
	const compiled = compileResult.exitCode === 0 && fs.existsSync(classFile);
	const errorText = compileResult.diagnostics;
	const requiresIsolation = !!compileResult.requiresIsolation;
	const compileTime = Date.now() - compileStart;

	if (compiled) {
		logging.logInfo(formatter.formatCompileSummary("java", "OK", hash, compileTime));
		writeIsolationMarker(rootDir, requiresIsolation);
		return {
			rootDir,
			classDir,
			mainClass: "Main",
			requiresIsolatedProcess: requiresIsolation,
			status: "compiled",
			error: null,
		};
	}

	logging.logWarn(formatter.formatCompileSummary("java", "NG", hash, compileTime));
	return {
		rootDir,
		classDir,
		mainClass: "Main",
		requiresIsolatedProcess: requiresIsolatedProcess(sourceCode),
		status: "error",
		error: timedOut
			? `Compilation timed out after ${config.RUNNER_CONFIG.compileTimeoutMs}ms.\n${errorText}`.trim()
			: (errorText || "Compilation failed."),
	};
}

/** コンパイルキャッシュの現在のエントリ数（status 表示用）。 */
export function getCompileCacheSize() {
	return compileCache.size;
}

export function getCompiledEntry(sourceCode: string) {
	const hash = hashCode(sourceCode);
	if (compileCache.has(hash)) {
		logging.logInfo(formatter.formatCompileSummary("java", "CACHED", hash));
		return compileCache.get(hash)!;
	}
	const entryPromise = compileSource(sourceCode, hash);
	compileCache.set(hash, entryPromise);
	cleanupOldCache();
	return entryPromise;
}

/** programId だけの run 用。メモリキャッシュ、次にディスクキャッシュから解決する。 */
export async function getCompiledEntryByProgramId(programId: string): Promise<CompileEntry | null> {
	const cached = compileCache.get(programId);
	if (cached) return await cached;
	if (!/^[0-9a-f]+-[0-9a-f]{32}$/.test(programId)) return null;

	const sourceFile = path.join(config.RUNNER_CONFIG.compileRootDir, programId, "Main.java");
	try {
		const sourceCode = fs.readFileSync(sourceFile, "utf8");
		if (hashCode(sourceCode) !== programId) return null;
		return await getCompiledEntry(sourceCode);
	} catch {
		return null;
	}
}

export async function runCodeInIsolatedJvm(entry: CompileEntry, standardInput: string): Promise<LocalRunnerRunResponse> {
	const result = await runCommand(
		// 常駐 JVM と同じスタックと最適化で動かし、実行経路によって結果が変わらないようにする。
		[JAVA_PATH, `-Xss${config.RUNNER_CONFIG.runStackBytes}`, "-cp", entry.classDir, entry.mainClass],
		{
			cwd: entry.rootDir,
			env: JAVA_ENV,
			stdin: standardInput,
			timeoutMs: config.RUNNER_CONFIG.runTimeoutMs,
			outputLimitBytes: config.RUNNER_CONFIG.outputLimitBytes,
		},
	);
	return {
		status: result.timedOut ? "timeLimitExceeded" : (result.exitCode === 0 ? "success" : "runtimeError"),
		exitCode: result.timedOut ? 124 : result.exitCode,
		stdout: result.stdout,
		stderr: result.timedOut ? (`Execution timed out after ${config.RUNNER_CONFIG.runTimeoutMs}ms.\n${result.stderr}`).trim() : result.stderr,
		time: result.timedOut ? config.RUNNER_CONFIG.runTimeoutMs : result.timeMs,
		stdoutTruncated: result.stdoutTruncated,
		stderrTruncated: result.stderrTruncated,
		memory: 0,
	};
}
