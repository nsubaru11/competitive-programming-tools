import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import schema from "../../settings.schema.json";
import defaults from "./defaults.json";
import {isPlainObject, type SchemaNode, validateAgainstSchema} from "./schema";

/** 常駐する JVM で動かす Java。 */
export type JavaLanguageSettings = {
	family: string;
	name: string;
	match?: string[];
	engine: "jvm";
	bundle: "builtin:java-library";
	command: string;
	release: number;
	library?: string;
	stackMb: number;
};

/** コンパイルと実行をコマンドで行う言語。 */
export type CommandLanguageSettings = {
	enabled?: boolean;
	family: string;
	name: string;
	match?: string[];
	command: string;
	sourceFile: string;
	compile?: string[];
	run: string[];
	debugArgs?: string[];
	debugRewrite?: boolean;
	stackMb?: number;
	setup?: "builtin:gcc-header-unit";
	bundle?: string[];
};

/** 既定値に、利用者の設定ファイルを重ねた結果。 */
export type Settings = {
	server: {
		port: number;
		backend: "wsl" | "native";
		autoStart: boolean;
		startTimeoutMs: number;
		extraOrigins: string[];
	};
	run: {
		timeoutMs: number;
		compileTimeoutMs: number;
		outputLimitMb: number;
	};
	languages: {java: JavaLanguageSettings} & Record<string, JavaLanguageSettings | CommandLanguageSettings>;
	headers: Record<string, string>;
	atcoder: {
		sessionFile: string;
		sampleCache: boolean;
		resultWaitMs: number;
	};
};

/** 利用者の設定ファイルの中身。書かれた項目だけを持つ。 */
export type UserSettings = Record<string, unknown>;

export const DEFAULT_SETTINGS = defaults as Settings;

/** 設定ファイルを読めない、または内容が正しくないことを表す。メッセージはそのまま利用者に見せる。 */
export class SettingsError extends Error {
}

/** ヘッダーの名前は HTTP でも受け取るので、形式を限定する。 */
export function isHeaderName(name: string): boolean {
	return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name);
}

/**
 * 以前の形式(librarySourceRoot と headerFiles)の設定ファイルを、今の形式へ書き換える。
 * 元のファイルは .bak に残す。
 */
function migrateLegacySettings(file: string, user: UserSettings): UserSettings {
	if (!("librarySourceRoot" in user) && !("headerFiles" in user)) return user;
	const {librarySourceRoot, headerFiles, ...migrated} = user;
	if (typeof librarySourceRoot === "string") setSetting(migrated, ["languages", "java", "library"], librarySourceRoot);
	if (isPlainObject(headerFiles)) {
		for (const [name, headerFile] of Object.entries(headerFiles)) setSetting(migrated, ["headers", name], headerFile);
	}
	fs.copyFileSync(file, `${file}.bak`);
	writeUserSettings(file, migrated);
	return migrated;
}

/** 設定ファイルを読む。ファイルが無ければ空にし、JSON として読めないか項目が正しくなければ SettingsError にする。 */
export function readUserSettings(file: string): UserSettings {
	let text: string;
	try {
		text = fs.readFileSync(file, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
		throw new SettingsError(`Could not read the settings file ${file}: ${(error as Error).message}`);
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
	} catch (error) {
		throw new SettingsError(`The settings file is not valid JSON: ${file}\n  ${(error as Error).message}`);
	}
	if (!isPlainObject(parsed)) throw new SettingsError(`The settings file must contain a JSON object: ${file}`);
	const user = migrateLegacySettings(file, parsed);
	assertValidSettings(user, file);
	return user;
}

function assertValidSettings(user: UserSettings, file: string): void {
	const errors = validateAgainstSchema(user, schema as SchemaNode);
	if (errors.length > 0) {
		throw new SettingsError(`Invalid settings in ${file}:\n${errors.map((line) => `  ${line}`).join("\n")}`);
	}
}

/** 設定ファイルを書く。正しくない内容は書かずに SettingsError にする。 */
export function writeUserSettings(file: string, user: UserSettings): void {
	assertValidSettings(user, file);
	fs.writeFileSync(file, `${JSON.stringify(user, null, "\t")}\n`, "utf8");
}

/** 入れ子の項目に値を書く。途中の階層が無ければ作る。 */
export function setSetting(user: UserSettings, keys: readonly string[], value: unknown): void {
	let node = user;
	for (const key of keys.slice(0, -1)) {
		if (!isPlainObject(node[key])) node[key] = {};
		node = node[key] as UserSettings;
	}
	node[keys[keys.length - 1]!] = value;
}

/** 入れ子の項目を消す。空になった階層も消す。 */
export function deleteSetting(user: UserSettings, keys: readonly string[]): void {
	const [head, ...rest] = keys;
	if (head === undefined) return;
	const child = user[head];
	if (rest.length === 0) {
		delete user[head];
	} else if (isPlainObject(child)) {
		deleteSetting(child, rest);
		if (Object.keys(child).length === 0) delete user[head];
	}
}

/** オブジェクトは項目ごとに重ね、配列とそれ以外の値は丸ごと置き換える。 */
function mergeSettings(base: unknown, override: unknown): unknown {
	if (!isPlainObject(base) || !isPlainObject(override)) return override;
	const merged: Record<string, unknown> = {...base};
	for (const [key, value] of Object.entries(override)) {
		merged[key] = Object.hasOwn(base, key) ? mergeSettings(base[key], value) : value;
	}
	return merged;
}

/** Java 以外の言語を、設定での名前と一緒に返す。enabled が false のものは除く。 */
export function commandLanguageSettings(settings: Settings): Array<[string, CommandLanguageSettings]> {
	return Object.entries(settings.languages)
		.filter((entry): entry is [string, CommandLanguageSettings] => entry[0] !== "java")
		.filter(([, language]) => language.enabled !== false);
}

const REQUIRED_LANGUAGE_SETTINGS = ["family", "name", "command", "sourceFile", "run"] as const;

/**
 * 既定値と重ねたあとの言語を検査する。
 * 利用者が足した言語は必要な項目を全部書く必要があるが、既定の言語の上書きでは一部だけを書くので、
 * 設定ファイル単体ではなく、重ねた結果で確かめる。
 */
function assertCompleteLanguages(settings: Settings, file: string): void {
	const errors: string[] = [];
	for (const [name, language] of commandLanguageSettings(settings)) {
		for (const key of REQUIRED_LANGUAGE_SETTINGS) {
			const value = language[key];
			if (value === undefined || value.length === 0) errors.push(`languages.${name}.${key}: is required to add a language`);
		}
		if (language.setup !== undefined && (language.compile ?? []).length === 0) {
			errors.push(`languages.${name}.setup: needs "compile"`);
		}
	}
	if (errors.length > 0) {
		throw new SettingsError(`Invalid settings in ${file}:\n${errors.map((line) => `  ${line}`).join("\n")}`);
	}
}

/** 既定値に設定ファイルを重ねた設定を返す。 */
export function loadSettings(file: string): Settings {
	const {$schema: _schema, ...user} = readUserSettings(file);
	const settings = mergeSettings(DEFAULT_SETTINGS, user) as Settings;
	assertCompleteLanguages(settings, file);
	return settings;
}

/** 設定を「項目の名前 = 値」の行にする。既定値と違う行は changed を立てる。 */
export function describeSettings(settings: Settings): Array<{name: string; value: string; changed: boolean}> {
	const rows: Array<{name: string; value: string; changed: boolean}> = [];
	const visit = (value: unknown, base: unknown, name: string) => {
		if (isPlainObject(value) && Object.keys(value).length > 0) {
			for (const [key, item] of Object.entries(value)) {
				const baseItem = isPlainObject(base) && Object.hasOwn(base, key) ? base[key] : undefined;
				visit(item, baseItem, name ? `${name}.${key}` : key);
			}
			return;
		}
		const text = JSON.stringify(value);
		rows.push({name, value: text, changed: text !== JSON.stringify(base)});
	};
	visit(settings, DEFAULT_SETTINGS, "");
	return rows;
}

/** サーバーが起動時に読む項目の要約。起動後に設定が変わったかを、CLI がこの値で調べる。 */
export function serverSettingsDigest(settings: Settings): string {
	const {server: {port, extraOrigins}, run, languages} = settings;
	return crypto.createHash("md5").update(JSON.stringify({port, extraOrigins, run, languages})).digest("hex");
}

export type PathEnvironment = {
	platform: NodeJS.Platform;
	homeDir: string;
};

function currentEnvironment(): PathEnvironment {
	return {platform: process.platform, homeDir: os.homedir()};
}

/** 命令の名前(java など)ではなく、場所を指しているか。 */
export function isPathLike(value: string): boolean {
	return value.startsWith("~") || /[\\/]/.test(value);
}

/**
 * 設定に書かれたパスを、読んでいる側の OS のパスにする。
 * - `~` は読んでいる側のホーム
 * - 相対パスは設定ファイルのあるフォルダから
 * - `C:/...` と `/mnt/c/...` は互いに読み替える
 */
export function resolveSettingPath(value: string, settingsFile: string, environment = currentEnvironment()): string {
	const {platform, homeDir} = environment;
	const pathApi = platform === "win32" ? path.win32 : path.posix;
	if (value === "~" || /^~[\\/]/.test(value)) return pathApi.join(homeDir, value.slice(1));
	const drivePath = /^([A-Za-z]):[\\/](.*)$/.exec(value);
	if (drivePath) {
		const [, drive = "", rest = ""] = drivePath;
		return platform === "win32" ? pathApi.normalize(value) : `/mnt/${drive.toLowerCase()}/${rest.replaceAll("\\", "/")}`;
	}
	if (platform === "win32" && value.startsWith("/")) {
		const mounted = /^\/mnt\/([A-Za-z])\/(.*)$/.exec(value);
		if (!mounted) throw new SettingsError(`This path exists only inside WSL and cannot be read from Windows: ${value}`);
		const [, drive = "", rest = ""] = mounted;
		return pathApi.normalize(`${drive.toUpperCase()}:/${rest}`);
	}
	if (pathApi.isAbsolute(value)) return value;
	return pathApi.resolve(pathApi.dirname(settingsFile), value);
}

/** 指定されたフォルダから、`lib` を直下に持つ `src` フォルダを探す。ライブラリのルートでも `src` でも受け付ける。 */
export function resolveLibrarySource(input: string): string {
	const root = path.resolve(input);
	const candidates = [root, path.join(root, "src")];
	const found = candidates.find((candidate) => fs.existsSync(path.join(candidate, "lib")));
	if (!found) throw new Error(`The lib folder was not found. Tried: ${candidates.join(", ")}`);
	return found;
}

/** 以前のバージョンが読んでいた環境変数と、代わりに書く設定の項目。値が null のものは、代わりの項目が無い。 */
const LEGACY_ENVIRONMENT: Readonly<Record<string, string | null>> = {
	LOCAL_RUNNER_URL: "server.port",
	LOCAL_RUNNER_PORT: "server.port",
	LOCAL_RUNNER_BACKEND: "server.backend",
	ATCODER_RUNNER_AUTOSTART: "server.autoStart",
	LOCAL_RUNNER_START_TIMEOUT_MS: "server.startTimeoutMs",
	LOCAL_RUNNER_ALLOWED_ORIGINS: "server.extraOrigins",
	LOCAL_RUNNER_CAPTURE_LIMIT_BYTES: "run.outputLimitMb",
	ATCODER_JAVA_VER: "languages.java.release",
	ATCODER_LIB_SRC: "languages.java.library",
	LOCAL_RUNNER_RUN_STACK_BYTES: "languages.java.stackMb",
	ATCODER_SESSION_FILE: "atcoder.sessionFile",
	ATCODER_NO_CACHE: "atcoder.sampleCache",
	ATCODER_SUBMISSION_POLL_TIMEOUT_MS: "atcoder.resultWaitMs",
	ATCODER_SESSION: null,
	ATCODER_COOKIE: null,
	LOCAL_RUNNER_HOST: null,
	LOCAL_RUNNER_BASE_DIR: null,
	LOCAL_RUNNER_BUN: null,
	LOCAL_RUNNER_FORCE_COLOR: null,
	LOCAL_RUNNER_INPROCESS_COMPILE: null,
	LOCAL_RUNNER_DISPATCHER_SOURCE: null,
	LOCAL_RUNNER_MAX_LOG_FILE_SIZE_BYTES: null,
	LOCAL_RUNNER_WARMUP_PROFILE: null,
	LOCAL_RUNNER_WARMUP_TIMEOUT_MS: null,
	LOCAL_RUNNER_WARMUP_REPEAT: null,
	ATCODER_SUBMIT_RETRY_MAX: null,
	ATCODER_SUBMIT_RETRY_BASE_MS: null,
	ATCODER_SAMPLE_CACHE_MAX: null,
};

/** 設定されたままの古い環境変数について、移行先を案内する文を返す。値は秘密になりうるので表示しない。 */
export function legacyEnvironmentWarnings(environment: NodeJS.ProcessEnv, settingsFile: string): string[] {
	return Object.entries(LEGACY_ENVIRONMENT)
		.filter(([name]) => environment[name] !== undefined && environment[name] !== "")
		.map(([name, setting]) => setting === null
			? `The environment variable ${name} is no longer read.`
			: `The environment variable ${name} is no longer read. Write "${setting}" in ${settingsFile} instead.`);
}
