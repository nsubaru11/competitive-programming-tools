import fs from "node:fs";
import path from "node:path";
import type {CommandLanguageSettings} from "../settings/settings";
import {findOnPath, isExecutableFile, runCommand} from "./processRunner";
import {readZip} from "../update/zip";

/** 標準の kotlinc 配置で実行用 JAR を共有できるときだけ、ランタイムの埋め込みを省く。 */
export function kotlinCommands(settings: CommandLanguageSettings, command: string) {
	const compile = settings.compile ?? [];
	const run = settings.run;
	const jar = run.at(-1);
	if (settings.setup !== "builtin:kotlin-runtime" || !compile.includes("-include-runtime")
		|| run.at(-2) !== "-jar" || !jar || !compile.includes("-d") || compile[compile.indexOf("-d") + 1] !== jar) return {compile, run};
	const lib = path.resolve(path.dirname(fs.realpathSync(command)), "../lib");
	const runtime = ["kotlin-stdlib.jar", "kotlin-script-runtime.jar", "kotlin-reflect.jar"].map(name => path.join(lib, name));
	if (!runtime.every(file => fs.existsSync(file))) return {compile, run};
	return {
		compile: compile.filter(arg => arg !== "-include-runtime"),
		run: [...run.slice(0, -2), "-cp", [jar, ...runtime].join(path.delimiter), `{mainClass:${jar}}`],
	};
}

/** JAR 仕様の継続行をつなぎ、主セクションから kotlinc が選んだエントリーポイントを読む。 */
async function jarMainClass(file: string, java: string, timeoutMs: number): Promise<string | undefined> {
	const entries = readZip(fs.readFileSync(file));
	const manifest = entries.find(entry => entry.name === "META-INF/MANIFEST.MF");
	const section = manifest?.read().toString("utf8").replace(/\r\n?/g, "\n").replace(/\n /g, "").split("\n\n", 1)[0];
	const main = section?.match(/^Main-Class: ([^\n]+)$/mi)?.[1];
	if (!main || entries.some(entry => entry.name === main.replaceAll(".", "/") + ".class")) return main;

	// kotlinc の版によっては @file:JvmName の改名前の名前が記録される。実際の main の署名を一度だけ調べる。
	const prefix = main.slice(0, main.lastIndexOf(".") + 1).replaceAll(".", "/");
	const classes = entries.map(({name}) => name).filter(name => name.endsWith(".class") && name.slice(0, name.lastIndexOf("/") + 1) === prefix)
		.map(name => name.slice(0, -6).replaceAll("/", "."));
	const launcher = path.isAbsolute(java) ? java : findOnPath(java);
	const sibling = launcher && path.join(path.dirname(fs.realpathSync(launcher)), "javap");
	const javap = sibling && isExecutableFile(sibling) ? sibling : findOnPath("javap");
	if (!javap || !classes.length) return main;
	const listing = await runCommand([javap, "-public", "-classpath", file, ...classes], {
		cwd: path.dirname(file), timeoutMs, outputLimitBytes: 1024 * 1024,
	});
	if (listing.exitCode === 0 && !listing.stdoutTruncated) {
		const matches = listing.stdout.split(/^}/m).filter(block => /public static (?:final )?void main\(java\.lang\.String\[\]\)/.test(block));
		if (matches.length === 1) return matches[0]!.match(/\bclass ([^\s<{]+)/)?.[1] ?? main;
	}
	return main;
}

export async function kotlinRunArguments(args: readonly string[], dir: string, timeoutMs: number, expand: (arg: string) => string): Promise<readonly string[]> {
	const jar = args.at(-1)?.match(/^\{mainClass:(.+)\}$/)?.[1];
	if (!jar) return args;
	const main = await jarMainClass(path.resolve(dir, expand(jar)), expand(args[0]!), timeoutMs);
	// main のない正常な JAR には、標準の java -jar の診断を返す。
	return main ? [...args.slice(0, -1), main] : [...args.slice(0, -3), "-jar", jar];
}
