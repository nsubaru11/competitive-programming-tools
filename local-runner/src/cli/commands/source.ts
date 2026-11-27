import fs from "node:fs";
import path from "node:path";
import * as shared from "@atcoder-tools/shared";
import {SETTINGS} from "../../config";
import * as ensureServer from "../ensureServer";
import {languageForFile, resolveSourceFile, type SourceLanguage} from "../language";
import {requestRunner} from "../../runnerClient";
import * as color from "../../utils/color";

/** コンパイル済みのプログラム。サーバーから消えていたら、refresh で作り直す。 */
export type PreparedProgram = {
	readonly current: {readonly id: string};
	readonly maxParallelRuns: number;
	/** 同じソースをコンパイルし直し、新しい programId を返す。 */
	readonly refresh: (stale?: PreparedProgram["current"]) => Promise<string>;
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

function formatLines(lines: number): string {
	return lines > 0 ? `+${lines}` : String(lines);
}

/**
 * 実行したソースで増えた行数を、利用者への1行の案内にする。増えていなければ null。
 * 意味と使い方(エラーの行番号から引く、Java のコンパイルエラーはヘッダーの分だけ)は README に書く。
 */
export function describeLineOffset(offset: shared.LocalRunnerLineOffset | undefined, isJava = false): string | null {
	if (!offset) return null;
	const parts: string[] = [];
	if (offset.header !== 0) parts.push(`header ${formatLines(offset.header)}`);
	// Java は字句を読み切れないとき、ほかの言語は bundle を通したときに分からない
	if (offset.transform === null) parts.push(isJava ? "imports (unknown)" : "bundle (unknown)");
	else if (offset.transform !== 0) parts.push(`imports ${formatLines(offset.transform)}`);
	return parts.length === 0 ? null : `Line offset: ${parts.join(", ")}.`;
}

/** AtCoder が受け付けるソースの大きさの上限。 */
const ATCODER_SOURCE_LIMIT_BYTES = 512 * 1024;

/** 行数。末尾の改行の後は数えない。 */
function countLines(text: string): number {
	return text === "" ? 0 : text.replace(/\n$/, "").split("\n").length;
}

function formatLineCount(text: string): string {
	const lines = countLines(text);
	return lines === 1 ? "1 line" : `${lines} lines`;
}

function formatKiB(bytes: number): string {
	return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KiB`;
}

/**
 * 変換の結果を、利用者への案内の行にする。元のソースから変えたこと、付けたヘッダー、足した import、
 * 展開したクラスと元のファイル、元と最終のソースの行数と大きさ。分からない項目は出さない。
 */
export function describeTransform(result: ServerResult, originalFileName: string, originalSource: string): string[] {
	const lines: string[] = [];
	const summary = result.summary;
	const changes: string[] = [];
	if (summary?.entryName && summary.entryName !== "Main") changes.push(`${summary.entryName} -> Main`);
	if (summary?.debugFlag) changes.push(`${summary.debugFlag.name} = ${summary.debugFlag.value} (line ${summary.debugFlag.line})`);
	if (summary?.packageRemoved) changes.push("package removed");
	if (summary?.bundleCommand) changes.push("bundle command");
	if (changes.length > 0) lines.push(`Transform: ${changes.join(", ")}`);
	if (result.header) lines.push(`Header: ${result.header.name} (${result.header.lines === 1 ? "1 line" : `${result.header.lines} lines`})`);
	if (summary?.addedImports && summary.addedImports.length > 0) lines.push(`Added imports: ${summary.addedImports.join(", ")}`);
	if (result.inlinedClasses.length > 0) {
		const files = summary?.bundledFiles ?? [];
		lines.push(`Bundled: ${result.inlinedClasses.map((name, i) => files[i] ? `${name} (${files[i]})` : name).join(", ")}`);
	}
	if (result.status === "success") {
		const bytes = Buffer.byteLength(result.sourceCode, "utf8");
		const over = bytes > ATCODER_SOURCE_LIMIT_BYTES ? ` (over the AtCoder limit of ${formatKiB(ATCODER_SOURCE_LIMIT_BYTES)})` : "";
		lines.push(`Source: ${originalFileName} ${formatLineCount(originalSource)} -> ${formatLineCount(result.sourceCode)}, ${formatKiB(bytes)}${over}`);
	}
	return lines;
}

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
): Promise<{source: PreparedSource; maxParallelRuns: number; result: ServerResult; request: () => Promise<ServerResult>}> {
	const resolvedSourcePath = resolveSourceFile(SETTINGS, sourceFilePath, process.cwd(), lang);
	const language = languageForFile(SETTINGS, resolvedSourcePath, lang);
	const sourceText = shared.normalizeNewlines(fs.readFileSync(resolvedSourcePath, "utf8"));
	const server = await ensureServer.ensureLocalRunnerReady();
	const fields = {sourceCode: sourceText, compilerName: language.name, debug, validate, header};
	const request = () => requestRunner<ServerResult>({mode, ...fields}, "Local Runner transform failed");

	const originalFileName = path.basename(resolvedSourcePath);
	const restoreNames = createNameRestorer(language, originalFileName);
	const result = await request();
	// ヘッダーのファイルが無いなど、続けたが知らせることは警告の色で出す
	for (const warning of result.warnings ?? []) console.log(color.colorizeWarning(`Warning: ${warning}`, "cli"));
	for (const line of describeTransform(result, originalFileName, sourceText)) {
		console.log(line.includes("over the AtCoder limit") ? color.colorizeWarning(line, "cli") : line);
	}
	// 実行するもの(prepare)だけ、エラーの行番号が元のソースからずれる行数を示す
	const offset = mode === "prepare" ? describeLineOffset(result.lineOffset, language.isJava) : null;
	if (offset) console.log(offset);
	if (result.status !== "success") {
		// Java の診断は元ソースと展開後の Main.java のどちらからも返るので、javac の名前をそのまま示す。
		const diagnostics = language.isJava ? result.diagnostics : restoreNames(result.diagnostics);
		throw new Error(diagnostics || "The source could not be prepared.");
	}
	const source: PreparedSource = {
		resolvedSourcePath,
		transformed: result.sourceCode,
		originalFileName,
		language,
		inlinedClasses: result.inlinedClasses,
		restoreNames,
	};
	return {source, result, request, maxParallelRuns: language.isJava ? 1 : server.maxParallelRuns ?? 1};
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

/**
 * 実行のためにコンパイルする(run、test、localtest、crosscheck、submit)。
 * どのコマンドも、ライブラリの展開、ヘッダーの付与、コンパイルの順に行い、提出するソースそのもので実行する。ヘッダーは既定で付ける。
 */
export async function compileSource(sourceFilePath: string, debug: boolean, options: SourceOptions = {}): Promise<CompiledSource> {
	const {source, result, request, maxParallelRuns} = await requestSource(sourceFilePath, "prepare", debug, {
		header: options.header ?? true,
		...(options.lang !== undefined && {lang: options.lang}),
		validate: false,
	});
	return {...source, program: preparedProgram(result, request, maxParallelRuns)};
}

function programIdOf(response: ServerResult): string {
	if (response.status !== "success") throw new Error(response.diagnostics || "The source could not be prepared.");
	if (!("programId" in response) || !response.programId) throw new Error("Local Runner did not return a prepared program ID.");
	return response.programId;
}

/**
 * コンパイルしたプログラム。消えていたら request で作り直す。
 * 作り直したソースが最初と違えば(ヘッダーやライブラリのファイルが変わったなど)、試したプログラムと提出物が食い違うので止める。
 */
export function preparedProgram(first: ServerResult, request: () => Promise<ServerResult>, maxParallelRuns = 1): PreparedProgram {
	let current = {id: programIdOf(first)};
	let pending: Promise<string> | undefined;
	return {
		get current() {return current;},
		maxParallelRuns,
		refresh(stale = current) {
			// 同じソースの再準備は同じ ID を返す。送信時のオブジェクトで世代を見分ける。
			if (stale !== current) return Promise.resolve(current.id);
			pending ??= request().then(next => {
				if (next.status === "success" && next.sourceCode !== first.sourceCode) {
					throw new Error("The source changed while running the samples (a header or library file was edited). Run the command again.");
				}
				current = {id: programIdOf(next)};
				return current.id;
			}).finally(() => {pending = undefined;});
			return pending;
		},
	};
}
