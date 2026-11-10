import {describe, expect, test} from "bun:test";
import {judges} from "@catalog/judges";
import {type JudgeDefinition, matchPage} from "@domain/page/route";

const sampleJudges: readonly JudgeDefinition[] = [
	{
		id: "example",
		name: "Example",
		matches: ["https://example.com/*", "https://*.contest.example.com/*"],
		routes: {task: "^/tasks/[^/?]+", filtered: "^/list\\?type=a"},
		navigationLists: [],
	},
];

describe("matchPage", () => {
	test("一致するルートを返す", () => {
		const page = matchPage(sampleJudges, "https://example.com/tasks/a?lang=en#top");
		expect(page?.judge.id).toBe("example");
		expect([...(page?.routeIds ?? [])]).toEqual(["example:task"]);
	});

	test("クエリも判定に使う", () => {
		expect(matchPage(sampleJudges, "https://example.com/list?type=a")?.routeIds.has("example:filtered")).toBe(true);
		expect(matchPage(sampleJudges, "https://example.com/list?type=b")?.routeIds.has("example:filtered")).toBe(false);
	});

	test("@match のワイルドカードはサブドメインにも一致する", () => {
		expect(matchPage(sampleJudges, "https://a.contest.example.com/x")?.judge.id).toBe("example");
	});

	test("どのサイトにも属さなければ null を返す", () => {
		expect(matchPage(sampleJudges, "https://example.org/tasks/a")).toBeNull();
	});
});

describe("AtCoder のルート", () => {
	const routesOf = (href: string) => [...(matchPage(judges, href)?.routeIds ?? [])];

	test("トップページはトップページのルートだけに一致する", () => {
		expect(routesOf("https://atcoder.jp/")).toEqual(["atcoder:home"]);
		expect(routesOf("https://atcoder.jp/?lang=en")).toEqual(["atcoder:home"]);
	});

	test("コンテストの問題ページを判定する", () => {
		expect(routesOf("https://atcoder.jp/contests/abc420/tasks/abc420_a")).toEqual([
			"atcoder:page",
			"atcoder:contest",
			"atcoder:task",
		]);
	});

	test("コンテスト一覧と過去問一覧はコンテストのページではない", () => {
		expect(routesOf("https://atcoder.jp/contests/")).toEqual(["atcoder:page"]);
		expect(routesOf("https://atcoder.jp/contests/archive?ratedType=1")).toEqual(["atcoder:page"]);
	});

	test("提出の一覧と詳細を区別する", () => {
		expect(routesOf("https://atcoder.jp/contests/abc420/submissions/me")).toContain("atcoder:submissions");
		expect(routesOf("https://atcoder.jp/contests/abc420/submissions/123")).toContain("atcoder:submissionDetail");
		expect(routesOf("https://atcoder.jp/contests/abc420/submissions/123")).not.toContain("atcoder:submissions");
	});

	test("順位やレートの分布のグラフではパフォーマンスを重ねない", () => {
		expect(routesOf("https://atcoder.jp/users/chokudai")).toContain("atcoder:user");
		expect(routesOf("https://atcoder.jp/users/chokudai?contestType=heuristic")).toContain("atcoder:user");
		expect(routesOf("https://atcoder.jp/users/chokudai?graph=rank")).not.toContain("atcoder:user");
		expect(routesOf("https://atcoder.jp/users/chokudai/history")).not.toContain("atcoder:user");
	});

	test("解説の一覧だけを対象にする", () => {
		expect(routesOf("https://atcoder.jp/contests/abc420/editorial?lang=ja")).toContain("atcoder:editorial");
		expect(routesOf("https://atcoder.jp/contests/abc420/tasks/abc420_f/editorial")).toContain("atcoder:editorial");
		expect(routesOf("https://atcoder.jp/contests/abc420/tasks/abc420_f/editorial?lang=en")).toContain("atcoder:editorial");
		expect(routesOf("https://atcoder.jp/contests/abc420/editorial/123")).not.toContain("atcoder:editorial");
	});
});

describe("他のサイトのルート", () => {
	const routesOf = (href: string) => [...(matchPage(judges, href)?.routeIds ?? [])];

	test("Codeforces の問題ページを判定する", () => {
		expect(routesOf("https://codeforces.com/contest/1/problem/A")).toContain("codeforces:problem");
		expect(routesOf("https://codeforces.com/problemset/problem/1/A")).toContain("codeforces:problem");
		expect(routesOf("https://m2.codeforces.com/contest/1/problem/A")).toContain("codeforces:problem");
		expect(routesOf("https://codeforces.com/blog")).not.toContain("codeforces:problem");
	});

	test("提出補助の対象サイトを判定する", () => {
		expect(matchPage(judges, "https://paiza.jp/works")?.judge.submission?.editor).toBe("ace");
		expect(matchPage(judges, "https://judge.yosupo.jp/problem/aplusb")?.judge.submission?.editor).toBe("monaco");
		expect(matchPage(judges, "https://yukicoder.me/problems/no/1")?.judge.submission).toBeUndefined();
	});
});
