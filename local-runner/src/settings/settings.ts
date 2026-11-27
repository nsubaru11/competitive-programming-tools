import crypto from "node:crypto";
import fs from "node:fs";
import schema from "../../settings.schema.json";
import defaults from "./defaults.json";
import {isPlainObject, joinSettingName, type SchemaNode, validateAgainstSchema} from "./schema";

/** 常駐する JVM で動かす Java。 */
export type JavaLanguageSettings = {
	family: string;
	name: string;
	match?: string[];
	command: string;
	release: number;
	/** ライブラリのソースを置いたフォルダ。この中の .java をすべて展開の対象にする。 */
	library?: string;
	/** 展開するときに末尾へ回すパッケージ。 */
	libraryLast: string[];
	/** デバッグの有無に合わせて値を書き換える、起動クラスのフィールドの名前。 */
	debugFlag?: string;
	stackMb: number;
};

/** コンパイルと実行をコマンドで行う言語。 */
export type CommandLanguageSettings = {
	enabled?: boolean;
	family: string;
	name: string;
	match?: string[];
	/** AtCoder の提出フォームの言語名に含まれる文字列。 */
	submit?: string;
	command: string;
	sourceFile: string;
	compile?: string[];
	warmup?: string[];
	compilePath?: "auto" | "inherit";
	run: string[];
	debugArgs?: string[];
	debugFlag?: string;
	stackMb?: number;
	setup?: "builtin:gcc-header-unit" | "builtin:kotlin-runtime" | "builtin:dotnet-project" | "none";
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
		maxParallelRuns: number;
	};
	languages: {java: JavaLanguageSettings} & Record<string, JavaLanguageSettings | CommandLanguageSettings>;
	/** ソースの拡張子から言語を選ぶ対応。 */
	extensions: Record<string, string>;
	headers: Record<string, string>;
	atcoder: {
		sessionFile: string;
		sampleCache: boolean;
		resultWaitMs: number;
	};
	update: {
		/** サーバーの起動時に、新しいバージョンがあるかを配布元へ確かめる。 */
		check: boolean;
		/** 配布元の GitHub のリポジトリ(`所有者/名前`)。 */
		repository: string;
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
	assertValidSettings(parsed, file);
	return parsed;
}

/** 誤りが1つでもあれば、ファイルの場所と項目ごとの理由を並べた SettingsError にする。 */
function throwIfInvalid(errors: readonly string[], file: string): void {
	if (errors.length > 0) {
		throw new SettingsError(`Invalid settings in ${file}:\n${errors.map((line) => `  ${line}`).join("\n")}`);
	}
}

function assertValidSettings(user: UserSettings, file: string): void {
	throwIfInvalid(validateAgainstSchema(user, schema as SchemaNode), file);
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
		if (language.setup && language.setup !== "none" && (language.compile ?? []).length === 0) {
			errors.push(`languages.${name}.setup: needs "compile"`);
		}
	}
	for (const [extension, name] of Object.entries(settings.extensions)) {
		if (!Object.hasOwn(settings.languages, name)) {
			errors.push(`${joinSettingName("extensions", extension)}: unknown language "${name}"`);
		}
	}
	throwIfInvalid(errors, file);
}

/** 既定値に設定ファイルを重ねた設定を返す。 */
export function loadSettings(file: string): Settings {
	const {$schema: _schema, settingsVersion: _version, ...user} = readUserSettings(file);
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
				visit(item, baseItem, joinSettingName(name, key));
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
