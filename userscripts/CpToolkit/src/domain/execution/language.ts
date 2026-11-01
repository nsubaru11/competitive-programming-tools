import type {CommentSyntax} from "@domain/source/comment";

export type LanguageFamily = {
	readonly id: string;
	readonly name: string;
	readonly match: readonly string[];
	/** comments のキー。コメントを書けない言語にはない。 */
	readonly comment?: string;
};

export type LanguageCatalog = {
	readonly comments: Readonly<Record<string, CommentSyntax>>;
	readonly families: readonly LanguageFamily[];
};

type CompiledFamily = {
	readonly id: string;
	readonly patterns: readonly RegExp[];
};

/** 判定は選択肢の数だけ繰り返すので、正規表現は一覧ごとに一度だけ作る。 */
const compiledCatalogs = new WeakMap<LanguageCatalog, readonly CompiledFamily[]>();

function compile(catalog: LanguageCatalog): readonly CompiledFamily[] {
	const cached = compiledCatalogs.get(catalog);
	if (cached) return cached;
	const compiled = catalog.families.map(({id, match}) => {
		return {id, patterns: match.map((pattern) => new RegExp(pattern))};
	});
	compiledCatalogs.set(catalog, compiled);
	return compiled;
}

/** サイトの言語の表記から、言語の種類を判定する。 */
export function resolveFamily(catalog: LanguageCatalog, label: string): string | null {
	return compile(catalog).find(({patterns}) => patterns.some((pattern) => pattern.test(label)))?.id ?? null;
}

export function commentSyntaxOf(catalog: LanguageCatalog, familyId: string): CommentSyntax | null {
	const comment = catalog.families.find(({id}) => id === familyId)?.comment;
	return comment === undefined ? null : catalog.comments[comment] ?? null;
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
