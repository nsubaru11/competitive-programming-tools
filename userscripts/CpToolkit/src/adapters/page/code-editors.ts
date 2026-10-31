import {sleep} from "@atcoder-tools/shared";
import type {SubmissionTarget} from "@domain/page/route";
import type {CodeEditor, CodeEditorLocator} from "@application/ports/code-editor";
import {type AceEditor, type MonacoEditor, pageGlobals} from "./globals";

const JAVA_MODE_PATTERN = /(^|\/)java$/i;
const DEFAULT_TIMEOUT_MS = 30_000;
const MIN_PASTED_LENGTH = 30;

class AceCodeEditor implements CodeEditor {
	constructor(private readonly editor: AceEditor) {
	}

	getValue(): string {
		return this.editor.getValue();
	}

	setValue(value: string): void {
		this.editor.getSession().setValue(value);
	}

	isJava(): boolean {
		const mode = this.editor.getSession().getMode().$id ?? "";
		return mode === "" || JAVA_MODE_PATTERN.test(mode);
	}

	isReadOnly(): boolean {
		return this.editor.getReadOnly();
	}

	setWritable(): void {
		this.editor.setReadOnly(false);
	}

	onPaste(listener: () => void): void {
		this.editor.on("paste", () => setTimeout(listener));
	}

	onChange(listener: () => void): void {
		this.editor.getSession().on("change", listener);
	}

	foldLines(lines: readonly number[]): void {
		const session = this.editor.getSession();
		const folded = new Set(session.getAllFolds().map((fold) => fold.start.row));
		for (const line of lines) {
			if (folded.has(line)) continue;
			try {
				const range = session.getFoldWidget(line) ? session.getFoldWidgetRange(line) : null;
				if (range) session.addFold("...", range);
			} catch {
				// 既存の折りたたみと重なる行は飛ばす
			}
		}
	}
}

class MonacoCodeEditor implements CodeEditor {
	constructor(private readonly editor: MonacoEditor) {
	}

	private get model() {
		const model = this.editor.getModel();
		if (!model) throw new Error("Monaco model is not available.");
		return model;
	}

	getValue(): string {
		return this.model.getValue();
	}

	setValue(value: string): void {
		this.model.setValue(value);
	}

	isJava(): boolean {
		return this.model.getLanguageId() === "java";
	}

	isReadOnly(): boolean {
		return false;
	}

	setWritable(): void {
	}

	onPaste(listener: () => void): void {
		try {
			this.editor.onDidPaste(listener);
		} catch {
			// onDidPaste がない版では、まとまった入力を貼り付けとして扱う
			this.model.onDidChangeContent(({isFlush, changes}) => {
				if (!isFlush && changes.length === 1 && (changes[0]?.text.length ?? 0) >= MIN_PASTED_LENGTH) listener();
			});
		}
	}

	onChange(listener: () => void): void {
		this.model.onDidChangeContent(listener);
	}

	foldLines(lines: readonly number[]): void {
		const action = this.editor.getAction("editor.fold");
		if (!action) return;
		const position = this.editor.getPosition();
		void (async () => {
			try {
				for (const line of lines) {
					this.editor.setPosition({lineNumber: line + 1, column: 1});
					await action.run();
				}
			} finally {
				this.editor.setPosition(position);
			}
		})().catch(() => undefined);
	}
}

function findEditor(target: SubmissionTarget): CodeEditor | null {
	const page = pageGlobals();
	if (target.editor === "monaco") {
		const [editor] = page.monaco?.editor.getEditors() ?? [];
		return editor?.getModel() ? new MonacoCodeEditor(editor) : null;
	}
	const element = target.editorElements.map((selector) => document.querySelector(selector)).find((found) => found);
	if (!page.ace || !element) return null;
	try {
		return new AceCodeEditor(page.ace.edit(element));
	} catch {
		return null;
	}
}

export class PageCodeEditorLocator implements CodeEditorLocator {
	async locate(
		target: SubmissionTarget,
		{timeoutMs = DEFAULT_TIMEOUT_MS, delayMs = 0}: {timeoutMs?: number; delayMs?: number} = {},
	): Promise<CodeEditor | null> {
		if (delayMs > 0) await sleep(delayMs);
		const editor = findEditor(target);
		if (editor) return editor;
		return new Promise((resolve) => {
			const finish = (found: CodeEditor | null): void => {
				observer.disconnect();
				clearTimeout(timer);
				resolve(found);
			};
			const observer = new MutationObserver(() => {
				const found = findEditor(target);
				if (found) finish(found);
			});
			const timer = setTimeout(() => finish(null), timeoutMs);
			observer.observe(document.body, {childList: true, subtree: true});
		});
	}
}
