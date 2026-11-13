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

/** prepareSource の戻り値（複数コマンドで共有する整形済みソース情報）。 */
export type PreparedSource = {
	resolvedSourcePath: string;
	transformed: string;
	originalFileName: string;
	language: SourceLanguage;
	/** コンパイル済みのプログラム。実行系コマンドでのみ設定される。 */
	program?: PreparedProgram;
	/** ライブラリ展開でインラインされた FQCN 一覧（展開なしなら空）。 */
	inlinedClasses: string[];
	/** サーバーが使った名前(Main.java など)を、エラーの表示で元のファイル名に戻す。 */
	restoreNames: (text: string) => string;
};

export type PrepareOptions = {
	compile?: boolean;
	validate?: boolean;
	header?: shared.LocalRunnerHeaderOption;
	/** --lang の指定。省略時は拡張子から選ぶ。 */
	lang?: string;
};

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
 * ソースファイルを解決して読み込み、サーバーで変換する。
 * Java はライブラリ展開（lib import があれば）と Main クラス化、ほかの言語は設定の bundle と DEBUG の書き換えを行う。
 * run / localtest / tomain / test / submit が共通で使う前処理。
 * すべての経路が変換後のソースを使うため、ローカル実行と提出物が常に一致する。
 * ヘッダーは変換のときに付ける。既定では実行用（compile）に付けず、提出物を作る経路にだけ付ける。
 */
export async function prepareSource(sourceFilePath: string, debug = false, options: PrepareOptions = {}): Promise<PreparedSource> {
	const resolvedSourcePath = resolveSourceFile(SETTINGS, sourceFilePath, process.cwd(), options.lang);
	const language = languageForFile(SETTINGS, resolvedSourcePath, options.lang);
	const sourceText = shared.normalizeNewlines(fs.readFileSync(resolvedSourcePath, "utf8"));
	await ensureServer.ensureLocalRunnerReady();
	const compile = options.compile === true;
	const validate = options.validate ?? !compile;
	const header = options.header ?? !compile;
	const fields = {sourceCode: sourceText, compilerName: language.name, debug, autoImport: true, validate, header};
	const request = () => requestRunner<shared.LocalRunnerTransformResponse | shared.LocalRunnerPrepareResponse>(
		compile ? {mode: "prepare", ...fields} : {mode: "transform", ...fields},
		"Local Runner transform failed",
	);
	const programIdOf = (result: shared.LocalRunnerTransformResponse | shared.LocalRunnerPrepareResponse): string => {
		if (result.status !== "success") throw new Error(result.diagnostics || "The source could not be prepared.");
		const programId = "programId" in result ? result.programId : undefined;
		if (!programId) throw new Error("Local Runner did not return a prepared program ID.");
		return programId;
	};

	const originalFileName = path.basename(resolvedSourcePath);
	const restoreNames = createNameRestorer(language, originalFileName);
	const transformedResult = await request();
	if (transformedResult.status !== "success") {
		// Java の診断は、変換の前のソースについて javac が返したものなので、名前を戻さない。
		const diagnostics = language.isJava ? transformedResult.diagnostics : restoreNames(transformedResult.diagnostics);
		throw new Error(diagnostics || "The source could not be prepared.");
	}
	if (transformedResult.addedImports.length > 0) {
		console.log(`Added library imports: ${transformedResult.addedImports.join(", ")}`);
	}
	if (transformedResult.inlinedClasses.length > 0) {
		console.log(`Bundled library classes: ${transformedResult.inlinedClasses.join(", ")}`);
	}
	const program: PreparedProgram | undefined = compile
		? {
			programId: programIdOf(transformedResult),
			compilerName: language.name,
			refresh: async () => programIdOf(await request()),
		}
		: undefined;
	return {
		resolvedSourcePath,
		transformed: transformedResult.sourceCode,
		originalFileName,
		language,
		program,
		inlinedClasses: transformedResult.inlinedClasses,
		restoreNames,
	};
}
