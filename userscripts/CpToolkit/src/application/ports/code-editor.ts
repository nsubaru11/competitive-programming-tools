import type {SubmissionTarget} from "@domain/page/route";

export interface CodeEditor {
	getValue(): string;

	setValue(value: string): void;

	isJava(): boolean;

	isReadOnly(): boolean;

	setWritable(): void;

	onPaste(listener: () => void): void;

	onChange(listener: () => void): void;

	/** 指定した行(0 始まり)から始まるブロックを折りたたむ。 */
	foldLines(lines: readonly number[]): void;
}

export interface CodeEditorLocator {
	/**
	 * エディタが生成されるまで待つ。時間内に見つからなければ null を返す。
	 * delayMs を指定すると、サイトがエディタを初期化する時間を空けてから探す。
	 */
	locate(target: SubmissionTarget, options?: {timeoutMs?: number; delayMs?: number}): Promise<CodeEditor | null>;
}
