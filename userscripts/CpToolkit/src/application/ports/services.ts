import type {ExternalResource} from "@catalog/tables";

export interface Clipboard {
	write(text: string): void;
}

export type Notification = {
	readonly title: string;
	readonly text: string;
	readonly url?: string;
};

export interface Notifier {
	notify(notification: Notification): void;
}

export type HttpRequest = {
	readonly url: string;
	readonly method?: "GET" | "POST";
	readonly headers?: Readonly<Record<string, string>>;
	readonly body?: string;
	readonly timeoutMs?: number | undefined;
};

export type HttpResponse = {
	readonly status: number;
	readonly text: string;
};

export interface HttpClient {
	send(request: HttpRequest): Promise<HttpResponse>;
}

/** 一定の間隔で処理を呼び、止めるための関数を返す。 */
export interface Ticker {
	start(intervalMs: number, listener: () => void): () => void;
}

/**
 * 問題文の要素を、コピー用の文字列に変換する。要素の子だけを変換し、要素自身のタグは含めない。
 * application は DOM の型を持たないので、要素は object として受け取る。
 */
export interface StatementConverter {
	toMarkdown(element: object): string;

	toPlainText(element: object): string;
}

/** ページの文脈で動くライブラリを読み込む。 */
export interface ScriptLoader {
	loadScript(resource: ExternalResource): Promise<void>;

	loadStylesheet(resource: ExternalResource): Promise<void>;
}
