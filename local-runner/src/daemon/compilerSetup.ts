import fs from "node:fs";
import path from "node:path";
import type {CommandLanguage, EngineOptions} from "./commandEngine";
import {DotnetProjects, dotnetProjectVersion} from "./dotnetProject";
import {ensureHeaderUnit} from "./headerUnit";
import {runCompiler} from "./processRunner";

export function setupCacheKey(language: CommandLanguage): string {
	return language.setup === "builtin:dotnet-project" ? JSON.stringify(["project", dotnetProjectVersion]) : "";
}

/** 起動時に解答間で共有する資材を準備し、コンパイル時に対応する引数を設定する。 */
export class CompilerSetup {
	private readonly options: EngineOptions;
	private readonly dotnet = new DotnetProjects();

	constructor(options: EngineOptions) {
		this.options = options;
	}

	async warmUp(language: CommandLanguage, templates: string[][]): Promise<void> {
		const {log, rootDir, compileTimeoutMs, outputLimitBytes} = this.options;
		const started = Date.now();
		const description = language.setup === "builtin:gcc-header-unit" ? "header unit" : language.setup ?? "warmup";
		try {
			if (language.warmup?.length) {
				fs.mkdirSync(rootDir, {recursive: true});
				const args = language.warmup.map(arg => arg.replaceAll("{command}", language.command));
				const result = await runCompiler(args, {cwd: rootDir, timeoutMs: compileTimeoutMs, outputLimitBytes}, language.compileSearchPath);
				if (result.exitCode !== 0 || result.timedOut) throw new Error(result.stderr || result.stdout || "warmup failed");
			}
			if (language.setup === "builtin:gcc-header-unit") {
				for (const template of templates) await this.headerUnit(language, template);
			} else if (language.setup === "builtin:dotnet-project" && language.compile?.includes("{project}")) {
				await this.project(language);
			} else if (!language.warmup?.length) return;
			log(`[Setup] Lang=${language.name} Status=OK Time=${Date.now() - started}ms ${description}`);
		} catch (error) {
			log(`[Setup] Lang=${language.name} Status=NG ${description}: ${(error as Error).message}`);
		}
	}

	async configure(language: CommandLanguage, template: readonly string[], args: string[]): Promise<void> {
		if (language.setup === "builtin:dotnet-project" && args.includes("{project}")) {
			args[args.indexOf("{project}")] = await this.project(language);
		}
		if (language.setup === "builtin:gcc-header-unit") {
			try {
				args.splice(1, 0, ...await this.headerUnit(language, template));
			} catch (error) {
				this.options.log(`[Setup] Lang=${language.name} Status=NG compiling without a header unit: ${(error as Error).message}`);
			}
		}
	}

	private headerUnit(language: CommandLanguage, template: readonly string[]) {
		return ensureHeaderUnit(template, this.options.headerUnitCacheDir, language.compileSearchPath);
	}

	private project(language: CommandLanguage) {
		const {rootDir, compileTimeoutMs, outputLimitBytes} = this.options;
		return this.dotnet.ensure(language.command, path.join(rootDir, "..", "dotnet-projects"), compileTimeoutMs, outputLimitBytes);
	}
}
