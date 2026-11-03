import {createTranslator} from "@catalog/messages";
import type {FeatureServices} from "@application/feature/definition";
import type {KeyValueStore, StoredValue} from "@application/ports/key-value-store";
import type {PageBridge} from "@application/ports/page-bridge";
import type {Logger} from "@application/ports/logger";
import type {PageLifecycle} from "@application/ports/page-lifecycle";
import type {HttpClient, HttpRequest, HttpResponse, Ticker} from "@application/ports/services";

export class MemoryStore implements KeyValueStore {
	private readonly values = new Map<string, unknown>();
	private readonly listeners = new Map<string, (value: unknown) => void>();

	get(key: string): unknown {
		return this.values.get(key);
	}

	set(key: string, value: StoredValue): void {
		this.values.set(key, value);
	}

	subscribeRemote(key: string, listener: (value: unknown) => void): () => void {
		this.listeners.set(key, listener);
		return () => this.listeners.delete(key);
	}

	/** 別のタブで値が変わった状況を再現する。 */
	changeRemotely(key: string, value: unknown): void {
		this.values.set(key, value);
		this.listeners.get(key)?.(value);
	}
}

export const immediateLifecycle: PageLifecycle = {
	reach: () => Promise.resolve(),
};

export class RecordingLogger implements Logger {
	readonly errors: string[] = [];

	error(message: string): void {
		this.errors.push(message);
	}
}

/** 決めた応答を順に返す通信。送信内容も記録する。 */
export class FakeHttpClient implements HttpClient {
	readonly requests: HttpRequest[] = [];
	private readonly respond: (request: HttpRequest) => HttpResponse;

	constructor(respond: (request: HttpRequest) => HttpResponse) {
		this.respond = respond;
	}

	async send(request: HttpRequest): Promise<HttpResponse> {
		this.requests.push(request);
		return this.respond(request);
	}
}

export function createFakePage(overrides: Partial<PageBridge> = {}): PageBridge {
	return {
		onChange: () => undefined,
		triggerChange: () => undefined,
		renderMath: () => undefined,
		highlightCode: () => undefined,
		contestPeriod: () => null,
		serverNow: () => Date.now(),
		isLoggedIn: () => true,
		...overrides,
	};
}

/** 時間を進める代わりに、テストから呼び出す。 */
export class FakeTicker implements Ticker {
	readonly listeners = new Set<() => void>();

	start(_intervalMs: number, listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	tick(): void {
		for (const listener of this.listeners) listener();
	}
}

/** テストで渡していないサービスを使うと失敗するようにする。 */
export function createFakeServices(overrides: Partial<FeatureServices> = {}): FeatureServices {
	const services: Partial<FeatureServices> = {
		translate: createTranslator(() => "ja"),
		isOnRoute: () => false,
		judge: null,
		state: new MemoryStore(),
		...overrides,
	};
	return new Proxy(services, {
		get(target, key) {
			if (key in target) return target[key as keyof FeatureServices];
			throw new Error(`Unexpected use of service: ${String(key)}`);
		},
	}) as FeatureServices;
}
