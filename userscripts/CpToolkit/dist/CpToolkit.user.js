// ==UserScript==
// @name           CP Toolkit
// @name:en        CP Toolkit
// @namespace      https://github.com/nsubaru11/atcoder-java-tools/tree/main/userscripts
// @version        0.1.0
// @description    競技プログラミングの補助機能をまとめ、機能ごとに ON/OFF できるようにします。
// @description:en A toolkit of competitive programming helpers that can be switched on and off individually.
// @description:ja 競技プログラミングの補助機能をまとめ、機能ごとに ON/OFF できるようにします。
// @author         nsubaru
// @license        0BSD
// @homepageURL    https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit
// @supportURL     https://github.com/nsubaru11/competitive-programming-tools/issues
// @match          https://atcoder.jp/*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addValueChangeListener
// @grant          GM_registerMenuCommand
// @run-at         document-start
// @icon           https://atcoder.jp/favicon.ico
// @noframes
// @updateURL      https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js
// @downloadURL    https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js
// ==/UserScript==

(() => {
	// CpToolkit/data/judges/atcoder.yaml
	var atcoder_default = {
		id: "atcoder",
		name: "AtCoder",
		matches: ["https://atcoder.jp/*"],
		routes: {
			page: "^/[^?]",
		},
		navigationLists: ["#navbar-collapse .navbar-right", "#header .header-page"],
	};

	// CpToolkit/src/catalog/judges.ts
	var judges = [atcoder_default];

	// CpToolkit/data/i18n/en.yaml
	var en_default = {
		"settings.open": "Open settings",
		"settings.title": "CP Toolkit settings",
		"settings.close": "Close",
		"settings.empty": "No features are available.",
		"settings.options": "Options",
		"settings.invalidValue": "This value is not valid.",
		"settings.reloadNotice": "Reload the page to apply your changes.",
		"settings.reload": "Reload",
		"settings.export": "Export settings",
		"settings.import": "Import settings",
		"settings.importFailed": "The settings file could not be read.",
		"settings.reset": "Reset to defaults",
		"settings.resetConfirm": "All settings will be reset to their defaults. Continue?",
		"status.disabled": "Off",
		"status.outOfScope": "Not on this page",
		"status.pending": "Waiting",
		"status.running": "Running",
		"status.reloadRequired": "Reload to apply",
		"status.failed": "Failed to start",
		"category.layout": "Layout",
		"wideLayout.title": "Wider page",
		"wideLayout.description": "Widens the central column of the page.",
		"wideLayout.width": "Width (e.g. 50%, 1200px)",
	};

	// CpToolkit/data/i18n/ja.yaml
	var ja_default = {
		"settings.open": "設定を開く",
		"settings.title": "CP Toolkit の設定",
		"settings.close": "閉じる",
		"settings.empty": "設定できる機能はありません。",
		"settings.options": "詳細設定",
		"settings.invalidValue": "値の形式が正しくありません。",
		"settings.reloadNotice": "変更を反映するには再読み込みしてください。",
		"settings.reload": "再読み込み",
		"settings.export": "設定を書き出す",
		"settings.import": "設定を読み込む",
		"settings.importFailed": "設定ファイルを読み込めませんでした。",
		"settings.reset": "初期状態に戻す",
		"settings.resetConfirm": "すべての設定を初期状態に戻します。よろしいですか?",
		"status.disabled": "無効",
		"status.outOfScope": "このページは対象外",
		"status.pending": "待機中",
		"status.running": "動作中",
		"status.reloadRequired": "再読み込みで反映",
		"status.failed": "起動に失敗",
		"category.layout": "表示",
		"wideLayout.title": "ページ幅の拡張",
		"wideLayout.description": "ページ中央の幅を広げます。",
		"wideLayout.width": "幅(例: 50%, 1200px)",
	};

	// CpToolkit/src/catalog/messages.ts
	var MESSAGES = { ja: ja_default, en: en_default };
	function createTranslator(getLocale) {
		return (key) => MESSAGES[getLocale()][key];
	}

	// CpToolkit/src/domain/page/route.ts
	var PATH_AND_QUERY_PATTERN = /^[a-z]+:\/\/[^/?#]+([^#]*)/i;
	function matchPatternToRegExp(pattern) {
		const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
		return new RegExp(`^${escaped}$`);
	}
	function matchPage(judges2, href) {
		const judge = judges2.find(({ matches }) =>
			matches.some((pattern) => matchPatternToRegExp(pattern).test(href)),
		);
		if (!judge) return null;
		const pathAndQuery = PATH_AND_QUERY_PATTERN.exec(href)?.[1] || "/";
		const routeIds = Object.entries(judge.routes)
			.filter(([, pattern]) => new RegExp(pattern).test(pathAndQuery))
			.map(([name]) => `${judge.id}:${name}`);
		return { judge, routeIds: new Set(routeIds) };
	}

	// CpToolkit/src/application/feature/runtime.ts
	class FeatureRuntime {
		dependencies;
		entries;
		listeners = new Set();
		constructor(dependencies) {
			this.dependencies = dependencies;
			this.entries = dependencies.features.map((feature) => ({
				feature,
				status: { state: "pending" },
				active: false,
				dispose: undefined,
				appliedKey: "",
				baseline: null,
				queue: Promise.resolve(),
			}));
		}
		start() {
			for (const entry of this.entries) {
				entry.appliedKey = this.settingsKey(entry.feature);
				this.enqueue(entry, () => this.applyInitial(entry));
			}
			this.dependencies.settings.subscribe(() => this.applyChanges());
		}
		async settled() {
			await Promise.all(this.entries.map((entry) => entry.queue));
		}
		statusOf(featureId) {
			return this.entries.find(({ feature }) => feature.id === featureId)?.status ?? { state: "outOfScope" };
		}
		subscribe(listener) {
			this.listeners.add(listener);
		}
		settingsKey({ id, defaultEnabled }) {
			const { settings } = this.dependencies;
			return JSON.stringify([settings.isEnabled(id, defaultEnabled), settings.storedOptions(id)]);
		}
		isEnabled({ id, defaultEnabled }) {
			return this.dependencies.settings.isEnabled(id, defaultEnabled);
		}
		isInScope({ routes }) {
			const routeIds = this.dependencies.page?.routeIds;
			return routeIds !== undefined && routes.some((route) => routeIds.has(route));
		}
		enqueue(entry, task) {
			entry.queue = entry.queue.then(task);
		}
		applyChanges() {
			for (const entry of this.entries) {
				const key = this.settingsKey(entry.feature);
				if (key === entry.appliedKey) continue;
				entry.appliedKey = key;
				this.enqueue(entry, () => this.applyChange(entry, key));
			}
		}
		async applyInitial(entry) {
			const { feature } = entry;
			if (!this.isInScope(feature)) {
				this.setStatus(entry, { state: "outOfScope" });
			} else if (this.isEnabled(feature)) {
				await this.activate(entry);
			} else {
				this.setStatus(entry, { state: "disabled" });
			}
			entry.baseline = { key: entry.appliedKey, status: entry.status };
		}
		async applyChange(entry, key) {
			const { feature } = entry;
			if (key !== entry.appliedKey || !this.isInScope(feature)) return;
			if (!feature.live) {
				this.setStatus(entry, this.statusBeforeReload(entry, key));
				return;
			}
			this.deactivate(entry);
			if (this.isEnabled(feature)) await this.activate(entry);
			else this.setStatus(entry, { state: "disabled" });
		}
		statusBeforeReload({ feature, baseline }, key) {
			if (baseline?.key === key) return baseline.status;
			const remainsDisabled = baseline?.status.state === "disabled" && !this.isEnabled(feature);
			return remainsDisabled ? { state: "disabled" } : { state: "reloadRequired" };
		}
		async activate(entry) {
			const { feature } = entry;
			const { lifecycle, logger, services, settings } = this.dependencies;
			this.setStatus(entry, { state: "pending" });
			try {
				await lifecycle.reach(feature.phase);
				entry.dispose = await feature.run(settings.storedOptions(feature.id), services);
				entry.active = true;
				this.setStatus(entry, { state: "running" });
			} catch (error) {
				logger.error(`Failed to start ${feature.id}`, error);
				this.setStatus(entry, { state: "failed", message: String(error) });
			}
		}
		deactivate(entry) {
			if (!entry.active) return;
			try {
				entry.dispose?.();
			} catch (error) {
				this.dependencies.logger.error(`Failed to stop ${entry.feature.id}`, error);
			}
			entry.active = false;
			entry.dispose = undefined;
		}
		setStatus(entry, status) {
			entry.status = status;
			for (const listener of this.listeners) listener();
		}
	}
	// ../shared/src/json.ts
	function safeJsonParse(text, fallback) {
		if (typeof text !== "string") return fallback;
		try {
			return JSON.parse(text);
		} catch {
			return fallback;
		}
	}
	function parseStoredObject(raw) {
		if (raw == null) return {};
		if (typeof raw === "string") {
			const parsed = safeJsonParse(raw, null);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				return parsed;
			}
			return {};
		}
		if (typeof raw === "object" && !Array.isArray(raw)) {
			return raw;
		}
		return {};
	}
	// CpToolkit/src/domain/settings/settings.ts
	var CURRENT_SETTINGS_VERSION = 1;
	var MIGRATIONS = {};
	function createDefaultSettings() {
		return { version: CURRENT_SETTINGS_VERSION, features: {} };
	}
	function parseFeatureSettings(raw) {
		const { enabled, options } = parseStoredObject(raw);
		return {
			...(typeof enabled === "boolean" ? { enabled } : {}),
			options: parseStoredObject(options),
		};
	}
	function parseSettings(raw) {
		const { version, features } = parseStoredObject(raw);
		const entries = Object.entries(parseStoredObject(features));
		let settings = {
			version: typeof version === "number" ? version : CURRENT_SETTINGS_VERSION,
			features: Object.fromEntries(entries.map(([id, value]) => [id, parseFeatureSettings(value)])),
		};
		while (settings.version < CURRENT_SETTINGS_VERSION) {
			const migrated = MIGRATIONS[settings.version]?.(settings) ?? settings;
			settings = { ...migrated, version: settings.version + 1 };
		}
		return settings;
	}
	function updateFeatureSettings(settings, featureId, patch) {
		const current = settings.features[featureId];
		const next = { ...current, ...patch, options: { ...current?.options, ...patch.options } };
		return { ...settings, features: { ...settings.features, [featureId]: next } };
	}

	// CpToolkit/src/application/settings/settings-service.ts
	var STORAGE_KEY = "settings";

	class SettingsService {
		store;
		settings;
		listeners = new Set();
		constructor(store) {
			this.store = store;
			this.settings = parseSettings(store.get(STORAGE_KEY));
			store.subscribeRemote(STORAGE_KEY, (value) => this.replace(parseSettings(value)));
		}
		isEnabled(featureId, defaultEnabled) {
			return this.settings.features[featureId]?.enabled ?? defaultEnabled;
		}
		storedOptions(featureId) {
			return this.settings.features[featureId]?.options;
		}
		setEnabled(featureId, enabled) {
			this.commit(updateFeatureSettings(this.settings, featureId, { enabled }));
		}
		setOption(featureId, key, value) {
			this.commit(updateFeatureSettings(this.settings, featureId, { options: { [key]: value } }));
		}
		reset() {
			this.commit(createDefaultSettings());
		}
		exportJson() {
			return JSON.stringify(this.settings, null, "\t");
		}
		importJson(text) {
			let parsed;
			try {
				parsed = JSON.parse(text);
			} catch {
				return false;
			}
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return false;
			this.commit(parseSettings(parsed));
			return true;
		}
		subscribe(listener) {
			this.listeners.add(listener);
		}
		commit(settings) {
			this.store.set(STORAGE_KEY, settings);
			this.replace(settings);
		}
		replace(settings) {
			this.settings = settings;
			for (const listener of this.listeners) listener();
		}
	}

	// CpToolkit/src/adapters/console-logger.ts
	class ConsoleLogger {
		prefix;
		constructor(prefix) {
			this.prefix = prefix;
		}
		error(message, cause) {
			console.error(`[${this.prefix}] ${message}`, cause);
		}
	}

	// CpToolkit/src/adapters/page/document-lifecycle.ts
	function waitForEvent(target, eventName) {
		return new Promise((resolve) => target.addEventListener(eventName, () => resolve(), { once: true }));
	}

	class DocumentLifecycle {
		async reach(phase) {
			if (phase === "ready" && document.readyState === "loading") {
				await waitForEvent(document, "DOMContentLoaded");
			}
			if (phase === "load" && document.readyState !== "complete") {
				await waitForEvent(window, "load");
			}
		}
	}

	// CpToolkit/src/adapters/page/locale.ts
	function detectLocale() {
		const meta = document.querySelector('meta[http-equiv="Content-Language"]');
		return (meta?.content || navigator.language).startsWith("ja") ? "ja" : "en";
	}

	// CpToolkit/src/adapters/userscript/gm-key-value-store.ts
	class GmKeyValueStore {
		get(key) {
			return GM_getValue(key);
		}
		set(key, value) {
			GM_setValue(key, value);
		}
		subscribeRemote(key, listener) {
			GM_addValueChangeListener(key, (_name, _oldValue, newValue, remote) => {
				if (remote) listener(newValue);
			});
		}
	}

	// CpToolkit/src/adapters/userscript/gm-script-host.ts
	class GmScriptHost {
		name = GM_info.script.name;
		version = GM_info.script.version;
		registerCommand(label, action) {
			GM_registerMenuCommand(label, action);
		}
	}

	// CpToolkit/src/ui/element.ts
	function h(tagName, props, ...children) {
		const element = document.createElement(tagName);
		Object.assign(element, props);
		element.append(...children);
		return element;
	}
	function injectStyle(css) {
		const style = h("style", { textContent: css });
		(document.head ?? document.documentElement).append(style);
		return style;
	}

	// CpToolkit/src/ui/theme.css
	var theme_default = `:host {
	--cp-surface: #ffffff;
	--cp-surface-muted: #f6f8fa;
	--cp-text: #1f2328;
	--cp-text-muted: #59636e;
	--cp-border: #d0d7de;
	--cp-accent: #0969da;
	--cp-on-accent: #ffffff;
	--cp-success: #1a7f37;
	--cp-danger: #cf222e;
	--cp-notice-surface: #fff8c5;
	--cp-notice-text: #6c5400;
	font: 14px/1.5 system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Yu Gothic UI", sans-serif;
	color: var(--cp-text);
}

@media (prefers-color-scheme: dark) {
	:host {
		--cp-surface: #1c2128;
		--cp-surface-muted: #262c36;
		--cp-text: #e6edf3;
		--cp-text-muted: #9198a1;
		--cp-border: #3d444d;
		--cp-accent: #4493f8;
		--cp-on-accent: #0d1117;
		--cp-success: #3fb950;
		--cp-danger: #f85149;
		--cp-notice-surface: #3a2f0b;
		--cp-notice-text: #e3b341;
	}
}

*, *::before, *::after {
	box-sizing: border-box;
}

/* display を指定した要素でも hidden を優先する */
[hidden] {
	display: none !important;
}

button {
	padding: 4px 12px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface-muted);
	color: var(--cp-text);
	font: inherit;
	cursor: pointer;
}

button:hover {
	border-color: var(--cp-text-muted);
}

:focus-visible {
	outline: 2px solid var(--cp-accent);
	outline-offset: 1px;
}
`;

	// CpToolkit/src/ui/dialog/modal.css
	var modal_default = `dialog {
	width: min(640px, calc(100vw - 32px));
	max-height: calc(100vh - 64px);
	padding: 0;
	border: 1px solid var(--cp-border);
	border-radius: 12px;
	background: var(--cp-surface);
	color: var(--cp-text);
	overflow: hidden;
}

dialog[open] {
	display: flex;
	flex-direction: column;
}

dialog::backdrop {
	background: rgb(0 0 0 / 45%);
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 12px 16px;
	border-bottom: 1px solid var(--cp-border);
}

.modal-header h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.modal-body {
	flex: 1;
	min-height: 0;
	padding: 16px;
	overflow-y: auto;
}

.modal-footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid var(--cp-border);
}
`;

	// CpToolkit/src/ui/dialog/modal.ts
	function createModal({ title, closeLabel, css }) {
		const body = h("div", { className: "modal-body" });
		const footer = h("footer", { className: "modal-footer" });
		const closeButton = h("button", { type: "button", textContent: closeLabel });
		const dialog = h(
			"dialog",
			{},
			h("header", { className: "modal-header" }, h("h2", { textContent: title }), closeButton),
			body,
			footer,
		);
		closeButton.addEventListener("click", () => dialog.close());
		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) dialog.close();
		});
		const host = h("div");
		host.attachShadow({ mode: "open" }).append(
			h("style", {
				textContent: `${theme_default}
${modal_default}
${css}`,
			}),
			dialog,
		);
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

	// CpToolkit/src/ui/form/form.css
	var form_default = `.switch {
	position: relative;
	display: inline-flex;
	flex: none;
	width: 36px;
	height: 20px;
}

.switch input {
	position: absolute;
	inset: 0;
	margin: 0;
	opacity: 0;
	cursor: pointer;
}

.switch span {
	width: 100%;
	border-radius: 10px;
	background: var(--cp-border);
	transition: background 120ms;
}

.switch span::after {
	content: "";
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--cp-surface);
	transition: transform 120ms;
}

.switch input:checked + span {
	background: var(--cp-accent);
}

.switch input:checked + span::after {
	transform: translateX(16px);
}

.switch input:focus-visible + span {
	outline: 2px solid var(--cp-accent);
	outline-offset: 2px;
}

.field {
	display: grid;
	gap: 4px;
}

.field-label {
	color: var(--cp-text-muted);
	font-size: 13px;
}

.field input:not([type="checkbox"], [type="color"]),
.field select {
	width: 100%;
	padding: 4px 8px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: inherit;
}

.field input[aria-invalid="true"] {
	border-color: var(--cp-danger);
}

.field-error {
	color: var(--cp-danger);
	font-size: 12px;
}
`;

	// CpToolkit/src/domain/settings/option.ts
	var SHORT_HEX_COLOR_PATTERN = /^#[0-9a-f]{3}$/;
	var HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;
	function normalizeColor(value) {
		if (typeof value !== "string") return;
		const color = value.trim().toLowerCase();
		if (HEX_COLOR_PATTERN.test(color)) return color;
		if (!SHORT_HEX_COLOR_PATTERN.test(color)) return;
		return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
	}
	var option = {
		boolean(defaultValue, label) {
			return {
				kind: "boolean",
				defaultValue,
				label,
				normalize: (value) => (typeof value === "boolean" ? value : undefined),
			};
		},
		text(defaultValue, label, { validate } = {}) {
			return {
				kind: "text",
				defaultValue,
				label,
				normalize(value) {
					if (typeof value !== "string") return;
					const text = value.trim();
					return !validate || validate(text) ? text : undefined;
				},
			};
		},
		color(defaultValue, label) {
			return { kind: "color", defaultValue, label, normalize: normalizeColor };
		},
		number(defaultValue, label, { min = -Infinity, max = Infinity } = {}) {
			return {
				kind: "number",
				defaultValue,
				label,
				min,
				max,
				normalize: (value) => (typeof value === "number" && value >= min && value <= max ? value : undefined),
			};
		},
		select(defaultValue, label, choices) {
			return {
				kind: "select",
				defaultValue,
				label,
				choices,
				normalize: (value) => choices.find((choice) => choice.value === value)?.value,
			};
		},
	};
	function normalizeOptions(schema, stored) {
		const source = parseStoredObject(stored);
		const entries = Object.entries(schema).map(([key, definition]) => {
			return [key, definition.normalize(source[key]) ?? definition.defaultValue];
		});
		return Object.fromEntries(entries);
	}

	// CpToolkit/src/ui/form/controls.ts
	function createSwitch(accessibleName, onChange) {
		const input = h("input", { type: "checkbox", ariaLabel: accessibleName });
		input.setAttribute("role", "switch");
		input.addEventListener("change", () => onChange(input.checked));
		return {
			element: h("label", { className: "switch" }, input, h("span")),
			setChecked(checked) {
				input.checked = checked;
			},
		};
	}
	function createField(label, control, errorMessage) {
		const error = h("span", { className: "field-error", textContent: errorMessage, hidden: true });
		return {
			element: h(
				"label",
				{ className: "field" },
				h("span", { className: "field-label", textContent: label }),
				control,
				error,
			),
			setInvalid(invalid) {
				control.setAttribute("aria-invalid", String(invalid));
				error.hidden = !invalid;
			},
		};
	}

	// CpToolkit/src/features/settings-panel/option-field.ts
	function createControl(definition, value, translate, commit) {
		switch (definition.kind) {
			case "boolean": {
				const input = h("input", { type: "checkbox", checked: value === true });
				input.addEventListener("change", () => commit(input.checked));
				return input;
			}
			case "number": {
				const input = h("input", { type: "number", value: String(value) });
				if (definition.min !== undefined) input.min = String(definition.min);
				if (definition.max !== undefined) input.max = String(definition.max);
				input.addEventListener("change", () => commit(input.valueAsNumber));
				return input;
			}
			case "select": {
				const select = h(
					"select",
					{},
					...definition.choices.map((choice) => {
						return h("option", { value: choice.value, textContent: translate(choice.label) });
					}),
				);
				select.value = String(value);
				select.addEventListener("change", () => commit(select.value));
				return select;
			}
			case "color":
			case "text": {
				const input = h("input", { type: definition.kind, value: String(value) });
				input.addEventListener("change", () => commit(input.value));
				return input;
			}
		}
	}
	function createOptionField({ definition, value, translate, onChange }) {
		const commit = (rawValue) => {
			const normalized = definition.normalize(rawValue);
			field.setInvalid(normalized === undefined);
			if (normalized !== undefined) onChange(normalized);
		};
		const control = createControl(definition, value, translate, commit);
		const field = createField(translate(definition.label), control, translate("settings.invalidValue"));
		return field.element;
	}

	// CpToolkit/src/features/settings-panel/feature-row.ts
	var STATUS_MESSAGES = {
		disabled: "status.disabled",
		outOfScope: "status.outOfScope",
		pending: "status.pending",
		running: "status.running",
		reloadRequired: "status.reloadRequired",
		failed: "status.failed",
	};
	function createOptionsSection({ feature, settings, translate }) {
		const definitions = Object.entries(feature.options);
		if (definitions.length === 0) return null;
		const values = normalizeOptions(feature.options, settings.storedOptions(feature.id));
		const fields = definitions.map(([key, definition]) =>
			createOptionField({
				definition,
				value: values[key],
				translate,
				onChange: (value) => settings.setOption(feature.id, key, value),
			}),
		);
		return h(
			"details",
			{ className: "feature-options" },
			h("summary", { textContent: translate("settings.options") }),
			h("div", { className: "feature-fields" }, ...fields),
		);
	}
	function createFeatureRow(params) {
		const { feature, settings, runtime, translate } = params;
		const title = translate(feature.title);
		const toggle = createSwitch(title, (enabled) => settings.setEnabled(feature.id, enabled));
		const statusLabel = h("span", { className: "status" });
		const summary = h(
			"div",
			{ className: "feature-summary" },
			h(
				"div",
				{ className: "feature-text" },
				h("div", { className: "feature-title", textContent: title }),
				h("div", {
					className: "feature-description",
					textContent: translate(feature.description),
				}),
			),
			statusLabel,
			toggle.element,
		);
		const optionsSection = createOptionsSection(params);
		const element = h("article", { className: "feature" }, summary);
		if (optionsSection) element.append(optionsSection);
		const status = () => runtime.statusOf(feature.id);
		return {
			element,
			status,
			refresh() {
				const current = status();
				statusLabel.textContent = translate(STATUS_MESSAGES[current.state]);
				statusLabel.dataset.state = current.state;
				statusLabel.title = current.state === "failed" ? current.message : "";
				toggle.setChecked(settings.isEnabled(feature.id, feature.defaultEnabled));
			},
		};
	}

	// CpToolkit/src/features/settings-panel/settings-panel.css
	var settings_panel_default = `.notice {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
	padding: 8px 12px;
	border-radius: 8px;
	background: var(--cp-notice-surface);
	color: var(--cp-notice-text);
}

.error {
	margin: 0 0 16px;
	color: var(--cp-danger);
}

.empty {
	margin: 0;
	color: var(--cp-text-muted);
}

.category + .category {
	margin-top: 20px;
}

.category h3 {
	margin: 0 0 8px;
	color: var(--cp-text-muted);
	font-size: 13px;
	font-weight: 600;
}

.feature {
	border: 1px solid var(--cp-border);
	border-radius: 8px;
}

.feature + .feature {
	margin-top: 8px;
}

.feature-summary {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 12px;
}

.feature-text {
	flex: 1;
	min-width: 0;
}

.feature-title {
	font-weight: 600;
}

.feature-description {
	color: var(--cp-text-muted);
	font-size: 13px;
}

.status {
	flex: none;
	color: var(--cp-text-muted);
	font-size: 12px;
}

.status[data-state="running"] {
	color: var(--cp-success);
}

.status[data-state="failed"] {
	color: var(--cp-danger);
}

.status[data-state="reloadRequired"] {
	color: var(--cp-notice-text);
}

.feature-options {
	padding: 0 12px 10px;
}

.feature-options summary {
	color: var(--cp-text-muted);
	font-size: 13px;
	cursor: pointer;
}

.feature-fields {
	display: grid;
	gap: 12px;
	margin-top: 8px;
}

.footer-version {
	margin-left: auto;
	color: var(--cp-text-muted);
	font-size: 12px;
}
`;

	// CpToolkit/src/features/settings-panel/index.ts
	function groupByCategory(features) {
		const groups = new Map();
		for (const feature of features) {
			groups.set(feature.category, [...(groups.get(feature.category) ?? []), feature]);
		}
		return groups;
	}
	function downloadText(fileName, text) {
		const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
		h("a", { href: url, download: fileName }).click();
		URL.revokeObjectURL(url);
	}
	function createSettingsPanel(dependencies) {
		const { features, settings, runtime, translate, version } = dependencies;
		const notice = h(
			"div",
			{ className: "notice", hidden: true },
			h("span", { textContent: translate("settings.reloadNotice") }),
			h("button", {
				type: "button",
				textContent: translate("settings.reload"),
				onclick: () => location.reload(),
			}),
		);
		const importError = h("p", {
			className: "error",
			textContent: translate("settings.importFailed"),
			hidden: true,
		});
		const content = h("div");
		let rows = [];
		let modal = null;
		const refresh = () => {
			for (const row of rows) row.refresh();
			notice.hidden = !rows.some((row) => row.status().state === "reloadRequired");
		};
		const render = () => {
			rows = [];
			const sections = [...groupByCategory(features)].map(([category, members]) => {
				const memberRows = members.map((feature) =>
					createFeatureRow({ feature, settings, runtime, translate }),
				);
				rows.push(...memberRows);
				return h(
					"section",
					{ className: "category" },
					h("h3", { textContent: translate(category) }),
					...memberRows.map((row) => row.element),
				);
			});
			content.replaceChildren(...sections);
			if (features.length === 0) {
				content.append(h("p", { className: "empty", textContent: translate("settings.empty") }));
			}
			refresh();
		};
		const importFile = async (file) => {
			const imported = settings.importJson(await file.text());
			importError.hidden = imported;
			if (imported) render();
		};
		const createFooter = () => {
			const fileInput = h("input", { type: "file", accept: "application/json,.json", hidden: true });
			fileInput.addEventListener("change", () => {
				const file = fileInput.files?.[0];
				fileInput.value = "";
				if (file) importFile(file);
			});
			const button = (label, onclick) => {
				return h("button", { type: "button", textContent: translate(label), onclick });
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
				h("span", { className: "footer-version", textContent: `v${version}` }),
			];
		};
		const createPanelModal = () => {
			const created = createModal({
				title: translate("settings.title"),
				closeLabel: translate("settings.close"),
				css: `${form_default}
${settings_panel_default}`,
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

	// CpToolkit/src/features/settings-panel/navigation-entry.ts
	function addNavigationEntry(listSelectors, label, onOpen) {
		const list = listSelectors
			.map((selector) => document.querySelector(selector))
			.find((element) => element !== null);
		const link = h("a", { href: "#", textContent: label });
		link.addEventListener("click", (event) => {
			event.preventDefault();
			onOpen();
		});
		list?.append(h("li", {}, link));
	}

	// CpToolkit/src/application/feature/definition.ts
	function defineFeature(definition) {
		return {
			id: definition.id,
			title: definition.title,
			description: definition.description,
			category: definition.category,
			defaultEnabled: definition.defaultEnabled,
			routes: definition.routes,
			phase: definition.phase,
			options: definition.options,
			live: definition.live === true,
			async run(storedOptions, services) {
				const options = normalizeOptions(definition.options, storedOptions);
				return (await definition.start({ ...services, options })) ?? undefined;
			},
		};
	}

	// CpToolkit/src/features/wide-layout/wide-layout.css
	var wide_layout_default = `#main-container {
	width: var(--cp-main-width) !important;
	max-width: 100% !important;
	transition: none !important;
}
`;

	// CpToolkit/src/features/wide-layout/index.ts
	var wideLayout = defineFeature({
		id: "wide-layout",
		title: "wideLayout.title",
		description: "wideLayout.description",
		category: "category.layout",
		defaultEnabled: true,
		routes: ["atcoder:page"],
		phase: "start",
		options: {
			width: option.text("50%", "wideLayout.width", { validate: (value) => CSS.supports("width", value) }),
		},
		live: true,
		start({ options }) {
			const style = injectStyle(`:root {--cp-main-width: ${options.width};}
${wide_layout_default}`);
			return () => style.remove();
		},
	});

	// CpToolkit/src/app/registry.ts
	var features = [wideLayout];

	// CpToolkit/src/app/bootstrap.ts
	function bootstrap() {
		const host = new GmScriptHost();
		document.documentElement.dataset.cpToolkit = host.version;
		const lifecycle = new DocumentLifecycle();
		const settings = new SettingsService(new GmKeyValueStore());
		const translate = createTranslator(detectLocale);
		const page = matchPage(judges, location.href);
		const runtime = new FeatureRuntime({
			features,
			page,
			lifecycle,
			settings,
			services: { translate },
			logger: new ConsoleLogger(host.name),
		});
		runtime.start();
		const panel = createSettingsPanel({ features, settings, runtime, translate, version: host.version });
		lifecycle.reach("ready").then(() => {
			host.registerCommand(translate("settings.open"), () => panel.open());
			if (page) addNavigationEntry(page.judge.navigationLists, host.name, () => panel.open());
		});
	}

	// CpToolkit/src/main.ts
	bootstrap();
})();
