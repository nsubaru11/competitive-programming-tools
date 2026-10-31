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

export class UnsafeWindowPageBridge implements PageBridge {
	onChange(element: object, listener: () => void): void {
		const jQuery = pageGlobals().jQuery;
		if (jQuery) jQuery(element).on("change", listener);
		else (element as Element).addEventListener("change", listener);
	}

	triggerChange(element: object): void {
		(element as Element).dispatchEvent(new Event("input", {bubbles: true}));
		(element as Element).dispatchEvent(new Event("change", {bubbles: true}));
		pageGlobals().jQuery?.(element).trigger("change");
	}

	renderMath(target: object): void {
		pageGlobals().renderMathInElement?.(target as Element, MATH_OPTIONS);
	}

	highlightCode(): void {
		pageGlobals().PR?.prettyPrint();
	}
}
