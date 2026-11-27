import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {stripAnsi} from "../utils/color";
import {CommandEngine, type CommandLanguage, expandArguments} from "./commandEngine";
import {canRewriteDebugFlag, DEBUG_FLAG_FAMILIES, locateDebugFlag, rewriteDebugFlag} from "@atcoder-tools/shared";
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
		expect(rewriteDebugFlag("import sys\nDEBUG: bool = True\nx = 1\n", "DEBUG", false, "python3")).toBe("import sys\nDEBUG: bool = False\nx = 1\n");
		expect(rewriteDebugFlag("DEBUG = False\n", "DEBUG", true, "python3")).toBe("DEBUG = True\n");
	});

	test("修飾子の付いた宣言も書き換える", () => {
		expect(rewriteDebugFlag("const bool DEBUG = false;\n", "DEBUG", true, "cpp")).toBe("const bool DEBUG = true;\n");
	});

	test("設定した名前だけを書き換え、使うだけの行は変えない", () => {
		expect(rewriteDebugFlag("if LOCAL:\n\tpass\nLOCAL = True\nDEBUG = True\n", "LOCAL", false, "python3")).toBe("if LOCAL:\n\tpass\nLOCAL = False\nDEBUG = True\n");
	});

	test("代入が2行以上あれば、どれが本物か決められないので null を返す", () => {
		expect(rewriteDebugFlag("DEBUG = False\nDEBUG = True\n", "DEBUG", false, "python3")).toBeNull();
	});

	test("名前が無ければそのまま返す", () => {
		expect(rewriteDebugFlag("print(1)\n", "DEBUG", false, "python3")).toBe("print(1)\n");
	});

	test("Python の文字列、複合式、ローカル変数と論理行の続きは変えない", () => {
		const unchanged = 'r"""\r\nDEBUG = True\r\n"""\r\nDEBUG = True == False\r\ndef f():\r\n  DEBUG = True\r\na = dict(\r\nDEBUG = True\r\n)\r\n';
		expect(rewriteDebugFlag(unchanged + "DEBUG: bool = True # flag\r\n", "DEBUG", false, "python3"))
			.toBe(unchanged + "DEBUG: bool = False # flag\r\n");
	});

	test("C++ のコメント、生文字列、複合式と関数内の宣言は変えない", () => {
		const unchanged = '/*\nconst bool DEBUG = true;\n*/\nauto s = R"tag(\nconst bool DEBUG = true;\n)tag";\nconst bool DEBUG = true && flag;\nvoid f() {\nconst bool DEBUG = true;\n}\n';
		expect(rewriteDebugFlag(unchanged + "constexpr bool DEBUG = true; // flag\n", "DEBUG", false, "cpp"))
			.toBe(unchanged + "constexpr bool DEBUG = false; // flag\n");
	});

	test("Go の生文字列と関数内の宣言は変えず、パッケージ直下の宣言を書き換える", () => {
		const unchanged = "package main\n\nvar s = `\nconst DEBUG = true\n`\n\nfunc main() {\n\tvar DEBUG = true\n}\n";
		expect(rewriteDebugFlag(unchanged + "const DEBUG = true // flag\n", "DEBUG", false, "go"))
			.toBe(unchanged + "const DEBUG = false // flag\n");
	});

	test("Rust のライフタイム、生文字列と関数内の宣言は変えず、モジュール直下の定数を書き換える", () => {
		const unchanged = "fn first<'a>(s: &'a str) -> &'a str { s }\nconst S: &str = r#\"\nconst DEBUG: bool = true;\n\"#;\nfn main() {\n    const DEBUG: bool = true;\n}\n";
		expect(rewriteDebugFlag(unchanged + "pub const DEBUG: bool = true;\n", "DEBUG", false, "rust"))
			.toBe(unchanged + "pub const DEBUG: bool = false;\n");
	});

	test("書き換える宣言の行を返し、無いか2つ以上なら null を返す", () => {
		expect(locateDebugFlag("import sys\n\nDEBUG = True\n", "DEBUG", "python3")).toBe(3);
		expect(locateDebugFlag("print(1)\n", "DEBUG", "python3")).toBeNull();
		expect(locateDebugFlag("DEBUG = True\nDEBUG = False\n", "DEBUG", "python3")).toBeNull();
		expect(locateDebugFlag("DEBUG = True\n", "DEBUG", "brainfuck")).toBeNull();
	});

	test("Rust の入れ子のコメントは、いちばん外側が閉じるまで宣言として数えない", () => {
		const nested = "/* outer\n/* inner */\nconst DEBUG: bool = true;\n*/\n";
		expect(rewriteDebugFlag(nested + "const DEBUG: bool = true;\n", "DEBUG", false, "rust"))
			.toBe(nested + "const DEBUG: bool = false;\n");
		// C の系統は入れ子にしないので、最初の */ でコメントが終わる
		expect(rewriteDebugFlag("/* a /* b */\nconst bool DEBUG = true;\n", "DEBUG", false, "cpp")).toBe("/* a /* b */\nconst bool DEBUG = false;\n");
	});

	test("対応していない言語は書き換えない", () => {
		expect(canRewriteDebugFlag("kotlin")).toBe(false);
		expect(rewriteDebugFlag("val DEBUG = true\n", "DEBUG", false, "kotlin")).toBe("val DEBUG = true\n");
		expect(DEBUG_FLAG_FAMILIES).toEqual(["python3", "c", "cpp", "go", "rust"]);
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
		family: "python3",
		name: "cpython",
		command: python ?? "",
		sourceFile: "Main.py",
		compile: ["{command}", "-m", "py_compile", "{source}"],
		run: ["{command}", "{source}"],
		debugArgs: [],
		debugFlag: "DEBUG",
		stackBytes: 256 * 1024 * 1024,
		setup: undefined,
		bundle: null,
	};
	const cLanguage: CommandLanguage = {
		family: "c",
		name: "c",
		command: cc ?? "",
		sourceFile: "Main.c",
		compile: ["{command}", "-O0", "{source}", "-o", "{output}"],
		run: ["{output}"],
		debugArgs: ["-DLOCAL"],
		debugFlag: null,
		stackBytes: 512 * 1024 * 1024,
		setup: undefined,
		bundle: null,
	};

	function createEngine(overrides: {runTimeoutMs?: number; outputLimitBytes?: number; launcher?: string | null; maxPrograms?: number; maxParallelRuns?: number} = {}) {
		return new CommandEngine({
			rootDir: path.join(dir, "programs"),
			headerUnitCacheDir: path.join(dir, "header-units"),
			compileTimeoutMs: 30_000,
			runTimeoutMs: overrides.runTimeoutMs ?? 10_000,
			outputLimitBytes: overrides.outputLimitBytes ?? 1024 * 1024,
			maxPrograms: overrides.maxPrograms ?? 10,
			maxParallelRuns: overrides.maxParallelRuns ?? 2,
			launcher: overrides.launcher === undefined ? launcher : overrides.launcher,
			log: (message) => logs.push(stripAnsi(message)),
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

	test("header unit が失敗しても、その結果を記録してから起動時の準備を終える", async () => {
		const compile = ["{command}", "-fmodules-ts", "{source}", "-o", "{output}"];
		await createEngine().warmUp({...cLanguage, name: "cpp", command: "/bin/false", compile, setup: "builtin:gcc-header-unit"});
		expect(logs.at(-1)).toContain("[Setup] Lang=cpp Status=NG header unit");
	});

	test("起動プログラムをビルドできる", () => {
		expect(launcher).not.toBeNull();
	});

	test(".NET の restore を共有し、異なる解答のビルド先を分ける", async () => {
		const compiler = path.join(dir, "fake-dotnet");
		fs.writeFileSync(compiler, `#!/bin/sh
set -eu
case "$1" in
	restore) echo restore >> "$0.log" ;;
	build) test -f "$2" && test "$3" = "--no-restore" && cp "$4" "$5" ;;
	*) exit 1 ;;
esac
`, {mode: 0o755});
		const language: CommandLanguage = {...cLanguage, name: "cs", command: compiler, sourceFile: "Main.cs",
			setup: "builtin:dotnet-project", compile: ["{command}", "build", "{project}", "--no-restore", "{source}", "{output}"],
			debugArgs: [], run: ["cat", "{output}"]};
		const engine = createEngine();
		await engine.warmUp(language);
		const first = await engine.prepare(language, "first", false);
		const second = await engine.prepare(language, "second", false);
		if (first.status !== "success" || second.status !== "success") throw new Error("build failed");
		expect((await engine.run(second.programId, ""))?.stdout).toBe("second");
		expect((await engine.run(first.programId, ""))?.stdout).toBe("first");
		expect(fs.readFileSync(compiler + ".log", "utf8")).toBe("restore\n");
	});

	test("コンパイルして実行し、出力、時間、メモリを返す", async () => {
		const outcome = await runSource(createEngine(), pythonLanguage, "a, b = map(int, input().split())\nprint(a + b)\n", "1 2\n");
		expect(outcome).toMatchObject({exitCode: 0, signal: null, timedOut: false, stdout: "3\n", stderr: ""});
		expect(outcome.peakMemoryKb).toBeGreaterThan(1000);
	});

	test("2ケースが同時に動き、同じ名前の作業ファイルと計測結果が混ざらない", async () => {
		const engine = createEngine({maxParallelRuns: 2});
		const markers = fs.mkdtempSync(path.join(dir, "markers-"));
		const code = [
			"from pathlib import Path",
			"import time",
			"value = input()",
			"start = time.monotonic_ns()",
			"Path('scratch.txt').write_text(value)",
			"markers = Path(" + JSON.stringify(markers) + ")",
			"(markers / value).touch()",
			"while len(list(markers.iterdir())) < 2: time.sleep(.01)",
			"time.sleep(.04)",
			"print(Path('scratch.txt').read_text(), start, time.monotonic_ns())",
		].join("\n");
		const prepared = await engine.prepare(pythonLanguage, code, false);
		if (prepared.status !== "success") throw new Error(prepared.diagnostics);
		const jobs = await Promise.all(["a", "b", "c", "d"].map(input => engine.run(prepared.programId, input)));
		const events: {time: bigint; delta: number}[] = [];
		for (const [i, run] of jobs.entries()) {
			expect(run?.exitCode).toBe(0);
			const [value, start, end] = run!.stdout.trim().split(" ");
			expect(value).toBe("abcd"[i]);
			events.push({time: BigInt(start!), delta: 1}, {time: BigInt(end!), delta: -1});
		}
		events.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : a.delta - b.delta);
		let active = 0, peak = 0;
		for (const {delta} of events) peak = Math.max(peak, active += delta);
		expect(peak).toBe(2);
		expect(fs.readdirSync(path.join(dir, "programs")).filter(name => name.startsWith("run-"))).toEqual([]);
	});

	test("同じソースと引数なら、コンパイルの結果を使い回す", async () => {
		const engine = createEngine();
		const first = await engine.prepare(pythonLanguage, "print(1)\n", true);
		const second = await engine.prepare(pythonLanguage, "print(1)\n", true);
		expect(first.status).toBe("success");
		expect(second).toEqual(first);
		expect(engine.size).toBe(1);
	});

	test("変換(DEBUG の書き換え)のあとに仕上げたソースをコンパイルして実行する", async () => {
		const engine = createEngine();
		const finished: string[] = [];
		const prepared = await engine.prepare(pythonLanguage, "DEBUG = True\nprint(DEBUG)\n", false, undefined, (transformed) => {
			finished.push(transformed);
			return `# header\n\n${transformed}`;
		});
		expect(finished).toEqual(["DEBUG = False\nprint(DEBUG)\n"]);
		if (prepared.status !== "success") throw new Error(prepared.diagnostics);
		expect(prepared.sourceCode).toBe("# header\n\nDEBUG = False\nprint(DEBUG)\n");
		expect((await engine.run(prepared.programId, ""))?.stdout).toBe("False\n");
	});

	test("コンパイル専用の PATH を子に渡し、検索先が違う成果物を分け、実行は通常の PATH に戻す", async () => {
		const engine = createEngine();
		const language = {
			...pythonLanguage,
			compile: ["{command}", "-c", "import os; open('build-path', 'w').write(os.environ['PATH'])"],
		};
		const source = "import os\nprint(open('build-path').read())\nprint(os.environ['PATH'])\n";
		for (const compileSearchPath of ["/opt/first/bin", "/opt/second/bin"]) {
			const outcome = await runSource(engine, {...language, compileSearchPath}, source);
			expect(outcome.stdout.split("\n")).toEqual([compileSearchPath, process.env.PATH!, ""]);
		}
	});

	test("使い回したプログラムは、追い出す順番の最後に回す", async () => {
		const engine = createEngine({maxPrograms: 2});
		const ids: string[] = [];
		for (const source of ["print('a')\n", "print('b')\n", "print('a')\n", "print('c')\n"]) {
			const prepared = await engine.prepare(pythonLanguage, source, true);
			if (prepared.status !== "success") throw new Error(prepared.diagnostics);
			ids.push(prepared.programId);
		}
		expect(engine.has(ids[0])).toBe(true);
		expect(engine.has(ids[1])).toBe(false);
		expect((await engine.run(ids[0], ""))?.stdout).toBe("a\n");
	});

	test("作業フォルダが消えたプログラムは、実行せずに作り直させる", async () => {
		const engine = createEngine();
		const source = "print('removed')\n";
		const prepared = await engine.prepare(pythonLanguage, source, true);
		if (prepared.status !== "success") throw new Error(prepared.diagnostics);
		fs.rmSync(path.join(dir, "programs", prepared.programId), {recursive: true, force: true});
		expect(engine.has(prepared.programId)).toBe(false);
		expect(await engine.run(prepared.programId, "")).toBeNull();
		logs.length = 0;
		expect(await engine.prepare(pythonLanguage, source, true)).toEqual(prepared);
		expect(logs.some((line) => line.includes("Status=CACHED"))).toBe(false);
		expect((await engine.run(prepared.programId, ""))?.stdout).toBe("removed\n");
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
		const engine = createEngine({maxParallelRuns: 1});
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
