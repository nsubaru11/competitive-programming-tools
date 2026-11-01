import {defineFeature} from "@application/feature/definition";
import {injectStyle} from "@ui/element";
import css from "./variable-hover.css" with {type: "text"};

const SYMBOLS = ".katex-html .mathnormal";
const HIGHLIGHT_CLASS = "cp-variable";
const PINNED_CLASS = "cp-variable-pinned";

function symbolAt(target: EventTarget | null): Element | null {
	return target instanceof Element ? target.closest(SYMBOLS) : null;
}

export const variableHover = defineFeature({
	id: "variable-hover",
	title: "variableHover.title",
	description: "variableHover.description",
	category: "category.statement",
	defaultEnabled: true,
	routes: ["atcoder:task", "atcoder:tasksPrint"],
	phase: "ready",
	options: {},
	live: true,
	start() {
		const statement = document.querySelector("#task-statement");
		if (!statement) return () => undefined;

		const style = injectStyle(css);
		const controller = new AbortController();
		const {signal} = controller;
		let pinned: string | null = null;
		let highlighted: readonly Element[] = [];

		const highlight = (symbol: string | null): void => {
			for (const element of highlighted) element.classList.remove(HIGHLIGHT_CLASS, PINNED_CLASS);
			highlighted = [...statement.querySelectorAll(SYMBOLS)].filter((element) => element.textContent === symbol);
			const names = pinned === null ? [HIGHLIGHT_CLASS] : [HIGHLIGHT_CLASS, PINNED_CLASS];
			for (const element of highlighted) element.classList.add(...names);
		};

		statement.addEventListener("mouseover", (event) => {
			const symbol = symbolAt(event.target);
			if (symbol && pinned === null) highlight(symbol.textContent);
		}, {signal});
		statement.addEventListener("mouseout", (event) => {
			if (symbolAt(event.target) && pinned === null) highlight(null);
		}, {signal});
		statement.addEventListener("click", (event) => {
			const symbol = symbolAt(event.target)?.textContent ?? null;
			if (symbol === null) return;
			pinned = symbol === pinned ? null : symbol;
			highlight(symbol);
		}, {signal});
		document.addEventListener("keydown", (event) => {
			if (event.key !== "Escape") return;
			pinned = null;
			highlight(null);
		}, {signal});

		return () => {
			controller.abort();
			pinned = null;
			highlight(null);
			style.remove();
		};
	},
});
