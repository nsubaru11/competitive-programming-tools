import {configuredLibrarySourceRoot, LOCAL_SETTINGS_FILE} from "../../config";
import {readLocalSettings, resolveLibrarySource, writeLocalSettings} from "../../localSettings";
import type {Command} from "./Command";
import {CliUsageError} from "./Command";

const RESTART_HINT = "If Local Runner is running, apply this with stop and serve.";

/** Java のライブラリの場所を設定する。設定はこのリポジトリのファイルに置き、WSL のサーバーからも読む。 */
export class SetLibCommand implements Command {
	readonly name = "setlib";
	readonly usageLines = [
		"  setlib <path>                           (set the folder of the Java library)",
		"  setlib                                  (show the current folder)",
		"  setlib --clear                          (stop using the Java library)",
	];

	async execute(args: string[]): Promise<number> {
		const [target, extra] = args;
		if (extra !== undefined) throw new CliUsageError("setlib takes one argument.");
		if (target === undefined) {
			console.log(`Java library: ${configuredLibrarySourceRoot() ?? "not set"}`);
			return 0;
		}
		const settings = readLocalSettings(LOCAL_SETTINGS_FILE);
		if (target === "--clear") {
			delete settings.librarySourceRoot;
			writeLocalSettings(LOCAL_SETTINGS_FILE, settings);
			console.log("Java library: not set");
		} else {
			if (target.startsWith("-")) throw new CliUsageError(`Unknown option: ${target}`);
			const librarySourceRoot = resolveLibrarySource(target);
			writeLocalSettings(LOCAL_SETTINGS_FILE, {...settings, librarySourceRoot});
			console.log(`Java library: ${librarySourceRoot}`);
		}
		console.log(RESTART_HINT);
		return 0;
	}
}
