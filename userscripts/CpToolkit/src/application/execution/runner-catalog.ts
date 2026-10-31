import type {RunnerKind} from "@catalog/tables";
import {labelDistance} from "@domain/execution/language";
import {type JudgeLanguage, judgeResult, type RunOptions, type RunResult, type TestCase} from "@domain/execution/result";

export interface CodeRunner {
	readonly id: string;
	readonly label: string;
	readonly kind: RunnerKind;

	run(sourceCode: string, input: string, options: RunOptions): Promise<RunResult>;
}

export interface RunnerProvider {
	/** 指定した言語を実行できる環境を返す。取得できなければ空にする。 */
	runnersFor(language: JudgeLanguage): Promise<readonly CodeRunner[]>;
}

/** 実行環境の候補を集め、優先順に並べて実行する。 */
export class RunnerCatalogService {
	constructor(
		private readonly providers: () => readonly RunnerProvider[],
		private readonly order: readonly RunnerKind[],
		private readonly maxRetry: number,
	) {
	}

	async candidates(language: JudgeLanguage): Promise<readonly CodeRunner[]> {
		const results = await Promise.allSettled(this.providers().map((provider) => provider.runnersFor(language)));
		const runners = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
		const rank = (runner: CodeRunner): number => this.order.indexOf(runner.kind);
		const distance = (runner: CodeRunner): number => labelDistance(runner.label, language.label);
		return [...runners].sort((a, b) => rank(a) - rank(b) || distance(a) - distance(b));
	}

	/** 内部エラーのときは、次の候補で実行し直す。 */
	async test(
		candidates: readonly CodeRunner[],
		firstRunnerId: string,
		sourceCode: string,
		testCase: TestCase,
		options: RunOptions,
	): Promise<RunResult> {
		const start = Math.max(0, candidates.findIndex(({id}) => id === firstRunnerId));
		let result: RunResult = {status: "IE", input: testCase.input};
		for (let retry = 0; retry < this.maxRetry; retry++) {
			const runner = candidates[(start + retry) % candidates.length];
			if (!runner) break;
			try {
				result = await runner.run(sourceCode, testCase.input, options);
			} catch (error) {
				result = {status: "IE", input: testCase.input, error: String(error)};
			}
			if (result.status !== "IE") return judgeResult(result, testCase.output, options);
		}
		return result;
	}
}
