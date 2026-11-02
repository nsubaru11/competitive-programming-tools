import fs from "node:fs";
import {
	type LocalRunnerHeaderOption,
	type LocalRunnerTransformResponse,
	normalizeNewlines,
} from "@atcoder-tools/shared";
import * as config from "../config";

/**
 * ソースの先頭にヘッダーを付ける。言語に設定が無ければそのまま返し、指定された名前に設定が無ければ失敗する。
 * toclip の出力を貼り付けたときなど、既にヘッダーで始まるソースには重ねて付けない。
 */
function prependHeader(sourceCode: string, header: LocalRunnerHeaderOption, language: string): string {
	if (header === false) return sourceCode;
	const name = typeof header === "string" ? header : language;
	const headerFile = config.resolveSubmissionHeaderFile(name);
	if (headerFile === null) {
		if (typeof header === "string") throw new Error(`Header is not set: ${name}. Set it with setheader ${name} <file>.`);
		return sourceCode;
	}
	if (!fs.existsSync(headerFile)) throw new Error(`Header file not found: ${headerFile}`);
	const headerText = normalizeNewlines(fs.readFileSync(headerFile, "utf8")).trimEnd();
	if (sourceCode.startsWith(headerText.split("\n", 1)[0])) return sourceCode;
	return `${headerText}\n\n${sourceCode}`;
}

/** 変換結果の提出用ソースにヘッダーを付ける。ヘッダーを読めないときは変換の失敗として返す。 */
export function applySubmissionHeader<T extends LocalRunnerTransformResponse>(
	response: T,
	header: LocalRunnerHeaderOption,
	language: string,
): T {
	if (response.status !== "success") return response;
	try {
		return {...response, sourceCode: prependHeader(response.sourceCode, header, language)};
	} catch (error) {
		return {
			...response,
			status: "compileError",
			diagnostics: error instanceof Error ? error.message : String(error)
		};
	}
}
