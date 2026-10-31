import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {injectStyle} from "@ui/element";
import css from "./wide-layout.css" with {type: "text"};

export const wideLayout = defineFeature({
	id: "wide-layout",
	title: "wideLayout.title",
	description: "wideLayout.description",
	category: "category.layout",
	defaultEnabled: true,
	routes: ["atcoder:page"],
	phase: "start",
	options: {
		width: option.text("50%", "wideLayout.width", {validate: (value) => CSS.supports("width", value)}),
	},
	live: true,
	start({options}) {
		const style = injectStyle(`:root {--cp-main-width: ${options.width};}\n${css}`);
		return () => style.remove();
	},
});
