import {h, injectStyle} from "@ui/element";
import css from "./navigation-entry.css" with {type: "text"};

/** サイトのメニューに設定画面へのリンクを追加する。メニューが見つからないページでは何もしない。 */
export function addNavigationEntry(listSelectors: readonly string[], label: string, onOpen: () => void): void {
	const list = listSelectors.map((selector) => document.querySelector(selector)).find((element) => element !== null);
	if (!list) return;
	injectStyle(css);
	const link = h("a", {href: "#"}, h("span", {className: "cp-settings-entry", textContent: label}));
	link.addEventListener("click", (event) => {
		event.preventDefault();
		onOpen();
	});
	list.append(h("li", {}, link));
}
