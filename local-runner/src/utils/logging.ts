import fs from "node:fs";
import {LOG_FILE_PATH, RUNNER_CONFIG} from "../config";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function logInfo(message: string) {
	const line = formatLogLine("INFO", message);
	process.stdout.write(`${line}\n`);
	appendLogLine(line);
}

export function logWarn(message: string) {
	const line = formatLogLine("WARN", message);
	process.stderr.write(`${line}\n`);
	appendLogLine(line);
}

export function logError(message: string) {
	const line = formatLogLine("ERROR", message);
	process.stderr.write(`${line}\n`);
	appendLogLine(line);
}

export function trimForLog(text: string | null | undefined, maxLen = 72) {
	if (!text) return "";
	if (text.length <= maxLen) return text;
	return `${text.slice(0, maxLen - 3)}...`;
}

function stripAnsi(text: string) {
	return String(text || "").replace(/\x1B\[[0-9;]*m/g, "");
}

/** 実行環境のタイムゾーンによらず JST で返す。JST に夏時間はないので固定オフセットでよい。 */
function formatJstTimestamp() {
	return new Date(Date.now() + JST_OFFSET_MS).toISOString().replace("T", " ").replace("Z", "");
}

function formatLogLine(level: string, message: string) {
	return `[${formatJstTimestamp()}] [${level}] ${message}`;
}

function rotateLogFileIfNeeded() {
	if (RUNNER_CONFIG.maxLogFileSize <= 0 || !fs.existsSync(LOG_FILE_PATH)) {
		return;
	}
	const currentSize = fs.statSync(LOG_FILE_PATH).size;
	if (currentSize < RUNNER_CONFIG.maxLogFileSize) {
		return;
	}
	const backupPath = `${LOG_FILE_PATH}.1`;
	try {
		if (fs.existsSync(backupPath)) {
			fs.rmSync(backupPath, {force: true});
		}
		fs.renameSync(LOG_FILE_PATH, backupPath);
	} catch {
	}
}

function appendLogLine(line: string) {
	try {
		fs.mkdirSync(RUNNER_CONFIG.baseDir, {recursive: true});
		rotateLogFileIfNeeded();
		fs.appendFileSync(LOG_FILE_PATH, `${stripAnsi(line)}\n`, "utf8");
	} catch {
	}
}
