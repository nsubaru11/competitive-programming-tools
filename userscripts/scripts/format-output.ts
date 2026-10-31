import {format, type Options} from "prettier";
import ts from "typescript";

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

function hasBlankLinesAround(node: ts.Node): boolean {
	return ts.isFunctionDeclaration(node)
		|| ts.isClassDeclaration(node)
		|| ts.isMethodDeclaration(node)
		|| ts.isConstructorDeclaration(node)
		|| ts.isGetAccessorDeclaration(node)
		|| ts.isSetAccessorDeclaration(node);
}

function childrenOf(node: ts.Node): readonly ts.Node[] {
	if (ts.isSourceFile(node) || ts.isBlock(node)) return node.statements;
	return ts.isClassLike(node) ? node.members : [];
}

/** Prettier が揃えない2点を、IDE の整形に合わせて補う。関数の前後の空行と、空のブロックの改行。 */
function applyIdeLayout(code: string): string {
	const source = ts.createSourceFile("output.js", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
	const lineStarts = source.getLineStarts();
	const lineAfter = (position: number): number => {
		return lineStarts[source.getLineAndCharacterOfPosition(position).line + 1] ?? code.length;
	};
	const indentAt = (position: number): string => {
		const lineStart = lineStarts[source.getLineAndCharacterOfPosition(position).line] ?? 0;
		return /^\t*/.exec(code.slice(lineStart))?.[0] ?? "";
	};

	const insertions: Insertion[] = [];
	const visit = (node: ts.Node): void => {
		if (ts.isBlock(node) && node.end - node.getStart(source) === 2) {
			insertions.push({position: node.end - 1, text: `\n${indentAt(node.end)}`});
		}
		const children = childrenOf(node);
		children.forEach((child, index) => {
			const previous = children[index - 1];
			if (!previous || !(hasBlankLinesAround(child) || hasBlankLinesAround(previous))) return;
			const position = lineAfter(previous.end);
			if (code[position] !== "\n") insertions.push({position, text: "\n"});
		});
		ts.forEachChild(node, visit);
	};
	visit(source);

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
