import {atcoderSampleSelectors} from "@catalog/judges";
import type {JudgeLanguage} from "@domain/execution/result";
import type {JudgeMounts, JudgeSite, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import type {HttpClient} from "@application/ports/services";
import {pageGlobals} from "@adapters/page/globals";
import {languagesOf} from "./languages";

function pairs<T>(items: readonly T[]): Array<[T, T]> {
	const result: Array<[T, T]> = [];
	for (let index = 0; index + 1 < items.length; index += 2) {
		result.push([items[index] as T, items[index + 1] as T]);
	}
	return result;
}

/** コンテストにより書式が違うので、サンプルが見つかるセレクタまで順に試す。 */
function parseSamples(page: Document): SampleCase[] {
	for (const {selector, container} of atcoderSampleSelectors) {
		const elements = [...page.querySelectorAll(selector)].filter((element) => {
			return !element.closest(".io-style") && !element.querySelector("var");
		});
		if (elements.length === 0) continue;
		return pairs(elements).map(([input, output], index) => {
			const parent = input.closest(container) ?? input.parentElement;
			return {
				title: `Sample ${index + 1}`,
				input: input.textContent ?? "",
				output: output.textContent ?? "",
				anchor: parent?.querySelector(".btn-copy") ?? parent?.querySelector("h1,h2,h3,h4,h5,h6") ?? input,
			};
		});
	}
	return [];
}

export class AtCoderSite implements JudgeSite {
	readonly id = "atcoder";
	private readonly samplesByTask = new Map<string, Promise<readonly SampleCase[]>>();

	constructor(private readonly bridge: PageBridge, private readonly site: HttpClient) {
	}

	get mounts(): JudgeMounts {
		return {
			testButtons: document.querySelector("#submit")?.parentElement ?? null,
			sideButtons: document.querySelector(".editor-buttons"),
			results: document.querySelector(".form-code-submit"),
		};
	}

	private get taskSelect(): HTMLSelectElement | null {
		return document.querySelector("#select-task");
	}

	private get languageSelect(): HTMLSelectElement | null {
		return document.querySelector("#select-lang select.current");
	}

	taskUri(): string {
		const task = this.taskSelect?.value;
		if (!task) return `${location.origin}${location.pathname}`;
		return `${location.origin}/contests/${pageGlobals().contestScreenName}/tasks/${task}`;
	}

	languages(): readonly JudgeLanguage[] {
		return languagesOf(this.languageSelect);
	}

	language(): JudgeLanguage | null {
		const id = this.languageSelect?.value;
		return this.languages().find((language) => language.id === id) ?? null;
	}

	onLanguageChange(listener: () => void): void {
		for (const select of document.querySelectorAll("#select-lang select")) this.bridge.onChange(select, listener);
	}

	onSourceChange(listener: () => void): void {
		const element = document.querySelector("#editor");
		const ace = pageGlobals().ace;
		if (ace && element) ace.edit(element).getSession().on("change", listener);
	}

	sourceCode(): string {
		const page = pageGlobals();
		const element = document.querySelector("#editor");
		if (!page.ace || !element) return page.getSourceCode?.() ?? "";
		const isPlainText = document.querySelector(".btn-toggle-editor")?.classList.contains("active");
		if (isPlainText) return document.querySelector<HTMLTextAreaElement>("#plain-textarea")?.value ?? "";
		return page.ace.edit(element).getValue();
	}

	setSourceCode(code: string): void {
		const element = document.querySelector("#editor");
		if (element) pageGlobals().ace?.edit(element).setValue(code);
		const textarea = document.querySelector<HTMLTextAreaElement>("#plain-textarea");
		if (textarea) textarea.value = code;
	}

	submit(): void {
		document.querySelector<HTMLElement>("#submit")?.click();
	}

	samples(): Promise<readonly SampleCase[]> {
		if (/^\/contests\/[^/]+\/tasks\//.test(location.pathname)) return Promise.resolve(parseSamples(document));
		const taskUri = this.taskUri();
		const cached = this.samplesByTask.get(taskUri);
		if (cached) return cached;
		const samples = this.fetchSamples(taskUri);
		this.samplesByTask.set(taskUri, samples);
		samples.catch(() => this.samplesByTask.delete(taskUri));
		return samples;
	}

	/** 提出ページにはサンプルがないので、問題ページから取得する。 */
	private async fetchSamples(taskUri: string): Promise<readonly SampleCase[]> {
		const response = await this.site.send({url: taskUri});
		if (response.status !== 200) throw new Error(`Failed to fetch ${taskUri}: ${response.status}`);
		const samples = parseSamples(new DOMParser().parseFromString(response.text, "text/html"));
		return samples.map((sample) => ({...sample, anchor: null}));
	}
}
