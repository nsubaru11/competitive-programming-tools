import type {MessageKey, Translate} from "@catalog/messages";
import type {KeyValueStore} from "@application/ports/key-value-store";
import type {CommentEntry, CommentSlot, SlotContent, SourceComments} from "@application/source/source-comments";
import {h} from "@ui/element";

const OPEN_KEY = "source-comments:open";
const SLOT_LABELS: Readonly<Record<CommentSlot, MessageKey>> = {
	header: "sourceComments.header",
	footer: "sourceComments.footer",
};
const LABEL_LENGTH = 40;

type PanelOptions = {
	readonly comments: SourceComments;
	readonly state: KeyValueStore;
	readonly translate: Translate;
	readonly task: () => string;
	readonly onChange: () => void;
	readonly onApply: () => void;
};

export type CommentPanel = {
	readonly element: HTMLElement;
	/** 問題が変わったときに、保存した内容を表示し直す。 */
	reload(): void;
	setUnsupported(unsupported: boolean): void;
};

function summarize({text}: CommentEntry): string {
	const line = text.trim().split("\n")[0] ?? "";
	return line.length > LABEL_LENGTH ? `${line.slice(0, LABEL_LENGTH)}...` : line;
}

function createCheckbox(label: string, onChange: () => void): {element: HTMLElement; input: HTMLInputElement} {
	const input = h("input", {type: "checkbox", onchange: onChange});
	return {element: h("label", {}, input, ` ${label}`), input};
}

function createSlot(slot: CommentSlot, {comments, translate, task, onChange}: PanelOptions) {
	const textarea = h("textarea", {
		className: "form-control",
		rows: 3,
		spellcheck: false,
		placeholder: translate("sourceComments.placeholder"),
	});
	const content = (): SlotContent => ({
		text: textarea.value,
		commentOut: commentOut.input.checked,
		taskOnly: taskOnly.input.checked,
	});
	const save = (): void => {
		comments.save(slot, task(), content());
		refreshLists();
		onChange();
	};
	const taskOnly = createCheckbox(translate("sourceComments.taskOnly"), save);
	const commentOut = createCheckbox(translate("sourceComments.commentOut"), save);
	const history = h("select", {className: "form-control input-sm"});
	const presets = h("select", {className: "form-control input-sm"});
	const saveButton = h("button", {
		type: "button",
		className: "btn btn-default btn-sm",
		textContent: translate("sourceComments.savePreset"),
	});
	const removeButton = h("button", {
		type: "button",
		className: "btn btn-default btn-sm",
		textContent: translate("sourceComments.removePreset"),
	});

	const fill = (entry: CommentEntry): void => {
		textarea.value = entry.text;
		commentOut.input.checked = entry.commentOut;
		save();
	};

	const refreshLists = (): void => {
		const selected = presets.value;
		history.replaceChildren(
			h("option", {value: "", textContent: translate("sourceComments.restoreHistory")}),
			...comments.history(slot).map((entry, index) => h("option", {
				value: String(index),
				textContent: summarize(entry),
			})),
		);
		presets.replaceChildren(
			h("option", {value: "", textContent: translate("sourceComments.restorePreset")}),
			...comments.presets(slot).map(({name}) => h("option", {value: name, textContent: name})),
		);
		presets.value = selected;
		if (presets.selectedIndex < 0) presets.value = "";
	};

	textarea.addEventListener("change", save);
	history.addEventListener("change", () => {
		const entry = comments.history(slot)[Number(history.value)];
		if (history.value && entry) fill(entry);
	});
	presets.addEventListener("change", () => {
		const preset = comments.presets(slot).find(({name}) => name === presets.value);
		if (preset) fill(preset);
	});
	saveButton.addEventListener("click", () => {
		const name = window.prompt(translate("sourceComments.presetName"), presets.value)?.trim();
		if (!name) return;
		comments.savePreset(slot, {name, text: textarea.value, commentOut: commentOut.input.checked});
		refreshLists();
		presets.value = name;
	});
	removeButton.addEventListener("click", () => {
		if (!presets.value) return;
		comments.removePreset(slot, presets.value);
		presets.value = "";
		refreshLists();
	});

	return {
		element: h(
			"div",
			{className: "cp-comment-slot"},
			h("b", {textContent: translate(SLOT_LABELS[slot])}),
			textarea,
			h("div", {className: "cp-comment-row"}, taskOnly.element, commentOut.element),
			h("div", {className: "cp-comment-row"}, history, presets, saveButton, removeButton),
		),
		reload(): void {
			const stored = comments.content(slot, task());
			textarea.value = stored.text;
			commentOut.input.checked = stored.commentOut;
			taskOnly.input.checked = stored.taskOnly;
			refreshLists();
		},
	};
}

/** 提出欄の下に置く、ヘッダーとフッターの入力欄。 */
export function createCommentPanel(options: PanelOptions): CommentPanel {
	const {state, translate, onApply} = options;
	const slots = [createSlot("header", options), createSlot("footer", options)];
	const warning = h("span", {
		className: "text-danger",
		textContent: translate("sourceComments.unsupported"),
		hidden: true,
	});
	const applyButton = h("button", {
		type: "button",
		className: "btn btn-default btn-sm",
		textContent: translate("sourceComments.apply"),
		onclick: onApply,
	});
	const element = h(
		"details",
		{className: "cp-source-comments", open: state.get(OPEN_KEY) === true},
		h("summary", {textContent: translate("sourceComments.panel")}),
		...slots.map((slot) => slot.element),
		h("p", {className: "help-block", textContent: translate("sourceComments.variables")}),
		h("div", {className: "cp-comment-row"}, applyButton, warning),
	);
	element.addEventListener("toggle", () => state.set(OPEN_KEY, element.open));

	const reload = (): void => {
		for (const slot of slots) slot.reload();
	};
	reload();
	return {
		element,
		reload,
		setUnsupported(unsupported) {
			warning.hidden = !unsupported;
		},
	};
}
