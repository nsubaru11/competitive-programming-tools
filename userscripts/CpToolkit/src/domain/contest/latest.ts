export type LatestContestKind = {
	readonly label: string;
	readonly idPattern: string;
	readonly archiveUrl: string;
};

export type LatestContestCatalog = {
	readonly menuTargets: readonly string[];
	readonly cacheMinutes: number;
	readonly leadHours: number;
	readonly kinds: readonly LatestContestKind[];
};

export type ContestRow = {
	readonly id: string;
	readonly startMs: number;
};

/** 一覧の開始時刻を読む。ブラウザごとの差が出ないよう、ISO 8601 の形に揃える。 */
export function parseContestTime(text: string): number {
	return Date.parse(text.trim().replace(" ", "T").replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
}

/** 開始済みか開始が迫っているもののうち最も新しいものを選ぶ。なければ次に開かれるものを選ぶ。 */
export function pickLatestContest(
	rows: readonly ContestRow[],
	idPattern: RegExp,
	now: number,
	leadMs: number,
): string | null {
	const contests = rows.filter(({id}) => idPattern.test(id)).toSorted((a, b) => a.startMs - b.startMs);
	return (contests.findLast(({startMs}) => startMs <= now + leadMs) ?? contests[0])?.id ?? null;
}
