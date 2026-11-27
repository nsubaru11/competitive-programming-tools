import type {SampleResult} from "../types";

type CaseReport = {result: SampleResult; restoreNames: (text: string) => string};
type Terminal = Pick<typeof process.stdout, "isTTY" | "columns" | "write">;

/** 実行枠に空きができたら次を始め、詳細は入力順で表示する。表示した本文は保持しない。 */
export async function reportCases<T>(
	cases: readonly T[],
	limit: number,
	evaluate: (item: T) => Promise<CaseReport>,
	print: (report: CaseReport) => void,
	terminal: Terminal = process.stdout,
): Promise<boolean> {
	if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError("Invalid parallel run limit.");
	const started = performance.now();
	let issued = 0, printed = 0, finished = 0, active = 0;
	let totalTime = 0;
	const counts = new Map<string, number>();
	const ready = new Map<number, CaseReport>();
	let failure: {error: unknown} | undefined;
	let notify = () => {};
	let progressVisible = false;
	const clearProgress = () => {
		if (progressVisible) terminal.write("\r\x1b[2K");
		progressVisible = false;
	};
	const breakdown = () => [...counts]
		.sort(([a], [b]) => a === "AC" ? -1 : b === "AC" ? 1 : a.localeCompare(b))
		.map(([status, count]) => `${status}:${count}`).join(" ");

	async function run(index: number) {
		active++;
		try {
			const report = await evaluate(cases[index]!);
			ready.set(index, report);
			const {status, execTime} = report.result;
			counts.set(status, (counts.get(status) ?? 0) + 1);
			totalTime += execTime;
			finished++;
		} catch (error) {
			failure ??= {error};
		} finally {
			active--;
			notify();
		}
	}

	try {
		while (printed < cases.length) {
			if (failure) throw failure.error;
			clearProgress();
			while (ready.has(printed)) {
				print(ready.get(printed)!);
				ready.delete(printed++);
			}
			if (printed === cases.length) break;
			const changed = new Promise<void>(resolve => {notify = resolve;});
			// 遅い先頭ケースの後ろに、大きな WA 差分・出力が無制限にたまることを防ぐ。
			while (active < limit && issued < Math.min(cases.length, printed + 2 * limit) && !failure) void run(issued++);
			if (terminal.isTTY && cases.length > 1) {
				const line = `Running... ${finished}/${cases.length} done ${breakdown()}`.trimEnd();
				terminal.write(line.slice(0, Math.max(1, (terminal.columns || 80) - 1)));
				progressVisible = true;
			}
			await changed;
		}
	} finally {
		clearProgress();
		// 通信失敗のあとに残りのケースを追加せず、送信済みの処理だけを回収する。
		while (active > 0) await new Promise<void>(resolve => {notify = resolve;});
	}
	const ac = counts.get("AC") ?? 0;
	const avg = finished ? (totalTime / finished).toFixed(1) : "0.0";
	console.log(`Summary: ${ac}/${finished} AC | ${breakdown()} | total=${totalTime}ms avg=${avg}ms wall=${Math.round(performance.now() - started)}ms`);
	return ac + (counts.get("OK") ?? 0) === finished;
}
