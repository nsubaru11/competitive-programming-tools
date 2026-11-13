import fs from "node:fs";
import path from "node:path";
import type {CommandLanguageSettings, Settings} from "../settings/settings";

/** CLI が、ソースの言語について知っていること。 */
export type SourceLanguage = {
	/** 設定での名前。サーバーへは compilerName として送る。 */
	readonly name: string;
	readonly family: string;
	readonly isJava: boolean;
	/** サーバーがソースを書き出すときのファイル名。エラーの表示を元のファイル名へ戻すのに使う。 */
	readonly runtimeFileName: string;
	/** AtCoder の提出フォームの言語名に含まれる文字列。 */
	readonly submit?: string;
};

function languageNames(settings: Settings): string[] {
	return Object.entries(settings.languages)
		.filter(([name, language]) => name === "java" || (language as CommandLanguageSettings).enabled !== false)
		.map(([name]) => name);
}

/** 設定の languages から、名前で言語を引く。 */
export function findLanguage(settings: Settings, name: string): SourceLanguage {
	if (!languageNames(settings).includes(name)) {
		throw new Error(`Unknown language: "${name}". Available languages: ${languageNames(settings).join(", ")}.`);
	}
	if (name === "java") {
		return {name, family: settings.languages.java.family, isJava: true, runtimeFileName: "Main.java"};
	}
	const language = settings.languages[name] as CommandLanguageSettings;
	return {name, family: language.family, isJava: false, runtimeFileName: language.sourceFile, submit: language.submit};
}

/** ソースの言語を決める。--lang の指定があればそれを使い、無ければ拡張子から選ぶ。 */
export function languageForFile(settings: Settings, sourceFile: string, lang?: string): SourceLanguage {
	if (lang !== undefined) return findLanguage(settings, lang);
	const extension = path.extname(sourceFile).toLowerCase();
	const name = Object.hasOwn(settings.extensions, extension) ? settings.extensions[extension]! : undefined;
	if (name === undefined) {
		throw new Error(`No language is set for "${extension || path.basename(sourceFile)}" files. Add it to "extensions" in the settings or use --lang=<name>.`);
	}
	return findLanguage(settings, name);
}

/**
 * 拡張子を省いた指定で探す拡張子の一覧。
 * --lang の指定があれば、その言語と同じ種類の言語の拡張子に絞る(--lang=pypy なら .py)。
 */
function candidateExtensions(settings: Settings, lang?: string): string[] {
	const extensions = Object.keys(settings.extensions);
	if (lang === undefined) return extensions;
	const {family} = findLanguage(settings, lang);
	const sameFamily = extensions.filter((extension) => {
		const language = settings.languages[settings.extensions[extension]!];
		return language?.family === family;
	});
	return sameFamily.length > 0 ? sameFamily : extensions;
}

function isFile(file: string): boolean {
	return fs.existsSync(file) && fs.statSync(file).isFile();
}

function ambiguous(files: readonly string[]): Error {
	const names = files.map((file) => path.basename(file)).join(", ");
	return new Error(`More than one source file matches: ${names}. Give the file name with its extension, or use --lang=<name>.`);
}

/** 指定されたソースのパスを決める。拡張子が省かれていれば、設定の拡張子を順に試す。 */
export function resolveSourceFile(settings: Settings, sourceArg: string, cwd: string, lang?: string): string {
	const direct = path.resolve(cwd, sourceArg);
	if (isFile(direct)) return direct;
	const found = candidateExtensions(settings, lang).map((extension) => `${direct}${extension}`).filter(isFile);
	if (found.length > 1) throw ambiguous(found);
	if (found.length === 0) throw new Error(`Source file not found from current directory: ${sourceArg}`);
	return found[0]!;
}

/** 短縮表記(d、ex、d1 など)のソースを、フォルダの中から大文字と小文字を区別せずに探す。 */
export function findShortSource(settings: Settings, token: string, cwd: string, lang?: string): string {
	const wanted = candidateExtensions(settings, lang).map((extension) => `${token}${extension}`.toLowerCase());
	let names: string[] = [];
	try {
		names = fs.readdirSync(cwd);
	} catch {
		// 読めないフォルダは、見つからない扱いにする
	}
	// 設定の拡張子の順に並べ、エラーの表示がフォルダの並びに左右されないようにする。
	const found = wanted
		.flatMap((wantedName) => names.filter((name) => name.toLowerCase() === wantedName))
		.map((name) => path.join(cwd, name));
	if (found.length > 1) throw ambiguous(found);
	if (found.length === 0) {
		const expected = candidateExtensions(settings, lang).map((extension) => `${token.toUpperCase()}${extension}`).join(", ");
		throw new Error(`Source file not found in ${cwd}: ${expected}`);
	}
	return found[0]!;
}
