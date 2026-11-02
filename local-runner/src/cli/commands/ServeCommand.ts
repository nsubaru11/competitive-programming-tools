import * as ensureServer from "../ensureServer";
import type {Command} from "./Command";

/** Local Runner サーバーだけを先に起動して ready まで待つ（先回り起動）。 */
export class ServeCommand implements Command {
	readonly name = "serve";
	readonly usageLines = [
		"  serve                                   (start the Local Runner server)",
	];

	async execute(): Promise<number> {
		await ensureServer.ensureLocalRunnerReady();
		console.log("Local Runner is up. test, submit and localtest will now start immediately.");
		return 0;
	}
}
