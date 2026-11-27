import type {MessageKey, Translate} from "@catalog/messages";
import type {Feature} from "@application/feature/definition";
import type {FeatureRuntime} from "@application/feature/runtime";
import type {SettingsService} from "@application/settings/settings-service";
import type {UpdateChecker} from "@application/update/update-checker";
import {createModal, type Modal} from "@ui/dialog/modal";
import formCss from "@ui/form/form.css" with {type: "text"};
import {h} from "@ui/element";
import {createFeatureRow, type FeatureRow} from "./feature-row";
import panelCss from "./settings-panel.css" with {type: "text"};
import {createShortcutDialog} from "./shortcut-dialog";
import shortcutListCss from "./shortcut-list.css" with {type: "text"};
import {createVersionStatus} from "./version-status";

/** 設定画面のタブに並べるサイト。 */
export type SettingsSite = {
	readonly id: string;
	readonly name: string;
};

export type SettingsPanelDependencies = {
	readonly features: readonly Feature[];
	readonly settings: SettingsService;
	/** 設定を分けるサイト。無ければタブを出さず、すべての機能を1つの画面に出す。 */
	readonly sites?: readonly SettingsSite[];
	/** 表示中のページのサイト。開いたときにこのサイトのタブを選ぶ。 */
	readonly currentSite?: string | null;
	readonly runtime: FeatureRuntime;
	readonly translate: Translate;
	readonly updates: UpdateChecker;
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
	const {features, settings, runtime, translate, updates, sites = [], currentSite = null} = dependencies;
	const siteOf = (route: string): string => route.slice(0, route.indexOf(":"));
	// 機能が1つも動かないサイトのタブは出さない
	const tabSites = sites.filter(({id}) => features.some(({routes}) => routes.some((route) => siteOf(route) === id)));
	let selectedSite: string | null = tabSites.find(({id}) => id === currentSite)?.id ?? tabSites[0]?.id ?? null;
	const tabs = h("div", {className: "site-tabs", role: "tablist", hidden: tabSites.length === 0});
	tabs.setAttribute("aria-label", translate("settings.sites"));
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
	const shortcutDialog = createShortcutDialog(translate);

	const refresh = (): void => {
		for (const row of rows) row.refresh();
		// 再読み込みが要るかは、表示中のページのサイトの設定でだけ分かる
		notice.hidden = selectedSite !== currentSite || !rows.some((row) => row.status().state === "reloadRequired");
	};

	const renderTabs = (): void => {
		tabs.replaceChildren(...tabSites.map(({id, name}) => {
			const tab = h("button", {type: "button", role: "tab", textContent: name, onclick: () => {
				selectedSite = id;
				render();
			}});
			tab.setAttribute("aria-selected", String(id === selectedSite));
			if (id === currentSite) tab.setAttribute("aria-current", "page");
			return tab;
		}));
	};

	const render = (): void => {
		rows = [];
		renderTabs();
		const store = settings.forSite(selectedSite);
		const visible = selectedSite === null ? features : features.filter(({routes}) => routes.some((route) => siteOf(route) === selectedSite));
		const showStatus = selectedSite === currentSite;
		const sections = [...Map.groupBy(visible, ({category}) => category)].map(([category, members]) => {
			const memberRows = members.map((feature) => createFeatureRow({feature, settings: store, runtime, translate, showStatus, shortcutDialog}));
			rows.push(...memberRows);
			return h(
				"section",
				{className: "category"},
				h("h3", {textContent: translate(category)}),
				...memberRows.map((row) => row.element),
			);
		});
		content.replaceChildren(...sections);
		if (visible.length === 0) {
			content.append(h("p", {className: "empty", textContent: translate("settings.empty")}));
		}
		// たまにしか使わないので、機能の一覧の下に置く
		content.append(backup);
		refresh();
	};

	const importFile = async (file: File): Promise<void> => {
		const imported = settings.importJson(await file.text());
		importError.hidden = imported;
		if (imported) render();
	};

	/** 設定のバックアップ、復元、初期化。すべてのサイトの設定をまとめて扱う。 */
	const createBackupSection = (): HTMLElement => {
		const fileInput = h("input", {type: "file", accept: "application/json,.json", hidden: true});
		fileInput.addEventListener("change", () => {
			const file = fileInput.files?.[0];
			fileInput.value = "";
			if (file) void importFile(file);
		});
		const button = (label: MessageKey, onclick: () => void) => {
			return h("button", {type: "button", textContent: translate(label), onclick});
		};
		return h(
			"section",
			{className: "category backup"},
			h("h3", {textContent: translate("settings.backup")}),
			importError,
			h(
				"div",
				{className: "backup-actions"},
				button("settings.export", () => downloadText("cp-toolkit-settings.json", settings.exportJson())),
				button("settings.import", () => fileInput.click()),
				button("settings.reset", () => {
					if (!window.confirm(translate("settings.resetConfirm"))) return;
					settings.reset();
					importError.hidden = true;
					render();
				}),
				fileInput,
			),
		);
	};
	const backup = createBackupSection();

	/** 再読み込みで反映する機能のために、いつでもページを再読み込みできるようにする。 */
	const createFooter = (): HTMLElement[] => [
		h("button", {type: "button", textContent: translate("settings.reload"), onclick: () => location.reload()}),
		createVersionStatus(updates, translate),
	];

	const createPanelModal = (): Modal => {
		const created = createModal({
			title: translate("settings.title"),
			closeLabel: translate("settings.close"),
			css: `${formCss}\n${panelCss}\n${shortcutListCss}`,
		});
		created.body.append(tabs, notice, content);
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
