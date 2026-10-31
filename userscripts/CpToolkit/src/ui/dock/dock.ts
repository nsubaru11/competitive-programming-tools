import {h} from "@ui/element";
import themeCss from "@ui/theme.css" with {type: "text"};
import dockCss from "./dock.css" with {type: "text"};

export type DockTone = "success" | "warning";

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

/** 画面下部の開閉できるパネル。サイトの CSS に左右されないよう Shadow DOM に作る。 */
export function createDock({css, toggleLabel, closeLabel}: {css: string; toggleLabel: string; closeLabel: string}): Dock {
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

	const activate = (tab: HTMLElement | undefined, pane: HTMLElement | undefined): void => {
		for (const other of tabs.children) (other as HTMLElement).dataset.active = String(other === tab);
		for (const other of content.children) (other as HTMLElement).hidden = other !== pane;
	};

	return {
		addTab(label, pane, {closable = false} = {}) {
			const tab = h("div", {className: "dock-tab", textContent: label});
			const select = (): void => activate(tab, pane);
			const show = (): void => {
				setOpen(true);
				select();
			};
			const close = (): void => {
				const wasActive = !pane.hidden;
				tab.remove();
				pane.remove();
				if (wasActive) activate(tabs.firstElementChild as HTMLElement, content.firstElementChild as HTMLElement);
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
			pane.hidden = content.children.length > 0;
			tabs.append(tab);
			content.append(pane);
			if (tabs.children.length === 1) select();
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
