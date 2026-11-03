import * as localSamples from "../localSamples";
import * as sampleJudge from "../sampleJudge";
import {CliUsageError, type Command} from "./Command";
import * as options from "./options";
import * as source from "./source";

/** ローカルの .in/.out をサンプルとして実行・判定する（AtCoder へはアクセスしない）。DEBUG は既定で有効。 */
export class LocalTestCommand implements Command {
	readonly name = "localtest";
	readonly usageLines = [
		"  localtest [-d|--debug[=true|false]] [--full] [--wa-only] [--max-lines=N] [--time-limit=N] <sourceFile> [testDir]",
		"                                          (run local .in/.out samples; DEBUG is on by default)",
	];

	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		let debug = true; // 既定で DEBUG 有効。-d/--debug で上書き。
		const display: sampleJudge.SampleDisplayOptions = {};
		for (const arg of args) {
			const d = options.parseBoolFlag(arg, "--debug", "-d");
			if (d !== undefined) {
				debug = d;
				continue;
			}
			if (options.parseDisplayFlag(arg, display)) continue;
			if (arg.startsWith("-")) throw new CliUsageError(`Unknown option: ${arg}`);
			positionals.push(arg);
		}
		const [sourceFilePath, testDir] = positionals;
		if (!sourceFilePath) throw new CliUsageError();

		const {
			resolvedSourcePath,
			transformed,
			originalFileName,
			originalClassName,
			programId,
		} = await source.prepareSource(sourceFilePath, debug, {compile: true, validate: false});
		const samples = localSamples.loadLocalSamples(resolvedSourcePath, testDir);
		const allAccepted = await sampleJudge.runAndReportSamples(
			transformed,
			samples,
			originalClassName,
			originalFileName,
			display,
			programId,
		);
		return allAccepted ? 0 : 5;
	}
}
