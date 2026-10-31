import type {MessageKey, Translate} from "@catalog/messages";
import type {OptionDefinition} from "@domain/settings/option";
import {createField} from "@ui/form/controls";
import {h} from "@ui/element";

type Commit = (rawValue: unknown) => void;

function createControl(definition: OptionDefinition<MessageKey>, value: unknown, translate: Translate, commit: Commit) {
	switch (definition.kind) {
		case "boolean": {
			const input = h("input", {type: "checkbox", checked: value === true});
			input.addEventListener("change", () => commit(input.checked));
			return input;
		}
		case "number": {
			const input = h("input", {type: "number", value: String(value)});
			if (definition.min !== undefined) input.min = String(definition.min);
			if (definition.max !== undefined) input.max = String(definition.max);
			input.addEventListener("change", () => commit(input.valueAsNumber));
			return input;
		}
		case "select": {
			const select = h("select", {}, ...definition.choices.map((choice) => {
				return h("option", {value: choice.value, textContent: translate(choice.label)});
			}));
			select.value = String(value);
			select.addEventListener("change", () => commit(select.value));
			return select;
		}
		case "color":
		case "text": {
			const input = h("input", {type: definition.kind, value: String(value)});
			input.addEventListener("change", () => commit(input.value));
			return input;
		}
	}
}

export type OptionFieldParams = {
	readonly definition: OptionDefinition<MessageKey>;
	readonly value: unknown;
	readonly translate: Translate;
	readonly onChange: (value: unknown) => void;
};

/** 定義の種類に応じた入力欄を作る。不正な値は保存せず、その場で知らせる。 */
export function createOptionField({definition, value, translate, onChange}: OptionFieldParams): HTMLElement {
	const commit: Commit = (rawValue) => {
		const normalized = definition.normalize(rawValue);
		field.setInvalid(normalized === undefined);
		if (normalized !== undefined) onChange(normalized);
	};
	const control = createControl(definition, value, translate, commit);
	const field = createField(translate(definition.label), control, translate("settings.invalidValue"));
	return field.element;
}
