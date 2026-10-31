import {describe, expect, test} from "bun:test";
import {contestCatalog, languageCatalog, ratingScale} from "@catalog/tables";
import {adjustRange, contestCategory, defaultRange, rangeIndices} from "@domain/contest/category";
import {isLanguageOption, labelDistance, resolveFamily} from "@domain/execution/language";
import {judgeResult} from "@domain/execution/result";
import {dropOldest, ratedPerformances} from "@domain/rating/history";
import {backgroundOf, crownImageOf, tierOf, tierProgress} from "@domain/rating/scale";
import {findFoldStartLines} from "@domain/source/fold-lines";
import {isPureNumber, splitLimitValue, splitNumbers} from "@domain/statement/tokens";
import {isJudging, summarizeJudgeCases} from "@domain/submission/status";

describe("問題文の字句分割", () => {
	const emphasized = (text: string) => splitNumbers(text).filter((part) => part.emphasized).map((part) => part.text);

	test("桁区切りや小数、指数を1つの数字として扱う", () => {
		expect(emphasized("1 以上 200,000 以下、誤差 1.5e-6")).toEqual(["1", "200,000", "1.5e-6"]);
	});

	test("分割しても元の文章を失わない", () => {
		const text = "N は 3 で、abc123 は単語です";
		expect(splitNumbers(text).map((part) => part.text).join("")).toBe(text);
		expect(emphasized(text)).toEqual(["3"]);
	});

	test("同じ文章で何度呼んでも結果が変わらない", () => {
		expect(emphasized("10 20")).toEqual(emphasized("10 20"));
	});

	test("KaTeX の数字を判定する", () => {
		expect(isPureNumber("1,000")).toBe(true);
		expect(isPureNumber("N")).toBe(false);
	});

	test("制限の値だけを強調する", () => {
		const segments = splitLimitValue("Time Limit: 2 sec / Memory Limit: 1024 MiB", "Time Limit");
		expect(segments?.filter((part) => part.emphasized).map((part) => part.text)).toEqual(["2"]);
		expect(segments?.map((part) => part.text).join("")).toBe("Time Limit: 2 sec / Memory Limit: 1024 MiB");
	});

	test("値が書かれていなければ null を返す", () => {
		expect(splitLimitValue("実行時間制限について", "実行時間制限")).toBeNull();
	});
});

describe("コンテストの分類と範囲", () => {
	test("定期開催は問題数ごとに分ける", () => {
		expect(contestCategory(contestCatalog, "abc420", 7)).toBe("abc-7");
		expect(contestCategory(contestCatalog, "typical90", 90)).toBe("typical90");
		expect(contestCategory(contestCatalog, "unknown2026", 5)).toBe("other");
	});

	test("既定の範囲は上限を超えない", () => {
		expect(defaultRange(5, 20)).toEqual({begin: 0, end: 4});
		expect(defaultRange(90, 20)).toEqual({begin: 0, end: 19});
	});

	test("片方を動かすともう片方が順序と上限に追従する", () => {
		expect(adjustRange({begin: 5, end: 3}, "begin", 20)).toEqual({begin: 5, end: 5});
		expect(adjustRange({begin: 0, end: 30}, "begin", 20)).toEqual({begin: 0, end: 19});
		expect(adjustRange({begin: 5, end: 3}, "end", 20)).toEqual({begin: 3, end: 3});
		expect(adjustRange({begin: 0, end: 30}, "end", 20)).toEqual({begin: 11, end: 30});
	});

	test("逆順でも範囲全体を返す", () => {
		expect(rangeIndices({begin: 1, end: 3}, false)).toEqual([1, 2, 3]);
		expect(rangeIndices({begin: 1, end: 3}, true)).toEqual([3, 2, 1]);
	});
});

describe("言語の判定", () => {
	const cases: ReadonlyArray<readonly [string, string | null]> = [
		["Java 24 OpenJDK 24.0.2", "java"],
		["Java24 (OpenJDK 24.0.2)", "java"],
		["JavaScript (Node.js 22.19.0)", "javascript"],
		["C++23(gcc16)", "cpp"],
		["C++ 23 GCC 15.2.0", "cpp"],
		["GNU G++23 14.2 (64 bit, msys2)", "cpp"],
		["GNU GCC C11 5.1.0", "c"],
		["C 23 Clang Clang 21.1.0", "c"],
		["C#(csc)", "csharp"],
		["Python (CPython 3.13.7)", "python3"],
		["Python (PyPy 3.11-v7.3.20)", "python3"],
		["PyPy3", "python3"],
		["PyPy2", "python2"],
		["Python 3.13.2", "python3"],
		["Rust 1.89.0", "rust"],
		["Go 1.25.1", "go"],
		["COBOL Free GnuCOBOL 3.2", "cobol"],
		["Crystal 1.17.0", "crystal"],
		["Whitespace", null],
	];

	test.each(cases)("%s を判定する", (label, family) => {
		expect(resolveFamily(languageCatalog, label)).toBe(family);
	});

	test("近い表記ほど距離が小さい", () => {
		expect(labelDistance("Java 24", "Java 24")).toBe(0);
		expect(labelDistance("Java 24", "Java 21")).toBeLessThan(labelDistance("Java 24", "Kotlin 2"));
	});

	test("paiza の選択肢は JavaScript を Java と取り違えない", () => {
		expect(isLanguageOption("Java (OpenJDK 21)", "java")).toBe(true);
		expect(isLanguageOption("JavaScript", "java")).toBe(false);
		expect(isLanguageOption("JavaScript", "javascript")).toBe(true);
		expect(isLanguageOption("C++(gcc)", "c++")).toBe(true);
		expect(isLanguageOption("Objective-C", "c")).toBe(false);
	});
});

describe("実行結果の判定", () => {
	test("空白の違いを無視して比較する", () => {
		const result = judgeResult({status: "OK", input: "", output: "1  2\n"}, "1 2", {trim: true, split: true});
		expect(result.status).toBe("AC");
	});

	test("誤差を許容する", () => {
		const options = {trim: true, split: true, allowableError: 1e-3};
		expect(judgeResult({status: "OK", input: "", output: "1.0005"}, "1.0", options).status).toBe("AC");
		expect(judgeResult({status: "OK", input: "", output: "1.5"}, "1.0", options).status).toBe("WA");
	});

	test("実行に失敗した結果はそのまま返す", () => {
		expect(judgeResult({status: "RE", input: ""}, "1", {}).status).toBe("RE");
	});

	test("期待する出力がなければ判定しない", () => {
		expect(judgeResult({status: "OK", input: "", output: "1"}, null, {}).status).toBe("OK");
	});
});

describe("レーティング", () => {
	test("色の区分を判定する", () => {
		expect(tierOf(ratingScale, 399).className).toBe("user-gray");
		expect(tierOf(ratingScale, 400).className).toBe("user-brown");
		expect(tierOf(ratingScale, 5000).className).toBe("user-red");
	});

	test("王冠は 3200 以上で、400 刻みの画像を使う", () => {
		expect(crownImageOf(ratingScale, 3199)).toBeNull();
		expect(crownImageOf(ratingScale, 3650)).toBe("https://img.atcoder.jp/assets/icon/crown3600.gif");
	});

	test("3200 以上は銀と金の背景を使う", () => {
		expect(backgroundOf(ratingScale, 3300)).toBe(ratingScale.silverBackground);
		expect(backgroundOf(ratingScale, 3700)).toBe(ratingScale.goldBackground);
	});

	test("区分の中での位置を返す", () => {
		expect(tierProgress(ratingScale, 600)).toBe(0.5);
	});

	test("最近の表示では古い3回を除く", () => {
		expect(dropOldest([1, 2, 3, 4, 5])).toEqual([4, 5]);
		expect(dropOldest([1, 2, 3])).toEqual([1, 2, 3]);
	});

	test("レート変動のあった回だけを取り出す", () => {
		expect(ratedPerformances([
			{IsRated: true, Performance: 1200},
			{IsRated: false, Performance: 900},
			{IsRated: true, Performance: -5},
		])).toEqual([1200, 0]);
	});
});

describe("提出", () => {
	test("確定していない結果を判定する", () => {
		for (const status of ["", "WJ", "WR", "3/7", "2/7 WA"]) expect(isJudging(status)).toBe(true);
		for (const status of ["AC", "WA", "TLE", "CE"]) expect(isJudging(status)).toBe(false);
	});

	test("テストケースの平均を求める", () => {
		expect(summarizeJudgeCases([
			{status: "AC", timeMs: 10, memoryKb: 100},
			{status: "TLE", timeMs: 2001, memoryKb: 300},
		])).toEqual({accepted: 1, total: 2, averageTimeMs: 1005.5, averageMemoryKb: 200, timeIsLowerBound: true});
	});
});

describe("Java の折りたたみ", () => {
	test("型の宣言とコメントの開始行を返す", () => {
		const source = ["/* a */", "import java.util.*;", "public final class Main {", "\tvoid f() {}", "}", "record P() {}"].join("\n");
		expect(findFoldStartLines(source)).toEqual([0, 2, 5]);
	});
});
