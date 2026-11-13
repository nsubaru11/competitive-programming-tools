import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {runCommand} from "./processRunner";

/**
 * builtin:gcc-header-unit の実装。
 *
 * `#include <bits/stdc++.h>` を読み終えた結果(header unit)を保存しておき、解答のコンパイルで使い回す。
 * 標準ライブラリの中身はマクロやオプションで変わるので、コンパイルの引数の組ごとに別のものを作る。
 */

const HEADER_NAME = "bits/stdc++.h";
const BUILD_TIMEOUT_MS = 120_000;
const OUTPUT_LIMIT_BYTES = 64 * 1024;

const building = new Map<string, Promise<string[]>>();

/** コンパイルの引数のひな形から、ヘッダーを読むときに効く部分だけを取り出す。ソース、出力先、リンクの指定は除く。 */
export function headerUnitArguments(compileTemplate: readonly string[]): string[] {
	const kept: string[] = [];
	for (let index = 0; index < compileTemplate.length; index++) {
		const argument = compileTemplate[index]!;
		if (argument === "-o") {
			index++;
			continue;
		}
		if (argument.includes("{source}") || argument.includes("{output}")) continue;
		if (argument.startsWith("-l") || argument.startsWith("-Wl,") || argument.startsWith("-L")) continue;
		kept.push(argument);
	}
	return kept;
}

/** 引数の組とコンパイラの実体から決まる名前。コンパイラを入れ替えたときも作り直す。 */
export function headerUnitKey(headerArguments: readonly string[]): string {
	let compiler = "";
	try {
		const stat = fs.statSync(headerArguments[0] ?? "");
		compiler = `${stat.size}:${stat.mtimeMs}`;
	} catch {
		// 見つからないコンパイラは、ビルドの段階でエラーになる
	}
	return crypto.createHash("md5").update(JSON.stringify([compiler, ...headerArguments])).digest("hex");
}

function findFile(dir: string, suffix: string): string | null {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const entryPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const found = findFile(entryPath, suffix);
			if (found !== null) return found;
		} else if (entry.name.endsWith(suffix)) {
			return entryPath;
		}
	}
	return null;
}

async function build(headerArguments: readonly string[], unitDir: string): Promise<void> {
	const options = {timeoutMs: BUILD_TIMEOUT_MS, outputLimitBytes: 16 * 1024 * 1024};
	// コンパイラが実際に読むヘッダーの場所を、前処理の行番号の情報から得る。
	const preprocessed = await runCommand(
		[...headerArguments, "-x", "c++", "-E", "-"],
		{...options, stdin: `#include <${HEADER_NAME}>\n`},
	);
	const headerFile = /^# \d+ "([^"]*\/bits\/stdc\+\+\.h)"/m.exec(preprocessed.stdout)?.[1];
	if (!headerFile) throw new Error(`Could not locate <${HEADER_NAME}>. ${preprocessed.stderr.trim()}`);

	const workDir = `${unitDir}.tmp-${process.pid}`;
	fs.rmSync(workDir, {recursive: true, force: true});
	fs.mkdirSync(workDir, {recursive: true});
	try {
		const compiled = await runCommand(
			[...headerArguments, "-x", "c++-header", headerFile],
			{...options, outputLimitBytes: OUTPUT_LIMIT_BYTES, cwd: workDir},
		);
		const unitFile = compiled.exitCode === 0 ? findFile(workDir, ".gcm") : null;
		if (unitFile === null) throw new Error(`Could not build the header unit. ${compiled.stderr.trim()}`);
		// 対応表には移動後の場所を書く。
		const finalUnitFile = path.join(unitDir, path.relative(workDir, unitFile));
		fs.writeFileSync(path.join(workDir, "mapper.txt"), `${headerFile} ${finalUnitFile}\n`, "utf8");
		fs.rmSync(unitDir, {recursive: true, force: true});
		fs.renameSync(workDir, unitDir);
	} finally {
		fs.rmSync(workDir, {recursive: true, force: true});
	}
}

/**
 * header unit を用意し、解答のコンパイルに足す引数を返す。保存済みならすぐ返す。
 * 作れなかったときは理由を投げる。呼び出し側は header unit なしでコンパイルを続ける。
 */
export function ensureHeaderUnit(compileTemplate: readonly string[], cacheDir: string): Promise<string[]> {
	const headerArguments = headerUnitArguments(compileTemplate);
	if (!headerArguments.some((argument) => argument === "-fmodules" || argument === "-fmodules-ts")) {
		return Promise.reject(new Error('"setup": "builtin:gcc-header-unit" needs -fmodules in "compile".'));
	}
	const unitDir = path.join(cacheDir, headerUnitKey(headerArguments));
	const mapperArguments = [`-fmodule-mapper=${path.join(unitDir, "mapper.txt")}`];
	if (fs.existsSync(path.join(unitDir, "mapper.txt"))) return Promise.resolve(mapperArguments);

	const pending = building.get(unitDir);
	if (pending) return pending;
	const promise = build(headerArguments, unitDir).then(() => mapperArguments).finally(() => building.delete(unitDir));
	building.set(unitDir, promise);
	return promise;
}

/** 今の設定では使わなくなった header unit を消す。1つが約 30MB あるので、溜めない。 */
export function pruneHeaderUnits(cacheDir: string, compileTemplates: ReadonlyArray<readonly string[]>): void {
	const keep = new Set(compileTemplates.map((template) => headerUnitKey(headerUnitArguments(template))));
	let entries: string[];
	try {
		entries = fs.readdirSync(cacheDir);
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!keep.has(entry)) fs.rmSync(path.join(cacheDir, entry), {recursive: true, force: true});
	}
}
