import TurndownService from "turndown";
import {gfm} from "turndown-plugin-gfm";
import type {StatementConverter} from "@application/ports/services";

const isElement = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;

/** 数式の元の TeX を取り出す。KaTeX の描画前後のどちらでも読める。 */
function texOf(element: Element, fallback: string): string {
	const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
	const attribute = element.getAttribute("data-tex") ?? element.getAttribute("aria-label");
	const tex = annotation?.textContent ?? attribute ?? fallback;
	return `$${tex.trim()}$`;
}

function createTurndown(): TurndownService {
	const service = new TurndownService({headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-"});
	service.use(gfm);
	service.addRule("math", {
		filter: "var",
		replacement: (content, node) => (isElement(node) ? texOf(node, content) : content),
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
	if (tag === "VAR") return texOf(node, node.textContent ?? "");
	if (tag === "CODE") return `\`${node.textContent ?? ""}\``;
	if (tag === "PRE") return `\n${(node.textContent ?? "").trim()}\n`;
	const inner = [...node.childNodes].map(plainTextOf).join("");
	if (tag === "H3") return `【${inner.trim()}】\n`;
	if (tag === "LI") return `\n- ${inner.trim()}\n`;
	return BLOCK_TAGS.has(tag) ? `\n${inner}\n` : inner;
}

export class TurndownStatementConverter implements StatementConverter {
	private readonly turndown = createTurndown();

	toMarkdown(html: string): string {
		return this.turndown.turndown(html);
	}

	toPlainText(html: string): string {
		const template = document.createElement("template");
		template.innerHTML = html;
		return [...template.content.childNodes].map(plainTextOf).join("").replace(/\n{3,}/g, "\n\n").trim();
	}
}
