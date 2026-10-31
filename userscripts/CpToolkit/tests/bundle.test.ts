import {afterAll, afterEach, beforeAll, describe, expect, mock, spyOn, test} from "bun:test";
import {dirname, join} from "node:path";

// ビルド済みの配布物を、Tampermonkey の API を差し替えて実行する。先に build が必要。

const bundlePath = join(dirname(import.meta.path), "..", "dist", "CpToolkit.user.js");

type GmApi = {
	GM_info: {script: {name: string; version: string}};
	GM_getValue: (key: string) => unknown;
	GM_setValue: (key: string, value: unknown) => void;
	GM_addValueChangeListener: () => number;
	GM_registerMenuCommand: (label: string, action: () => void) => number;
	GM_setClipboard: () => void;
	GM_notification: () => void;
	GM_xmlhttpRequest: () => void;
	unsafeWindow: unknown;
};

describe("配布物", () => {
	let code: string;
	const commands = new Map<string, () => void>();
	const addListener = spyOn(document, "addEventListener");

	function createGmApi(stored: Record<string, unknown> = {}): GmApi {
		return {
			GM_info: {script: {name: "CP Toolkit", version: "9.9.9"}},
			GM_getValue: (key) => stored[key],
			GM_setValue: (key, value) => {
				stored[key] = value;
			},
			GM_addValueChangeListener: mock(() => 1),
			GM_registerMenuCommand: (label, action) => {
				commands.set(label, action);
				return commands.size;
			},
			GM_setClipboard: mock(() => undefined),
			GM_notification: mock(() => undefined),
			GM_xmlhttpRequest: mock(() => undefined),
			unsafeWindow: window,
		};
	}

	const injectedCss = (): string => [...document.querySelectorAll("style")].map((style) => style.textContent).join("\n");

	function run(api: GmApi): void {
		new Function(...Object.keys(api), code)(...Object.values(api));
	}

	const nextTask = () => new Promise((resolve) => setTimeout(resolve));

	beforeAll(async () => {
		code = await Bun.file(bundlePath).text();
	});

	afterEach(() => {
		// document はテストファイルをまたいで共有されるので、起動した配布物の処理を残さない
		for (const [type, listener, options] of addListener.mock.calls) document.removeEventListener(type, listener, options);
		addListener.mockClear();
		commands.clear();
		document.head.replaceChildren();
		document.body.replaceChildren();
		delete document.documentElement.dataset.cpToolkit;
	});

	afterAll(() => {
		addListener.mockRestore();
	});

	test("メタデータに生成した @match と @connect、実行タイミングを含む", () => {
		const metadata = code.slice(0, code.indexOf("// ==/UserScript=="));
		for (const pattern of ["https://atcoder.jp/*", "https://yukicoder.me/problems/*", "https://paiza.jp/*"]) {
			expect(metadata).toContain(pattern);
		}
		expect(metadata).toMatch(/@connect\s+localhost/);
		expect(metadata).toMatch(/@connect\s+wandbox\.org/);
		expect(metadata).toMatch(/@run-at\s+document-start/);
		expect(metadata).toMatch(/@noframes\n/);
	});

	test("YAML と CSS、ライブラリを同梱し、外部のコードを読み込まない", () => {
		expect(code).toContain("#main-container");
		expect(code).toContain("wideLayout.title");
		expect(code).toContain("TurndownService");
		expect(code).not.toMatch(/@require/);
	});

	test("第三者のライセンスの表記を含む", () => {
		expect(code).toContain("Copyright (c) magurofly");
		expect(code).toContain("Apache License");
	});

	test("起動すると印を付け、有効な機能を動かし、メニューを登録する", async () => {
		run(createGmApi());
		await nextTask();

		expect(document.documentElement.dataset.cpToolkit).toBe("9.9.9");
		expect(injectedCss()).toContain("--cp-main-width: 50%;");
		expect([...commands.keys()]).toHaveLength(1);
	});

	test("無効にした機能は動かさない", async () => {
		run(createGmApi({settings: {version: 1, features: {"wide-layout": {enabled: false}}}}));
		await nextTask();

		expect(injectedCss()).not.toContain("--cp-main-width");
	});

	test("メニューから設定画面を開ける", async () => {
		run(createGmApi());
		await nextTask();
		[...commands.values()][0]?.();

		const dialog = [...document.body.children].flatMap((element) => element.shadowRoot?.querySelector("dialog") ?? []);
		expect(dialog[0]?.open).toBe(true);
	});
});
