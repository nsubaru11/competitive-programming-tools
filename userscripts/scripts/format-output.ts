import {format, type Options, type ParserOptions} from "prettier";
import * as babel from "prettier/plugins/babel";

const PRETTIER_OPTIONS: Options = {
	parser: "babel",
	useTabs: true,
	tabWidth: 4,
	printWidth: 120,
	bracketSpacing: false,
	endOfLine: "lf",
	embeddedLanguageFormatting: "off",
};

type Insertion = {readonly position: number; readonly text: string};

/** Prettier の Babel パーサーが返す ESTree 風の構文木。使う項目だけを宣言する。 */
type SyntaxNode = {
	readonly type: string;
	readonly start: number;
	readonly end: number;
	readonly kind?: string;
	readonly body?: SyntaxNode | readonly SyntaxNode[];
	readonly directives?: readonly SyntaxNode[];
	readonly [key: string]: unknown;
};

const BLANK_LINE_TYPES = new Set(["FunctionDeclaration", "ClassDeclaration", "ClassMethod", "ClassPrivateMethod"]);
const SKIPPED_KEYS = new Set(["loc", "comments", "leadingComments", "trailingComments", "innerComments", "extra"]);

function isSyntaxNode(value: unknown): value is SyntaxNode {
	return typeof value === "object" && value !== null && typeof (value as {type?: unknown}).type === "string";
}

function hasBlankLinesAround(node: SyntaxNode): boolean {
	return BLANK_LINE_TYPES.has(node.type);
}

/** 文の並びとクラスの要素の並び。指令(`"use strict"` など)も文として数える。 */
function childrenOf(node: SyntaxNode): readonly SyntaxNode[] {
	const {body} = node;
	if (node.type === "Program" || node.type === "BlockStatement" || node.type === "StaticBlock") {
		const statements = Array.isArray(body) ? body : [];
		return [...(node.directives ?? []), ...statements].sort((a, b) => a.start - b.start);
	}
	if (node.type === "ClassDeclaration" || node.type === "ClassExpression") {
		return isSyntaxNode(body) && Array.isArray(body.body) ? body.body : [];
	}
	return [];
}

function forEachChild(node: SyntaxNode, visit: (child: SyntaxNode) => void): void {
	for (const [key, value] of Object.entries(node)) {
		if (SKIPPED_KEYS.has(key)) continue;
		if (Array.isArray(value)) {
			for (const item of value) if (isSyntaxNode(item)) visit(item);
		} else if (isSyntaxNode(value)) {
			visit(value);
		}
	}
}

/** Prettier が揃えない2点を、IDE の整形に合わせて補う。関数の前後の空行と、空のブロックの改行。 */
async function applyIdeLayout(code: string): Promise<string> {
	// 構文木を得るだけなので、整形の設定は渡さない
	const file = await babel.parsers.babel.parse(code, {} as ParserOptions) as SyntaxNode;
	const lineStarts = [0];
	for (let index = code.indexOf("\n"); index !== -1; index = code.indexOf("\n", index + 1)) lineStarts.push(index + 1);
	const lineOf = (position: number): number => {
		let low = 0;
		let high = lineStarts.length - 1;
		while (low < high) {
			const middle = (low + high + 1) >> 1;
			if ((lineStarts[middle] ?? 0) <= position) low = middle;
			else high = middle - 1;
		}
		return low;
	};
	const lineAfter = (position: number): number => lineStarts[lineOf(position) + 1] ?? code.length;
	const indentAt = (position: number): string => {
		const lineStart = lineStarts[lineOf(position)] ?? 0;
		return /^\t*/.exec(code.slice(lineStart))?.[0] ?? "";
	};

	const insertions: Insertion[] = [];
	const visit = (node: SyntaxNode): void => {
		if (node.type === "BlockStatement" && node.end - node.start === 2) {
			insertions.push({position: node.end - 1, text: `\n${indentAt(node.end)}`});
		}
		const children = childrenOf(node);
		children.forEach((child, index) => {
			const previous = children[index - 1];
			if (!previous || !(hasBlankLinesAround(child) || hasBlankLinesAround(previous))) return;
			const position = lineAfter(previous.end);
			if (code[position] !== "\n") insertions.push({position, text: "\n"});
		});
		forEachChild(node, visit);
	};
	visit(file);

	const parts: string[] = [];
	let copied = 0;
	for (const {position, text} of insertions.sort((a, b) => a.position - b.position)) {
		parts.push(code.slice(copied, position), text);
		copied = position;
	}
	return parts.join("") + code.slice(copied);
}

/** ビルドの出力を、ソースと同じ書式に整形する。 */
export async function formatOutput(code: string): Promise<string> {
	return applyIdeLayout(await format(code, PRETTIER_OPTIONS));
}
