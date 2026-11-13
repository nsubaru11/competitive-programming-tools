import {CliUsageError, Command} from "./Command";
import * as options from "./options";
import * as sampleJudge from "../sampleJudge";
import * as source from "./source";
import * as localSamples from "../localSamples";
import type {SampleResult} from "../../types";

/**
 * テスト対象（actual）と参照実装（expected）を同じ入力（.in）で実行し、標準出力を比較します。
 * expected 側の出力を「正解」扱いにして、既存の test/localtest と同じ判定・表示ロジック
 * （evaluateRun / printSampleResult / printSampleSummary）をそのまま再利用します。
 *
 * 引数順は sourceFile を先頭に置く他コマンド（test/localtest/run）に合わせ、
 * テスト対象である actualSourceFile を先頭にします。testDir の自動探索も actual 側の
 * ソース位置を基準に行います（サンプルは actual と同じ場所に置かれているのが通常のため）。
 * 一方、比較結果の表示（expected vs actual）は既存の WA 差分表示と同じ並びのまま変えません。
 */
export class CrossCheck implements Command {
	readonly name = "crosscheck";
	readonly usageLines = [
		"  crosscheck  [--lang=<name>] [--expected-lang=<name>] [--full] [--wa-only] [--max-lines=N] [--time-limit=N] <actualSourceFile> <expectedSourceFile> [testDir]",
		"                                          (run both on the same input and compare stdout; cases where expected fails are reported without comparing)",
	];

	/** ローカルの .in を入力として与え、2つのコードの実行結果を突き合わせます。 **/
	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		const display: sampleJudge.SampleDisplayOptions = {};
		let lang: string | undefined;
		let expectedLang: string | undefined;
		for (const arg of args) {
			const l = options.parseLangFlag(arg);
			if (l !== undefined) {
				lang = l;
				continue;
			}
			const e = options.parseLangFlag(arg, "--expected-lang");
			if (e !== undefined) {
				expectedLang = e;
				continue;
			}
			if (options.parseDisplayFlag(arg, display)) continue;
			if (arg.startsWith("-")) throw new CliUsageError(`Unknown option: ${arg}`);
			positionals.push(arg);
		}
		const [actualSourceFile, expectedSourceFile, testDir] = positionals;
		if (!actualSourceFile || !expectedSourceFile) throw new CliUsageError();

		const actual = await source.compileSource(actualSourceFile, false, {lang});
		const expected = await source.compileSource(expectedSourceFile, false, {lang: expectedLang});
		// テストケース（.in）はテスト対象である actual 側のソースの近傍/指定 testDir から探す。
		// .out は無視する（あっても比較対象は「もう一方の実行結果」であって .out ではない）。
		const samples = localSamples.loadLocalSamples(actual.resolvedSourcePath, testDir);

		console.log(`[crosscheck] actual=${actual.originalFileName}  expected=${expected.originalFileName}  cases=${samples.length}`);

		const results: SampleResult[] = [];
		for (const sample of samples) {
			// まず expected 側を「判定なし」で実行し、その標準出力を今回の正解とする。
			const expectedRun = await sampleJudge.evaluateRun(expected.program, sample.index, sample.input);
			if (expectedRun.status !== "OK") {
				// expected 側が正常終了しなかった場合は比較のしようがないので、
				// そのケースはスキップし、expected 側の異常終了自体を結果として報告する。
				sampleJudge.printSampleResult(expectedRun, expected.restoreNames, display);
				results.push(expectedRun);
				continue;
			}
			// actual 側を、expected の出力を expectedOutput として渡して実行・判定する。
			// これにより AC = 出力一致 / WA = 出力不一致 として test/localtest と同じ表示が使える。
			const compared = await sampleJudge.evaluateRun(actual.program, sample.index, sample.input, expectedRun.actualOutput);
			sampleJudge.printSampleResult(compared, actual.restoreNames, display);
			results.push(compared);
		}
		const allMatched = sampleJudge.printSampleSummary(results);
		return allMatched ? 0 : 5;
	}
}
