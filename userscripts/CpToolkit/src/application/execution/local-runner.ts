import {
	type LocalRunnerCompilerInfo,
	type LocalRunnerHeaderOption,
	type LocalRunnerRequest,
	type LocalRunnerRunResponse,
	type LocalRunnerTransformResponse,
} from "@atcoder-tools/shared";
import type {HttpClient} from "@application/ports/services";

const TRANSFORM_TIMEOUT_MS = 30_000;

export class LocalRunnerError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

/** Local Runner との通信。URL は設定から毎回取得し、未設定なら通信しない。 */
export class LocalRunnerClient {
	private readonly http: HttpClient;
	private readonly endpoint: () => string | null;

	constructor(http: HttpClient, endpoint: () => string | null) {
		this.http = http;
		this.endpoint = endpoint;
	}

	isAvailable(): boolean {
		return this.endpoint() !== null;
	}

	list(): Promise<LocalRunnerCompilerInfo[]> {
		return this.post({mode: "list"});
	}

	transform(sourceCode: string, header: LocalRunnerHeaderOption): Promise<LocalRunnerTransformResponse> {
		const request = {
			mode: "transform",
			sourceCode,
			debug: false,
			autoImport: true,
			validate: false,
			header
		} as const;
		return this.post(request, TRANSFORM_TIMEOUT_MS);
	}

	/**
	 * 編集中のソースを、先にコンパイルしておく。サーバーは受け付けだけをすぐに返す。
	 * compilerName は list で返された識別子で、サーバーが言語を選ぶのに使う。
	 */
	async precompile(sourceCode: string, compilerName?: string): Promise<void> {
		await this.post({mode: "precompile", sourceCode, ...(compilerName !== undefined && {compilerName}), debug: true});
	}

	/** ソースを実行する。サーバーはコンパイルが終わるのを待ってから実行し、コンパイルエラーも実行の結果として返す。 */
	run(sourceCode: string, input: string, compilerName?: string): Promise<LocalRunnerRunResponse> {
		return this.post({mode: "run", sourceCode, ...(compilerName !== undefined && {compilerName}), stdin: input, debug: true});
	}

	/** 実行はサンプルの数だけ順番に待つことがあるので、既定では時間を制限しない。 */
	private async post<T>(request: LocalRunnerRequest, timeoutMs?: number): Promise<T> {
		const url = this.endpoint();
		if (url === null) throw new LocalRunnerError("Local Runner is not configured.", 0);
		const response = await this.http.send({
			url,
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(request),
			timeoutMs,
		});
		if (response.status < 200 || response.status >= 300) {
			throw new LocalRunnerError(`Local Runner returned ${response.status}.`, response.status);
		}
		return JSON.parse(response.text) as T;
	}
}
