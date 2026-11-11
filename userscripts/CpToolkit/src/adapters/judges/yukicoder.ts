import type {JudgeMounts, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import {type CodeMirrorContent, type CodeMirrorView, pageGlobals} from "@adapters/page/globals";
import {JudgeSiteBase} from "./site-base";

const EDITOR_CONTENT = ".cm-source-editor .cm-content";

export class YukicoderSite extends JudgeSiteBase {
	readonly id = "yukicoder";

	constructor(bridge: PageBridge) {
		super(bridge);
	}

	get mounts(): JudgeMounts {
		return {
			testButtons: document.querySelector("#submit_form"),
			sideButtons: document.querySelector("#toggle_source_editor")?.parentElement ?? null,
			results: document.querySelector("#content"),
		};
	}

	protected get languageSelect(): HTMLSelectElement | null {
		return document.querySelector("#lang");
	}

	private get textarea(): HTMLTextAreaElement | null {
		return document.querySelector("#source");
	}

	private get editor(): CodeMirrorView | null {
		const content = pageGlobals().document?.querySelector<CodeMirrorContent>(EDITOR_CONTENT);
		return content?.cmTile?.view ?? null;
	}

	/** エディタはページの読み込みより後に作られるので、現れるのを待って編集を監視する。 */
	override onSourceChange(listener: () => void): void {
		const watch = (): boolean => {
			const content = document.querySelector(EDITOR_CONTENT);
			if (!content) return false;
			new MutationObserver(listener).observe(content, {childList: true, subtree: true, characterData: true});
			return true;
		};
		const host = document.querySelector("#rich_source")?.parentElement;
		if (watch() || !host) return;
		const waiting = new MutationObserver(() => {
			if (watch()) waiting.disconnect();
		});
		waiting.observe(host, {childList: true, subtree: true});
	}

	sourceCode(): string {
		const textarea = this.textarea;
		if (textarea && textarea.offsetParent !== null) return textarea.value;
		return this.editor?.state.doc.toString() ?? "";
	}

	setSourceCode(code: string): void {
		if (this.textarea) this.textarea.value = code;
		const editor = this.editor;
		editor?.dispatch({changes: {from: 0, to: editor.state.doc.length, insert: code}});
	}

	submit(): void {
		document.querySelector<HTMLElement>('#submit_form input[type="submit"]')?.click();
	}

	async samples(): Promise<readonly SampleCase[]> {
		return [...document.querySelectorAll(".sample")].flatMap((sample, index) => {
			const [input, output] = sample.querySelectorAll("pre");
			if (!input || !output) return [];
			return [{
				title: `Sample ${index + 1}`,
				input: input.textContent ?? "",
				output: output.textContent ?? "",
				anchor: sample.querySelector(".copy-sample-input") ?? sample,
			}];
		});
	}
}
