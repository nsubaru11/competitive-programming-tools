import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import {holdToastsWhile} from "@ui/toast/toast";
import modalCss from "./modal.css" with {type: "text"};

const TITLE_ID = "modal-title";

export type ModalOptions = {
	readonly title: string;
	/** 見出しの閉じるボタンの名前。省略するとボタンを置かない。 */
	readonly closeLabel?: string;
	/** Shadow DOM の内側に追加する CSS。 */
	readonly css: string;
};

export type Modal = {
	readonly body: HTMLElement;
	readonly footer: HTMLElement;
	open(): void;
	close(): void;
};

/** サイトの CSS と干渉しないよう、Shadow DOM の中に dialog を作る。 */
export function createModal({title, closeLabel, css}: ModalOptions): Modal {
	const body = h("div", {className: "modal-body"});
	const footer = h("footer", {className: "modal-footer"});
	const closeButton = closeLabel === undefined ? null : h("button", {type: "button", textContent: closeLabel});
	const dialog = h(
		"dialog",
		{},
		h("header", {className: "modal-header"}, h("h2", {id: TITLE_ID, textContent: title}), ...closeButton ? [closeButton] : []),
		body,
		footer,
	);
	dialog.setAttribute("aria-labelledby", TITLE_ID);
	closeButton?.addEventListener("click", () => dialog.close());
	if ("closedBy" in HTMLDialogElement.prototype) {
		// 枠の外を押すと閉じる動きを、ブラウザに任せる
		dialog.setAttribute("closedby", "any");
	} else {
		// 対応していないブラウザ向け。枠の外で押して、枠の外で離したときだけ閉じる。
		// 中で文字を選び始めて外で離したときに、閉じないようにする。枠の外を押したときの対象は dialog 自身になる
		let pressedOutside = false;
		dialog.addEventListener("pointerdown", (event) => {
			pressedOutside = event.target === dialog;
		});
		dialog.addEventListener("click", (event) => {
			if (pressedOutside && event.target === dialog) dialog.close();
			pressedOutside = false;
		});
	}
	// 開いている間は、外側の通知を操作も読み上げもできないので、閉じてから表示させる
	let resumeToasts: (() => void) | null = null;
	dialog.addEventListener("close", () => {
		resumeToasts?.();
		resumeToasts = null;
	});

	const host = h("div");
	host.attachShadow({mode: "open"}).append(h("style", {textContent: `${themeCss}\n${modalCss}\n${css}`}), dialog);

	return {
		body,
		footer,
		open() {
			if (!host.isConnected) document.body.append(host);
			if (dialog.open) return;
			resumeToasts = holdToastsWhile(() => dialog.open && dialog.isConnected);
			dialog.showModal();
		},
		close: () => dialog.close(),
	};
}
