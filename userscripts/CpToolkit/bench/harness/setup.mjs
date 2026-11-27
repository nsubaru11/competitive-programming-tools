// 計測の準備。setup.sh から呼ぶ。
//   1. 旧スクリプトを legacy.lock.json の版で取得し、sha256 を照合する
//   2. 旧スクリプトの @require を取得し、照合する
//   3. Tampermonkey を Chrome ウェブストアから取得して展開する(版は固定できないので記録する)
// 第三者のスクリプトにはライセンスの表記がないものがあるので、リポジトリには入れず、ここで取得する。
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {BENCH, SCRIPTS, WORK} from "./paths.mjs";

const lock = JSON.parse(readFileSync(join(BENCH, "legacy.lock.json"), "utf8"));
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const get = async (url) => {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return Buffer.from(await res.arrayBuffer());
};
const requireFile = (url) => url.replace(/^https?:\/\//, "").replace(/[/:]/g, "_");

let failed = 0;
for (const group of ["nsubaru", "public"]) mkdirSync(join(SCRIPTS, `legacy-${group}`), {recursive: true});
mkdirSync(join(SCRIPTS, "requires"), {recursive: true});

const requires = new Set();
for (const s of lock.legacy) {
	const body = await get(s.url);
	const ok = sha(body) === s.sha256;
	if (!ok) failed++;
	writeFileSync(join(SCRIPTS, `legacy-${s.group}`, `${s.id}.user.js`), body);
	for (const m of body.toString().matchAll(/^\/\/\s*@require\s+(\S+)/gm)) requires.add(m[1]);
	console.log(`${ok ? "ok      " : "MISMATCH"} ${s.id}`);
}
for (const url of [...requires].sort()) {
	const file = requireFile(url);
	// 版を書かない URL(常に最新が返る)は、計測したときの版に固定した URL から取る
	const entry = lock.requires.find((r) => r.file === file);
	const body = await get(entry?.pinned ?? url);
	const expected = entry?.sha256;
	const ok = expected === sha(body);
	if (!ok) failed++;
	writeFileSync(join(SCRIPTS, "requires", file), body);
	console.log(`${ok ? "ok      " : "MISMATCH"} @require ${entry?.pinned ?? url}`);
}

// Tampermonkey(拡張機能 ID dhdgffkkebhmkfjojejmpbldmpobfkfo)。.crx は zip の前に独自のヘッダーが付いている
const ext = join(WORK, "tm-ext");
if (!existsSync(join(ext, "manifest.json")) || process.argv.includes("--refresh-tampermonkey")) {
	const crx = join(WORK, "tampermonkey.crx");
	writeFileSync(crx, await get("https://clients2.google.com/service/update2/crx?response=redirect&prodversion=131.0&acceptformat=crx2,crx3&x=id%3Ddhdgffkkebhmkfjojejmpbldmpobfkfo%26uc"));
	rmSync(ext, {recursive: true, force: true});
	mkdirSync(ext, {recursive: true});
	try {
		execFileSync("unzip", ["-qo", crx, "-d", ext], {stdio: "ignore"});
	} catch {
		// unzip はヘッダーの分を警告して終了コード 1 を返すが、中身は展開できている
	}
}
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
console.log(`Tampermonkey ${manifest.version}`);

if (failed) {
	console.error(`\n${failed} 件のファイルが legacy.lock.json と一致しません。取得元が変わった可能性があります。`);
	process.exit(1);
}
