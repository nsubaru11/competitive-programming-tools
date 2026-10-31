export type RatingTier = {
	readonly min: number;
	readonly color: string;
	readonly alpha: number;
	readonly background: string;
	readonly className: string;
};

export type RatingScale = {
	readonly tiers: readonly RatingTier[];
	readonly crownMin: number;
	readonly crownStep: number;
	readonly crownImage: string;
	readonly silverMax: number;
	readonly silverBackground: string;
	readonly goldBackground: string;
};

const UNRATED_TIER: RatingTier = {
	min: -1,
	color: "#000000",
	alpha: 0.1,
	background: "#FFFFFF",
	className: "user-unrated",
};

export function tierOf(scale: RatingScale, value: number): RatingTier {
	return scale.tiers.findLast((tier) => value >= tier.min) ?? UNRATED_TIER;
}

/** 王冠の対象なら画像の URL を返す。 */
export function crownImageOf(scale: RatingScale, value: number): string | null {
	if (value < scale.crownMin) return null;
	const step = Math.floor(value / scale.crownStep) * scale.crownStep;
	return scale.crownImage.replace("{value}", String(step));
}

export function backgroundOf(scale: RatingScale, value: number): string {
	if (value < scale.crownMin) return tierOf(scale, value).background;
	return value < scale.silverMax ? scale.silverBackground : scale.goldBackground;
}

/** 色区分の中での位置を 0 以上 1 未満で返す。 */
export function tierProgress(scale: RatingScale, value: number): number {
	const step = scale.tiers[1]?.min ?? 400;
	const current = tierOf(scale, value);
	if (current.min < 0) return 0;
	const next = scale.tiers.find((tier) => tier.min > current.min)?.min ?? current.min + step;
	return (value - current.min) / (next - current.min);
}
