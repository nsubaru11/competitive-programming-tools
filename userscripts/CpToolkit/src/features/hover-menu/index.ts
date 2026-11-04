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
	options: {},
	live: true,
	start() {
		const controller = new AbortController();
		const {signal} = controller;
		for (const item of document.querySelectorAll(".nav > li:not(.pull-right)")) {
			item.addEventListener("mouseenter", () => item.classList.add(OPEN_CLASS), {signal});
			item.addEventListener("mouseleave", () => item.classList.remove(OPEN_CLASS), {signal});
		}
		return () => controller.abort();
	},
});
