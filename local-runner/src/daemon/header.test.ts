import {afterAll, beforeEach, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {LocalRunnerTransformResponse} from "@atcoder-tools/shared";
import {writeLocalSettings} from "../localSettings";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "submission-header-"));
const settingsFile = path.join(dir, "settings.json");
process.env.LOCAL_RUNNER_SETTINGS_FILE = settingsFile;
const {applySubmissionHeader} = await import("./header");

const SOURCE = "public class Main {}\n";
const success: LocalRunnerTransformResponse = {
	status: "success",
	sourceCode: SOURCE,
	diagnostics: "",
	inlinedClasses: [],
	addedImports: [],
	diagnosticItems: [],
};

function writeHeader(name: string, text: string): string {
	const file = path.join(dir, name);
	fs.writeFileSync(file, text);
	return file;
}

describe("applySubmissionHeader", () => {
	beforeEach(() => {
		fs.rmSync(settingsFile, {force: true});
	});

	afterAll(() => {
		fs.rmSync(dir, {recursive: true, force: true});
	});

	test("言語に設定したファイルを付ける", () => {
		writeLocalSettings(settingsFile, {headerFiles: {java: writeHeader("java.txt", "// java\n")}});
		expect(applySubmissionHeader(success, true, "java").sourceCode).toBe(`// java\n\n${SOURCE}`);
	});

	test("言語ごとに別のファイルを使う", () => {
		writeLocalSettings(settingsFile, {
			headerFiles: {
				java: writeHeader("java.txt", "// java"),
				cpp: writeHeader("cpp.txt", "// cpp")
			}
		});
		expect(applySubmissionHeader(success, true, "cpp").sourceCode).toBe(`// cpp\n\n${SOURCE}`);
	});

	test("設定した名前を指定して別のファイルを使う", () => {
		writeLocalSettings(settingsFile, {headerFiles: {short: writeHeader("short.txt", "// short")}});
		expect(applySubmissionHeader(success, "short", "java").sourceCode).toBe(`// short\n\n${SOURCE}`);
	});

	test("言語に設定が無ければ付けない", () => {
		expect(applySubmissionHeader(success, true, "java").sourceCode).toBe(SOURCE);
	});

	test("付けない指定なら設定があっても付けない", () => {
		writeLocalSettings(settingsFile, {headerFiles: {java: writeHeader("java.txt", "// java")}});
		expect(applySubmissionHeader(success, false, "java").sourceCode).toBe(SOURCE);
	});

	test("既にヘッダーで始まるソースには重ねて付けない", () => {
		writeLocalSettings(settingsFile, {headerFiles: {java: writeHeader("java.txt", "// java")}});
		const withHeader = {...success, sourceCode: `// java\n\n${SOURCE}`};
		expect(applySubmissionHeader(withHeader, true, "java").sourceCode).toBe(withHeader.sourceCode);
	});

	test("指定した名前に設定が無ければ失敗にする", () => {
		const result = applySubmissionHeader(success, "short", "java");
		expect(result.status).toBe("compileError");
		expect(result.diagnostics).toContain("setheader short <file>");
	});

	test("設定したファイルが無くなっていれば失敗にする", () => {
		writeLocalSettings(settingsFile, {headerFiles: {java: path.join(dir, "missing.txt")}});
		const result = applySubmissionHeader(success, true, "java");
		expect(result.status).toBe("compileError");
		expect(result.diagnostics).toContain("Header file not found");
	});

	test("名前の形式を検査し、オブジェクトの既定のプロパティを読まない", () => {
		expect(applySubmissionHeader(success, "../secret", "java").diagnostics).toContain("Invalid header name");
		expect(applySubmissionHeader(success, "constructor", "java").diagnostics).toContain("Header is not set");
	});
});
