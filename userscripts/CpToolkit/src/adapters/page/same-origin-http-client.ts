import type {HttpClient, HttpRequest, HttpResponse} from "@application/ports/services";

/** ログイン状態を保ったまま、表示中のサイトと通信する。 */
export class SameOriginHttpClient implements HttpClient {
	async send({url, method = "GET", headers, body}: HttpRequest): Promise<HttpResponse> {
		const response = await fetch(url, {method, headers: headers ? {...headers} : undefined, body, credentials: "include"});
		return {status: response.status, text: await response.text()};
	}
}
