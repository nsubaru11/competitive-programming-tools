import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import type {Feature, FeatureServices} from "@application/feature/definition";
import type {ContestPeriod} from "@application/ports/page-bridge";
import type {HttpRequest, Notification} from "@application/ports/services";
import {clarNotifier} from "@features/clar-notifier/index";
import {contestCalendar} from "@features/contest-calendar/index";
import {latestContests} from "@features/latest-contests/index";
import {resultNotifier} from "@features/result-notifier/index";
import {taskStatus} from "@features/task-status/index";
import {variableHover} from "@features/variable-hover/index";
import {virtualTimer} from "@features/virtual-timer/index";
import {createFakePage, createFakeServices, FakeHttpClient, FakeTicker, MemoryStore} from "../support/fakes";

const HOUR_MS = 60 * 60 * 1000;
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const run = (feature: Feature, overrides: Partial<FeatureServices> = {}, options?: unknown) => {
	return feature.run(options, createFakeServices(overrides));
};

function recordNotifications(): {notifier: FeatureServices["notifier"]; sent: Notification[]} {
	const sent: Notification[] = [];
	return {notifier: {notify: (notification) => sent.push(notification)}, sent};
}

function setFocus(focused: boolean): void {
	document.hasFocus = () => focused;
}

beforeEach(() => {
	document.head.replaceChildren();
	document.body.replaceChildren();
	setFocus(false);
});

afterEach(() => {
	document.body.replaceChildren();
	history.replaceState(null, "", "/");
});

describe("resultNotifier", () => {
	const submissionTable = (status: string) => `<div class="table-responsive"><table><tbody><tr>
		<td>2026-11-01</td><td>A - Sum</td><td><span class="label">${status}</span></td>
		<td><a href="/contests/abc1/submissions/123">Detail</a></td>
	</tr></tbody></table></div>`;
	const statusJson = (status: string, extra: object = {}) => JSON.stringify({
		Result: {123: {Html: `<td><span class="label">${status}</span></td><td>12 ms</td>`}},
		...extra,
	});

	function openSubmissions(respond: (request: HttpRequest) => string) {
		history.replaceState(null, "", "/contests/abc1/submissions/me");
		document.body.innerHTML = submissionTable("WJ");
		const {notifier, sent} = recordNotifications();
		const site = new FakeHttpClient((request) => ({status: 200, text: respond(request)}));
		const ticker = new FakeTicker();
		const state = new MemoryStore();
		const services = {
			isOnRoute: (route: string) => route === "atcoder:submissions",
			notifier,
			site,
			state,
			ticker,
		};
		return {services, sent, site, state, ticker};
	}

	test("提出一覧を開いたらすぐ確認し、離席中はデスクトップへ通知する", async () => {
		const {services, sent, site} = openSubmissions(() => statusJson("AC"));
		await run(resultNotifier, services);
		await flush();

		expect(site.requests).toHaveLength(1);
		expect(site.requests[0]?.url).toContain("sids%5B%5D=123");
		expect(sent).toEqual([{
			title: "AC: A - Sum",
			text: "12 ms",
			url: "https://atcoder.jp/contests/abc1/submissions/123",
		}]);
	});

	test("AtCoder を操作中は画面の内側だけに通知する", async () => {
		setFocus(true);
		const {services, sent} = openSubmissions(() => statusJson("WA"));
		await run(resultNotifier, services);
		await flush();

		expect(sent).toHaveLength(0);
		expect(document.body.lastElementChild?.shadowRoot?.textContent).toContain("WA: A - Sum");
	});

	test("デスクトップ通知を切れる", async () => {
		const {services, sent} = openSubmissions(() => statusJson("AC"));
		await run(resultNotifier, services, {desktop: false});
		await flush();
		expect(sent).toHaveLength(0);
	});

	test("判定中はサイトが勧める間隔に従い、確定すると時計を止める", async () => {
		let status = "3/7";
		const {services, sent, site, ticker} = openSubmissions(() => statusJson(status, {Interval: 60_000}));
		await run(resultNotifier, services);
		await flush();
		ticker.tick();
		await flush();
		expect(site.requests).toHaveLength(1);
		expect(ticker.listeners.size).toBe(1);

		services.state.set("result-notifier:nextPoll", 0);
		status = "AC";
		ticker.tick();
		await flush();
		expect(sent).toHaveLength(1);
		ticker.tick();
		expect(ticker.listeners.size).toBe(0);
	});

	test("確認に失敗すると、失敗が続くほど間隔を広げる", async () => {
		const {services, site, state, ticker} = openSubmissions(() => "");
		const nextPoll = () => Number(state.get("result-notifier:nextPoll")) - Date.now();
		await run(resultNotifier, services);
		await flush();
		expect(site.requests).toHaveLength(1);
		const first = nextPoll();
		expect(first).toBeGreaterThan(4000);
		expect(first).toBeLessThanOrEqual(5000);

		ticker.tick();
		await flush();
		expect(site.requests).toHaveLength(1);

		state.set("result-notifier:nextPoll", 0);
		ticker.tick();
		await flush();
		expect(nextPoll()).toBeGreaterThan(9000);
	});

	test("ログインが切れてログインのページが返っても、1秒ごとに確認し続けない", async () => {
		const {services, state} = openSubmissions(() => "<html><body>login</body></html>");
		await run(resultNotifier, services);
		await flush();
		expect(Number(state.get("result-notifier:nextPoll")) - Date.now()).toBeGreaterThan(4000);
	});

	test("通信のエラーでも間隔を広げる", async () => {
		const context = openSubmissions(() => {
			throw new Error("network");
		});
		await run(resultNotifier, context.services);
		await flush();
		expect(Number(context.state.get("result-notifier:nextPoll")) - Date.now()).toBeGreaterThan(4000);
	});

	test("他のタブが操作中なら確認を任せる", async () => {
		const {services, site, state, ticker} = openSubmissions(() => statusJson("AC"));
		state.set("result-notifier:lastFocus", Date.now());
		await run(resultNotifier, services);
		await flush();
		expect(site.requests).toHaveLength(0);

		window.dispatchEvent(new Event("blur"));
		ticker.tick();
		await flush();
		expect(site.requests).toHaveLength(1);
	});

	test("別のタブの提出を受け取り、確認を始める", async () => {
		const {services, sent, state, ticker} = openSubmissions(() => statusJson("AC"));
		history.replaceState(null, "", "/contests/abc1/tasks");
		await run(resultNotifier, {...services, isOnRoute: () => false});
		expect(ticker.listeners.size).toBe(0);

		const submission = {id: "123", contestId: "abc1", taskName: "A - Sum", addedAt: Date.now()};
		state.changeRemotely("result-notifier:pending", [submission]);
		await flush();
		expect(sent).toHaveLength(1);
	});

	test("先に別のタブが通知した提出は重ねて通知しない", async () => {
		const state = new MemoryStore();
		const context = openSubmissions(() => {
			state.set("result-notifier:pending", []);
			return statusJson("AC");
		});
		await run(resultNotifier, {...context.services, state});
		await flush();
		expect(context.sent).toHaveLength(0);
	});

	test("無効にすると確認も購読も止める", async () => {
		const {services, state, ticker} = openSubmissions(() => statusJson("WJ"));
		const dispose = await run(resultNotifier, services);
		dispose?.();
		expect(ticker.listeners.size).toBe(0);

		state.changeRemotely("result-notifier:pending", [{id: "9", contestId: "abc1", taskName: "A", addedAt: Date.now()}]);
		expect(ticker.listeners.size).toBe(0);
	});
});

describe("clarNotifier", () => {
	function openContest(period: ContestPeriod, counts: readonly string[] = []) {
		history.replaceState(null, "", "/contests/abc1/tasks");
		document.body.innerHTML = '<a class="contest-title">ABC 1</a><span id="clar-badge"></span>';
		let now = period.startMs + HOUR_MS / 2;
		let index = 0;
		const {notifier, sent} = recordNotifications();
		const site = new FakeHttpClient(() => ({status: 200, text: counts[index++] ?? "0"}));
		const ticker = new FakeTicker();
		const page = createFakePage({contestPeriod: () => period, serverNow: () => now});
		const services = {notifier, page, site, ticker, state: new MemoryStore()};
		return {services, sent, site, ticker, setNow: (time: number) => void (now = time)};
	}

	const contest = {startMs: 100 * HOUR_MS, endMs: 102 * HOUR_MS};

	test("件数が増えたときだけ通知する", async () => {
		const {services, sent, site, ticker, setNow} = openContest(contest, ["1", "1", "3"]);
		await run(clarNotifier, services);

		for (const minutes of [30, 31, 32]) {
			setNow(contest.startMs + minutes * 60 * 1000);
			ticker.tick();
			await flush();
		}

		expect(site.requests).toHaveLength(3);
		expect(site.requests[0]?.url).toContain("/contests/abc1/clarifications/count?t=");
		expect(sent.map(({title}) => title)).toEqual(["新しい Clar が 1 件あります", "新しい Clar が 2 件あります"]);
		expect(sent[0]).toMatchObject({text: "ABC 1", url: "https://atcoder.jp/contests/abc1/clarifications"});
	});

	test("確認は1分に1回までにする", async () => {
		const {services, site, ticker} = openContest(contest);
		await run(clarNotifier, services);
		ticker.tick();
		ticker.tick();
		await flush();
		expect(site.requests).toHaveLength(1);
	});

	test("開始直後は確認せず、終了したら止める", async () => {
		const {services, site, ticker, setNow} = openContest(contest);
		await run(clarNotifier, services);

		setNow(contest.startMs + 60 * 1000);
		ticker.tick();
		await flush();
		expect(site.requests).toHaveLength(0);

		setNow(contest.endMs);
		ticker.tick();
		expect(ticker.listeners.size).toBe(0);
	});

	test("常設のコンテストでは確認しない", async () => {
		const {services, ticker} = openContest({startMs: 0, endMs: 24 * 365 * HOUR_MS});
		await run(clarNotifier, services);
		expect(ticker.listeners.size).toBe(0);
	});
});

describe("taskStatus", () => {
	const scorePage = `<div id="main-div"><table><tbody>
		<tr><td><a href="/contests/abc1/tasks/abc1_a">A</a></td><td>Sum</td><td>100</td><td>2026-11-01</td></tr>
		<tr><td><a href="/contests/abc1/tasks/abc1_b">B</a></td><td>Max</td><td>0</td><td>2026-11-01</td></tr>
		<tr><td><a href="/contests/abc1/tasks/abc1_c">C</a></td><td>Min</td><td>0</td><td>-</td></tr>
	</tbody></table></div>`;
	const taskRow = (id: string) => `<tr><td><a href="/contests/abc1/tasks/abc1_${id}">${id}</a></td></tr>`;
	const classOf = (selector: string) => document.querySelector(selector)?.className;

	beforeEach(() => history.replaceState(null, "", "/contests/abc1/tasks"));

	test("問題一覧の行を結果に合わせて色分けする", async () => {
		document.body.innerHTML = `<div id="main-container"><table><tbody>
			${taskRow("a")}${taskRow("b")}${taskRow("c")}
		</tbody></table></div>`;
		const site = new FakeHttpClient(() => ({status: 200, text: scorePage}));
		await run(taskStatus, {
			isOnRoute: (route) => route === "atcoder:tasks",
			page: createFakePage(),
			site,
		});
		await flush();

		expect(site.requests[0]?.url).toBe("/contests/abc1/score");
		expect(classOf("tr:nth-child(1)")).toBe("cp-task-accepted");
		expect(classOf("tr:nth-child(2)")).toBe("cp-task-rejected");
		expect(classOf("tr:nth-child(3)")).toBe("");
		expect(document.documentElement.style.getPropertyValue("--cp-task-accepted")).toBe("#c3e6cb");
	});

	test("ドロップダウンは開くまで取得せず、取得は1回にする", async () => {
		document.body.innerHTML = `<div id="contest-nav-tabs"><ul><li class="dropdown">
			<a id="toggle" href="#">Tasks</a>
			<ul class="cp-task-menu"><li><a href="/contests/abc1/tasks/abc1_a">A</a></li></ul>
		</li></ul></div>`;
		const site = new FakeHttpClient(() => ({status: 200, text: scorePage}));
		await run(taskStatus, {isOnRoute: () => false, page: createFakePage(), site});
		expect(site.requests).toHaveLength(0);

		const hover = () => document.querySelector("#toggle")?.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}));
		hover();
		hover();
		await flush();
		expect(site.requests).toHaveLength(1);
		expect(classOf(".cp-task-menu li")).toBe("cp-task-accepted");
	});

	test("提出一覧の表は、ドロップダウンを開いても色分けしない", async () => {
		history.replaceState(null, "", "/contests/abc1/submissions/me");
		document.body.innerHTML = `<div id="contest-nav-tabs"><ul><li class="dropdown">
			<a id="toggle" href="#">Tasks</a>
			<ul class="cp-task-menu"><li id="item"><a href="/contests/abc1/tasks/abc1_a">A</a></li></ul>
		</li></ul></div>
		<div id="main-container"><table><tbody>${taskRow("a")}</tbody></table></div>`;
		const site = new FakeHttpClient(() => ({status: 200, text: scorePage}));
		await run(taskStatus, {isOnRoute: () => false, page: createFakePage(), site});

		document.querySelector("#toggle")?.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}));
		await flush();

		expect(classOf("#item")).toBe("cp-task-accepted");
		expect(classOf("#main-container tr")).toBe("");
	});

	test("混み合う開始直後は取得しない", async () => {
		const site = new FakeHttpClient(() => ({status: 200, text: scorePage}));
		const period = {startMs: Date.now() - 60 * 1000, endMs: Date.now() + HOUR_MS};
		await run(taskStatus, {
			isOnRoute: () => true,
			page: createFakePage({contestPeriod: () => period}),
			site,
		});
		expect(site.requests).toHaveLength(0);
	});

	test("ログインしていなければ取得しない", async () => {
		const site = new FakeHttpClient(() => ({status: 200, text: scorePage}));
		await run(taskStatus, {
			isOnRoute: () => true,
			page: createFakePage({isLoggedIn: () => false}),
			site,
		});
		expect(site.requests).toHaveLength(0);
	});
});

describe("variableHover", () => {
	const symbol = (text: string) => `<span class="mord mathnormal">${text}</span>`;
	const highlighted = () => [...document.querySelectorAll(".cp-variable")].map((element) => element.textContent);
	const fire = (index: number, type: string) => {
		document.querySelectorAll(".mathnormal")[index]?.dispatchEvent(new MouseEvent(type, {bubbles: true}));
	};

	beforeEach(() => {
		document.body.innerHTML = `<div id="task-statement">
			<span class="katex"><span class="katex-html">${symbol("N")}${symbol("M")}</span></span>
			<span class="katex"><span class="katex-html">${symbol("N")}</span></span>
		</div>`;
	});

	test("同じ変数をすべて強調し、離れると消す", async () => {
		await run(variableHover);
		fire(0, "mouseover");
		expect(highlighted()).toEqual(["N", "N"]);
		fire(0, "mouseout");
		expect(highlighted()).toEqual([]);
	});

	test("クリックで固定し、Esc で解除する", async () => {
		await run(variableHover);
		fire(0, "click");
		fire(0, "mouseout");
		fire(1, "mouseover");
		expect(highlighted()).toEqual(["N", "N"]);
		expect(document.querySelectorAll(".cp-variable-pinned")).toHaveLength(2);

		document.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
		expect(highlighted()).toEqual([]);
	});

	test("無効にすると強調を消す", async () => {
		const dispose = await run(variableHover);
		fire(0, "click");
		dispose?.();
		expect(highlighted()).toEqual([]);
		fire(0, "mouseover");
		expect(highlighted()).toEqual([]);
	});
});

describe("latestContests", () => {
	const row = (id: string, time: string) => {
		return `<tr><td><a href="https://example.com"><time>${time}</time></a></td><td><a href="/contests/${id}">${id}</a></td></tr>`;
	};
	const tablePage = (rows: string) => `<table><tbody>${rows}</tbody></table>`;
	const listPage = tablePage(`
		${row("abc2", "2020-01-08 21:00:00+0900")}
		${row("abc1", "2020-01-01 21:00:00+0900")}
		${row("abc3", "2099-01-01 21:00:00+0900")}
	`);

	test("開くまで取得せず、開くと最新のコンテストへのリンクにする", async () => {
		document.body.innerHTML = '<div id="header"><ul class="header-sub_page"></ul></div>';
		const site = new FakeHttpClient(({url}) => {
			return {status: 200, text: url.includes("ratedType=2") ? tablePage(row("arc9", "2020-01-02 21:00:00+0900")) : listPage};
		});
		const dispose = await run(latestContests, {site, state: new MemoryStore()});
		expect(site.requests).toHaveLength(0);
		expect(document.querySelector(".cp-latest-menu a")?.textContent).toBe("ABC");

		document.querySelector(".cp-latest")?.dispatchEvent(new MouseEvent("mouseenter"));
		await flush();
		await flush();

		const links = [...document.querySelectorAll<HTMLAnchorElement>(".cp-latest-menu a")];
		expect(links.map((link) => link.textContent).slice(0, 2)).toEqual(["ABC2", "ARC9"]);
		expect(links[0]?.getAttribute("href")).toBe("/contests/abc2");

		dispose?.();
		expect(document.querySelector(".cp-latest")).toBeNull();
	});
});

describe("contestCalendar", () => {
	const period = {startMs: Date.UTC(2099, 0, 1, 12), endMs: Date.UTC(2099, 0, 1, 14)};

	beforeEach(() => {
		document.body.innerHTML = `<a class="contest-title" href="https://atcoder.jp/contests/abc1">ABC 1</a>
			<small class="contest-duration">Contest Duration</small>`;
	});

	test("開催前のコンテストに登録のリンクを追加する", async () => {
		const dispose = await run(contestCalendar, {page: createFakePage({contestPeriod: () => period})});
		const link = document.querySelector<HTMLAnchorElement>(".contest-duration a");
		const query = new URL(link?.href ?? "").searchParams;
		expect(query.get("text")).toBe("ABC 1");
		expect(query.get("dates")).toBe("20990101T120000Z/20990101T140000Z");
		expect(query.get("location")).toBe("https://atcoder.jp/contests/abc1");

		dispose?.();
		expect(document.querySelector(".contest-duration a")).toBeNull();
	});

	test("終了したコンテストには追加しない", async () => {
		const page = createFakePage({contestPeriod: () => period, serverNow: () => period.endMs});
		await run(contestCalendar, {page});
		expect(document.querySelector(".contest-duration a")).toBeNull();
	});
});

describe("virtualTimer", () => {
	const period = {startMs: 0, endMs: 2 * HOUR_MS};

	function openContest(now: () => number, body = "") {
		history.replaceState(null, "", "/contests/abc1/virtual");
		document.body.innerHTML = `<div id="main-container">${body}</div><p id="fixed-server-timer">server</p>`;
		return createFakePage({contestPeriod: () => period, serverNow: now});
	}

	test("参加のページで開始時刻を記憶し、残り時間を表示する", async () => {
		const start = Date.parse("2026-11-01 21:00:00");
		const page = openContest(() => start + 30 * 60 * 1000, '<time class="fixtime-second">2026-11-01 21:00:00</time>');
		const state = new MemoryStore();
		const dispose = await run(virtualTimer, {isOnRoute: () => true, page, state});

		const timer = document.querySelector<HTMLElement>(".cp-virtual-timer");
		expect(timer?.textContent).toBe("残り時間01:30:00");
		expect(document.querySelector<HTMLElement>("#fixed-server-timer")?.style.display).toBe("none");

		timer?.click();
		expect(timer?.hidden).toBe(true);
		expect(document.querySelector<HTMLElement>("#fixed-server-timer")?.style.display).toBe("");

		dispose?.();
		expect(state.get("virtual-timer:starts")).toEqual({abc1: start});
		expect(document.querySelector(".cp-virtual-timer")).toBeNull();
	});

	test("記憶した開始時刻を他のページでも使い、開始前は開始までの時間を表示する", async () => {
		const state = new MemoryStore();
		state.set("virtual-timer:starts", {abc1: 10 * HOUR_MS});
		const page = openContest(() => 9 * HOUR_MS);
		const dispose = await run(virtualTimer, {isOnRoute: () => false, page, state});
		expect(document.querySelector(".cp-virtual-timer")?.textContent).toBe("開始まであと01:00:00");
		dispose?.();
	});

	test("終了した参加は忘れて、サイトの時計に戻す", async () => {
		const state = new MemoryStore();
		state.set("virtual-timer:starts", {abc1: 0});
		await run(virtualTimer, {isOnRoute: () => false, page: openContest(() => 3 * HOUR_MS), state});
		expect(document.querySelector(".cp-virtual-timer")).toBeNull();
		expect(state.get("virtual-timer:starts")).toEqual({});
	});

	test("登録を取り消すと参加のページを開いたときに忘れる", async () => {
		const state = new MemoryStore();
		state.set("virtual-timer:starts", {abc1: 0});
		await run(virtualTimer, {isOnRoute: () => true, page: openContest(() => 0), state});
		expect(document.querySelector(".cp-virtual-timer")).toBeNull();
		expect(state.get("virtual-timer:starts")).toEqual({});
	});

	test("参加していなければ何も表示しない", async () => {
		await run(virtualTimer, {isOnRoute: () => false, page: openContest(() => 0), state: new MemoryStore()});
		expect(document.querySelector(".cp-virtual-timer")).toBeNull();
	});
});
