export type RatingGraphView = {
	readonly showPerformance: boolean;
	readonly recentOnly: boolean;
};

export interface RatingGraph {
	/** ページのグラフの準備を待つ。描画できないページでは false を返す。 */
	prepare(performances: readonly number[]): Promise<boolean>;

	draw(view: RatingGraphView): void;
}
