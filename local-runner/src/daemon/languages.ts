import {type CommandLanguageSettings, commandLanguageSettings, isPathLike, type Settings} from "../settings/settings";
import type {CommandLanguage} from "./commandEngine";
import {findOnPath, isExecutableFile} from "./processRunner";

const MEBIBYTE = 1024 * 1024;
const DEFAULT_STACK_MB = 1024;

/** サーバーが扱う言語。一覧の応答と、ヘッダーの既定の名前に使う。 */
export type RunnerLanguage = {
	readonly name: string;
	readonly family: string;
	/** 設定の name。言語の表記として一覧に載せる。 */
	readonly displayName: string;
	/** 実行環境の表示名。Java では JDK のバージョンと動いている場所を含む。 */
	readonly label: string;
	readonly match: readonly string[];
	/** コマンドで動かす言語の定義。常駐の JVM で動かす Java では null。 */
	readonly command: CommandLanguage | null;
};

export type ResolvedLanguages = {
	readonly languages: readonly RunnerLanguage[];
	/** 処理系が見つからず、使えない言語と理由。 */
	readonly skipped: ReadonlyArray<{readonly name: string; readonly reason: string}>;
};

/** 設定の command を実体の場所にする。見つからなければ null。 */
function locateCommand(command: string, resolvePath: (value: string) => string): string | null {
	if (!isPathLike(command)) return findOnPath(command);
	const file = resolvePath(command);
	return isExecutableFile(file) ? file : null;
}

function toCommandLanguage(name: string, settings: CommandLanguageSettings, command: string): CommandLanguage {
	const compile = settings.compile ?? [];
	return {
		name,
		command,
		sourceFile: settings.sourceFile,
		compile: compile.length > 0 ? compile : null,
		run: settings.run,
		debugArgs: settings.debugArgs ?? [],
		debugRewrite: settings.debugRewrite === true,
		stackBytes: (settings.stackMb ?? DEFAULT_STACK_MB) * MEBIBYTE,
		headerUnit: settings.setup === "builtin:gcc-header-unit",
		bundle: settings.bundle && settings.bundle.length > 0 ? settings.bundle : null,
	};
}

/**
 * 設定の languages から、このサーバーで使える言語を決める。
 * 処理系が見つからない言語は、エラーにせず一覧から外す。
 */
export function resolveLanguages(
	settings: Settings,
	javaLabel: string,
	resolvePath: (value: string) => string,
	commandLanguagesSupported: boolean,
): ResolvedLanguages {
	const java = settings.languages.java;
	const languages: RunnerLanguage[] = [
		{name: "java", family: java.family, displayName: java.name, label: javaLabel, match: java.match ?? [], command: null},
	];
	const skipped: Array<{name: string; reason: string}> = [];
	for (const [name, language] of commandLanguageSettings(settings)) {
		if (!commandLanguagesSupported) {
			skipped.push({name, reason: "needs a server running on Linux or WSL"});
			continue;
		}
		const command = locateCommand(language.command, resolvePath);
		if (command === null) {
			skipped.push({name, reason: `${language.command} was not found`});
			continue;
		}
		languages.push({
			name,
			family: language.family,
			displayName: language.name,
			label: language.name,
			match: language.match ?? [],
			command: toCommandLanguage(name, language, command),
		});
	}
	return {languages, skipped};
}
