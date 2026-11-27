const MODIFIERS = ["Ctrl", "Shift", "Alt", "Cmd"] as const;
/** 修飾キーの別名。Mac の option は Alt、command は Cmd(Windows では Windows キー)として書ける。 */
const MODIFIER_ALIASES: Readonly<Record<string, (typeof MODIFIERS)[number]>> = {
	ctrl: "Ctrl",
	shift: "Shift",
	alt: "Alt", option: "Alt",
	cmd: "Cmd", command: "Cmd",
};
const NAMED_KEYS: Readonly<Record<string, string>> = {
	enter: "Enter",
	escape: "Escape",
	esc: "Escape",
	space: " ",
	tab: "Tab",
	backspace: "Backspace",
	delete: "Delete",
	arrowleft: "ArrowLeft",
	left: "ArrowLeft",
	arrowright: "ArrowRight",
	right: "ArrowRight",
	arrowup: "ArrowUp",
	up: "ArrowUp",
	arrowdown: "ArrowDown",
	down: "ArrowDown",
};

/** 3.0 まで、キーを使わないことを表していた値。保存済みの設定は空欄として読む。 */
const LEGACY_NO_SHORTCUT = "none";
/** 照合に使う名前のうち、設定や画面では短く書くもの。 */
const SETTING_KEY_NAMES: Readonly<Record<string, string>> = {
	" ": "Space",
	ArrowLeft: "Left",
	ArrowRight: "Right",
	ArrowUp: "Up",
	ArrowDown: "Down",
};

/**
 * 利用者が書いたキーの組み合わせ(例: ctrl+i、Ctrl+Shift+Enter)を、キー操作の照合に使う形にそろえる。
 * 修飾キーは Ctrl、Shift、Alt、Cmd の順にし、文字のキーは大文字にする。読めなければ null。
 */
export function normalizeShortcut(text: string): string | null {
	const parts = text.split("+").map((part) => part.trim());
	const key = parts.pop() ?? "";
	const modifiers = readModifiers(parts);
	if (!modifiers) return null;
	const named = NAMED_KEYS[key.toLowerCase()];
	const normalizedKey = named ?? (/^\S$/u.test(key) ? key.toUpperCase() : /^F([1-9]|1[0-2])$/i.test(key) ? key.toUpperCase() : null);
	if (!normalizedKey) return null;
	return [...modifiers, normalizedKey].join("+");
}

/** 修飾キーを決まった順に並べる。修飾キーでないものがあれば null。 */
function readModifiers(parts: readonly string[]): string[] | null {
	const modifiers = new Set<string>();
	for (const part of parts) {
		const modifier = MODIFIER_ALIASES[part.toLowerCase()];
		if (!modifier) return null;
		modifiers.add(modifier);
	}
	return MODIFIERS.filter((name) => modifiers.has(name));
}

/**
 * 修飾キーだけの組み合わせ(例: ctrl+alt)をそろえる。後ろに数字や文字を足して使う設定に使う。
 * 修飾キーが1つも無いか、読めなければ null。
 */
export function normalizeModifiers(text: string): string | null {
	const modifiers = readModifiers(text.split("+").map((part) => part.trim()));
	return modifiers && modifiers.length > 0 ? modifiers.join("+") : null;
}

/** 保存する値。空欄はキーを使わない。キーとして読めなければ undefined。 */
export function readShortcutSetting(text: string): string | undefined {
	if (isUnused(text)) return "";
	const combo = normalizeShortcut(text);
	if (combo === null) return undefined;
	const parts = combo.split("+");
	const key = parts.pop() ?? "";
	return [...parts, SETTING_KEY_NAMES[key] ?? key].join("+");
}

/** 修飾キーだけの設定の、保存する値。空欄はキーを使わない。読めなければ undefined。 */
export function readModifierSetting(text: string): string | undefined {
	return isUnused(text) ? "" : normalizeModifiers(text) ?? undefined;
}

function isUnused(text: string): boolean {
	return text === "" || text.toLowerCase() === LEGACY_NO_SHORTCUT;
}

/**
 * 設定の値が、押したキー(照合の形。修飾キーだけのこともある)に当たるか。
 * suffixes のある設定は修飾キーだけを保存するので、後ろに続けるキーまで押した組み合わせにも当たる。
 */
export function matchesShortcut(value: string, pressed: string, suffixes?: readonly string[]): boolean {
	if (!suffixes) return value !== "" && normalizeShortcut(value) === pressed;
	const modifiers = normalizeModifiers(value);
	return modifiers !== null && (pressed === modifiers || suffixes.some((suffix) => pressed === `${modifiers}+${suffix}`));
}
