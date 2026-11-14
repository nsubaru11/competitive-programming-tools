import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
	findLibrarySource,
	isHeaderName,
	isLibrarySourceEntry,
	loadSettings,
	readUserSettings,
	resolveSettingPath,
	type Settings,
	SettingsError,
	type UserSettings,
	writeUserSettings,
} from "./settings/settings";

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
		if (fs.existsSync(path.join(candidate, "local-runner", "settings.schema.json"))) {
			return candidate;
		}
	}
	return importMetaRoot;
}

export const PROJECT_ROOT = resolveProjectRoot();

// 利用者の設定を置くファイル。Windows の CLI と WSL のサーバーの両方から読めるよう、リポジトリの中に置く。
// 場所だけは設定ファイルに書けないので、テストなどで変えるときは環境変数で指定する。
export const SETTINGS_FILE = process.env.LOCAL_RUNNER_SETTINGS_FILE || path.join(PROJECT_ROOT, "local-runner.settings.json");
const SETTINGS_SCHEMA_FILE = path.join(PROJECT_ROOT, "local-runner", "settings.schema.json");

/** 設定を読む。内容が正しくなければ、理由を表示して終了する。 */
function loadSettingsOrExit(): Settings {
	try {
		return loadSettings(SETTINGS_FILE);
	} catch (error) {
		if (!(error instanceof SettingsError)) throw error;
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
}

/** 起動したときの設定。サーバーが使う値は、起動し直すまで変わらない。 */
export const SETTINGS = loadSettingsOrExit();

/** 設定に書かれたパスを、このプロセスが動いている OS のパスにする。 */
export function resolveConfiguredPath(value: string): string {
	return resolveSettingPath(value, SETTINGS_FILE);
}

/** 設定ファイルの項目を書き換える。エディターの補完に使うスキーマの場所が無ければ足す。 */
export function updateUserSettings(mutate: (user: UserSettings) => void): void {
	const {$schema, ...user} = readUserSettings(SETTINGS_FILE);
	mutate(user);
	const relative = path.relative(path.dirname(SETTINGS_FILE), SETTINGS_SCHEMA_FILE).replaceAll("\\", "/");
	const schemaReference = $schema ?? (relative.startsWith(".") ? relative : `./${relative}`);
	writeUserSettings(SETTINGS_FILE, {$schema: schemaReference, ...user});
}

// 提出先の Java バージョン。これより新しい JDK では javac の --release で揃える。
export const TARGET_JAVA_VERSION = String(SETTINGS.languages.java.release);

let preparedLibrarySourceRoot: string | null = null;
let librarySource: string | null = null;

/** 設定された Java のライブラリの場所。setlib の直後にも正しく表示できるよう、ファイルを読み直す。 */
export function configuredLibrarySourceRoot(): string | null {
	return loadSettings(SETTINGS_FILE).languages.java.library ?? null;
}

/** 設定されたライブラリのフォルダ。設定が無いか、フォルダが見つからなければ null。 */
function findLibrarySourceRoot(): string | null {
	const configured = SETTINGS.languages.java.library;
	if (!configured) return null;
	return findLibrarySource(resolveConfiguredPath(configured));
}

export function resolveLibrarySourceRoot(): string {
	return preparedLibrarySourceRoot ?? prepareLibrarySourceRoot().prepared;
}

/** サーバーが読み込んだライブラリの場所。ライブラリなしで起動したら null。 */
export function loadedLibrarySource(): string | null {
	return librarySource;
}

/**
 * 設定の headers に書かれたヘッダーファイルを返す。設定が無ければ null。
 * name は HTTP で受け取る値なので、設定済みの名前だけを引き、パスとしては扱わない。
 * 再起動なしで反映できるよう、ファイルを読み直す。
 */
export function resolveSubmissionHeaderFile(name: string): string | null {
	if (!isHeaderName(name)) throw new Error(`Invalid header name: "${name}"`);
	const headers = loadSettings(SETTINGS_FILE).headers;
	return Object.hasOwn(headers, name) ? resolveConfiguredPath(headers[name]!) : null;
}

export const CLI_CONFIG = {
	defaultLocalRunnerUrl: `http://localhost:${SETTINGS.server.port}`,
	submissionPollIntervalMs: 1000,
	// 提出→確定まで（混雑時は数分かかることがある）。
	submissionPollTimeoutMs: SETTINGS.atcoder.resultWaitMs,
	submissionIdDetectTimeoutMs: 45000,
	submissionIdDetectIntervalMs: 800,
	submitPostRetryMax: 5,
	submitPostRetryBaseMs: 1200,
	defaultLanguageId: "6056",
	userAgent: "AtCoder-JavaCodeSubmitter-CLI/1.0",
	// サンプルキャッシュ: パース済みサンプルを ~/.atcoder/cache/samples/<task>.json に保存する。
	// サンプルは確定後不変なので TTL なし。
	sampleCacheEnabled: SETTINGS.atcoder.sampleCache,
	sampleCacheDirRelative: path.join(".atcoder", "cache", "samples"),
	// 上限超過時は古いものから削除（1件あたり概ね数KB なので 2000 件 ≒ 最大十数MB 程度）。
	sampleCacheMaxEntries: 2000,
};

const MEBIBYTE = 1024 * 1024;

// コンパイル結果を置く場所。Linux ではメモリ上の /dev/shm を使い、NTFS をまたぐ負荷を避ける。
const runnerBaseDir = process.platform === "linux"
	? "/dev/shm/atcoder-local-runner"
	: path.join(os.tmpdir(), "atcoder-local-runner");

export function resolveDispatcherSourceFile() {
	const sourceFile = path.join(PROJECT_ROOT, "local-runner", "java", "src", "Dispatcher.java");
	if (!fs.existsSync(sourceFile)) throw new Error(`Dispatcher source not found: ${sourceFile}`);
	return sourceFile;
}

export const RUNNER_CONFIG = {
	// ループバックだけで待ち受け、同じネットワークの端末からコードを実行できないようにする。
	host: "127.0.0.1",
	port: SETTINGS.server.port,
	maxBodySize: 4 * MEBIBYTE,
	maxLogFileSize: 8 * MEBIBYTE,
	maxCacheSize: 10,
	compileTimeoutMs: SETTINGS.run.compileTimeoutMs,
	runTimeoutMs: SETTINGS.run.timeoutMs,
	runStackBytes: SETTINGS.languages.java.stackMb * MEBIBYTE,
	dispatcherStartupTimeoutMs: 10000,
	outputLimitBytes: SETTINGS.run.outputLimitMb * MEBIBYTE,
	baseDir: runnerBaseDir,
	compileRootDir: path.join(runnerBaseDir, "compiled"),
	dispatcherBuildDir: path.join(runnerBaseDir, "dispatcher"),
	warmUpSourceFile: path.join(PROJECT_ROOT, "local-runner", "java", "src", "WarmUp.java"),
	dispatcherJarFile: path.join(runnerBaseDir, "dispatcher", "dispatcher.jar"),
	warmUpSourceClassName: "WarmUp",
	warmUpStdin: "",
	warmUpRepeatCount: 2,
	warmUpRunTimeoutMs: 30000,
	// コマンドで動かす言語の作業フォルダと、解答のプロセスを起動して計測するプログラム。
	programRootDir: path.join(runnerBaseDir, "programs"),
	launcherSourceFile: path.join(PROJECT_ROOT, "local-runner", "native", "launcher.c"),
	launcherFile: path.join(runnerBaseDir, "launcher"),
	// header unit は作るのに数秒かかるので、stop で消える baseDir ではなくホームに置く。
	headerUnitCacheDir: path.join(os.homedir(), ".cache", "competitive-programming", "local-runner", "header-units"),
};

/** ライブラリの .java だけを、フォルダの構成を保って写す。 */
function copyLibrarySources(source: string, target: string): void {
	fs.mkdirSync(target, {recursive: true});
	for (const entry of fs.readdirSync(source, {withFileTypes: true})) {
		if (!isLibrarySourceEntry(entry)) continue;
		const from = path.join(source, entry.name);
		const to = path.join(target, entry.name);
		if (entry.isDirectory()) copyLibrarySources(from, to);
		else fs.copyFileSync(from, to);
	}
}

/**
 * ライブラリを作業用のフォルダへ写し、変換にはその写しを使う。
 * コンパイルした結果を利用者のフォルダに作らないためで、Linux ではメモリ上に置いて速くする意味もある。
 * ライブラリが無くても空のフォルダを渡し、解答の変換と実行を同じ経路で行う。
 */
export function prepareLibrarySourceRoot(): {source: string | null; prepared: string} {
	const source = findLibrarySourceRoot();
	librarySource = source;
	const prepared = path.join(RUNNER_CONFIG.baseDir, "library-source");
	fs.rmSync(prepared, {recursive: true, force: true});
	fs.mkdirSync(prepared, {recursive: true});
	if (source !== null) copyLibrarySources(source, prepared);
	preparedLibrarySourceRoot = prepared;
	return {source, prepared};
}

export const LOG_FILE_PATH = path.join(RUNNER_CONFIG.baseDir, "local-runner.log");
export const DISPATCHER_CLASS_FILE = path.join(RUNNER_CONFIG.dispatcherBuildDir, "Dispatcher.class");
