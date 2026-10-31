import {afterEach, beforeAll, describe, expect, mock, test} from "bun:test";
import {dirname, join} from "node:path";

// ビルド済みの配布物を、Tampermonkey の API を差し替えて実行する。先に build が必要。

const bundlePath = join(dirname(import.meta.path), "..", "dist", "CpToolkit.user.js");

type GmApi = {
	GM_info: {script: {name: string; version: string}};
	GM_getValue: (key: string) => unknown;
	GM_setValue: (key: string, value: unknown) => void;
	GM_addValueChangeListener: () => number;
	GM_registerMenuCommand: (label: string, action: () => void) => number;
};

describe("配布物", () => {
	let code: string;
	const commands = new Map<string, () => void>();

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
		};
	}

	function run(api: GmApi): void {
		new Function(...Object.keys(api), code)(...Object.values(api));
	}

	const nextTask = () => new Promise((resolve) => setTimeout(resolve));

	beforeAll(async () => {
		code = await Bun.file(bundlePath).text();
	});

	afterEach(() => {
		commands.clear();
		document.head.replaceChildren();
		document.body.replaceChildren();
		delete document.documentElement.dataset.cpToolkit;
	});

	test("メタデータに生成した @match と実行タイミングを含む", () => {
		const metadata = code.slice(0, code.indexOf("// ==/UserScript=="));
		expect(metadata).toContain("https://atcoder.jp/*");
		expect(metadata).toMatch(/@run-at\s+document-start/);
		expect(metadata).toMatch(/@noframes\n/);
	});

	test("YAML と CSS を同梱し、外部ファイルを読み込まない", () => {
		expect(code).toContain("#main-container");
		expect(code).toContain("wideLayout.title");
		expect(code).not.toMatch(/@require/);
	});

	test("起動すると印を付け、有効な機能を動かし、メニューを登録する", async () => {
		run(createGmApi());
		await nextTask();

		expect(document.documentElement.dataset.cpToolkit).toBe("9.9.9");
		expect(document.querySelector("style")?.textContent).toContain("--cp-main-width: 50%;");
		expect([...commands.keys()]).toHaveLength(1);
	});

	test("無効にした機能は動かさない", async () => {
		run(createGmApi({settings: {version: 1, features: {"wide-layout": {enabled: false}}}}));
		await nextTask();

		expect(document.querySelector("style")).toBeNull();
	});

	test("メニューから設定画面を開ける", async () => {
		run(createGmApi());
		await nextTask();
		[...commands.values()][0]?.();

		expect(document.body.lastElementChild?.shadowRoot?.querySelector("dialog")?.open).toBe(true);
	});
});
