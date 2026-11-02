import fs from "node:fs";
import path from "node:path";
import {LOCAL_SETTINGS_FILE} from "../../config";
import {isHeaderName, readLocalSettings, writeLocalSettings} from "../../localSettings";
import type {Command} from "./Command";
import {CliUsageError} from "./Command";

/** 提出物の先頭に付けるヘッダーのファイルを、言語ごとに設定する。サーバーは要求ごとに読むので再起動はいらない。 */
export class SetHeaderCommand implements Command {
	readonly name = "setheader";
	readonly usageLines = [
		"  setheader <language> <file>             (set the header file of a language, e.g. setheader java header.txt)",
		"  setheader [language]                    (show the current header files)",
		"  setheader <language> --clear            (stop adding the header of a language)",
	];

	async execute(args: string[]): Promise<number> {
		const [name, target, extra] = args;
		if (extra !== undefined) throw new CliUsageError("setheader takes two arguments.");
		const settings = readLocalSettings(LOCAL_SETTINGS_FILE);
		const headerFiles = {...settings.headerFiles};
		if (name === undefined) {
			const entries = Object.entries(headerFiles);
			if (entries.length === 0) console.log("No header files are set.");
			for (const [language, file] of entries) console.log(`${language}: ${file}`);
			return 0;
		}
		if (!isHeaderName(name)) throw new CliUsageError(`Invalid header name: "${name}"`);
		if (target === undefined) {
			console.log(`${name}: ${headerFiles[name] ?? "not set"}`);
			return 0;
		}
		if (target === "--clear") {
			delete headerFiles[name];
			console.log(`${name}: not set`);
		} else {
			if (target.startsWith("-")) throw new CliUsageError(`Unknown option: ${target}`);
			const file = path.resolve(target);
			if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Header file not found: ${file}`);
			headerFiles[name] = file;
			console.log(`${name}: ${file}`);
		}
		writeLocalSettings(LOCAL_SETTINGS_FILE, {...settings, headerFiles});
		return 0;
	}
}
