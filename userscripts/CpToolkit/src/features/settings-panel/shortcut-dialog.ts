import type {MessageKey, Translate} from "@catalog/messages";
import {readModifierSetting, readShortcutSetting} from "@domain/settings/shortcut";
import {createModal, type Modal} from "@ui/dialog/modal";
import {h} from "@ui/element";
import {comboOf, isAltGraphInput, modifiersOf, suspendShortcuts} from "@ui/shortcuts";
import dialogCss from "./shortcut-dialog.css" with {type: "text"};

/** 押されたキー。入力欄に出す形(value)と、照合に使う形(combo)。 */
export type PressedShortcut = {
	readonly value: string;
	readonly combo: string;
};

export type ShortcutDialog = {
	/** 操作に割り当てるキーを入力させる。OK と削除で onCommit を呼ぶ。 */
	edit(params: {action: string; value: string; modifiersOnly: boolean; onCommit: (value: string) => void}): void;
	/** 探すキーを入力させる。キーを押すたびに onSearch を呼び、削除では null を渡す。 */
	search(params: {pressed: PressedShortcut | null; onSearch: (pressed: PressedShortcut | null) => void}): void;
};

type Session = {
	readonly prompt: MessageKey;
	readonly action: string;
	readonly value: string;
	readonly read: (event: KeyboardEvent) => PressedShortcut | null;
	readonly onPress: (pressed: PressedShortcut) => void;
	readonly buttons: readonly (readonly [MessageKey, () => void])[];
};

function readModifiers(event: KeyboardEvent): PressedShortcut | null {
	const value = readModifierSetting(modifiersOf(event).join("+"));
	return value ? {value, combo: value} : null;
}

/** 修飾キーと、ほかのキーの組み合わせ。割り当てられないキーは null。 */
function readCombo(event: KeyboardEvent): PressedShortcut | null {
	const combo = comboOf(event);
	const value = readShortcutSetting(combo);
	return value ? {value, combo} : null;
}

/** キーを押して入力する画面。最初に使うときに作る。 */
export function createShortcutDialog(translate: Translate): ShortcutDialog {
	let modal: Modal | null = null;
	let session: Session | null = null;
	let resume: (() => void) | null = null;
	const action = h("p", {className: "shortcut-action"});
	const field = h("input", {type: "text", readOnly: true, className: "shortcut-input"});
	const prompt = h("p", {className: "shortcut-prompt"});

	field.addEventListener("keydown", (event) => {
		// Esc は割り当てず、この画面だけを閉じる
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			modal?.close();
			return;
		}
		// Tab や Enter も割り当てるキーなので、ブラウザの動きは止める
		event.preventDefault();
		event.stopPropagation();
		if (!session || event.repeat || event.isComposing || isAltGraphInput(event)) return;
		const pressed = session.read(event);
		if (!pressed) return;
		field.value = pressed.value;
		session.onPress(pressed);
	});

	const create = (): Modal => {
		const created = createModal({title: translate("settings.shortcutTitle"), css: dialogCss});
		field.setAttribute("aria-label", translate("settings.shortcutTitle"));
		created.body.append(action, field, prompt);
		// 開き直した後に前の close が届いても、一時停止を続ける
		const dialog = created.body.closest("dialog");
		dialog?.addEventListener("close", () => {
			if (dialog.open) return;
			resume?.();
			resume = null;
		});
		return created;
	};

	const open = (next: Session): void => {
		modal ??= create();
		session = next;
		action.textContent = next.action;
		action.hidden = next.action === "";
		prompt.textContent = translate(next.prompt);
		field.value = next.value;
		modal.footer.replaceChildren(...next.buttons.map(([label, run]) => h("button", {
			type: "button",
			textContent: translate(label),
			onclick: () => {
				run();
				modal?.close();
			},
		})));
		resume?.();
		resume = suspendShortcuts();
		modal.open();
		field.focus();
	};

	return {
		edit({action: name, value, modifiersOnly, onCommit}) {
			open({
				prompt: modifiersOnly ? "settings.shortcutModifierPrompt" : "settings.shortcutPrompt",
				action: name,
				value,
				read: modifiersOnly ? readModifiers : readCombo,
				onPress: () => {
				},
				buttons: [
					["settings.shortcutRemove", () => onCommit("")],
					["settings.shortcutCancel", () => {
					}],
					["settings.shortcutOk", () => onCommit(field.value)],
				],
			});
		},
		search({pressed, onSearch}) {
			open({
				prompt: "settings.shortcutSearchPrompt",
				action: translate("settings.shortcutSearch"),
				value: pressed?.value ?? "",
				// 修飾キーだけの項目も探せるように、修飾キーだけの入力も受け付ける
				read: (event) => readCombo(event) ?? readModifiers(event),
				onPress: onSearch,
				buttons: [
					["settings.shortcutRemove", () => onSearch(null)],
					["settings.shortcutOk", () => {
					}],
				],
			});
		},
	};
}
