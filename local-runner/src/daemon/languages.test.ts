import {afterAll, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {DEFAULT_SETTINGS, type Settings} from "../settings/settings";
import {headerUnitArguments, headerUnitKey, pruneHeaderUnits} from "./headerUnit";
import {resolveLanguages} from "./languages";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "runner-languages-"));
const tool = path.join(dir, "tool");
fs.writeFileSync(tool, "#!/bin/sh\n");
fs.chmodSync(tool, 0o755);

afterAll(() => {
	fs.rmSync(dir, {recursive: true, force: true});
});

function settingsWith(languages: Record<string, unknown>): Settings {
	return {...DEFAULT_SETTINGS, languages: {java: DEFAULT_SETTINGS.languages.java, ...languages}} as Settings;
}

const custom = {family: "rust", name: "Rust", match: ["rustc"], command: tool, sourceFile: "main.rs", run: ["{output}"]};

describe("resolveLanguages", () => {
	test("Java を先頭にし、処理系が見つかった言語を足す", () => {
		const {languages, skipped} = resolveLanguages(settingsWith({rust: custom}), "Java 24", (value) => value, true);
		expect(languages.map(({name}) => name)).toEqual(["java", "rust"]);
		expect(languages[0]).toMatchObject({family: "java", displayName: "Java", label: "Java 24", command: null});
		expect(languages[1]).toMatchObject({family: "rust", displayName: "Rust", label: "Rust", match: ["rustc"]});
		expect(languages[1]?.command).toMatchObject({
			name: "rust",
			command: tool,
			sourceFile: "main.rs",
			compile: null,
			run: ["{output}"],
			debugArgs: [],
			debugRewrite: false,
			stackBytes: 1024 * 1024 * 1024,
			headerUnit: false,
			bundle: null,
		});
		expect(skipped).toEqual([]);
	});

	test("処理系が見つからない言語は、理由を付けて外す", () => {
		const missing = {...custom, command: path.join(dir, "missing")};
		const unknown = {...custom, command: "no-such-command-for-local-runner"};
		const {languages, skipped} = resolveLanguages(settingsWith({a: missing, b: unknown}), "Java 24", (value) => value, true);
		expect(languages.map(({name}) => name)).toEqual(["java"]);
		expect(skipped.map(({name}) => name)).toEqual(["a", "b"]);
		expect(skipped[1]?.reason).toBe("no-such-command-for-local-runner was not found");
	});

	test("enabled が false の言語は使わない", () => {
		const {languages, skipped} = resolveLanguages(settingsWith({rust: {...custom, enabled: false}}), "Java 24", (value) => value, true);
		expect(languages.map(({name}) => name)).toEqual(["java"]);
		expect(skipped).toEqual([]);
	});

	test("Linux 以外のサーバーでは、Java 以外を外す", () => {
		const {languages, skipped} = resolveLanguages(settingsWith({rust: custom}), "Java 24", (value) => value, false);
		expect(languages.map(({name}) => name)).toEqual(["java"]);
		expect(skipped).toEqual([{name: "rust", reason: "needs a server running on Linux or WSL"}]);
	});

	test("設定の項目を、実行に使う形へ直す", () => {
		const language = {
			...custom,
			compile: ["{command}", "{source}"],
			debugArgs: ["-g"],
			debugRewrite: true,
			stackMb: 64,
			setup: "builtin:gcc-header-unit",
			bundle: ["cat"],
		};
		const {languages} = resolveLanguages(settingsWith({rust: language}), "Java 24", (value) => value, true);
		expect(languages[1]?.command).toMatchObject({
			compile: ["{command}", "{source}"],
			debugArgs: ["-g"],
			debugRewrite: true,
			stackBytes: 64 * 1024 * 1024,
			headerUnit: true,
			bundle: ["cat"],
		});
	});
});

describe("header unit", () => {
	const template = ["/usr/bin/g++", "-std=gnu++23", "-O2", "-fmodules", "-DLOCAL", "{source}", "-o", "{output}", "-Wl,--as-needed", "-lstdc++exp"];

	test("ソース、出力先、リンクの指定を除いた引数で作る", () => {
		expect(headerUnitArguments(template)).toEqual(["/usr/bin/g++", "-std=gnu++23", "-O2", "-fmodules", "-DLOCAL"]);
	});

	test("引数の組が変われば別のものにする", () => {
		const base = headerUnitKey(headerUnitArguments(template));
		expect(headerUnitKey(headerUnitArguments(template))).toBe(base);
		expect(headerUnitKey(headerUnitArguments([...template, "-D_GLIBCXX_ASSERTIONS"]))).not.toBe(base);
		expect(headerUnitKey(headerUnitArguments(template.filter((argument) => argument !== "-DLOCAL")))).not.toBe(base);
		// リンクの指定は、ヘッダーを読んだ結果に影響しない。
		expect(headerUnitKey(headerUnitArguments([...template, "-lm"]))).toBe(base);
	});

	test("今の設定で使わないものを消す", () => {
		const cacheDir = path.join(dir, "header-units");
		const kept = path.join(cacheDir, headerUnitKey(headerUnitArguments(template)));
		const stale = path.join(cacheDir, "0123456789abcdef0123456789abcdef");
		fs.mkdirSync(kept, {recursive: true});
		fs.mkdirSync(stale, {recursive: true});
		pruneHeaderUnits(cacheDir, [template]);
		expect(fs.existsSync(kept)).toBe(true);
		expect(fs.existsSync(stale)).toBe(false);
		pruneHeaderUnits(path.join(dir, "missing"), [template]);
	});
});
