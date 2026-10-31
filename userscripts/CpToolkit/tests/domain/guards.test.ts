import {describe, expect, test} from "bun:test";
import {isArrayOf, isNumber, isObjectOf, isRecordOf, isString} from "@domain/validation/guards";
import {readStored} from "@application/ports/key-value-store";
import {SavedCodes} from "@features/easy-test/saved-code";
import {MemoryStore} from "../support/fakes";

describe("guards", () => {
	test("配列の要素を確かめる", () => {
		expect(isArrayOf(isString)(["a", "b"])).toBe(true);
		expect(isArrayOf(isString)(["a", 1])).toBe(false);
		expect(isArrayOf(isString)("a")).toBe(false);
	});

	test("レコードの値を確かめる", () => {
		expect(isRecordOf(isNumber)({a: 1})).toBe(true);
		expect(isRecordOf(isNumber)({a: "1"})).toBe(false);
		expect(isRecordOf(isNumber)([1])).toBe(false);
		expect(isRecordOf(isNumber)(null)).toBe(false);
	});

	test("オブジェクトの項目を確かめ、他の項目は無視する", () => {
		const isRange = isObjectOf<{begin: number; end: number}>({begin: isNumber, end: isNumber});
		expect(isRange({begin: 0, end: 1, extra: true})).toBe(true);
		expect(isRange({begin: 0})).toBe(false);
	});
});

describe("readStored", () => {
	test("形が正しい値はそのまま返す", () => {
		const store = new MemoryStore();
		store.set("key", ["a"]);
		expect(readStored(store, "key", isArrayOf(isString), [])).toEqual(["a"]);
	});

	test("未保存や形の違う値は既定値にする", () => {
		const store = new MemoryStore();
		expect(readStored(store, "key", isArrayOf(isString), [])).toEqual([]);
		store.set("key", {broken: true});
		expect(readStored(store, "key", isArrayOf(isString), [])).toEqual([]);
	});

	test("壊れた保存値があっても実行コードの記憶は動く", () => {
		const store = new MemoryStore();
		store.set("easy-test:saved-code", "broken");
		const codes = new SavedCodes(store, 10);
		expect(codes.find("/task")).toBeNull();
		codes.save("/task", "code");
		expect(codes.find("/task")).toBe("code");
	});
});
