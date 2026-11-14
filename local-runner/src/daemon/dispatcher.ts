import {type ChildProcessWithoutNullStreams, spawn} from "node:child_process";
import readline from "node:readline";
import type {CompilerDiagnostic} from "@atcoder-tools/shared";
import type {CompileEntry, DispatcherRunResult} from "../types";
import {RUNNER_CONFIG} from "../config";
import * as logging from "../utils/logging";
import * as compiler from "./compiler";
import {EMBEDDED_FILES, readEmbeddedText} from "./embedded";
import fs from "node:fs";

export interface DispatcherCompileResult {
	kind: "compile";
	exitCode: number;
	diagnostics: string;
	diagnosticItems?: CompilerDiagnostic[];
	requiresIsolation?: boolean;
	timedOut?: boolean;
}

export interface DispatcherTransformResult {
	kind: "transform";
	exitCode: number;
	sourceCode: string;
	diagnostics: string;
	inlinedClasses: string[];
	addedImports: string[];
	diagnosticItems: CompilerDiagnostic[];
	timedOut?: boolean;
}

type DispatcherResponse = DispatcherRunResult | DispatcherCompileResult | DispatcherTransformResult;

interface PendingRequest {
	id: string;
	resolve: (value: DispatcherResponse) => void;
	reject: (error: Error) => void;
}

const dispatcherState: {
	proc: ChildProcessWithoutNullStreams | null;
	readline: readline.Interface | null;
	startupPromise: Promise<void> | null;
	currentRequest: PendingRequest | null;
	requestQueue: Promise<unknown>;
	nextRequestId: number;
} = {
	proc: null,
	readline: null,
	startupPromise: null,
	currentRequest: null,
	requestQueue: Promise.resolve(null),
	nextRequestId: 0,
};

let hasDispatcherWarmedUp = false;

function encodeField(value: string) {
	return Buffer.from(value ?? "", "utf8").toString("base64");
}

function decodeField(value: string) {
	return Buffer.from(value, "base64").toString("utf8");
}

async function buildWarmUpSourceCode() {
	let sourceCode: string;
	try {
		sourceCode = await readEmbeddedText(EMBEDDED_FILES.warmUpSource) ?? fs.readFileSync(RUNNER_CONFIG.warmUpSourceFile, "utf8");
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`failed to load ${RUNNER_CONFIG.warmUpSourceFile}: ${message}`);
	}

	const classDeclarationPattern = new RegExp(
		`public\\s+final\\s+class\\s+${RUNNER_CONFIG.warmUpSourceClassName}\\b`,
	);
	if (!classDeclarationPattern.test(sourceCode)) {
		throw new Error(`class declaration not found in ${RUNNER_CONFIG.warmUpSourceFile}`);
	}
	return sourceCode;
}

/** 常駐 Dispatcher(JVM) が起動中かどうか（status 表示用）。 */
export function isDispatcherRunning() {
	return dispatcherState.proc !== null;
}

export function stopDispatcher() {
	if (dispatcherState.readline) {
		dispatcherState.readline.close();
		dispatcherState.readline = null;
	}
	if (dispatcherState.proc) {
		dispatcherState.proc.kill("SIGKILL");
		dispatcherState.proc = null;
	}
	if (dispatcherState.currentRequest) {
		dispatcherState.currentRequest.reject(new Error("Dispatcher stopped while a request was running."));
		dispatcherState.currentRequest = null;
	}
}

function handleDispatcherResponse(line: string) {
	const parts = line.split("\t");
	const responseType = parts[0];
	if (responseType === "PONG" || responseType === "RUN") return;
	const pendingRequest = dispatcherState.currentRequest;
	// 応答以外の行が混ざった JVM は通信を信頼できないので、作り直して以降の要求を巻き込まない。
	if (!pendingRequest) {
		logging.logWarn(`[Dispatcher] Unexpected response without a pending request: ${line}`);
		stopDispatcher();
		return;
	}
	if (parts[1] !== pendingRequest.id) {
		pendingRequest.reject(new Error(`Dispatcher response ID mismatch: ${line}`));
		dispatcherState.currentRequest = null;
		stopDispatcher();
		return;
	}
	if (responseType === "RESULT") {
		const stdoutTruncated = Number(parts[6] || "0") !== 0;
		const stderrTruncated = Number(parts[7] || "0") !== 0;
		const leftoverThreads = Number(parts[9] || "0") !== 0;
		pendingRequest.resolve({
			kind: "run",
			exitCode: Number(parts[2]),
			time: Number(parts[3]),
			stdout: decodeField(parts[4] || ""),
			stderr: decodeField(parts[5] || ""),
			stdoutTruncated,
			stderrTruncated,
			memory: Number(parts[8] || "-1"),
		});
		dispatcherState.currentRequest = null;
		// JVM は RESULT の直後に自ら終了する。次の要求が終了中の JVM に届かないよう、ここで切り離す。
		if (leftoverThreads) stopDispatcher();
		return;
	}
	if (responseType === "COMPILED") {
		pendingRequest.resolve({
			kind: "compile",
			exitCode: Number(parts[2]),
			requiresIsolation: Number(parts[3] || "0") !== 0,
			diagnostics: decodeField(parts[4] || ""),
			diagnosticItems: parts[5] ? JSON.parse(decodeField(parts[5])) as CompilerDiagnostic[] : [],
		});
		dispatcherState.currentRequest = null;
		return;
	}
	if (responseType === "TRANSFORMED") {
		pendingRequest.resolve({
			kind: "transform",
			exitCode: Number(parts[2]),
			sourceCode: decodeField(parts[3] || ""),
			diagnostics: decodeField(parts[4] || ""),
			inlinedClasses: decodeField(parts[5] || "").split("\n").filter(Boolean),
			addedImports: decodeField(parts[6] || "").split("\n").filter(Boolean),
			diagnosticItems: parts[7] ? JSON.parse(decodeField(parts[7])) as CompilerDiagnostic[] : [],
		});
		dispatcherState.currentRequest = null;
		return;
	}
	if (responseType === "ERROR") {
		pendingRequest.reject(new Error(decodeField(parts[2] || "")));
		dispatcherState.currentRequest = null;
		return;
	}
	pendingRequest.reject(new Error(`Unknown dispatcher response: ${line}`));
	dispatcherState.currentRequest = null;
}

async function startDispatcher() {
	const classpath = await compiler.prepareDispatcherClasspath();
	await new Promise<void>((resolve, reject) => {
		const proc = spawn(compiler.JAVA_PATH, ["-cp", classpath, "Dispatcher"], {
			cwd: RUNNER_CONFIG.dispatcherBuildDir,
			// 常駐 JVM へは、設定から決めた値を環境変数で渡す。
			env: {
				...compiler.JAVA_ENV,
				LOCAL_RUNNER_JAVAC_RELEASE: compiler.JAVAC_RELEASE,
				LOCAL_RUNNER_RUN_STACK_BYTES: String(RUNNER_CONFIG.runStackBytes),
				LOCAL_RUNNER_CAPTURE_LIMIT_BYTES: String(RUNNER_CONFIG.outputLimitBytes),
			},
			stdio: ["pipe", "pipe", "pipe"],
		});
		const lineReader = readline.createInterface({
			input: proc.stdout,
			crlfDelay: Infinity,
		});
		let settled = false;
		let readyTimer: NodeJS.Timeout | null = null;
		const settleResolve = () => {
			if (settled) {
				return;
			}
			settled = true;
			if (readyTimer) {
				clearTimeout(readyTimer);
			}
			resolve();
		};
		const settleReject = (error: Error) => {
			if (settled) {
				return;
			}
			settled = true;
			if (readyTimer) {
				clearTimeout(readyTimer);
			}
			reject(error);
		};

		dispatcherState.proc = proc;
		dispatcherState.readline = lineReader;

		proc.stderr.on("data", (data) => {
			process.stderr.write(`[Dispatcher] ${data}`);
		});

		lineReader.on("line", (line) => {
			if (!settled) {
				if (line === "READY") {
					settleResolve();
					return;
				}
				settleReject(new Error(`Unexpected dispatcher startup response: ${line}`));
				return;
			}
			handleDispatcherResponse(line);
		});

		proc.on("error", (error) => {
			settleReject(error);
			// このハンドラが現役スロットの proc のものでなければ、グローバル状態には触れない。
			if (dispatcherState.proc === proc && dispatcherState.currentRequest) {
				dispatcherState.currentRequest.reject(error);
				dispatcherState.currentRequest = null;
			}
		});

		proc.on("exit", (code, signal) => {
			if (!settled) {
				settleReject(new Error(`Dispatcher exited before READY (code=${code}, signal=${signal}).`));
			}
			// この exit が「現役スロットに入っている proc」のものでなければ後始末しない。
			// TLE 等で kill→再起動した直後、古い proc の遅延 exit イベントが
			// 新しい proc 参照を null で上書きしてしまう競合を防ぐ（次回実行で
			// dispatcherState.proc.stdin が null になり internalError が連鎖していた）。
			if (dispatcherState.proc !== proc) return;
			if (dispatcherState.currentRequest) {
				dispatcherState.currentRequest.reject(
					new Error(`Dispatcher exited during execution (code=${code}, signal=${signal}).`),
				);
				dispatcherState.currentRequest = null;
			}
			dispatcherState.proc = null;
			if (dispatcherState.readline === lineReader) {
				dispatcherState.readline = null;
			}
		});

		readyTimer = setTimeout(() => {
			proc.kill("SIGKILL");
			settleReject(new Error("Dispatcher startup timed out."));
		}, RUNNER_CONFIG.dispatcherStartupTimeoutMs);
	});
}

export async function ensureDispatcherReady() {
	if (dispatcherState.proc && !dispatcherState.proc.killed) {
		return;
	}
	if (!dispatcherState.startupPromise) {
		dispatcherState.startupPromise = startDispatcher().finally(() => {
			dispatcherState.startupPromise = null;
		});
	}
	await dispatcherState.startupPromise;
}

export async function warmUpDispatcher(librarySourceRoot: string) {
	if (hasDispatcherWarmedUp) {
		return;
	}
	logging.logInfo(
		`Warm up dispatcher and common I/O... repeat=${RUNNER_CONFIG.warmUpRepeatCount} timeout=${RUNNER_CONFIG.warmUpRunTimeoutMs}ms`,
	);
	const warmupSourceCode = await buildWarmUpSourceCode();
	const transformed = await queueDispatcherTransform(warmupSourceCode, librarySourceRoot, false, true, false);
	if (transformed.exitCode !== 0) {
		throw new Error(`[WarmUp] transform failed: ${firstLine(transformed.diagnostics) || "unknown error"}`);
	}
	const warmupEntry = await compiler.getCompiledEntry(transformed.sourceCode);
	if (warmupEntry.status !== "compiled") {
		throw new Error(`[WarmUp] compile failed: ${firstLine(warmupEntry.error) || "unknown error"}`);
	}
	for (let i = 1; i <= RUNNER_CONFIG.warmUpRepeatCount; i++) {
		const result = await queueDispatcherRun(warmupEntry, RUNNER_CONFIG.warmUpStdin, RUNNER_CONFIG.warmUpRunTimeoutMs);
		if (result.timedOut) {
			throw new Error(`[WarmUp] run ${i}/${RUNNER_CONFIG.warmUpRepeatCount} timeout ${RUNNER_CONFIG.warmUpRunTimeoutMs}ms`);
		}
		if (result.exitCode !== 0) {
			const err = firstLine(result.stderr);
			throw new Error(`[WarmUp] run ${i}/${RUNNER_CONFIG.warmUpRepeatCount} runtime error${err ? `: ${logging.trimForLog(err)}` : ""}`);
		}
		logging.logInfo(`[WarmUp] run ${i}/${RUNNER_CONFIG.warmUpRepeatCount} done ${result.time}ms`);
	}
	hasDispatcherWarmedUp = true;
}

export function logCaptureAndBodySizeBalance() {
	if (RUNNER_CONFIG.maxBodySize < RUNNER_CONFIG.outputLimitBytes) {
		logging.logWarn(
			`[Config] MAX_BODY_SIZE (${RUNNER_CONFIG.maxBodySize} bytes) is smaller than run.outputLimitMb (${RUNNER_CONFIG.outputLimitBytes} bytes).`,
		);
	}
}

type DispatcherResultOf<K extends DispatcherResponse["kind"]> = Extract<DispatcherResponse, {kind: K}>;

const COMMAND_BY_KIND = {run: "RUN", compile: "COMPILE", transform: "TRANSFORM"} as const;

/**
 * 要求を1件ずつ Dispatcher へ送る。応答は handleDispatcherResponse が currentRequest へ渡す。
 * 時間切れなら JVM を止めて作り直し、timedOut の結果を返す。
 */
function queueDispatcherRequest<K extends DispatcherResponse["kind"]>(
	kind: K,
	fields: readonly string[],
	timeoutMs: number,
	timedOut: () => DispatcherResultOf<K>,
	onSend?: () => void,
): Promise<DispatcherResultOf<K>> {
	const request = dispatcherState.requestQueue
		.catch(() => null)
		.then(async () => {
			await ensureDispatcherReady();
			return new Promise<DispatcherResultOf<K>>((resolve, reject) => {
				const requestId = String(++dispatcherState.nextRequestId);
				let settled = false;
				let timeoutHandle: NodeJS.Timeout | undefined;
				const settle = (finish: () => void) => {
					if (settled) return;
					settled = true;
					clearTimeout(timeoutHandle);
					finish();
				};
				const release = () => {
					if (dispatcherState.currentRequest?.id === requestId) dispatcherState.currentRequest = null;
				};
				dispatcherState.currentRequest = {
					id: requestId,
					resolve: (value) => settle(() => {
						if (value.kind === kind) {
							resolve(value as DispatcherResultOf<K>);
							return;
						}
						// 要求と違う種類の応答は通信が食い違っているので、JVM を作り直す
						reject(new Error(`Dispatcher returned ${value.kind} for a ${kind} request.`));
						stopDispatcher();
					}),
					reject: (error) => settle(() => reject(error)),
				};
				timeoutHandle = setTimeout(() => {
					release();
					stopDispatcher();
					settle(() => resolve(timedOut()));
				}, timeoutMs);
				const command = [COMMAND_BY_KIND[kind], requestId, ...fields].join("\t");
				onSend?.();
				dispatcherState.proc!.stdin.write(`${command}\n`, "utf8", (error) => {
					if (!error) return;
					release();
					settle(() => reject(error));
				});
			});
		});
	dispatcherState.requestQueue = request;
	return request;
}

export async function queueDispatcherRun(
	entry: CompileEntry,
	standardInput: string,
	timeoutMs = RUNNER_CONFIG.runTimeoutMs,
): Promise<DispatcherRunResult> {
	const fields = [encodeField(entry.classDir), encodeField(entry.mainClass), encodeField(standardInput)];
	let startedAt = Date.now();
	const result = await queueDispatcherRequest("run", fields, timeoutMs, () => ({
		kind: "run",
		timedOut: true,
		error: `Execution timed out after ${timeoutMs}ms.`,
	}), () => {
		startedAt = Date.now();
	});
	return {...result, startedAt};
}

export function queueDispatcherCompile(
	sourceFile: string,
	classDir: string,
	timeoutMs = RUNNER_CONFIG.compileTimeoutMs,
): Promise<DispatcherCompileResult> {
	return queueDispatcherRequest("compile", [encodeField(sourceFile), encodeField(classDir)], timeoutMs, () => ({
		kind: "compile",
		exitCode: 1,
		diagnostics: `Compilation timed out after ${timeoutMs}ms.`,
		requiresIsolation: false,
		timedOut: true,
	}));
}

export function queueDispatcherTransform(
	sourceCode: string,
	librarySourceRoot: string,
	debug: boolean,
	autoImport = true,
	validate = true,
	timeoutMs = RUNNER_CONFIG.compileTimeoutMs,
): Promise<DispatcherTransformResult> {
	const flag = (value: boolean) => (value ? "1" : "0");
	const fields = [encodeField(sourceCode), encodeField(librarySourceRoot), flag(debug), flag(autoImport), flag(validate)];
	return queueDispatcherRequest("transform", fields, timeoutMs, () => ({
		kind: "transform",
		exitCode: 1,
		sourceCode,
		inlinedClasses: [],
		addedImports: [],
		diagnosticItems: [],
		diagnostics: `Transformation timed out after ${timeoutMs}ms.`,
		timedOut: true,
	}));
}

function firstLine(text: string | null | undefined) {
	if (!text) return "";
	return String(text).replace(/\r\n?/g, "\n").split("\n")[0].trim();
}
