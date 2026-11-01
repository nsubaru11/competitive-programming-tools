import {describe, expect, test} from "bun:test";
import {judges} from "@catalog/judges";
import {languageCatalog, libraries, runnerCatalog} from "@catalog/tables";
import {commentSyntaxOf, resolveFamily} from "@domain/execution/language";
import en from "@data/i18n/en.yaml";
import ja from "@data/i18n/ja.yaml";
import {features} from "@app/registry";

// 形の検査は tsc が行う。ここでは型で表現できない内容を検査する。

describe("judges", () => {
	test("ID が重複していない", () => {
		const ids = judges.map(({id}) => id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test("ルートは正しい正規表現である", () => {
		for (const {routes} of judges) {
			for (const pattern of Object.values(routes)) {
				expect(() => new RegExp(pattern)).not.toThrow();
			}
		}
	});

	test("@match は https の URL で、パスを持つ", () => {
		for (const {matches} of judges) {
			for (const pattern of matches) {
				expect(pattern).toMatch(/^https:\/\/[^/]+\/.*$/);
			}
		}
	});

	test("メニューのセレクタは正しい", () => {
		for (const {navigationLists} of judges) {
			for (const selector of navigationLists) {
				expect(() => document.querySelector(selector)).not.toThrow();
			}
		}
	});
});

describe("languages", () => {
	const {comments, families} = languageCatalog;

	test("コメントの書き方は単一行か、複数行の両端のどちらかを持つ", () => {
		for (const {line, open, close} of Object.values(comments)) {
			expect(open === undefined).toBe(close === undefined);
			expect(line !== undefined || open !== undefined).toBe(true);
		}
	});

	test("言語が指すコメントの書き方が存在する", () => {
		for (const {comment} of families) {
			if (comment !== undefined) expect(comments[comment]).toBeDefined();
		}
	});

	test("コメントの書き方の正規表現が正しい", () => {
		for (const {preamble, trailer} of Object.values(comments)) {
			expect(() => new RegExp(preamble ?? "")).not.toThrow();
			expect(() => new RegExp(trailer ?? "")).not.toThrow();
		}
	});

	test("主な言語の表記からコメントの書き方を引ける", () => {
		const lineOf = (label: string) => {
			const family = resolveFamily(languageCatalog, label);
			return family ? commentSyntaxOf(languageCatalog, family)?.line : undefined;
		};
		expect(lineOf("Java (OpenJDK 24.0.2)")).toBe("//");
		expect(lineOf("C++ 23 (gcc 15.2.0)")).toBe("//");
		expect(lineOf("Python (CPython 3.13.7)")).toBe("#");
		expect(lineOf("Rust (rustc 1.89.0)")).toBe("//");
		expect(lineOf("Text (cat 9.4)")).toBeUndefined();
	});
});

describe("libraries", () => {
	test("ページへ読み込むファイルは版を固定し、integrity を持つ", () => {
		const resources = [...Object.values(libraries), {
			url: runnerCatalog.pyodide.baseUrl,
			integrity: runnerCatalog.pyodide.integrity,
		}];
		for (const {url, integrity} of resources) {
			expect(url).toMatch(/^https:\/\//);
			expect(url).toMatch(/@\d|\/r\d+\/|\/v\d/);
			expect(integrity).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
		}
	});
});

describe("i18n", () => {
	test("日本語と英語のキーが一致する", () => {
		expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort());
	});

	test("空の文言がない", () => {
		for (const message of [...Object.values(ja), ...Object.values(en)]) {
			expect(String(message).trim()).not.toBe("");
		}
	});
});

describe("features", () => {
	test("ID が重複していない", () => {
		const ids = features.map(({id}) => id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
