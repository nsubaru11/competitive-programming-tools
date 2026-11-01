import type {
	Clipboard,
	HttpClient,
	HttpRequest,
	HttpResponse,
	Notification,
	Notifier,
} from "@application/ports/services";

export class GmClipboard implements Clipboard {
	write(text: string): void {
		GM_setClipboard(text);
	}
}

export class GmNotifier implements Notifier {
	notify({title, text, url}: Notification): void {
		// 通知のクリックはページの操作ではないので、window.open だとブロックされる
		GM_notification({title, text, ...(url !== undefined && {onclick: () => GM_openInTab(url, {active: true})})});
	}
}

/** ページの CORS や Local Network Access の制限を受けない通信。Cookie は送らない。 */
export class GmHttpClient implements HttpClient {
	send({url, method = "GET", headers, body, timeoutMs}: HttpRequest): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				url,
				method,
				anonymous: true,
				...(headers && {headers: {...headers}}),
				...(body !== undefined && {data: body}),
				...(timeoutMs !== undefined && {timeout: timeoutMs}),
				onload: ({status, responseText}) => resolve({status, text: responseText}),
				onerror: () => reject(new Error(`Request failed: ${url}`)),
				ontimeout: () => reject(new Error(`Request timed out: ${url}`)),
			});
		});
	}
}
