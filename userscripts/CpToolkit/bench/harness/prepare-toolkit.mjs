// 計測する版の CP Toolkit を .work/toolkit/<版>/ に用意する。run.sh から呼ぶ。
//   node harness/prepare-toolkit.mjs <そのコミットを展開したフォルダ> <コミット>
// 置くもの:
//   CpToolkit.user.js           配布物(dist)。シムでの録画に使う
//   CpToolkit.analysis.user.js  同じ中身を整形せずにビルドしたもの。ソースマップで機能へ割り振るため
//   CpToolkit.analysis.user.js.map
//   features.json               その版で登録されている機能の ID
//   source.json                 版とコミット
import {execFileSync} from "node:child_process";
import {copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {WORK} from "./paths.mjs";

const [src, commit] = process.argv.slice(2);
const userscripts = join(src, "userscripts");
const cpt = join(userscripts, "CpToolkit");
const version = JSON.parse(readFileSync(join(cpt, "meta.json"), "utf8")).version;
const out = join(WORK, "toolkit", version);
mkdirSync(out, {recursive: true});

// 解析用のビルド: build.ts を写し、ソースマップを出して整形を省く。どちらの行も見つからなければ止める
const build = readFileSync(join(userscripts, "build.ts"), "utf8");
const MINIFY = "\t\tminify: false,";
const FORMAT = /\tawait formatUserscriptOutput\(outfile, banner, await loadNotices\(name\)\);/;
if (!build.includes(MINIFY) || !FORMAT.test(build)) {
	throw new Error("userscripts/build.ts の形が変わったため、解析用のビルドを作れません。harness/prepare-toolkit.mjs を直してください");
}
writeFileSync(join(userscripts, "build-analysis.ts"), build
	.replace(MINIFY, `${MINIFY}\n\t\tsourcemap: "external",`)
	.replace(FORMAT, "\t// 解析用: ソースマップの位置を保つため整形しない"));
const run = (cmd, args, cwd) => execFileSync(cmd, args, {cwd, stdio: "inherit"});
run("bun", ["install", "--frozen-lockfile"], src);
run("bun", ["run", "data:types"], userscripts);
// 配布物はコミットされているものをそのまま使い、解析用だけビルドする
copyFileSync(join(cpt, "dist", "CpToolkit.user.js"), join(out, "CpToolkit.user.js"));
run("bun", ["build-analysis.ts", "CpToolkit"], userscripts);
copyFileSync(join(cpt, "dist", "CpToolkit.user.js"), join(out, "CpToolkit.analysis.user.js"));
copyFileSync(join(cpt, "dist", "CpToolkit.user.js.map"), join(out, "CpToolkit.analysis.user.js.map"));

// 登録されている機能: registry.ts が読み込む features/<フォルダ>/index の id
const registry = readFileSync(join(cpt, "src", "app", "registry.ts"), "utf8");
const dirs = [...registry.matchAll(/from "@features\/([^/"]+)\/index"/g)].map((m) => m[1]).filter((d) => d !== "settings-panel");
const features = dirs.map((dir) => {
	const index = readFileSync(join(cpt, "src", "features", dir, "index.ts"), "utf8");
	const m = /\bid: "([^"]+)"/.exec(index);
	if (!m) throw new Error(`features/${dir}/index.ts に id がありません`);
	return m[1];
});
writeFileSync(join(out, "features.json"), JSON.stringify(features, null, "\t"));
writeFileSync(join(out, "source.json"), JSON.stringify({version, commit}, null, "\t"));
console.log(`CP Toolkit ${version} (${commit.slice(0, 7)}): ${features.length} 機能`);
console.log(readdirSync(out).join("\n"));
