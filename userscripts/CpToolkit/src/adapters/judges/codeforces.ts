import type {JudgeLanguage} from "@domain/execution/result";
import type {JudgeMounts, JudgeSite, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import {pageGlobals} from "@adapters/page/globals";
import {languagesOf} from "./languages";

const LANGUAGE_SELECT = "select[name='programTypeId']";

function readSampleBlock(pre: Element): string {
	const lines = pre.querySelectorAll(".test-example-line");
	if (lines.length > 0) return [...lines].map((line) => line.textContent ?? "").join("\n");
	return [...pre.childNodes].map((node) => {
		const isLineBreak = node instanceof HTMLElement && (node.tagName === "DIV" || node.tagName === "BR");
		return (node.textContent ?? "") + (isLineBreak ? "\n" : "");
	}).join("");
}

abstract class CodeforcesSiteBase implements JudgeSite {
	readonly id = "codeforces";
	abstract readonly mounts: JudgeMounts;

	protected abstract get languageSelect(): HTMLSelectElement | null;

	abstract sourceCode(): string;

	abstract setSourceCode(code: string): void;

	abstract submit(): void;

	abstract samples(): Promise<readonly SampleCase[]>;

	constructor(private readonly bridge: PageBridge) {
	}

	taskUri(): string {
		return location.href;
	}

	languages(): readonly JudgeLanguage[] {
		return languagesOf(this.languageSelect);
	}

	language(): JudgeLanguage | null {
		const id = this.languageSelect?.value;
		return this.languages().find((language) => language.id === id) ?? null;
	}

	onLanguageChange(listener: () => void): void {
		if (this.languageSelect) this.bridge.onChange(this.languageSelect, listener);
	}

	onSourceChange(_listener: () => void): void {
	}
}

/** 問題ページの提出欄はファイルしか受け付けないので、入力欄を用意する。 */
export class CodeforcesSite extends CodeforcesSiteBase {
	private readonly buttons = document.createElement("span");
	private readonly textarea = document.createElement("textarea");

	constructor(bridge: PageBridge) {
		super(bridge);
		Object.assign(this.textarea.style, {fontFamily: "monospace", width: "100%", minHeight: "5em"});
		document.querySelector(".submitForm")?.append(this.buttons);
		document.getElementById("pageContent")?.append(this.textarea);
		this.fileInput?.addEventListener("change", () => {
			void this.fileInput?.files?.[0]?.text().then((text) => {
				this.textarea.value = text;
			});
		});
	}

	get mounts(): JudgeMounts {
		return {testButtons: this.buttons, sideButtons: this.buttons, results: document.getElementById("pageContent")};
	}

	protected get languageSelect(): HTMLSelectElement | null {
		return document.querySelector(LANGUAGE_SELECT);
	}

	private get fileInput(): HTMLInputElement | null {
		return document.querySelector('.submitForm input[name="sourceFile"]');
	}

	/** cf-fast-submit が有効なら、そのエディタを優先する。 */
	private get fastSubmitEditor() {
		const element = document.getElementById("editor");
		return element ? pageGlobals().ace?.edit(element) : undefined;
	}

	sourceCode(): string {
		return this.fastSubmitEditor?.getValue() ?? this.textarea.value;
	}

	setSourceCode(code: string): void {
		this.textarea.value = code;
		this.fastSubmitEditor?.setValue(code);
		const files = new DataTransfer();
		files.items.add(new File([code], "prog.txt", {type: "text/plain"}));
		if (this.fileInput) this.fileInput.files = files.files;
	}

	submit(): void {
		this.setSourceCode(this.sourceCode());
		document.querySelector<HTMLElement>(".submitForm .submit")?.click();
	}

	async samples(): Promise<readonly SampleCase[]> {
		const samples: SampleCase[] = [];
		for (const block of document.querySelectorAll(".sample-test")) {
			const inputs = block.querySelectorAll(".input pre");
			const outputs = block.querySelectorAll(".output pre");
			const anchors = block.querySelectorAll(".input .title .input-output-copier");
			inputs.forEach((input, index) => {
				const output = outputs[index];
				const anchor = anchors[index];
				if (!output || !anchor) return;
				samples.push({
					title: `Sample ${samples.length + 1}`,
					input: readSampleBlock(input),
					output: readSampleBlock(output),
					anchor,
				});
			});
		}
		return samples;
	}
}

/** モバイル版には提出欄がないので、提出ページのフォームを問題ページへ移す。 */
export class CodeforcesMobileSite extends CodeforcesSiteBase {
	private constructor(bridge: PageBridge, private readonly main: Element, private readonly form: HTMLFormElement) {
		super(bridge);
	}

	static async create(bridge: PageBridge): Promise<CodeforcesMobileSite | null> {
		const main = document.querySelector("main");
		const url = /\/contest\/(\d+)\/problem\/([^/]+)/.exec(location.pathname);
		if (!main || !url) return null;
		const frame = document.createElement("iframe");
		frame.src = `/contest/${url[1]}/submit`;
		frame.style.display = "none";
		document.body.append(frame);
		await new Promise((resolve) => frame.addEventListener("load", resolve, {once: true}));
		const form = frame.contentDocument?.querySelector<HTMLFormElement>("._SubmitPage_submitForm");
		if (!form) return null;
		const problem = form.elements.namedItem("problemIndex") as HTMLInputElement | null;
		if (problem) {
			problem.value = url[2] ?? "";
			problem.readOnly = true;
		}
		main.append(form);
		return new CodeforcesMobileSite(bridge, main, form);
	}

	get mounts(): JudgeMounts {
		return {testButtons: this.main, sideButtons: this.main, results: this.main};
	}

	protected get languageSelect(): HTMLSelectElement | null {
		return this.form.elements.namedItem("programTypeId") as HTMLSelectElement | null;
	}

	private get source(): HTMLTextAreaElement | null {
		return this.form.elements.namedItem("source") as HTMLTextAreaElement | null;
	}

	sourceCode(): string {
		return this.source?.value ?? "";
	}

	setSourceCode(code: string): void {
		if (this.source) this.source.value = code;
	}

	submit(): void {
		this.form.submit();
	}

	async samples(): Promise<readonly SampleCase[]> {
		return [...document.querySelectorAll(".sample-test")].map((block, index) => ({
			title: `Sample ${index + 1}`,
			input: block.querySelector(".input pre.content")?.textContent ?? "",
			output: block.querySelector(".output pre.content")?.textContent ?? "",
			anchor: block.querySelector(".input .title") ?? block,
		}));
	}
}
