import fs from "node:fs";
import path from "node:path";
import type {LocalRunnerHeaderOption} from "@atcoder-tools/shared";
import {CliUsageError, type Command} from "./Command";
import * as options from "./options";
import * as source from "./source";

/** ソースを提出用に変換し、Main.java など言語ごとの名前（または指定パス）に書き出す。DEBUG は無効（本番想定）。 */
export class TomainCommand implements Command {
	readonly name = "tomain";
	readonly usageLines = [
		"  tomain [-f|--force] [--lang=<name>] [--no-header|--header=<name>] <sourceFile> [outFile]",
	];

	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		let force = false;
		let header: LocalRunnerHeaderOption = true;
		let lang: string | undefined;
		for (const arg of args) {
			const l = options.parseLangFlag(arg);
			if (l !== undefined) {
				lang = l;
				continue;
			}
			if (arg === "-f" || arg === "--force") {
				force = true;
				continue;
			}
			const h = options.parseHeaderFlag(arg);
			if (h !== undefined) {
				header = h;
				continue;
			}
			if (arg.startsWith("-")) throw new CliUsageError(`Unknown option: ${arg}`);
			positionals.push(arg);
		}
		const [sourceFilePath, outFilePath] = positionals;
		if (!sourceFilePath) throw new CliUsageError();

		const {resolvedSourcePath, transformed, language} = await source.transformSource(sourceFilePath, {header, lang});
		const outPath = outFilePath
			? path.resolve(outFilePath)
			: path.join(path.dirname(resolvedSourcePath), language.runtimeFileName);

		if (fs.existsSync(outPath) && !force) {
			throw new Error(`Output already exists: ${outPath} (use -f/--force to overwrite)`);
		}

		fs.mkdirSync(path.dirname(outPath), {recursive: true});
		fs.writeFileSync(outPath, transformed, "utf8");
		console.log(`Converted: ${resolvedSourcePath} -> ${outPath}`);
		return 0;
	}
}
