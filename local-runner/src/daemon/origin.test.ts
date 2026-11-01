import {describe, expect, test} from "bun:test";
import {isAllowedOrigin} from "./origin";

describe("isAllowedOrigin", () => {
	test("Origin のない要求は CLI などとして許可する", () => {
		expect(isAllowedOrigin(undefined)).toBe(true);
	});

	test("ユーザースクリプトが動くサイトを許可する", () => {
		expect(isAllowedOrigin("https://atcoder.jp")).toBe(true);
		expect(isAllowedOrigin("https://codeforces.com")).toBe(true);
		expect(isAllowedOrigin("https://m1.codeforces.com")).toBe(true);
	});

	test("http のオリジンは許可しない", () => {
		expect(isAllowedOrigin("http://atcoder.jp")).toBe(false);
	});

	test("必要のないサブドメインと、似た名前のサイトは許可しない", () => {
		expect(isAllowedOrigin("https://info.atcoder.jp")).toBe(false);
		expect(isAllowedOrigin("https://atcoder.jp.example.com")).toBe(false);
		expect(isAllowedOrigin("https://evilatcoder.jp")).toBe(false);
		expect(isAllowedOrigin("https://evilcodeforces.com")).toBe(false);
	});

	test("不正な値とサンドボックスの null は許可しない", () => {
		expect(isAllowedOrigin("null")).toBe(false);
		expect(isAllowedOrigin("not a url")).toBe(false);
	});

	test("許可リストを指定すると完全一致だけを許可する", () => {
		const overrides = ["http://localhost:4173"];
		expect(isAllowedOrigin("http://localhost:4173", overrides)).toBe(true);
		expect(isAllowedOrigin("https://atcoder.jp", overrides)).toBe(false);
	});
});
