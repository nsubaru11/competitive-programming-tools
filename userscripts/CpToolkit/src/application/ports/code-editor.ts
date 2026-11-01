import type {SubmissionTarget} from "@domain/page/route";

/** ace.edit を先に呼ぶとサイトの初期化の設定が無視されるので、サイトの処理を待つ。 */
export const EDITOR_SETUP_DELAY_MS = 500;

export interface CodeEditor {
	getValue(): string;

	setValue(value: string): void;

	isJava(): boolean;

	isReadOnly(): boolean;

	setWritable(): void;

	/** 貼り付けが反映されたあとに、貼り付けた文字列を渡して呼ぶ。 */
	onPaste(listener: (pasted: string) => void): void;

	onChange(listener: () => void): void;

	/** 指定した行(0 始まり)から始まるブロックを折りたたむ。 */
	foldLines(lines: readonly number[]): void;
}

export type EditorLookup = {
	readonly timeoutMs?: number;
	readonly delayMs?: number;
};

export interface CodeEditorLocator {
	/**
	 * エディタが生成されるまで待つ。時間内に見つからなければ null を返す。
	 * delayMs を指定すると、サイトがエディタを初期化する時間を空けてから探す。
	 */
	locate(target: SubmissionTarget, options?: EditorLookup): Promise<CodeEditor | null>;
}
