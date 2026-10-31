import type {MessageKey, Translate} from "@catalog/messages";
import {normalizeOptions} from "@domain/settings/option";
import type {Feature} from "@application/feature/definition";
import type {FeatureRuntime, FeatureStatus} from "@application/feature/runtime";
import type {SettingsService} from "@application/settings/settings-service";
import {createSwitch} from "@ui/form/controls";
import {h} from "@ui/element";
import {createOptionField} from "./option-field";

export type FeatureRowParams = {
	readonly feature: Feature;
	readonly settings: SettingsService;
	readonly runtime: FeatureRuntime;
	readonly translate: Translate;
};

export type FeatureRow = {
	readonly element: HTMLElement;
	readonly status: () => FeatureStatus;
	refresh(): void;
};

const STATUS_MESSAGES: Readonly<Record<FeatureStatus["state"], MessageKey>> = {
	disabled: "status.disabled",
	outOfScope: "status.outOfScope",
	pending: "status.pending",
	running: "status.running",
	reloadRequired: "status.reloadRequired",
	failed: "status.failed",
};

function createOptionsSection({feature, settings, translate}: FeatureRowParams): HTMLElement | null {
	const definitions = Object.entries(feature.options);
	if (definitions.length === 0) return null;
	const values = normalizeOptions(feature.options, settings.storedOptions(feature.id));
	const fields = definitions.map(([key, definition]) => createOptionField({
		definition,
		value: values[key],
		translate,
		onChange: (value) => settings.setOption(feature.id, key, value),
	}));
	return h(
		"details",
		{className: "feature-options"},
		h("summary", {textContent: translate("settings.options")}),
		h("div", {className: "feature-fields"}, ...fields),
	);
}

export function createFeatureRow(params: FeatureRowParams): FeatureRow {
	const {feature, settings, runtime, translate} = params;
	const title = translate(feature.title);
	const toggle = createSwitch(title, (enabled) => settings.setEnabled(feature.id, enabled));
	const statusLabel = h("span", {className: "status"});
	const summary = h(
		"div",
		{className: "feature-summary"},
		h("div", {className: "feature-text"}, h("div", {className: "feature-title", textContent: title}), h("div", {
			className: "feature-description",
			textContent: translate(feature.description),
		})),
		statusLabel,
		toggle.element,
	);
	const optionsSection = createOptionsSection(params);
	const element = h("article", {className: "feature"}, summary);
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
