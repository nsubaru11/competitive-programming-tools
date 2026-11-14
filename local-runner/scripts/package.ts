// 配布用のフォルダを out/local-runner/competitive-programming-tools に作る。zip にするのは Release のワークフロー。
// サーバーと CLI は Bun で1ファイルずつにまとめるので、展開した先で bun install は要らない。
// 中のフォルダの形はリポジトリと同じにして、設定ファイルやソースの場所を決める処理をそのまま使う。

import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const RUNNER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS_DIR = path.dirname(RUNNER_DIR);
const OUT_DIR = path.join(TOOLS_DIR, "out", "local-runner");
const PACKAGE_DIR = path.join(OUT_DIR, "competitive-programming-tools");
const PACKAGE_RUNNER_DIR = path.join(PACKAGE_DIR, "local-runner");
const REPOSITORY_URL = "https://github.com/nsubaru11/competitive-programming-tools";

const version = (JSON.parse(fs.readFileSync(path.join(RUNNER_DIR, "package.json"), "utf8")) as {version: string}).version;
// 文書から配布物の外へのリンクは、この版のリポジトリの中を指すようにする。
const tag = `local-runner-v${version}`;

/** bun build を実行する。失敗したら終了する。 */
function bunBuild(args: string[]) {
	const result = spawnSync(process.execPath, ["build", ...args], {cwd: RUNNER_DIR, stdio: "inherit"});
	if (result.status !== 0) {
		console.error(`bun build failed: ${args.join(" ")}`);
		process.exit(result.status ?? 1);
	}
}

/** tools からの相対パスのファイルを、配布物の同じ場所へ写す。 */
function copy(relativePath: string) {
	const target = path.join(PACKAGE_DIR, relativePath);
	fs.mkdirSync(path.dirname(target), {recursive: true});
	fs.copyFileSync(path.join(TOOLS_DIR, relativePath), target);
}

/** 文書を写す。配布物に無いファイルへのリンクは、リポジトリの URL にする。 */
function copyDocument(relativePath: string, packaged: ReadonlySet<string>) {
	const text = fs.readFileSync(path.join(TOOLS_DIR, relativePath), "utf8");
	const directory = path.posix.dirname(relativePath);
	const rewritten = text.replace(/\]\((?!https?:|#|mailto:)([^)#\s]+)(#[^)\s]*)?\)/g, (link, target: string, hash = "") => {
		const resolved = path.posix.normalize(path.posix.join(directory, target));
		if (packaged.has(resolved)) return link;
		const kind = fs.existsSync(path.join(TOOLS_DIR, resolved)) && fs.statSync(path.join(TOOLS_DIR, resolved)).isDirectory() ? "tree" : "blob";
		return `](${REPOSITORY_URL}/${kind}/${tag}/${resolved}${hash})`;
	});
	const target = path.join(PACKAGE_DIR, relativePath);
	fs.mkdirSync(path.dirname(target), {recursive: true});
	fs.writeFileSync(target, rewritten);
}

fs.rmSync(OUT_DIR, {recursive: true, force: true});

bunBuild(["./src/daemon/main.ts", "--target=bun", `--outfile=${path.join(PACKAGE_RUNNER_DIR, "dist", "server.js")}`]);
bunBuild(["./src/cli/index.ts", "--target=bun", `--outfile=${path.join(PACKAGE_RUNNER_DIR, "dist", "cli.js")}`]);
bunBuild([
	"./src/cli/index.ts",
	"--compile",
	"--target=bun-windows-x64",
	`--outfile=${path.join(PACKAGE_RUNNER_DIR, "bin", "atcoder-cli-runner.exe")}`,
]);

const files = [
	"LICENSE",
	"local-runner/settings.schema.json",
	"local-runner/native/launcher.c",
	...fs.readdirSync(path.join(RUNNER_DIR, "bin"))
		.filter((name) => name !== "atcoder-cli-runner.exe")
		.map((name) => `local-runner/bin/${name}`),
	...fs.readdirSync(path.join(RUNNER_DIR, "java", "src"))
		.filter((name) => name.endsWith(".java"))
		.map((name) => `local-runner/java/src/${name}`),
];
for (const file of files) copy(file);

const documents = ["local-runner/README.md", "local-runner/SETTINGS.md"];
const packaged = new Set([...files, ...documents]);
for (const document of documents) copyDocument(document, packaged);

console.log(`Packaged Local Runner ${version}: ${PACKAGE_DIR}`);
