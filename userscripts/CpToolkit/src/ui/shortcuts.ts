/** 処理したキー操作なら true を返す。false ならサイトへそのまま渡す。 */
export type ShortcutHandler = () => boolean;

type Shortcut = {
	readonly handler: ShortcutHandler;
	readonly inTextFields: boolean;
};

const EDITOR_ELEMENTS = ".ace_editor, .monaco-editor, #editor, #editor-div";

const shortcuts = new Map<string, Shortcut>();
let listening = false;

function comboOf(event: KeyboardEvent): string {
	const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
	return [event.ctrlKey && "Ctrl", event.shiftKey && "Shift", event.altKey && "Alt", key].filter(Boolean).join("+");
}

function isTextField(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const isEditable = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
	return isEditable && target.closest(EDITOR_ELEMENTS) === null;
}

function onKeyDown(event: KeyboardEvent): void {
	const shortcut = shortcuts.get(comboOf(event));
	if (!shortcut || (!shortcut.inTextFields && isTextField(event.target))) return;
	if (!shortcut.handler()) return;
	event.preventDefault();
	event.stopPropagation();
}

/**
 * キー操作は修飾キーまで完全に一致したときだけ実行する。
 * 同じキーを別の機能が登録すると、後の登録で置き換わる。
 * 入力欄の中でも実行するなら inTextFields を指定する。
 */
export function registerShortcut(combo: string, handler: ShortcutHandler, {inTextFields = false} = {}): () => void {
	if (!listening) {
		document.addEventListener("keydown", onKeyDown, true);
		listening = true;
	}
	shortcuts.set(combo, {handler, inTextFields});
	return () => shortcuts.delete(combo);
}
