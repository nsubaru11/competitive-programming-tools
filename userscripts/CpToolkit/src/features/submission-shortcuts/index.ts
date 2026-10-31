import {buildAtCoderSubmissionsQuery, parseAtCoderTaskUrl} from "@atcoder-tools/shared";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

export const submissionShortcuts = defineFeature({
	id: "submission-shortcuts",
	title: "submissionShortcuts.title",
	description: "submissionShortcuts.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:task"],
	phase: "ready",
	options: {
		language: option.text("", "submissionShortcuts.language"),
	},
	live: true,
	start({options, translate}) {
		const task = parseAtCoderTaskUrl(location.href);
		const title = document.querySelector(".h2");
		if (!task || !title) return () => undefined;

		const createLink = (label: string, orderBy: string): HTMLAnchorElement => {
			const query = buildAtCoderSubmissionsQuery({
				language: options.language || undefined,
				status: "AC",
				orderBy,
				task: task.taskId,
			});
			const link = h("a", {
				className: "btn btn-default btn-sm",
				href: `/contests/${task.contestId}/submissions?${query}`,
				textContent: label,
			});
			link.style.marginLeft = "10px";
			return link;
		};

		const wrapper = h(
			"span",
			{},
			createLink(translate("submissionShortcuts.fastest"), "time_consumption"),
			createLink(translate("submissionShortcuts.shortest"), "source_length"),
		);
		title.append(wrapper);
		return () => wrapper.remove();
	},
});
