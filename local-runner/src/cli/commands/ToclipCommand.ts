import type {LocalRunnerHeaderOption} from "@atcoder-tools/shared";
import {CliUsageError, type Command} from "./Command";
import * as clipboard from "../clipboard";
import * as options from "./options";
import * as taskCommand from "./TaskCommand";
import * as source from "./source";

/** 提出用に変換したソースを、ファイルを介さずクリップボードへコピーする。 */
export class ToclipCommand implements Command {
	readonly name = "toclip";
	readonly usageLines = [
		"  toclip [--no-header|--header=<name>] <sourceFile>",
		"  toclip [...options] <task>  (短縮: 例: toclip d → D.java)",
	];

	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		let header: LocalRunnerHeaderOption = true;
		for (const arg of args) {
			const h = options.parseHeaderFlag(arg);
			if (h !== undefined) {
				header = h;
				continue;
			}
			if (arg.startsWith("-")) throw new CliUsageError(`Unknown option: ${arg}`);
			positionals.push(arg);
		}
		if (positionals.length !== 1) throw new CliUsageError();
		const sourceArg = /^(ex|[a-z])\d*$/i.test(positionals[0])
			? taskCommand.resolveShortSourceArg(positionals[0])
			: positionals[0];
		const {resolvedSourcePath, transformed} = await source.prepareSource(sourceArg, false, {header});
		clipboard.copyToClipboard(transformed);
		console.log(`Copied submission source to clipboard: ${resolvedSourcePath}`);
		return 0;
	}
}
