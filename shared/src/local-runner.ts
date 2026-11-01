export type LocalRunnerStatus =
	| "success"
	| "compileError"
	| "timeLimitExceeded"
	| "runtimeError"
	| "internalError"
	| "badRequest";

export type EasyTestStatus = "OK" | "AC" | "WA" | "RE" | "TLE" | "CE" | "IE";

export type LocalRunnerCompilerInfo = {
	language: string;
	compilerName: string;
	label: string;
};

export type LocalRunnerListRequest = {
	mode: "list";
};

export type LocalRunnerPrecompileRequest = {
	mode: "precompile";
	sourceCode: string;
};

/** 提出物の先頭に付けるヘッダー。true は既定のファイル、文字列は templates/header/<名前>.txt、false は付けない。 */
export type LocalRunnerHeaderOption = boolean | string;

export type LocalRunnerTransformRequest = {
	mode: "transform";
	sourceCode: string;
	debug?: boolean;
	autoImport?: boolean;
	validate?: boolean;
	/** 省略時は既定のヘッダーを付ける。 */
	header?: LocalRunnerHeaderOption;
};

export type LocalRunnerPrepareRequest = {
	mode: "prepare";
	compilerName?: string;
	sourceCode: string;
	debug?: boolean;
	autoImport?: boolean;
	validate?: boolean;
	/** 省略時は付けない。指定しても返すソースにだけ付け、コンパイルはヘッダーなしで行う。 */
	header?: LocalRunnerHeaderOption;
};

export type LocalRunnerRunRequest = {
	mode: "run";
	compilerName?: string;
	sourceCode?: string;
	programId?: string;
	stdin?: string;
	prepared?: boolean;
};

export type LocalRunnerRequest =
	| LocalRunnerListRequest
	| LocalRunnerPrecompileRequest
	| LocalRunnerTransformRequest
	| LocalRunnerPrepareRequest
	| LocalRunnerRunRequest;

export type LocalRunnerTransformResponse = {
	status: "success" | "compileError";
	sourceCode: string;
	diagnostics: string;
	inlinedClasses: string[];
	addedImports: string[];
	diagnosticItems: CompilerDiagnostic[];
};

export type LocalRunnerPrepareResponse = LocalRunnerTransformResponse & {
	programId?: string;
};

export type CompilerDiagnostic = {
	kind: string;
	line: number;
	column: number;
	code: string;
	message: string;
};

export type LocalRunnerRunResponse = {
	status: LocalRunnerStatus;
	exitCode: number;
	stdout: string;
	stderr: string;
	time: number;
	stdoutTruncated: boolean;
	stderrTruncated: boolean;
	memory: number;
};

export type LocalRunnerPrecompileResponse = {
	status: "accepted";
};

export type LocalRunnerBadRequestResponse = {
	status: "badRequest" | "internalError";
	stderr: string;
};

export function isHttpUrl(value: string): boolean {
	return /^https?:\/\//.test(value);
}

export function buildLocalRunnerListRequest(): LocalRunnerListRequest {
	return {mode: "list"};
}

export function buildLocalRunnerTransformRequest(
	sourceCode: string,
	debug = false,
	autoImport = true,
	validate = true,
	header: LocalRunnerHeaderOption = true,
): LocalRunnerTransformRequest {
	return {mode: "transform", sourceCode, debug, autoImport, validate, header};
}

export function buildLocalRunnerPrepareRequest(
	sourceCode: string,
	debug = false,
	autoImport = true,
	validate = false,
	header: LocalRunnerHeaderOption = false,
	compilerName?: string,
): LocalRunnerPrepareRequest {
	return {mode: "prepare", compilerName, sourceCode, debug, autoImport, validate, header};
}

export function buildLocalRunnerRunRequest(
	sourceCode: string,
	stdin: string,
	compilerName?: string,
	prepared = false,
): LocalRunnerRunRequest {
	return {
		mode: "run",
		compilerName,
		sourceCode,
		stdin,
		prepared,
	};
}

export function buildLocalRunnerProgramRunRequest(
	programId: string,
	stdin: string,
	compilerName?: string,
): LocalRunnerRunRequest {
	return {
		mode: "run",
		compilerName,
		programId,
		stdin,
	};
}

export function toEasyTestStatus(status: LocalRunnerStatus, exitCode = 0): EasyTestStatus {
	switch (status) {
		case "success":
			return exitCode === 0 ? "OK" : "RE";
		case "runtimeError":
			return "RE";
		case "timeLimitExceeded":
			return "TLE";
		case "compileError":
			return "CE";
		case "internalError":
		case "badRequest":
		default:
			return "IE";
	}
}
