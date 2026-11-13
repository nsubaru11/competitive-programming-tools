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
	/** 言語の種類(cpp、python3 など)。ページの言語と同じ種類の実行環境を候補にする。 */
	family?: string;
	/** ページの言語の表記にこの語が含まれていれば、同じ種類の中でこの実行環境を先に使う。 */
	match?: string[];
};

export type LocalRunnerListRequest = {
	mode: "list";
};

/**
 * 編集中のソースを、先にコンパイルしておく。サーバーは結果を待たずに {status: "accepted"} を返し、
 * 同じ言語の新しいソースが届いたら、古いソースのコンパイルを中断する。
 */
export type LocalRunnerPrecompileRequest = {
	mode: "precompile";
	sourceCode: string;
	/** list で返したコンパイラの識別子。省略時は Java。 */
	compilerName?: string;
	/** 省略時は有効。run の debug と同じ値にすると、事前コンパイルの結果を実行に使える。 */
	debug?: boolean;
};

/** 提出物の先頭に付けるヘッダー。true は言語の設定、文字列は setheader で設定した名前、false は付けない。 */
export type LocalRunnerHeaderOption = boolean | string;

export type LocalRunnerTransformRequest = {
	mode: "transform";
	sourceCode: string;
	/** list で返したコンパイラの識別子。省略時は Java。 */
	compilerName?: string;
	debug?: boolean;
	autoImport?: boolean;
	validate?: boolean;
	/** 省略時は既定のヘッダーを付ける。 */
	header?: LocalRunnerHeaderOption;
};

export type LocalRunnerPrepareRequest = {
	mode: "prepare";
	sourceCode: string;
	/** list で返したコンパイラの識別子。複数の言語を扱うサーバーが言語を選ぶのに使う。省略時は Java。 */
	compilerName?: string;
	debug?: boolean;
	autoImport?: boolean;
	validate?: boolean;
	/** 省略時は付けない。指定しても返すソースにだけ付け、コンパイルはヘッダーなしで行う。 */
	header?: LocalRunnerHeaderOption;
};

/**
 * 実行する。sourceCode を渡すと、そのソースのコンパイルが終わるのを待ってから実行し、
 * コンパイルエラーなら status を compileError、stderr を診断にして返す。programId は prepare の結果を渡す。
 */
export type LocalRunnerRunRequest = {
	mode: "run";
	/** list で返したコンパイラの識別子。sourceCode を渡すときに使う。 */
	compilerName?: string;
	sourceCode?: string;
	programId?: string;
	stdin?: string;
	/** sourceCode を渡すときのデバッグの有無。省略時は有効。 */
	debug?: boolean;
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
	/** lib.* を使うのに、サーバーがライブラリなしで動いているので変換できなかった。 */
	libraryMissing?: boolean;
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
	/** Java が実行中に確保したメモリの合計(KB)。解放した分も含むので、最大値ではない。測らなければ 0。 */
	memory: number;
	/** プロセスが同時に使った物理メモリの最大値(KB)。プロセスとして実行する言語が返す。 */
	peakMemory?: number;
};

/** 指定した programId のプログラムがサーバーにないときの stderr の先頭。サーバーの再起動やキャッシュの追い出しで起こる。 */
export const STALE_PROGRAM_MESSAGE = "Prepared program is unavailable:";

/** コンパイル済みのプログラムが消えていて、ソースから作り直す必要がある応答か。 */
export function isStaleProgramResponse(response: {status: string; stderr?: string}): boolean {
	return response.status === "badRequest" && response.stderr?.startsWith(STALE_PROGRAM_MESSAGE) === true;
}

export function isHttpUrl(value: string): boolean {
	return /^https?:\/\//.test(value);
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
