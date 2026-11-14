import fs from "node:fs";
import path from "node:path";
import {resolveConfiguredPath, SETTINGS} from "../../config";
import type {Command} from "./Command";
import {CliUsageError} from "./Command";

const CTRL_C = "\u0003";
const BACKSPACES = new Set(["\u0008", "\u007f"]);

/**
 * 端末から1行を、画面に表示せずに読む。貼り付けは1回でまとめて届くことがあるので、届いた文字を順に見る。
 * 中断(Ctrl+C)されたら null を返す。
 */
function readHiddenLine(prompt: string): Promise<string | null> {
	const {stdin, stderr} = process;
	return new Promise((resolve) => {
		let value = "";
		const finish = (result: string | null) => {
			stdin.off("data", onData);
			stdin.setRawMode(false);
			stdin.pause();
			stderr.write("\n");
			resolve(result);
		};
		const onData = (chunk: Buffer | string) => {
			for (const char of chunk.toString("utf8")) {
				if (char === CTRL_C) return finish(null);
				if (char === "\r" || char === "\n") return finish(value);
				if (BACKSPACES.has(char)) value = value.slice(0, -1);
				// 矢印キーなどの制御文字は、値に入れない
				else if (char >= " ") value += char;
			}
		};
		stderr.write(prompt);
		stdin.setRawMode(true);
		stdin.resume();
		stdin.on("data", onData);
	});
}

/** パイプやリダイレクトで渡された標準入力の、最初の行を読む。 */
async function readPipedLine(): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks).toString("utf8").replace(/^﻿/, "").split(/\r?\n/)[0] ?? "";
}

/** 貼り付けた値から、Cookie の名前や区切りを除く。 */
export function normalizeSession(input: string): string {
	return input.trim().replace(/^REVEL_SESSION=/i, "").replace(/;$/, "").trim();
}

/**
 * AtCoder のログイン情報(REVEL_SESSION)を、設定の atcoder.sessionFile へ保存する。
 * 値はシェルの履歴に残さないよう、引数では受け取らずに入力させる。
 */
export class SetSessionCommand implements Command {
	readonly name = "setsession";
	readonly usageLines = [
		"  setsession                              (save the AtCoder REVEL_SESSION cookie for submit; the value is asked for and not shown)",
	];

	async execute(args: readonly string[]): Promise<number> {
		if (args.length > 0) {
			throw new CliUsageError("setsession takes no value. Run it without arguments and paste the value when asked.");
		}
		const sessionFile = resolveConfiguredPath(SETTINGS.atcoder.sessionFile);

		const input = process.stdin.isTTY
			? await readHiddenLine("Paste the REVEL_SESSION value and press Enter (it is not shown): ")
			: await readPipedLine();
		if (input === null) {
			console.error("Canceled.");
			return 1;
		}
		const session = normalizeSession(input);
		if (session === "") {
			console.error("Error: The value is empty. Nothing was saved.");
			return 1;
		}
		if (/\s/.test(session)) {
			console.error("Error: The value contains spaces. Copy only the value of the REVEL_SESSION cookie.");
			return 1;
		}
		fs.mkdirSync(path.dirname(sessionFile), {recursive: true});
		// ログイン情報なので、ほかの利用者から読めないようにする(Windows では効かない)。
		fs.writeFileSync(sessionFile, `${session}\n`, {encoding: "utf8", mode: 0o600});
		if (process.platform !== "win32") fs.chmodSync(sessionFile, 0o600);
		console.log(`Saved the session: ${sessionFile}`);
		console.log("You can now use submit.");
		return 0;
	}
}
