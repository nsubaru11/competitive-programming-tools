import {spawn} from "node:child_process";
import path from "node:path";
import {PROJECT_ROOT, SETTINGS, SETTINGS_FILE} from "../config";
import type {RunnerStatusInfo} from "../types";
import {getRunnerStatus} from "../runnerClient";

const READY_TIMEOUT_MS = SETTINGS.server.startTimeoutMs;
const POLL_INTERVAL_MS = 500;

/** bash 用シングルクオートエスケープ。 */
function shq(s: string): string {
	return `'${s.replace(/'/g, `'\\''`)}'`;
}

/** 実行ファイルにした CLI ではなく、Bun でソースを動かしているか。 */
function isBunRuntime(): boolean {
	return /^bun(?:\.exe)?$/i.test(path.basename(process.execPath));
}

/**
 * Local Runner サーバーを起動する。
 * Windows: 既定は WSL で起動し、設定の server.backend が native のときだけ Windows の JDK を使う。
 * WSL/Linux 内: setsid でバックグラウンド化し、ログは ~/.cache/competitive-programming/local-runner/autostart.log へ。
 */
function startServer(): void {
	const binDir = path.join(PROJECT_ROOT, "local-runner", "bin");

	if (process.platform === "win32") {
		if (SETTINGS.server.backend === "native") {
			// Java の有無は、サーバーが設定の languages.java.command で確かめる。
			// 実行ファイルの CLI はサーバーも含むので、自分を daemon で起動する。Bun で動いているときは、その Bun でソースを動かす。
			const args = isBunRuntime() ? [path.join(PROJECT_ROOT, "local-runner", "src", "daemon", "main.ts")] : ["daemon"];
			const child = spawn(process.execPath, args, {
				cwd: PROJECT_ROOT,
				detached: true,
				windowsHide: true,
				stdio: "ignore",
				env: {...process.env, LOCAL_RUNNER_PROJECT_ROOT: PROJECT_ROOT},
			});
			child.unref();
			return;
		}
		// 新しいコンソール窓で wsl を直接起動（PowerShell を介さない）。
		// --cd で Windows パスのまま作業ディレクトリ指定（スペース対応）、bash で .sh 実行（実行権限ビット不要）。
		// cmd /k により .sh 終了後も窓が残り、エラーログを読める。
		const child = spawn(
			"cmd.exe",
			["/c", "start", "Local Runner", "cmd", "/k", "wsl.exe", "--cd", binDir, "--", "bash", "./start-local-runner.sh"],
			{stdio: "ignore"},
		);
		child.unref();
		return;
	}

	// CLI 自身が WSL/Linux 内の場合: setsid で背景化し、ログはファイルへ。
	const logDir = "$HOME/.cache/competitive-programming/local-runner";
	const inner =
		`mkdir -p ${logDir} && ` +
		`echo "=== autostart $(date) ===" >> ${logDir}/autostart.log && ` +
		`cd ${shq(binDir)} && chmod +x ./start-local-runner.sh && ` +
		`{ setsid nohup ./start-local-runner.sh < /dev/null >> ${logDir}/autostart.log 2>&1 & }`;
	const child = spawn("bash", ["-lc", inner], {stdio: "ignore"});
	child.unref();
}

/** CLI が server を叩く前に呼ぶ。未起動なら自動起動して ready まで待つ。 */
export async function ensureLocalRunnerReady(startIfStopped = SETTINGS.server.autoStart): Promise<RunnerStatusInfo> {
	const status = await getRunnerStatus(1500);
	if (status?.status === "running") return status;
	if (!status && !startIfStopped) throw new Error("Local Runner is unavailable. Run serve to start it.");

	try {
		if (!status) startServer();
	} catch (e) {
		throw new Error(`Could not start Local Runner: ${e instanceof Error ? e.message : String(e)}`);
	}

	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
		const ready = await getRunnerStatus(1500);
		if (ready?.status === "running") {
			console.error("Local Runner is ready.");
			return ready;
		}
	}
	throw new Error(
		`Local Runner did not become ready within ${READY_TIMEOUT_MS}ms.\n` +
		`  Check the Local Runner log. Bun and a JDK are required.\n` +
		`  Related settings in ${SETTINGS_FILE}: server.backend, server.startTimeoutMs, languages.java.command`,
	);
}
