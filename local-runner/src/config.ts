import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {isHeaderName, readLocalSettings, toRuntimePath} from "./localSettings";

const importMetaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function resolveProjectRoot() {
	const envRoot = process.env.LOCAL_RUNNER_PROJECT_ROOT;
	// コンパイル済みバイナリでは import.meta.url / argv[0] が bunfs(例: B:\~BUN\...) を指すため、
	// 実ファイル位置は process.execPath を使う。bin/ 配置なら execPath の 2つ上が tools。
	const execDir = process.execPath ? path.dirname(process.execPath) : "";
	const argvDir = process.argv[0] ? path.dirname(process.argv[0]) : "";
	const roots = [execDir, argvDir]
		.filter(Boolean)
		.flatMap((d) => [path.resolve(d, ".."), path.resolve(d, "../..")]);
	const candidates = [envRoot, importMetaRoot, ...roots].filter(Boolean) as string[];
	for (const candidate of candidates) {
		if (fs.existsSync(path.join(candidate, "local-runner", "java", "src", "Dispatcher.java"))) {
			return candidate;
		}
	}
	return importMetaRoot;
}

export const PROJECT_ROOT = resolveProjectRoot();

// 提出先の Java バージョン。これより新しい JDK では javac の --release で揃える。
export const TARGET_JAVA_VERSION = process.env.ATCODER_JAVA_VER || "24";

// setlib の設定を置くファイル。Windows の CLI と WSL のサーバーの両方から読めるよう、リポジトリの中に置く。
export const LOCAL_SETTINGS_FILE = process.env.LOCAL_RUNNER_SETTINGS_FILE || path.join(PROJECT_ROOT, "local-runner.settings.json");

let preparedLibrarySourceRoot: string | null = null;
let librarySource: string | null = null;

/** 設定された Java のライブラリの場所。ATCODER_LIB_SRC があれば setlib の設定より優先する。 */
export function configuredLibrarySourceRoot(): string | null {
	return process.env.ATCODER_LIB_SRC || readLocalSettings(LOCAL_SETTINGS_FILE).librarySourceRoot || null;
}

function findLibrarySourceRoot(): string | null {
	const configured = configuredLibrarySourceRoot();
	if (!configured) return null;
	const runtimePath = toRuntimePath(configured);
	return fs.existsSync(path.join(runtimePath, "lib")) ? path.resolve(runtimePath) : null;
}

export function resolveLibrarySourceRoot(): string {
	return preparedLibrarySourceRoot ?? prepareLibrarySourceRoot().prepared;
}

/** サーバーが読み込んだライブラリの場所。ライブラリなしで起動したら null。 */
export function loadedLibrarySource(): string | null {
	return librarySource;
}

/**
 * setheader で設定したヘッダーファイルを返す。設定が無ければ null。
 * name は HTTP で受け取る値なので、設定済みの名前だけを引き、パスとしては扱わない。
 */
export function resolveSubmissionHeaderFile(name: string): string | null {
	if (!isHeaderName(name)) throw new Error(`Invalid header name: "${name}"`);
	const file = readLocalSettings(LOCAL_SETTINGS_FILE).headerFiles?.[name];
	return typeof file === "string" ? toRuntimePath(file) : null;
}

export const CLI_CONFIG = {
	defaultLocalRunnerUrl: process.env.LOCAL_RUNNER_URL || "http://localhost:8080",
	submissionPollIntervalMs: 1000,
	// 提出→確定まで（混雑時は数分かかることがある）。既定5分、ATCODER_SUBMISSION_POLL_TIMEOUT_MS で上書き可。
	submissionPollTimeoutMs: Number(process.env.ATCODER_SUBMISSION_POLL_TIMEOUT_MS || 300000),
	submissionIdDetectTimeoutMs: 45000,
	submissionIdDetectIntervalMs: 800,
	submitPostRetryMax: Number(process.env.ATCODER_SUBMIT_RETRY_MAX || 5),
	submitPostRetryBaseMs: Number(process.env.ATCODER_SUBMIT_RETRY_BASE_MS || 1200),
	defaultSessionFileRelative: path.join(".atcoder", "session.txt"),
	defaultLanguageId: "6056",
	userAgent: "AtCoder-JavaCodeSubmitter-CLI/1.0",
	// サンプルキャッシュ: パース済みサンプルを ~/.atcoder/cache/samples/<task>.json に保存する。
	// サンプルは確定後不変なので TTL なし。ATCODER_NO_CACHE=1 で無効化。
	sampleCacheDirRelative: path.join(".atcoder", "cache", "samples"),
	// 上限超過時は古いものから削除（1件あたり概ね数KB なので既定 2000 件 ≒ 最大十数MB 程度）。
	sampleCacheMaxEntries: Number(process.env.ATCODER_SAMPLE_CACHE_MAX || 2000),
};

// 提出コードのスタックサイズ。常駐 JVM の ProgramRunner と同じ環境変数と既定値を使う。
const DEFAULT_RUN_STACK_BYTES = 256 * 1024 * 1024;
const MAX_JVM_STACK_BYTES = 1024 * 1024 * 1024;

function resolveRunStackBytes() {
	const parsed = Number(process.env.LOCAL_RUNNER_RUN_STACK_BYTES);
	return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, MAX_JVM_STACK_BYTES) : DEFAULT_RUN_STACK_BYTES;
}

const defaultRunnerBaseDir = process.platform === "linux"
	? "/dev/shm/atcoder-local-runner"
	: path.join(os.tmpdir(), "atcoder-local-runner");

export function resolveDispatcherSourceFile() {
	const envPath = process.env.LOCAL_RUNNER_DISPATCHER_SOURCE;
	const candidates = [
		envPath,
		path.join(PROJECT_ROOT, "local-runner", "java", "src", "Dispatcher.java")
	].filter(Boolean) as string[];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			return candidate;
		}
	}
	throw new Error(`Dispatcher source not found. Tried: ${candidates.join(", ")}`);
}

export const RUNNER_CONFIG = {
	port: Number(process.env.LOCAL_RUNNER_PORT || 8080),
	maxBodySize: 4 * 1024 * 1024,
	maxLogFileSize: Number(process.env.LOCAL_RUNNER_MAX_LOG_FILE_SIZE_BYTES || (8 * 1024 * 1024)),
	maxCacheSize: 10,
	compileTimeoutMs: 30000,
	runTimeoutMs: 10000,
	runStackBytes: resolveRunStackBytes(),
	dispatcherStartupTimeoutMs: 10000,
	dispatcherCaptureLimitBytes: Number(process.env.LOCAL_RUNNER_CAPTURE_LIMIT_BYTES || (2 << 20)),
	baseDir: process.env.LOCAL_RUNNER_BASE_DIR || defaultRunnerBaseDir,
	compileRootDir: path.join(process.env.LOCAL_RUNNER_BASE_DIR || defaultRunnerBaseDir, "compiled"),
	dispatcherBuildDir: path.join(process.env.LOCAL_RUNNER_BASE_DIR || defaultRunnerBaseDir, "dispatcher"),
	warmUpSourceFile: path.join(PROJECT_ROOT, "local-runner", "java", "src", "WarmUp.java"),
	warmUpSourceClassName: "WarmUp",
	warmUpStdin: "",
	warmUpProfile: (process.env.LOCAL_RUNNER_WARMUP_PROFILE || "full").toLowerCase(),
	warmUpRunTimeoutMs: Number(process.env.LOCAL_RUNNER_WARMUP_TIMEOUT_MS || 30000),
};

/** ライブラリが無くても、空の lib を渡して解答の変換と実行を同じ経路で行う。 */
export function prepareLibrarySourceRoot(): {source: string | null; prepared: string} {
	const source = findLibrarySourceRoot();
	librarySource = source;
	if (source !== null && process.platform !== "linux") {
		preparedLibrarySourceRoot = source;
		return {source, prepared: source};
	}
	const prepared = path.join(RUNNER_CONFIG.baseDir, "library-source");
	fs.rmSync(prepared, {recursive: true, force: true});
	fs.mkdirSync(path.join(prepared, "lib"), {recursive: true});
	if (source !== null) fs.cpSync(path.join(source, "lib"), path.join(prepared, "lib"), {
		recursive: true,
		force: true
	});
	preparedLibrarySourceRoot = prepared;
	return {source, prepared};
}

export const LOG_FILE_PATH = path.join(RUNNER_CONFIG.baseDir, "local-runner.log");
export const DISPATCHER_CLASS_FILE = path.join(RUNNER_CONFIG.dispatcherBuildDir, "Dispatcher.class");

export function parseWarmUpRepeatCount(rawValue: string | undefined, fallbackValue: number) {
	if (rawValue == null) {
		return fallbackValue;
	}
	const parsed = Number(rawValue);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return fallbackValue;
	}
	return Math.floor(parsed);
}

export const WARMUP_REPEAT_COUNT = parseWarmUpRepeatCount(
	process.env.LOCAL_RUNNER_WARMUP_REPEAT,
	RUNNER_CONFIG.warmUpProfile === "quick" ? 1 : 2,
);
