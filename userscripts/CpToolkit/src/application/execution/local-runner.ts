import {
	buildLocalRunnerListRequest,
	buildLocalRunnerPrepareRequest,
	buildLocalRunnerProgramRunRequest,
	buildLocalRunnerRunRequest,
	buildLocalRunnerTransformRequest,
	type LocalRunnerCompilerInfo,
	type LocalRunnerHeaderOption,
	type LocalRunnerPrepareResponse,
	type LocalRunnerRequest,
	type LocalRunnerRunResponse,
	type LocalRunnerTransformResponse,
} from "@atcoder-tools/shared";
import type {HttpClient} from "@application/ports/services";

const TRANSFORM_TIMEOUT_MS = 30_000;
const STALE_PROGRAM_MESSAGE = "Prepared program is unavailable:";

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
		compilerName: string;
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
		return this.post(buildLocalRunnerListRequest());
	}

	transform(sourceCode: string, header: LocalRunnerHeaderOption): Promise<LocalRunnerTransformResponse> {
		return this.post(buildLocalRunnerTransformRequest(sourceCode, false, true, false, header), TRANSFORM_TIMEOUT_MS);
	}

	/** 同じソースはコンパイルし直さない。 */
	prepare(sourceCode: string, compilerName: string): Promise<LocalRunnerPrepareResponse> {
		const endpoint = this.endpoint() ?? "";
		const previous = this.prepared;
		if (previous?.endpoint === endpoint && previous.compilerName === compilerName && previous.sourceCode === sourceCode) {
			return previous.response;
		}
		const request = buildLocalRunnerPrepareRequest(sourceCode, true, true, false, false, compilerName);
		const response = this.post<LocalRunnerPrepareResponse>(request);
		this.prepared = {endpoint, compilerName, sourceCode, response};
		response.catch(() => {
			if (this.prepared?.response === response) this.prepared = null;
		});
		return response;
	}

	/** コンパイル済みのプログラムを実行する。古いサーバーには、ソースをそのまま渡す。 */
	async run(
		sourceCode: string,
		input: string,
		compilerName: string,
	): Promise<LocalRunnerRunResponse | LocalRunnerPrepareResponse> {
		let prepared: LocalRunnerPrepareResponse;
		try {
			prepared = await this.prepare(sourceCode, compilerName);
		} catch (error) {
			if (error instanceof LocalRunnerError && error.status === 400) {
				return this.post(buildLocalRunnerRunRequest(sourceCode, input, compilerName));
			}
			throw error;
		}
		if (prepared.status !== "success" || !prepared.programId) return prepared;
		const response = await this.runProgram(prepared.programId, input, compilerName);
		if (response.status !== "badRequest" || !response.stderr?.startsWith(STALE_PROGRAM_MESSAGE)) return response;

		this.prepared = null;
		prepared = await this.prepare(sourceCode, compilerName);
		if (prepared.status !== "success" || !prepared.programId) return prepared;
		return this.runProgram(prepared.programId, input, compilerName);
	}

	private runProgram(programId: string, input: string, compilerName: string): Promise<LocalRunnerRunResponse> {
		return this.post(buildLocalRunnerProgramRunRequest(programId, input, compilerName));
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
