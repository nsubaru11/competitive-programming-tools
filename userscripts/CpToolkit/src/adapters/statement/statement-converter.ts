import TurndownService from "turndown";
import {gfm} from "turndown-plugin-gfm";
import type {StatementConverter} from "@application/ports/services";

const isElement = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;

/** 数式の元の TeX を取り出す。KaTeX の描画前後のどちらでも読める。 */
function texOf(element: Element, fallback: string): string {
	const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
	const attribute = element.getAttribute("data-tex") ?? element.getAttribute("aria-label");
	return (annotation?.textContent ?? attribute ?? fallback).trim();
}

function inlineMath(element: Element, fallback: string): string {
	return `$${texOf(element, fallback)}$`;
}

function displayMath(element: Element): string {
	return `$$\n${texOf(element, "")}\n$$`;
}

/** 別行立ての数式と、var の外にある数式は、KaTeX の描画結果だけが残っている。 */
function hasClass(node: Node, className: string): boolean {
	return isElement(node) && node.classList.contains(className);
}

function createTurndown(): TurndownService {
	const service = new TurndownService({headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-"});
	service.use(gfm);
	service.addRule("math", {
		filter: (node) => node.nodeName === "VAR" || hasClass(node, "katex"),
		replacement: (content, node) => (isElement(node) ? inlineMath(node, content) : content),
	});
	service.addRule("displayMath", {
		filter: (node) => hasClass(node, "katex-display"),
		replacement: (content, node) => (isElement(node) ? `\n\n${displayMath(node)}\n\n` : content),
	});
	service.addRule("pre", {
		filter: "pre",
		replacement: (content) => `\n\`\`\`text\n${content.trim()}\n\`\`\`\n`,
	});
	service.addRule("listItem", {
		filter: "li",
		replacement(content, node, options) {
			const body = content.replace(/^\n+/, "").replace(/\n+$/, "\n").replace(/\n/gm, "\n  ");
			const parent = node.parentElement;
			let prefix = `${options.bulletListMarker} `;
			if (parent?.nodeName === "OL" && isElement(node)) {
				const start = Number(parent.getAttribute("start") ?? 1);
				prefix = `${start + [...parent.children].indexOf(node)}. `;
			}
			return prefix + body + (node.nextSibling && !body.endsWith("\n") ? "\n" : "");
		},
	});
	return service;
}

const BLOCK_TAGS = new Set(["P", "DIV", "UL", "OL", "SECTION"]);
const IGNORED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);

function plainTextOf(node: Node): string {
	if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
	if (!isElement(node)) return "";
	const tag = node.tagName;
	if (IGNORED_TAGS.has(tag)) return "";
	if (tag === "BR") return "\n";
	if (hasClass(node, "katex-display")) return `\n${displayMath(node)}\n`;
	if (tag === "VAR" || hasClass(node, "katex")) return inlineMath(node, node.textContent ?? "");
	if (tag === "CODE") return `\`${node.textContent ?? ""}\``;
	if (tag === "PRE") return `\n${(node.textContent ?? "").trim()}\n`;
	const inner = [...node.childNodes].map(plainTextOf).join("");
	if (tag === "H3") return `【${inner.trim()}】\n`;
	if (tag === "LI") return `\n- ${inner.trim()}\n`;
	return BLOCK_TAGS.has(tag) ? `\n${inner}\n` : inner;
}

function toHtmlElement(target: object): HTMLElement {
	if (target instanceof HTMLElement) return target;
	throw new TypeError("A page element is required.");
}

/** HTML の文字列を経由せず、要素をそのまま変換する。turndown は要素を複製してから処理する。 */
export class TurndownStatementConverter implements StatementConverter {
	private readonly turndown = createTurndown();

	toMarkdown(element: object): string {
		return this.turndown.turndown(toHtmlElement(element));
	}

	toPlainText(element: object): string {
		return [...toHtmlElement(element).childNodes].map(plainTextOf).join("").replace(/\n{3,}/g, "\n\n").trim();
	}
}
