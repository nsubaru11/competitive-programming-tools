import type {SubmissionTarget} from "@domain/page/route";
import type {CodeEditor, CodeEditorLocator, EditorLookup} from "@application/ports/code-editor";

export type PasteContext = {
	readonly editor: CodeEditor;
	readonly pasted: string;
	/** 貼り付けた直後のコード。 */
	readonly original: string;
};

export type PasteStep = {
	/** 小さいものから順に実行する。 */
	readonly order: number;
	transform(code: string, context: PasteContext): string | Promise<string>;
	/** この処理がコードを変え、エディタへ反映したあとに呼ぶ。 */
	applied?(editor: CodeEditor): void;
};

/** 貼り付けたコードの加工は順番が結果に影響するので、ここで1本の流れにする。 */
export class PastePipeline {
	private readonly steps: PasteStep[] = [];
	private watching = false;
	private readonly editors: CodeEditorLocator;

	constructor(editors: CodeEditorLocator) {
		this.editors = editors;
	}

	/** エディタのないページも多いので、見つかるのを待たずに返す。 */
	add(target: SubmissionTarget, lookup: EditorLookup, step: PasteStep): void {
		this.steps.push(step);
		this.steps.sort((a, b) => a.order - b.order);
		if (this.watching) return;
		this.watching = true;
		void this.editors.locate(target, lookup).then((editor) => {
			editor?.onPaste((pasted) => void this.run(editor, pasted).catch(() => undefined));
		});
	}

	private async run(editor: CodeEditor, pasted: string): Promise<void> {
		const original = editor.getValue();
		const changedBy: PasteStep[] = [];
		let code = original;
		for (const step of this.steps) {
			const next = await step.transform(code, {editor, pasted, original});
			if (next !== code) changedBy.push(step);
			code = next;
		}
		// 変換中に編集された場合は、その内容を上書きしない
		if (code === original || editor.getValue() !== original) return;
		editor.setValue(code);
		for (const step of changedBy) step.applied?.(editor);
	}
}
