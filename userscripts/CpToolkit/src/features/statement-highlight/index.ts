import {statementCatalog} from "@catalog/tables";
import {option} from "@domain/settings/option";
import {isPureNumber, splitLimitValue, splitNumbers, type TextSegment} from "@domain/statement/tokens";
import {defineFeature} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";
import css from "./statement-highlight.css" with {type: "text"};

const NUMBER_CLASS = "cp-number";
const TARGET_CLASS = "cp-statement-target";
const TIME_CLASS = "cp-time-limit";
const MEMORY_CLASS = "cp-memory-limit";
const SKIPPED_ANCESTORS = `.katex, var, .${NUMBER_CLASS}, .${TIME_CLASS}, .${MEMORY_CLASS}`;
const HIGHLIGHT_DELAY_MS = 100;
const SKIPPED_TAGS: ReadonlySet<string> = new Set(statementCatalog.skipTags);

/**
 * 問題文は文字のノードが数千個あるので、1個あたりの処理を軽くする。
 * TreeWalker のフィルターはノードごとの呼び出しが重いので使わず、文字列の判定で絞ってから祖先を調べる。
 */
function collectTextNodes(root: Node, accepts: (text: string) => boolean): Text[] {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	while (walker.nextNode()) {
		const node = walker.currentNode;
		if (!(node instanceof Text) || !accepts(node.data)) continue;
		const parent = node.parentElement;
		if (!parent || SKIPPED_TAGS.has(parent.tagName) || parent.closest(SKIPPED_ANCESTORS)) continue;
		nodes.push(node);
	}
	return nodes;
}

function replaceWithSegments(node: Text, segments: readonly TextSegment[], className: string): void {
	node.replaceWith(...segments.map(({text, emphasized}) => (emphasized ? h("span", {
		className,
		textContent: text,
	}) : text)));
}

function markTargetSections(): void {
	for (const section of document.querySelectorAll("#task-statement section")) {
		const title = section.querySelector("h3")?.textContent ?? "";
		const isTarget = statementCatalog.targetHeadings.some((heading) => title.includes(heading));
		if (isTarget) section.classList.add(TARGET_CLASS);
	}
}

function highlightNumbers(): void {
	for (const scope of document.querySelectorAll(`.${TARGET_CLASS}`)) {
		for (const element of scope.querySelectorAll(".katex .mord, .katex .text")) {
			if (!element.classList.contains("mathnormal") && isPureNumber(element.textContent ?? "")) {
				element.classList.add(NUMBER_CLASS);
			}
		}
		for (const node of collectTextNodes(scope, (text) => /\d/.test(text))) {
			replaceWithSegments(node, splitNumbers(node.data), NUMBER_CLASS);
		}
	}
}

function emphasizeLimit(
	root: Element,
	keywords: readonly string[],
	className: string,
	ignoredValue: number | undefined,
): void {
	for (const keyword of keywords) {
		for (const node of collectTextNodes(root, (text) => text.includes(keyword))) {
			const segments = splitLimitValue(node.data, keyword, ignoredValue);
			if (segments) replaceWithSegments(node, segments, className);
		}
	}
}

function emphasizeLimits(always: boolean): void {
	const root = document.getElementById("main-container");
	if (!root) return;
	const {timeLimitKeywords, memoryLimitKeywords, commonTimeLimit, commonMemoryLimit} = statementCatalog;
	emphasizeLimit(root, timeLimitKeywords, TIME_CLASS, always ? undefined : commonTimeLimit);
	emphasizeLimit(root, memoryLimitKeywords, MEMORY_CLASS, always ? undefined : commonMemoryLimit);
}

export const statementHighlight = defineFeature({
	id: "statement-highlight",
	title: "statementHighlight.title",
	description: "statementHighlight.description",
	category: "category.statement",
	defaultEnabled: true,
	routes: ["atcoder:task"],
	phase: "ready",
	options: {
		numberColor: option.color("#0033b3", "statementHighlight.numberColor"),
		variableColor: option.color("#9e2927", "statementHighlight.variableColor"),
		timeColor: option.color("#b3542a", "statementHighlight.timeColor"),
		memoryColor: option.color("#1d643b", "statementHighlight.memoryColor"),
		alwaysEmphasizeLimits: option.boolean(false, "statementHighlight.alwaysEmphasizeLimits"),
	},
	live: true,
	start({options}) {
		const style = injectStyle(`:root {
	--cp-number-color: ${options.numberColor};
	--cp-variable-color: ${options.variableColor};
	--cp-time-color: ${options.timeColor};
	--cp-memory-color: ${options.memoryColor};
}
${css}`);

		// KaTeX の描画で問題文が書き換わるので、変更のたびに適用し直す
		let timer: ReturnType<typeof setTimeout> | undefined;
		const schedule = (): void => {
			if (timer !== undefined) return;
			timer = setTimeout(() => {
				timer = undefined;
				markTargetSections();
				highlightNumbers();
				emphasizeLimits(options.alwaysEmphasizeLimits);
				// 強調で加えた変更の通知を捨て、同じ走査をもう一度行わないようにする
				observer.takeRecords();
			}, HIGHLIGHT_DELAY_MS);
		};
		schedule();
		const observer = new MutationObserver(schedule);
		observer.observe(document.getElementById("task-statement") ?? document.body, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		return () => {
			observer.disconnect();
			clearTimeout(timer);
			style.remove();
		};
	},
});
