import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import toastCss from "./toast.css" with {type: "text"};

export type Toast = {
	readonly title: string;
	readonly detail: string;
	readonly tone: "success" | "warning";
	readonly href?: string;
	readonly durationMs: number;
};

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
	if (container?.isConnected) return container;
	const list = h("div", {className: "toasts"});
	const host = h("div");
	host.attachShadow({mode: "open"}).append(h("style", {textContent: `${themeCss}\n${toastCss}`}), list);
	document.body.append(host);
	container = list;
	return list;
}

/** 画面の隅に通知を表示する。クリックするか時間が経つと消える。 */
export function showToast({title, detail, tone, href, durationMs}: Toast): void {
	const heading = href ? h("a", {href, target: "_blank", rel: "noopener", textContent: title}) : title;
	const toast = h(
		"div",
		{className: "toast"},
		h("div", {className: "toast-title"}, heading),
		h("div", {className: "toast-detail", textContent: detail}),
	);
	toast.dataset.tone = tone;
	toast.addEventListener("click", () => toast.remove());
	setTimeout(() => toast.remove(), durationMs);
	ensureContainer().append(toast);
}
