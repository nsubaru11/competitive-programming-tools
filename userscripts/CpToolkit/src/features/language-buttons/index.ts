import {PinnedLanguages} from "@application/execution/pinned-languages";
import {defineFeature} from "@application/feature/definition";
import {createModal} from "@ui/dialog/modal";
import {h} from "@ui/element";
import css from "./language-buttons.css" with {type: "text"};

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
		const bar = h("span");
		Object.assign(bar.style, {display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px"});

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

		render();
		site.onLanguageChange(render);
	},
});
