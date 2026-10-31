import {h} from "@ui/element";

export type SwitchControl = {
	readonly element: HTMLElement;
	setChecked(checked: boolean): void;
};

export function createSwitch(accessibleName: string, onChange: (checked: boolean) => void): SwitchControl {
	const input = h("input", {type: "checkbox", ariaLabel: accessibleName});
	input.setAttribute("role", "switch");
	input.addEventListener("change", () => onChange(input.checked));
	return {
		element: h("label", {className: "switch"}, input, h("span")),
		setChecked(checked) {
			input.checked = checked;
		},
	};
}

export type FieldControl = {
	readonly element: HTMLElement;
	setInvalid(invalid: boolean): void;
};

export function createField(label: string, control: HTMLElement, errorMessage: string): FieldControl {
	const error = h("span", {className: "field-error", textContent: errorMessage, hidden: true});
	return {
		element: h("label", {className: "field"}, h("span", {
			className: "field-label",
			textContent: label
		}), control, error),
		setInvalid(invalid) {
			control.setAttribute("aria-invalid", String(invalid));
			error.hidden = !invalid;
		},
	};
}
