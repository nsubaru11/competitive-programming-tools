import {beforeEach, describe, expect, test} from "bun:test";
import {importLegacySettings} from "@application/settings/legacy-import";
import {SettingsService} from "@application/settings/settings-service";
import {AtCoderSite} from "@adapters/judges/atcoder";
import {CodeforcesSite} from "@adapters/judges/codeforces";
import {languagesOf} from "@adapters/judges/languages";
import {YukicoderSite} from "@adapters/judges/yukicoder";
import {LocalStorageLegacyInbox} from "@adapters/page/local-storage-legacy-inbox";
import {LocalRunnerProvider, PaizaRunnerProvider} from "@adapters/runners/simple-runners";
import {WandboxRunnerProvider} from "@adapters/runners/wandbox";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {FakeHttpClient, MemoryStore} from "../support/fakes";

const bridge = {
	onChange: () => undefined,
	triggerChange: () => undefined,
	renderMath: () => undefined,
	highlightCode: () => undefined,
};
const noHttp = new FakeHttpClient(() => ({status: 500, text: ""}));
const java = {id: "1", label: "Java 21", family: "java"};

beforeEach(() => {
	document.body.replaceChildren();
	localStorage.clear();
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
		write("AtCoderCustomDefaultSubmissions", {config: {language: "Rust", includeTaskFilter: false}});
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
		expect(settings.storedOptions("submission-defaults")).toEqual({language: "Rust", taskFilter: false});
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

	test("書き出しがなければ何もしない", () => {
		const settings = new SettingsService(new MemoryStore());
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		expect(settings.storedOptions("wide-layout")).toBeUndefined();
	});
});
