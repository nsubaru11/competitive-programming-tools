import {Glob} from "bun";
import {describe, expect, test} from "bun:test";
import {dirname, join} from "node:path";

// 層の依存方向は tsc -b が検査する。ここでは tsconfig では表現できない規則を検査する。

const sourceDir = join(dirname(import.meta.path), "..", "src");
const transpiler = new Bun.Transpiler({loader: "ts"});

async function featureSources(): Promise<Array<{feature: string; file: string; text: string}>> {
	const sources = [];
	for await (const file of new Glob("features/*/**/*.ts").scan({cwd: sourceDir})) {
		const normalized = file.replaceAll("\\", "/");
		sources.push({
			feature: normalized.split("/")[1] ?? "",
			file: normalized,
			text: await Bun.file(join(sourceDir, file)).text(),
		});
	}
	return sources;
}

describe("安全な DOM 操作", () => {
	test("文字列を HTML やコードとして解釈する API を使わない", async () => {
		const unsafePatterns = [
			/\.(innerHTML|outerHTML)\b/,
			/\binsertAdjacentHTML\b/,
			/\bcreateContextualFragment\b/,
			/\bdocument\.write(ln)?\s*\(/,
			/\bsrcdoc\b/,
			/(^|[^.\w])eval\s*\(/,
			/\bnew\s+Function\s*\(/,
			/\bset(Timeout|Interval)\s*\(\s*["'`]/,
		];
		const violations: string[] = [];
		for await (const file of new Glob("**/*.ts").scan({cwd: sourceDir})) {
			const text = await Bun.file(join(sourceDir, file)).text();
			for (const pattern of unsafePatterns) if (pattern.test(text)) violations.push(`${file}: ${pattern.source}`);
		}
		expect(violations).toEqual([]);
	});
});

describe("機能の独立性", () => {
	test("機能は他の機能を import しない", async () => {
		const violations: string[] = [];
		for (const {feature, file, text} of await featureSources()) {
			for (const {path} of transpiler.scanImports(text)) {
				const imported = path.match(/^@features\/([^/]+)/)?.[1];
				if (imported && imported !== feature) violations.push(`${file} -> ${path}`);
			}
		}
		expect(violations).toEqual([]);
	});

	test("機能はサイトのデータを直接 import しない", async () => {
		const violations: string[] = [];
		for (const {file, text} of await featureSources()) {
			for (const {path} of transpiler.scanImports(text)) {
				if (path.startsWith("@data/")) violations.push(`${file} -> ${path}`);
			}
		}
		expect(violations).toEqual([]);
	});

	test("機能は通信処理を直接使わない", async () => {
		const networkApiPattern = /\b(fetch|XMLHttpRequest)\s*\(/;
		const violations = (await featureSources()).filter(({text}) => networkApiPattern.test(text)).map(({file}) => file);
		expect(violations).toEqual([]);
	});
});
