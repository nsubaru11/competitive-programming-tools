import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import schema from "../../settings.schema.json";
import {type SchemaNode, validateAgainstSchema} from "./schema";
import {
	commandLanguageSettings,
	DEFAULT_SETTINGS,
	deleteSetting,
	describeSettings,
	legacyEnvironmentWarnings,
	loadSettings,
	readUserSettings,
	resolveLibrarySource,
	resolveSettingPath,
	serverSettingsDigest,
	setSetting,
	SettingsError,
	writeUserSettings,
} from "./settings";

let dir: string;
let file: string;

beforeEach(() => {
	dir = fs.mkdtempSync(path.join(os.tmpdir(), "local-settings-"));
	file = path.join(dir, "settings.json");
});

afterEach(() => {
	fs.rmSync(dir, {recursive: true, force: true});
});

function writeRaw(value: unknown): void {
	fs.writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value));
}

describe("loadSettings", () => {
	test("既定値はスキーマに合う", () => {
		expect(validateAgainstSchema(DEFAULT_SETTINGS, schema as SchemaNode)).toEqual([]);
	});

	test("ファイルが無ければ既定値を返す", () => {
		expect(loadSettings(file)).toEqual(DEFAULT_SETTINGS);
	});

	test("書かれた項目だけを既定値に重ねる", () => {
		writeRaw({
			$schema: "./settings.schema.json",
			server: {port: 9000},
			languages: {java: {library: "/library/src"}},
			headers: {java: "/header/java.txt"},
		});
		const settings = loadSettings(file);
		expect(settings.server).toEqual({...DEFAULT_SETTINGS.server, port: 9000});
		expect(settings.languages.java).toEqual({...DEFAULT_SETTINGS.languages.java, library: "/library/src"});
		expect(settings.headers).toEqual({java: "/header/java.txt"});
		expect(settings.run).toEqual(DEFAULT_SETTINGS.run);
		expect("$schema" in settings).toBe(false);
	});

	test("配列は丸ごと置き換える", () => {
		writeRaw({server: {extraOrigins: ["http://localhost:4173"]}});
		expect(loadSettings(file).server.extraOrigins).toEqual(["http://localhost:4173"]);
	});

	test("JSON として読めなければ、ファイルの場所を示してエラーにする", () => {
		writeRaw("{broken");
		expect(() => loadSettings(file)).toThrow(SettingsError);
		expect(() => loadSettings(file)).toThrow(file);
	});

	test("BOM 付きのファイルも読める", () => {
		writeRaw(`\uFEFF${JSON.stringify({server: {port: 9000}})}`);
		expect(loadSettings(file).server.port).toBe(9000);
	});

	test("知らない項目と型の違う項目は、名前を示してエラーにする", () => {
		writeRaw({server: {prot: 9000, port: "9000"}, headers: {"bad name": "x"}, run: {timeoutMs: 1}});
		let message = "";
		try {
			loadSettings(file);
		} catch (error) {
			message = (error as Error).message;
		}
		expect(message).toContain("server.prot: unknown setting");
		expect(message).toContain("server.port: must be an integer");
		expect(message).toContain('headers["bad name"]: the name must match');
		expect(message).toContain("run.timeoutMs: must be 100 or more");
	});

	test("列挙の値以外はエラーにする", () => {
		writeRaw({server: {backend: "docker"}});
		expect(() => loadSettings(file)).toThrow('server.backend: must be one of "wsl", "native"');
	});
});

describe("languages", () => {
	const zig = {family: "zig", name: "Zig", command: "zig", sourceFile: "main.zig", run: ["{output}"]};

	test("既定の言語は、書いた項目だけを上書きする", () => {
		writeRaw({languages: {cpp: {command: "~/gcc/bin/g++"}, pypy: {stackMb: 512}}});
		const {cpp, pypy} = loadSettings(file).languages;
		expect(cpp).toEqual({...DEFAULT_SETTINGS.languages.cpp, command: "~/gcc/bin/g++"});
		expect(pypy).toEqual({...DEFAULT_SETTINGS.languages.pypy, stackMb: 512});
	});

	test("新しい名前を書くと言語が増える", () => {
		writeRaw({languages: {zig}});
		const names = commandLanguageSettings(loadSettings(file)).map(([name]) => name);
		expect(names).toEqual(["cpp", "c", "cpython", "pypy", "codon", "go", "rust", "kotlin", "csharp", "zig"]);
	});

	test("足す言語に必要な項目が無ければ、名前を示してエラーにする", () => {
		writeRaw({languages: {zig: {family: "zig", name: "Zig", command: "zig", run: []}}});
		let message = "";
		try {
			loadSettings(file);
		} catch (error) {
			message = (error as Error).message;
		}
		expect(message).toContain("languages.zig.sourceFile: is required to add a language");
		expect(message).toContain("languages.zig.run: is required to add a language");
		expect(message).not.toContain("languages.zig.family");
	});

	test("enabled が false の言語は、一覧から外れる", () => {
		writeRaw({languages: {codon: {enabled: false}, zig: {...zig, enabled: false}}});
		const names = commandLanguageSettings(loadSettings(file)).map(([name]) => name);
		expect(names).toEqual(["cpp", "c", "cpython", "pypy", "go", "rust", "kotlin", "csharp"]);
	});

	test("言語の名前、種類、Java に書けない項目を検査する", () => {
		writeRaw({languages: {Zig: zig, go: {...zig, family: "golang"}, java: {compile: ["javac"]}, c: {setup: "builtin:pch"}}});
		let message = "";
		try {
			loadSettings(file);
		} catch (error) {
			message = (error as Error).message;
		}
		expect(message).toContain("languages.Zig: the name must match");
		expect(message).toContain("languages.go.family: must be one of");
		expect(message).toContain("languages.java.compile: unknown setting");
		expect(message).toContain('languages.c.setup: must be one of "builtin:gcc-header-unit"');
	});

	test("setup には compile が要る", () => {
		writeRaw({languages: {zig: {...zig, setup: "builtin:gcc-header-unit"}}});
		expect(() => loadSettings(file)).toThrow('languages.zig.setup: needs "compile"');
	});

	test("種類の一覧は、CP Toolkit の言語の表と一致する", () => {
		const catalogFile = path.resolve(import.meta.dir, "../../../userscripts/CpToolkit/data/languages.yaml");
		const catalog = [...fs.readFileSync(catalogFile, "utf8").matchAll(/^\s*- \{id: ([\w-]+),/gm)].map((match) => match[1]);
		const families = (schema as {properties: {languages: {additionalProperties: {properties: {family: {enum: string[]}}}}}})
			.properties.languages.additionalProperties.properties.family.enum;
		expect(catalog.length).toBeGreaterThan(10);
		expect(families).toEqual(catalog as string[]);
	});
});

describe("extensions", () => {
	test("拡張子ごとの言語を上書きし、足せる", () => {
		writeRaw({extensions: {".py": "pypy", ".cc": "cpp"}});
		expect(loadSettings(file).extensions).toEqual({...DEFAULT_SETTINGS.extensions, ".py": "pypy", ".cc": "cpp"});
	});

	test("拡張子の形と、言語の名前を検査する", () => {
		writeRaw({extensions: {py: "pypy"}});
		expect(() => loadSettings(file)).toThrow("extensions.py: the name must match");
		writeRaw({extensions: {".rb": "ruby"}});
		expect(() => loadSettings(file)).toThrow('extensions[".rb"]: unknown language "ruby"');
	});
});

describe("以前の形式の設定ファイル", () => {
	test("今の形式へ書き換え、元のファイルを .bak に残す", () => {
		const legacy = {librarySourceRoot: "C:\\library\\src", headerFiles: {java: "C:\\header\\java.txt"}};
		writeRaw(legacy);
		const settings = loadSettings(file);
		expect(settings.languages.java.library).toBe("C:\\library\\src");
		expect(settings.headers).toEqual({java: "C:\\header\\java.txt"});
		expect(JSON.parse(fs.readFileSync(`${file}.bak`, "utf8"))).toEqual(legacy);
		expect(JSON.parse(fs.readFileSync(file, "utf8"))).toEqual({
			languages: {java: {library: "C:\\library\\src"}},
			headers: {java: "C:\\header\\java.txt"},
		});
	});

	test("今の形式のファイルは書き換えない", () => {
		writeRaw({server: {port: 9000}});
		loadSettings(file);
		expect(fs.existsSync(`${file}.bak`)).toBe(false);
	});
});

describe("設定ファイルの書き換え", () => {
	test("入れ子の項目を書き、読み戻す", () => {
		const user = readUserSettings(file);
		setSetting(user, ["languages", "java", "library"], "/library/src");
		setSetting(user, ["headers", "java"], "/header/java.txt");
		writeUserSettings(file, user);
		expect(readUserSettings(file)).toEqual({
			languages: {java: {library: "/library/src"}},
			headers: {java: "/header/java.txt"},
		});
	});

	test("項目を消すと、空になった階層も消える", () => {
		const user = {languages: {java: {library: "/library/src"}}, headers: {java: "a", short: "b"}};
		deleteSetting(user, ["languages", "java", "library"]);
		deleteSetting(user, ["headers", "java"]);
		deleteSetting(user, ["headers", "missing"]);
		expect(user as unknown).toEqual({headers: {short: "b"}});
	});

	test("正しくない内容は書かない", () => {
		expect(() => writeUserSettings(file, {server: {port: 0}})).toThrow("server.port: must be 1 or more");
		expect(fs.existsSync(file)).toBe(false);
	});
});

describe("describeSettings", () => {
	test("全項目を並べ、既定値と違う項目に印を付ける", () => {
		writeRaw({server: {port: 9000}, headers: {java: "/header/java.txt"}});
		const rows = describeSettings(loadSettings(file));
		expect(rows.find(({name}) => name === "server.port")).toEqual({name: "server.port", value: "9000", changed: true});
		expect(rows.find(({name}) => name === "server.backend")).toEqual({
			name: "server.backend",
			value: '"wsl"',
			changed: false
		});
		expect(rows.find(({name}) => name === "headers.java")?.changed).toBe(true);
		expect(rows.find(({name}) => name === "server.extraOrigins")?.value).toBe("[]");
		expect(rows.find(({name}) => name === 'extensions[".py"]')?.value).toBe('"cpython"');
	});
});

describe("serverSettingsDigest", () => {
	test("サーバーが読む項目が変わると値が変わり、CLI だけが読む項目では変わらない", () => {
		const base = serverSettingsDigest(DEFAULT_SETTINGS);
		writeRaw({headers: {java: "/header/java.txt"}, atcoder: {sampleCache: false}, server: {autoStart: false}});
		expect(serverSettingsDigest(loadSettings(file))).toBe(base);
		writeRaw({run: {timeoutMs: 5000}});
		expect(serverSettingsDigest(loadSettings(file))).not.toBe(base);
	});
});

describe("resolveSettingPath", () => {
	const linux = {platform: "linux", homeDir: "/home/me"} as const;
	const windows = {platform: "win32", homeDir: "C:\\Users\\me"} as const;

	test("~ は読んでいる側のホームにする", () => {
		expect(resolveSettingPath("~/.atcoder/session.txt", "/mnt/c/tools/s.json", linux)).toBe("/home/me/.atcoder/session.txt");
		expect(resolveSettingPath("~/.atcoder/session.txt", "C:\\tools\\s.json", windows)).toBe("C:\\Users\\me\\.atcoder\\session.txt");
	});

	test("相対パスは設定ファイルのあるフォルダから解決する", () => {
		expect(resolveSettingPath("../library/java/src", "/mnt/c/repo/tools/s.json", linux)).toBe("/mnt/c/repo/library/java/src");
		expect(resolveSettingPath("../library/java/src", "C:\\repo\\tools\\s.json", windows)).toBe("C:\\repo\\library\\java\\src");
	});

	test("WSL では Windows のパスを /mnt の形にする", () => {
		expect(resolveSettingPath("C:\\Users\\me\\library\\src", "/mnt/c/tools/s.json", linux)).toBe("/mnt/c/Users/me/library/src");
		expect(resolveSettingPath("D:/library/src", "/mnt/c/tools/s.json", linux)).toBe("/mnt/d/library/src");
	});

	test("Windows では /mnt のパスをドライブのパスにする", () => {
		expect(resolveSettingPath("/mnt/c/Users/me/library/src", "C:\\tools\\s.json", windows)).toBe("C:\\Users\\me\\library\\src");
	});

	test("WSL だけにあるパスを Windows から読むとエラーにする", () => {
		expect(() => resolveSettingPath("/home/me/session.txt", "C:\\tools\\s.json", windows)).toThrow(SettingsError);
	});

	test("読んでいる側の絶対パスは変えない", () => {
		expect(resolveSettingPath("/home/me/library/src", "/mnt/c/tools/s.json", linux)).toBe("/home/me/library/src");
		expect(resolveSettingPath("C:\\library\\src", "C:\\tools\\s.json", windows)).toBe("C:\\library\\src");
	});
});

describe("resolveLibrarySource", () => {
	test("フォルダの名前によらず、指定したフォルダをそのまま返す", () => {
		const library = path.join(dir, "any-name");
		fs.mkdirSync(path.join(library, "nested"), {recursive: true});
		fs.writeFileSync(path.join(library, "nested", "Tool.java"), "package mylib; public final class Tool {}");
		expect(resolveLibrarySource(library)).toBe(library);
		expect(resolveLibrarySource(dir)).toBe(dir);
	});

	test("無いフォルダと、.java が無いフォルダはエラーにする", () => {
		expect(() => resolveLibrarySource(path.join(dir, "missing"))).toThrow("The folder was not found");
		fs.mkdirSync(path.join(dir, ".git"));
		fs.writeFileSync(path.join(dir, ".git", "Hidden.java"), "");
		fs.writeFileSync(path.join(dir, "notes.txt"), "");
		expect(() => resolveLibrarySource(dir)).toThrow("No .java files were found");
	});
});

describe("legacyEnvironmentWarnings", () => {
	test("設定されている古い環境変数だけを、値を出さずに案内する", () => {
		const warnings = legacyEnvironmentWarnings({
			LOCAL_RUNNER_PORT: "9000",
			ATCODER_SESSION: "secret-value",
			LOCAL_RUNNER_BACKEND: "",
			NO_COLOR: "1",
		}, file);
		expect(warnings).toEqual([
			`The environment variable LOCAL_RUNNER_PORT is no longer read. Write "server.port" in ${file} instead.`,
			"The environment variable ATCODER_SESSION is no longer read.",
		]);
	});
});
