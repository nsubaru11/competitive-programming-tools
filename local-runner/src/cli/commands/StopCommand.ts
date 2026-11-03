import {postToRunner} from "../runnerClient";
import type {Command} from "./Command";

/** Local Runner サーバーを停止する（mode:shutdown を投げて graceful 終了させる）。 */
export class StopCommand implements Command {
	readonly name = "stop";
	readonly usageLines = [
		"  stop                                    (stop the Local Runner server)",
	];

	async execute(): Promise<number> {
		try {
			const res = await postToRunner({mode: "shutdown"}, 3000);
			if (res.ok) {
				console.log("Local Runner stopped.");
				return 0;
			}
			console.error(`Could not stop Local Runner (status=${res.status}).`);
			return 1;
		} catch {
			console.log("Local Runner is not running.");
			return 0;
		}
	}
}
