import {pathToFileURL} from "node:url";
import {SETTINGS_FILE} from "../config";
import {legacyEnvironmentWarnings} from "../settings/settings";
import {CliUsageError} from "./commands/Command";
import * as registry from "./commands/registry";

/**
 * エントリポイント。
 * コマンド名でレジストリを引き、見つかったコマンドの execute() に残り引数を渡すだけ。
 * 引数の検証・実行は各コマンドクラスの内部に閉じている。
 */
export async function main(rawArgs = process.argv.slice(2)): Promise<number> {
	const [name, ...rest] = rawArgs;
	const command = name ? registry.getCommand(name) : undefined;
	if (!command) {
		registry.printUsage();
		return 1;
	}

	// daemon はサーバーが記録に残すので、ここでは出さない。
	if (command.name !== "daemon") {
		for (const warning of legacyEnvironmentWarnings(process.env, SETTINGS_FILE)) console.error(`Warning: ${warning}`);
	}

	try {
		return await command.execute(rest);
	} catch (error) {
		if (error instanceof CliUsageError) {
			if (error.message) console.error(error.message);
			registry.printUsage();
			return 1;
		}
		const message = error instanceof Error ? error.message : String(error);
		console.error(message.startsWith("[auth] ") ? message : `Error: ${message}`);
		return 1;
	}
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
const isBunEntry = Boolean(import.meta.main);

if (isDirectRun || isBunEntry) process.exit(await main());
