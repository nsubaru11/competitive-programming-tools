import http from "node:http";
import type {LocalRunnerCompilerInfo, LocalRunnerHeaderOption, LocalRunnerHeaderResponse} from "@atcoder-tools/shared";
import type {RunnerStatusInfo} from "../types";
import * as config from "../config";
import {loadedLibrarySource} from "../javaLibrary/prepare";
import {serverSettingsDigest} from "../settings/settings";
import {latestVersion} from "../update/check";
import {VERSION} from "../version";
import * as color from "../utils/color";
import * as logging from "../utils/logging";
import * as compiler from "./compiler";
import * as dispatcher from "./dispatcher";
import {
	availableLanguages,
	BadRequestError,
	describeSkippedLanguages,
	headerKeys,
	prepareSource,
	requireLanguage,
	runProgram,
	runSource,
	schedulePrecompile,
	transformSource,
} from "./execution";
import {applySubmissionHeader, prepareWithSubmissionHeader, resolveSubmissionHeader} from "./header";
import {isAllowedOrigin} from "./origin";
import {missingProgramResponse} from "./runResponse";

// HTTP の受け口。要求を確かめて mode ごとに振り分け、処理は execution.ts に任せる。

const serverStartedAt = Date.now();

const EXTRA_ORIGINS = config.SETTINGS.server.extraOrigins;

type RunnerRequest = {
	mode?: string; sourceCode?: string; programId?: string; stdin?: string; debug?: boolean;
	validate?: boolean; header?: LocalRunnerHeaderOption; compilerName?: unknown
};

/**
 * 応答のヘッダーだけを先に返す。本文の JSON は、あとから続けて送る(JSON は先頭の空白を読み飛ばす)。
 * Tampermonkey は応答のヘッダーが届くまで次の要求を送らないので、実行がコンパイルを待つ間に、
 * CP Toolkit のほかの要求(実行の候補の取得など)が止まらないようにする。
 */
function sendHeadersEarly(res: http.ServerResponse): void {
	res.writeHead(200, {"Content-Type": "application/json"});
	res.write("\n");
}

function statusResponse(): RunnerStatusInfo {
	return {
		status: "running",
		version: VERSION,
		latestVersion: latestVersion(),
		pid: process.pid,
		uptimeMs: Date.now() - serverStartedAt,
		javaVersion: compiler.JAVA_VERSION,
		runnerLabel: compiler.RUNNER_LABEL,
		dispatcherRunning: dispatcher.isDispatcherRunning(),
		librarySource: loadedLibrarySource(),
		languages: availableLanguages().map(({name}) => name),
		skippedLanguages: describeSkippedLanguages(),
		compileCacheSize: compiler.getCompileCacheSize(),
		maxParallelRuns: config.RUNNER_CONFIG.maxParallelRuns,
		compileCacheMax: config.RUNNER_CONFIG.maxCacheSize,
		settingsFile: config.SETTINGS_FILE,
		settingsDigest: serverSettingsDigest(config.SETTINGS),
		baseDir: config.RUNNER_CONFIG.baseDir,
		logFile: config.LOG_FILE_PATH,
	};
}

/** HTTP のサーバーを作る。requestShutdown は、shutdown の要求を受けたときに呼ぶ。 */
export function createRunnerServer(requestShutdown: () => void, isReady = () => true): http.Server {
	return http.createServer(async (req, res) => {
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
			logging.logWarn(color.colorizeWarning(`[Server] Rejected request from disallowed origin: ${origin}`));
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

		let request: RunnerRequest;
		try {
			const chunks: Buffer[] = [];
			let size = 0;
			for await (const chunk of req) {
				const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
				size += buffer.length;
				if (size > config.RUNNER_CONFIG.maxBodySize) {
					res.writeHead(413, {"Content-Type": "text/plain"});
					res.end("Request Entity Too Large");
					return;
				}
				chunks.push(buffer);
			}
			request = JSON.parse(Buffer.concat(chunks, size).toString("utf8")) as RunnerRequest;
		} catch (error) {
			if (res.destroyed) return;
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

		if (!isReady() && request.mode !== "shutdown") {
			res.writeHead(503, {"Content-Type": "application/json"});
			res.end(JSON.stringify({status: "starting", stderr: "Local Runner is starting."}));
			return;
		}

		try {
			let response;
			if (request.mode === "list") {
				response = availableLanguages().map(({name, family, displayName, label, match}) => {
					return {language: displayName, compilerName: name, label, family, match: [...match]};
				}) satisfies LocalRunnerCompilerInfo[];
			} else if (request.mode === "precompile" && typeof request.sourceCode === "string") {
				// 結果は待たずに受け付けだけを返す。コンパイルは順番待ちにし、実行の要求が来たら結果を使う。
				schedulePrecompile(requireLanguage(request.compilerName), request.sourceCode, request.debug !== false);
				response = {status: "accepted"};
			} else if (request.mode === "header") {
				const language = requireLanguage(request.compilerName);
				response = {status: "success", header: resolveSubmissionHeader(request.header ?? true, headerKeys(language))} satisfies LocalRunnerHeaderResponse;
			} else if (request.mode === "transform" && typeof request.sourceCode === "string") {
				const language = requireLanguage(request.compilerName);
				response = applySubmissionHeader(
					await transformSource(language, request.sourceCode, !!request.debug, request.validate !== false),
					request.header ?? true,
					headerKeys(language),
				);
			} else if (request.mode === "prepare" && typeof request.sourceCode === "string") {
				const language = requireLanguage(request.compilerName);
				const options = {debug: !!request.debug, validate: request.validate === true};
				// 展開、ヘッダーの付与、コンパイルの順に行い、提出するソースそのもので実行する。
				response = await prepareWithSubmissionHeader(
					request.sourceCode,
					request.header ?? false,
					headerKeys(language),
					(sourceCode, header) => prepareSource(language, sourceCode, {...options, header}),
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
				response = statusResponse();
			} else if (request.mode === "shutdown") {
				res.writeHead(200, {"Content-Type": "application/json", "Connection": "close"});
				res.end(JSON.stringify({status: "accepted"}));
				logging.logInfo("Shutdown requested via API.");
				setTimeout(requestShutdown, 50);
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
}
