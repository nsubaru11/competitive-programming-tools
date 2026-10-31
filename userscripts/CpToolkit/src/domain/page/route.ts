/** Java の提出を補助するための、サイトごとの情報。 */
export type SubmissionTarget = {
	readonly editor: "ace" | "monaco";
	readonly editorElements: readonly string[];
	readonly shortcut: string;
	readonly submitButtons: readonly string[];
	/** セレクタだけでは特定できない場合に、表示文言で探す。 */
	readonly labeledSubmit?: {
		readonly selector: string;
		readonly labels: readonly string[];
	};
};

export type JudgeDefinition = {
	readonly id: string;
	readonly name: string;
	/** Tampermonkey の @match に出力するパターン。 */
	readonly matches: readonly string[];
	/** ルート名と、パスとクエリに対する正規表現。 */
	readonly routes: Readonly<Record<string, string>>;
	/** 設定画面へのリンクを追加するメニューのセレクタ。上から順に探す。 */
	readonly navigationLists: readonly string[];
	readonly submission?: SubmissionTarget;
};

export type PageMatch = {
	readonly judge: JudgeDefinition;
	readonly routeIds: ReadonlySet<string>;
};

const PATH_AND_QUERY_PATTERN = /^[a-z]+:\/\/[^/?#]+([^#]*)/i;
const CONTEST_PATH_PATTERN = /^\/contests\/([^/?#]+)/;

/** AtCoder のコンテストのページなら、コンテストの ID を返す。 */
export function contestIdOf(pathname: string): string | undefined {
	return CONTEST_PATH_PATTERN.exec(pathname)?.[1];
}

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
