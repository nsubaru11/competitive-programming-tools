/** 処理したキー操作なら true を返す。false ならサイトへそのまま渡す。 */
export type ShortcutHandler = () => boolean;

const EDITOR_ELEMENTS = ".ace_editor, .monaco-editor, #editor, #editor-div";

const handlers = new Map<string, ShortcutHandler>();
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
	if (isTextField(event.target)) return;
	if (!handlers.get(comboOf(event))?.()) return;
	event.preventDefault();
	event.stopPropagation();
}

/**
 * キー操作は修飾キーまで完全に一致したときだけ実行する。
 * 同じキーを別の機能が登録すると、後の登録で置き換わる。
 */
export function registerShortcut(combo: string, handler: ShortcutHandler): () => void {
	if (!listening) {
		document.addEventListener("keydown", onKeyDown, true);
		listening = true;
	}
	handlers.set(combo, handler);
	return () => handlers.delete(combo);
}
