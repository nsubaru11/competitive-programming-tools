import http from "node:http";
import os from "node:os";
import {pathToFileURL} from "node:url";
import {
	type LocalRunnerCompilerInfo,
	type LocalRunnerHeaderOption,
	type LocalRunnerPrepareResponse,
	type LocalRunnerRunResponse,
	type LocalRunnerTransformResponse,
	STALE_PROGRAM_MESSAGE,
	usesJavaLibrary,
} from "@atcoder-tools/shared";
import type {CompileEntry, RunnerStatusInfo} from "../types";
import * as config from "../config";
import {legacyEnvironmentWarnings, serverSettingsDigest} from "../settings/settings";
import * as filesystem from "../utils/filesystem";
import * as formatter from "../utils/formatter";
import * as color from "../utils/color";
import * as logging from "../utils/logging";
import {CommandEngine, type CommandLanguage} from "./commandEngine";
import * as compiler from "./compiler";
import * as dispatcher from "./dispatcher";
import {applySubmissionHeader} from "./header";
import {pruneHeaderUnits} from "./headerUnit";
import {resolveLanguages, type RunnerLanguage} from "./languages";
import {PreparationQueue, type PrepareFunction} from "./preparationQueue";
import {CanceledError, ensureLauncher, type ProcessOutcome} from "./processRunner";
import {ALLOWED_ORIGIN_HOSTS, isAllowedOrigin} from "./origin";

const serverStartedAt = Date.now();
// 覚えておくコンパイルの結果の数。言語ごとの実行環境が持つコンパイル結果の数と揃える。
const PREPARE_CACHE_MAX = 10;
// 事前コンパイルと、実行の前のコンパイルは、言語によらず同じ条件で行う。CLI の prepare と同じ条件にして結果を共有する。
const RUN_PREPARE_OPTIONS = {autoImport: true, validate: false} as const;

const EXTRA_ORIGINS = config.SETTINGS.server.extraOrigins;

// 使える言語は、起動時に設定から決める。
let runnerLanguages: readonly RunnerLanguage[] = [];
let skippedLanguages: ReadonlyArray<{readonly name: string; readonly reason: string}> = [];
let commandEngine: CommandEngine | null = null;

/** 要求の内容が正しくないことを表す。400 として返す。 */
class BadRequestError extends Error {
}

function findLanguage(name: string): RunnerLanguage | undefined {
	return runnerLanguages.find((candidate) => candidate.name === name);
}

/** 使えない言語を「名前 (理由)」の形で並べる。 */
function describeSkippedLanguages(): string[] {
	return skippedLanguages.map(({name, reason}) => `${name} (${reason})`);
}

/** 要求の compilerName から言語を決める。省略されていれば Java にする。 */
function requireLanguage(compilerName: unknown): RunnerLanguage {
	const name = typeof compilerName === "string" && compilerName !== "" ? compilerName : "java";
	const language = findLanguage(name);
	if (language) return language;
	const reason = skippedLanguages.find((candidate) => candidate.name === name)?.reason;
	throw new BadRequestError(reason ? `The language "${name}" is not available: ${reason}.` : `Unknown language: "${name}".`);
}

/** 言語の既定のヘッダーを探す名前。言語の名前、種類の順に探す。 */
function headerKeys(language: RunnerLanguage): string[] {
	return [...new Set([language.name, language.family])];
}

const NO_JAVA_TRANSFORM = {inlinedClasses: [], addedImports: [], diagnosticItems: []};

async function transformCommandCode(language: CommandLanguage, sourceCode: string, debug: boolean): Promise<LocalRunnerTransformResponse> {
	const result = await commandEngine!.transformSource(language, sourceCode, debug);
	return result.ok
		? {...NO_JAVA_TRANSFORM, status: "success", sourceCode: result.sourceCode, diagnostics: ""}
		: {...NO_JAVA_TRANSFORM, status: "compileError", sourceCode, diagnostics: result.diagnostics};
}

async function prepareCommandCode(
	language: CommandLanguage,
	sourceCode: string,
	debug: boolean,
	signal: AbortSignal,
): Promise<LocalRunnerPrepareResponse> {
	const result = await commandEngine!.prepare(language, sourceCode, debug, signal);
	return result.status === "success"
		? {...NO_JAVA_TRANSFORM, status: "success", sourceCode: result.sourceCode, diagnostics: "", programId: result.programId}
		: {...NO_JAVA_TRANSFORM, status: "compileError", sourceCode: result.sourceCode, diagnostics: result.diagnostics};
}

function toRunResponse(outcome: ProcessOutcome): LocalRunnerRunResponse {
	const base = {
		stdout: outcome.stdout,
		stdoutTruncated: outcome.stdoutTruncated,
		stderrTruncated: outcome.stderrTruncated,
		memory: 0,
		peakMemory: outcome.peakMemoryKb,
	};
	if (outcome.timedOut) {
		const timeoutMs = config.RUNNER_CONFIG.runTimeoutMs;
		return {
			...base,
			status: "timeLimitExceeded",
			exitCode: 124,
			stderr: `Execution timed out after ${timeoutMs}ms.\n${outcome.stderr}`.trim(),
			time: timeoutMs
		};
	}
	if (outcome.signal !== null) {
		const signalNumber = (os.constants.signals as Record<string, number>)[outcome.signal] ?? 0;
		return {
			...base,
			status: "runtimeError",
			exitCode: 128 + signalNumber,
			stderr: `${outcome.stderr}${outcome.stderr && !outcome.stderr.endsWith("\n") ? "\n" : ""}Terminated by ${outcome.signal}.`,
			time: outcome.timeMs,
		};
	}
	return {
		...base,
		status: outcome.exitCode === 0 ? "success" : "runtimeError",
		exitCode: outcome.exitCode,
		stderr: outcome.stderr,
		time: outcome.timeMs,
	};
}

/**
 * コマンドで動かす言語のプログラムを実行する。programId がその言語のものでなければ null を返す。
 * receivedAt は、サーバーが実行の要求を受け取った時刻。
 */
async function runCommandProgram(programId: string, stdin: string, receivedAt: number): Promise<LocalRunnerRunResponse | null> {
	if (commandEngine === null) return null;
	const outcome = await commandEngine.run(programId, stdin);
	if (outcome === null) return null;
	const response = toRunResponse(outcome);
	const logger = response.status === "success" ? logging.logInfo : logging.logWarn;
	logger(formatter.formatRunSummary(response, outcome.startedAt - receivedAt, Date.now() - receivedAt, "process", outcome.language));
	return response;
}

/** 言語に合った経路で、変換とコンパイルを行う。コンパイルの順番待ちの中から呼ばれる。 */
const prepareInQueue: PrepareFunction = async (name, sourceCode, {debug, autoImport, validate}, signal) => {
	const language = findLanguage(name);
	if (!language) throw new Error(`Unknown language: "${name}".`);
	return language.command === null
		? prepareCode(sourceCode, debug, autoImport, validate, signal)
		: prepareCommandCode(language.command, sourceCode, debug, signal);
};

const preparations = new PreparationQueue(prepareInQueue, PREPARE_CACHE_MAX);

const LIBRARY_MISSING_HINT = "The Java library is not loaded. Set its folder with setlib <path>, then restart Local Runner with stop and serve.";

async function transformCode(sourceCode: string, debug: boolean, autoImport = true,
	validate = true): Promise<LocalRunnerTransformResponse> {
	const result = await dispatcher.queueDispatcherTransform(sourceCode, config.resolveLibrarySourceRoot(), debug, autoImport, validate);
	const libraryMissing = result.exitCode !== 0 && config.loadedLibrarySource() === null && usesJavaLibrary(sourceCode);
	return {
		status: result.exitCode === 0 ? "success" : "compileError",
		sourceCode: result.sourceCode,
		diagnostics: libraryMissing ? `${LIBRARY_MISSING_HINT}\n${result.diagnostics}` : result.diagnostics,
		libraryMissing,
		inlinedClasses: result.inlinedClasses,
		addedImports: result.addedImports,
		diagnosticItems: result.diagnosticItems,
	};
}

/** Java の変換とコンパイル。常駐 JVM の中の処理は止められないので、中断は区切りごとに確かめる。 */
async function prepareCode(
	sourceCode: string,
	debug: boolean,
	autoImport: boolean,
	validate: boolean,
	signal: AbortSignal,
): Promise<LocalRunnerPrepareResponse> {
	const transformed = await transformCode(sourceCode, debug, autoImport, validate);
	if (transformed.status !== "success") return transformed;
	if (signal.aborted) throw new CanceledError();

	const entry = await compiler.getCompiledEntry(transformed.sourceCode);
	if (entry.status === "error") {
		return {
			...transformed,
			status: "compileError",
			diagnostics: entry.error || "Java compilation failed.",
		};
	}
	return {...transformed, programId: compiler.getProgramId(transformed.sourceCode)};
}

/** 実行の結果が無いときの応答。 */
function notRunResponse(status: LocalRunnerRunResponse["status"], exitCode: number, stderr: string, time = 0): LocalRunnerRunResponse {
	return {status, exitCode, stdout: "", stderr, time, stdoutTruncated: false, stderrTruncated: false, memory: 0};
}

function missingProgramResponse(programId: string): LocalRunnerRunResponse {
	return notRunResponse("badRequest", -1, `${STALE_PROGRAM_MESSAGE} ${programId}`);
}

/** コンパイルエラーを実行の応答にして、記録する。Wait と Total は、コンパイルを待った時間になる。 */
function compileErrorResponse(diagnostics: string, language: string, receivedAt: number): LocalRunnerRunResponse {
	const response = notRunResponse("compileError", 1, diagnostics);
	const waitTime = Date.now() - receivedAt;
	logging.logWarn(formatter.formatRunSummary(response, waitTime, waitTime, "compile", language));
	return response;
}

/**
 * ソースを実行する。そのソースのコンパイルが終わるのを待ち、コンパイルエラーなら実行の応答として返す。
 * 事前コンパイルの結果があれば、それを使う。
 */
async function runSource(
	language: RunnerLanguage,
	sourceCode: string,
	stdin: string,
	debug: boolean,
	receivedAt: number,
): Promise<LocalRunnerRunResponse> {
	const options = {...RUN_PREPARE_OPTIONS, debug};
	// コンパイルの結果が追い出されていたら、作り直して1回だけやり直す
	for (let attempt = 0; attempt < 2; attempt++) {
		const prepared = await preparations.wait(language.name, sourceCode, options);
		if (prepared.status !== "success" || !prepared.programId) {
			return compileErrorResponse(prepared.diagnostics, language.name, receivedAt);
		}
		const response = await runProgram(prepared.programId, stdin, receivedAt);
		if (response) return response;
		preparations.forget(language.name, sourceCode, options);
	}
	return missingProgramResponse("(recompiled program)");
}

/** コンパイル済みのプログラムを実行する。プログラムが見つからなければ null を返す。 */
async function runProgram(programId: string, stdin: string, receivedAt: number): Promise<LocalRunnerRunResponse | null> {
	const commandResponse = await runCommandProgram(programId, stdin, receivedAt);
	if (commandResponse) return commandResponse;
	const entry = await compiler.getCompiledEntryByProgramId(programId);
	return entry === null ? null : runJavaEntry(entry, stdin, receivedAt);
}

async function runJavaEntry(entry: CompileEntry, stdin: string, receivedAt: number): Promise<LocalRunnerRunResponse> {
	if (entry.status === "error") return compileErrorResponse(entry.error || "", "java", receivedAt);

	if (entry.requiresIsolatedProcess) {
		logging.logInfo("[Run] Falling back to isolated JVM mode due to FileDescriptor/System.exit/Runtime.halt usage.");
		const startedAt = Date.now();
		const result = await compiler.runCodeInIsolatedJvm(entry, stdin);
		logging.logInfo(formatter.formatRunSummary(result, startedAt - receivedAt, Date.now() - receivedAt, "isolated", "java"));
		return result;
	}

	// 実行が始まる前に失敗したときは、失敗するまで待った時間を Wait にする
	let waitTime: number | null = null;
	try {
		const result = await dispatcher.queueDispatcherRun(entry, stdin);
		waitTime = (result.startedAt ?? receivedAt) - receivedAt;
		if (result.timedOut) {
			const response = notRunResponse("timeLimitExceeded", 124, result.error || "", config.RUNNER_CONFIG.runTimeoutMs);
			logging.logWarn(formatter.formatRunSummary(response, waitTime, Date.now() - receivedAt, "daemon", "java"));
			return response;
		}
		const totalTime = Date.now() - receivedAt;
		if (result.stdoutTruncated || result.stderrTruncated) {
			logging.logWarn(
				`[Run] Output truncated by dispatcher (stdout=${result.stdoutTruncated}, stderr=${result.stderrTruncated}).`,
			);
		}
		const response: LocalRunnerRunResponse = {
			status: result.exitCode === 0 ? "success" : "runtimeError",
			exitCode: result.exitCode ?? -1,
			stdout: result.stdout || "",
			stderr: result.stderr || "",
			time: result.time || 0,
			stdoutTruncated: !!result.stdoutTruncated,
			stderrTruncated: !!result.stderrTruncated,
			// Java は累積アロケーション量をバイトで返す（-1=計測不可）。表示系は KB 想定なので KB に変換。
			memory: result.memory && result.memory > 0 ? Math.round(result.memory / 1024) : 0,
		};
		const logger = response.status === "success" ? logging.logInfo : logging.logWarn;
		logger(formatter.formatRunSummary(response, waitTime, totalTime, "daemon", "java"));
		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logging.logError(`[Run] Internal error: ${message}`);
		const response = notRunResponse("internalError", -1, message);
		const totalTime = Date.now() - receivedAt;
		logging.logError(formatter.formatRunSummary(response, waitTime ?? totalTime, totalTime, "daemon", "java"));
		return response;
	}
}

/**
 * 応答のヘッダーだけを先に返す。本文の JSON は、あとから続けて送る(JSON は先頭の空白を読み飛ばす)。
 * Tampermonkey は応答のヘッダーが届くまで次の要求を送らないので、実行がコンパイルを待つ間に、
 * CP Toolkit のほかの要求(実行の候補の取得など)が止まらないようにする。
 */
function sendHeadersEarly(res: http.ServerResponse): void {
	res.writeHead(200, {"Content-Type": "application/json"});
	res.write("\n");
}

const server = http.createServer(async (req, res) => {
	// 実行の記録の Wait は、この時刻から数える
	const receivedAt = Date.now();
	// CORS/Origin ゲート。ブラウザからの要求は Origin ヘッダを必ず伴うため、
	// 許可した競プロジャッジのサイト以外からの実行を「実処理の前に」拒否する。
	// （悪意あるサイトの単純 POST は応答を読めないだけで副作用＝任意コード実行は起きてしまうため、
	//   CORS 応答ヘッダだけでなくサーバ側で 403 を返して実行そのものを止める必要がある。）
	// Origin ヘッダの無い要求（CLI/bun の fetch 等、非ブラウザ）は従来どおり許可する。
	const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
	const originAllowed = isAllowedOrigin(origin, EXTRA_ORIGINS);
	if (origin && originAllowed) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Vary", "Origin");
	}
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (!originAllowed) {
		logging.logWarn(`[Server] Rejected request from disallowed origin: ${origin}`);
		res.writeHead(403, {"Content-Type": "text/plain"});
		res.end("Forbidden origin");
		return;
	}

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	if (req.method !== "POST") {
		res.writeHead(405);
		res.end("Method Not Allowed");
		return;
	}

	let body = "";
	let size = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buffer.length;
		if (size > config.RUNNER_CONFIG.maxBodySize) {
			res.writeHead(413, {"Content-Type": "text/plain"});
			res.end("Request Entity Too Large");
			return;
		}
		body += buffer.toString("utf8");
	}

	let request: {
		mode?: string; sourceCode?: string; programId?: string; stdin?: string; debug?: boolean;
		autoImport?: boolean; validate?: boolean; header?: LocalRunnerHeaderOption; compilerName?: unknown
	};
	try {
		request = JSON.parse(body) as {mode?: string; sourceCode?: string; stdin?: string};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		res.writeHead(400, {"Content-Type": "application/json"});
		res.end(JSON.stringify({status: "badRequest", stderr: `Invalid JSON: ${message}`}));
		return;
	}

	if (!request || typeof request !== "object" || Array.isArray(request)) {
		res.writeHead(400, {"Content-Type": "application/json"});
		res.end(JSON.stringify({status: "badRequest", stderr: "Request body must be a JSON object."}));
		return;
	}

	try {
		let response;
		if (request.mode === "list") {
			response = runnerLanguages.map(({name, family, displayName, label, match}) => {
				return {language: displayName, compilerName: name, label, family, match: [...match]};
			}) satisfies LocalRunnerCompilerInfo[];
		} else if (request.mode === "precompile" && typeof request.sourceCode === "string") {
			// 結果は待たずに受け付けだけを返す。コンパイルは順番待ちにし、実行の要求が来たら結果を使う。
			const language = requireLanguage(request.compilerName);
			preparations.schedule(language.name, request.sourceCode, {...RUN_PREPARE_OPTIONS, debug: request.debug !== false});
			response = {status: "accepted"};
		} else if (request.mode === "transform" && typeof request.sourceCode === "string") {
			const language = requireLanguage(request.compilerName);
			response = applySubmissionHeader(
				language.command === null
					? await transformCode(request.sourceCode, !!request.debug, request.autoImport !== false, request.validate !== false)
					: await transformCommandCode(language.command, request.sourceCode, !!request.debug),
				request.header ?? true,
				headerKeys(language),
			);
		} else if (request.mode === "prepare" && typeof request.sourceCode === "string") {
			const language = requireLanguage(request.compilerName);
			const options = {debug: !!request.debug, autoImport: request.autoImport !== false, validate: request.validate === true};
			// コンパイルはヘッダーなしで行い、ローカル実行の行番号を元ソースと揃える。
			response = applySubmissionHeader(
				await preparations.wait(language.name, request.sourceCode, options),
				request.header ?? false,
				headerKeys(language),
			);
		} else if (request.mode === "run" && typeof request.sourceCode === "string") {
			const language = requireLanguage(request.compilerName);
			sendHeadersEarly(res);
			response = await runSource(language, request.sourceCode, request.stdin ?? "", request.debug !== false, receivedAt);
		} else if (request.mode === "run" && typeof request.programId === "string") {
			// programId だけの実行は、プログラムから言語が決まる。
			sendHeadersEarly(res);
			response = await runProgram(request.programId, request.stdin ?? "", receivedAt) ?? missingProgramResponse(request.programId);
		} else if (request.mode === "status") {
			response = {
				status: "running",
				pid: process.pid,
				uptimeMs: Date.now() - serverStartedAt,
				javaVersion: compiler.JAVA_VERSION,
				runnerLabel: compiler.RUNNER_LABEL,
				dispatcherRunning: dispatcher.isDispatcherRunning(),
				librarySource: config.loadedLibrarySource(),
				languages: runnerLanguages.map(({name}) => name),
				skippedLanguages: describeSkippedLanguages(),
				compileCacheSize: compiler.getCompileCacheSize(),
				compileCacheMax: config.RUNNER_CONFIG.maxCacheSize,
				settingsFile: config.SETTINGS_FILE,
				settingsDigest: serverSettingsDigest(config.SETTINGS),
				baseDir: config.RUNNER_CONFIG.baseDir,
				logFile: config.LOG_FILE_PATH,
			} satisfies RunnerStatusInfo;
		} else if (request.mode === "shutdown") {
			res.writeHead(200, {"Content-Type": "application/json", "Connection": "close"});
			res.end(JSON.stringify({status: "accepted"}));
			logging.logInfo("Shutdown requested via API.");
			setTimeout(() => shutdown("api"), 50);
			return;
		} else {
			res.writeHead(400, {"Content-Type": "application/json"});
			res.end(JSON.stringify({status: "badRequest", stderr: `Unknown mode: ${String(request.mode)}`}));
			return;
		}

		if (!res.headersSent) res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify(response));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (res.headersSent) {
			res.end(JSON.stringify({status: "internalError", stderr: message}));
			return;
		}
		const badRequest = error instanceof BadRequestError;
		res.writeHead(badRequest ? 400 : 500, {"Content-Type": "application/json"});
		res.end(JSON.stringify({status: badRequest ? "badRequest" : "internalError", stderr: message}));
	}
});

/** 設定から使える言語を決め、コマンドで動かす言語の実行環境を用意する。 */
async function prepareLanguages(): Promise<void> {
	const resolved = resolveLanguages(config.SETTINGS, compiler.RUNNER_LABEL, config.resolveConfiguredPath, process.platform === "linux");
	runnerLanguages = resolved.languages;
	skippedLanguages = resolved.skipped;
	logging.logInfo(`Languages: ${runnerLanguages.map(({name}) => name).join(", ")}`);
	if (skippedLanguages.length > 0) {
		logging.logInfo(`Languages not available: ${describeSkippedLanguages().join(", ")}`);
	}
	const commandLanguages = runnerLanguages.flatMap(({command}) => (command === null ? [] : [command]));
	if (commandLanguages.length === 0) return;

	// 起動プログラムは C で書いてあるので、C か C++ のコンパイラでビルドする。
	const compilerCandidates = ["cc", "gcc", ...commandLanguages.map(({command}) => command).filter((command) => /(?:cc|\+\+|clang)[^/]*$/.test(command))];
	const launcher = await ensureLauncher(config.RUNNER_CONFIG.launcherSourceFile, config.RUNNER_CONFIG.launcherFile, compilerCandidates);
	if (launcher === null) {
		logging.logWarn("No C compiler was found, so memory is measured less precisely: values below about 20 MB are not reliable. Install gcc to fix this.");
	}
	const engine = new CommandEngine({
		rootDir: config.RUNNER_CONFIG.programRootDir,
		headerUnitCacheDir: config.RUNNER_CONFIG.headerUnitCacheDir,
		compileTimeoutMs: config.RUNNER_CONFIG.compileTimeoutMs,
		runTimeoutMs: config.RUNNER_CONFIG.runTimeoutMs,
		outputLimitBytes: config.RUNNER_CONFIG.outputLimitBytes,
		maxPrograms: config.RUNNER_CONFIG.maxCacheSize,
		launcher,
		log: logging.logInfo,
	});
	commandEngine = engine;
	const headerUnitLanguages = commandLanguages.filter(({headerUnit}) => headerUnit);
	pruneHeaderUnits(
		config.RUNNER_CONFIG.headerUnitCacheDir,
		headerUnitLanguages.flatMap((language) => [true, false].map((debug) => engine.compileTemplate(language, debug) ?? [])),
	);
	for (const language of headerUnitLanguages) engine.warmUp(language);
}

async function bootstrap() {
	for (const warning of legacyEnvironmentWarnings(process.env, config.SETTINGS_FILE)) logging.logWarn(warning);
	if (compiler.JAVA_VERSION === "Unknown") {
		throw new Error(`Java was not found: ${compiler.JAVA_PATH}. Install a JDK, or write its java command in "languages.java.command" of ${config.SETTINGS_FILE}.`);
	}
	filesystem.ensureDirectory(config.RUNNER_CONFIG.baseDir);
	filesystem.ensureDirectory(config.RUNNER_CONFIG.compileRootDir);
	const libraryRoots = config.prepareLibrarySourceRoot();
	logging.logInfo(`Settings file: ${config.SETTINGS_FILE}`);
	logging.logInfo(`Local Runner base directory: ${config.RUNNER_CONFIG.baseDir}`);
	if (libraryRoots.source === null) {
		const configured = config.SETTINGS.languages.java.library;
		logging.logWarn(configured
			? `Java library not found: ${configured}. Starting without it.`
			: "Java library is not set. Starting without it. To use lib.*, run setlib <path>.");
	} else {
		logging.logInfo(`Library source: ${libraryRoots.source}`);
		logging.logInfo(`Prepared library source: ${libraryRoots.prepared}`);
	}
	logging.logInfo(`Log file: ${config.LOG_FILE_PATH}`);
	logging.logInfo(`Log rotation size: ${config.RUNNER_CONFIG.maxLogFileSize} bytes`);
	if (compiler.JAVA_VERSION !== config.TARGET_JAVA_VERSION) {
		logging.logWarn(`Java ${compiler.JAVA_VERSION} differs from the submission target Java ${config.TARGET_JAVA_VERSION}.`);
	}
	logging.logInfo(`Output limit: ${config.RUNNER_CONFIG.outputLimitBytes} bytes`);
	dispatcher.logCaptureAndBodySizeBalance();
	if (process.platform === "linux" && config.RUNNER_CONFIG.baseDir.startsWith("/dev/shm")) {
		logging.logInfo("Using /dev/shm for low-latency compile cache.");
	}
	await prepareLanguages();
	compiler.warmUpJavaTools();
	filesystem.ensureDirectory(config.RUNNER_CONFIG.dispatcherBuildDir);
	await dispatcher.ensureDispatcherReady();
	// WarmUp.java は lib.io を使うので、ライブラリなしでは温めない。最初の実行が遅くなるだけで動作は変わらない。
	if (libraryRoots.source !== null) await dispatcher.warmUpDispatcher(config.resolveLibrarySourceRoot());
	const host = config.RUNNER_CONFIG.host;
	server.listen(config.RUNNER_CONFIG.port, host, () => {
		const message = "✓ Local Runner server is ready:";
		const link = `http://${host}:${config.RUNNER_CONFIG.port}`;
		logging.logInfo(color.supportsRunnerColor() ? `${color.ANSI.GREEN}${message}${color.ANSI.RESET} ${color.ANSI.CYAN}${link}${color.ANSI.RESET}` : `${message} ${link}`);
		logging.logInfo(`Allowed browser origins: ${[...ALLOWED_ORIGIN_HOSTS, ...EXTRA_ORIGINS].join(", ")}`);
		logging.logInfo(`Runner label: ${compiler.RUNNER_LABEL}`);
	});
}

function shutdown(signal: string) {
	logging.logInfo(`Shutting down Local Runner server (${signal})...`);
	dispatcher.stopDispatcher();
	server.close(() => {
		process.exit(0);
	});
	// 接続が残っていても確実にプロセスを終了させる保険。
	setTimeout(() => process.exit(0), 1500).unref();
}

server.on("error", (error) => {
	logging.logError(`[Server] ${error.message}`);
	process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("exit", () => dispatcher.stopDispatcher());

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
	try {
		await bootstrap();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logging.logError(`[Bootstrap] ${message}`);
		process.exit(1);
	}
}
