import {expect, spyOn, test} from "bun:test";
import {setImmediate} from "node:timers/promises";
import type {SampleResult} from "../types";
import {reportCases} from "./reportCases";

function report(index: number, status = "AC") {
	const result: SampleResult = {
		index, status, execTime: 10, memoryKb: 0, peakMemoryKb: 0, runnerStatus: "success", exitCode: 0,
		stdoutTruncated: false, stderrTruncated: false, stderr: "", actualOutput: "", expectedOutput: "",
	};
	return {result, restoreNames: (text: string) => text};
}

test("先頭が遅くても枠を再利用し、先読みを制限して番号順に表示する", async () => {
	const release = Promise.withResolvers<void>();
	const started: number[] = [], printed: number[] = [], progress: string[] = [];
	const terminal = {isTTY: true, columns: 80, write(chunk: unknown) {progress.push(String(chunk)); return true;}};
	using log = spyOn(console, "log").mockImplementation(() => {});
	const done = reportCases([1, 2, 3, 4, 5, 6], 2, async index => {
		started.push(index);
		if (index === 1) await release.promise;
		return report(index, index === 2 ? "WA" : "AC");
	}, ({result}) => printed.push(result.index), terminal);
	await setImmediate();
	expect(started).toEqual([1, 2, 3, 4]);
	expect(printed).toEqual([]);
	expect(progress.some(line => line.includes("3/6 done AC:2 WA:1"))).toBe(true);
	release.resolve();
	expect(await done).toBe(false);
	expect(printed).toEqual([1, 2, 3, 4, 5, 6]);
	expect(log.mock.calls.at(-1)?.[0]).toMatch(/5\/6 AC .* total=60ms avg=10.0ms wall=\d+ms/);
});

test("無効な実行枠では処理を待たずに失敗する", async () => {
	for (const limit of [0, -1, NaN]) {
		await expect(reportCases([1], limit, async i => report(i), () => {})).rejects.toThrow("Invalid parallel run limit");
	}
});

test("通信エラーが出たら送信済みのケースを回収し、新しいケースを追加しない", async () => {
	const release = Promise.withResolvers<void>();
	const started: number[] = [];
	const done = reportCases([1, 2, 3], 2, async index => {
		started.push(index);
		if (index === 1) throw new Error("offline");
		await release.promise;
		return report(index);
	}, () => {}, {isTTY: false, columns: 0, write() {throw new Error("unexpected progress");}});
	await setImmediate();
	expect(started).toEqual([1, 2]);
	release.resolve();
	await expect(done).rejects.toThrow("offline");
	expect(started).toEqual([1, 2]);
});
