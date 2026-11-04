import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {injectStyle} from "@ui/element";
import css from "./variable-hover.css" with {type: "text"};

const VARIABLES = ".katex-html .mathnormal";
const LEAVES = ".katex-html .mord";
const NUMBER_PATTERN = /^\d+(\.\d+)?$/;
const HIGHLIGHT_CLASS = "cp-variable";
const PINNED_CLASS = "cp-variable-pinned";

/** 同じ値として一緒に強調する要素のまとまり。 */
type Token = {
	key: string;
	readonly elements: Element[];
};

type Targets = {
	readonly variables: boolean;
	readonly numbers: boolean;
};

function isNumberLeaf(element: Element): boolean {
	return element.childElementCount === 0 && !element.classList.contains("mathnormal")
		&& NUMBER_PATTERN.test(element.textContent ?? "");
}

/** 添字や指数の付く数字は、KaTeX が数字と添字を1つの要素で包むので、その要素を返す。 */
function containerOf(leaf: Element): Element {
	const parent = leaf.parentElement;
	const wrapped = parent?.classList.contains("mord") && parent.firstElementChild === leaf
		&& leaf.nextElementSibling?.classList.contains("msupsub");
	return wrapped && parent ? parent : leaf;
}

/**
 * 問題文の変数と数値を集める。KaTeX は隣り合う数字を1つの要素にまとめるが、
 * 「10^5」は「1」と「0^5」に分けて描くので、添字の付く数字だけは直前の数字とまとめる。
 */
function collectTokens(statement: Element, targets: Targets): Token[] {
	const tokens: Token[] = [];
	if (targets.variables) {
		for (const element of statement.querySelectorAll(VARIABLES)) {
			tokens.push({key: `variable:${element.textContent}`, elements: [element]});
		}
	}
	if (targets.numbers) {
		let last: {readonly token: Token; readonly container: Element} | null = null;
		for (const leaf of [...statement.querySelectorAll(LEAVES)].filter(isNumberLeaf)) {
			const container = containerOf(leaf);
			// 前の数字に添字が付いていれば、そこで数値は終わる
			const continues = last !== null && container !== leaf
				&& last.container === last.token.elements.at(-1)
				&& last.container.nextElementSibling === container;
			if (last && continues) {
				last.token.key += leaf.textContent;
				last.token.elements.push(leaf);
			} else {
				const token = {key: `number:${leaf.textContent}`, elements: [leaf]};
				tokens.push(token);
				last = {token, container};
			}
		}
	}
	return tokens;
}

export const variableHover = defineFeature({
	id: "variable-hover",
	title: "variableHover.title",
	description: "variableHover.description",
	category: "category.statement",
	defaultEnabled: true,
	routes: ["atcoder:task", "atcoder:tasksPrint"],
	phase: "ready",
	options: {
		variables: option.boolean(true, "variableHover.variables"),
		numbers: option.boolean(true, "variableHover.numbers"),
	},
	live: true,
	start({options}) {
		const statement = document.querySelector("#task-statement");
		if (!statement || (!options.variables && !options.numbers)) return () => undefined;

		const style = injectStyle(css);
		const controller = new AbortController();
		const {signal} = controller;
		let pinned: string | null = null;
		let highlighted: readonly Element[] = [];

		const keyAt = (target: EventTarget | null): string | null => {
			if (!(target instanceof Element) || !target.closest(LEAVES)) return null;
			return collectTokens(statement, options)
				.find(({elements}) => elements.some((element) => element.contains(target)))?.key ?? null;
		};

		const highlight = (key: string | null): void => {
			for (const element of highlighted) element.classList.remove(HIGHLIGHT_CLASS, PINNED_CLASS);
			highlighted = key === null ? [] : collectTokens(statement, options)
				.filter((token) => token.key === key)
				.flatMap(({elements}) => elements);
			const names = pinned === null ? [HIGHLIGHT_CLASS] : [HIGHLIGHT_CLASS, PINNED_CLASS];
			for (const element of highlighted) element.classList.add(...names);
		};

		statement.addEventListener("mouseover", (event) => {
			const key = keyAt(event.target);
			if (key !== null && pinned === null) highlight(key);
		}, {signal});
		statement.addEventListener("mouseout", (event) => {
			if (keyAt(event.target) !== null && pinned === null) highlight(null);
		}, {signal});
		statement.addEventListener("click", (event) => {
			const key = keyAt(event.target);
			if (key === null) return;
			pinned = key === pinned ? null : key;
			highlight(key);
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
