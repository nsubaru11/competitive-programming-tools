import type {HttpClient, HttpRequest, HttpResponse} from "@application/ports/services";

/** ログイン状態を保ったまま、表示中のサイトと通信する。別のサイトへは送らない。 */
export class SameOriginHttpClient implements HttpClient {
	async send({url, method = "GET", headers, body}: HttpRequest): Promise<HttpResponse> {
		if (new URL(url, location.href).origin !== location.origin) throw new Error(`Cross-origin request: ${url}`);
		const response = await fetch(url, {
			method,
			credentials: "include",
			...(headers && {headers: {...headers}}),
			...(body !== undefined && {body}),
		});
		return {status: response.status, text: await response.text()};
	}
}
