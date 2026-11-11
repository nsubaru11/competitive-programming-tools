import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import {usesJavaLibrary} from "@atcoder-tools/shared";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {PastePipeline} from "@application/source/paste-pipeline";
import {type CodeRunner, RunnerCatalogService} from "@application/execution/runner-catalog";
import type {CodeEditor} from "@application/ports/code-editor";
import type {JudgeSite, SampleCase} from "@application/ports/judge-site";
import type {Translate} from "@catalog/messages";
import {easyTest} from "@features/easy-test/index";
import {createResultView} from "@features/easy-test/views";
import {javaSubmit} from "@features/java-submit/index";
import {paizaLanguage} from "@features/paiza-language/index";
import {taskDropdown} from "@features/task-dropdown/index";
import {createFakePage, createFakeServices, FakeHttpClient, MemoryStore} from "../support/fakes";

const wait = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

const shadowRoots = (): ShadowRoot[] => [...document.body.children].flatMap((element) => element.shadowRoot ?? []);
const pressKey = (key: string, modifiers: KeyboardEventInit = {}) => {
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key, bubbles: true, ...modifiers}));
};
const hover = (element: Element | null | undefined) => {
	element?.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}));
};
const tooltipText = () => {
	const tooltip = shadowRoots().flatMap((root) => root.querySelector<HTMLElement>(".tooltip") ?? [])[0];
	return tooltip && !tooltip.hidden ? tooltip.textContent : null;
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

	function createSite(overrides: Partial<Omit<JudgeSite, "submit">> = {}): JudgeSite & {
		submit: ReturnType<typeof mock>
	} {
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
			selectLanguage: () => undefined,
			onLanguageChange: () => undefined,
			onSourceChange: () => undefined,
			sourceCode: () => "code",
			setSourceCode: () => undefined,
			submit: mock(() => undefined),
			samples: async () => samples,
			...overrides,
		};
	}

	const runnerLookups = {count: 0};

	function createRunners(run: CodeRunner["run"]) {
		const runner: CodeRunner = {id: "local:java", label: "Java [Local]", kind: "local", run};
		return new RunnerCatalogService(() => [{
			runnersFor: async () => {
				runnerLookups.count++;
				return [runner];
			},
		}], ["local"], 3);
	}

	const echo = async (_code: string, input: string): Promise<RunResult> => ({status: "OK", input, output: input});

	async function start(site: JudgeSite, run: CodeRunner["run"], extra = {}) {
		await easyTest.run(undefined, createFakeServices({
			judgeSite: async () => site,
			openSettings: () => undefined,
			runners: createRunners(run),
			localRunner: new LocalRunnerClient(new FakeHttpClient(() => ({status: 500, text: ""})), () => null),
			...extra,
		}));
		await wait();
	}

	const button = (label: string) => [...document.querySelectorAll("button")].find(({textContent}) => textContent === label);
	const dock = () => shadowRoots().find((root) => root.querySelector(".dock"));
	const tabs = () => [...(dock()?.querySelectorAll<HTMLElement>(".dock-tab") ?? [])];
	const tabLabels = () => tabs().map(({firstChild}) => firstChild?.textContent);
	const activeTab = () => tabs().find(({dataset}) => dataset.active === "true")?.firstChild?.textContent;
	const row = () => document.querySelector<HTMLElement>(".cp-et-row");

	describe("ショートカットの説明", () => {
		test("カーソルを乗せるとすぐに表示し、離すと消す", async () => {
			await start(createSite(), echo);
			hover(button("Test & Submit"));
			expect(tooltipText()).toBe("Ctrl+Enter");
			hover(button("Test All Samples"));
			expect(tooltipText()).toBe("Alt+Enter");
			hover(document.body);
			expect(tooltipText()).toBeNull();
		});

		test("中止のボタンの間は表示しない", async () => {
			await start(createSite(), () => new Promise(() => undefined));
			hover(button("Test & Submit"));
			button("Test & Submit")?.click();
			await wait();
			expect(tooltipText()).toBeNull();
			hover(document.querySelector(".btn-warning"));
			expect(tooltipText()).toBeNull();
		});

		test("ショートカットを無効にしていれば表示しない", async () => {
			await easyTest.run({keyboardShortcuts: false}, createFakeServices({
				judgeSite: async () => createSite(),
				openSettings: () => undefined,
				runners: createRunners(echo),
				localRunner: new LocalRunnerClient(new FakeHttpClient(() => ({status: 500, text: ""})), () => null),
			}));
			await wait();
			hover(button("Test & Submit"));
			expect(tooltipText()).toBeNull();
		});
	});

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
		expect(row()?.dataset.tone).toBe("success");
	});

	test("不正解があれば提出しない", async () => {
		const site = createSite();
		await start(site, async (_code, input) => ({status: "OK", input, output: "wrong"}));
		button("Test & Submit")?.click();
		await wait(30);
		expect(site.submit).not.toHaveBeenCalled();
		expect(row()?.dataset.tone).toBe("warning");
	});

	describe("提出の中止", () => {
		const CANCEL = "提出を中止";

		function createGate() {
			let open: () => void = () => undefined;
			const gate = new Promise<void>((resolve) => {
				open = resolve;
			});
			const run: CodeRunner["run"] = async (_code, input) => {
				await gate;
				return {status: "OK", input, output: input};
			};
			return {run, open: () => open()};
		}

		test("テスト中はボタンが中止に変わり、押すと提出だけを取り消す", async () => {
			const site = createSite();
			const {run, open} = createGate();
			await start(site, run);
			button("Test & Submit")?.click();
			await wait();
			expect(button(CANCEL)?.classList.contains("btn-warning")).toBe(true);
			expect(button(CANCEL)?.classList.contains("disabled")).toBe(false);
			button(CANCEL)?.click();
			expect(button(CANCEL)).toBeUndefined();
			open();
			await wait(30);
			expect(site.submit).not.toHaveBeenCalled();
			expect(row()?.dataset.tone).toBe("success");
			expect(button("Test & Submit")?.classList.contains("btn-info")).toBe(true);
		});

		test("結果の行を閉じても提出しない", async () => {
			const site = createSite();
			const {run, open} = createGate();
			await start(site, run);
			button("Test & Submit")?.click();
			await wait();
			row()?.querySelector<HTMLElement>(".cp-et-close")?.click();
			expect(button("Test & Submit")).toBeDefined();
			open();
			await wait(30);
			expect(site.submit).not.toHaveBeenCalled();
		});

		test("中止のあとに押し直した分は提出する", async () => {
			const site = createSite();
			const {run, open} = createGate();
			await start(site, run);
			button("Test & Submit")?.click();
			await wait();
			button(CANCEL)?.click();
			button("Test & Submit")?.click();
			await wait();
			open();
			await wait(30);
			expect(site.submit).toHaveBeenCalledTimes(1);
		});

		test("テスト中のショートカットは無視し、二重に提出しない", async () => {
			const site = createSite();
			const {run, open} = createGate();
			await start(site, run);
			pressKey("Enter", {ctrlKey: true});
			await wait();
			pressKey("Enter", {ctrlKey: true});
			await wait();
			expect(tabLabels()).toEqual(["Easy Test+", "#1 Sample 1", "#2 Sample 2"]);
			open();
			await wait(30);
			expect(site.submit).toHaveBeenCalledTimes(1);
		});
	});

	describe("サンプルがないとき", () => {
		const originalAlert = window.alert;

		afterEach(() => {
			window.alert = originalAlert;
		});

		for (const [name, samples] of [
			["0件", async () => []],
			["取得に失敗", () => Promise.reject(new Error("offline"))],
		] as const) {
			test(`${name}なら提出せず知らせる`, async () => {
				const alert = mock(() => undefined);
				window.alert = alert;
				const site = createSite({samples});
				await start(site, echo);
				button("Test & Submit")?.click();
				await wait(30);
				expect(site.submit).not.toHaveBeenCalled();
				expect(alert).toHaveBeenCalledTimes(1);
				expect(row()).toBeNull();
				expect(button("Test & Submit")?.classList.contains("btn-info")).toBe(true);
			});
		}
	});

	test("実行環境がなければボタンを無効の表示にして理由を示す", async () => {
		await start(createSite({language: () => null}), echo);
		expect(button("Test & Submit")?.classList.contains("disabled")).toBe(true);
		expect(dock()?.querySelector("select")?.textContent).toBe("実行環境がありません");
	});

	describe("サイトの言語の切り替え", () => {
		const cpython: JudgeLanguage = {id: "6082", label: "Python (CPython 3.13.7)", family: "python3"};
		const pypy: JudgeLanguage = {id: "6083", label: "Python (PyPy 3.11-v7.3.20)", family: "python3"};

		function createJudgeRunners(ran: string[]) {
			const runner = ({id, label}: JudgeLanguage): CodeRunner => ({
				id: `atcoder:${id}`,
				label: `${label} [AtCoder]`,
				kind: "judge",
				run: async (_code, input) => {
					ran.push(id);
					return {status: "OK", input, output: input};
				},
			});
			return new RunnerCatalogService(() => [{runnersFor: async () => [runner(cpython), runner(pypy)]}], ["judge"], 3);
		}

		test("押した時点の言語で実行する", async () => {
			const ran: string[] = [];
			let language = cpython;
			await start(createSite({language: () => language}), echo, {runners: createJudgeRunners(ran)});
			language = pypy;
			button("Test All Samples")?.click();
			await wait(30);
			expect(ran).toEqual([pypy.id, pypy.id]);
		});

		test("言語ごとに選んだ実行環境は、戻したときに復元する", async () => {
			const ran: string[] = [];
			let language = cpython;
			await start(createSite({language: () => language}), echo, {runners: createJudgeRunners(ran)});
			const environment = dock()?.querySelector("select");
			if (!environment) throw new Error("実行環境の選択欄がない");
			environment.value = `atcoder:${pypy.id}`;
			environment.dispatchEvent(new Event("change"));
			language = pypy;
			button("Test All Samples")?.click();
			await wait(30);
			language = cpython;
			button("Test All Samples")?.click();
			await wait(30);
			expect(ran).toEqual([pypy.id, pypy.id, pypy.id, pypy.id]);
		});
	});

	test("すべてのサンプルを順番どおりに実行する", async () => {
		await start(createSite(), async (_code, input) => {
			await wait(input === "1" ? 20 : 0);
			return {status: "OK", input, output: input};
		});
		button("Test All Samples")?.click();
		await wait(60);
		expect(tabLabels()).toEqual(["Easy Test+", "#1 Sample 1", "#2 Sample 2"]);
		const [input, , expected] = [...(dock()?.querySelector(".result")?.querySelectorAll("textarea") ?? [])];
		expect(input?.value).toBe("1");
		expect(expected?.value).toBe("1");
		expect(tabs()[1]?.dataset.tone).toBe("success");
	});

	test("実行環境の一覧はテスト1回につき1回だけ取得する", async () => {
		await start(createSite(), echo);
		const before = runnerLookups.count;
		button("Test All Samples")?.click();
		await wait(30);
		expect(runnerLookups.count - before).toBe(1);
	});

	test("次に開くときは最後のテストの先頭の結果を表示する", async () => {
		await start(createSite(), echo);
		button("Test All Samples")?.click();
		await wait(30);
		button("Test All Samples")?.click();
		await wait(30);
		expect(activeTab()).toBe("#3 Sample 1");
		expect(dock()?.querySelector<HTMLElement>(".dock-panel")?.hidden).toBe(true);
		dock()?.querySelector<HTMLElement>(".dock-toggle")?.click();
		expect(dock()?.querySelector<HTMLElement>(".dock-panel")?.hidden).toBe(false);
		expect(activeTab()).toBe("#3 Sample 1");
	});

	test("実行中でも次の実行を受け付ける", async () => {
		await start(createSite(), () => new Promise(() => undefined));
		button("Test All Samples")?.click();
		await wait();
		expect(button("Test All Samples")?.classList.contains("disabled")).toBe(true);
		button("Test All Samples")?.click();
		await wait();
		expect(tabLabels()).toHaveLength(5);
	});

	test("行に進捗を表示し、閉じると結果のタブも閉じる", async () => {
		let finish: () => void = () => undefined;
		const gate = new Promise<void>((resolve) => {
			finish = resolve;
		});
		await start(createSite(), async (_code, input) => {
			if (input === "2") await gate;
			return {status: "OK", input, output: input};
		});
		button("Test All Samples")?.click();
		await wait();
		const labels = () => [...(row()?.querySelectorAll(".cp-et-label") ?? [])].map(({textContent}) => textContent);
		expect(labels()).toEqual(["AC", "WJ"]);
		expect(row()?.querySelector(".cp-et-progress-bar")?.textContent).toBe("1 / 2");
		finish();
		await wait();
		expect(labels()).toEqual(["AC", "AC"]);
		row()?.querySelector<HTMLElement>(".cp-et-close")?.click();
		expect(row()).toBeNull();
		expect(tabLabels()).toEqual(["Easy Test+"]);
		expect(activeTab()).toBe("Easy Test+");
	});

	test("行のラベルからその結果を開ける", async () => {
		await start(createSite(), echo);
		button("Test All Samples")?.click();
		await wait(30);
		document.querySelectorAll<HTMLElement>(".cp-et-label")[1]?.click();
		expect(activeTab()).toBe("#2 Sample 2");
		expect(dock()?.querySelector<HTMLElement>(".dock-panel")?.hidden).toBe(false);
	});

	test("サンプルの Run は結果が出てから開く", async () => {
		let finish: () => void = () => undefined;
		const gate = new Promise<void>((resolve) => {
			finish = resolve;
		});
		await start(createSite(), async (_code, input) => {
			await gate;
			return {status: "OK", input, output: input};
		});
		button("Run")?.click();
		await wait();
		expect(dock()?.querySelector<HTMLElement>(".dock-panel")?.hidden).toBe(true);
		finish();
		await wait();
		expect(dock()?.querySelector<HTMLElement>(".dock-panel")?.hidden).toBe(false);
		expect(activeTab()).toBe("#1 Sample 1");
	});

	test("許容誤差のチェックを外すと使わない", async () => {
		const options: unknown[] = [];
		await start(createSite(), async (_code, input, runOptions) => {
			options.push(runOptions.allowableError);
			return {status: "OK", input, output: input};
		});
		button("Test All Samples")?.click();
		await wait(30);
		const checkbox = dock()?.querySelector<HTMLInputElement>('input[type="checkbox"]');
		checkbox?.click();
		button("Test All Samples")?.click();
		await wait(30);
		expect(options).toEqual([1e-6, 1e-6, undefined, undefined]);
	});

	test("ショートカットは入力欄の中でも動く", async () => {
		const site = createSite();
		await start(site, echo);
		const textarea = document.createElement("textarea");
		document.body.append(textarea);
		textarea.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", ctrlKey: true, bubbles: true}));
		await wait(30);
		expect(site.submit).toHaveBeenCalledTimes(1);
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
			[...document.querySelectorAll<HTMLElement>("a")].find(({textContent}) => textContent === "Restore Last Code")?.click();
			expect(setSourceCode).toHaveBeenCalledWith("code");
		} finally {
			window.confirm = originalConfirm;
		}
	});

	test("Restore Last Code は実行中も押せる", async () => {
		await start(createSite(), () => new Promise(() => undefined));
		button("Test All Samples")?.click();
		await wait();
		const restore = [...document.querySelectorAll("a")].find(({textContent}) => textContent === "Restore Last Code");
		expect(restore?.classList.contains("disabled")).toBe(false);
	});
});

describe("javaSubmit", () => {
	const target = {
		editor: "ace",
		editorElements: ["#editor"],
		shortcut: "Ctrl+Shift+Enter",
		submitButtons: ["#submit"],
	} as const;
	const judge = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: [], submission: target};

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
			foldLines: mock(() => undefined),
		};
		return {editor, paste: () => paste(value)};
	}

	const editorServices = (editor: CodeEditor | null) => {
		const editors = {locate: async () => editor};
		return {editors, paste: new PastePipeline(editors)};
	};
	const source = "package a;\npublic class Solution {\n\tpublic static void main(String[] args) {}\n}\n";
	const offline = new LocalRunnerClient(new FakeHttpClient(() => ({status: 500, text: ""})), () => null);

	test("Local Runner がなくても、貼り付けたコードを提出用に変換する", async () => {
		const {editor, paste} = createEditor(source);
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: offline,
			...editorServices(editor),
		}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toContain("class Main");
		expect(editor.getValue()).not.toContain("package a;");
	});

	test("Local Runner があればその変換結果を使う", async () => {
		const {editor, paste} = createEditor(source);
		const http = new FakeHttpClient(() => ({
			status: 200,
			text: JSON.stringify({status: "success", sourceCode: "// transformed\n"}),
		}));
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: new LocalRunnerClient(http, () => "http://localhost:8080"),
			...editorServices(editor),
		}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toBe("// transformed\n");
	});

	test("短いコードは変換しない", async () => {
		const {editor, paste} = createEditor("short");
		await javaSubmit.run(undefined, createFakeServices({
			judge,
			localRunner: offline,
			...editorServices(editor),
		}));
		await wait();
		paste();
		await wait();
		expect(editor.getValue()).toBe("short");
	});

	test("Local Runner に接続できず lib を使うコードなら、導入方法を案内する", async () => {
		const code = "import lib.ds.UnionFind;\npublic class Solution {\n\tpublic static void main(String[] args) {}\n}\n";
		const {editor, paste} = createEditor(code);
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: offline, ...editorServices(editor)
		}));
		await wait();
		paste();
		await wait();

		const text = shadowRoots().map((root) => root.textContent).join("");
		expect(text).toContain("lib.* の展開には Local Runner が必要です");
		expect(editor.getValue()).toContain("public class Main");
	});

	test("Local Runner にライブラリが設定されていなければ、設定方法を案内する", async () => {
		const code = "import lib.ds.UnionFind;\npublic class Solution {\n\tpublic static void main(String[] args) {}\n}\n";
		const {editor, paste} = createEditor(code);
		const response = {status: "compileError", sourceCode: code, diagnostics: "", libraryMissing: true};
		const localRunner = new LocalRunnerClient(
			new FakeHttpClient(() => ({status: 200, text: JSON.stringify(response)})),
			() => "http://localhost:8080",
		);
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({judge, localRunner, ...editorServices(editor)}));
		await wait();
		paste();
		await wait();

		const text = shadowRoots().map((root) => root.textContent).join("");
		expect(text).toContain("lib.* の展開にはライブラリの設定が必要です");
		expect(text).not.toContain("lib.* の展開には Local Runner が必要です");
	});

	test("lib を使わないコードなら Local Runner がなくても案内しない", async () => {
		const {editor, paste} = createEditor(source);
		await javaSubmit.run({foldOnPaste: false}, createFakeServices({
			judge,
			localRunner: offline, ...editorServices(editor)
		}));
		await wait();
		paste();
		await wait();

		expect(shadowRoots().map((root) => root.textContent).join("")).not.toContain("Local Runner");
	});

	test("コメントの中の lib は案内の対象にしない", () => {
		expect(usesJavaLibrary("// import lib.ds.UnionFind;\nclass Main {}\n")).toBe(false);
		expect(usesJavaLibrary("import static lib.math.Mod.pow;\nclass Main {}\n")).toBe(true);
	});

	test("ショートカットで提出ボタンを押す", async () => {
		document.body.innerHTML = '<button id="submit"></button>';
		const click = mock(() => undefined);
		document.querySelector("#submit")?.addEventListener("click", click);
		await javaSubmit.run(undefined, createFakeServices({
			judge,
			localRunner: offline,
			...editorServices(null),
		}));

		pressKey("Enter", {ctrlKey: true});
		expect(click).not.toHaveBeenCalled();
		pressKey("Enter", {ctrlKey: true, shiftKey: true});
		expect(click).toHaveBeenCalledTimes(1);
	});

	test("提出ボタンにカーソルを乗せるとショートカットを表示する", async () => {
		await javaSubmit.run(undefined, createFakeServices({judge, localRunner: offline, ...editorServices(null)}));
		// 起動の後にサイトが作ったボタンでも表示する
		document.body.innerHTML = '<button id="submit"></button>';
		hover(document.querySelector("#submit"));
		expect(tooltipText()).toBe("Ctrl+Shift+Enter");
	});
});

describe("paizaLanguage", () => {
	test("指定した言語を選び、隠し項目にも反映する", async () => {
		document.body.innerHTML = `<select id="language_id">
			<option value=""></option><option value="1">JavaScript</option><option value="2">Java (OpenJDK 21)</option>
		</select><input id="programming_language_id" type="hidden">`;
		const triggerChange = mock(() => undefined);
		const page = createFakePage({triggerChange});
		void paizaLanguage.run({language: "Java"}, createFakeServices({
			page,
			judge: null,
			editors: {locate: async () => null}
		}));
		await wait();

		expect(document.querySelector<HTMLSelectElement>("#language_id")?.value).toBe("2");
		expect(document.querySelector<HTMLInputElement>("#programming_language_id")?.value).toBe("2");
		expect(triggerChange).toHaveBeenCalled();
	});

	test("言語が未設定なら何もしない", async () => {
		document.body.innerHTML = `<select id="language_id">
			<option value=""></option><option value="1">JavaScript</option><option value="2">Java (OpenJDK 21)</option>
		</select>`;
		const triggerChange = mock(() => undefined);
		const locate = mock(async () => null);
		void paizaLanguage.run({language: " "}, createFakeServices({
			page: createFakePage({triggerChange}),
			judge: null,
			editors: {locate}
		}));
		await wait();

		expect(document.querySelector<HTMLSelectElement>("#language_id")?.value).toBe("");
		expect(triggerChange).not.toHaveBeenCalled();
		expect(locate).not.toHaveBeenCalled();
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
		await taskDropdown.run(undefined, createFakeServices({
			site: new FakeHttpClient(() => ({
				status: 200,
				text: tasksPage,
			}))
		}));

		const labels = [...document.querySelectorAll(".cp-task-menu a")].map(({textContent}) => textContent?.trim());
		expect(labels).toEqual(["問題一覧", "まとめて開く...", "A - First", "B - Second"]);
	});

	test("読み込みに失敗したらその旨を表示する", async () => {
		history.replaceState(null, "", "/contests/abc2/tasks/abc2_a");
		document.body.innerHTML = '<ul id="contest-nav-tabs"><li><a href="/contests/abc2/tasks">問題</a></li></ul>';
		await taskDropdown.run(undefined, createFakeServices({
			site: new FakeHttpClient(() => ({
				status: 500,
				text: "",
			}))
		}));
		expect(document.querySelector(".cp-task-menu")?.textContent).toContain("読み込み失敗");
	});
});

describe("Easy Test の結果の表示", () => {
	test("内部エラーは案内の文言を表示し、詳細があれば続けて表示する", () => {
		const view = createResultView(((key: string) => key) as Translate);
		view.show({status: "IE", input: "", error: "Error: boom"});
		const errorField = view.element.querySelectorAll("textarea")[3]!;
		expect(errorField.value).toBe("easyTest.internalError\nError: boom");
		expect(errorField.closest("label")!.hidden).toBe(false);
	});

	test("内部エラーは詳細がなくても案内の文言を表示する", () => {
		const view = createResultView(((key: string) => key) as Translate);
		view.show({status: "IE", input: ""});
		expect(view.element.querySelectorAll("textarea")[3]!.value).toBe("easyTest.internalError");
	});

	const memoryCell = (result: Partial<RunResult>): string | null => {
		const view = createResultView(((key: string) => key) as Translate);
		view.show({status: "OK", input: "", ...result});
		return view.element.querySelectorAll("td")[2]!.textContent;
	};

	test("判定サーバーの使用量と、Local Runner の累積の割り当て量を区別する", () => {
		expect(memoryCell({memory: 2048})).toBe("2048 KB");
		expect(memoryCell({allocatedMemory: 2048})).toBe("2048 KB (easyTest.allocated)");
		expect(memoryCell({})).toBe("");
	});
});
