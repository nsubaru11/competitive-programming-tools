export type CommentSyntax = {
	readonly line?: string;
	readonly open?: string;
	readonly close?: string;
	/** コードの先頭に残す部分の正規表現。ヘッダーはこの後ろに置く。 */
	readonly preamble?: string;
	/** コードの末尾に残す部分の正規表現。フッターはこの前に置く。 */
	readonly trailer?: string;
};

export type CommentStyle = "line" | "block";

const SHEBANG_PATTERN = /^#![^\n]*\n/;
const VARIABLE_PATTERN = /\{(\w+)\}/g;
const LINE_BREAK_PATTERN = /\r\n?/g;

/** `{name}` を値に置き換える。値のない名前はそのまま残す。 */
export function fillVariables(text: string, values: Readonly<Record<string, string>>): string {
	return text.replace(VARIABLE_PATTERN, (match, name: string) => (Object.hasOwn(values, name) ? values[name] ?? match : match));
}

/**
 * 文字列をコメントにする。安全に書けなければ null を返す。
 * 複数行コメントを閉じる記号を含む文字列は、単一行コメントで書く。
 */
export function toComment(text: string, {line, open, close}: CommentSyntax, style: CommentStyle): string | null {
	const lines = text.split("\n");
	const canUseBlock = open !== undefined && close !== undefined && !text.includes(close);
	if (canUseBlock && style === "block") return [open, ...lines, close].join("\n");
	if (line !== undefined) return lines.map((item) => (item ? `${line} ${item}` : line)).join("\n");
	return canUseBlock ? lines.map((item) => `${open} ${item} ${close}`).join("\n") : null;
}

/** 貼り付けでコード全体が置き換わったか判定する。 */
export function isWholeCode(code: string, pasted: string): boolean {
	return code.trim() === pasted.replace(LINE_BREAK_PATTERN, "\n").trim();
}

export function insertHeader(code: string, block: string, {preamble}: CommentSyntax): string {
	const head = SHEBANG_PATTERN.exec(code) ?? (preamble === undefined ? null : new RegExp(preamble).exec(code));
	const offset = head?.[0].length ?? 0;
	return `${code.slice(0, offset)}${block}${code.slice(offset)}`;
}

export function insertFooter(code: string, block: string, {trailer}: CommentSyntax): string {
	const end = (trailer === undefined ? null : new RegExp(trailer).exec(code))?.index ?? code.length;
	const body = code.slice(0, end).trimEnd();
	return `${body}${body ? "\n" : ""}${block}${code.slice(end)}`;
}

/** 挿入した部分を置き換える。編集されて見つからなければ null を返す。 */
export function replaceBlock(code: string, current: string, next: string, fromEnd: boolean): string | null {
	const index = fromEnd ? code.lastIndexOf(current) : code.indexOf(current);
	return index < 0 ? null : `${code.slice(0, index)}${next}${code.slice(index + current.length)}`;
}
