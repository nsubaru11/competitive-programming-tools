import type {Command} from "./Command";
import {TestCommand} from "./TestCommand";
import {SubmitCommand} from "./SubmitCommand";
import {TomainCommand} from "./TomainCommand";
import {ToclipCommand} from "./ToclipCommand";
import {LocalTestCommand} from "./LocalTestCommand";
import {RunCommand} from "./RunCommand";
import {ServeCommand} from "./ServeCommand";
import {StopCommand} from "./StopCommand";
import {StatusCommand} from "./StatusCommand";
import {CacheClearCommand} from "./CacheClearCommand";
import {SetLibCommand} from "./SetLibCommand";
import {SetHeaderCommand} from "./SetHeaderCommand";
import {SettingsCommand} from "./SettingsCommand";
import {CrossCheck} from "./CrossCheck";

/**
 * 登録済みコマンド一覧。
 * 新しいコマンドを追加するときは、Command を実装したクラスを作ってこの配列に1行足すだけでよい。
 * 表示順は usage の出力順を兼ねる。
 */
const COMMAND_LIST: readonly Command[] = [
	new TestCommand(),
	new SubmitCommand(),
	new TomainCommand(),
	new ToclipCommand(),
	new LocalTestCommand(),
	new RunCommand(),
	new ServeCommand(),
	new StopCommand(),
	new StatusCommand(),
	new SetLibCommand(),
	new SetHeaderCommand(),
	new SettingsCommand(),
	new CacheClearCommand(),
	new CrossCheck(),
];

/** 名前 → コマンドの索引。 */
const REGISTRY: ReadonlyMap<string, Command> = new Map(COMMAND_LIST.map((c) => [c.name, c]));

/** コマンド名から該当コマンドを引く（無ければ undefined）。 */
export function getCommand(name: string): Command | undefined {
	return REGISTRY.get(name);
}

/** 全コマンドの usage 行と共通オプションを stderr に出力する。 */
export function printUsage(): void {
	console.error("Usage:");
	for (const command of COMMAND_LIST) {
		for (const line of command.usageLines) console.error(line);
	}
	console.error("Options:");
	console.error("  -f, --force                submit: submit even if a sample is not AC / tomain: overwrite outFile");
	console.error("  -d, --debug[=true|false]   test/localtest/run: turn DEBUG on or off (default: on)");
	console.error("  --no-header                submit/tomain/toclip: do not add the header");
	console.error("  --lang=<name>              choose the language by its name in the settings (default: by the file extension)");
	console.error("  --header=<name>            submit/tomain/toclip: use the header set with setheader <name> (default: the header of the language)");
	console.error("  --full                     test/localtest/submit/crosscheck: show the whole WA diff");
	console.error("  --wa-only                  test/localtest/submit/crosscheck: show only mismatched lines");
	console.error("  --max-lines=N              test/localtest/submit/crosscheck: lines of the WA diff to show (default: 20)");
	console.error("  --time-limit=N             localtest/run/crosscheck: time limit in ms for the warning colors (default: 2000; the run is not stopped)");
}
