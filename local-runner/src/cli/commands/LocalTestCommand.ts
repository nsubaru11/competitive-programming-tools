import * as localSamples from "../localSamples";
import * as sampleJudge from "../sampleJudge";
import {CliUsageError, type Command} from "./Command";
import * as options from "./options";
import * as source from "./source";

/** ローカルの .in/.out をサンプルとして実行・判定する（AtCoder へはアクセスしない）。DEBUG は既定で有効。 */
export class LocalTestCommand implements Command {
	readonly name = "localtest";
	readonly usageLines = [
		"  localtest [-d|--debug[=true|false]] [--lang=<name>] [--full] [--wa-only] [--max-lines=N] [--time-limit=N] <sourceFile> [testDir]",
		"                                          (run local .in/.out samples; DEBUG is on by default)",
	];

	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		let debug = true; // 既定で DEBUG 有効。-d/--debug で上書き。
		const display: sampleJudge.SampleDisplayOptions = {};
		let lang: string | undefined;
		for (const arg of args) {
			const l = options.parseLangFlag(arg);
			if (l !== undefined) {
				lang = l;
				continue;
			}
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

		const {resolvedSourcePath, program, restoreNames} = await source.prepareSource(
			sourceFilePath,
			debug,
			{compile: true, validate: false, lang},
		);
		if (!program) throw new Error("Local Runner did not return a prepared program.");
		const samples = localSamples.loadLocalSamples(resolvedSourcePath, testDir);
		const allAccepted = await sampleJudge.runAndReportSamples(program, samples, restoreNames, display);
		return allAccepted ? 0 : 5;
	}
}
