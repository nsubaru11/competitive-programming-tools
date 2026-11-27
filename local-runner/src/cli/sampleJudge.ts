import {reportCases} from "./reportCases";
import type {LocalSample} from "./localSamples";
import * as shared from "@atcoder-tools/shared";
import type {SamplePair, SampleResult} from "../types";
import * as color from "../utils/color";
import * as formatter from "../utils/formatter";
import type {PreparedProgram} from "./commands/source";
import {requestRunner} from "../runnerClient";

/**
 * 比較用に出力を行の配列へ正規化する。AtCoder の既定ジャッジに合わせ、
 * 改行(CRLF/CR→LF)を揃え、各行の行末空白と末尾の空行を無視する（行構造自体は保持する）。
 * ジャッジ(AC/WA)・差分表示・不一致集計で必ず同じ規則を使うため 1 か所へ集約する。
 */
export function toComparableLines(text: string): string[] {
	const normalized = (text || "")
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t]+$/gm, "")
		.replace(/\n+$/, "");
	return normalized.length === 0 ? [] : normalized.split("\n");
}

/** 行単位・行末空白許容の完全一致判定。トークン分割ではないので改行の違いも WA として検出する。 */
export function judgeByLines(expected: string, actual: string): boolean {
	const exp = toComparableLines(expected);
	const act = toComparableLines(actual);
	if (exp.length !== act.length) return false;
	for (let i = 0; i < exp.length; i++) {
		if (exp[i] !== act[i]) return false;
	}
	return true;
}

export async function postLocalRunner(program: PreparedProgram, stdinText: string): Promise<shared.LocalRunnerRunResponse> {
	const sent = program.current;
	const run = (programId: string) => requestRunner<shared.LocalRunnerRunResponse>(
		{mode: "run", programId, stdin: stdinText},
		"Local Runner request failed",
	);
	const result = await run(sent.id);
	if (!shared.isStaleProgramResponse(result)) return result;
	// daemon の再起動やキャッシュの追い出しでプログラムが消えたときだけ、コンパイルし直して実行する
	return run(await program.refresh(sent));
}

/**
 * ソースコードを1回実行し、（expectedOutput を渡せば）判定まで行って SampleResult を返す。
 * 「1件実行して判定する」という最小単位で、test/localtest/submit のサンプル判定（evaluateSample）と
 * crosscheck の2コード比較（一方の出力をもう一方の expectedOutput として渡す）の両方がこれを共有する。
 * expectedOutput 省略時は判定せず、実行結果（ステータス・出力）だけを返す。
 */
export async function evaluateRun(
	program: PreparedProgram,
	index: number,
	input: string,
	expectedOutput?: string,
): Promise<SampleResult> {
	const runnerRaw = await postLocalRunner(program, input);
	const easyLikeRun: shared.EasyTestRunResult = {
		status: shared.toEasyTestStatus(runnerRaw.status, runnerRaw.exitCode, runnerRaw.stdoutTruncated),
		output: runnerRaw.stdout || "",
		error: runnerRaw.stderr || "",
		execTime: runnerRaw.time || 0,
	};
	// 実行が正常終了(OK)し、期待出力がある場合のみ AC/WA を行単位で判定する。
	// 標準出力を切り詰めた実行(OLE)は、先頭だけが一致しても AC にしない。
	// 実行時エラー(RE/TLE/CE 等)や期待出力なし（crosscheck の基準実行・出力ファイル無しのサンプル）は
	// 実行ステータスをそのまま採用し、出力は生のまま渡す（差分表示側で同じ規則に正規化される）。
	let status: string;
	if (easyLikeRun.status !== "OK") {
		status = easyLikeRun.status;
	} else if (expectedOutput === undefined) {
		status = "OK";
	} else {
		status = judgeByLines(expectedOutput, easyLikeRun.output) ? "AC" : "WA";
	}
	return {
		index,
		status,
		execTime: easyLikeRun.execTime || 0,
		memoryKb: Number(runnerRaw.memory || 0),
		peakMemoryKb: Number(runnerRaw.peakMemory || 0),
		runnerStatus: runnerRaw.status || "",
		exitCode: Number(runnerRaw.exitCode ?? 0),
		stdoutTruncated: runnerRaw.stdoutTruncated,
		stderrTruncated: runnerRaw.stderrTruncated,
		stderr: easyLikeRun.error || "",
		actualOutput: easyLikeRun.output,
		expectedOutput: expectedOutput ?? "",
	};
}

/** サンプル1件をローカル実行してジャッジし、1件分の結果を返す（test/localtest/submit 用の薄いラッパー）。 */
async function evaluateSample(program: PreparedProgram, sample: SamplePair): Promise<SampleResult> {
	return evaluateRun(program, sample.index, sample.input, sample.expectedOutput);
}

/** test / localtest / submit の表示制御オプション。 */
export type SampleDisplayOptions = {
	/** WA 差分を行数で折りたたまず全行表示する（maxLines より優先）。 */
	full?: boolean;
	/** WA 差分のうち不一致行だけを抽出して表示する（行番号は元のまま保持）。 */
	waOnly?: boolean;
	/** WA 差分の折りたたみ行数を上書きする（--max-lines=N）。未指定なら既定値。 */
	maxLines?: number;
	/**
	 * 問題の実行時間制限(ms)。test/submit が問題ページから取得した値を渡すと、
	 * exec 表示の警告しきい値（80%超=黄 / 制限以上=赤）に使う。
	 * 未指定（localtest/crosscheck 等）は 2000ms を仮の制限とする（warn=1600ms / danger=2000ms）。
	 */
	timeLimitMs?: number;
};

/** WA 差分表示の既定の折りたたみ行数（--full でこの上限を解除 / --max-lines で変更）。 */
const WA_DIFF_DEFAULT_MAX_LINES = 20;

function formatWaDiff(expected: string, actual: string, options: SampleDisplayOptions = {}): string {
	const {full = false, waOnly = false, maxLines} = options;
	const exp = toComparableLines(expected);
	const act = toComparableLines(actual);
	const total = Math.max(exp.length, act.length);
	const isSupportsCliColor: boolean = color.supportsCliColor();

	// 表示対象の行インデックス。waOnly のときは不一致行のみ（行番号 i は元のまま保持する）。
	const indices: number[] = [];
	for (let i = 0; i < total; i++) {
		const differ = (i < exp.length ? exp[i] : null) !== (i < act.length ? act[i] : null);
		if (!waOnly || differ) indices.push(i);
	}

	// --full なら全件、そうでなければ上限（--max-lines があればその値、無ければ既定）で折りたたむ。
	const cap = maxLines ?? WA_DIFF_DEFAULT_MAX_LINES;
	const limit = full ? indices.length : Math.min(indices.length, cap);
	const shownIdx = indices.slice(0, limit);

	const numW = String((shownIdx.at(-1) ?? 0) + 1).length;
	const w = shownIdx.reduce((width, i) => Math.min(30, Math.max(width, exp[i]?.length ?? 0)), 8);
	const fit = (s: string) => (s.length > w ? s.slice(0, w - 1) + "~" : s.padEnd(w));
	const NONE = "(none)";

	const header = waOnly
		? `  expected vs actual  (mismatched lines only)`
		: `  expected vs actual  (○ = match, × = mismatch)`;
	const out: string[] = [header];
	if (shownIdx.length === 0) {
		out.push(`  (no line differs; check whitespace and the output format)`);
	}
	for (const i of shownIdx) {
		const hasE = i < exp.length, hasA = i < act.length;
		const differ = (hasE ? exp[i] : null) !== (hasA ? act[i] : null);
		const ln = String(i + 1).padStart(numW);
		const marker = differ ? "×" : "○";
		let row = `  ${marker} ${ln} | ${fit(hasE ? exp[i] : NONE)} | ${hasA ? act[i] : NONE}`;
		if (isSupportsCliColor) row = `${differ ? color.ANSI.RED : color.ANSI.GREEN}${row}${color.ANSI.RESET}`;
		out.push(row);
	}
	const hidden = indices.length - shownIdx.length;
	if (hidden > 0) out.push(`  ... +${hidden} more line(s)  (use --full to show all)`);
	return out.join("\n");
}

/** WA の不一致行数と全行数を返す。formatWaDiff と同じ行整形ルールで判定する。 */
function getWaMismatchStats(expected: string, actual: string): {mismatch: number; total: number} {
	const exp = toComparableLines(expected);
	const act = toComparableLines(actual);
	const total = Math.max(exp.length, act.length);
	let mismatch = 0;
	for (let i = 0; i < total; i++) {
		const differ = (i < exp.length ? exp[i] : null) !== (i < act.length ? act[i] : null);
		if (differ) mismatch++;
	}
	return {mismatch, total};
}

/** サンプル1件分の結果（ステータス・出力・差分・stderr）を表示する。crosscheck からも直接呼ばれる。 */
export function printSampleResult(
	r: SampleResult,
	restoreNames: (text: string) => string,
	display: SampleDisplayOptions,
): void {
	const details = [`exec=${formatter.formatExecTime(r.execTime, formatter.thresholdsFromTimeLimit(display.timeLimitMs))}`];
	// Java の memory は使用ピーク(RSS)ではなく実行スレッドの累積アロケーション量なので alloc と明示する。
	if (r.memoryKb > 0) details.push(`alloc=${r.memoryKb}KB`);
	// プロセスとして実行する言語は、同時に使ったメモリの最大値を mem として示す。
	if (r.peakMemoryKb > 0) details.push(`mem=${r.peakMemoryKb}KB`);
	if (r.runnerStatus && r.runnerStatus !== "success") details.push(`runner=${r.runnerStatus}`);
	if (r.exitCode !== 0) details.push(`exit=${r.exitCode}`);
	if (r.stdoutTruncated || r.stderrTruncated) {
		const flags = [];
		if (r.stdoutTruncated) flags.push("stdout");
		if (r.stderrTruncated) flags.push("stderr");
		details.push(`trunc=${flags.join(",")}`);
	}
	if (r.status === "WA") {
		const {mismatch, total} = getWaMismatchStats(r.expectedOutput, r.actualOutput);
		if (total > 0) details.push(`NG/TOTAL=${mismatch}/${total}`);
	}
	console.log(`[${r.index}] ${color.colorizeStatus(r.status)} ${details.join(" ")}`);
	if (r.status === "OK" && r.actualOutput.trim().length > 0) {
		console.log(`  [output]`);
		console.log(r.actualOutput.replace(/\s+$/, "").split(/\r?\n/).map(line => `    ${line}`).join("\n"));
	}
	if (r.status === "WA") {
		console.log(formatWaDiff(r.expectedOutput, r.actualOutput, display));
	}
	if (r.status !== "AC" && r.stderr && r.stderr.trim().length > 0) {
		console.log(`  [stderr]`);
		const displayStderr = restoreNames(r.stderr.trim());
		const body = displayStderr.split(/\r?\n/).map(line => `    ${line}`).join("\n");
		console.log(color.supportsCliColor() ? `${color.ANSI.RED}${body}${color.ANSI.RESET}` : body);
	}
}

/** 1回の準備結果で全ケースを実行する。ローカル入力は空き枠ができてから読む。 */
export function runAndReportSamples(
	program: PreparedProgram,
	samples: readonly (SamplePair | LocalSample)[],
	restoreNames: (text: string) => string,
	display: SampleDisplayOptions = {},
): Promise<boolean> {
	return reportCases(samples, program.maxParallelRuns, async sample => ({
		result: await evaluateSample(program, "read" in sample ? sample.read() : sample),
		restoreNames,
	}), ({result, restoreNames}) => printSampleResult(result, restoreNames, display));
}
