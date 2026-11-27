import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {RunSlots} from "../utils/runSlots";
import {stripAnsi} from "../utils/color";
import {formatCompileSummary} from "../utils/formatter";
import type {CommandLanguageSettings} from "../settings/settings";
import {CompilerSetup, setupCacheKey} from "./compilerSetup";
import {kotlinRunArguments} from "./kotlinRuntime";
import {isProgramId, ProgramCache} from "./programCache";
import {canRewriteDebugFlag, DEBUG_FLAG_FAMILIES, rewriteDebugFlag} from "@atcoder-tools/shared";
import {CanceledError, type ProcessOutcome, runCommand, runCompiler, runMeasured} from "./processRunner";

/** コンパイルと実行をコマンドで行う言語。設定の languages から作る。 */
export type CommandLanguage = {
	readonly family: string;
	/** 設定での名前。要求の compilerName と --lang で使う。 */
	readonly name: string;
	/** 処理系の実体。PATH から探した結果か、設定に書かれたパス。 */
	readonly command: string;
	readonly sourceFile: string;
	/** null ならコンパイルしない。 */
	readonly compile: readonly string[] | null;
	readonly compileSearchPath?: string;
	readonly warmup?: readonly string[] | undefined;
	readonly run: readonly string[];
	readonly debugArgs: readonly string[];
	/** デバッグの有無に合わせて値を書き換える変数の名前。null なら書き換えない。 */
	readonly debugFlag: string | null;
	readonly stackBytes: number;
	readonly setup?: CommandLanguageSettings["setup"];
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
	readonly maxParallelRuns: number;
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
	runTemplate?: Promise<readonly string[]>;
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
	private readonly programs: ProgramCache<Program>;
	private readonly slots: RunSlots;
	private readonly setup: CompilerSetup;

	constructor(options: EngineOptions) {
		this.options = options;
		this.slots = new RunSlots(options.maxParallelRuns);
		this.setup = new CompilerSetup(options);
		this.programs = new ProgramCache<Program>({
			limit: () => options.maxPrograms,
			// 作業フォルダが消えていれば、覚えていてもコンパイルし直す
			usable: ({dir, result}) => result.status !== "success" || fs.existsSync(path.join(dir, COMPILED_MARKER)),
			evict: ({dir}) => fs.rmSync(dir, {recursive: true, force: true}),
		});
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
		if (language.debugFlag === null) return {ok: true, sourceCode: transformed};
		if (!canRewriteDebugFlag(language.family)) {
			return {ok: false, diagnostics: `debugFlag is not supported for the language family ${language.family}. Supported: ${DEBUG_FLAG_FAMILIES.join(", ")}.`};
		}
		const rewritten = rewriteDebugFlag(transformed, language.debugFlag, debug, language.family);
		return rewritten === null
			? {ok: false, diagnostics: `${language.debugFlag} is assigned on more than one line, so it was not rewritten. Assign it on one line.`}
			: {ok: true, sourceCode: rewritten};
	}

	/**
	 * ソースを変換してコンパイルし、実行に使う programId を返す。中断されたら CanceledError を投げる。
	 * finish は、変換したソースをコンパイルの前に仕上げる(ヘッダーを付けるなど)。
	 */
	async prepare(
		language: CommandLanguage,
		sourceCode: string,
		debug: boolean,
		signal?: AbortSignal,
		finish: (transformed: string) => string = (transformed) => transformed,
	): Promise<PrepareResult> {
		const result = await this.transformSource(language, sourceCode, debug, signal);
		if (!result.ok) return {status: "compileError", diagnostics: result.diagnostics, sourceCode};
		const transformed = {sourceCode: finish(result.sourceCode)};

		const compileTemplate = this.compileTemplate(language, debug);
		const programId = this.programId(language, compileTemplate, transformed.sourceCode);
		// 中断したときや、作業フォルダを作れないなどで失敗した結果は残さず、次の要求でやり直す。
		const program = await this.programs.get(
			programId,
			() => this.compile(language, compileTemplate, programId, transformed.sourceCode, signal),
			() => this.options.log(formatCompileSummary(language.name, "CACHED", programId)),
		);
		return program.result;
	}

	/** その programId のプログラムを覚えていて、作業フォルダも残っているか。 */
	has(programId: string): boolean {
		return this.programs.has(programId) && isProgramId(programId) && fs.existsSync(path.join(this.options.rootDir, programId, COMPILED_MARKER));
	}

	/** コンパイル済みのプログラムを実行する。programId を知らないか、作業フォルダが消えていれば null を返す。 */
	async run(programId: string, stdin: string): Promise<RunOutcome | null> {
		return this.programs.use(programId, async (program) => {
			if (program.result.status !== "success") return null;
			const outcome = await this.slots.run(() => this.execute(program, stdin));
			return {...outcome, language: program.language.name};
		});
	}

	/** 解答の内容によらない準備を、サーバーの起動中に済ませる。 */
	async warmUp(language: CommandLanguage): Promise<void> {
		await this.setup.warmUp(language, [this.compileTemplate(language, true) ?? [], this.compileTemplate(language, false) ?? []]);
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
			.update(setupCacheKey(language))
			.update(language.compileSearchPath === undefined ? "" : JSON.stringify(["PATH", language.compileSearchPath]))
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
		await this.setup.configure(language, compileTemplate, compileArguments);
		const started = Date.now();
		let outcome: ProcessOutcome;
		try {
			outcome = await runCompiler(compileArguments, {
				cwd: dir,
				timeoutMs: this.options.compileTimeoutMs,
				outputLimitBytes: this.options.outputLimitBytes,
				...(signal && {signal}),
			}, language.compileSearchPath);
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

	private async execute(program: Program, stdin: string): Promise<ProcessOutcome & {startedAt: number}> {
		const {language, dir} = program;
		// run の相対パスはケース専用の作業場所を起点にする。ビルド時に生成した補助ファイルも引き継ぐ。
		const work = await fs.promises.mkdtemp(path.join(this.options.rootDir, "run-"));
		try {
			await fs.promises.cp(dir, work, {recursive: true, mode: fs.constants.COPYFILE_FICLONE, verbatimSymlinks: true});
			let template = language.run;
			if (language.setup === "builtin:kotlin-runtime") {
				program.runTemplate ??= kotlinRunArguments(template, dir, this.options.compileTimeoutMs,
					arg => expandArguments([arg], this.placeholders(language, dir))[0]!).catch(error => {
					delete program.runTemplate;
					throw error;
				});
				template = await program.runTemplate;
			}
			const args = expandArguments(template, this.placeholders(language, work));
			const startedAt = Date.now();
			const outcome = await runMeasured(args, {
				cwd: work,
				stdin,
				timeoutMs: this.options.runTimeoutMs,
				outputLimitBytes: this.options.outputLimitBytes,
				stackBytes: language.stackBytes,
				launcher: this.options.launcher,
				reportFile: work + ".report",
			});
			return {...outcome, stderr: hideDirectory(outcome.stderr, work), startedAt};
		} finally {
			await fs.promises.rm(work, {recursive: true, force: true});
		}
	}
}
