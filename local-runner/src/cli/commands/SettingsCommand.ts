import fs from "node:fs";
import {SETTINGS, SETTINGS_FILE} from "../../config";
import {describeSettings} from "../../settings/settings";
import * as color from "../../utils/color";
import type {Command} from "./Command";
import {CliUsageError} from "./Command";

/** 既定値に設定ファイルを重ねた、今の設定を全項目表示する。 */
export class SettingsCommand implements Command {
	readonly name = "settings";
	readonly usageLines = [
		"  settings                                (show every setting and its current value; * marks a value changed from the default)",
	];

	async execute(args: readonly string[]): Promise<number> {
		if (args.length > 0) throw new CliUsageError("settings takes no arguments.");
		const exists = fs.existsSync(SETTINGS_FILE);
		console.log(`Settings file: ${SETTINGS_FILE}${exists ? "" : " (not created; every setting has its default value)"}`);
		const rows = describeSettings(SETTINGS);
		const width = Math.max(...rows.map(({name}) => name.length));
		const useColor = color.supportsCliColor();
		for (const {name, value, changed} of rows) {
			const line = `${changed ? "*" : " "} ${name.padEnd(width)} = ${value}`;
			console.log(changed && useColor ? `${color.ANSI.CYAN}${line}${color.ANSI.RESET}` : line);
		}
		return 0;
	}
}
