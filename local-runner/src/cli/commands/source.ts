import fs from "node:fs";
import path from "node:path";
import * as shared from "@atcoder-tools/shared";
import * as ensureServer from "../ensureServer";
import {requestRunner} from "../runnerClient";
import * as transform from "../transform";

/** prepareSource の戻り値（複数コマンドで共有する整形済みソース情報）。 */
export type PreparedSource = {
	resolvedSourcePath: string;
	transformed: string;
	originalFileName: string;
	originalClassName: string;
	/** コンパイル済みプログラムを参照するID。実行系コマンドでのみ設定される。 */
	programId?: string;
	/** ライブラリ展開でインラインされた FQCN 一覧（展開なしなら空）。 */
	inlinedClasses: string[];
};

/**
 * ソースファイルを解決して読み込み、ライブラリ展開（lib import があれば）→
 * Main クラス化 + （任意で）DEBUG 有効化した文字列を返す。
 * run / localtest / tomain / test / submit が共通で使う前処理。
 * すべての経路がバンドル後のソースを使うため、ローカル実行と提出物が常に一致する。
 * ヘッダーはバンドル時に付ける。既定では実行用（compile）に付けず、提出物を作る経路にだけ付ける。
 */
export async function prepareSource(
	sourceFilePath: string,
	debug = false,
	options: {compile?: boolean; validate?: boolean; header?: shared.LocalRunnerHeaderOption} = {},
): Promise<PreparedSource> {
	const resolvedSourcePath = transform.resolveSourceFilePath(sourceFilePath);
	const sourceText = shared.normalizeNewlines(fs.readFileSync(resolvedSourcePath, "utf8"));
	await ensureServer.ensureLocalRunnerReady();
	const compile = options.compile === true;
	const validate = options.validate ?? !compile;
	const header = options.header ?? !compile;
	const fields = {sourceCode: sourceText, debug, autoImport: true, validate, header};
	const transformedResult = await requestRunner<shared.LocalRunnerTransformResponse | shared.LocalRunnerPrepareResponse>(
		compile ? {mode: "prepare", ...fields} : {mode: "transform", ...fields},
		"Local Runner transform failed",
	);
	if (transformedResult.status !== "success") {
		throw new Error(transformedResult.diagnostics || "Java source transformation failed.");
	}
	if (compile && !("programId" in transformedResult && transformedResult.programId)) {
		throw new Error("Local Runner did not return a prepared program ID.");
	}
	if (transformedResult.addedImports.length > 0) {
		console.log(`Added library imports: ${transformedResult.addedImports.join(", ")}`);
	}
	if (transformedResult.inlinedClasses.length > 0) {
		console.log(`Bundled library classes: ${transformedResult.inlinedClasses.join(", ")}`);
	}
	const originalFileName = path.basename(resolvedSourcePath);
	const originalClassName = originalFileName.replace(/\.java$/i, "");
	return {
		resolvedSourcePath,
		transformed: transformedResult.sourceCode,
		originalFileName,
		originalClassName,
		programId: "programId" in transformedResult ? transformedResult.programId : undefined,
		inlinedClasses: transformedResult.inlinedClasses,
	};
}
