import {buildQueryString, sleep, toEasyTestStatus} from "@atcoder-tools/shared";
import {languageCatalog, runnerCatalog} from "@catalog/tables";
import {resolveFamily} from "@domain/execution/language";
import type {JudgeLanguage, RunOptions, RunResult} from "@domain/execution/result";
import type {LocalRunnerClient} from "@application/execution/local-runner";
import type {CodeRunner, RunnerProvider} from "@application/execution/runner-catalog";
import type {HttpClient} from "@application/ports/services";

const PAIZA_STATUS_INTERVAL_MS = 1000;
const PAIZA_MAX_STATUS_CHECKS = 60;

type PaizaCreated = {id: string; status: string};
type PaizaStatus = {status: string};
type PaizaDetails = {
	exit_code: number;
	build_exit_code: number;
	time: string;
	memory: string;
	stdout: string;
	stderr: string;
	build_stdout: string;
	build_stderr: string;
	build_result: string;
	result: string;
};

class PaizaRunner implements CodeRunner {
	readonly kind = "paiza";
	readonly id: string;
	readonly label: string;
	private readonly http: HttpClient;
	private readonly language: string;

	constructor(http: HttpClient, language: string, label: string) {
		this.http = http;
		this.language = language;
		this.id = `paiza:${language}`;
		this.label = `${label} [PaizaIO]`;
	}

	async run(sourceCode: string, input: string): Promise<RunResult> {
		let {id, status} = await this.request<PaizaCreated>("create", {
			source_code: sourceCode,
			language: this.language,
			input,
			longpoll: "true",
			longpoll_timeout: "10",
		}, "POST");
		for (let check = 0; status === "running"; check++) {
			if (check === PAIZA_MAX_STATUS_CHECKS) throw new Error("PaizaIO timed out.");
			await sleep(PAIZA_STATUS_INTERVAL_MS);
			({status} = await this.request<PaizaStatus>("get_status", {id}));
		}
		const details = await this.request<PaizaDetails>("get_details", {id});
		const measured = {execTime: Number(details.time) * 1000, memory: Number(details.memory) / 1000, input};
		if (details.build_result === "failure") {
			return {
				...measured,
				status: "CE",
				exitCode: details.build_exit_code,
				output: details.build_stdout,
				error: details.build_stderr,
			};
		}
		const statusByResult: Readonly<Record<string, string>> = {timeout: "TLE", failure: "RE"};
		return {
			...measured,
			status: statusByResult[details.result] ?? "OK",
			exitCode: details.exit_code,
			output: details.stdout,
			error: details.stderr,
		};
	}

	private async request<T>(path: string, query: Record<string, string>, method: "GET" | "POST" = "GET"): Promise<T> {
		const url = `${runnerCatalog.paiza.apiBase}/${path}?${buildQueryString({...query, api_key: "guest"})}`;
		const response = await this.http.send({url, method});
		return JSON.parse(response.text) as T;
	}
}

export class PaizaRunnerProvider implements RunnerProvider {
	private readonly http: HttpClient;

	constructor(http: HttpClient) {
		this.http = http;
	}

	async runnersFor({family}: JudgeLanguage): Promise<readonly CodeRunner[]> {
		return runnerCatalog.paiza.languages
			.filter((entry) => entry.family === family)
			.map(({language, label}) => new PaizaRunner(this.http, language, label));
	}
}

class LocalCodeRunner implements CodeRunner {
	readonly kind = "local";
	readonly id: string;
	readonly label: string;
	private readonly client: LocalRunnerClient;

	constructor(client: LocalRunnerClient, compilerName: string, label: string) {
		this.client = client;
		this.id = `local:${compilerName}`;
		this.label = `${label} [Local]`;
	}

	prepare(sourceCode: string): Promise<unknown> {
		return this.client.prepare(sourceCode);
	}

	async run(sourceCode: string, input: string): Promise<RunResult> {
		const response = await this.client.run(sourceCode, input);
		if ("diagnostics" in response) {
			return {status: "CE", input, error: response.diagnostics || "LocalRunner prepare failed."};
		}
		return {
			status: toEasyTestStatus(response.status, response.exitCode),
			exitCode: String(response.exitCode),
			execTime: Number(response.time),
			...(response.memory > 0 ? {allocatedMemory: Number(response.memory)} : {}),
			input,
			output: response.stdout ?? "",
			error: response.stderr ?? "",
		};
	}
}

export class LocalRunnerProvider implements RunnerProvider {
	private readonly client: LocalRunnerClient;

	constructor(client: LocalRunnerClient) {
		this.client = client;
	}

	async runnersFor({family}: JudgeLanguage): Promise<readonly CodeRunner[]> {
		if (!this.client.isAvailable()) return [];
		const compilers = await this.client.list();
		return compilers
			.filter(({language}) => resolveFamily(languageCatalog, language) === family)
			.map(({compilerName, label}) => new LocalCodeRunner(this.client, compilerName, label));
	}
}

/** 入力した文字列をそのまま出力として扱う。Text で提出する問題のために使う。 */
class TextRunner implements CodeRunner {
	readonly kind = "browser";
	readonly id = "browser:text";
	readonly label = "Text [Browser]";

	async run(sourceCode: string, input: string, _options: RunOptions): Promise<RunResult> {
		return {status: "OK", exitCode: "0", input, output: sourceCode};
	}
}

export class TextRunnerProvider implements RunnerProvider {
	async runnersFor({family}: JudgeLanguage): Promise<readonly CodeRunner[]> {
		return family === "text" ? [new TextRunner()] : [];
	}
}
