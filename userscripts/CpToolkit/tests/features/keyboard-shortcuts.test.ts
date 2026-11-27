import {describe, expect, mock, test} from "bun:test";
import type {FeatureServices} from "@application/feature/definition";
import type {CodeEditor} from "@application/ports/code-editor";
import {SHORTCUT_ACTIONS, ShortcutActions} from "@application/shortcuts/shortcut-actions";
import {keyboardShortcuts} from "@features/keyboard-shortcuts/index";
import {createFakeServices} from "../support/fakes";
import {hover, pressKey, tooltipText, wait} from "../support/dom";

describe("keyboardShortcuts の入出力例、問題、ページの操作", () => {
	const atcoder = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: []};
	const samples = async () => [
		{title: "Sample 1", input: "1 2\n", output: "3\n"},
		{title: "Sample 2", input: "5 6\n", output: null},
	];
	const start = async (overrides: Partial<FeatureServices>, keys: Record<string, string> = {}) => {
		const shortcuts = new ShortcutActions();
		await keyboardShortcuts.run(keys, createFakeServices({
			judge: atcoder,
			shortcuts,
			isOnRoute: (route) => route === "atcoder:task",
			openSettings: () => undefined,
			...overrides,
		}));
		return shortcuts;
	};

	test("入力例と出力例を番号で分けてコピーし、提出欄の中でも反応する", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_a");
		const written: string[] = [];
		await start({samples, clipboard: {write: (text) => written.push(text)}});
		const textarea = document.body.appendChild(document.createElement("textarea"));
		pressKey("2", {ctrlKey: true, altKey: true, code: "Digit2"}, textarea);
		pressKey("!", {ctrlKey: true, shiftKey: true, altKey: true, code: "Digit1"}, textarea);
		// 出力例の無い入出力例と、無い番号はコピーしない
		pressKey("@", {ctrlKey: true, shiftKey: true, altKey: true, code: "Digit2"});
		pressKey("9", {ctrlKey: true, altKey: true, code: "Digit9"});
		await wait();
		expect(written).toEqual(["5 6\n", "3\n"]);
	});

	test("AltGr で入力する文字は妨げない", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_a");
		const written: string[] = [];
		await start({samples, clipboard: {write: (text) => written.push(text)}});
		pressKey("@", {ctrlKey: true, altKey: true, code: "Digit2", altGraph: true});
		await wait();
		expect(written).toEqual([]);
	});

	test("コンテストのページと、ほかの機能の操作を開く", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_b");
		const opened: string[] = [];
		const originalOpen = window.open;
		window.open = ((url: string) => {
			opened.push(url);
			return null;
		}) as typeof window.open;
		try {
			const shortcuts = await start({}, {openEditorial: "Alt+E"});
			shortcuts.register(SHORTCUT_ACTIONS.acByTime, () => {
				opened.push("ac");
				return true;
			});
			pressKey("r", {ctrlKey: true, shiftKey: true, altKey: true, code: "KeyR"});
			pressKey("e", {altKey: true, code: "KeyE"});
			pressKey("f", {ctrlKey: true, shiftKey: true, altKey: true, code: "KeyF"});
			expect(opened).toEqual(["/contests/abc1/standings", "/contests/abc1/tasks/abc1_b/editorial", "ac"]);
			expect(shortcuts.keyOf(SHORTCUT_ACTIONS.acByTime)).toBe("Ctrl+Shift+Alt+F");
		} finally {
			window.open = originalOpen;
		}
	});

	test("前後の問題と、順番で選んだ問題へ移る", async () => {
		history.replaceState(null, "", "/contests/abc1/tasks/abc1_b");
		const tasks = ["a", "b", "x"].map((id) => ({url: `/contests/abc1/tasks/abc1_${id}`, label: id.toUpperCase(), name: ""}));
		const visited: string[] = [];
		const assign = mock((url: string | URL) => visited.push(String(url)));
		const original = Object.getOwnPropertyDescriptor(window.location, "assign");
		Object.defineProperty(window.location, "assign", {value: assign, configurable: true});
		try {
			await start({contestTasks: async () => tasks});
			pressKey("ArrowRight", {ctrlKey: true, shiftKey: true, altKey: true});
			pressKey("ArrowLeft", {ctrlKey: true, shiftKey: true, altKey: true});
			// 記号は見ず、一覧の上から順に A、B、C とする
			pressKey("c", {ctrlKey: true, altKey: true, code: "KeyC"});
			pressKey("d", {ctrlKey: true, altKey: true, code: "KeyD"});
			await wait();
			expect(visited).toEqual(["/contests/abc1/tasks/abc1_x", "/contests/abc1/tasks/abc1_a", "/contests/abc1/tasks/abc1_x"]);
		} finally {
			if (original) Object.defineProperty(window.location, "assign", original);
		}
	});
});

describe("keyboardShortcuts の折りたたみと Mac のキー", () => {
	const target = {editor: "ace" as const, editorElements: ["#editor"], submitButtons: []};
	const site = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: [], submission: target};

	test("カーソルの位置のブロックを折りたたみ、開く。記号のキーは Shift で変わった文字でも照合する", async () => {
		const fold = mock(() => true);
		const unfold = mock(() => true);
		const editor = {foldAtCursor: fold, unfoldAtCursor: unfold} as unknown as CodeEditor;
		await keyboardShortcuts.run(undefined, createFakeServices({
			judge: site,
			isOnRoute: () => false,
			openSettings: () => undefined,
			editors: {locate: async () => editor},
		}));
		await wait(600);
		pressKey("{", {ctrlKey: true, shiftKey: true, code: "BracketRight"});
		pressKey("}", {ctrlKey: true, shiftKey: true, code: "Backslash"});
		expect(fold).toHaveBeenCalledTimes(1);
		expect(unfold).toHaveBeenCalledTimes(1);
	});

	test("Cmd を書け、Cmd を押したときは Cmd を書いたキーだけが反応する", async () => {
		const openSettings = mock(() => undefined);
		await keyboardShortcuts.run({openSettings: "command+i"}, createFakeServices({judge: null, isOnRoute: () => false, openSettings}));
		pressKey("i", {ctrlKey: true, code: "KeyI"});
		expect(openSettings).not.toHaveBeenCalled();
		pressKey("i", {metaKey: true, code: "KeyI"});
		expect(openSettings).toHaveBeenCalledTimes(1);
	});
});

describe("keyboardShortcuts の重なったキー", () => {
	test("後の項目がそのページで使えなければ、前の項目の操作を行う", async () => {
		document.body.innerHTML = '<button id="submit"></button>';
		const click = mock(() => undefined);
		document.querySelector("#submit")?.addEventListener("click", click);
		const paiza = {id: "paiza", name: "paiza", matches: [], routes: {}, navigationLists: [], submission: {
			editor: "ace" as const, editorElements: ["#editor"], submitButtons: ["#submit"],
		}};
		// Easy Test+ の動かないページで、提出を Easy Test+ と同じキーにする
		await keyboardShortcuts.run({submit: "Ctrl+Enter"}, createFakeServices({
			judge: paiza,
			isOnRoute: () => false,
			openSettings: () => undefined,
			editors: {locate: async () => null},
		}));
		await wait();
		pressKey("Enter", {ctrlKey: true});
		expect(click).toHaveBeenCalledTimes(1);
	});
});

describe("keyboardShortcuts の提出", () => {
	const target = {editor: "ace", editorElements: ["#editor"], submitButtons: ["#submit"]} as const;
	const judge = {id: "atcoder", name: "AtCoder", matches: [], routes: {}, navigationLists: [], submission: target};
	const noEditor = {locate: async () => null};

	test("ショートカットキーの機能で提出ボタンを押す", async () => {
		document.body.innerHTML = '<button id="submit"></button>';
		const click = mock(() => undefined);
		document.querySelector("#submit")?.addEventListener("click", click);
		await keyboardShortcuts.run(undefined, createFakeServices({judge, editors: noEditor, openSettings: () => undefined}));
		await wait();

		pressKey("Enter", {ctrlKey: true});
		expect(click).not.toHaveBeenCalled();
		pressKey("Enter", {ctrlKey: true, shiftKey: true});
		expect(click).toHaveBeenCalledTimes(1);
	});

	test("提出ボタンにカーソルを乗せるとショートカットを表示する", async () => {
		await keyboardShortcuts.run(undefined, createFakeServices({judge, editors: noEditor, openSettings: () => undefined}));
		await wait();
		// 起動の後にサイトが作ったボタンでも表示する
		document.body.innerHTML = '<button id="submit"></button>';
		hover(document.querySelector("#submit"));
		expect(tooltipText()).toBe("Ctrl+Shift+Enter");
	});

	test("ショートカットキーは自分で選べ、空欄(以前の none も)で使わない", async () => {
		document.body.innerHTML = '<button id="submit"></button>';
		const click = mock(() => undefined);
		const openSettings = mock(() => undefined);
		document.querySelector("#submit")?.addEventListener("click", click);
		await keyboardShortcuts.run({submit: "alt+s", openSettings: "none"}, createFakeServices({judge, editors: noEditor, openSettings}));
		await wait();
		pressKey("s", {altKey: true});
		expect(click).toHaveBeenCalledTimes(1);
		pressKey("i", {ctrlKey: true});
		expect(openSettings).not.toHaveBeenCalled();
	});
});
