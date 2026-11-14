// 配布用のフォルダを out/local-runner/competitive-programming-tools に作る。zip にするのは Release のワークフロー。
// CLI とサーバーを、Windows 用と Linux 用の実行ファイルにまとめる。常駐 JVM の jar、計測用の起動プログラム、
// WarmUp.java は実行ファイルに埋め込むので、展開した先では Bun も javac も C コンパイラも要らない。
// 起動プログラムを静的リンクするので、Linux で実行する。javac、jar、cc が PATH に要る。

import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EMBEDDED_FILES} from "../src/daemon/embedded";

const RUNNER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS_DIR = path.dirname(RUNNER_DIR);
const OUT_DIR = path.join(TOOLS_DIR, "out", "local-runner");
const BUILD_DIR = path.join(OUT_DIR, "build");
const PACKAGE_DIR = path.join(OUT_DIR, "competitive-programming-tools");
const JAVA_SOURCE_DIR = path.join(RUNNER_DIR, "java", "src");
// 常駐 JVM のクラスは、提出先と同じ Java のバージョンで動くように作る。
const JAVA_RELEASE = "24";

/** コマンドを実行する。失敗したら終了する。 */
function run(command: string, args: string[], cwd = RUNNER_DIR) {
	const result = spawnSync(command, args, {cwd, stdio: "inherit"});
	if (result.status !== 0) {
		console.error(`Failed: ${command} ${args.join(" ")}`);
		process.exit(result.status ?? 1);
	}
}

/** tools からの相対パスのファイルを、配布物の target へ写す。 */
function copy(relativePath: string, target = relativePath) {
	const destination = path.join(PACKAGE_DIR, target);
	fs.mkdirSync(path.dirname(destination), {recursive: true});
	fs.copyFileSync(path.join(TOOLS_DIR, relativePath), destination);
}

if (process.platform !== "linux") {
	console.error("Run this script on Linux (WSL), because the launcher is linked statically.");
	process.exit(1);
}

fs.rmSync(OUT_DIR, {recursive: true, force: true});
fs.mkdirSync(path.join(BUILD_DIR, "classes"), {recursive: true});

// 埋め込むファイルを作る。名前は EMBEDDED_FILES と揃え、サーバーはその名前で探す。
const dispatcherSources = fs.readdirSync(JAVA_SOURCE_DIR)
	.filter((name) => name.endsWith(".java") && name !== "WarmUp.java")
	.map((name) => path.join(JAVA_SOURCE_DIR, name));
run("javac", ["--release", JAVA_RELEASE, "-encoding", "UTF-8", "-g", "-d", path.join(BUILD_DIR, "classes"), ...dispatcherSources]);
const dispatcherJar = path.join(BUILD_DIR, EMBEDDED_FILES.dispatcherJar);
run("jar", ["--create", "--file", dispatcherJar, "-C", path.join(BUILD_DIR, "classes"), "."]);
const launcher = path.join(BUILD_DIR, EMBEDDED_FILES.launcher);
run("cc", ["-O2", "-static", "-o", launcher, path.join(RUNNER_DIR, "native", "launcher.c")]);
const warmUpSource = path.join(BUILD_DIR, EMBEDDED_FILES.warmUpSource);
fs.copyFileSync(path.join(JAVA_SOURCE_DIR, "WarmUp.java"), warmUpSource);

/** CLI(サーバーを含む)を実行ファイルにする。assets は埋め込むファイル。 */
function compile(target: string, outfile: string, assets: string[]) {
	run(process.execPath, [
		"build",
		"--compile",
		`--target=${target}`,
		"--asset-naming=[name].[ext]",
		"./src/cli/index.ts",
		...assets,
		`--outfile=${path.join(PACKAGE_DIR, "local-runner", "bin", outfile)}`,
	]);
}

// Windows 用は CLI と、server.backend が native のときのサーバー。起動プログラムは Linux でしか使わない。
compile("bun-windows-x64", "local-runner.exe", [dispatcherJar, warmUpSource]);
compile("bun-linux-x64", "local-runner", [dispatcherJar, warmUpSource, launcher]);

copy("LICENSE");
copy("local-runner/release/README.md", "README.md");
copy("local-runner/settings.schema.json");
for (const name of fs.readdirSync(path.join(RUNNER_DIR, "bin"))) {
	if (name.endsWith(".cmd") || name.endsWith(".ps1") || name.endsWith(".sh")) copy(`local-runner/bin/${name}`);
}

const version = (JSON.parse(fs.readFileSync(path.join(RUNNER_DIR, "package.json"), "utf8")) as {version: string}).version;
console.log(`Packaged Local Runner ${version}: ${PACKAGE_DIR}`);
