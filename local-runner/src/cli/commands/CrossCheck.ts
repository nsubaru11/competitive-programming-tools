import {RunSlots} from "../../utils/runSlots";
import {CliUsageError, Command} from "./Command";
import * as options from "./options";
import * as sampleJudge from "../sampleJudge";
import * as source from "./source";
import * as localSamples from "../localSamples";
import {reportCases} from "../reportCases";

/**
 * テスト対象（actual）と参照実装（expected）を同じ入力（.in）で実行し、標準出力を比較します。
 * expected 側の出力を「正解」扱いにして、既存の test/localtest と同じ判定・表示ロジック
 * （evaluateRun / printSampleResult）をそのまま再利用します。
 *
 * 引数順は sourceFile を先頭に置く他コマンド（test/localtest/run）に合わせ、
 * テスト対象である actualSourceFile を先頭にします。testDir の自動探索も actual 側の
 * ソース位置を基準に行います（サンプルは actual と同じ場所に置かれているのが通常のため）。
 * 一方、比較結果の表示（expected vs actual）は既存の WA 差分表示と同じ並びのまま変えません。
 */
export class CrossCheck implements Command {
	readonly name = "crosscheck";
	readonly usageLines = [
		"  crosscheck  [--lang=<name>] [--expected-lang=<name>] [--no-header|--header=<name>] [--full] [--wa-only] [--max-lines=N] [--time-limit=N] <actualSourceFile> <expectedSourceFile> [testDir]",
		"                                          (run both on the same input and compare stdout; cases where expected fails are reported without comparing)",
	];

	/** ローカルの .in を入力として与え、2つのコードの実行結果を突き合わせます。 **/
	async execute(args: readonly string[]): Promise<number> {
		const display: sampleJudge.SampleDisplayOptions = {};
		let expectedLang: string | undefined;
		const {positionals, lang, header} = options.parseSourceArgs(args, 3, (arg) => {
			const expected = options.parseLangFlag(arg, "--expected-lang");
			if (expected === undefined) return options.parseDisplayFlag(arg, display);
			expectedLang = expected;
			return true;
		});
		const [actualSourceFile, expectedSourceFile, testDir] = positionals;
		if (!actualSourceFile || !expectedSourceFile) throw new CliUsageError();

		const actual = await source.compileSource(actualSourceFile, false, {lang, header});
		const expected = await source.compileSource(expectedSourceFile, false, {lang: expectedLang, header});
		// テストケース（.in）はテスト対象である actual 側のソースの近傍/指定 testDir から探す。
		// .out は無視する（あっても比較対象は「もう一方の実行結果」であって .out ではない）。
		const samples = localSamples.loadLocalSamples(actual.resolvedSourcePath, testDir);

		console.log(`[crosscheck] actual=${actual.originalFileName}  expected=${expected.originalFileName}  cases=${samples.length}`);

		const expectedSlots = new RunSlots(expected.program.maxParallelRuns);
		const actualSlots = new RunSlots(actual.program.maxParallelRuns);
		const limit = Math.max(actual.program.maxParallelRuns, expected.program.maxParallelRuns);
		const allMatched = await reportCases(samples, limit, async files => {
			const sample = files.read(false);
			const reference = await expectedSlots.run(() => sampleJudge.evaluateRun(expected.program, sample.index, sample.input));
			if (reference.status !== "OK") return {result: reference, restoreNames: expected.restoreNames};
			const result = await actualSlots.run(() => sampleJudge.evaluateRun(actual.program, sample.index, sample.input, reference.actualOutput));
			return {result, restoreNames: actual.restoreNames};
		}, ({result, restoreNames}) => sampleJudge.printSampleResult(result, restoreNames, display));
		return allMatched ? 0 : 5;
	}
}
