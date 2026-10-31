import {evaluateEasyTestOutput} from "@atcoder-tools/shared";

export type JudgeLanguage = {
	readonly id: string;
	readonly label: string;
	readonly family: string | null;
};

export type TestCase = {
	readonly title: string;
	readonly input: string;
	readonly output: string | null;
};

export type RunOptions = {
	readonly trim?: boolean;
	readonly split?: boolean;
	readonly allowableError?: number;
	/** 同時に実行するサンプルの組。コンパイルエラーの再実行を省くために使う。 */
	readonly runGroupId?: string;
};

export type RunResult = {
	readonly status: string;
	readonly input: string;
	readonly exitCode?: string | number;
	readonly execTime?: number;
	readonly memory?: number;
	readonly output?: string;
	readonly error?: string;
	readonly expectedOutput?: string;
};

/** 実行結果を期待する出力と比較する。 */
export function judgeResult(result: RunResult, expected: string | null, options: RunOptions): RunResult {
	if (expected === null) return result;
	if (result.status !== "OK") return {...result, expectedOutput: expected};
	const judged = evaluateEasyTestOutput({status: result.status, output: result.output ?? ""}, expected, options);
	return {...result, ...judged};
}
