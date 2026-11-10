import type {MessageKey, Translate} from "@catalog/messages";
import type {Feature} from "@application/feature/definition";
import type {FeatureRuntime} from "@application/feature/runtime";
import type {SettingsService} from "@application/settings/settings-service";
import {createModal, type Modal} from "@ui/dialog/modal";
import formCss from "@ui/form/form.css" with {type: "text"};
import {h} from "@ui/element";
import {createFeatureRow, type FeatureRow} from "./feature-row";
import panelCss from "./settings-panel.css" with {type: "text"};

export type SettingsPanelDependencies = {
	readonly features: readonly Feature[];
	readonly settings: SettingsService;
	readonly runtime: FeatureRuntime;
	readonly translate: Translate;
	readonly version: string;
};

export type SettingsPanel = {
	open(): void;
};

function downloadText(fileName: string, text: string): void {
	const url = URL.createObjectURL(new Blob([text], {type: "application/json"}));
	h("a", {href: url, download: fileName}).click();
	URL.revokeObjectURL(url);
}

/**
 * 画面は最初に開くときに作る。起動する document-start の時点ではページの言語を読めないので、
 * ここで文言を決めるとブラウザの言語のまま残る。
 */
export function createSettingsPanel(dependencies: SettingsPanelDependencies): SettingsPanel {
	let view: SettingsPanel | null = null;
	return {
		open() {
			view ??= createPanelView(dependencies);
			view.open();
		},
	};
}

function createPanelView(dependencies: SettingsPanelDependencies): SettingsPanel {
	const {features, settings, runtime, translate, version} = dependencies;
	const notice = h(
		"div",
		{className: "notice", hidden: true},
		h("span", {textContent: translate("settings.reloadNotice")}),
		h("button", {type: "button", textContent: translate("settings.reload"), onclick: () => location.reload()}),
	);
	const importError = h("p", {className: "error", textContent: translate("settings.importFailed"), hidden: true});
	const content = h("div");
	let rows: FeatureRow[] = [];
	let modal: Modal | null = null;

	const refresh = (): void => {
		for (const row of rows) row.refresh();
		notice.hidden = !rows.some((row) => row.status().state === "reloadRequired");
	};

	const render = (): void => {
		rows = [];
		const sections = [...Map.groupBy(features, ({category}) => category)].map(([category, members]) => {
			const memberRows = members.map((feature) => createFeatureRow({feature, settings, runtime, translate}));
			rows.push(...memberRows);
			return h(
				"section",
				{className: "category"},
				h("h3", {textContent: translate(category)}),
				...memberRows.map((row) => row.element),
			);
		});
		content.replaceChildren(...sections);
		if (features.length === 0) {
			content.append(h("p", {className: "empty", textContent: translate("settings.empty")}));
		}
		refresh();
	};

	const importFile = async (file: File): Promise<void> => {
		const imported = settings.importJson(await file.text());
		importError.hidden = imported;
		if (imported) render();
	};

	const createFooter = (): HTMLElement[] => {
		const fileInput = h("input", {type: "file", accept: "application/json,.json", hidden: true});
		fileInput.addEventListener("change", () => {
			const file = fileInput.files?.[0];
			fileInput.value = "";
			if (file) void importFile(file);
		});
		const button = (label: MessageKey, onclick: () => void) => {
			return h("button", {type: "button", textContent: translate(label), onclick});
		};
		return [
			button("settings.export", () => downloadText("cp-toolkit-settings.json", settings.exportJson())),
			button("settings.import", () => fileInput.click()),
			button("settings.reset", () => {
				if (!window.confirm(translate("settings.resetConfirm"))) return;
				settings.reset();
				importError.hidden = true;
				render();
			}),
			fileInput,
			h("span", {className: "footer-version", textContent: `v${version}`}),
		];
	};

	const createPanelModal = (): Modal => {
		const created = createModal({
			title: translate("settings.title"),
			closeLabel: translate("settings.close"),
			css: `${formCss}\n${panelCss}`,
		});
		created.body.append(notice, importError, content);
		created.footer.append(...createFooter());
		settings.subscribe(refresh);
		runtime.subscribe(refresh);
		return created;
	};

	return {
		open() {
			modal ??= createPanelModal();
			render();
			modal.open();
		},
	};
}
