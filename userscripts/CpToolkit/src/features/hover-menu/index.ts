import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";

const OPEN_CLASS = "open";

export const hoverMenu = defineFeature({
	id: "hover-menu",
	title: "hoverMenu.title",
	description: "hoverMenu.description",
	category: "category.layout",
	defaultEnabled: true,
	routes: ["atcoder:page"],
	phase: "ready",
	options: {
		openStatementDetails: option.boolean(true, "hoverMenu.openStatementDetails"),
	},
	live: true,
	start({options}) {
		const controller = new AbortController();
		const {signal} = controller;
		for (const item of document.querySelectorAll(".nav > li:not(.pull-right)")) {
			item.addEventListener("mouseenter", () => item.classList.add(OPEN_CLASS), {signal});
			item.addEventListener("mouseleave", () => item.classList.remove(OPEN_CLASS), {signal});
		}
		if (options.openStatementDetails) {
			for (const details of document.querySelectorAll<HTMLDetailsElement>("#task-statement details")) {
				details.open = true;
			}
		}
		return () => controller.abort();
	},
});
