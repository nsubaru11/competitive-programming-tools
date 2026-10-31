export type JudgeDefinition = {
	readonly id: string;
	readonly name: string;
	/** Tampermonkey の @match に出力するパターン。 */
	readonly matches: readonly string[];
	/** ルート名と、パスとクエリに対する正規表現。 */
	readonly routes: Readonly<Record<string, string>>;
	/** 設定画面へのリンクを追加するメニューのセレクタ。上から順に探す。 */
	readonly navigationLists: readonly string[];
};

export type PageMatch = {
	readonly judge: JudgeDefinition;
	readonly routeIds: ReadonlySet<string>;
};

const PATH_AND_QUERY_PATTERN = /^[a-z]+:\/\/[^/?#]+([^#]*)/i;

function matchPatternToRegExp(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
	return new RegExp(`^${escaped}$`);
}

/** URL が属するサイトと、一致するルートを返す。どのサイトにも属さなければ null。 */
export function matchPage(judges: readonly JudgeDefinition[], href: string): PageMatch | null {
	const judge = judges.find(({matches}) => matches.some((pattern) => matchPatternToRegExp(pattern).test(href)));
	if (!judge) return null;
	const pathAndQuery = PATH_AND_QUERY_PATTERN.exec(href)?.[1] || "/";
	const routeIds = Object.entries(judge.routes)
		.filter(([, pattern]) => new RegExp(pattern).test(pathAndQuery))
		.map(([name]) => `${judge.id}:${name}`);
	return {judge, routeIds: new Set(routeIds)};
}
