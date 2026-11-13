import fs from "node:fs";
import path from "node:path";
import * as color from "../../utils/color";
import * as formatter from "../../utils/formatter";
import * as sampleJudge from "../sampleJudge";
import {CliUsageError, type Command} from "./Command";
import * as options from "./options";
import * as source from "./source";
import * as shared from "@atcoder-tools/shared";

/** Local Runner の実行ステータスを短いラベルに変換する。 */
function runStatusLabel(status: string): string {
	switch (status) {
		case "success":
			return "OK";
		case "runtimeError":
			return "RE";
		case "compileError":
			return "CE";
		case "timeLimitExceeded":
			return "TLE";
		case "internalError":
			return "IE";
		default:
			return status;
	}
}

/** ソースを1回だけ実行して出力を表示する（期待出力なし・DEBUG は既定で有効・入力ファイル省略可）。 */
export class RunCommand implements Command {
	readonly name = "run";
	readonly usageLines = [
		"  run [-d|--debug[=true|false]] [--lang=<name>] [--time-limit=N] <sourceFile> [inputFile]",
		"                                          (run once and show the output; inputFile is optional; DEBUG is on by default)",
	];

	async execute(args: readonly string[]): Promise<number> {
		const positionals: string[] = [];
		let debug = true; // 既定で DEBUG 有効。-d/--debug で上書き。
		let timeLimitMs: number | undefined;
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
			const timeLimit = options.parseIntFlag(arg, "--time-limit");
			if (timeLimit !== undefined) {
				timeLimitMs = timeLimit;
				continue;
			}
			if (arg.startsWith("-")) throw new CliUsageError(`Unknown option: ${arg}`);
			positionals.push(arg);
		}
		const [sourceFilePath, inputFile] = positionals;
		if (!sourceFilePath) throw new CliUsageError();

		const {program, restoreNames} = await source.prepareSource(sourceFilePath, debug, {compile: true, validate: false, lang});
		if (!program) throw new Error("Local Runner did not return a prepared program.");
		const stdin = inputFile
			? shared.normalizeNewlines(fs.readFileSync(path.resolve(inputFile), "utf8"))
			: "";
		const result = await sampleJudge.postLocalRunner(program, stdin);

		// ステータスは「OK / RE / CE / TLE / IE」に集約。OK=緑、エラー=色付き。遅い実行は time が黄色。
		const label = runStatusLabel(result.status);
		const coloredLabel = label === "OK" && color.supportsCliColor() ? `${color.ANSI.GREEN}OK${color.ANSI.RESET}` : color.colorizeStatus(label);
		const memory = (result.peakMemory ?? 0) > 0 ? `  mem=${result.peakMemory}KB` : "";
		console.log(`[run] ${coloredLabel}  time=${formatter.formatExecTime(result.time || 0, formatter.thresholdsFromTimeLimit(timeLimitMs))}${memory}`);

		// 標準出力は既定色（白）。
		const stdout = (result.stdout || "").replace(/\s+$/, "");
		console.log("[output]");
		console.log(stdout.length > 0 ? stdout.split(/\r?\n/).map((line) => `  ${line}`).join("\n") : "  (empty)");

		// 標準エラー出力は赤。
		const stderr = (result.stderr || "").trim();
		if (stderr.length > 0) {
			console.log("[stderr]");
			const body = restoreNames(stderr).split(/\r?\n/).map((line) => `  ${line}`).join("\n");
			console.log(color.supportsCliColor() ? `${color.ANSI.RED}${body}${color.ANSI.RESET}` : body);
		}
		return result.exitCode === 0 ? 0 : 1;
	}
}
