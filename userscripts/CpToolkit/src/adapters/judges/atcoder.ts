import {atcoderSampleSelectors} from "@catalog/judges";
import type {JudgeMounts, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import type {HttpClient} from "@application/ports/services";
import {pageGlobals} from "@adapters/page/globals";
import {JudgeSiteBase} from "./site-base";

function pairs<T>(items: readonly T[]): Array<[T, T]> {
	return items.flatMap((item, index): Array<[T, T]> => {
		const next = items[index + 1];
		return index % 2 === 0 && next !== undefined ? [[item, next]] : [];
	});
}

/** コンテストにより書式が違うので、サンプルが見つかるセレクタまで順に試す。 */
function parseSamples(page: Document): SampleCase[] {
	for (const {selector, container, insideIoStyle} of atcoderSampleSelectors) {
		const elements = [...page.querySelectorAll(selector)].filter((element) => {
			if (insideIoStyle) return element.childElementCount === 0;
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

export class AtCoderSite extends JudgeSiteBase {
	readonly id = "atcoder";
	private readonly samplesByTask = new Map<string, Promise<readonly SampleCase[]>>();

	constructor(bridge: PageBridge, private readonly site: HttpClient) {
		super(bridge);
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

	protected get languageSelect(): HTMLSelectElement | null {
		return document.querySelector("#select-lang select.current");
	}

	override taskUri(): string {
		const task = this.taskSelect?.value;
		if (!task) return `${location.origin}${location.pathname}`;
		return `${location.origin}/contests/${pageGlobals().contestScreenName}/tasks/${task}`;
	}

	override onLanguageChange(listener: () => void): void {
		for (const select of document.querySelectorAll("#select-lang select")) this.bridge.onChange(select, listener);
	}

	override onSourceChange(listener: () => void): void {
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
		if (element) pageGlobals().ace?.edit(element).setValue(code, -1);
		const textarea = document.querySelector<HTMLTextAreaElement>("#plain-textarea");
		if (textarea) textarea.value = code;
	}

	submit(): void {
		document.querySelector<HTMLElement>("#submit")?.click();
	}

	/** Run ボタンを置くと問題文の形が変わるので、問題ごとに最初の結果を使い続ける。 */
	samples(): Promise<readonly SampleCase[]> {
		const taskUri = this.taskUri();
		const cached = this.samplesByTask.get(taskUri);
		if (cached) return cached;
		const isTaskPage = /^\/contests\/[^/]+\/tasks\//.test(location.pathname);
		const samples = isTaskPage ? Promise.resolve(parseSamples(document)) : this.fetchSamples(taskUri);
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
