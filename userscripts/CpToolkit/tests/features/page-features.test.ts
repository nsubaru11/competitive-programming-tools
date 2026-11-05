import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import type {Feature} from "@application/feature/definition";
import type {RatingGraphView} from "@application/ports/rating-graph";
import {TurndownStatementConverter} from "@adapters/statement/statement-converter";
import {averageResult} from "@features/average-result/index";
import {editorialList} from "@features/editorial-list/index";
import {efficientLayout} from "@features/efficient-layout/index";
import {ratingGraph} from "@features/rating-graph/index";
import {statementCopy} from "@features/statement-copy/index";
import {statementHighlight} from "@features/statement-highlight/index";
import {submissionQuery} from "@features/submission-query/index";
import {submissionShortcuts} from "@features/submission-shortcuts/index";
import {tessokuDifficulty} from "@features/tessoku-difficulty/index";
import {topLinks} from "@features/top-links/index";
import {createFakePage, createFakeServices, FakeHttpClient} from "../support/fakes";

const run = (feature: Feature, options?: unknown, overrides = {}) => feature.run(options, createFakeServices(overrides));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
	document.head.replaceChildren();
	document.body.replaceChildren();
});

afterEach(() => {
	document.body.replaceChildren();
});

describe("statementHighlight", () => {
	test("対象の見出しの数字と、実行時間の値を強調する", async () => {
		document.body.innerHTML = `
			<div id="main-container">
				<p>Time Limit: 2 sec / Memory Limit: 1024 MiB</p>
				<div id="task-statement">
					<section><h3>制約</h3><p>1 以上 100 以下</p></section>
					<section><h3>入力例 1</h3><p>42</p></section>
				</div>
			</div>`;
		const dispose = await run(statementHighlight);
		await wait(150);

		expect([...document.querySelectorAll(".cp-number")].map((element) => element.textContent)).toEqual(["1", "100"]);
		expect(document.querySelector(".cp-time-limit")?.textContent).toBe("2");
		expect(document.querySelector(".cp-memory-limit")?.textContent).toBe("1024");
		expect(document.querySelector("#main-container p")?.textContent).toBe("Time Limit: 2 sec / Memory Limit: 1024 MiB");
		dispose?.();
		expect(document.querySelector("style")).toBeNull();
	});

	test("設定した色を反映する", async () => {
		document.body.innerHTML = '<div id="task-statement"></div>';
		const dispose = await run(statementHighlight, {numberColor: "#112233"});
		expect(document.querySelector("style")?.textContent).toContain("--cp-number-color: #112233;");
		dispose?.();
	});
});

describe("submissionShortcuts", () => {
	const renderTitle = (): void => {
		history.replaceState(null, "", "/contests/abc420/tasks/abc420_a");
		document.body.innerHTML = '<span class="h2">A - Sample<a class="btn btn-default btn-sm">解説</a></span>';
	};

	test("AC 提出へのボタンであることが分かるようにまとめて表示する", async () => {
		renderTitle();
		await run(submissionShortcuts, {language: "Java"}, {page: createFakePage()});
		const control = document.querySelector(".cp-title-control");
		expect(control?.firstElementChild?.textContent).toBe("AC提出:");
		const links = [...(control?.querySelectorAll<HTMLAnchorElement>(".btn-group a") ?? [])];
		expect(links.map(({textContent}) => textContent)).toEqual(["実行時間", "コード長", "提出時間", "メモリ"]);
		expect(links[0]?.getAttribute("href")).toContain("orderBy=time_consumption");
		expect(links[0]?.getAttribute("href")).toContain("f.LanguageName=Java");
		expect(links[1]?.getAttribute("href")).toContain("orderBy=source_length");
		expect(links[1]?.getAttribute("href")).toContain("f.Task=abc420_a");
		expect(links[2]?.getAttribute("href")).toContain("orderBy=created");
		expect(links[3]?.getAttribute("href")).toContain("orderBy=memory_consumption");
	});

	test("詳細設定で選んだボタンだけを出し、1つもなければ何も出さない", async () => {
		renderTitle();
		await run(submissionShortcuts, {byTime: false, byLength: true, byCreated: false, byMemory: true}, {page: createFakePage()});
		const links = [...document.querySelectorAll(".cp-title-control .btn-group a")];
		expect(links.map(({textContent}) => textContent)).toEqual(["コード長", "メモリ"]);

		renderTitle();
		await run(submissionShortcuts, {byTime: false, byLength: false, byCreated: false, byMemory: false}, {page: createFakePage()});
		expect(document.querySelector(".cp-title-control")).toBeNull();
	});

	test("コンテスト中は出さない", async () => {
		renderTitle();
		const period = {startMs: Date.now() - 60_000, endMs: Date.now() + 60_000};
		await run(submissionShortcuts, undefined, {page: createFakePage({contestPeriod: () => period})});
		expect(document.querySelector(".cp-title-control")).toBeNull();
	});

	test("後始末で取り除く", async () => {
		renderTitle();
		const dispose = await run(submissionShortcuts, undefined, {page: createFakePage()});
		dispose?.();
		expect(document.querySelector(".cp-title-control")).toBeNull();
	});

	test("すべてコピーの見出しに含めない", async () => {
		renderTitle();
		document.body.insertAdjacentHTML("beforeend", '<div id="task-statement"></div>');
		const write = mock((_text: string) => undefined);
		await run(submissionShortcuts, undefined, {page: createFakePage()});
		await run(statementCopy, undefined, {clipboard: {write}, statementConverter: new TurndownStatementConverter()});
		document.querySelector<HTMLElement>(".pull-right button")?.click();
		expect(write.mock.calls[0]?.[0]).toStartWith("# A - Sample\n");
	});
});

describe("statementCopy", () => {
	function renderStatement(): void {
		document.body.innerHTML = `
			<h2 class="h2">A - Sample</h2>
			<div id="task-statement">
				<span class="lang-ja">
					<div class="part"><section><h3>問題文</h3><p><var>N</var> を出力してください。</p><ul><li>a</li></ul></section></div>
					<div class="part"><section><h3>入力例 1</h3><pre>1</pre></section></div>
				</span>
			</div>`;
	}

	const clipboard = () => {
		const write = mock((_text: string) => undefined);
		return {write};
	};

	test("Markdown で全体をコピーし、サンプルを含めない", async () => {
		renderStatement();
		const target = clipboard();
		await run(statementCopy, undefined, {clipboard: target, statementConverter: new TurndownStatementConverter()});
		document.querySelector<HTMLElement>(".pull-right button")?.click();

		const text = target.write.mock.calls[0]?.[0] ?? "";
		expect(text).toStartWith("# A - Sample");
		expect(text).toContain("### 問題文");
		expect(text).toContain("$N$");
		expect(text).toContain("- a");
		expect(text).not.toContain("入力例");
	});

	test("プレーンテキストでもコピーできる", async () => {
		renderStatement();
		const target = clipboard();
		await run(statementCopy, {format: "plain"}, {
			clipboard: target,
			statementConverter: new TurndownStatementConverter(),
		});
		document.querySelector<HTMLElement>("h3 button")?.click();

		const text = target.write.mock.calls[0]?.[0] ?? "";
		expect(text).toContain("【問題文】");
		expect(text).toContain("$N$ を出力してください。");
		expect(text).toContain("- a");
	});

	test("サンプルの見出しにはボタンを追加せず、後始末で取り除く", async () => {
		renderStatement();
		const dispose = await run(statementCopy, undefined, {
			clipboard: clipboard(),
			statementConverter: new TurndownStatementConverter(),
		});
		expect(document.querySelectorAll("h3 button")).toHaveLength(1);
		dispose?.();
		expect(document.querySelectorAll("button")).toHaveLength(0);
	});
});

describe("submissionQuery", () => {
	test("検索条件を提出ページのタブへ引き継ぐ", async () => {
		history.replaceState(null, "", "/contests/abc420/submissions?f.Task=abc420_a&f.Status=AC");
		document.body.innerHTML = `<div id="main-container"><div class="row"><div></div><div><ul>
			<li><a href="/contests/abc420/submissions">すべての提出</a></li>
			<li><a href="/contests/abc420/submissions/me">自分の提出</a></li>
		</ul></div></div></div>`;
		await run(submissionQuery);

		const hrefs = [...document.querySelectorAll("a")].map((link) => link.getAttribute("href"));
		expect(hrefs).toEqual([
			"/contests/abc420/submissions?f.Task=abc420_a&f.Status=AC",
			"/contests/abc420/submissions/me?f.Task=abc420_a&f.Status=AC",
		]);
	});

	const renderLanguageFilter = (language: string | null): HTMLSelectElement => {
		const query = new URLSearchParams({"f.Task": "abc420_a", "f.Status": "AC", orderBy: "source_length"});
		if (language !== null) query.set("f.LanguageName", language);
		history.replaceState(null, "", `/contests/abc420/submissions?${query}`);
		document.body.innerHTML = `<select id="select-language" name="f.LanguageName">
			<option value=""></option><option value="Python">Python</option>
			<option value="JavaScript">JavaScript</option><option value="C++">C++</option>
		</select>`;
		return document.querySelector<HTMLSelectElement>("#select-language")!;
	};

	test.each([
		["python", "Python"], ["PYTHON", "Python"], ["Python", "Python"],
		["javascript", "JavaScript"], ["c++", "C++"],
	])("%s の検索条件を言語欄にも表示する", async (language, expected) => {
		const select = renderLanguageFilter(language);
		const search = location.search;
		const triggerChange = mock((_element: object) => undefined);
		await run(submissionQuery, undefined, {page: createFakePage({triggerChange})});
		expect(select.value).toBe(expected);
		expect(triggerChange).toHaveBeenCalledWith(select);
		expect(location.search).toBe(search);
		const form = document.createElement("form");
		form.append(select);
		expect(new FormData(form).get("f.LanguageName")).toBe(expected);
	});

	test.each([null, "", "py", "unknown"])("言語が %s なら選択欄を変更しない", async (language) => {
		const select = renderLanguageFilter(language);
		const triggerChange = mock((_element: object) => undefined);
		await run(submissionQuery, undefined, {page: createFakePage({triggerChange})});
		expect(select.value).toBe("");
		expect(triggerChange).not.toHaveBeenCalled();
	});

	test("ページが選択済みの値は変更しない", async () => {
		const select = renderLanguageFilter("python");
		select.value = "C++";
		const triggerChange = mock((_element: object) => undefined);
		await run(submissionQuery, undefined, {page: createFakePage({triggerChange})});
		expect(select.value).toBe("C++");
		expect(triggerChange).not.toHaveBeenCalled();
	});
});

describe("ratingGraph", () => {
	async function start(options?: unknown) {
		history.replaceState(null, "", "/users/tester");
		document.body.innerHTML = '<div class="btn-text-group"></div>';
		const draw = mock((_view: RatingGraphView) => undefined);
		await run(ratingGraph, options, {
			ratingGraph: {prepare: async () => true, draw},
			site: new FakeHttpClient(() => ({status: 200, text: "[]"})),
		});
		return draw;
	}

	test("指定した最近の範囲で描画する", async () => {
		const draw = await start({recentRange: "50%"});
		expect(draw).toHaveBeenLastCalledWith({showPerformance: true, recent: {unit: "percent", value: 50}});
	});

	test("既定では直近20回を表示する", async () => {
		const draw = await start();
		expect(draw).toHaveBeenLastCalledWith({showPerformance: true, recent: {unit: "count", value: 20}});
	});

	test("不正な保存値は既定の範囲に置き換える", async () => {
		const draw = await start({recentRange: "abc"});
		expect(draw).toHaveBeenLastCalledWith({showPerformance: true, recent: {unit: "count", value: 20}});
	});

	test("すべて表示に切り替えられる", async () => {
		const draw = await start({recentRange: "5"});
		[...document.querySelectorAll("button")].find(({textContent}) => textContent === "all")?.click();
		expect(draw).toHaveBeenLastCalledWith({showPerformance: true, recent: null});
	});
});

describe("averageResult", () => {
	const table = (rows: string) => `<table></table><table></table><table></table><table></table>
		<table><tbody>${rows}</tbody></table>`;

	test("テストケースの平均を先頭の行に追加する", async () => {
		document.body.innerHTML = table(`
			<tr><td>01</td><td>AC</td><td>10 ms</td><td>100 KiB</td></tr>
			<tr><td>02</td><td>TLE</td><td>2000 ms</td><td>300 KiB</td></tr>`);
		const dispose = await run(averageResult);

		const cells = document.querySelector("tbody tr")?.querySelectorAll("td");
		expect(cells?.[1]?.textContent).toBe("1/2");
		expect(cells?.[2]?.textContent).toBe("1005+ ms");
		expect(cells?.[3]?.textContent).toBe("200 KiB");
		dispose?.();
		expect(document.querySelectorAll("tbody tr")).toHaveLength(2);
	});

	test("テストケースの表がなければ何もしない", async () => {
		document.body.innerHTML = "<table><tbody><tr><td>1</td></tr></tbody></table>";
		await run(averageResult);
		expect(document.querySelectorAll("tr")).toHaveLength(1);
	});
});

describe("efficientLayout", () => {
	test("サンプルを2個ずつ横に並べ、入出力形式を折りたためるようにする", async () => {
		document.body.innerHTML = `<span class="lang">
			<div class="io-style"><div class="part">入力</div><div class="part">出力</div></div>
			<hr>
			<div class="part"><h3>入力例 1</h3></div><div class="part"><h3>出力例 1</h3></div>
		</span>`;
		await run(efficientLayout);

		expect(document.querySelector(".cp-samples-row")?.children).toHaveLength(1);
		expect(document.querySelector(".cp-samples-row > div")?.children).toHaveLength(2);
		expect(document.querySelector("details > .io-style")).not.toBeNull();
		expect(document.querySelector("hr")).toBeNull();
	});

	test("部分点はサンプルに含めず、入力例と出力例の組を保つ", async () => {
		document.body.innerHTML = `<span class="lang">
			<div class="io-style"><div class="part">入力</div></div>
			<div class="part" id="partial"><h3>部分点</h3></div>
			<div class="part"><h3>入力例 1</h3></div><div class="part"><h3>出力例 1</h3></div>
			<div class="part"><h3>入力例 2</h3></div><div class="part"><h3>出力例 2</h3></div>
		</span>`;
		await run(efficientLayout);

		expect(document.querySelector(".cp-samples-row")?.children).toHaveLength(2);
		expect(document.querySelector(".cp-samples-row > div")?.children).toHaveLength(2);
		expect(document.querySelector("#partial")?.closest(".cp-samples-row")).toBeNull();
		expect(document.querySelector("#partial")?.parentElement?.className).toBe("lang");
	});

	test("KaTeX の絶対配置の要素が外へ漏れないように、サンプルの枠を基準にする", async () => {
		document.body.innerHTML = `<span class="lang">
			<div class="io-style"><div class="part">入力</div></div>
			<div class="part"><h3>入力例 1</h3></div><div class="part"><h3>出力例 1</h3></div>
		</span>`;
		await run(efficientLayout);

		const container = document.querySelector(".cp-samples-container");
		expect(container && getComputedStyle(container).position).toBe("relative");
	});
});

describe("tessokuDifficulty", () => {
	const page = (rows: string) => `<div id="main-container"><div class="row"><div></div><div>
		<h2>問題</h2><div><table><tbody>${rows}</tbody></table></div>
	</div></div></div>`;

	test("難易度を表示し、並べ替えられる", async () => {
		document.body.innerHTML = page(`
			<tr><td>A08</td><td><a href="#">二次元累積和</a></td></tr>
			<tr><td>A01</td><td><a href="#">正方形</a></td></tr>
			<tr><td>A47</td><td><a href="#">表にない問題</a></td></tr>`);
		await run(tessokuDifficulty);

		const links = () => [...document.querySelectorAll("tbody a")].map((link) => link.textContent);
		expect(links()).toEqual(["【☆4】 二次元累積和", "【☆1】 正方形", "表にない問題"]);

		document.querySelector("button")?.click();
		expect(links()[0]).toBe("【☆1】 正方形");
		document.querySelector("button")?.click();
		expect(links()[0]).toBe("【☆1】 正方形");
		expect(links()[1]).toBe("【☆4】 二次元累積和");
	});
});

describe("editorialList", () => {
	const observed: Element[] = [];

	class FakeObserver {
		observe(target: Element): void {
			observed.push(target);
		}

		unobserve(): void {
		}
	}

	test("別のサイトのリンクは、同じ形のパスでも読み込まない", async () => {
		observed.length = 0;
		const original = globalThis.IntersectionObserver;
		globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
		document.body.innerHTML = `<a id="own" href="${location.origin}/contests/abc1/editorial/1">own</a>
			<a id="other" href="https://evil.example/contests/abc1/editorial/2">other</a>`;
		await run(editorialList, undefined, {
			scripts: {loadScript: async () => undefined, loadStylesheet: async () => undefined},
		});
		globalThis.IntersectionObserver = original;

		expect(observed.map(({id}) => id)).toEqual(["own"]);
	});
});

describe("topLinks", () => {
	test("一覧をリンクに置き換える", async () => {
		document.body.innerHTML = '<div class="list-group contest-list"></div><div class="list-group contest-list"></div>';
		await run(topLinks);
		expect(document.querySelectorAll(".contest-list a")).toHaveLength(5);
		expect(document.querySelector(".contest-list a")?.getAttribute("href")).toBe("https://atcoder.jp/contests");
	});
});
