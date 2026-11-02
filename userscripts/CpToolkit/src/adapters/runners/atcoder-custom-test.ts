import {buildQueryString, sleep} from "@atcoder-tools/shared";
import type {JudgeLanguage, RunOptions, RunResult} from "@domain/execution/result";
import type {CodeRunner, RunnerProvider} from "@application/execution/runner-catalog";
import type {JudgeSite} from "@application/ports/judge-site";
import type {HttpClient} from "@application/ports/services";
import {pageGlobals} from "@adapters/page/globals";
import {CrossTabQueue} from "./serial-queue";

type CustomTestResponse = {
	Interval?: number;
	Result?: {ExitCode: number; TimeConsumption: number | string; MemoryConsumption: number | string};
	Stdout?: string;
	Stderr?: string;
};

const LOCK_NAME = "cp-toolkit:atcoder-custom-test";
const MAX_POLLS = 300;
const MAX_SUBMITS = 3;
const POLL_INTERVAL_MS = 1000;

/** サイトのコードテストは同時に1件しか実行できないので、タブをまたいで順番に実行する。 */
class CustomTestQueue {
	private readonly queue = new CrossTabQueue(LOCK_NAME);
	private readonly failedGroups = new Set<string>();

	constructor(private readonly site: HttpClient) {
	}

	private get baseUrl(): string {
		return location.href.replace(/\/(tasks\/.+|submit.*)$/, "/custom_test");
	}

	run(languageId: string, sourceCode: string, input: string, groupId?: string): Promise<RunResult> {
		return this.queue.run(() => this.execute(languageId, sourceCode, input, groupId));
	}

	private async execute(languageId: string, sourceCode: string, input: string, groupId?: string): Promise<RunResult> {
		if (groupId && this.failedGroups.has(groupId)) return {status: "CE", input};
		await this.submit(languageId, sourceCode, input);

		for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
			await sleep(POLL_INTERVAL_MS / 10);
			const data = await this.fetchStatus();
			const {Result: result} = data;
			if (!result || data.Interval !== undefined) {
				await sleep(data.Interval ?? POLL_INTERVAL_MS);
				continue;
			}
			const compileFailed = String(result.TimeConsumption).startsWith("-");
			const status = result.ExitCode === 0 ? "OK" : compileFailed ? "CE" : "RE";
			if (status === "CE" && groupId) this.failedGroups.add(groupId);
			return {
				status,
				exitCode: result.ExitCode,
				execTime: Number.parseInt(String(result.TimeConsumption), 10),
				memory: Number.parseInt(String(result.MemoryConsumption), 10),
				input,
				output: data.Stdout ?? "",
				error: data.Stderr ?? "",
			};
		}
		return {status: "TLE", input, error: "Test timed out"};
	}

	/** サイトの画面や閉じたタブの実行が残っていると断られるので、終わるのを待って送り直す。 */
	private async submit(languageId: string, sourceCode: string, input: string): Promise<void> {
		const body = buildQueryString({
			"data.LanguageId": languageId,
			sourceCode,
			input,
			csrf_token: pageGlobals().csrfToken,
		});
		let rejection = "";
		for (let attempt = 0; attempt < MAX_SUBMITS; attempt++) {
			const {text} = await this.site.send({
				url: `${this.baseUrl}/submit/json`,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				body,
			});
			if (!text) return;
			rejection = text;
			await this.waitUntilFinished();
		}
		throw new Error(rejection);
	}

	private async waitUntilFinished(): Promise<void> {
		for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
			const {Interval: interval} = await this.fetchStatus();
			if (interval === undefined) return;
			await sleep(interval);
		}
	}

	private async fetchStatus(): Promise<CustomTestResponse> {
		const response = await this.site.send({url: `${this.baseUrl}/json?reload=true`});
		return JSON.parse(response.text) as CustomTestResponse;
	}
}

class AtCoderRunner implements CodeRunner {
	readonly kind = "judge";
	readonly id: string;
	readonly label: string;

	constructor(private readonly queue: CustomTestQueue, private readonly language: JudgeLanguage) {
		this.id = `atcoder:${language.id}`;
		this.label = `${language.label} [AtCoder]`;
	}

	run(sourceCode: string, input: string, options: RunOptions): Promise<RunResult> {
		return this.queue.run(this.language.id, sourceCode, input, options.runGroupId);
	}
}

/** サイトの選択肢にある言語は、変換表なしでそのままコードテストに使える。 */
export class AtCoderRunnerProvider implements RunnerProvider {
	private readonly queue: CustomTestQueue;

	constructor(site: HttpClient, private readonly judge: () => Promise<JudgeSite | null>) {
		this.queue = new CustomTestQueue(site);
	}

	async runnersFor(language: JudgeLanguage): Promise<readonly CodeRunner[]> {
		const judge = await this.judge();
		if (judge?.id !== "atcoder") return [];
		const sameFamily = judge.languages().filter(({id, family}) => {
			return id === language.id || (family !== null && family === language.family);
		});
		return sameFamily.map((candidate) => new AtCoderRunner(this.queue, candidate));
	}
}
