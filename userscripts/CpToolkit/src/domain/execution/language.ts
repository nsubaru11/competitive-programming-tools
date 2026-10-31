export type LanguageFamily = {
	readonly id: string;
	readonly name: string;
	readonly match: readonly string[];
};

export type LanguageCatalog = {
	readonly families: readonly LanguageFamily[];
};

/** サイトの言語の表記から、言語の種類を判定する。 */
export function resolveFamily(catalog: LanguageCatalog, label: string): string | null {
	const family = catalog.families.find(({match}) => match.some((pattern) => new RegExp(pattern).test(label)));
	return family?.id ?? null;
}

/** 表記の違いの大きさを返す。小さいほど似ている。 */
export function labelDistance(a: string, b: string): number {
	let previous = new Float64Array(b.length + 1);
	let current = new Float64Array(b.length + 1);
	for (let i = 0; i < a.length; i++) {
		current.fill(0);
		const code = a.charCodeAt(i);
		for (let j = 0; j < b.length; j++) {
			const cost = (code - b.charCodeAt(j)) ** 2;
			current[j + 1] = Math.min(
				(previous[j] ?? 0) + cost,
				(previous[j + 1] ?? 0) + cost * 0.25,
				(current[j] ?? 0) + cost * 0.25,
			);
		}
		[previous, current] = [current, previous];
	}
	return previous[b.length] ?? 0;
}

const JAVASCRIPT_PREFIX = "javascript";

/** paiza の選択肢が目的の言語か判定する。Java の指定で JavaScript を選ばないよう区別する。 */
export function isLanguageOption(optionLabel: string, target: string): boolean {
	const label = optionLabel.trim().replace(/\s+/g, " ").toLowerCase();
	if (!label || (label.startsWith(JAVASCRIPT_PREFIX) && target !== JAVASCRIPT_PREFIX)) return false;
	return label === target || label.startsWith(`${target} `) || label.startsWith(`${target}(`);
}
