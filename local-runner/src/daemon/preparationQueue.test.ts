import {describe, expect, test} from "bun:test";
import type {LocalRunnerPrepareResponse} from "@atcoder-tools/shared";
import {type PrepareFunction, type PrepareOptions, PreparationQueue} from "./preparationQueue";
import {CanceledError} from "./processRunner";

const OPTIONS: PrepareOptions = {debug: true, autoImport: true, validate: false};

function success(sourceCode: string): LocalRunnerPrepareResponse {
	return {
		status: "success",
		sourceCode,
		programId: `id-${sourceCode}`,
		diagnostics: "",
		inlinedClasses: [],
		addedImports: [],
		diagnosticItems: []
	};
}

/** 呼び出しを記録し、release を呼ぶまで終わらないコンパイル。中断されたら CanceledError で終わる。 */
function controllablePrepare() {
	const calls: string[] = [];
	const canceled: string[] = [];
	const pending = new Map<string, () => void>();
	const prepare: PrepareFunction = (language, sourceCode, _options, signal) => {
		calls.push(`${language}:${sourceCode}`);
		return new Promise((resolve, reject) => {
			pending.set(sourceCode, () => resolve(success(sourceCode)));
			signal.addEventListener("abort", () => {
				canceled.push(sourceCode);
				reject(new CanceledError());
			}, {once: true});
		});
	};
	const release = async (sourceCode: string) => {
		for (let i = 0; i < 20 && !pending.has(sourceCode); i++) await Promise.resolve();
		pending.get(sourceCode)?.();
	};
	return {prepare, calls, canceled, release};
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("PreparationQueue", () => {
	test("コンパイルは1つずつ、届いた順に行う", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		const first = queue.wait("cpp", "a", OPTIONS);
		const second = queue.wait("c", "b", OPTIONS);
		await flush();
		expect(fake.calls).toEqual(["cpp:a"]);
		await fake.release("a");
		await first;
		await flush();
		expect(fake.calls).toEqual(["cpp:a", "c:b"]);
		await fake.release("b");
		expect((await second).programId).toBe("id-b");
	});

	test("事前コンパイルの結果を、あとの実行が使う", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		queue.schedule("cpp", "a", OPTIONS);
		await fake.release("a");
		await flush();
		expect((await queue.wait("cpp", "a", OPTIONS)).programId).toBe("id-a");
		expect(fake.calls).toEqual(["cpp:a"]);
	});

	test("条件が違えば別のコンパイルにする", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		const debug = queue.wait("cpp", "a", OPTIONS);
		const release = queue.wait("cpp", "a", {...OPTIONS, debug: false});
		await fake.release("a");
		await debug;
		await flush();
		await fake.release("a");
		await release;
		expect(fake.calls).toEqual(["cpp:a", "cpp:a"]);
	});

	test("同じ言語の新しいソースが届いたら、誰も待っていない古いコンパイルを中断する", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		queue.schedule("cpp", "a", OPTIONS);
		await flush();
		queue.schedule("cpp", "b", OPTIONS);
		queue.schedule("cpp", "c", OPTIONS);
		await flush();
		// a はコンパイルの途中で中断し、b は始まる前に取り消す
		expect(fake.canceled).toEqual(["a"]);
		await fake.release("c");
		await flush();
		expect(fake.calls).toEqual(["cpp:a", "cpp:c"]);
	});

	test("実行が待っているコンパイルと、ほかの言語のコンパイルは中断しない", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		const waited = queue.wait("cpp", "a", OPTIONS);
		queue.schedule("java", "j", OPTIONS);
		queue.schedule("cpp", "b", OPTIONS);
		await flush();
		expect(fake.canceled).toEqual([]);
		await fake.release("a");
		expect((await waited).programId).toBe("id-a");
		await fake.release("j");
		await fake.release("b");
		await flush();
		expect(fake.calls).toEqual(["cpp:a", "java:j", "cpp:b"]);
	});

	test("中断したソースの実行が届いたら、コンパイルし直す", async () => {
		const fake = controllablePrepare();
		const queue = new PreparationQueue(fake.prepare, 10);
		queue.schedule("cpp", "a", OPTIONS);
		await flush();
		queue.schedule("cpp", "b", OPTIONS);
		const rerun = queue.wait("cpp", "a", OPTIONS);
		await flush();
		await fake.release("a");
		expect((await rerun).programId).toBe("id-a");
		expect(fake.canceled).toEqual(["a"]);
		expect(fake.calls).toEqual(["cpp:a", "cpp:a"]);
	});

	test("内部エラーの結果は覚えず、次の要求でやり直す", async () => {
		let attempts = 0;
		const queue = new PreparationQueue(async (_language, sourceCode) => {
			if (++attempts === 1) throw new Error("dispatcher stopped");
			return success(sourceCode);
		}, 10);
		await expect(queue.wait("java", "a", OPTIONS)).rejects.toThrow("dispatcher stopped");
		expect((await queue.wait("java", "a", OPTIONS)).programId).toBe("id-a");
		expect(attempts).toBe(2);
	});

	test("forget で結果を捨てると、次の要求でコンパイルし直す", async () => {
		let attempts = 0;
		const queue = new PreparationQueue(async (_language, sourceCode) => {
			attempts++;
			return success(sourceCode);
		}, 10);
		await queue.wait("cpp", "a", OPTIONS);
		queue.forget("cpp", "a", OPTIONS);
		await queue.wait("cpp", "a", OPTIONS);
		expect(attempts).toBe(2);
	});

	test("覚える数を超えたら、終わった結果を古いものから捨てる", async () => {
		let attempts = 0;
		const queue = new PreparationQueue(async (_language, sourceCode) => {
			attempts++;
			return success(sourceCode);
		}, 2);
		for (const source of ["a", "b", "c"]) await queue.wait(source, source, OPTIONS);
		await queue.wait("c", "c", OPTIONS);
		expect(attempts).toBe(3);
		await queue.wait("a", "a", OPTIONS);
		expect(attempts).toBe(4);
	});
});
