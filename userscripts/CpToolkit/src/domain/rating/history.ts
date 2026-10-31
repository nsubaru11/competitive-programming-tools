const HIDDEN_ENTRIES = 3;

/** 表示期間を「最近」にしたときに、古い回を除く。 */
export function dropOldest<T>(entries: readonly T[]): readonly T[] {
	return entries.length > HIDDEN_ENTRIES ? entries.slice(HIDDEN_ENTRIES) : entries;
}

export type ContestHistoryEntry = {
	readonly IsRated?: boolean;
	readonly Performance?: number;
};

/** レート変動のあった回のパフォーマンスを、古い順に取り出す。 */
export function ratedPerformances(history: readonly ContestHistoryEntry[]): number[] {
	return history.filter((entry) => entry.IsRated).map((entry) => Math.max(0, entry.Performance ?? 0));
}
