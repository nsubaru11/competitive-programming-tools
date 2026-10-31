import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {type CodeRunner, RunnerCatalogService} from "@application/execution/runner-catalog";
import type {CodeEditor} from "@application/ports/code-editor";
import type {JudgeSite, SampleCase} from "@application/ports/judge-site";
import {easyTest} from "@features/easy-test/index";
import {javaSubmit} from "@features/java-submit/index";
import {paizaLanguage} from "@features/paiza-language/index";
import {taskDropdown} from "@features/task-dropdown/index";
import {createFakeServices, FakeHttpClient, MemoryStore} from "../support/fakes";

const wait = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

const shadowRoots = (): ShadowRoot[] => [...document.body.children].flatMap((element) => element.shadowRoot ?? []);
const pressKey = (key: string, modifiers: KeyboardEventInit = {}) => {
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key, bubbles: true, ...modifiers}));
};

beforeEach(() => {
	document.head.replaceChildren();
	document.body.replaceChildren();
});

afterEach(() => {
	document.body.replaceChildren();
});

describe("easyTest", () => {
	const java: JudgeLanguage = {id: "6056", label: "Java 24", family: "java"};

	function createSite(overrides: Partial<Omit<JudgeSite, "submit">> = {}): JudgeSite & {submit: ReturnType<typeof mock>} {
		const anchor = document.createElement("span");
		document.body.append(anchor);
		const buttons = document.createElement("div");
		const results = document.createElement("div");
		document.body.append(buttons, results);
		const samples: readonly SampleCase[] = [
			{title: "Sample 1", input: "1", output: "1", anchor},
			{title: "Sample 2", input: "2", output: "2", anchor: null},
		];
		return {
			id: "atcoder",
			mounts: {testButtons: buttons, sideButtons: buttons, results},
			taskUri: () => "https://atcoder.jp/contests/abc1/tasks/abc1_a",
			languages: () => [java],
			language: () => java,
			onLanguageChange: () => undefined,
			onSourceChange: () => undefined,
			sourceCode: () => "code",
			setSourceCode: () => undefined,
			submit: mock(() => undefined),
			samples: async () => samples,
			...overrides,
		};
	}

	function createRunners(run: CodeRunner["run"]) {
		const runner: CodeRunner = {id: "local:java", label: "Java [Local]", kind: "local", run};
		return new RunnerCatalogService(() => [{runnersFor: async () => [runner]}], ["local"], 3);
	}

	const echo = async (_code: string, input: string): Promise<RunResult> => ({status: "OK", input, output: input});

	async function start(site: JudgeSite, run: CodeRunner["run"], extra = {}) {
		await easyTest.run(undefined, createFakeServices({
			judgeSite: async () => site,
			runners: createRunners(run),
			localRunner: new LocalRunnerClient(new FakeHttpClient(() => ({status: 500, text: ""})), () => null),
			...extra,
		}));
		await wait();
	}

	const button = (label: string) => [...document.querySelectorAll("button")].find(({textContent}) => textContent === label);

	test("サンプルの実行ボタンは置ける場所にだけ追加する", async () => {
		await start(createSite(), echo);
		expect([...document.querySelectorAll("button")].filter(({textContent}) => textContent === "Run")).toHaveLength(1);
	});

	test("すべて正解なら提出する", async () => {
		const site = createSite();
		await start(site, echo);
		button("Test & Submit")?.click();
		await wait(30);
		expect(site.submit).toHaveBeenCalledTimes(1);
		expect(document.querySelector(".alert-success")).not.toBeNull();
	});

	test("不正解があれば提出しない", async () => {
		const site = createSite();
		await start(site, async (_code, input) => ({status: "OK", input, output: "wrong"}));
		button("Test & Submit")?.click();
		await wait(30);
		expect(site.submit).not.toHaveBeenCalled();
		expect(document.querySelector(".alert-warning")).not.toBeNull();
	});

	test("実行環境がなければボタンを無効にする", async () => {
		await start(createSite({language: () => null}), echo);
		expect(button("Test & Submit")?.disabled).toBe(true);
	});

	test("実行結果をタブに表示する", async () => {
		await start(createSite(), echo);
		button("Test All Samples")?.click();
		await wait(30);
		const dock = shadowRoots().find((root) => root.querySelector(".dock"));
		expect(dock?.querySelectorAll(".dock-tab")).toHaveLength(3);
		expect(dock?.querySelector(".result-status")?.textContent).toBe("AC");
	});

	test("実行したコードを記憶し、呼び戻せる", async () => {
		const setSourceCode = mock((_code: string) => undefined);
		const state = new MemoryStore();
		const originalConfirm = window.confirm;
		window.confirm = () => true;
		try {
			await start(createSite({setSourceCode}), echo, {state});
			button("Test All Samples")?.click();
			await wait(30);
			button("Restore Last Play")?.click();
			expect(setSourceCode).toHaveBeenCalledWith("code");
		} finally {
			window.confirm = originalConfirm;
		}
	});
});

describe("javaSubmit", () => {
	const target = {editor: "ace", editorElements: ["#editor"], shortcut: "Ctrl+Shift+Enter", submitButtons: ["#submit"]} as const;
	const judge = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: [], submission: target};

	function createEditor(initial: string) {
		let value = initial;
		let paste = (): void => undefined;
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
			foldLines: mock(() => undefined),
		};
		return {editor, paste: () => paste()};
	}

	const source = "package a;\npublic class Solution {\n\tpublic static void main(String[] args) {}\n}\n";
	const offline = new LocalRunnerClient(new FakeHttpClient(() => ({status: 500, text: ""})), () => null);

	test("Local Runner がなくても、貼り付けたコードを提出用に変換する", async () => {
		const {editor, paste} = createEditor(source);
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: offline,
			editors: {locate: async () => editor},
		}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toContain("class Main");
		expect(editor.getValue()).not.toContain("package a;");
	});

	test("Local Runner があればその変換結果を使う", async () => {
		const {editor, paste} = createEditor(source);
		const http = new FakeHttpClient(() => ({status: 200, text: JSON.stringify({status: "success", sourceCode: "// transformed\n"})}));
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: new LocalRunnerClient(http, () => "http://localhost:8080"),
			editors: {locate: async () => editor},
		}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toBe("// transformed\n");
	});

	test("短いコードは変換しない", async () => {
		const {editor, paste} = createEditor("short");
		await javaSubmit.run(undefined, createFakeServices({judge, localRunner: offline, editors: {locate: async () => editor}}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toBe("short");
	});

	test("ショートカットで提出ボタンを押す", async () => {
		document.body.innerHTML = '<button id="submit"></button>';
		const click = mock(() => undefined);
		document.querySelector("#submit")?.addEventListener("click", click);
		await javaSubmit.run(undefined, createFakeServices({judge, localRunner: offline, editors: {locate: async () => null}}));

		pressKey("Enter", {ctrlKey: true});
		expect(click).not.toHaveBeenCalled();
		pressKey("Enter", {ctrlKey: true, shiftKey: true});
		expect(click).toHaveBeenCalledTimes(1);
	});
});

describe("paizaLanguage", () => {
	test("指定した言語を選び、隠し項目にも反映する", async () => {
		document.body.innerHTML = `<select id="language_id">
			<option value=""></option><option value="1">JavaScript</option><option value="2">Java (OpenJDK 21)</option>
		</select><input id="programming_language_id" type="hidden">`;
		const triggerChange = mock(() => undefined);
		const page = {onChange: () => undefined, triggerChange, renderMath: () => undefined, highlightCode: () => undefined};
		void paizaLanguage.run({language: "Java"}, createFakeServices({page, judge: null}));
		await wait();

		expect(document.querySelector<HTMLSelectElement>("#language_id")?.value).toBe("2");
		expect(document.querySelector<HTMLInputElement>("#programming_language_id")?.value).toBe("2");
		expect(triggerChange).toHaveBeenCalled();
	});
});

describe("taskDropdown", () => {
	const tasksPage = `<html><body><div id="contest-nav-tabs"></div><div class="col-sm-12"><table><tbody>
		<tr><td><a href="/contests/abc1/tasks/abc1_a">A</a></td><td><a>First</a></td></tr>
		<tr><td><a href="/contests/abc1/tasks/abc1_b">B</a></td><td><a>Second</a></td></tr>
	</tbody></table></div></body></html>`;

	test("タブに問題の一覧を追加する", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_a");
		document.body.innerHTML = '<ul id="contest-nav-tabs-list"><li><a href="/contests/abc1/tasks">問題</a></li></ul>';
		document.querySelector("ul")!.id = "contest-nav-tabs";
		await taskDropdown.run(undefined, createFakeServices({site: new FakeHttpClient(() => ({status: 200, text: tasksPage}))}));

		const labels = [...document.querySelectorAll(".cp-task-menu a")].map(({textContent}) => textContent);
		expect(labels).toEqual(["問題一覧", "まとめて開く...", "A - First", "B - Second"]);
	});

	test("読み込みに失敗したらその旨を表示する", async () => {
		history.replaceState(null, "", "/contests/abc2/tasks/abc2_a");
		document.body.innerHTML = '<ul id="contest-nav-tabs"><li><a href="/contests/abc2/tasks">問題</a></li></ul>';
		await taskDropdown.run(undefined, createFakeServices({site: new FakeHttpClient(() => ({status: 500, text: ""}))}));
		expect(document.querySelector(".cp-task-menu")?.textContent).toContain("読み込み失敗");
	});
});
