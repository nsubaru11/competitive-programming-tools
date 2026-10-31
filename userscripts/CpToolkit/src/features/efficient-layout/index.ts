import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import type {Translate} from "@catalog/messages";
import {h, injectStyle} from "@ui/element";
import css from "./efficient-layout.css" with {type: "text"};

function createDetails(summary: string): HTMLDetailsElement {
	return h("details", {open: true}, h("summary", {textContent: summary}));
}

function createSampleRow(parent: Element, translate: Translate): HTMLElement {
	const existing = parent.querySelector<HTMLElement>(".cp-samples-row");
	if (existing) return existing;
	const container = createDetails(translate("efficientLayout.samples"));
	container.className = "cp-samples-container";
	const row = h("div", {className: "cp-samples-row"});
	container.append(row);
	parent.append(container);
	return row;
}

/** 入出力形式より後の項目がサンプル。入力と出力の組なら2個ずつまとめる。 */
function arrangeSamples(ioStyle: Element, translate: Translate): void {
	const parent = ioStyle.parentElement;
	if (!parent) return;
	const siblings = [...parent.children];
	const following = siblings.slice(siblings.indexOf(ioStyle) + 1);
	for (const element of following) {
		if (element.tagName === "HR") element.remove();
	}
	const samples = following.filter((element) => element.classList.contains("part"));
	const groupSize = samples.length % 2 === 0 ? 2 : 1;
	for (let index = 0; index < samples.length; index += groupSize) {
		const group = samples.slice(index, index + groupSize);
		createSampleRow(parent, translate).append(...(groupSize === 2 ? [h("div", {}, ...group)] : group));
	}
}

export const efficientLayout = defineFeature({
	id: "efficient-layout",
	title: "efficientLayout.title",
	description: "efficientLayout.description",
	category: "category.statement",
	defaultEnabled: false,
	routes: ["atcoder:task", "atcoder:tasksPrint"],
	phase: "ready",
	options: {
		sampleWidth: option.number(60, "efficientLayout.sampleWidth", {min: 10, max: 100}),
	},
	start({options, translate}) {
		for (const ioStyle of document.querySelectorAll(".io-style")) {
			arrangeSamples(ioStyle, translate);
			const details = createDetails(translate("efficientLayout.ioFormat"));
			ioStyle.before(details);
			details.append(ioStyle);
		}
		injectStyle(`:root {--cp-sample-width: ${options.sampleWidth}vw;}\n${css}`);
		for (const row of document.querySelectorAll<HTMLElement>(".cp-samples-row")) {
			row.style.width = `calc(var(--cp-sample-width) * ${row.children.length})`;
		}
	},
});
