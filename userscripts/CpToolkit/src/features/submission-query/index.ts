import {defineFeature} from "@application/feature/definition";

/** 提出ページの「すべての提出」と「自分の提出」のタブ。 */
const SUBMISSION_PAGE_TABS = "#main-container > div.row > div:nth-child(2) > ul > li > a";

export const submissionQuery = defineFeature({
	id: "submission-query",
	title: "submissionQuery.title",
	description: "submissionQuery.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:submissions"],
	phase: "ready",
	options: {},
	start() {
		for (const tab of [...document.querySelectorAll(SUBMISSION_PAGE_TABS)].slice(0, 2)) {
			const url = new URL(tab.getAttribute("href") ?? "", location.origin);
			url.search = location.search;
			tab.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
		}
	},
});
