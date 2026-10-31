import {paizaLanguageSelect} from "@catalog/judges";
import {isLanguageOption} from "@domain/execution/language";
import {option} from "@domain/settings/option";
import {defineFeature, type FeatureServices} from "@application/feature/definition";

const RETRY_COUNT = 30;
const RETRY_INTERVAL_MS = 150;
const AFTER_SELECTION_DELAY_MS = 600;
const EDITOR_TIMEOUT_MS = 8000;
const UNLOCK_DURATION_MS = 4000;
const UNLOCK_INTERVAL_MS = 120;
const OBSERVE_DURATION_MS = 5000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function findLanguageSelect(): HTMLSelectElement | null {
	for (const selector of paizaLanguageSelect.selects) {
		const select = document.querySelector<HTMLSelectElement>(selector);
		if (select) return select;
	}
	return null;
}

function applyOption(select: HTMLSelectElement, value: string, page: FeatureServices["page"]): void {
	select.value = value;
	page.triggerChange(select);
	for (const id of paizaLanguageSelect.hiddenFields) {
		const field = document.getElementById(id);
		if (!(field instanceof HTMLInputElement)) continue;
		field.value = value;
		field.dispatchEvent(new Event("change", {bubbles: true}));
	}
}

function selectLanguage(target: string, page: FeatureServices["page"]): boolean {
	const select = findLanguageSelect();
	if (!select || select.disabled) return false;
	const option = [...select.options].find(({text}) => isLanguageOption(text, target));
	if (!option) return false;
	// サイトの初期化を動かすため、未選択を経由してから選ぶ
	const placeholder = [...select.options].find(({value}) => value === "");
	if (placeholder) applyOption(select, placeholder.value, page);
	applyOption(select, option.value, page);
	return select.value === option.value;
}

/** 言語を切り替えた直後に読み取り専用のまま残ることがあるので解除する。 */
function unlockTextInputs(): void {
	for (const input of document.querySelectorAll<HTMLTextAreaElement>(".ace_text-input")) {
		input.removeAttribute("readonly");
		input.disabled = false;
		if (input.tabIndex < 0) input.tabIndex = 0;
	}
}

async function unlockEditor({editors, judge}: FeatureServices): Promise<void> {
	const target = judge?.submission;
	const editor = target ? await editors.locate(target, EDITOR_TIMEOUT_MS) : null;
	const deadline = Date.now() + UNLOCK_DURATION_MS;
	while (editor?.isReadOnly() && Date.now() < deadline) {
		editor.setWritable();
		unlockTextInputs();
		await sleep(UNLOCK_INTERVAL_MS);
	}
}

export const paizaLanguage = defineFeature({
	id: "paiza-language",
	title: "paizaLanguage.title",
	description: "paizaLanguage.description",
	category: "category.execution",
	defaultEnabled: true,
	routes: ["paiza:page"],
	phase: "ready",
	options: {
		language: option.text("c++", "paizaLanguage.language"),
	},
	async start(context) {
		const target = context.options.language.toLowerCase();
		for (let attempt = 0; attempt < RETRY_COUNT; attempt++) {
			if (selectLanguage(target, context.page)) break;
			await sleep(RETRY_INTERVAL_MS);
		}
		await sleep(AFTER_SELECTION_DELAY_MS);
		await unlockEditor(context);

		// 後から読み込まれる選択欄に対応する
		const observer = new MutationObserver(() => {
			if (!selectLanguage(target, context.page)) return;
			observer.disconnect();
			void sleep(AFTER_SELECTION_DELAY_MS).then(() => unlockEditor(context));
		});
		observer.observe(document.body, {childList: true, subtree: true});
		setTimeout(() => observer.disconnect(), OBSERVE_DURATION_MS);
	},
});
