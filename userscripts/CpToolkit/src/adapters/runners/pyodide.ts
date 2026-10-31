import {runnerCatalog} from "@catalog/tables";
import type {JudgeLanguage, RunResult} from "@domain/execution/result";
import type {CodeRunner, RunnerProvider} from "@application/execution/runner-catalog";
import type {ScriptLoader} from "@application/ports/services";
import {pageGlobals, type PyodideApi} from "@adapters/page/globals";
import {SerialQueue} from "./serial-queue";

const SETUP_CODE = `
import contextlib, io, platform
class __redirect_stdin(contextlib._RedirectStream):
  _stream = "stdin"
`;

function wrapSource(sourceCode: string): string {
	const body = sourceCode.split("\n").map((line) => `     ${line}`).join("\n");
	return `
def __run():
 global __stdout, __stderr, __stdin, __code
 with __redirect_stdin(io.StringIO(__stdin)):
  with contextlib.redirect_stdout(io.StringIO()) as __stdout:
   with contextlib.redirect_stderr(io.StringIO()) as __stderr:
    try:
     pass
${body}
    except SystemExit as e:
     __code = e.code
`;
}

class PyodideRunner implements CodeRunner {
	readonly kind = "browser";
	readonly id = "browser:pyodide";
	readonly label = "Python3 Pyodide [Browser]";
	private pyodide: Promise<PyodideApi> | null = null;
	private readonly queue = new SerialQueue();

	constructor(private readonly scripts: ScriptLoader) {
	}

	run(sourceCode: string, input: string): Promise<RunResult> {
		return this.queue.run(() => this.execute(sourceCode, input));
	}

	private async load(): Promise<PyodideApi> {
		const {baseUrl} = runnerCatalog.pyodide;
		await this.scripts.loadScript(`${baseUrl}pyodide.js`);
		const pyodide = await pageGlobals().loadPyodide?.({indexURL: baseUrl});
		if (!pyodide) throw new Error("Pyodide was not loaded.");
		await pyodide.runPythonAsync(SETUP_CODE);
		return pyodide;
	}

	private async execute(sourceCode: string, input: string): Promise<RunResult> {
		this.pyodide ??= this.load();
		const pyodide = await this.pyodide;
		const code = wrapSource(sourceCode);
		pyodide.globals.set("__stdin", input);
		pyodide.globals.set("__code", null);
		const startedAt = Date.now();
		try {
			await pyodide.loadPackagesFromImports(code);
			await pyodide.runPythonAsync(code);
			pyodide.runPython("__run()");
		} catch (error) {
			return {status: "RE", exitCode: "-1", input, error: error instanceof Error ? error.message : String(error)};
		}
		const exitCode = pyodide.globals.get("__code");
		return {
			status: typeof exitCode === "number" && exitCode !== 0 ? "RE" : "OK",
			exitCode: String(exitCode ?? 0),
			execTime: Date.now() - startedAt,
			input,
			output: pyodide.globals.get("__stdout").getvalue(),
			error: pyodide.globals.get("__stderr").getvalue(),
		};
	}
}

export class PyodideRunnerProvider implements RunnerProvider {
	private readonly runner: PyodideRunner;

	constructor(scripts: ScriptLoader) {
		this.runner = new PyodideRunner(scripts);
	}

	async runnersFor({family}: JudgeLanguage): Promise<readonly CodeRunner[]> {
		return family === "python3" ? [this.runner] : [];
	}
}
