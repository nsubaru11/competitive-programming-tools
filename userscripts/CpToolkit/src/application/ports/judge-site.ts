import type {JudgeLanguage, TestCase} from "@domain/execution/result";

export type SampleCase = TestCase & {
	/** Run ボタンを置く要素。ページの外から取得したサンプルでは null。 */
	readonly anchor: object | null;
};

export type JudgeMounts = {
	readonly testButtons: object | null;
	readonly sideButtons: object | null;
	readonly results: object | null;
};

/** EasyTest が必要とする、サイトごとの操作。 */
export interface JudgeSite {
	readonly id: string;
	readonly mounts: JudgeMounts;

	taskUri(): string;

	languages(): readonly JudgeLanguage[];

	language(): JudgeLanguage | null;

	onLanguageChange(listener: () => void): void;

	onSourceChange(listener: () => void): void;

	sourceCode(): string;

	setSourceCode(code: string): void;

	submit(): void;

	samples(): Promise<readonly SampleCase[]>;
}
