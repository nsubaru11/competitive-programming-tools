import type {RecentRange} from "@domain/rating/history";

export type RatingGraphView = {
	readonly showPerformance: boolean;
	/** 表示する最近の範囲。null ならすべて表示する。 */
	readonly recent: RecentRange | null;
};

export interface RatingGraph {
	/** ページのグラフの準備を待つ。描画できないページでは false を返す。 */
	prepare(performances: readonly number[]): Promise<boolean>;

	draw(view: RatingGraphView): void;
}
