import fs from "node:fs";
import type {RunnerStatusInfo} from "../../types";
import {CLI_CONFIG, configuredLibrarySourceRoot} from "../../config";
import * as color from "../../utils/color";
import * as sampleCache from "../sampleCache";
import type {Command} from "./Command";

/** ミリ秒を "1h 23m 45s" のような短い表記にする。 */
function formatUptime(ms: number): string {
	const totalSec = Math.floor(ms / 1000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

/** CLI 側で持っているサンプルキャッシュ（~/.atcoder/cache/samples）のエントリ数。 */
function countSampleCacheEntries(): number {
	const dir = sampleCache.getSampleCacheDir();
	if (!dir) return 0;
	try {
		return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).length;
	} catch {
		return 0;
	}
}

/**
 * Local Runner サーバーの稼働状況を表示する。auto-start はせず、
 * 停止中ならその旨だけを表示する（終了コード: 稼働中=0 / 停止中=1）。
 */
export class StatusCommand implements Command {
	readonly name = "status";
	readonly usageLines = [
		"  status                                  (show the Local Runner server status; exit code 0 if running, 1 if stopped)",
	];

	async execute(): Promise<number> {
		const isSupportCliColor: boolean = color.supportsCliColor();
		let info: RunnerStatusInfo | null = null;
		try {
			const res = await fetch(CLI_CONFIG.defaultLocalRunnerUrl, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({mode: "status"}),
				signal: AbortSignal.timeout(3000),
			});
			if (res.ok) info = await res.json() as RunnerStatusInfo;
		} catch {
			// 接続失敗＝停止中として扱う
		}

		const sampleCacheCount = countSampleCacheEntries();
		if (!info) {
			const label = isSupportCliColor ? `${color.ANSI.RED}stopped${color.ANSI.RESET}` : "stopped";
			console.log(`Local Runner: ${label} (${CLI_CONFIG.defaultLocalRunnerUrl})`);
			console.log(`  java library:  ${configuredLibrarySourceRoot() ?? "not set (setlib <path>)"}`);
			console.log(`  sample cache:  ${sampleCacheCount} task(s) (${sampleCache.getSampleCacheDir() || "-"})`);
			console.log(`  To start it: serve (test, localtest and run also start it automatically)`);
			return 1;
		}

		const label = isSupportCliColor ? `${color.ANSI.GREEN}running${color.ANSI.RESET}` : "running";
		const dispatcher = info.dispatcherRunning
			? (isSupportCliColor ? `${color.ANSI.GREEN}running${color.ANSI.RESET}` : "running")
			: (isSupportCliColor ? `${color.ANSI.YELLOW}stopped${color.ANSI.RESET}` : "stopped");
		console.log(`Local Runner: ${label} (${CLI_CONFIG.defaultLocalRunnerUrl})`);
		console.log(`  pid:           ${info.pid}`);
		console.log(`  uptime:        ${formatUptime(info.uptimeMs)}`);
		console.log(`  java:          ${info.javaVersion}`);
		console.log(`  label:         ${info.runnerLabel}`);
		console.log(`  dispatcher:    ${dispatcher}`);
		console.log(`  java library:  ${info.librarySource ?? "not loaded (setlib <path>)"}`);
		console.log(`  compile cache: ${info.compileCacheSize}/${info.compileCacheMax} entries`);
		console.log(`  warmup:        ${info.warmUpProfile}`);
		console.log(`  base dir:      ${info.baseDir}`);
		console.log(`  log file:      ${info.logFile}`);
		console.log(`  sample cache:  ${sampleCacheCount} task(s) (${sampleCache.getSampleCacheDir() || "-"})`);
		return 0;
	}
}
