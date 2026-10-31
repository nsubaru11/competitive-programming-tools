const JUDGING_PROGRESS_PATTERN = /^\d+\s*\/\s*\d+/;

/** 判定が確定していない結果か判定する。「2/7 WA」も判定中として扱う。 */
export function isJudging(status: string): boolean {
	return status === "" || status === "WJ" || status === "WR" || JUDGING_PROGRESS_PATTERN.test(status);
}

export type JudgeCase = {
	readonly status: string;
	readonly timeMs: number;
	readonly memoryKb: number;
};

export type JudgeCaseSummary = {
	readonly accepted: number;
	readonly total: number;
	readonly averageTimeMs: number;
	readonly averageMemoryKb: number;
	/** 実行時間に打ち切られた値を含むので、平均は下限になる。 */
	readonly timeIsLowerBound: boolean;
};

export function summarizeJudgeCases(cases: readonly JudgeCase[]): JudgeCaseSummary {
	const total = cases.length;
	const sum = (select: (judgeCase: JudgeCase) => number): number => cases.reduce((value, item) => value + select(item), 0);
	return {
		accepted: cases.filter(({status}) => status === "AC").length,
		total,
		averageTimeMs: Math.round((sum(({timeMs}) => timeMs) / total) * 10) / 10,
		averageMemoryKb: Math.round(sum(({memoryKb}) => memoryKb) / total),
		timeIsLowerBound: cases.some(({status}) => status === "TLE"),
	};
}
