import {defineFeature} from "@application/feature/definition";
import type {PageBridge} from "@application/ports/page-bridge";

/** 提出ページの「すべての提出」と「自分の提出」のタブ。 */
const SUBMISSION_PAGE_TABS = "#main-container > div.row > div:nth-child(2) > ul > li > a";
/** 提出一覧の検索欄にある言語の選択欄。 */
const LANGUAGE_SELECT = 'select[name="f.LanguageName"]';

/** 検索は大小文字を区別しないが、サイトの言語欄の選択は完全一致なので補う。 */
function restoreLanguageSelection(services: {readonly page: PageBridge}): () => void {
	const language = new URLSearchParams(location.search).get("f.LanguageName");
	const select = document.querySelector<HTMLSelectElement>(LANGUAGE_SELECT);
	if (!language || !select || select.value) return () => undefined;
	const option = [...select.options].find(({value}) => value.toLowerCase() === language.toLowerCase());
	if (!option) return () => undefined;
	const previous = select.value;
	select.value = option.value;
	services.page.triggerChange(select);
	return () => {
		// ユーザーが別の言語を選んだ場合は、その選択を残す。
		if (select.value !== option.value) return;
		select.value = previous;
		services.page.triggerChange(select);
	};
}

export const submissionQuery = defineFeature({
	id: "submission-query",
	title: "submissionQuery.title",
	description: "submissionQuery.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:submissions"],
	phase: "ready",
	options: {},
	live: true,
	start(services) {
		const tabs = [...document.querySelectorAll(SUBMISSION_PAGE_TABS)].slice(0, 2).map((tab) => {
			const original = tab.getAttribute("href");
			const url = new URL(original ?? "", location.origin);
			url.search = location.search;
			tab.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
			return {tab, original};
		});
		const restoreLanguage = restoreLanguageSelection(services);
		return () => {
			restoreLanguage();
			for (const {tab, original} of tabs) {
				if (original === null) tab.removeAttribute("href");
				else tab.setAttribute("href", original);
			}
		};
	},
});
