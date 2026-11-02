import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {readLocalSettings, resolveLibrarySource, toRuntimePath, writeLocalSettings} from "./localSettings";

describe("localSettings", () => {
	let dir: string;

	beforeEach(() => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), "local-settings-"));
	});

	afterEach(() => {
		fs.rmSync(dir, {recursive: true, force: true});
	});

	test("書き込んだ設定を読み戻す", () => {
		const file = path.join(dir, "settings.json");
		writeLocalSettings(file, {librarySourceRoot: "/library/src"});
		expect(readLocalSettings(file)).toEqual({librarySourceRoot: "/library/src"});
	});

	test("ファイルが無いか形が違えば空の設定にする", () => {
		const file = path.join(dir, "settings.json");
		expect(readLocalSettings(file)).toEqual({});
		fs.writeFileSync(file, "{broken");
		expect(readLocalSettings(file)).toEqual({});
		fs.writeFileSync(file, JSON.stringify({librarySourceRoot: 1}));
		expect(readLocalSettings(file)).toEqual({});
	});

	test("src を直接指定しても、ライブラリのルートを指定しても src を返す", () => {
		const src = path.join(dir, "src");
		fs.mkdirSync(path.join(src, "lib"), {recursive: true});
		expect(resolveLibrarySource(src)).toBe(src);
		expect(resolveLibrarySource(dir)).toBe(src);
	});

	test("lib が無いフォルダはエラーにする", () => {
		expect(() => resolveLibrarySource(dir)).toThrow("The lib folder was not found.");
	});
});

describe("toRuntimePath", () => {
	test("WSL では Windows のパスを /mnt の形にする", () => {
		expect(toRuntimePath("C:\\Users\\me\\library\\src", "linux")).toBe("/mnt/c/Users/me/library/src");
		expect(toRuntimePath("D:/library/src", "linux")).toBe("/mnt/d/library/src");
	});

	test("Linux のパスと、Windows で動くときのパスは変えない", () => {
		expect(toRuntimePath("/home/me/library/src", "linux")).toBe("/home/me/library/src");
		expect(toRuntimePath("C:\\library\\src", "win32")).toBe("C:\\library\\src");
	});
});
