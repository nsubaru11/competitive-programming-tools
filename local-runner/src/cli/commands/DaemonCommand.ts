import {type Command, CliUsageError} from "./Command";

/** サーバーをこのプロセスで動かす。起動スクリプトが使う内部用のコマンドなので、使い方には載せない。 */
export class DaemonCommand implements Command {
	readonly name = "daemon";
	readonly usageLines = [];

	async execute(args: string[]): Promise<number> {
		if (args.length > 0) throw new CliUsageError("daemon takes no arguments.");
		// サーバーの処理は読み込んだ時点で java を探すので、このコマンドのときだけ読み込む。
		const {startServer} = await import("../../daemon/server");
		await startServer();
		// サーバーは shutdown で終了する。ここで返すと、CLI がプロセスを終了してしまう。
		return new Promise<number>(() => {});
	}
}
