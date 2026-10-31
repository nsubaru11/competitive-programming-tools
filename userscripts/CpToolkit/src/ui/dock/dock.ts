import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import dockCss from "./dock.css" with {type: "text"};

export type DockTone = "success" | "warning";

export type DockOptions = {
	readonly css: string;
	readonly toggleLabel: string;
	readonly closeLabel: string;
};

export type DockTab = {
	/** 開閉の状態は変えずに、このタブを選ぶ。 */
	select(): void;
	show(): void;
	close(): void;
	setTone(tone: DockTone): void;
};

export type Dock = {
	addTab(label: string, content: HTMLElement, options?: {closable?: boolean}): DockTab;
	toggle(): void;
	remove(): void;
};

type DockEntry = {
	readonly tab: HTMLElement;
	readonly pane: HTMLElement;
};

/** 画面下部の開閉できるパネル。サイトの CSS に左右されないよう Shadow DOM に作る。 */
export function createDock({css, toggleLabel, closeLabel}: DockOptions): Dock {
	const tabs = h("div", {className: "dock-tabs"});
	const content = h("div", {className: "dock-content"});
	const panel = h("div", {className: "dock-panel", hidden: true}, tabs, content);
	const setOpen = (open: boolean): void => {
		panel.hidden = !open;
		toggleButton.dataset.open = String(open);
	};
	const toggleButton = h("button", {
		type: "button",
		className: "dock-toggle",
		title: toggleLabel,
		ariaLabel: toggleLabel,
		onclick: () => setOpen(panel.hidden),
	});
	const dock = h("div", {className: "dock"}, toggleButton, panel);

	const host = h("div");
	host.attachShadow({mode: "open"}).append(h("style", {textContent: `${themeCss}\n${dockCss}\n${css}`}), dock);
	document.body.append(host);

	// タブの帯をドラッグして高さを変える
	tabs.addEventListener("pointerdown", (event) => {
		if (event.target !== tabs) return;
		const startY = event.clientY;
		const startHeight = content.getBoundingClientRect().height;
		const onMove = ({clientY}: PointerEvent): void => {
			content.style.height = `${startHeight - (clientY - startY)}px`;
		};
		tabs.setPointerCapture(event.pointerId);
		tabs.addEventListener("pointermove", onMove);
		tabs.addEventListener("pointerup", () => tabs.removeEventListener("pointermove", onMove), {once: true});
	});

	const entries = new Set<DockEntry>();
	let active: DockEntry | undefined;
	const activate = (next: DockEntry | undefined): void => {
		active = next;
		for (const entry of entries) {
			entry.tab.dataset.active = String(entry === next);
			entry.pane.hidden = entry !== next;
		}
	};

	return {
		addTab(label, pane, {closable = false} = {}) {
			const tab = h("div", {className: "dock-tab", textContent: label});
			const entry = {tab, pane};
			const select = (): void => activate(entry);
			const show = (): void => {
				setOpen(true);
				select();
			};
			const close = (): void => {
				entries.delete(entry);
				tab.remove();
				pane.remove();
				if (active === entry) activate(entries.values().next().value);
			};
			tab.addEventListener("click", show);
			if (closable) {
				tab.append(h("button", {
					type: "button",
					className: "dock-tab-close",
					textContent: "×",
					ariaLabel: closeLabel,
					onclick(event: MouseEvent) {
						event.stopPropagation();
						close();
					},
				}));
			}
			entries.add(entry);
			pane.hidden = active !== undefined;
			tabs.append(tab);
			content.append(pane);
			if (!active) select();
			return {
				select,
				show,
				close,
				setTone(tone) {
					tab.dataset.tone = tone;
				},
			};
		},
		toggle: () => setOpen(panel.hidden),
		remove: () => host.remove(),
	};
}
