import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import {dirname, join} from "node:path";

// 更新を終了したスクリプトの配布物を実行する。先に build が必要。

const distPath = (name: string): string => join(dirname(import.meta.path), "..", "..", name, "dist", `${name}.user.js`);

async function runRetired(name: string, stored: Record<string, unknown> = {}): Promise<void> {
	const code = await Bun.file(distPath(name)).text();
	const api = {
		GM_getValue: (key: string, fallback?: unknown) => stored[key] ?? fallback,
		GM_setValue: () => undefined,
		GM_registerMenuCommand: () => 1,
	};
	new Function(...Object.keys(api), code)(...Object.values(api));
}

describe("更新を終了したスクリプト", () => {
	beforeEach(() => {
		localStorage.clear();
		document.head.replaceChildren();
		document.body.replaceChildren();
		delete document.documentElement.dataset.cpToolkit;
	});

	afterEach(() => {
		for (const style of document.documentElement.querySelectorAll("style")) style.remove();
		document.body.replaceChildren();
		delete document.documentElement.dataset.cpToolkit;
	});

	test("CP Toolkit がなければ今までどおり動き、案内を1回だけ出す", async () => {
		await runRetired("AtCoderWidenContainer");
		expect(document.documentElement.querySelector("style")).not.toBeNull();
		expect(document.body.textContent).toContain("更新は終了しました");

		document.body.replaceChildren();
		await runRetired("AtCoderWidenContainer");
		expect(document.body.textContent).toBe("");
	});

	test("CP Toolkit が動いていれば本体を実行せず、案内も出さない", async () => {
		document.documentElement.dataset.cpToolkit = "1.0.0";
		await runRetired("AtCoderWidenContainer");
		expect(document.documentElement.querySelector("style")).toBeNull();
		expect(document.body.textContent).toBe("");
	});

	test("新版が読めるように設定を書き出す", async () => {
		document.documentElement.dataset.cpToolkit = "1.0.0";
		await runRetired("AtCoderWidenContainer", {containerWidth: "80%"});
		expect(JSON.parse(localStorage.getItem("cp-toolkit:legacy:AtCoderWidenContainer") ?? "{}")).toEqual({containerWidth: "80%"});
	});

	test("8本すべてに更新終了の処理が入っている", async () => {
		const names = [
			"AtCoderCustomDefaultSubmissions",
			"AtCoderEasyTestForJava",
			"AtCoderHighlighter",
			"AtCoderListingTasks",
			"AtCoderMarkdownCopier",
			"AtCoderPerformanceOverlay",
			"AtCoderWidenContainer",
			"JavaCodeSubmitter",
		];
		for (const name of names) {
			const code = await Bun.file(distPath(name)).text();
			expect(code).toContain("cpToolkitRetirement.replaced");
			expect(code).toContain(`const scriptId = "${name}";`);
			expect(code).not.toMatch(/__[A-Z_]+__/);
			expect(code).toMatch(/@description:en\s+\[Discontinued\]/);
		}
	});
});
