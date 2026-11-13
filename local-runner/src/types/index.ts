export type Task = {
	contestId: string;
	taskScreenName: string;
	taskUrl: string;
	submitUrl: string;
	submitPostUrl: string;
};

export type IndexedBlock = {
	idx: number;
	text: string;
};

export type SamplePair = {
	index: number;
	input: string;
	expectedOutput?: string;
};

export type SubmitForm = {
	actionUrl: string;
	formValues: Map<string, string>;
};

export type SubmitResult = {
	submissionId: string;
	submissionUrl: string;
	trackingUnavailable?: boolean;
};

export type SubmissionFinalResult = {
	status: string;
	execTime: string;
	memory: string;
};

export type SampleResult = {
	index: number;
	status: string;
	execTime: number;
	memoryKb: number;
	runnerStatus: string;
	exitCode: number;
	stdoutTruncated: boolean;
	stderrTruncated: boolean;
	stderr: string;
	actualOutput: string;
	expectedOutput: string;
};

/** mode:"status" のレスポンス。サーバーの稼働状況を CLI の status コマンドへ返す。 */
export type RunnerStatusInfo = {
	status: "running";
	pid: number;
	uptimeMs: number;
	javaVersion: string;
	runnerLabel: string;
	dispatcherRunning: boolean;
	librarySource: string | null;
	/** 使える言語の名前。 */
	languages: string[];
	/** 処理系が見つからない言語と、その理由。 */
	skippedLanguages: string[];
	compileCacheSize: number;
	compileCacheMax: number;
	settingsFile: string;
	/** サーバーが起動時に読んだ設定の要約。CLI が今の設定と比べる。 */
	settingsDigest: string;
	baseDir: string;
	logFile: string;
};

export type CompileEntry = {
	rootDir: string;
	classDir: string;
	mainClass: string;
	requiresIsolatedProcess: boolean;
	status: "compiled" | "error";
	error: string | null;
};

export type ProcessResult = {
	code: number;
	signal: NodeJS.Signals | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	stdoutTruncated: boolean;
	stderrTruncated: boolean;
};

export type DispatcherRunResult = {
	kind: "run";
	exitCode?: number;
	time?: number;
	stdout?: string;
	stderr?: string;
	stdoutTruncated?: boolean;
	stderrTruncated?: boolean;
	timedOut?: boolean;
	error?: string;
	memory?: number;
};
