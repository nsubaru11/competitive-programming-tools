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

	test("トップページはページ幅の対象にしない", () => {
		expect(routesOf("https://atcoder.jp/")).toEqual([]);
		expect(routesOf("https://atcoder.jp/?lang=en")).toEqual([]);
	});

	test("それ以外のページは対象にする", () => {
		expect(routesOf("https://atcoder.jp/home")).toEqual(["atcoder:page"]);
		expect(routesOf("https://atcoder.jp/contests/abc420/tasks/abc420_a")).toEqual(["atcoder:page"]);
	});
});
