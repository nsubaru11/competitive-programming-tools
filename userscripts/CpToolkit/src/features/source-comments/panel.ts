import type {MessageKey, Translate} from "@catalog/messages";
import type {CommentEntry, CommentSlot, SlotContent, SourceComments} from "@application/source/source-comments";
import {createModal} from "@ui/dialog/modal";
import {h} from "@ui/element";
import {showToast} from "@ui/toast/toast";
import css from "./source-comments.css" with {type: "text"};

const SLOT_LABELS: Readonly<Record<CommentSlot, MessageKey>> = {
	header: "sourceComments.header",
	footer: "sourceComments.footer",
};
const LABEL_LENGTH = 40;
const TOAST_DURATION_MS = 10_000;

type PanelOptions = {
	readonly comments: SourceComments;
	readonly translate: Translate;
	readonly task: () => string;
	readonly onChange: () => void;
	readonly onApply: () => void;
};

export type CommentPanel = {
	/** 入力画面を開くボタン。 */
	readonly button: HTMLElement;
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
	return {element: h("label", {}, input, label), input};
}

function createSlot(slot: CommentSlot, {comments, translate, task, onChange}: PanelOptions) {
	const textarea = h("textarea", {spellcheck: false, placeholder: translate("sourceComments.placeholder")});
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
	const history = h("select");
	const presets = h("select");
	const saveButton = h("button", {type: "button", textContent: translate("sourceComments.savePreset")});
	const removeButton = h("button", {type: "button", textContent: translate("sourceComments.removePreset")});

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
			"section",
			{className: "comment-slot"},
			h("h3", {textContent: translate(SLOT_LABELS[slot])}),
			textarea,
			h("div", {className: "comment-row"}, taskOnly.element, commentOut.element),
			h("div", {className: "comment-row"}, history),
			h("div", {className: "comment-row"}, presets, saveButton, removeButton),
		),
		hasText: (): boolean => textarea.value.trim() !== "",
		reload(): void {
			const stored = comments.content(slot, task());
			textarea.value = stored.text;
			commentOut.input.checked = stored.commentOut;
			taskOnly.input.checked = stored.taskOnly;
			refreshLists();
		},
	};
}

/** ヘッダーとフッターの入力画面と、それを開くボタン。内容があるとボタンの色を変える。 */
export function createCommentPanel(options: PanelOptions): CommentPanel {
	const {translate, onApply} = options;
	const modal = createModal({
		title: translate("sourceComments.panel"),
		closeLabel: translate("settings.close"),
		css,
	});
	const button = h("button", {
		type: "button",
		className: "btn btn-default btn-sm",
		textContent: translate("sourceComments.panel"),
		onclick: () => modal.open(),
	});
	const updateButton = (): void => {
		const filled = slots.some((slot) => slot.hasText());
		button.classList.toggle("btn-info", filled);
		button.classList.toggle("btn-default", !filled);
	};
	const slotOptions = {
		...options,
		onChange() {
			updateButton();
			options.onChange();
		},
	};
	const slots = [createSlot("header", slotOptions), createSlot("footer", slotOptions)];
	const warning = h("span", {
		className: "comment-warning",
		textContent: translate("sourceComments.unsupported"),
		hidden: true,
	});

	modal.body.append(
		h("div", {className: "comment-slots"}, ...slots.map((slot) => slot.element)),
		h("p", {className: "comment-help", textContent: translate("sourceComments.variables")}),
	);
	modal.footer.append(warning, h("span", {className: "comment-spacer"}), h("button", {
		type: "button",
		className: "primary",
		textContent: translate("sourceComments.apply"),
		onclick() {
			onApply();
			modal.close();
		},
	}));

	const reload = (): void => {
		for (const slot of slots) slot.reload();
		updateButton();
	};
	reload();
	return {
		button,
		reload,
		setUnsupported(unsupported) {
			if (unsupported && warning.hidden) {
				showToast({
					title: translate("sourceComments.notInserted"),
					detail: translate("sourceComments.unsupported"),
					tone: "warning",
					durationMs: TOAST_DURATION_MS,
				});
			}
			warning.hidden = !unsupported;
		},
	};
}
