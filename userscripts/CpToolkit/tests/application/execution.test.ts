import {describe, expect, mock, test} from "bun:test";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import {loadContestTasks} from "@application/contest/task-list";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {type CodeRunner, RunnerCatalogService} from "@application/execution/runner-catalog";
import {PendingSubmissions} from "@application/submission/pending-submissions";
import {ClarificationCounter} from "@application/contest/clarification-counter";
import {loadLatestContests} from "@application/contest/latest-contests";
import {VirtualParticipations} from "@application/contest/virtual-participation";
import {FakeHttpClient, MemoryStore} from "../support/fakes";

const JSON_OK = (body: unknown) => ({status: 200, text: JSON.stringify(body)});

describe("LocalRunnerClient", () => {
	const success = {status: "success", programId: "p1", sourceCode: "", diagnostics: ""};
	const output = {status: "success", exitCode: 0, stdout: "ok", stderr: "", time: 1, memory: 1};

	test("URL が未設定なら利用できない", () => {
		const client = new LocalRunnerClient(new FakeHttpClient(() => JSON_OK([])), () => null);
		expect(client.isAvailable()).toBe(false);
	});

	test("同じソースはコンパイルし直さない", async () => {
		const http = new FakeHttpClient(() => JSON_OK(success));
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		await client.prepare("code");
		await client.prepare("code");
		expect(http.requests).toHaveLength(1);
		await client.prepare("other");
		expect(http.requests).toHaveLength(2);
	});

	test("プログラムが破棄されていたらコンパイルし直す", async () => {
		const stale = {status: "badRequest", stderr: "Prepared program is unavailable: p1"};
		let runs = 0;
		const http = new FakeHttpClient(({body}) => {
			if (!body?.includes('"run"')) return JSON_OK(success);
			runs++;
			return JSON_OK(runs === 1 ? stale : output);
		});
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		expect(await client.run("code", "", "java")).toEqual(output as never);
		expect(runs).toBe(2);
	});

	test("prepare を持たない古いサーバーにはソースをそのまま渡す", async () => {
		const http = new FakeHttpClient(({body}) => (body?.includes('"prepare"') ? {
			status: 400,
			text: "",
		} : JSON_OK(output)));
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		expect(await client.run("code", "", "java")).toEqual(output as never);
	});

	test("コンパイルエラーの内容を返す", async () => {
		const failed = {status: "compileError", diagnostics: "error", sourceCode: ""};
		const client = new LocalRunnerClient(new FakeHttpClient(() => JSON_OK(failed)), () => "http://localhost:8080");
		expect(await client.run("code", "", "java")).toEqual(failed as never);
	});
});

describe("RunnerCatalogService", () => {
	const language: JudgeLanguage = {id: "6056", label: "Java 24", family: "java"};
	const runner = (id: string, kind: CodeRunner["kind"], run: () => Promise<RunResult>, label = id): CodeRunner => ({
		id,
		kind,
		label,
		run,
	});
	const ok = async (): Promise<RunResult> => ({status: "OK", input: "", output: "1"});
	const catalog = (runners: readonly CodeRunner[]) => new RunnerCatalogService(
		() => [{runnersFor: async () => runners}, {runnersFor: () => Promise.reject(new Error("offline"))}],
		["local", "judge", "paiza"],
		3,
	);

	test("設定の順に並べ、取得に失敗した候補は無視する", async () => {
		const candidates = await catalog([runner("p", "paiza", ok), runner("j", "judge", ok), runner("l", "local", ok)]).candidates(language);
		expect(candidates.map(({id}) => id)).toEqual(["l", "j", "p"]);
	});

	test("同じ種類の中では表記が近い順に並べる", async () => {
		const candidates = await catalog([runner("far", "judge", ok, "Rust"), runner("near", "judge", ok, "Java 24")]).candidates(language);
		expect(candidates[0]?.id).toBe("near");
	});

	test("内部エラーなら次の候補で実行する", async () => {
		const failing = mock(async (): Promise<RunResult> => ({status: "IE", input: ""}));
		const service = catalog([]);
		const result = await service.test(
			[runner("a", "local", failing), runner("b", "judge", ok)],
			"a",
			"code",
			{title: "t", input: "", output: "1"},
			{trim: true, split: true},
		);
		expect(failing).toHaveBeenCalledTimes(1);
		expect(result.status).toBe("AC");
	});

	test("例外も内部エラーとして扱う", async () => {
		const service = catalog([]);
		const result = await service.test(
			[runner("a", "local", () => Promise.reject(new Error("boom")))],
			"a",
			"code",
			{title: "t", input: "", output: null},
			{},
		);
		expect(result).toMatchObject({status: "IE", error: "Error: boom"});
	});
});

describe("loadContestTasks", () => {
	const tasks = [{url: "/contests/abc1/tasks/abc1_a", label: "A", name: "First"}];
	const dependencies = (http: FakeHttpClient, state = new MemoryStore()) => ({
		site: http,
		state,
		parse: () => tasks,
		cacheDays: 10,
	});

	test("一度取得した問題一覧はキャッシュを使う", async () => {
		const http = new FakeHttpClient(() => ({status: 200, text: ""}));
		const state = new MemoryStore();
		await loadContestTasks("abc1", dependencies(http, state));
		expect(await loadContestTasks("abc1", dependencies(http, state))).toEqual(tasks);
		expect(http.requests).toHaveLength(1);
	});

	test("取得に失敗したら null を返す", async () => {
		const http = new FakeHttpClient(() => ({status: 404, text: ""}));
		expect(await loadContestTasks("abc1", dependencies(http))).toBeNull();
	});

	test("保持期間を過ぎたコンテストをキャッシュから消す", async () => {
		const http = new FakeHttpClient(() => ({status: 200, text: ""}));
		const state = new MemoryStore();
		state.set("task-dropdown:tasks", {old: {tasks: [], lastAccess: 0}});
		await loadContestTasks("abc1", dependencies(http, state));
		expect(Object.keys(state.get("task-dropdown:tasks") as object)).toEqual(["abc1"]);
	});
});

describe("ClarificationCounter", () => {
	test("増えた件数を返す", () => {
		const counter = new ClarificationCounter(new MemoryStore());
		expect(counter.update("abc1", 2)).toBe(2);
		expect(counter.update("abc1", 2)).toBe(0);
		expect(counter.update("abc1", 3)).toBe(1);
		expect(counter.update("abc2", 1)).toBe(1);
	});

	test("件数が減っても通知しない", () => {
		const counter = new ClarificationCounter(new MemoryStore());
		counter.update("abc1", 3);
		expect(counter.update("abc1", 2)).toBe(0);
		expect(counter.update("abc1", 3)).toBe(1);
	});

	test("確認はタブ間で重複しない", () => {
		const state = new MemoryStore();
		expect(new ClarificationCounter(state).claimPoll(100_000, 60_000)).toBe(true);
		expect(new ClarificationCounter(state).claimPoll(130_000, 60_000)).toBe(false);
		expect(new ClarificationCounter(state).claimPoll(160_000, 60_000)).toBe(true);
	});
});

describe("VirtualParticipations", () => {
	test("コンテストごとに開始時刻を記憶して忘れる", () => {
		const participations = new VirtualParticipations(new MemoryStore());
		participations.record("abc1", 100);
		participations.record("abc2", 200);
		participations.forget("abc1");
		expect(participations.startOf("abc1")).toBeNull();
		expect(participations.startOf("abc2")).toBe(200);
	});
});

describe("loadLatestContests", () => {
	const catalog = {
		menuTargets: [],
		cacheMinutes: 60,
		leadHours: 24,
		kinds: [
			{label: "ABC", idPattern: "^abc\\d+$", archiveUrl: "/archive/abc"},
			{label: "AGC", idPattern: "^agc\\d+$", archiveUrl: "/archive/agc"},
			{label: "AWC", idPattern: "^awc\\d+$", archiveUrl: "/archive/awc"},
		],
	};
	const parse = (html: string) => (html ? html.split(",").map((id, index) => ({id, startMs: -index})) : []);
	const site = () => new FakeHttpClient(({url}) => {
		if (url === "/contests/") return {status: 200, text: "abc2,abc1"};
		return {status: 200, text: url === "/archive/agc" ? "agc1" : ""};
	});

	test("一覧にない種類は過去の一覧から探し、見つからなければ省く", async () => {
		const contests = await loadLatestContests(catalog, {site: site(), state: new MemoryStore(), parse, now: 0});
		expect(contests).toEqual({ABC: "abc2", AGC: "agc1"});
	});

	test("保持期間内は通信しない", async () => {
		const state = new MemoryStore();
		const http = site();
		await loadLatestContests(catalog, {site: http, state, parse, now: 0});
		const count = http.requests.length;
		await loadLatestContests(catalog, {site: http, state, parse, now: 59 * 60 * 1000});
		expect(http.requests).toHaveLength(count);
		await loadLatestContests(catalog, {site: http, state, parse, now: 60 * 60 * 1000});
		expect(http.requests.length).toBeGreaterThan(count);
	});
});

describe("PendingSubmissions", () => {
	const submission = {id: "1", contestId: "abc1", taskName: "A", addedAt: 1000};

	test("同じ提出を重複して登録しない", () => {
		const pending = new PendingSubmissions(new MemoryStore());
		pending.add([submission], 1000);
		pending.add([submission], 1000);
		expect(pending.list(1000)).toHaveLength(1);
	});

	test("時間が経った提出は対象から外す", () => {
		const pending = new PendingSubmissions(new MemoryStore());
		pending.add([submission], 1000);
		expect(pending.list(1000 + 31 * 60 * 1000)).toHaveLength(0);
	});

	test("確認は間隔を空け、他のタブと重複しない", () => {
		const state = new MemoryStore();
		const first = new PendingSubmissions(state);
		const second = new PendingSubmissions(state);
		expect(first.claimPoll(10_000, 1000)).toBe(true);
		expect(second.claimPoll(10_500, 1000)).toBe(false);
		expect(second.claimPoll(11_000, 1000)).toBe(true);
	});

	test("サイトが勧める間隔まで確認を遅らせる", () => {
		const pending = new PendingSubmissions(new MemoryStore());
		pending.claimPoll(10_000, 1000);
		pending.postponePoll(13_000);
		expect(pending.claimPoll(12_000, 1000)).toBe(false);
		expect(pending.claimPoll(13_000, 1000)).toBe(true);
	});

	test("操作中のタブの記録は短い間だけ有効で、離れると消える", () => {
		const pending = new PendingSubmissions(new MemoryStore());
		pending.markFocused(10_000);
		expect(pending.isFocusedElsewhere(12_000)).toBe(true);
		expect(pending.isFocusedElsewhere(13_000)).toBe(false);

		pending.markFocused(14_000);
		pending.clearFocus();
		expect(pending.isFocusedElsewhere(14_000)).toBe(false);
	});

	test("操作中の記録を書き込む回数を抑える", () => {
		const state = new MemoryStore();
		const pending = new PendingSubmissions(state);
		pending.markFocused(10_000);
		pending.markFocused(10_500);
		expect(state.get("result-notifier:lastFocus")).toBe(10_000);
	});
});
