import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import modalCss from "./modal.css" with {type: "text"};

export type ModalOptions = {
	readonly title: string;
	readonly closeLabel: string;
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
	const closeButton = h("button", {type: "button", textContent: closeLabel});
	const dialog = h(
		"dialog",
		{},
		h("header", {className: "modal-header"}, h("h2", {textContent: title}), closeButton),
		body,
		footer,
	);
	closeButton.addEventListener("click", () => dialog.close());
	// 枠の外をクリックしたときの対象は dialog 自身になる
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});

	const host = h("div");
	host.attachShadow({mode: "open"}).append(h("style", {textContent: `${themeCss}\n${modalCss}\n${css}`}), dialog);

	return {
		body,
		footer,
		open() {
			if (!host.isConnected) document.body.append(host);
			if (!dialog.open) dialog.showModal();
		},
		close: () => dialog.close(),
	};
}
