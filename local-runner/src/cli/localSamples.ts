import fs from "node:fs";
import path from "node:path";
import type {SamplePair} from "../types";
import * as shared from "@atcoder-tools/shared";

const INPUT_EXTS = [".in", ".txt", ".input"];
const OUTPUT_EXTS = [".out", ".output", ".ans", ".expected"];
const TEST_DIR_NAMES = ["tests", "test", "testcases", "sample", "samples", "judgedata"];

export type LocalSample = {read: (withExpected?: boolean) => SamplePair};

/** 入出力ファイルの組だけを列挙し、本文は実行するときに読む。 */
export function loadLocalSamples(sourceFilePath: string, testDir?: string): LocalSample[] {
	const resolved = path.resolve(sourceFilePath);
	const stem = path.basename(resolved, path.extname(resolved));

	const candidateDirs = testDir
		? [path.resolve(testDir), path.join(path.resolve(testDir), stem)] // 直接指定（中の <stem>/ も見る）
		: buildAutoDirs(path.dirname(resolved), stem);

	const tried: string[] = [];
	for (const dir of candidateDirs) {
		tried.push(dir);
		if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
		const pairs = collectPairs(dir);
		if (pairs.length > 0) return pairs;
	}
	throw new Error(`No local sample (.in/.out) pairs found. Looked in:\n  ${tried.join("\n  ")}`);
}

function buildAutoDirs(sourceDir: string, stem: string): string[] {
	// src/java のように言語別フォルダがある場合は src の親をコンテストフォルダとして扱う。
	const parent = path.dirname(sourceDir);
	const root = path.basename(parent).toLowerCase() === "src" ? path.dirname(parent) : parent; // 例: .../prelim2025
	const dirs: string[] = [path.join(root, stem)]; // <root>/A（問題フォルダが src と並列のとき）
	for (const name of TEST_DIR_NAMES) {
		dirs.push(path.join(root, name));        // <root>/judgedata
		dirs.push(path.join(root, name, stem));  // <root>/judgedata/A
	}
	return [...new Set(dirs)];
}

function collectPairs(dir: string): LocalSample[] {
	const inputs = new Map<string, string>();
	const outputs = new Map<string, string>();

	for (const name of fs.readdirSync(dir)) {
		const ext = path.extname(name).toLowerCase();
		const key = name.slice(0, name.length - ext.length);
		if (INPUT_EXTS.includes(ext)) inputs.set(key, name);
		else if (OUTPUT_EXTS.includes(ext)) outputs.set(key, name);
	}

	// 入力・出力どちらか一方しか無いケースも含める
	const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: "base"});
	const keys = [...new Set([...inputs.keys(), ...outputs.keys()])].sort(collator.compare);

	const read = (name: string) => shared.normalizeNewlines(fs.readFileSync(path.join(dir, name), "utf8"));
	const pairs: LocalSample[] = [];
	let outputOnlyCount = 0;
	for (const key of keys) {
		const inName = inputs.get(key);
		const outName = outputs.get(key);
		if (!inName && outName && fs.statSync(path.join(dir, outName)).size === 0) continue;
		if (!inName && outName) outputOnlyCount++;
		const index = pairs.length + 1;
		pairs.push({
			read: (withExpected = true) => ({
				index,
				input: inName ? read(inName) : "",
				...(withExpected && outName ? {expectedOutput: read(outName)} : {}),
			}),
		});
	}

	if (outputOnlyCount > 1) {
		throw new Error(`Multiple output-only samples found in ${dir} (ambiguous which input they belong to).`);
	}

	return pairs;
}
