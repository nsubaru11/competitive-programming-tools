import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import type {JudgeLanguage} from "@domain/execution/result";
import type {CodeEditor} from "@application/ports/code-editor";
import type {JudgeSite} from "@application/ports/judge-site";
import {PastePipeline} from "@application/source/paste-pipeline";
import {sourceComments} from "@features/source-comments/index";
import {createFakePage, createFakeServices, MemoryStore} from "../support/fakes";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const java: JudgeLanguage = {id: "1", label: "Java 24", family: "java"};
const python: JudgeLanguage = {id: "2", label: "Python 3", family: "python3"};
const ocaml: JudgeLanguage = {id: "3", label: "OCaml", family: "ocaml"};
const text: JudgeLanguage = {id: "4", label: "Text", family: "text"};

const target = {editor: "ace", editorElements: ["#editor"], shortcut: "Ctrl+Shift+Enter", submitButtons: ["#submit"]} as const;
const judge = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: [], submission: target};
const taskUrl = "https://atcoder.jp/contests/abc1/tasks/abc1_a";

function createContext() {
	let code = "";
	let language: JudgeLanguage | null = java;
	let task = taskUrl;
	let onPaste = (_pasted: string): void => undefined;
	let onLanguageChange = (): void => undefined;
	const editor: CodeEditor = {
		getValue: () => code,
		setValue(next) {
			code = next;
		},
		isJava: () => language === java,
		isReadOnly: () => false,
		setWritable: () => undefined,
		onPaste(listener) {
			onPaste = listener;
		},
		onChange: () => undefined,
		foldLines: () => undefined,
	};
	const site = {
		id: "atcoder",
		mounts: {testButtons: null, sideButtons: null, results: null},
		taskUri: () => task,
		languages: () => [],
		language: () => language,
		selectLanguage: () => undefined,
		onLanguageChange(listener: () => void) {
			onLanguageChange = listener;
		},
		onSourceChange: () => undefined,
		sourceCode: () => code,
		setSourceCode(next: string) {
			code = next;
		},
		submit: mock(() => undefined),
		samples: async () => [],
	} satisfies JudgeSite;
	const editors = {locate: async () => editor};
	const state = new MemoryStore();
	const paste = new PastePipeline(editors);
	const services = {judge, judgeSite: async () => site, page: createFakePage(), paste, state, editors};
	return {
		services,
		state,
		code: () => code,
		setCode(next: string) {
			code = next;
		},
		setTask(next: string) {
			task = next;
		},
		async pasteCode(pasted: string) {
			code = pasted;
			onPaste(pasted);
			await flush();
		},
		async pasteInto(result: string, pasted: string) {
			code = result;
			onPaste(pasted);
			await flush();
		},
		changeLanguage(next: JudgeLanguage | null) {
			language = next;
			onLanguageChange();
		},
	};
}

async function open(options?: unknown) {
	const context = createContext();
	await sourceComments.run(options, createFakeServices(context.services));
	await flush();
	openPanel();
	return context;
}

const panelRoot = (): ShadowRoot => {
	const root = [...document.body.children].flatMap((element) => element.shadowRoot ?? []).findLast((candidate) => candidate.querySelector(".comment-slots"));
	if (!root) throw new Error("panel is not open");
	return root;
};

const openPanel = (): void => document.querySelector<HTMLButtonElement>(".editor-buttons button")?.click();

const slot = (index: number) => {
	const element = panelRoot().querySelectorAll(".comment-slot")[index];
	if (!element) throw new Error("slot not found");
	const [taskOnly, commentOut] = element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
	const [history, presets] = element.querySelectorAll("select");
	return {
		textarea: element.querySelector("textarea") as HTMLTextAreaElement,
		taskOnly: taskOnly as HTMLInputElement,
		commentOut: commentOut as HTMLInputElement,
		history: history as HTMLSelectElement,
		presets: presets as HTMLSelectElement,
		buttons: element.querySelectorAll("button"),
	};
};

function setText(index: number, value: string): void {
	const {textarea} = slot(index);
	textarea.value = value;
	textarea.dispatchEvent(new Event("change"));
}

function toggle(input: HTMLInputElement, checked: boolean): void {
	input.checked = checked;
	input.dispatchEvent(new Event("change"));
}

function select(element: HTMLSelectElement, value: string): void {
	element.value = value;
	element.dispatchEvent(new Event("change"));
}

beforeEach(() => {
	document.head.replaceChildren();
	document.body.innerHTML = '<div class="editor-buttons"></div>';
	history.replaceState(null, "", "/contests/abc1/tasks/abc1_a");
});

afterEach(() => {
	document.body.replaceChildren();
	history.replaceState(null, "", "/");
});

describe("sourceComments", () => {
	test("貼り付けたコードの先頭と末尾へ、単一行コメントを追記する", async () => {
		const context = await open();
		setText(0, "https://example.com/a\nhttps://example.com/b");
		setText(1, "footer");

		await context.pasteCode("class Main {}\n");

		expect(context.code()).toBe("// https://example.com/a\n// https://example.com/b\nclass Main {}\n// footer\n");
	});

	test("複数行コメントを選べる", async () => {
		const context = await open({style: "block"});
		setText(0, "header");
		await context.pasteCode("class Main {}\n");
		expect(context.code()).toBe("/*\nheader\n*/\nclass Main {}\n");
	});

	test("言語を変えるとコメントの書き方も変える", async () => {
		const context = await open();
		setText(0, "header");
		setText(1, "footer");
		await context.pasteCode("code\n");

		context.changeLanguage(python);
		expect(context.code()).toBe("# header\ncode\n# footer\n");

		context.changeLanguage(java);
		expect(context.code()).toBe("// header\ncode\n// footer\n");
	});

	test("コメントの書き方が分からない言語へ変えたら、元のまま残して知らせる", async () => {
		const context = await open();
		setText(0, "header");
		await context.pasteCode("code\n");

		context.changeLanguage(text);
		expect(context.code()).toBe("// header\ncode\n");
		expect(panelRoot().querySelector<HTMLElement>(".comment-warning")?.hidden).toBe(false);

		context.changeLanguage(python);
		expect(context.code()).toBe("# header\ncode\n");
		expect(panelRoot().querySelector<HTMLElement>(".comment-warning")?.hidden).toBe(true);
	});

	test("単一行コメントのない言語では行ごとに囲む", async () => {
		const context = await open();
		context.changeLanguage(ocaml);
		setText(0, "a\nb");
		await context.pasteCode("code\n");
		expect(context.code()).toBe("(* a *)\n(* b *)\ncode\n");
	});

	test("コメントアウトしない設定では、書いた文字列をそのまま挿入する", async () => {
		const context = await open();
		toggle(slot(0).commentOut, false);
		setText(0, "/* written by hand */");
		await context.pasteCode("code\n");
		expect(context.code()).toBe("/* written by hand */\ncode\n");

		context.changeLanguage(python);
		expect(context.code()).toBe("/* written by hand */\ncode\n");
	});

	test("変数を問題の情報に置き換える", async () => {
		const context = await open();
		setText(0, "{url} {task} {contest} {unknown}");
		await context.pasteCode("code\n");
		expect(context.code()).toBe(`// ${taskUrl} abc1_a abc1 {unknown}\ncode\n`);
	});

	test("コードの一部の貼り付けでは挿入しない", async () => {
		const context = await open();
		setText(0, "header");
		await context.pasteInto("class Main {\n\tint x;\n}\n", "int x;");
		expect(context.code()).toBe("class Main {\n\tint x;\n}\n");
	});

	test("Windows の改行で貼り付けても全体の貼り付けと判定する", async () => {
		const context = await open();
		setText(0, "header");
		await context.pasteInto("a\nb\n", "a\r\nb\r\n");
		expect(context.code()).toBe("// header\na\nb\n");
	});

	test("同じコメントを含むコードを貼り付けても重ねない", async () => {
		const context = await open();
		setText(0, "header");
		await context.pasteCode("// header\ncode\n");
		expect(context.code()).toBe("// header\ncode\n");
	});

	test("内容を変えると、挿入した部分も書き換える", async () => {
		const context = await open();
		setText(0, "first");
		await context.pasteCode("code\n");
		setText(0, "second");
		expect(context.code()).toBe("// second\ncode\n");

		setText(0, "");
		expect(context.code()).toBe("code\n");
	});

	test("挿入した部分を編集したら、そのあとは書き換えない", async () => {
		const context = await open();
		setText(0, "header");
		await context.pasteCode("code\n");
		context.setCode("// edited\ncode\n");

		context.changeLanguage(python);
		expect(context.code()).toBe("// edited\ncode\n");
	});

	test("ボタンで現在のコードへ反映する", async () => {
		const context = await open();
		setText(0, "header");
		context.setCode("typed\n");
		panelRoot().querySelector<HTMLButtonElement>(".modal-footer .primary")?.click();
		expect(context.code()).toBe("// header\ntyped\n");
	});

	test("前回の内容を次の問題でも使い、ヘッダーとフッターは別々に記憶する", async () => {
		const first = createContext();
		await sourceComments.run(undefined, createFakeServices(first.services));
		await flush();
		openPanel();
		setText(0, "shared header");

		document.body.innerHTML = '<div class="editor-buttons"></div>';
		const second = createContext();
		second.setTask(`${taskUrl}x`);
		await sourceComments.run(undefined, createFakeServices({...second.services, state: first.state}));
		await flush();
		openPanel();

		expect(slot(0).textarea.value).toBe("shared header");
		expect(slot(1).textarea.value).toBe("");
	});

	test("「この問題のみ」の内容は他の問題へ持ち越さない", async () => {
		const context = await open();
		setText(0, "shared");
		toggle(slot(0).taskOnly, true);
		setText(0, "only here");

		document.body.innerHTML = '<div class="editor-buttons"></div>';
		const other = createContext();
		other.setTask(`${taskUrl}x`);
		await sourceComments.run(undefined, createFakeServices({...other.services, state: context.state}));
		await flush();
		openPanel();
		expect(slot(0).textarea.value).toBe("shared");
		expect(slot(0).taskOnly.checked).toBe(false);

		document.body.innerHTML = '<div class="editor-buttons"></div>';
		const same = createContext();
		await sourceComments.run(undefined, createFakeServices({...same.services, state: context.state}));
		await flush();
		openPanel();
		expect(slot(0).textarea.value).toBe("only here");
		expect(slot(0).taskOnly.checked).toBe(true);
	});

	test("履歴から復元する", async () => {
		await open();
		setText(0, "old");
		setText(0, "new");

		const {history: historySelect, textarea} = slot(0);
		expect([...historySelect.options].map((option) => option.textContent).slice(1)).toEqual(["new", "old"]);
		select(historySelect, "1");
		expect(textarea.value).toBe("old");
	});

	test("名前を付けて保存し、呼び出して削除できる", async () => {
		await open();
		const prompt = window.prompt;
		window.prompt = () => "reference";
		setText(0, "saved text");
		const {buttons, presets, textarea} = slot(0);
		buttons[0]?.click();
		window.prompt = prompt;
		expect([...presets.options].map((option) => option.value)).toEqual(["", "reference"]);

		setText(0, "changed");
		select(presets, "reference");
		expect(textarea.value).toBe("saved text");

		buttons[1]?.click();
		expect([...slot(0).presets.options].map((option) => option.value)).toEqual([""]);
	});

	test("内容があるとボタンの色を変える", async () => {
		await open();
		const button = document.querySelector(".editor-buttons button");
		expect(button?.classList.contains("btn-default")).toBe(true);

		setText(1, "footer");
		expect(button?.classList.contains("btn-info")).toBe(true);
		expect(button?.classList.contains("btn-default")).toBe(false);

		setText(1, "");
		expect(button?.classList.contains("btn-default")).toBe(true);
	});

	test("書けない言語では通知でも知らせる", async () => {
		const context = await open();
		context.changeLanguage(text);
		setText(0, "header");
		await context.pasteCode("code\n");

		const toasts = [...document.body.children].map((element) => element.shadowRoot?.textContent ?? "").join("");
		expect(toasts).toContain("コメントを挿入していません");
	});

	test("提出欄のないページでは何も表示しない", async () => {
		document.body.innerHTML = "";
		await open();
		expect(document.querySelector("button")).toBeNull();
	});
});
