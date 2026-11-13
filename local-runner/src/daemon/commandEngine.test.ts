import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {CommandEngine, type CommandLanguage, expandArguments, rewriteDebugFlag} from "./commandEngine";
import {CanceledError, ensureLauncher, findOnPath} from "./processRunner";

describe("expandArguments", () => {
	const values = {command: "/usr/bin/g++", source: "Main.cpp", output: "/work/program", dir: "/work"};

	test("引数の中の名前を置き換える", () => {
		expect(expandArguments(["{command}", "{source}", "-o", "{output}", "-I{dir}/include", "-O2"], values))
			.toEqual(["/usr/bin/g++", "Main.cpp", "-o", "/work/program", "-I/work/include", "-O2"]);
	});

	test("先頭の ~/ をホームにする", () => {
		expect(expandArguments(["~/bin/tool", "a~/b"], values)).toEqual([path.join(os.homedir(), "bin/tool"), "a~/b"]);
	});
});

describe("rewriteDebugFlag", () => {
	test("Python の DEBUG を、大文字で始まる値のまま書き換える", () => {
		expect(rewriteDebugFlag("import sys\nDEBUG: bool = True\nx = 1\n", false)).toBe("import sys\nDEBUG: bool = False\nx = 1\n");
		expect(rewriteDebugFlag("DEBUG = False\n", true)).toBe("DEBUG = True\n");
	});

	test("修飾子の付いた宣言も書き換える", () => {
		expect(rewriteDebugFlag("\tprivate static final boolean DEBUG = true;\n", false)).toBe("\tprivate static final boolean DEBUG = false;\n");
		expect(rewriteDebugFlag("const bool DEBUG = false;\n", true)).toBe("const bool DEBUG = true;\n");
	});

	test("最初の1か所だけを書き換え、DEBUG を使うだけの行は変えない", () => {
		const source = "if DEBUG:\n\tpass\nDEBUG = True\nDEBUG = True\n";
		expect(rewriteDebugFlag(source, false)).toBe("if DEBUG:\n\tpass\nDEBUG = False\nDEBUG = True\n");
	});

	test("DEBUG が無ければそのまま返す", () => {
		expect(rewriteDebugFlag("print(1)\n", false)).toBe("print(1)\n");
	});
});

// プロセスの起動と計測は Linux の機能を使う。python3 と cc は、CI の ubuntu と WSL にある前提で確かめる。
const python = process.platform === "linux" ? findOnPath("python3") : null;
const cc = process.platform === "linux" ? findOnPath("cc") : null;
const LAUNCHER_SOURCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../native/launcher.c");

describe.skipIf(python === null || cc === null)("CommandEngine", () => {
	let dir: string;
	let launcher: string | null;
	const logs: string[] = [];

	const pythonLanguage: CommandLanguage = {
		name: "cpython",
		command: python ?? "",
		sourceFile: "Main.py",
		compile: ["{command}", "-m", "py_compile", "{source}"],
		run: ["{command}", "{source}"],
		debugArgs: [],
		debugRewrite: true,
		stackBytes: 256 * 1024 * 1024,
		headerUnit: false,
		bundle: null,
	};
	const cLanguage: CommandLanguage = {
		name: "c",
		command: cc ?? "",
		sourceFile: "Main.c",
		compile: ["{command}", "-O0", "{source}", "-o", "{output}"],
		run: ["{output}"],
		debugArgs: ["-DLOCAL"],
		debugRewrite: false,
		stackBytes: 512 * 1024 * 1024,
		headerUnit: false,
		bundle: null,
	};

	function createEngine(overrides: {runTimeoutMs?: number; outputLimitBytes?: number; launcher?: string | null} = {}) {
		return new CommandEngine({
			rootDir: path.join(dir, "programs"),
			headerUnitCacheDir: path.join(dir, "header-units"),
			compileTimeoutMs: 30_000,
			runTimeoutMs: overrides.runTimeoutMs ?? 10_000,
			outputLimitBytes: overrides.outputLimitBytes ?? 1024 * 1024,
			maxPrograms: 10,
			launcher: overrides.launcher === undefined ? launcher : overrides.launcher,
			log: (message) => logs.push(message),
		});
	}

	async function runSource(engine: CommandEngine, language: CommandLanguage, sourceCode: string, stdin = "", debug = true) {
		const prepared = await engine.prepare(language, sourceCode, debug);
		if (prepared.status !== "success") throw new Error(`prepare failed: ${prepared.diagnostics}`);
		const outcome = await engine.run(prepared.programId, stdin);
		if (outcome === null) throw new Error("the program was not found");
		return outcome;
	}

	beforeAll(async () => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), "command-engine-"));
		launcher = await ensureLauncher(LAUNCHER_SOURCE, path.join(dir, "launcher"), ["cc"]);
	});

	afterAll(() => {
		fs.rmSync(dir, {recursive: true, force: true});
	});

	test("起動プログラムをビルドできる", () => {
		expect(launcher).not.toBeNull();
	});

	test("コンパイルして実行し、出力、時間、メモリを返す", async () => {
		const outcome = await runSource(createEngine(), pythonLanguage, "a, b = map(int, input().split())\nprint(a + b)\n", "1 2\n");
		expect(outcome).toMatchObject({exitCode: 0, signal: null, timedOut: false, stdout: "3\n", stderr: ""});
		expect(outcome.peakMemoryKb).toBeGreaterThan(1000);
	});

	test("同じソースと引数なら、コンパイルの結果を使い回す", async () => {
		const engine = createEngine();
		const first = await engine.prepare(pythonLanguage, "print(1)\n", true);
		const second = await engine.prepare(pythonLanguage, "print(1)\n", true);
		expect(first.status).toBe("success");
		expect(second).toEqual(first);
		expect(engine.size).toBe(1);
	});

	test("起動し直したあとも、残っているコンパイルの結果を使い回す", async () => {
		const source = "print('restart')\n";
		const first = await createEngine().prepare(pythonLanguage, source, true);
		logs.length = 0;
		// 新しいエンジンは、サーバーを起動し直した状態にあたる。
		const restarted = createEngine();
		const second = await restarted.prepare(pythonLanguage, source, true);
		expect(second).toEqual(first);
		expect(logs.filter((line) => line.startsWith("[Compile]"))).toEqual([
			expect.stringMatching(/^\[Compile\] Lang=cpython Status=CACHED Id=/),
		]);
		if (second.status !== "success") return;
		expect((await restarted.run(second.programId, ""))?.stdout).toBe("restart\n");
	});

	test("コンパイルの記録は、言語、結果、時間、ID を同じ形で残す", async () => {
		logs.length = 0;
		const engine = createEngine();
		await engine.prepare(pythonLanguage, "print('log')\n", true);
		await engine.prepare(pythonLanguage, "print('log')\n", true);
		await engine.prepare(pythonLanguage, "def broken(:\n", true);
		expect(logs).toEqual([
			expect.stringMatching(/^\[Compile\] Lang=cpython Status=OK Time=\d+ms Id=[0-9a-f]+-[0-9a-f]{14}\.\.\.$/),
			expect.stringMatching(/^\[Compile\] Lang=cpython Status=CACHED Id=/),
			expect.stringMatching(/^\[Compile\] Lang=cpython Status=NG Time=\d+ms Id=/),
		]);
	});

	test("コンパイルエラーは、作業フォルダの場所を含まないメッセージで返す", async () => {
		const prepared = await createEngine().prepare(pythonLanguage, "def f(:\n\tpass\n", true);
		expect(prepared.status).toBe("compileError");
		if (prepared.status !== "compileError") return;
		expect(prepared.diagnostics).toContain('File "Main.py", line 1');
		expect(prepared.diagnostics).not.toContain(dir);
	});

	test("DEBUG の書き換えと、デバッグ用の引数を切り替える", async () => {
		const engine = createEngine();
		const pythonSource = "DEBUG: bool = True\nprint(DEBUG)\n";
		expect((await runSource(engine, pythonLanguage, pythonSource, "", true)).stdout).toBe("True\n");
		expect((await runSource(engine, pythonLanguage, pythonSource, "", false)).stdout).toBe("False\n");

		const cSource = '#include <stdio.h>\nint main(void) {\n#ifdef LOCAL\n\tputs("local");\n#else\n\tputs("judge");\n#endif\n\treturn 0;\n}\n';
		expect((await runSource(engine, cLanguage, cSource, "", true)).stdout).toBe("local\n");
		expect((await runSource(engine, cLanguage, cSource, "", false)).stdout).toBe("judge\n");
	});

	test("例外で終わった実行は、終了コードとエラー出力を返す", async () => {
		const outcome = await runSource(createEngine(), pythonLanguage, "raise ValueError('boom')\n");
		expect(outcome.exitCode).toBe(1);
		expect(outcome.stderr).toContain("ValueError: boom");
		expect(outcome.stderr).toContain('File "Main.py"');
	});

	test("シグナルで終わった実行は、シグナルの名前を返す", async () => {
		const outcome = await runSource(createEngine(), cLanguage, "#include <stdlib.h>\nint main(void) { abort(); }\n");
		expect(outcome).toMatchObject({exitCode: -1, signal: "SIGABRT", timedOut: false});
	});

	test("制限時間を過ぎた実行を止める", async () => {
		const engine = createEngine({runTimeoutMs: 300});
		const outcome = await runSource(engine, cLanguage, "int main(void) { volatile unsigned long x = 0; for (;;) x++; }\n");
		expect(outcome.timedOut).toBe(true);
	});

	test("スタックの上限を上げて、深い再帰を実行する", async () => {
		const source = '#include <stdio.h>\nlong long f(long long n) { volatile char pad[256]; pad[0] = 1; return n == 0 ? 0 : f(n - 1) + pad[0]; }\n'
			+ 'int main(void) { long long n; if (scanf("%lld", &n) != 1) return 1; printf("%lld\\n", f(n)); return 0; }\n';
		const outcome = await runSource(createEngine(), cLanguage, source, "500000\n");
		expect(outcome).toMatchObject({exitCode: 0, stdout: "500000\n"});
	});

	test("メモリの最大値は、解答が確保した量を反映する", async () => {
		const source = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n'
			+ 'int main(void) { size_t size = (size_t) 100 << 20; char *p = malloc(size); memset(p, 1, size); printf("%d\\n", p[size - 1]); return 0; }\n';
		const small = await runSource(createEngine(), cLanguage, "int main(void) { return 0; }\n");
		const large = await runSource(createEngine(), cLanguage, source);
		// サーバー自身の使用量が混ざらないので、何もしないプログラムは数 MB に収まる。
		expect(small.peakMemoryKb).toBeLessThan(10 * 1024);
		expect(large.peakMemoryKb).toBeGreaterThan(100 * 1024);
		expect(large.peakMemoryKb).toBeLessThan(120 * 1024);
	});

	test("出力は上限で切り詰める", async () => {
		const engine = createEngine({outputLimitBytes: 1000});
		const outcome = await runSource(engine, pythonLanguage, "print('x' * 5000)\n");
		expect(outcome.stdoutTruncated).toBe(true);
		expect(outcome.stdout.length).toBe(1000);
	});

	test("bundle のコマンドに通したソースをコンパイルする", async () => {
		const sed = findOnPath("sed") ?? "sed";
		const language = {...pythonLanguage, name: "bundled", bundle: [sed, "s/PLACEHOLDER/42/"]};
		const engine = createEngine();
		expect((await runSource(engine, language, "print(PLACEHOLDER)\n")).stdout).toBe("42\n");
		expect(await engine.transformSource(language, "DEBUG = True\nprint(PLACEHOLDER)\n", false))
			.toEqual({ok: true, sourceCode: "DEBUG = False\nprint(42)\n"});
	});

	test("bundle のコマンドが失敗したら、コンパイルエラーにする", async () => {
		const language = {...pythonLanguage, name: "broken", bundle: [python ?? "", "-c", "import sys; sys.exit('bundle failed')"]};
		const prepared = await createEngine().prepare(language, "print(1)\n", true);
		expect(prepared).toMatchObject({status: "compileError", diagnostics: "bundle failed"});
	});

	test("中断したコンパイルは、子プロセスも止め、作業フォルダと結果を残さない", async () => {
		const marker = path.join(dir, "late-marker");
		// 子プロセスが生き残っていれば、少しあとに印のファイルを作る
		const slow = {
			...cLanguage,
			name: "slow",
			compile: ["/bin/sh", "-c", `(sleep 1; touch '${marker}') & wait`],
		};
		const engine = createEngine();
		const controller = new AbortController();
		const programsDir = path.join(dir, "programs");
		fs.mkdirSync(programsDir, {recursive: true});
		const before = fs.readdirSync(programsDir);
		logs.length = 0;
		const prepared = engine.prepare(slow, "int main(void) { return 0; }\n", true, controller.signal);
		await new Promise((resolve) => setTimeout(resolve, 200));
		controller.abort();
		await expect(prepared).rejects.toBeInstanceOf(CanceledError);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		expect(fs.existsSync(marker)).toBe(false);
		expect(logs).toEqual([expect.stringMatching(/^\[Compile\] Lang=slow Status=CANCELED Time=\d+ms Id=/)]);
		expect(fs.readdirSync(programsDir)).toEqual(before);
		expect(engine.size).toBe(0);
	});

	test("中断した直後に同じソースを頼むと、コンパイルし直す", async () => {
		const engine = createEngine();
		const controller = new AbortController();
		controller.abort();
		await expect(engine.prepare(pythonLanguage, "print('again')\n", true, controller.signal)).rejects.toBeInstanceOf(CanceledError);
		const prepared = await engine.prepare(pythonLanguage, "print('again')\n", true);
		expect(prepared.status).toBe("success");
	});

	test("実行を始めた時刻を返す。前の実行を待った時間は含まない", async () => {
		const engine = createEngine();
		const prepared = await engine.prepare(pythonLanguage, "import time\ntime.sleep(0.3)\n", true);
		if (prepared.status !== "success") throw new Error(prepared.diagnostics);
		const requested = Date.now();
		const [first, second] = await Promise.all([engine.run(prepared.programId, ""), engine.run(prepared.programId, "")]);
		expect(first!.startedAt).toBeGreaterThanOrEqual(requested);
		// 実行は1つずつなので、2つ目は1つ目が終わってから始まる
		expect(second!.startedAt - requested).toBeGreaterThanOrEqual(250);
		expect(second!.timeMs).toBeLessThan(second!.startedAt - requested + 1000);
	});

	test("知らない programId は null を返す", async () => {
		expect(await createEngine().run("0-00000000000000000000000000000000", "")).toBeNull();
	});

	test("起動プログラムが無くても実行できる", async () => {
		const engine = createEngine({launcher: null, runTimeoutMs: 300});
		expect((await runSource(engine, pythonLanguage, "print(input())\n", "ok\n")).stdout).toBe("ok\n");
		const looping = await runSource(engine, cLanguage, "int main(void) { volatile unsigned long x = 0; for (;;) x++; }\n");
		expect(looping.timedOut).toBe(true);
		const aborted = await runSource(engine, cLanguage, "#include <stdlib.h>\nint main(void) { abort(); }\n");
		expect(aborted.signal).toBe("SIGABRT");
	});
});
