import fs from "node:fs";
import path from "node:path";
import * as shared from "@atcoder-tools/shared";
import {SETTINGS} from "../../config";
import * as ensureServer from "../ensureServer";
import {languageForFile, resolveSourceFile, type SourceLanguage} from "../language";
import {requestRunner} from "../runnerClient";

/** コンパイル済みのプログラム。サーバーから消えていたら、refresh で作り直す。 */
export type PreparedProgram = {
	programId: string;
	readonly compilerName: string;
	/** 同じソースをコンパイルし直し、新しい programId を返す。 */
	readonly refresh: () => Promise<string>;
};

/** サーバーで変換したソースと、元のファイルの情報。 */
export type PreparedSource = {
	resolvedSourcePath: string;
	transformed: string;
	originalFileName: string;
	language: SourceLanguage;
	/** ライブラリ展開でインラインされた FQCN 一覧（展開なしなら空）。 */
	inlinedClasses: string[];
	/** サーバーが使った名前(Main.java など)を、エラーの表示で元のファイル名に戻す。 */
	restoreNames: (text: string) => string;
};

/** コンパイルまで済ませたソース。 */
export type CompiledSource = PreparedSource & {program: PreparedProgram};

export type SourceOptions = {
	header?: shared.LocalRunnerHeaderOption;
	/** --lang の指定。省略時は拡張子から選ぶ。 */
	lang?: string;
};

type ServerResult = shared.LocalRunnerTransformResponse | shared.LocalRunnerPrepareResponse;

function createNameRestorer(language: SourceLanguage, originalFileName: string): (text: string) => string {
	const runtimeFileName = language.runtimeFileName;
	if (language.isJava) {
		// Java は提出用にクラス名も Main へ変えているので、クラス名も元に戻す。
		const originalClassName = originalFileName.replace(/\.java$/i, "");
		return (text) => text.replaceAll(runtimeFileName, originalFileName).replace(/\bMain\b/g, originalClassName);
	}
	return (text) => (runtimeFileName === originalFileName ? text : text.replaceAll(runtimeFileName, originalFileName));
}

/**
 * ソースファイルを解決して読み込み、サーバーで変換する(mode が prepare ならコンパイルもする)。
 * Java はライブラリ展開（lib import があれば）と Main クラス化、ほかの言語は設定の bundle と DEBUG の書き換えを行う。
 * すべての経路が変換後のソースを使うため、ローカル実行と提出物が常に一致する。
 */
async function requestSource(
	sourceFilePath: string,
	mode: "transform" | "prepare",
	debug: boolean,
	{header, lang, validate}: {header: shared.LocalRunnerHeaderOption; lang?: string; validate: boolean},
): Promise<{source: PreparedSource; result: ServerResult; request: () => Promise<ServerResult>}> {
	const resolvedSourcePath = resolveSourceFile(SETTINGS, sourceFilePath, process.cwd(), lang);
	const language = languageForFile(SETTINGS, resolvedSourcePath, lang);
	const sourceText = shared.normalizeNewlines(fs.readFileSync(resolvedSourcePath, "utf8"));
	await ensureServer.ensureLocalRunnerReady();
	const fields = {sourceCode: sourceText, compilerName: language.name, debug, autoImport: true, validate, header};
	const request = () => requestRunner<ServerResult>({mode, ...fields}, "Local Runner transform failed");

	const originalFileName = path.basename(resolvedSourcePath);
	const restoreNames = createNameRestorer(language, originalFileName);
	const result = await request();
	if (result.status !== "success") {
		// Java の診断は、変換の前のソースについて javac が返したものなので、名前を戻さない。
		const diagnostics = language.isJava ? result.diagnostics : restoreNames(result.diagnostics);
		throw new Error(diagnostics || "The source could not be prepared.");
	}
	if (result.addedImports.length > 0) {
		console.log(`Added library imports: ${result.addedImports.join(", ")}`);
	}
	if (result.inlinedClasses.length > 0) {
		console.log(`Bundled library classes: ${result.inlinedClasses.join(", ")}`);
	}
	const source: PreparedSource = {
		resolvedSourcePath,
		transformed: result.sourceCode,
		originalFileName,
		language,
		inlinedClasses: result.inlinedClasses,
		restoreNames,
	};
	return {source, result, request};
}

/** 提出物を作る(tomain、toclip)。DEBUG は無効にし、ヘッダーは既定で付ける。 */
export async function transformSource(sourceFilePath: string, options: SourceOptions = {}): Promise<PreparedSource> {
	const {source} = await requestSource(sourceFilePath, "transform", false, {
		header: options.header ?? true,
		...(options.lang !== undefined && {lang: options.lang}),
		validate: true,
	});
	return source;
}

/** 実行のためにコンパイルする(run、test、localtest、crosscheck、submit)。ヘッダーは既定で付けず、行番号を元のソースと揃える。 */
export async function compileSource(sourceFilePath: string, debug: boolean, options: SourceOptions = {}): Promise<CompiledSource> {
	const {source, result, request} = await requestSource(sourceFilePath, "prepare", debug, {
		header: options.header ?? false,
		...(options.lang !== undefined && {lang: options.lang}),
		validate: false,
	});
	const programIdOf = (response: ServerResult): string => {
		if (response.status !== "success") throw new Error(response.diagnostics || "The source could not be prepared.");
		if (!("programId" in response) || !response.programId) throw new Error("Local Runner did not return a prepared program ID.");
		return response.programId;
	};
	return {
		...source,
		program: {
			programId: programIdOf(result),
			compilerName: source.language.name,
			refresh: async () => programIdOf(await request()),
		},
	};
}
