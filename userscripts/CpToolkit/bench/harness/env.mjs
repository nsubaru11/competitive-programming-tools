// 計測した環境を <出力フォルダ>/env.json に記録する。run.sh から呼ぶ。
import {cpus, release, platform, totalmem} from "node:os";
import {readFileSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import {join} from "node:path";
import {WORK} from "./paths.mjs";

const require = createRequire(import.meta.url);
const {chromium} = require("playwright");
const browser = await chromium.launch({channel: "chromium"});
const env = {
	date: new Date().toISOString(),
	os: `${platform()} ${release()}`,
	cpu: cpus()[0]?.model ?? "unknown",
	cores: cpus().length,
	memoryGB: Math.round(totalmem() / 1024 ** 3),
	node: process.version,
	playwright: require("playwright/package.json").version,
	chromium: browser.version(),
	tampermonkey: JSON.parse(readFileSync(join(WORK, "tm-ext", "manifest.json"), "utf8")).version,
};
await browser.close();
writeFileSync(join(process.argv[2], "env.json"), JSON.stringify(env, null, "\t"));
console.log(env);
