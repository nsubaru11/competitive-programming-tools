type ElementProps<K extends keyof HTMLElementTagNameMap> = Omit<Partial<HTMLElementTagNameMap[K]>, "style" | "dataset">;

export function h<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	props?: ElementProps<K>,
	...children: Array<Node | string>
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tagName);
	Object.assign(element, props);
	element.append(...children);
	return element;
}

/** document-start では head がまだ存在しないことがある。 */
export function injectStyle(css: string): HTMLStyleElement {
	const style = h("style", {textContent: css});
	(document.head ?? document.documentElement).append(style);
	return style;
}
