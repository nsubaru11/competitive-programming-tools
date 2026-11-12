import {configuredLibrarySourceRoot, updateUserSettings} from "../../config";
import {deleteSetting, resolveLibrarySource, setSetting} from "../../settings/settings";
import type {Command} from "./Command";
import {CliUsageError} from "./Command";

const RESTART_HINT = "If Local Runner is running, apply this with stop and serve.";

const LIBRARY_SETTING = ["languages", "java", "library"] as const;

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
		if (target === "--clear") {
			updateUserSettings((user) => deleteSetting(user, LIBRARY_SETTING));
			console.log("Java library: not set");
		} else {
			if (target.startsWith("-")) throw new CliUsageError(`Unknown option: ${target}`);
			const librarySourceRoot = resolveLibrarySource(target);
			updateUserSettings((user) => setSetting(user, LIBRARY_SETTING, librarySourceRoot));
			console.log(`Java library: ${librarySourceRoot}`);
		}
		console.log(RESTART_HINT);
		return 0;
	}
}
