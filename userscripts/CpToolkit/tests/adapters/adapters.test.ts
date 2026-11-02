import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import {importLegacySettings} from "@application/settings/legacy-import";
import {SettingsService} from "@application/settings/settings-service";
import {AtCoderSite} from "@adapters/judges/atcoder";
import {CodeforcesSite} from "@adapters/judges/codeforces";
import {languagesOf} from "@adapters/judges/languages";
import {YukicoderSite} from "@adapters/judges/yukicoder";
import {LocalStorageLegacyInbox} from "@adapters/page/local-storage-legacy-inbox";
import {SameOriginHttpClient} from "@adapters/page/same-origin-http-client";
import {WorkerTicker} from "@adapters/page/worker-ticker";
import {AtCoderRunnerProvider} from "@adapters/runners/atcoder-custom-test";
import {CrossTabQueue} from "@adapters/runners/serial-queue";
import {LocalRunnerProvider, PaizaRunnerProvider} from "@adapters/runners/simple-runners";
import {WandboxRunnerProvider} from "@adapters/runners/wandbox";
import {TurndownStatementConverter} from "@adapters/statement/statement-converter";
import {LocalRunnerClient} from "@application/execution/local-runner";
import type {JudgeSite} from "@application/ports/judge-site";
import {createFakePage, FakeHttpClient, MemoryStore} from "../support/fakes";

const bridge = createFakePage();
const noHttp = new FakeHttpClient(() => ({status: 500, text: ""}));
const java = {id: "1", label: "Java 21", family: "java"};

beforeEach(() => {
	document.body.replaceChildren();
	localStorage.clear();
});

describe("問題文の変換", () => {
	const katex = (tex: string) => {
		const mathml = `<span class="katex-mathml"><math><annotation encoding="application/x-tex">${tex}</annotation></math></span>`;
		return `<span class="katex">${mathml}<span class="katex-html" aria-hidden="true">描画結果</span></span>`;
	};
	const statement = `<p>長さ <var>${katex("N")}</var> の数列と ${katex("M")} について</p>
		<p><span class="katex-display">${katex("\\sum_{i=1}^N A_i")}</span></p>`;
	const converter = new TurndownStatementConverter();

	test("Markdown では別行立ての数式を $$ で囲み、描画結果を含めない", () => {
		const markdown = converter.toMarkdown(statement);
		expect(markdown).toContain("$N$");
		expect(markdown).toContain("$M$");
		expect(markdown).toContain("$$\n\\sum_{i=1}^N A_i\n$$");
		expect(markdown).not.toContain("描画結果");
	});

	test("テキストでも同じように変換する", () => {
		const text = converter.toPlainText(statement);
		expect(text).toContain("$N$");
		expect(text).toContain("$M$");
		expect(text).toContain("$$\n\\sum_{i=1}^N A_i\n$$");
		expect(text).not.toContain("描画結果");
	});
});

describe("SameOriginHttpClient", () => {
	test("別のサイトへは送らない", async () => {
		const client = new SameOriginHttpClient();
		await expect(client.send({url: "https://evil.example/data"})).rejects.toThrow("Cross-origin");
	});
});

describe("PaizaRunnerProvider の確認", () => {
	const java = {id: "1", label: "Python", family: "python3"};

	test("実行中は間隔を空けて確認する", async () => {
		const times: number[] = [];
		let checks = 0;
		const http = new FakeHttpClient(({url}) => {
			if (url.includes("/create")) return {status: 200, text: '{"id": "x", "status": "running"}'};
			if (url.includes("/get_status")) {
				times.push(Date.now());
				return {status: 200, text: `{"status": "${++checks < 2 ? "running" : "completed"}"}`};
			}
			return {status: 200, text: '{"exit_code": 0, "time": "0", "memory": "0", "stdout": "1", "result": "success"}'};
		});
		const [runner] = await new PaizaRunnerProvider(http).runnersFor(java);
		const result = await runner?.run("print(1)", "", {});

		expect(result?.output).toBe("1");
		expect((times[1] ?? 0) - (times[0] ?? 0)).toBeGreaterThanOrEqual(900);
	});
});

describe("WorkerTicker", () => {
	const originalWorker = globalThis.Worker;
	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	class FakeWorker {
		static last: FakeWorker | null = null;
		onmessage: (() => void) | null = null;
		onerror: (() => void) | null = null;
		terminated = false;

		constructor() {
			FakeWorker.last = this;
		}

		postMessage(): void {
		}

		terminate(): void {
			this.terminated = true;
		}
	}

	afterEach(() => {
		globalThis.Worker = originalWorker;
	});

	test("Worker の通知で呼び出し、止めると終了する", () => {
		globalThis.Worker = FakeWorker as unknown as typeof Worker;
		let ticks = 0;
		const stop = new WorkerTicker().start(100, () => ticks++);
		FakeWorker.last?.onmessage?.();
		expect(ticks).toBe(1);
		stop();
		expect(FakeWorker.last?.terminated).toBe(true);
	});

	test("Worker を作れないページでは通常のタイマーで動く", async () => {
		globalThis.Worker = class {
			constructor() {
				throw new Error("blocked");
			}
		} as unknown as typeof Worker;
		let ticks = 0;
		const stop = new WorkerTicker().start(1, () => ticks++);
		await wait(20);
		stop();
		expect(ticks).toBeGreaterThan(0);
	});

	test("Worker の読み込みに失敗したら通常のタイマーへ切り替える", async () => {
		globalThis.Worker = FakeWorker as unknown as typeof Worker;
		let ticks = 0;
		const stop = new WorkerTicker().start(1, () => ticks++);
		FakeWorker.last?.onerror?.();
		expect(FakeWorker.last?.terminated).toBe(true);
		await wait(20);
		stop();
		const stopped = ticks;
		expect(stopped).toBeGreaterThan(0);
		await wait(20);
		expect(ticks).toBe(stopped);
	});
});

describe("languagesOf", () => {
	test("選択欄から言語を読み取り、空の選択肢を除く", () => {
		document.body.innerHTML = `<select>
			<option value=""></option><option value="6056"> Java 24 </option><option value="9">Whitespace</option>
		</select>`;
		expect(languagesOf(document.querySelector("select"))).toEqual([
			{id: "6056", label: "Java 24", family: "java"},
			{id: "9", label: "Whitespace", family: null},
		]);
	});
});

describe("AtCoderSite", () => {
	test("表示中の問題の選択欄だけ言語を切り替える", () => {
		document.body.innerHTML = `<div id="select-lang">
			<div><select><option value="1"></option><option value="2"></option></select></div>
			<div><select class="current"><option value="1"></option><option value="2"></option></select></div>
		</div>`;
		const changed = mock((_element: object) => undefined);
		const site = new AtCoderSite({...bridge, triggerChange: changed}, noHttp);
		site.selectLanguage("2");
		const [hidden, current] = document.querySelectorAll("select");
		expect(current?.value).toBe("2");
		expect(hidden?.value).toBe("1");
		expect(changed).toHaveBeenCalledWith(current as HTMLSelectElement);
	});

	test("サンプルを入力と出力の組にする", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_a");
		document.body.innerHTML = `<div id="task-statement">
			<div class="part io-style"><pre>N</pre></div>
			<div class="part"><section><h3>入力例 1<span class="btn-copy"></span></h3><pre>1 2</pre></section></div>
			<div class="part"><section><h3>出力例 1</h3><pre>3</pre></section></div>
		</div>`;
		const samples = await new AtCoderSite(bridge, noHttp).samples();
		expect(samples).toHaveLength(1);
		expect(samples[0]).toMatchObject({title: "Sample 1", input: "1 2", output: "3"});
		expect(samples[0]?.anchor).toBe(document.querySelector(".btn-copy"));
	});

	test("起動時に読み取ったサンプルを使い続ける", async () => {
		history.replaceState(null, "", "/contests/abc2/tasks/abc2_a");
		document.body.innerHTML = `<div id="task-statement">
			<div class="part"><section><h3>入力例 1</h3><div class="div-btn-copy"></div><pre>1</pre></section></div>
			<div class="part"><section><h3>出力例 1</h3><div class="div-btn-copy"></div><pre>2</pre></section></div>
		</div>`;
		const site = new AtCoderSite(bridge, noHttp);
		await site.samples();
		document.querySelector("#task-statement")?.replaceChildren();
		expect(await site.samples()).toMatchObject([{input: "1", output: "2"}]);
	});

	test(".io-style の中にしかサンプルがない問題も読み取る", async () => {
		history.replaceState(null, "", "/contests/maximum-cup-2018/tasks/maximum_cup_2018_d");
		document.body.innerHTML = `<div id="task-statement"><div class="io-style"><div class="part">
			<div class="div-btn-copy"><span class="btn-copy"></span></div><pre>1</pre>
			<div class="div-btn-copy"><span class="btn-copy"></span></div><pre>2</pre>
		</div></div></div>`;
		const samples = await new AtCoderSite(bridge, noHttp).samples();
		expect(samples).toMatchObject([{input: "1", output: "2"}]);
		expect(samples[0]?.anchor).toBe(document.querySelector(".btn-copy"));
	});

	test("提出ページでは問題ページからサンプルを取得する", async () => {
		history.replaceState(null, "", "/contests/abc1/submit");
		document.body.innerHTML = '<select id="select-task"><option value="abc1_a" selected>A</option></select>';
		const html = '<div id="task-statement"><div class="part"><section><pre>1</pre></section></div><div class="part"><section><pre>2</pre></section></div></div>';
		const http = new FakeHttpClient(() => ({status: 200, text: html}));
		const site = new AtCoderSite(bridge, http);
		const globals = globalThis as {unsafeWindow?: unknown};
		globals.unsafeWindow = {contestScreenName: "abc1"};
		try {
			const samples = await site.samples();
			await site.samples();
			expect(samples[0]).toMatchObject({input: "1", output: "2", anchor: null});
			expect(http.requests).toHaveLength(1);
		} finally {
			delete globals.unsafeWindow;
		}
	});
});

describe("YukicoderSite", () => {
	test("サンプルと実行ボタンの位置を読み取る", async () => {
		document.body.innerHTML = '<div class="sample"><button class="copy-sample-input"></button><pre>1</pre><pre>2</pre></div>';
		const samples = await new YukicoderSite(bridge).samples();
		expect(samples[0]).toMatchObject({input: "1", output: "2"});
		expect(samples[0]?.anchor).toBe(document.querySelector(".copy-sample-input"));
	});
});

describe("CodeforcesSite", () => {
	test("行ごとに分かれたサンプルを結合する", async () => {
		document.body.innerHTML = `<form class="submitForm"></form><div id="pageContent"></div><div class="sample-test">
			<div class="input"><div class="title"><span class="input-output-copier"></span></div>
				<pre><div class="test-example-line">1</div><div class="test-example-line">2</div></pre></div>
			<div class="output"><pre>3<br></pre></div>
		</div>`;
		const samples = await new CodeforcesSite(bridge).samples();
		expect(samples[0]).toMatchObject({input: "1\n2", output: "3\n"});
	});
});

describe("CrossTabQueue", () => {
	const descriptor = Object.getOwnPropertyDescriptor(navigator, "locks");

	afterEach(() => {
		if (descriptor) Object.defineProperty(navigator, "locks", descriptor);
		else Reflect.deleteProperty(navigator, "locks");
	});

	/** 同じ名前のタブの間で順番を守る、Web Locks の代役を置く。 */
	function stubLocks(): void {
		let last: Promise<unknown> = Promise.resolve();
		const request = (_name: string, task: () => Promise<unknown>): Promise<unknown> => {
			const result = last.then(task);
			last = result.catch(() => undefined);
			return result;
		};
		Object.defineProperty(navigator, "locks", {value: {request}, configurable: true});
	}

	async function runInTwoTabs(): Promise<number> {
		let running = 0;
		let peak = 0;
		const task = async (): Promise<void> => {
			peak = Math.max(peak, ++running);
			await new Promise((resolve) => setTimeout(resolve, 5));
			running--;
		};
		const tabs = [new CrossTabQueue("test"), new CrossTabQueue("test")];
		await Promise.all(tabs.flatMap((tab) => [tab.run(task), tab.run(task)]));
		return peak;
	}

	test("別のタブの処理とも重ねない", async () => {
		stubLocks();
		expect(await runInTwoTabs()).toBe(1);
	});

	test("Web Locks がなくてもタブの中では順番を守る", async () => {
		Object.defineProperty(navigator, "locks", {value: undefined, configurable: true});
		let running = 0;
		let peak = 0;
		const queue = new CrossTabQueue("test");
		const task = async (): Promise<void> => {
			peak = Math.max(peak, ++running);
			await new Promise((resolve) => setTimeout(resolve, 1));
			running--;
		};
		await Promise.all([queue.run(task), queue.run(task)]);
		expect(peak).toBe(1);
	});
});

describe("AtCoder のコードテスト", () => {
	const finished = {Result: {ExitCode: 0, TimeConsumption: 12, MemoryConsumption: 3456}, Stdout: "ok", Stderr: ""};
	const language = {id: "6056", label: "Java24 (OpenJDK 24.0.2)", family: "java"};
	const judge = async () => ({id: "atcoder", languages: () => [language]}) as unknown as JudgeSite;
	const globals = globalThis as {unsafeWindow?: unknown};

	beforeEach(() => {
		globals.unsafeWindow = {csrfToken: "token"};
	});

	afterEach(() => {
		delete globals.unsafeWindow;
	});

	async function runner(http: FakeHttpClient) {
		const [found] = await new AtCoderRunnerProvider(http, judge).runnersFor(language);
		if (!found) throw new Error("実行環境がない");
		return found;
	}

	test("前の実行が残っていたら、終わるのを待って送り直す", async () => {
		const statuses = [{Interval: 1, Result: {ExitCode: 0, TimeConsumption: 0, MemoryConsumption: 0}}, {}, finished];
		let submits = 0;
		const http = new FakeHttpClient(({url}) => {
			if (url.endsWith("/submit/json")) return {status: 200, text: ++submits === 1 ? "busy" : ""};
			return {status: 200, text: JSON.stringify(statuses.shift())};
		});
		expect(await (await runner(http)).run("code", "input", {})).toMatchObject({status: "OK", output: "ok", execTime: 12});
		expect(submits).toBe(2);
		expect(statuses).toHaveLength(0);
	});

	test("送り直しても断られたら、サイトの理由を伝える", async () => {
		let submits = 0;
		const http = new FakeHttpClient(({url}) => {
			if (url.endsWith("/submit/json")) {
				submits++;
				return {status: 200, text: "rejected"};
			}
			return {status: 200, text: "{}"};
		});
		await expect((await runner(http)).run("code", "input", {})).rejects.toThrow("rejected");
		expect(submits).toBe(3);
	});
});

describe("実行環境", () => {
	test("paiza の応答を実行結果に変換する", async () => {
		const http = new FakeHttpClient(({url}) => {
			if (url.includes("create")) return {status: 200, text: JSON.stringify({id: "x", status: "completed"})};
			return {
				status: 200, text: JSON.stringify({
					exit_code: 0,
					time: "0.01",
					memory: "2048",
					stdout: "ok",
					stderr: "",
					build_result: "success",
					result: "success",
				})
			};
		});
		const [runner] = await new PaizaRunnerProvider(http).runnersFor({id: "r", label: "Rust", family: "rust"});
		expect(await runner?.run("code", "input", {})).toMatchObject({
			status: "OK",
			output: "ok",
			execTime: 10,
			memory: 2.048,
		});
	});

	test("paiza のコンパイルエラーを判定する", async () => {
		const http = new FakeHttpClient(({url}) => {
			if (url.includes("create")) return {status: 200, text: JSON.stringify({id: "x", status: "completed"})};
			return {
				status: 200,
				text: JSON.stringify({
					build_result: "failure",
					build_exit_code: 1,
					build_stderr: "error",
					time: "0",
					memory: "0",
				})
			};
		});
		const [runner] = await new PaizaRunnerProvider(http).runnersFor({id: "r", label: "Rust", family: "rust"});
		expect(await runner?.run("code", "", {})).toMatchObject({status: "CE", error: "error"});
	});

	test("Wandbox のコンパイラ一覧は言語で絞り込み、キャッシュする", async () => {
		const compilers = [
			{name: "openjdk-21", language: "Java", version: "21", switches: []},
			{name: "gcc", language: "C++", version: "13", switches: []},
		];
		const http = new FakeHttpClient(() => ({status: 200, text: JSON.stringify(compilers)}));
		const provider = new WandboxRunnerProvider(http, new MemoryStore());
		expect((await provider.runnersFor(java)).map(({id}) => id)).toEqual(["wandbox:openjdk-21"]);
		await provider.runnersFor(java);
		expect(http.requests).toHaveLength(1);
	});

	test("Local Runner は同じ言語のコンパイラだけを候補にする", async () => {
		const list = [{language: "Java", compilerName: "jdk24", label: "Java 24"}, {
			language: "C++",
			compilerName: "gcc",
			label: "G++",
		}];
		const client = new LocalRunnerClient(new FakeHttpClient(() => ({
			status: 200,
			text: JSON.stringify(list),
		})), () => "http://localhost:8080");
		expect((await new LocalRunnerProvider(client).runnersFor(java)).map(({label}) => label)).toEqual(["Java 24 [Local]"]);
	});

	test("Local Runner の計測値は累積の割り当て量として返し、計測できないときは返さない", async () => {
		const runWith = async (memory: number) => {
			const client = new LocalRunnerClient(new FakeHttpClient(({body}) => {
				if (body?.includes('"list"')) {
					return {
						status: 200,
						text: JSON.stringify([{language: "Java", compilerName: "java24", label: "Java 24"}]),
					};
				}
				const response = body?.includes('"run"')
					? {status: "success", exitCode: 0, stdout: "", stderr: "", time: 1, memory}
					: {status: "success", programId: "p1", sourceCode: "", diagnostics: ""};
				return {status: 200, text: JSON.stringify(response)};
			}), () => "http://localhost:8080");
			const [runner] = await new LocalRunnerProvider(client).runnersFor(java);
			return runner!.run("code", "", {});
		};

		const measured = await runWith(2048);
		expect(measured.allocatedMemory).toBe(2048);
		expect(measured.memory).toBeUndefined();
		expect((await runWith(0)).allocatedMemory).toBeUndefined();
	});

	test("Local Runner を使わない設定なら候補にしない", async () => {
		const client = new LocalRunnerClient(noHttp, () => null);
		expect(await new LocalRunnerProvider(client).runnersFor(java)).toEqual([]);
	});
});

describe("旧スクリプトの設定の引き継ぎ", () => {
	const write = (scriptId: string, value: unknown) => {
		localStorage.setItem(`cp-toolkit:legacy:${scriptId}`, JSON.stringify(value));
	};

	test("書き出された設定を機能の設定へ変換し、受け渡し場所を空にする", () => {
		write("AtCoderHighlighter", {numColor: "#112233"});
		write("AtCoderWidenContainer", {containerWidth: "80%"});
		write("PaizaLanguageSelector", {paiza_target_language: "java"});
		write("AtCoderEasyTestForJava", {
			config: JSON.stringify({
				"codeRunner.localRunnerURL": "http://localhost:9000",
				"ui.useKeyboardShortcut": "false",
			}),
		});
		const settings = new SettingsService(new MemoryStore());
		importLegacySettings(new LocalStorageLegacyInbox(), settings);

		expect(settings.storedOptions("statement-highlight")).toEqual({numberColor: "#112233"});
		expect(settings.storedOptions("wide-layout")).toEqual({width: "80%"});
		expect(settings.storedOptions("paiza-language")).toEqual({language: "java"});
		expect(settings.storedOptions("local-runner")).toEqual({url: "http://localhost:9000"});
		expect(settings.storedOptions("easy-test")).toEqual({keyboardShortcuts: false});
		expect(localStorage.getItem("cp-toolkit:legacy:AtCoderHighlighter")).toBeNull();
	});

	test("すでに設定した機能は上書きしない", () => {
		write("AtCoderWidenContainer", {containerWidth: "80%"});
		const settings = new SettingsService(new MemoryStore());
		settings.setOption("wide-layout", "width", "60%");
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		expect(settings.storedOptions("wide-layout")).toEqual({width: "60%"});
	});

	test("旧 Easy Test の利用者には Easy Test を有効にし、選び直した ON/OFF は変えない", () => {
		const settings = new SettingsService(new MemoryStore());
		write("AtCoderEasyTestForJava", {});
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		expect(settings.isEnabled("easy-test", false)).toBe(true);

		settings.setEnabled("easy-test", false);
		write("AtCoderEasyTestForJava", {});
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		expect(settings.isEnabled("easy-test", true)).toBe(false);
	});

	test("書き出しがなければ何もしない", () => {
		const settings = new SettingsService(new MemoryStore());
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		expect(settings.storedOptions("wide-layout")).toBeUndefined();
	});
});
