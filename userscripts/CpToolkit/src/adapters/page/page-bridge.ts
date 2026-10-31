import type {PageBridge} from "@application/ports/page-bridge";
import {pageGlobals} from "./globals";

const MATH_OPTIONS = {
	delimiters: [
		{left: "$$", right: "$$", display: true},
		{left: "$", right: "$", display: false},
		{left: "\\(", right: "\\)", display: false},
		{left: "\\[", right: "\\]", display: true},
	],
	ignoredTags: ["script", "noscript", "style", "textarea", "code", "option"],
	ignoredClasses: ["prettyprint", "source-code-for-copy"],
	throwOnError: false,
};

function toElement(target: object): Element {
	if (target instanceof Element) return target;
	throw new TypeError("A page element is required.");
}

export class UnsafeWindowPageBridge implements PageBridge {
	onChange(element: object, listener: () => void): void {
		const jQuery = pageGlobals().jQuery;
		if (jQuery) jQuery(element).on("change", listener);
		else toElement(element).addEventListener("change", listener);
	}

	triggerChange(element: object): void {
		const target = toElement(element);
		target.dispatchEvent(new Event("input", {bubbles: true}));
		target.dispatchEvent(new Event("change", {bubbles: true}));
		pageGlobals().jQuery?.(element).trigger("change");
	}

	renderMath(target: object): void {
		pageGlobals().renderMathInElement?.(toElement(target), MATH_OPTIONS);
	}

	highlightCode(): void {
		pageGlobals().PR?.prettyPrint();
	}
}
