import {describe, expect, mock, test} from "bun:test";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import {loadContestTasks} from "@application/contest/task-list";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {type CodeRunner, RunnerCatalogService} from "@application/execution/runner-catalog";
import {PendingSubmissions} from "@application/submission/pending-submissions";
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
			text: ""
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
		run
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
		cacheDays: 10
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
		expect(pending.list(1000 + 11 * 60 * 1000)).toHaveLength(0);
	});

	test("確認は間隔を空け、他のタブと重複しない", () => {
		const state = new MemoryStore();
		const first = new PendingSubmissions(state);
		const second = new PendingSubmissions(state);
		first.markFocused(10_000);
		expect(first.claimPoll(10_000, 5000)).toBe(true);
		expect(second.claimPoll(11_000, 5000)).toBe(false);
		expect(second.claimPoll(15_000, 5000)).toBe(true);
	});

	test("長く操作がなければ確認しない", () => {
		const pending = new PendingSubmissions(new MemoryStore());
		pending.markFocused(0);
		expect(pending.claimPoll(6 * 60 * 1000, 5000)).toBe(false);
	});
});
