import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {stripAnsi} from "../utils/color";
import {formatCompileSummary} from "../utils/formatter";
import {ensureHeaderUnit} from "./headerUnit";
import {CanceledError, type ProcessOutcome, runCommand, runMeasured} from "./processRunner";

/** コンパイルと実行をコマンドで行う言語。設定の languages から作る。 */
export type CommandLanguage = {
	/** 設定での名前。要求の compilerName と --lang で使う。 */
	readonly name: string;
	/** 処理系の実体。PATH から探した結果か、設定に書かれたパス。 */
	readonly command: string;
	readonly sourceFile: string;
	/** null ならコンパイルしない。 */
	readonly compile: readonly string[] | null;
	readonly run: readonly string[];
	readonly debugArgs: readonly string[];
	readonly debugRewrite: boolean;
	readonly stackBytes: number;
	readonly headerUnit: boolean;
	/** ソースを標準入力で受け、変換したソースを標準出力へ返すコマンド。 */
	readonly bundle: readonly string[] | null;
};

export type EngineOptions = {
	/** プログラムごとの作業フォルダを作る場所。 */
	readonly rootDir: string;
	readonly headerUnitCacheDir: string;
	readonly compileTimeoutMs: number;
	readonly runTimeoutMs: number;
	readonly outputLimitBytes: number;
	readonly maxPrograms: number;
	readonly launcher: string | null;
	readonly log: (message: string) => void;
};

export type TransformResult =
	| {readonly ok: true; readonly sourceCode: string}
	| {readonly ok: false; readonly diagnostics: string};

export type PrepareResult =
	| {readonly status: "success"; readonly programId: string; readonly sourceCode: string}
	| {readonly status: "compileError"; readonly diagnostics: string; readonly sourceCode: string};

type Program = {
	readonly language: CommandLanguage;
	readonly dir: string;
	readonly result: PrepareResult;
};

/** 実行の結果と、そのプログラムの言語の名前、実行を始めた時刻(Date.now() の値)。 */
export type RunOutcome = ProcessOutcome & {readonly language: string; readonly startedAt: number};

/** コンパイルに成功した作業フォルダに置く印。サーバーを起動し直したあとも、この印があれば使い回す。 */
const COMPILED_MARKER = ".compiled";

type Placeholders = {
	readonly command: string;
	readonly source: string;
	readonly output: string;
	readonly dir: string;
};

/** 引数の中の {command} などを置き換える。先頭の `~/` はホームにする。 */
export function expandArguments(template: readonly string[], values: Placeholders): string[] {
	return template.map((argument) => {
		const expanded = argument.replace(/\{(command|source|output|dir)\}/g, (_match, name: keyof Placeholders) => values[name]);
		return expanded.startsWith("~/") ? path.join(os.homedir(), expanded.slice(2)) : expanded;
	});
}

const DEBUG_ASSIGNMENT = /^([ \t]*[\w \t]*\bDEBUG\b[ \t]*(?::[ \t]*\w+[ \t]*)?=[ \t]*)(true|false|True|False)\b/m;

/** ソースの最初の `DEBUG = true` を、指定の値に書き換える。Python の `DEBUG: bool = True` にも合う。 */
export function rewriteDebugFlag(sourceCode: string, debug: boolean): string {
	return sourceCode.replace(DEBUG_ASSIGNMENT, (_match, head: string, literal: string) => {
		const capitalized = literal === "True" || literal === "False";
		return head + (capitalized ? (debug ? "True" : "False") : String(debug));
	});
}

/** 一時的なフォルダの場所を、利用者が書いたファイルの名前だけに見えるようにする。 */
function hideDirectory(text: string, dir: string): string {
	return text.replaceAll(`${dir}${path.sep}`, "").replaceAll(dir, ".");
}

function describeFailure(outcome: ProcessOutcome, what: string, timeoutMs: number): string {
	if (outcome.timedOut) return `${what} timed out after ${timeoutMs}ms.\n${outcome.stderr}`.trim();
	const reason = outcome.signal === null ? "" : `${what} was terminated by ${outcome.signal}.\n`;
	return `${reason}${outcome.stderr || outcome.stdout}`.trim() || `${what} failed with exit code ${outcome.exitCode}.`;
}

/** コマンドで動かす言語のコンパイルと実行。コンパイルの結果は、ソースと引数が同じなら使い回す。 */
export class CommandEngine {
	private readonly options: EngineOptions;
	private readonly programs = new Map<string, Promise<Program>>();
	private runQueue: Promise<unknown> = Promise.resolve();
	private nextRunId = 0;

	constructor(options: EngineOptions) {
		this.options = options;
	}

	get size(): number {
		return this.programs.size;
	}

	/** bundle と DEBUG の書き換えを行う。実行の前と、提出物を作るときの両方で通す。 */
	async transformSource(
		language: CommandLanguage,
		sourceCode: string,
		debug: boolean,
		signal?: AbortSignal,
	): Promise<TransformResult> {
		let transformed = sourceCode;
		if (language.bundle !== null) {
			const dir = fs.mkdtempSync(path.join(this.ensureRootDir(), "bundle-"));
			try {
				const values = {command: language.command, source: language.sourceFile, output: "", dir};
				const outcome = await runCommand(expandArguments(language.bundle, values), {
					cwd: dir,
					stdin: sourceCode,
					timeoutMs: this.options.compileTimeoutMs,
					outputLimitBytes: this.options.outputLimitBytes,
					...(signal && {signal}),
				});
				if (outcome.exitCode !== 0 || outcome.timedOut || outcome.stdoutTruncated) {
					return {ok: false, diagnostics: describeFailure(outcome, "The bundle command", this.options.compileTimeoutMs)};
				}
				transformed = outcome.stdout;
			} finally {
				fs.rmSync(dir, {recursive: true, force: true});
			}
		}
		return {ok: true, sourceCode: language.debugRewrite ? rewriteDebugFlag(transformed, debug) : transformed};
	}

	/** ソースを変換してコンパイルし、実行に使う programId を返す。中断されたら CanceledError を投げる。 */
	async prepare(language: CommandLanguage, sourceCode: string, debug: boolean, signal?: AbortSignal): Promise<PrepareResult> {
		const transformed = await this.transformSource(language, sourceCode, debug, signal);
		if (!transformed.ok) return {status: "compileError", diagnostics: transformed.diagnostics, sourceCode};

		const compileTemplate = this.compileTemplate(language, debug);
		const programId = this.programId(language, compileTemplate, transformed.sourceCode);
		let program = this.programs.get(programId);
		if (program) {
			this.options.log(formatCompileSummary(language.name, "CACHED", programId));
		} else {
			program = this.compile(language, compileTemplate, programId, transformed.sourceCode, signal);
			this.programs.set(programId, program);
			// 中断したときや、作業フォルダを作れないなどで失敗した結果は残さず、次の要求でやり直す。
			const pending = program;
			pending.catch(() => {
				if (this.programs.get(programId) === pending) this.programs.delete(programId);
			});
			this.evictOldPrograms();
		}
		return (await program).result;
	}

	/** コンパイル済みのプログラムを実行する。programId を知らなければ null を返す。 */
	async run(programId: string, stdin: string): Promise<RunOutcome | null> {
		const pending = this.programs.get(programId);
		if (!pending) return null;
		const program = await pending;
		if (program.result.status !== "success") return null;
		// 同時に動かすと時間の測定がぶれるので、1つずつ実行する。
		const outcome = this.runQueue.catch(() => null).then(() => this.execute(program, stdin));
		this.runQueue = outcome;
		return {...await outcome, language: program.language.name};
	}

	/** デバッグありの設定で header unit を先に作っておく。失敗しても、最初のコンパイルが遅くなるだけ。 */
	warmUp(language: CommandLanguage): void {
		if (!language.headerUnit) return;
		const started = Date.now();
		ensureHeaderUnit(this.compileTemplate(language, true) ?? [], this.options.headerUnitCacheDir)
			.then(() => this.options.log(`[Setup] Lang=${language.name} Status=OK Time=${Date.now() - started}ms header unit`))
			.catch((error: unknown) => this.options.log(`[Setup] Lang=${language.name} Status=NG header unit: ${(error as Error).message}`));
	}

	/** デバッグの有無を反映した、コンパイルの引数のひな形。{command} だけを先に置き換える。 */
	compileTemplate(language: CommandLanguage, debug: boolean): string[] | null {
		if (language.compile === null) return null;
		const template = debug ? [...language.compile, ...language.debugArgs] : [...language.compile];
		return template.map((argument) => argument.replaceAll("{command}", language.command));
	}

	private ensureRootDir(): string {
		fs.mkdirSync(this.options.rootDir, {recursive: true});
		return this.options.rootDir;
	}

	private programId(language: CommandLanguage, compileTemplate: readonly string[] | null, sourceCode: string): string {
		const digest = crypto.createHash("md5")
			.update(JSON.stringify([language.name, language.command, language.sourceFile, compileTemplate, language.run]))
			.update(sourceCode)
			.digest("hex");
		return `${sourceCode.length.toString(16)}-${digest}`;
	}

	private placeholders(language: CommandLanguage, dir: string): Placeholders {
		return {command: language.command, source: language.sourceFile, output: path.join(dir, "program"), dir};
	}

	private async compile(
		language: CommandLanguage,
		compileTemplate: readonly string[] | null,
		programId: string,
		sourceCode: string,
		signal?: AbortSignal,
	): Promise<Program> {
		const dir = path.join(this.ensureRootDir(), programId);
		const sourceFile = path.join(dir, language.sourceFile);
		const success: Program = {language, dir, result: {status: "success", programId, sourceCode}};
		if (this.isCompiledOnDisk(dir, sourceFile, sourceCode)) {
			this.options.log(formatCompileSummary(language.name, "CACHED", programId));
			return success;
		}
		fs.rmSync(dir, {recursive: true, force: true});
		fs.mkdirSync(dir, {recursive: true});
		fs.writeFileSync(sourceFile, sourceCode, "utf8");
		if (compileTemplate === null) {
			fs.writeFileSync(path.join(dir, COMPILED_MARKER), "");
			return success;
		}

		const compileArguments = expandArguments(compileTemplate, this.placeholders(language, dir));
		if (language.headerUnit) {
			try {
				compileArguments.splice(1, 0, ...await ensureHeaderUnit(compileTemplate, this.options.headerUnitCacheDir));
			} catch (error) {
				this.options.log(`[Setup] Lang=${language.name} Status=NG compiling without a header unit: ${(error as Error).message}`);
			}
		}
		const started = Date.now();
		let outcome: ProcessOutcome;
		try {
			outcome = await runCommand(compileArguments, {
				cwd: dir,
				timeoutMs: this.options.compileTimeoutMs,
				outputLimitBytes: this.options.outputLimitBytes,
				...(signal && {signal}),
			});
		} catch (error) {
			if (error instanceof CanceledError) {
				this.options.log(formatCompileSummary(language.name, "CANCELED", programId, Date.now() - started));
				fs.rmSync(dir, {recursive: true, force: true});
			}
			throw error;
		}
		const elapsed = Date.now() - started;
		if (outcome.exitCode === 0 && !outcome.timedOut) {
			fs.writeFileSync(path.join(dir, COMPILED_MARKER), "");
			this.options.log(formatCompileSummary(language.name, "OK", programId, elapsed));
			return success;
		}
		this.options.log(formatCompileSummary(language.name, "NG", programId, elapsed));
		// 端末でなくても色を付ける処理系があるので、色の指定を除く
		const diagnostics = stripAnsi(hideDirectory(describeFailure(outcome, "Compilation", this.options.compileTimeoutMs), dir));
		return {language, dir, result: {status: "compileError", diagnostics, sourceCode}};
	}

	/** 前回の起動でコンパイルした結果が、同じソースのまま残っているか。 */
	private isCompiledOnDisk(dir: string, sourceFile: string, sourceCode: string): boolean {
		try {
			return fs.existsSync(path.join(dir, COMPILED_MARKER)) && fs.readFileSync(sourceFile, "utf8") === sourceCode;
		} catch {
			return false;
		}
	}

	private async execute({language, dir}: Program, stdin: string): Promise<ProcessOutcome & {startedAt: number}> {
		const startedAt = Date.now();
		const outcome = await runMeasured(expandArguments(language.run, this.placeholders(language, dir)), {
			cwd: dir,
			stdin,
			timeoutMs: this.options.runTimeoutMs,
			outputLimitBytes: this.options.outputLimitBytes,
			stackBytes: language.stackBytes,
			launcher: this.options.launcher,
			reportFile: path.join(dir, `report-${++this.nextRunId}.txt`),
		});
		return {...outcome, stderr: hideDirectory(outcome.stderr, dir), startedAt};
	}

	private evictOldPrograms(): void {
		while (this.programs.size > this.options.maxPrograms) {
			const [oldestId, oldest] = this.programs.entries().next().value ?? [];
			if (oldestId === undefined || oldest === undefined) return;
			this.programs.delete(oldestId);
			void oldest.then(({dir}) => fs.rmSync(dir, {recursive: true, force: true})).catch(() => null);
		}
	}
}
