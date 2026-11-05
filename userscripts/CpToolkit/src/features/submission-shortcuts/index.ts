import {buildAtCoderSubmissionsQuery, parseAtCoderTaskUrl} from "@atcoder-tools/shared";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

/** ボタンにできる並び順。表示するかどうかは詳細設定で選ぶ。 */
const ORDERS = [
	{option: "byTime", orderBy: "time_consumption", label: "submissionShortcuts.time"},
	{option: "byLength", orderBy: "source_length", label: "submissionShortcuts.length"},
	{option: "byCreated", orderBy: "created", label: "submissionShortcuts.created"},
	{option: "byMemory", orderBy: "memory_consumption", label: "submissionShortcuts.memory"},
] as const;

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
		byTime: option.boolean(true, "submissionShortcuts.byTime"),
		byLength: option.boolean(true, "submissionShortcuts.byLength"),
		byCreated: option.boolean(true, "submissionShortcuts.byCreated"),
		byMemory: option.boolean(true, "submissionShortcuts.byMemory"),
	},
	live: true,
	start({options, page, translate}) {
		const task = parseAtCoderTaskUrl(location.href);
		const title = document.querySelector(".h2");
		// コンテスト中は他の人の提出を見られないので、終わるまで出さない
		const period = page.contestPeriod();
		if (period && page.serverNow() < period.endMs) return () => undefined;
		const orders = ORDERS.filter((order) => options[order.option]);
		if (!task || !title || orders.length === 0) return () => undefined;

		const createLink = (label: string, orderBy: string): HTMLAnchorElement => {
			const query = buildAtCoderSubmissionsQuery({
				language: options.language || undefined,
				status: "AC",
				orderBy,
				task: task.taskId,
			});
			return h("a", {
				className: "btn btn-default btn-sm",
				href: `/contests/${task.contestId}/submissions?${query}`,
				textContent: label,
			});
		};

		const label = h("span", {textContent: `${translate("submissionShortcuts.label")}:`});
		label.style.marginRight = "6px";
		const wrapper = h(
			"span",
			{className: "cp-title-control"},
			label,
			h(
				"span",
				{className: "btn-group"},
				...orders.map(({orderBy, label}) => createLink(translate(label), orderBy)),
			),
		);
		Object.assign(wrapper.style, {
			marginLeft: "16px",
			fontSize: "14px",
			fontWeight: "normal",
			verticalAlign: "middle",
			whiteSpace: "nowrap",
		});
		title.append(wrapper);
		return () => wrapper.remove();
	},
});
