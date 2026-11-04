import {
	isStaleProgramResponse,
	type LocalRunnerCompilerInfo,
	type LocalRunnerHeaderOption,
	type LocalRunnerPrepareResponse,
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
	private prepared: {
		endpoint: string;
		compilerName: string | undefined;
		sourceCode: string;
		response: Promise<LocalRunnerPrepareResponse>
	} | null = null;
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
		const request = {mode: "transform", sourceCode, debug: false, autoImport: true, validate: false, header} as const;
		return this.post(request, TRANSFORM_TIMEOUT_MS);
	}

	/** 同じソースはコンパイルし直さない。compilerName は list で返された識別子で、サーバーが言語を選ぶのに使う。 */
	prepare(sourceCode: string, compilerName?: string): Promise<LocalRunnerPrepareResponse> {
		const endpoint = this.endpoint() ?? "";
		const previous = this.prepared;
		if (previous?.endpoint === endpoint && previous.compilerName === compilerName && previous.sourceCode === sourceCode) {
			return previous.response;
		}
		const request = {
			mode: "prepare",
			sourceCode,
			...(compilerName !== undefined && {compilerName}),
			debug: true,
			autoImport: true,
			validate: false,
			header: false,
		} as const;
		const response = this.post<LocalRunnerPrepareResponse>(request);
		this.prepared = {endpoint, compilerName, sourceCode, response};
		response.catch(() => {
			if (this.prepared?.response === response) this.prepared = null;
		});
		return response;
	}

	/** コンパイル済みのプログラムを実行する。サーバーから消えていれば、コンパイルし直して1回だけ実行し直す。 */
	async run(
		sourceCode: string,
		input: string,
		compilerName?: string,
	): Promise<LocalRunnerRunResponse | LocalRunnerPrepareResponse> {
		let prepared = await this.prepare(sourceCode, compilerName);
		if (prepared.status !== "success" || !prepared.programId) return prepared;
		const response = await this.runProgram(prepared.programId, input, compilerName);
		if (!isStaleProgramResponse(response)) return response;

		this.prepared = null;
		prepared = await this.prepare(sourceCode, compilerName);
		if (prepared.status !== "success" || !prepared.programId) return prepared;
		return this.runProgram(prepared.programId, input, compilerName);
	}

	private runProgram(programId: string, input: string, compilerName?: string): Promise<LocalRunnerRunResponse> {
		return this.post({mode: "run", ...(compilerName !== undefined && {compilerName}), programId, stdin: input});
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
