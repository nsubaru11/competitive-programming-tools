import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import tooltipCss from "./tooltip.css" with {type: "text"};

type Tooltip = {
	readonly anchor: () => Element | null | undefined;
	readonly text: () => string | null;
};

const GAP_PX = 6;

const tooltips: Tooltip[] = [];
let bubble: HTMLElement | null = null;
let listening = false;
let hovered: Node | null = null;

function ensureBubble(): HTMLElement {
	if (bubble?.isConnected) return bubble;
	const element = h("div", {className: "tooltip", hidden: true});
	const host = h("div");
	host.attachShadow({mode: "open"}).append(h("style", {textContent: `${themeCss}\n${tooltipCss}`}), element);
	document.body.append(host);
	bubble = element;
	return element;
}

/** 上に収まらないときは下に出す。 */
function place(element: HTMLElement, anchor: Element): void {
	const {left, top, bottom, width} = anchor.getBoundingClientRect();
	const above = top - element.offsetHeight - GAP_PX;
	element.style.left = `${left + width / 2}px`;
	element.style.top = `${above >= 0 ? above : bottom + GAP_PX}px`;
}

function refresh(): void {
	for (const {anchor, text} of tooltips) {
		const element = anchor();
		const label = element?.contains(hovered) ? text() : null;
		if (!element || label === null) continue;
		const target = ensureBubble();
		target.textContent = label;
		target.hidden = false;
		place(target, element);
		return;
	}
	if (bubble) bubble.hidden = true;
}

function onPointerMove({target}: Event): void {
	hovered = target instanceof Node ? target : null;
	refresh();
}

/**
 * カーソルを乗せた要素の説明をすぐに表示する。標準の title は表示まで待たされる。
 * 要素はサイトが後から作り直すことがあり、説明は状態で変わるので、乗せるたびに関数で求める。
 * text が null なら表示しない。
 */
export function addTooltip(anchor: Tooltip["anchor"], text: Tooltip["text"]): void {
	if (!listening) {
		document.addEventListener("mouseover", onPointerMove);
		// クリックで説明が変わることがある。ボタンの処理の後に更新する
		document.addEventListener("click", refresh);
		listening = true;
	}
	tooltips.push({anchor, text});
}
