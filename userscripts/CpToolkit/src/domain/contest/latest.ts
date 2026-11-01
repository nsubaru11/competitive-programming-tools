export type LatestContestCatalog = {
	readonly menuTargets: readonly string[];
	readonly cacheMinutes: number;
};

/** ホームの「次のコンテスト」の表の1件。1つのカテゴリに複数あることがある。 */
export type LatestContest = {
	readonly category: string;
	readonly id: string;
	readonly name: string;
};
