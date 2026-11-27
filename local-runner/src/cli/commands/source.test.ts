import {describe, expect, test} from "bun:test";

// 利用者の設定を読まないよう、テスト用の設定ファイルを使う。
await import("../../testSettings");
const {describeLineOffset, describeTransform, preparedProgram} = await import("./source");

describe("describeTransform", () => {
	const base = {status: "success", diagnostics: "", diagnosticItems: []} as const;

	test("変えたこと、ヘッダー、足した import、展開したクラス、行数と大きさを示す", () => {
		const lines = describeTransform({
			...base,
			sourceCode: "// h\n\nimport java.nio.*;\npublic class Main {}\n",
			inlinedClasses: ["lib.io.FastScanner"],
			summary: {
				entryName: "A",
				debugFlag: {name: "DEBUG", value: false, line: 12},
				packageRemoved: true,
				addedImports: ["java.nio.*"],
				bundledFiles: ["lib/io/FastScanner.java"],
			},
			header: {name: "java", lines: 2},
		}, "A.java", "package a;\npublic class A {}\n");
		expect(lines).toEqual([
			"Transform: A -> Main, DEBUG = false (line 12), package removed",
			"Header: java (2 lines)",
			"Added imports: java.nio.*",
			"Bundled: lib.io.FastScanner (lib/io/FastScanner.java)",
			"Source: A.java 2 lines -> 4 lines, 46 B",
		]);
	});

	test("変えていない項目は出さず、AtCoder の上限を超えたら知らせる", () => {
		const big = "x".repeat(513 * 1024);
		const lines = describeTransform({...base, sourceCode: big, inlinedClasses: [], summary: {entryName: "Main", debugFlag: null}}, "Main.java", big);
		expect(lines).toEqual(["Source: Main.java 1 line -> 1 line, 513.0 KiB (over the AtCoder limit of 512.0 KiB)"]);
	});

	test("コンパイルの失敗では、行数と大きさを出さない", () => {
		expect(describeTransform({...base, status: "compileError", sourceCode: "x", inlinedClasses: []}, "a.py", "x")).toEqual([]);
	});
});

describe("preparedProgram", () => {
	const response = (sourceCode: string, programId: string) =>
		({status: "success", sourceCode, programId, diagnostics: "", inlinedClasses: [], diagnosticItems: []}) as const;

	test("同じソースで作り直したら、新しい programId を使う", async () => {
		const program = preparedProgram(response("// h\n\nA", "1"), async () => response("// h\n\nA", "2"));
		expect(await program.refresh()).toBe("2");
	});

	test("同一世代の失効は再準備を共有し、同じ ID でも遅れて届いた失効を区別する", async () => {
		let calls = 0;
		const first = response("A", "same");
		const program = preparedProgram(first, async () => {calls++; return first;});
		const stale = program.current;
		await Promise.all([program.refresh(stale), program.refresh(stale)]);
		expect(program.current).not.toBe(stale);
		expect(await program.refresh(stale)).toBe("same");
		expect(calls).toBe(1);
	});

	test("再準備に失敗しても次の要求でやり直せる", async () => {
		const first = response("A", "1");
		let calls = 0;
		const program = preparedProgram(first, async () => {
			if (++calls === 1) throw new Error("offline");
			return response("A", "2");
		});
		await expect(program.refresh()).rejects.toThrow("offline");
		expect(await program.refresh()).toBe("2");
	});

	test("作り直したソースが最初と違えば、試したものと提出物が食い違うので止める", async () => {
		const program = preparedProgram(response("return 1", "1"), async () => response("return 2", "2"));
		await expect(program.refresh()).rejects.toThrow("The source changed while running the samples");
	});
});

describe("describeLineOffset", () => {
	test("増えた行数をヘッダーと import に分けて示す", () => {
		expect(describeLineOffset({header: 2, transform: 4})).toBe("Line offset: header +2, imports +4.");
		expect(describeLineOffset({header: 2, transform: 0})).toBe("Line offset: header +2.");
		expect(describeLineOffset({header: 0, transform: -1})).toBe("Line offset: imports -1.");
	});

	test("bundle で分からないときはそう示し、増えていなければ何も示さない", () => {
		expect(describeLineOffset({header: 1, transform: null})).toBe("Line offset: header +1, bundle (unknown).");
		expect(describeLineOffset({header: 0, transform: null}, true)).toBe("Line offset: imports (unknown).");
		expect(describeLineOffset({header: 0, transform: 0})).toBeNull();
		expect(describeLineOffset(undefined)).toBeNull();
	});
});
