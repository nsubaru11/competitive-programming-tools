import {describe, expect, test} from "bun:test";
import {judges} from "@catalog/judges";
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
