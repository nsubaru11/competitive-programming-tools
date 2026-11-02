import * as sampleCache from "../sampleCache";
import type {Command} from "./Command";

/**
 * サンプルキャッシュを削除する。独自フラグ（-a / -t）を自前で解釈する。
 *   cacheclear -a                  … 全削除
 *   cacheclear -t <taskScreenName> … 指定タスクのみ削除
 */
export class CacheClearCommand implements Command {
	readonly name = "cacheclear";
	readonly usageLines = [
		"  cacheclear -a                           (delete all cached samples)",
		"  cacheclear -t <taskScreenName>          (delete the cache of one task, e.g. cacheclear -t abc456_a)",
	];

	execute(args: readonly string[]): number {
		const flag = args[0];
		if (flag === "-a") {
			const removed = sampleCache.clearSampleCache();
			console.log(`Deleted all cached samples (${removed}).`);
			return 0;
		}
		if (flag === "-t") {
			const taskScreenName = args[1];
			if (!taskScreenName) {
				console.error("Usage: cacheclear -t <taskScreenName>");
				return 1;
			}
			const removed = sampleCache.clearSampleCacheForTask(taskScreenName);
			console.log(removed
				? `Deleted the cached samples: ${taskScreenName}`
				: `No cached samples found: ${taskScreenName}`);
			return 0;
		}
		console.error("Usage:");
		console.error("  cacheclear -a                  (delete all)");
		console.error("  cacheclear -t <taskScreenName> (delete one task)");
		return 1;
	}
}
