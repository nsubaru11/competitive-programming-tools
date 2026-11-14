import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {DEFAULT_SETTINGS, type Settings} from "../settings/settings";
import {findLanguage, findShortSource, languageForFile, resolveSourceFile} from "./language";
import {chooseSubmitLanguageIds, extractLanguageOptionsFromSubmitPage, findLanguageOptionByLabel} from "./parser";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cli-language-"));
const JAVA_LANGUAGE_ID = "6056";

const settings: Settings = DEFAULT_SETTINGS;

function touch(...names: string[]): void {
	for (const name of names) fs.writeFileSync(path.join(dir, name), "");
}

beforeAll(() => {
	touch("A.java", "B.cpp", "C.py", "D.java", "D.cpp", "E1.py", "notes.txt");
});

afterAll(() => {
	fs.rmSync(dir, {recursive: true, force: true});
});

describe("languageForFile", () => {
	test("拡張子から言語を選ぶ", () => {
		expect(languageForFile(settings, "A.java")).toMatchObject({name: "java", isJava: true, runtimeFileName: "Main.java"});
		expect(languageForFile(settings, "B.CPP")).toMatchObject({name: "cpp", family: "cpp", runtimeFileName: "Main.cpp"});
		expect(languageForFile(settings, "C.py")).toMatchObject({name: "cpython", family: "python3", submit: "Python (CPython"});
	});

	test("--lang の指定を拡張子より優先する", () => {
		expect(languageForFile(settings, "C.py", "pypy")).toMatchObject({name: "pypy", submit: "Python (PyPy"});
	});

	test("対応が無い拡張子と、知らない言語はエラーにする", () => {
		expect(() => languageForFile(settings, "notes.txt")).toThrow('No language is set for ".txt" files.');
		expect(() => languageForFile(settings, "C.py", "ruby")).toThrow('Unknown language: "ruby". Available languages: java, cpp, c, cpython, pypy, codon, go, rust, kotlin, csharp.');
	});

	test("enabled が false の言語は選べない", () => {
		const disabled = {
			...settings,
			languages: {...settings.languages, pypy: {...settings.languages.pypy, enabled: false}},
		} as Settings;
		expect(() => findLanguage(disabled, "pypy")).toThrow('Unknown language: "pypy".');
	});
});

describe("resolveSourceFile", () => {
	test("拡張子まで書いたファイルを使う", () => {
		expect(resolveSourceFile(settings, "B.cpp", dir)).toBe(path.join(dir, "B.cpp"));
	});

	test("拡張子を省くと、設定の拡張子から探す", () => {
		expect(resolveSourceFile(settings, "A", dir)).toBe(path.join(dir, "A.java"));
		expect(resolveSourceFile(settings, "C", dir)).toBe(path.join(dir, "C.py"));
	});

	test("候補が複数あればエラーにし、--lang で絞れる", () => {
		expect(() => resolveSourceFile(settings, "D", dir)).toThrow("More than one source file matches: D.java, D.cpp.");
		expect(resolveSourceFile(settings, "D", dir, "cpp")).toBe(path.join(dir, "D.cpp"));
	});

	test("見つからなければエラーにする", () => {
		expect(() => resolveSourceFile(settings, "Z", dir)).toThrow("Source file not found from current directory: Z");
	});
});

describe("findShortSource", () => {
	test("大文字と小文字を区別せずに、設定の拡張子で探す", () => {
		expect(findShortSource(settings, "a", dir)).toBe(path.join(dir, "A.java"));
		expect(findShortSource(settings, "b", dir)).toBe(path.join(dir, "B.cpp"));
		expect(findShortSource(settings, "e1", dir)).toBe(path.join(dir, "E1.py"));
	});

	test("--lang は、同じ種類の言語の拡張子に絞る", () => {
		expect(findShortSource(settings, "d", dir, "java")).toBe(path.join(dir, "D.java"));
		expect(findShortSource(settings, "c", dir, "pypy")).toBe(path.join(dir, "C.py"));
		expect(() => findShortSource(settings, "c", dir, "cpp")).toThrow("C.cpp");
	});

	test("候補が複数あるときと、無いときはエラーにする", () => {
		expect(() => findShortSource(settings, "d", dir)).toThrow("More than one source file matches: D.java, D.cpp.");
		expect(() => findShortSource(settings, "z", dir)).toThrow("Z.java, Z.cpp, Z.c, Z.py");
	});
});

describe("提出先の言語", () => {
	const page = `
		<div id="select-lang" data-name="data.LanguageId">
			<div id="select-lang-abc001_a"><select class="form-control"><option></option>
				<option value="1">Old (Old 1.0)</option>
			</select></div>
			<div id="select-lang-abc001_b"><select class="form-control"><option></option>
				<option value="6014" data-ace-mode="c_cpp">C23 (GCC 14.2.0)</option>
				<option value="6017" data-ace-mode="c_cpp">C&#43;&#43;23 (GCC 15.2.0)</option>
				<option value="6116" data-ace-mode="c_cpp">C&#43;&#43;23 (Clang 21.1.0)</option>
				<option value="6056" data-ace-mode="java">Java24 (OpenJDK 24.0.2)</option>
				<option value="6082" data-ace-mode="python">Python (CPython 3.13.7)</option>
				<option value="6083" data-ace-mode="python">Python (PyPy 3.11-v7.3.20)</option>
			</select></div>
		</div>`;
	const options = extractLanguageOptionsFromSubmitPage(page, "abc001_b");

	test("問題ごとの選択欄から、文字参照を戻した言語名を読む", () => {
		expect(options).toHaveLength(6);
		expect(options[1]).toEqual({value: "6017", label: "C++23 (GCC 15.2.0)"});
		expect(extractLanguageOptionsFromSubmitPage(page, "abc001_a")).toEqual([{value: "1", label: "Old (Old 1.0)"}]);
		expect(extractLanguageOptionsFromSubmitPage(page, "abc001_z")).toEqual([{value: "1", label: "Old (Old 1.0)"}]);
		expect(extractLanguageOptionsFromSubmitPage("<html></html>", "abc001_a")).toEqual([]);
	});

	test("設定の submit を含む言語を選ぶ", () => {
		expect(chooseSubmitLanguageIds(options, findLanguage(settings, "cpp"), JAVA_LANGUAGE_ID)).toEqual(["6017"]);
		expect(chooseSubmitLanguageIds(options, findLanguage(settings, "c"), JAVA_LANGUAGE_ID)).toEqual(["6014"]);
		expect(chooseSubmitLanguageIds(options, findLanguage(settings, "cpython"), JAVA_LANGUAGE_ID)).toEqual(["6082"]);
		expect(chooseSubmitLanguageIds(options, findLanguage(settings, "pypy"), JAVA_LANGUAGE_ID)).toEqual(["6083"]);
	});

	test("Java は固定の ID を先に試す", () => {
		expect(chooseSubmitLanguageIds(options, findLanguage(settings, "java"), JAVA_LANGUAGE_ID)).toEqual(["6056"]);
		expect(chooseSubmitLanguageIds([], findLanguage(settings, "java"), JAVA_LANGUAGE_ID)).toEqual(["6056"]);
	});

	test("合う言語が無ければ、近い言語で代用せずに候補を示して止める", () => {
		expect(findLanguageOptionByLabel(options, "Python (Codon")).toEqual({
			option: null,
			similar: ["Python (CPython 3.13.7)", "Python (PyPy 3.11-v7.3.20)"],
		});
		expect(() => chooseSubmitLanguageIds(options, findLanguage(settings, "codon"), JAVA_LANGUAGE_ID))
			.toThrow('No language on the submit form contains "Python (Codon" ("languages.codon.submit").');
	});

	test("submit が無い言語は、設定の項目を示して止める", () => {
		const language = {name: "rust", family: "rust", isJava: false, runtimeFileName: "main.rs"};
		expect(() => chooseSubmitLanguageIds(options, language, JAVA_LANGUAGE_ID)).toThrow('"languages.rust.submit" is not set');
	});
});
