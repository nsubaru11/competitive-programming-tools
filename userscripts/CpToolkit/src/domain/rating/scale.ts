export type RatingTier = {
	readonly min: number;
	readonly color: string;
	readonly alpha: number;
	readonly className: string;
};

export type RatingScale = {
	readonly tiers: readonly RatingTier[];
	/** 王冠が付く下限。グラフの演出に使う。 */
	readonly crownMin: number;
};

const UNRATED_TIER: RatingTier = {
	min: -1,
	color: "#000000",
	alpha: 0.1,
	className: "user-unrated",
};

export function tierOf(scale: RatingScale, value: number): RatingTier {
	return scale.tiers.findLast((tier) => value >= tier.min) ?? UNRATED_TIER;
}

/** 色区分の中での位置を 0 以上 1 未満で返す。 */
export function tierProgress(scale: RatingScale, value: number): number {
	const step = scale.tiers[1]?.min ?? 400;
	const current = tierOf(scale, value);
	if (current.min < 0) return 0;
	const next = scale.tiers.find((tier) => tier.min > current.min)?.min ?? current.min + step;
	return (value - current.min) / (next - current.min);
}
