import {describe, expect, mock, test} from "bun:test";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import {loadContestTasks} from "@application/contest/task-list";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {type CodeRunner, RunnerCatalogService} from "@application/execution/runner-catalog";
import {PendingSubmissions} from "@application/submission/pending-submissions";
import type {CodeEditor} from "@application/ports/code-editor";
import {PastePipeline} from "@application/source/paste-pipeline";
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
		expect(await client.run("code", "")).toEqual(output as never);
		expect(runs).toBe(2);
	});

	test("サーバーの失敗はそのまま伝える", async () => {
		const http = new FakeHttpClient(() => ({status: 400, text: ""}));
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		await expect(client.run("code", "")).rejects.toThrow("Local Runner returned 400.");
		expect(http.requests).toHaveLength(1);
	});

	test("要求に使わない値を送らない", async () => {
		const http = new FakeHttpClient(() => JSON_OK(success));
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		await client.prepare("code");
		expect(JSON.parse(http.requests[0]?.body ?? "{}")).toEqual({
			mode: "prepare", sourceCode: "code", debug: true, autoImport: true, validate: false, header: false,
		});
	});

	test("コンパイラの識別子を送り、サーバーが言語を選べるようにする", async () => {
		const http = new FakeHttpClient(() => JSON_OK(success));
		const client = new LocalRunnerClient(http, () => "http://localhost:8080");
		await client.run("code", "in", "python3");
		const bodies = http.requests.map(({body}) => JSON.parse(body ?? "{}"));
		expect(bodies.map(({mode, compilerName}) => [mode, compilerName])).toEqual([["prepare", "python3"], ["run", "python3"]]);
	});

	test("コンパイルエラーの内容を返す", async () => {
		const failed = {status: "compileError", diagnostics: "error", sourceCode: ""};
		const client = new LocalRunnerClient(new FakeHttpClient(() => JSON_OK(failed)), () => "http://localhost:8080");
		expect(await client.run("code", "")).toEqual(failed as never);
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

	test("サイトの言語と同じ表記の環境を、同じ種類の先頭に並べる", async () => {
		const labels = ["C++23 (GCC 15.2.0)", "C++23 (Clang 21.1.0)", "C++20 (GCC 12.2.0)"];
		for (const label of labels) {
			const runners = labels.map((item) => runner(item, "judge", ok, `${item} [AtCoder]`));
			const candidates = await catalog(runners).candidates({id: "1", label, family: "cpp"});
			expect(candidates[0]?.id).toBe(label);
		}
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

	test("内部エラーでも、外部のサービスへは自動で切り替えない", async () => {
		const failing = mock(async (): Promise<RunResult> => ({status: "IE", input: ""}));
		const external = mock(ok);
		const service = new RunnerCatalogService(() => [], ["local", "paiza"], 3, ["paiza"]);
		const result = await service.test(
			[runner("a", "local", failing), runner("b", "paiza", external)],
			"a",
			"code",
			{title: "t", input: "", output: "1"},
			{trim: true, split: true},
		);
		expect(external).not.toHaveBeenCalled();
		expect(failing).toHaveBeenCalledTimes(3);
		expect(result.status).toBe("IE");
	});

	test("外部のサービスを選んだときは、そのサービスで実行する", async () => {
		const external = mock(ok);
		const service = new RunnerCatalogService(() => [], ["local", "paiza"], 3, ["paiza"]);
		const result = await service.test(
			[runner("a", "local", ok), runner("b", "paiza", external)],
			"b",
			"code",
			{title: "t", input: "", output: "1"},
			{trim: true, split: true},
		);
		expect(external).toHaveBeenCalledTimes(1);
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

describe("PastePipeline", () => {
	const target = {editor: "ace", editorElements: ["#editor"], shortcut: "Ctrl+Enter", submitButtons: []} as const;

	function createEditor(initial: string) {
		let value = initial;
		let paste = (_pasted: string): void => undefined;
		const editor: CodeEditor = {
			getValue: () => value,
			setValue(next) {
				value = next;
			},
			isJava: () => true,
			isReadOnly: () => false,
			setWritable: () => undefined,
			onPaste(listener) {
				paste = listener;
			},
			onChange: () => undefined,
			foldLines: () => undefined,
		};
		return {editor, paste: () => paste(value), edit: (next: string) => void (value = next)};
	}

	const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

	test("登録の順によらず、order の順に実行して反映する", async () => {
		const {editor, paste} = createEditor("code");
		const pipeline = new PastePipeline({locate: async () => editor});
		pipeline.add(target, {}, {order: 20, transform: (code) => `// header\n${code}`});
		pipeline.add(target, {}, {order: 10, transform: async (code) => code.toUpperCase()});
		await flush();

		paste();
		await flush();
		expect(editor.getValue()).toBe("// header\nCODE");
	});

	test("変換中に編集されたら上書きしない", async () => {
		const {editor, paste, edit} = createEditor("code");
		const pipeline = new PastePipeline({locate: async () => editor});
		pipeline.add(target, {}, {
			order: 10,
			async transform(code) {
				edit("edited");
				return `${code}!`;
			},
		});
		await flush();

		paste();
		await flush();
		expect(editor.getValue()).toBe("edited");
	});

	test("コードを変えた処理にだけ反映後の通知を送る", async () => {
		const {editor, paste} = createEditor("code");
		const pipeline = new PastePipeline({locate: async () => editor});
		const applied: string[] = [];
		pipeline.add(target, {}, {order: 10, transform: (code) => code, applied: () => applied.push("same")});
		pipeline.add(target, {}, {order: 20, transform: (code) => `${code}!`, applied: () => applied.push("changed")});
		await flush();

		paste();
		await flush();
		expect(applied).toEqual(["changed"]);
	});

	test("加工の結果が別の処理の入力になり、貼り付けた直後のコードも受け取れる", async () => {
		const {editor, paste} = createEditor("code");
		const pipeline = new PastePipeline({locate: async () => editor});
		const originals: string[] = [];
		pipeline.add(target, {}, {order: 10, transform: (code) => `${code}!`});
		pipeline.add(target, {}, {
			order: 20,
			transform(code, {original}) {
				originals.push(original);
				return code;
			},
		});
		await flush();

		paste();
		await flush();
		expect(originals).toEqual(["code"]);
		expect(editor.getValue()).toBe("code!");
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

describe("loadContestTasks の記憶", () => {
	test("空の一覧は記憶せず、次回に取得し直す", async () => {
		const state = new MemoryStore();
		const site = new FakeHttpClient(() => ({status: 200, text: ""}));
		const parse = () => [];
		await loadContestTasks("abc1", {site, state, parse, cacheDays: 10});
		await loadContestTasks("abc1", {site, state, parse, cacheDays: 10});
		expect(site.requests).toHaveLength(2);
	});
});

describe("loadLatestContests", () => {
	const contest = {
		category: "ABC",
		id: "abc2",
		name: "AtCoder Beginner Contest 2",
		marks: [{text: "◉", className: "user-blue", title: ""}],
	};
	const parse = (html: string) => (html === "table" ? [contest] : []);
	const home = () => new FakeHttpClient(() => ({status: 200, text: "table"}));

	test("ホームの表を読み、保持期間内は通信しない", async () => {
		const state = new MemoryStore();
		const site = home();
		expect(await loadLatestContests(60, {site, state, parse, now: 0})).toEqual([contest]);
		expect(site.requests.map(({url}) => url)).toEqual(["/home"]);

		await loadLatestContests(60, {site, state, parse, now: 59 * 60 * 1000});
		expect(site.requests).toHaveLength(1);
		await loadLatestContests(60, {site, state, parse, now: 60 * 60 * 1000});
		expect(site.requests).toHaveLength(2);
	});

	test("取得に失敗したら記憶しない", async () => {
		const state = new MemoryStore();
		const site = new FakeHttpClient(() => ({status: 503, text: ""}));
		await expect(loadLatestContests(60, {site, state, parse, now: 0})).rejects.toThrow();
		expect(site.requests).toHaveLength(1);
		expect(state.get("latest-contests:cache")).toBeUndefined();
	});

	test("表を読めなかった結果は記憶しない", async () => {
		const state = new MemoryStore();
		const site = new FakeHttpClient(() => ({status: 200, text: "changed"}));
		expect(await loadLatestContests(60, {site, state, parse, now: 0})).toEqual([]);
		expect(state.get("latest-contests:cache")).toBeUndefined();
	});

	test("以前の形式の記憶は使わない", async () => {
		const state = new MemoryStore();
		state.set("latest-contests:cache", {fetchedAt: 0, contests: {ABC: "abc1"}});
		expect(await loadLatestContests(60, {site: home(), state, parse, now: 0})).toEqual([contest]);

		const {marks: _, ...withoutMarks} = contest;
		state.set("latest-contests:cache", {fetchedAt: 0, contests: [withoutMarks]});
		const site = home();
		await loadLatestContests(60, {site, state, parse, now: 0});
		expect(site.requests).toHaveLength(1);
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
