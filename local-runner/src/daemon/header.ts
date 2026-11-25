import fs from "node:fs";
import {
	type LocalRunnerHeaderOption,
	type LocalRunnerPrepareResponse,
	type LocalRunnerTransformResponse,
	normalizeNewlines,
	prependSubmissionHeader,
} from "@atcoder-tools/shared";
import * as config from "../config";

/**
 * 提出物に付けるヘッダーの文。言語に設定が無ければ null を返し、指定された名前に設定が無ければ失敗する。
 * languageKeys は言語の既定のヘッダーを探す名前で、先に書いたものを優先する(言語の名前、種類の順)。
 */
export function resolveSubmissionHeader(header: LocalRunnerHeaderOption, languageKeys: readonly string[]): string | null {
	return resolveSubmissionHeaderEntry(header, languageKeys)?.text ?? null;
}

/** ヘッダーの文と、使った設定の名前(言語の名前、種類、名前付きのヘッダーの名前)。 */
function resolveSubmissionHeaderEntry(header: LocalRunnerHeaderOption, languageKeys: readonly string[]): {name: string; text: string} | null {
	if (header === false) return null;
	const names = typeof header === "string" ? [header] : languageKeys;
	const found = names.map((name) => ({name, file: config.resolveSubmissionHeaderFile(name)})).find(({file}) => file !== null);
	if (found === undefined || found.file === null) {
		if (typeof header === "string") throw new Error(`Header is not set: ${header}. Set it with setheader ${header} <file>.`);
		return null;
	}
	if (!fs.existsSync(found.file)) throw new Error(`Header file not found: ${found.file}`);
	return {name: found.name, text: normalizeNewlines(fs.readFileSync(found.file, "utf8")).trimEnd()};
}

/** ヘッダーを読む。読めなければ、その理由を返す。空白だけのヘッダーは付けないので null にする。 */
export function readSubmissionHeader(header: LocalRunnerHeaderOption, languageKeys: readonly string[]): {text: string | null; name: string} | {error: string} {
	try {
		const entry = resolveSubmissionHeaderEntry(header, languageKeys);
		return entry !== null && entry.text.trim() ? entry : {text: null, name: ""};
	} catch (error) {
		return {error: error instanceof Error ? error.message : String(error)};
	}
}

/** 付けたヘッダーの行数を lineOffset に、名前と行数を header に入れる。付けなければ header は書かない。 */
function withHeaderLines<T extends LocalRunnerTransformResponse>(response: T, lines: number, name: string): T {
	const lineOffset = {header: lines, transform: response.lineOffset === undefined ? 0 : response.lineOffset.transform};
	return {...response, lineOffset, ...(lines > 0 ? {header: {name, lines}} : {})};
}

/** 変換結果の提出用ソースにヘッダーを付ける(tomain、toclip)。読めなければ変換結果に警告を加える。 */
export function applySubmissionHeader<T extends LocalRunnerTransformResponse>(
	response: T,
	header: LocalRunnerHeaderOption,
	languageKeys: readonly string[],
): T {
	if (response.status !== "success") return response;
	const read = readSubmissionHeader(header, languageKeys);
	if ("error" in read) return withHeaderWarning(response, read.error);
	const headered = prependSubmissionHeader(response.sourceCode, read.text);
	return withHeaderLines({...response, sourceCode: headered.sourceCode}, headered.lines, read.name);
}

/** ヘッダーを読めなかったことを、警告として足す。ヘッダーは実行に要らないので、処理は止めない。 */
function withHeaderWarning<T extends LocalRunnerTransformResponse>(response: T, error: string): T {
	const warning = `${error.replace(/\.?$/, ".")} The header was not added. Fix it with setheader, or use --no-header.`;
	return {...response, warnings: [...response.warnings ?? [], warning]};
}

/**
 * ヘッダーを1回だけ読んでから、変換、ヘッダーの付与、コンパイルを行う(prepare)。
 * 読めなければ、ヘッダーを付けずに続けて警告を返す。コンパイルの間にファイルが変わっても、読んだ文で付ける。
 * prepare は、変換したソースの先頭にヘッダーを付けてからコンパイルする。
 */
export async function prepareWithSubmissionHeader(
	sourceCode: string,
	header: LocalRunnerHeaderOption,
	languageKeys: readonly string[],
	prepare: (sourceCode: string, header: string | null) => Promise<LocalRunnerPrepareResponse>,
): Promise<LocalRunnerPrepareResponse> {
	const read = readSubmissionHeader(header, languageKeys);
	if ("error" in read) return withHeaderWarning(await prepare(sourceCode, null), read.error);
	const response = await prepare(sourceCode, read.text);
	// 付けた行数は prepare が数える(変換のあとに付けるので、元のソースがヘッダーで始まっていれば付けない)
	const lines = response.lineOffset?.header ?? 0;
	return lines > 0 ? {...response, header: {name: read.name, lines}} : response;
}
