import {h} from "@ui/element";

/** サイトのメニューに設定画面へのリンクを追加する。メニューが見つからないページでは何もしない。 */
export function addNavigationEntry(listSelectors: readonly string[], label: string, onOpen: () => void): void {
	const list = listSelectors.map((selector) => document.querySelector(selector)).find((element) => element !== null);
	const link = h("a", {href: "#", textContent: label});
	link.addEventListener("click", (event) => {
		event.preventDefault();
		onOpen();
	});
	list?.append(h("li", {}, link));
}
