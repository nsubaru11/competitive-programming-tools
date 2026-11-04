export type LatestContestCatalog = {
	readonly menuTargets: readonly string[];
	readonly cacheMinutes: number;
};

/** コンテスト名の前に付く部門の丸や対象の色の丸など。色はサイトのクラスに任せる。 */
export type ContestMark = {
	readonly text: string;
	readonly className: string;
	readonly title: string;
};

/** ホームの「次のコンテスト」の表の1件。1つのカテゴリに複数あることがある。 */
export type LatestContest = {
	readonly id: string;
	readonly name: string;
	readonly marks: readonly ContestMark[];
};
