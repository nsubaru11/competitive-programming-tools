import {buildAtCoderSubmissionsQuery, parseAtCoderTaskUrl} from "@atcoder-tools/shared";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";

const SUBMISSION_PATH_PATTERN = /\/submissions(?:\/me)?\/?$/;
/** 提出ページの「すべての提出」と「自分の提出」のタブ。 */
const SUBMISSION_PAGE_TABS = "#main-container > div.row > div:nth-child(2) > ul > li > a";

function applyDefaultQuery(query: string): void {
	for (const link of document.querySelectorAll("#contest-nav-tabs a")) {
		const href = link.getAttribute("href");
		if (!href) continue;
		const url = new URL(href, location.origin);
		if (!SUBMISSION_PATH_PATTERN.test(url.pathname)) continue;
		url.search = query;
		link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
	}
}

function keepSearchQuery(): void {
	for (const tab of [...document.querySelectorAll(SUBMISSION_PAGE_TABS)].slice(0, 2)) {
		const url = new URL(tab.getAttribute("href") ?? "", location.origin);
		url.search = location.search;
		tab.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
	}
}

export const submissionDefaults = defineFeature({
	id: "submission-defaults",
	title: "submissionDefaults.title",
	description: "submissionDefaults.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {
		language: option.text("Java", "submissionDefaults.language"),
		status: option.text("AC", "submissionDefaults.status"),
		orderBy: option.select("time_consumption", "submissionDefaults.orderBy", [
			{value: "time_consumption", label: "submissionDefaults.orderTime"},
			{value: "memory_consumption", label: "submissionDefaults.orderMemory"},
			{value: "source_length", label: "submissionDefaults.orderLength"},
			{value: "score", label: "submissionDefaults.orderScore"},
		]),
		taskFilter: option.boolean(true, "submissionDefaults.taskFilter"),
		keepQuery: option.boolean(true, "submissionDefaults.keepQuery"),
	},
	start({options, isOnRoute}) {
		const task = options.taskFilter ? parseAtCoderTaskUrl(location.href)?.taskId : undefined;
		applyDefaultQuery(buildAtCoderSubmissionsQuery({
			language: options.language,
			status: options.status,
			orderBy: options.orderBy,
			task,
		}));
		if (options.keepQuery && isOnRoute("atcoder:submissions")) keepSearchQuery();
	},
});
