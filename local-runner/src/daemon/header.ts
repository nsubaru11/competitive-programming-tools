import fs from "node:fs";
import {
	type LocalRunnerHeaderOption,
	type LocalRunnerTransformResponse,
	normalizeNewlines,
} from "@atcoder-tools/shared";
import * as config from "../config";

/**
 * ソースの先頭にヘッダーを付ける。既定のファイルが無ければそのまま返し、指定されたファイルが無ければ失敗する。
 * toclip の出力を貼り付けたときなど、既にヘッダーで始まるソースには重ねて付けない。
 */
function prependHeader(sourceCode: string, header: LocalRunnerHeaderOption): string {
	if (header === false) return sourceCode;
	const name = typeof header === "string" ? header : undefined;
	const headerFile = config.resolveSubmissionHeaderFile(name);
	if (!fs.existsSync(headerFile)) {
		if (name !== undefined) throw new Error(`Header file not found: ${headerFile}`);
		return sourceCode;
	}
	const headerText = normalizeNewlines(fs.readFileSync(headerFile, "utf8")).trimEnd();
	if (sourceCode.startsWith(headerText.split("\n", 1)[0])) return sourceCode;
	return `${headerText}\n\n${sourceCode}`;
}

/** 変換結果の提出用ソースにヘッダーを付ける。ヘッダーを読めないときは変換の失敗として返す。 */
export function applySubmissionHeader<T extends LocalRunnerTransformResponse>(response: T, header: LocalRunnerHeaderOption): T {
	if (response.status !== "success") return response;
	try {
		return {...response, sourceCode: prependHeader(response.sourceCode, header)};
	} catch (error) {
		return {...response, status: "compileError", diagnostics: error instanceof Error ? error.message : String(error)};
	}
}
