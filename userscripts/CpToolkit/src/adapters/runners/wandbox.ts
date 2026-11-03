import {languageCatalog, runnerCatalog} from "@catalog/tables";
import {resolveFamily} from "@domain/execution/language";
import type {JudgeLanguage, RunOptions, RunResult} from "@domain/execution/result";
import {type Guard, isArrayOf, isNumber, isObjectOf, isString} from "@domain/validation/guards";
import type {CodeRunner, RunnerProvider} from "@application/execution/runner-catalog";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";
import type {HttpClient} from "@application/ports/services";

type WandboxCompiler = {
	readonly name: string;
	readonly language: string;
	readonly version: string;
	readonly switches: ReadonlyArray<{readonly name?: string; readonly "display-name"?: string}>;
};

type WandboxResponse = {
	status: number | string;
	signal?: string;
	compiler_output?: string;
	compiler_error?: string;
	program_output?: string;
	program_error?: string;
};

type CompilerCache = {
	readonly compilers: readonly WandboxCompiler[];
	readonly fetchedAt: number;
};

type CompilerSwitches = WandboxCompiler["switches"];

const isSwitches: Guard<CompilerSwitches> = (value): value is CompilerSwitches => Array.isArray(value);
const isCompilerCache = isObjectOf<CompilerCache>({
	compilers: isArrayOf(isObjectOf<WandboxCompiler>({
		name: isString,
		language: isString,
		version: isString,
		switches: isSwitches,
	})),
	fetchedAt: isNumber,
});

const CACHE_KEY = "easy-test:wandbox-compilers";
const HOUR_MS = 60 * 60 * 1000;
const ACL_INCLUDE_PATTERN = /^#\s*include\s*[<"]atcoder\/([^>"]+)[>"]/gm;

class WandboxRunner implements CodeRunner {
	readonly kind = "wandbox";
	readonly id: string;
	readonly label: string;
	private readonly optimization: string | undefined;
	private readonly http: HttpClient;
	private readonly compiler: WandboxCompiler;

	constructor(http: HttpClient, compiler: WandboxCompiler) {
		this.http = http;
		this.compiler = compiler;
		const usesAcl = compiler.language === "C++";
		this.id = `wandbox:${compiler.name}`;
		this.label = `${compiler.language} ${compiler.name}${usesAcl ? " + ACL" : ""} [Wandbox]`;
		this.optimization = compiler.switches.find((item) => item["display-name"] === "Optimization")?.name;
	}

	async run(sourceCode: string, input: string, _options: RunOptions): Promise<RunResult> {
		const usesAcl = this.compiler.language === "C++";
		const files = usesAcl ? await this.collectAclFiles(sourceCode) : new Map<string, string>();
		const startedAt = Date.now();
		const response = await this.http.send({
			url: runnerCatalog.wandbox.compileUrl,
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				compiler: this.compiler.name,
				code: sourceCode,
				stdin: input,
				options: this.optimization,
				...(usesAcl ? {
					"compiler-option-raw": "-I.",
					codes: [...files].map(([file, code]) => ({file, code})),
				} : {}),
			}),
		});
		const execTime = Date.now() - startedAt;
		const body = JSON.parse(response.text) as WandboxResponse;
		const output = body.program_output ?? "";
		const error = body.program_error ?? "";
		if (String(body.status) === "0") return {status: "OK", exitCode: "0", execTime, input, output, error};
		return {
			status: body.compiler_output || body.compiler_error ? "CE" : "RE",
			exitCode: `${body.status}${body.signal ? ` (${body.signal})` : ""}`,
			execTime,
			input,
			output: (body.compiler_output ?? "") + output,
			error: (body.compiler_error ?? "") + error,
		};
	}

	/** C++ の AtCoder Library を、コンパイルに必要なファイルとして集める。 */
	private async collectAclFiles(source: string, files = new Map<string, string>()): Promise<Map<string, string>> {
		const paths = [...source.matchAll(ACL_INCLUDE_PATTERN)].map((match) => `atcoder/${match[1]}`);
		const missing = paths.filter((path) => !files.has(path));
		const loaded = await Promise.all(missing.map(async (path) => {
			const response = await this.http.send({url: runnerCatalog.wandbox.aclBaseUrl + path});
			return [path, response.text] as const;
		}));
		for (const [path, code] of loaded) files.set(path, code);
		for (const [, code] of loaded) await this.collectAclFiles(code, files);
		return files;
	}
}

export class WandboxRunnerProvider implements RunnerProvider {
	private readonly http: HttpClient;
	private readonly state: KeyValueStore;

	constructor(http: HttpClient, state: KeyValueStore) {
		this.http = http;
		this.state = state;
	}

	async runnersFor({family}: JudgeLanguage): Promise<readonly CodeRunner[]> {
		const compilers = await this.compilers();
		return compilers
			.filter(({language, version}) => resolveFamily(languageCatalog, `${language} ${version}`) === family)
			.map((compiler) => new WandboxRunner(this.http, compiler));
	}

	private async compilers(): Promise<readonly WandboxCompiler[]> {
		const cached = readStored(this.state, CACHE_KEY, isCompilerCache, null);
		if (cached && Date.now() - cached.fetchedAt < runnerCatalog.wandbox.cacheHours * HOUR_MS) return cached.compilers;
		const response = await this.http.send({url: runnerCatalog.wandbox.listUrl});
		const compilers = JSON.parse(response.text) as readonly WandboxCompiler[];
		this.state.set(CACHE_KEY, {compilers, fetchedAt: Date.now()});
		return compilers;
	}
}
