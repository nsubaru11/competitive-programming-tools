/** 処理したキー操作なら true を返す。false ならサイトへそのまま渡す。 */
export type ShortcutHandler = () => boolean;

type Shortcut = {
	readonly handler: ShortcutHandler;
	readonly inTextFields: boolean;
};

const EDITOR_ELEMENTS = ".ace_editor, .monaco-editor, #editor, #editor-div";

const POSITIONAL_SYMBOLS: Readonly<Record<string, string>> = {Comma: ",", Period: "."};
/** Shift で変わる括弧。JIS と US で同じ組になる。設定は Shift を押さない記号で書く(例: Ctrl+Shift+[)。 */
const SHIFTED_SYMBOLS: Readonly<Record<string, string>> = {"{": "[", "}": "]"};
/** Mac の Option は AltGraph として届くことがあるが、AltGr とは違い Ctrl と組み合わせても文字を入力しない。 */
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent);

const shortcuts = new Map<string, Shortcut>();
let listening = false;
let suspensions = 0;

/**
 * 文字と数字のキーは、Shift や Alt で変わる文字ではなく、押したキーの位置(event.code)で読む。
 * Shift+1 が「!」になったり、Mac の Option で別の文字になったりしても、設定の Shift+1 と照合できるようにする。
 */
function keyOf(event: KeyboardEvent): string {
	if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
	if (/^Digit[0-9]$/.test(event.code)) return event.code.slice(5);
	// 記号は配列で位置が違うので、JIS と US で同じ位置のものだけを位置で読む
	const symbol = POSITIONAL_SYMBOLS[event.code] ?? (event.shiftKey ? SHIFTED_SYMBOLS[event.key] : undefined);
	if (symbol) return symbol;
	return event.key.length === 1 ? event.key.toUpperCase() : event.key;
}

/** 押している修飾キー。 */
export function modifiersOf(event: KeyboardEvent): string[] {
	return [event.ctrlKey && "Ctrl", event.shiftKey && "Shift", event.altKey && "Alt", event.metaKey && "Cmd"].filter((name) => name !== false);
}

/** 押したキーの組み合わせ。照合と、キーを入力して設定する欄で同じ読み方をする。 */
export function comboOf(event: KeyboardEvent): string {
	return [...modifiersOf(event), keyOf(event)].join("+");
}

/** Windows では AltGr が Ctrl+Alt として届くので、AltGr で入力する文字(@ や { など)はキー操作として扱わない。 */
export function isAltGraphInput(event: KeyboardEvent): boolean {
	return !IS_MAC && event.ctrlKey && event.altKey && event.getModifierState("AltGraph");
}

function isTextField(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const isEditable = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
	return isEditable && target.closest(EDITOR_ELEMENTS) === null;
}

function onKeyDown(event: KeyboardEvent): void {
	if (suspensions > 0 || isAltGraphInput(event)) return;
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
	const shortcut = {handler, inTextFields};
	shortcuts.set(combo, shortcut);
	return () => {
		if (shortcuts.get(combo) === shortcut) shortcuts.delete(combo);
	};
}

/** 返す関数を呼ぶまで、登録したキー操作を実行しない。キーを入力して設定する間に使う。 */
export function suspendShortcuts(): () => void {
	suspensions++;
	let resumed = false;
	return () => {
		if (resumed) return;
		resumed = true;
		suspensions = Math.max(0, suspensions - 1);
	};
}

/** 登録をすべて外す。テストで、前のテストの登録を持ち越さないために使う。 */
export function clearShortcuts(): void {
	shortcuts.clear();
	suspensions = 0;
}
