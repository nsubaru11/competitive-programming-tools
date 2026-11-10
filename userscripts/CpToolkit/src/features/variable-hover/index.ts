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
	readonly key: string;
	readonly elements: readonly Element[];
};

type Targets = {
	readonly variables: boolean;
	readonly numbers: boolean;
};

function isPlainLeaf(element: Element | null): element is Element {
	return element !== null && element.classList.contains("mord") && element.childElementCount === 0
		&& !element.classList.contains("mathnormal");
}

function isNumberLeaf(element: Element | null): boolean {
	return isPlainLeaf(element) && NUMBER_PATTERN.test(element.textContent ?? "");
}

/** 添字や指数の付く数字は、KaTeX が数字と添字を1つの要素で包むので、その要素を返す。 */
function containerOf(leaf: Element): Element {
	const parent = leaf.parentElement;
	const wrapped = parent?.classList.contains("mord") && parent.firstElementChild === leaf
		&& leaf.nextElementSibling?.classList.contains("msupsub");
	return wrapped && parent ? parent : leaf;
}

/** 隣の要素が数字(添字を包む要素なら、その中の数字)なら返す。 */
function numberLeafAt(element: Element | null): Element | null {
	if (!element || isNumberLeaf(element)) return element;
	const first = element.firstElementChild;
	return first && isNumberLeaf(first) && containerOf(first) === element ? first : null;
}

/**
 * 問題文の数値を集める。KaTeX は「998244353」や「2.5」を1文字ずつ別の要素に描き、
 * 「10^9」は「1」と、指数を包む要素の中の「0」に分けて描くので、隣り合う要素をつなげる。
 * 指数の付く数値は指数までを1つの数値とし、指数で数値を終える。
 */
function collectNumbers(statement: Element): Token[] {
	const tokens: Token[] = [];
	const consumed = new Set<Element>();
	for (const leaf of statement.querySelectorAll(LEAVES)) {
		if (consumed.has(leaf) || !isNumberLeaf(leaf)) continue;
		const elements = [leaf];
		let text = leaf.textContent ?? "";
		let unit = containerOf(leaf);
		while (unit === elements.at(-1)) {
			let next = unit.nextElementSibling;
			const point = isPlainLeaf(next) && next.textContent === "." ? next : null;
			if (point) next = point.nextElementSibling;
			const following = numberLeafAt(next);
			if (!following) break;
			if (point) {
				elements.push(point);
				text += ".";
			}
			elements.push(following);
			consumed.add(following);
			text += following.textContent ?? "";
			unit = containerOf(following);
		}
		const scripts = unit === elements.at(-1) ? null : unit.querySelector(":scope > .msupsub");
		if (scripts) {
			for (const inner of scripts.querySelectorAll(LEAVES)) consumed.add(inner);
			text += `^${(scripts.textContent ?? "").replace(/[\s​]/g, "")}`;
			elements[elements.length - 1] = unit;
		}
		tokens.push({key: `number:${text}`, elements});
	}
	return tokens;
}

function collectTokens(statement: Element, targets: Targets): Token[] {
	const tokens: Token[] = [];
	if (targets.variables) {
		for (const element of statement.querySelectorAll(VARIABLES)) {
			tokens.push({key: `variable:${element.textContent}`, elements: [element]});
		}
	}
	if (targets.numbers) tokens.push(...collectNumbers(statement));
	return tokens;
}

/** 1つの問題文の中で、同じ変数や数値を強調する。強調と固定を解除する関数を返す。 */
function watchStatement(statement: Element, targets: Targets, signal: AbortSignal): () => void {
	let pinned: string | null = null;
	let highlighted: readonly Element[] = [];

	const keyAt = (target: EventTarget | null): string | null => {
		if (!(target instanceof Element) || !target.closest(LEAVES)) return null;
		return collectTokens(statement, targets)
			.find(({elements}) => elements.some((element) => element.contains(target)))?.key ?? null;
	};

	const highlight = (key: string | null): void => {
		for (const element of highlighted) element.classList.remove(HIGHLIGHT_CLASS, PINNED_CLASS);
		highlighted = key === null ? [] : collectTokens(statement, targets)
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

	return () => {
		pinned = null;
		highlight(null);
	};
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
		// 問題の一括表示のページには、問題ごとに同じ ID の問題文がある
		const statements = [...document.querySelectorAll("#task-statement")];
		if (statements.length === 0 || (!options.variables && !options.numbers)) return () => undefined;

		const style = injectStyle(css);
		const controller = new AbortController();
		const {signal} = controller;
		const clearers = statements.map((statement) => watchStatement(statement, options, signal));
		const clearAll = (): void => {
			for (const clear of clearers) clear();
		};
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") clearAll();
		}, {signal});

		return () => {
			controller.abort();
			clearAll();
			style.remove();
		};
	},
});
