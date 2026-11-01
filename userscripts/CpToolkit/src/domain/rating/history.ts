/** グラフに表示する最近の範囲。回数か、全体に対する割合で指定する。 */
export type RecentRange = {
	readonly unit: "count" | "percent";
	readonly value: number;
};

const RECENT_RANGE_PATTERN = /^(\d+)\s*(%?)$/;
const MAX_PERCENT = 100;

/** 「20」や「50%」の表記を読み取る。全角でも受け付ける。不正な表記は null を返す。 */
export function parseRecentRange(text: string): RecentRange | null {
	const [, digits, percent] = RECENT_RANGE_PATTERN.exec(text.normalize("NFKC").trim()) ?? [];
	const value = Number(digits);
	const unit = percent ? "percent" : "count";
	if (!Number.isSafeInteger(value) || value < 1 || (unit === "percent" && value > MAX_PERCENT)) return null;
	return {unit, value};
}

/** 全体のうち、最近の何回分を表示するかを返す。割合は切り上げて、最低でも1回分を表示する。 */
export function recentCount({unit, value}: RecentRange, total: number): number {
	const count = unit === "percent" ? Math.ceil((total * value) / MAX_PERCENT) : value;
	return Math.min(count, total);
}

export type ContestHistoryEntry = {
	readonly IsRated?: boolean;
	readonly Performance?: number;
};

/** レート変動のあった回のパフォーマンスを、古い順に取り出す。 */
export function ratedPerformances(history: readonly ContestHistoryEntry[]): number[] {
	return history.filter((entry) => entry.IsRated).map((entry) => Math.max(0, entry.Performance ?? 0));
}
