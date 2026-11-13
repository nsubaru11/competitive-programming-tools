import type {LocalRunnerRequest} from "@atcoder-tools/shared";
import {CLI_CONFIG} from "../config";

/** CLI だけが使う、サーバーの管理用の要求。 */
type ManagementRequest = {mode: "status"} | {mode: "shutdown"};

/** Local Runner のサーバーへ要求を送る。timeoutMs を省くと応答まで待つ。接続できなければ例外になる。 */
export function postToRunner(request: LocalRunnerRequest | ManagementRequest, timeoutMs?: number): Promise<Response> {
	return fetch(CLI_CONFIG.defaultLocalRunnerUrl, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(request),
		...(timeoutMs === undefined ? {} : {signal: AbortSignal.timeout(timeoutMs)}),
	});
}

/** 要求を送り、2xx 以外なら例外にして JSON を返す。サーバーが理由を返していれば、それを例外のメッセージにする。 */
export async function requestRunner<T>(request: LocalRunnerRequest, failure: string): Promise<T> {
	const response = await postToRunner(request);
	if (!response.ok) {
		const reason = await response.json().then((body) => (body as {stderr?: unknown} | null)?.stderr).catch(() => undefined);
		throw new Error(typeof reason === "string" && reason !== "" ? reason : `${failure}: ${response.status}`);
	}
	return await response.json() as T;
}
