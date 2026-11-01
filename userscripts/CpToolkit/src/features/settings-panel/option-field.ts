import type {MessageKey, Translate} from "@catalog/messages";
import type {OptionDefinition} from "@domain/settings/option";
import {createField} from "@ui/form/controls";
import {h} from "@ui/element";

type FieldHandlers = {
	/** 入力の途中で値を確かめ、不正なら知らせる。保存はしない。 */
	readonly validate: (rawValue: unknown) => void;
	/** 入力を確定する。正しい値だけを保存する。 */
	readonly commit: (rawValue: unknown) => void;
};

function createControl(
	definition: OptionDefinition<MessageKey>,
	value: unknown,
	translate: Translate,
	{validate, commit}: FieldHandlers,
) {
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
			input.addEventListener("input", () => validate(input.valueAsNumber));
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
			input.addEventListener("input", () => validate(input.value));
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
	const check = (rawValue: unknown): unknown => {
		const normalized = definition.normalize(rawValue);
		field.setInvalid(normalized === undefined);
		return normalized;
	};
	const control = createControl(definition, value, translate, {
		validate: check,
		commit(rawValue) {
			const normalized = check(rawValue);
			if (normalized !== undefined) onChange(normalized);
		},
	});
	const invalidMessage = translate(definition.invalidMessage ?? "settings.invalidValue");
	const field = createField(translate(definition.label), control, invalidMessage);
	return field.element;
}
