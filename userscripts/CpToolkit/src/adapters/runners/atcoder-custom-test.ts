import {buildQueryString, sleep} from "@atcoder-tools/shared";
import type {JudgeLanguage, RunOptions, RunResult} from "@domain/execution/result";
import type {CodeRunner, RunnerProvider} from "@application/execution/runner-catalog";
import type {JudgeSite} from "@application/ports/judge-site";
import type {HttpClient} from "@application/ports/services";
import {pageGlobals} from "@adapters/page/globals";

type CustomTestResponse = {
	Interval?: number;
	Result?: {ExitCode: number; TimeConsumption: number | string; MemoryConsumption: number | string};
	Stdout?: string;
	Stderr?: string;
};

const MAX_POLLS = 300;
const POLL_INTERVAL_MS = 1000;

/** サイトのコードテストは同時に1件しか実行できないので、順番に実行する。 */
class CustomTestQueue {
	private last: Promise<unknown> = Promise.resolve();
	private readonly failedGroups = new Set<string>();

	constructor(private readonly site: HttpClient) {
	}

	private get baseUrl(): string {
		return location.href.replace(/\/(tasks\/.+|submit.*)$/, "/custom_test");
	}

	run(languageId: string, sourceCode: string, input: string, groupId?: string): Promise<RunResult> {
		const result = this.last.then(() => this.execute(languageId, sourceCode, input, groupId));
		this.last = result.catch(() => undefined);
		return result;
	}

	private async execute(languageId: string, sourceCode: string, input: string, groupId?: string): Promise<RunResult> {
		if (groupId && this.failedGroups.has(groupId)) return {status: "CE", input};
		const submitted = await this.site.send({
			url: `${this.baseUrl}/submit/json`,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			body: buildQueryString({
				"data.LanguageId": languageId,
				sourceCode,
				input,
				csrf_token: pageGlobals().csrfToken,
			}),
		});
		if (submitted.text) throw new Error(submitted.text);

		for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
			await sleep(POLL_INTERVAL_MS / 10);
			const response = await this.site.send({url: `${this.baseUrl}/json?reload=true`});
			const data = JSON.parse(response.text) as CustomTestResponse;
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
				output: data.Stdout,
				error: data.Stderr,
			};
		}
		return {status: "TLE", input, error: "Custom test timed out"};
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
