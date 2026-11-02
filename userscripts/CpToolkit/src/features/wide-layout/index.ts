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
		width: option.text("", "wideLayout.width", {validate: (value) => value === "" || CSS.supports("width", value)}),
	},
	live: true,
	start({options}) {
		// 空欄ならページ本来の幅のままにする
		if (options.width === "") return () => {};
		const style = injectStyle(`:root {--cp-main-width: ${options.width};}\n${css}`);
		return () => style.remove();
	},
});
