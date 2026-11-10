import {PinnedLanguages} from "@application/execution/pinned-languages";
import {defineFeature} from "@application/feature/definition";
import {createModal} from "@ui/dialog/modal";
import {h, injectStyle} from "@ui/element";
import barCss from "./language-bar.css" with {type: "text"};
import css from "./language-buttons.css" with {type: "text"};

/**
 * 言語欄の列は狭く、ボタンが1つずつ縦に並ぶので、フォームの行の右端(エディタの右端)まで広げる。
 * 行の幅は画面の大きさで変わるので、変わるたびに測り直す。
 */
function fitToRow(bar: HTMLElement, column: Element): void {
	const row = column.closest(".form-group") ?? column.parentElement;
	if (!row) return;
	// 監視を始めた時点でも1回呼ばれる
	new ResizeObserver(() => {
		const right = row.getBoundingClientRect().right - (parseFloat(getComputedStyle(column).paddingRight) || 0);
		const width = Math.floor(right - bar.getBoundingClientRect().left);
		bar.style.width = width > 0 ? `${width}px` : "";
	}).observe(row);
}

export const languageButtons = defineFeature({
	id: "language-buttons",
	title: "languageButtons.title",
	description: "languageButtons.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:task", "atcoder:submit", "atcoder:customTest"],
	phase: "ready",
	options: {},
	async start({judgeSite, state, translate}) {
		const container = document.querySelector("#select-lang");
		const site = await judgeSite();
		if (!container || !site) return;

		const pinned = new PinnedLanguages(state);
		// サイトは #select-lang の直下の div を問題の切り替えで隠すので、span に入れる
		const bar = h("span", {className: "cp-language-bar"});
		injectStyle(barCss);

		/** 問題を切り替えると選択欄も変わるので、そのたびに作り直す。 */
		const render = (): void => {
			const pinnedIds = pinned.ids();
			const currentId = site.language()?.id;
			bar.replaceChildren(...site.languages().filter(({id}) => pinnedIds.has(id)).map(({id, label}) => h("button", {
				type: "button",
				className: `btn btn-sm ${id === currentId ? "btn-success" : "btn-default"}`,
				textContent: label,
				onclick: () => site.selectLanguage(id),
			})), configButton);
		};

		const modal = createModal({
			title: translate("languageButtons.title"),
			closeLabel: translate("settings.close"),
			css,
		});
		const openConfig = (): void => {
			const pinnedIds = pinned.ids();
			const options = site.languages().map(({id, label}) => {
				const checkbox = h("input", {type: "checkbox", checked: pinnedIds.has(id)});
				checkbox.addEventListener("change", () => {
					pinned.set(id, checkbox.checked);
					render();
				});
				return h("label", {className: "language-option"}, checkbox, label);
			});
			modal.body.replaceChildren(
				h("p", {className: "language-hint", textContent: translate("languageButtons.hint")}),
				h("div", {className: "language-list"}, ...options),
			);
			modal.open();
		};

		const configButton = h(
			"button",
			{
				type: "button",
				className: "btn btn-default btn-sm",
				title: translate("languageButtons.configure"),
				ariaLabel: translate("languageButtons.configure"),
				onclick: openConfig,
			},
			h("span", {className: "glyphicon glyphicon-cog"}),
		);
		container.append(bar);
		fitToRow(bar, container);

		render();
		site.onLanguageChange(render);
	},
});
