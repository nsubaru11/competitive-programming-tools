import type {JudgeMounts, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import {pageGlobals} from "@adapters/page/globals";
import {JudgeSiteBase} from "./site-base";

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

	private get editor() {
		return pageGlobals().ace?.edit("rich_source");
	}

	override onSourceChange(listener: () => void): void {
		this.editor?.getSession().on("change", listener);
	}

	sourceCode(): string {
		const textarea = this.textarea;
		if (textarea && textarea.offsetParent !== null) return textarea.value;
		return this.editor?.getSession().getValue() ?? "";
	}

	setSourceCode(code: string): void {
		if (this.textarea) this.textarea.value = code;
		this.editor?.getSession().setValue(code);
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
