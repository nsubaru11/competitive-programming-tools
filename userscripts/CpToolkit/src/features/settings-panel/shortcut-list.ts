import type {MessageKey, Translate} from "@catalog/messages";
import type {ShortcutGroup, ShortcutOption} from "@domain/settings/option";
import {matchesShortcut} from "@domain/settings/shortcut";
import {h} from "@ui/element";
import type {PressedShortcut, ShortcutDialog} from "./shortcut-dialog";

export type ShortcutEntry = {
	readonly definition: ShortcutOption<MessageKey>;
	readonly value: string;
	readonly onChange: (value: string) => void;
};

export type ShortcutListParams = {
	readonly entries: readonly ShortcutEntry[];
	/** 表示している設定のサイト。サイトを分けないなら null。 */
	readonly site: string | null;
	readonly translate: Translate;
	readonly dialog: ShortcutDialog;
};

type Row = {
	readonly element: HTMLElement;
	matches(combo: string): boolean;
};

/** キーを1つずつ枠に入れて並べる。割り当てが無ければ空。 */
function createKeyCaps(value: string): HTMLElement {
	const keys = value === "" ? [] : value.split("+");
	return h("span", {className: "shortcut-keys"}, ...keys.map((key) => h("kbd", {textContent: key})));
}

/** 操作の行。ダブルクリック、右クリック、Enter でキーを入力する画面を開く。 */
function createRow({definition, value, onChange}: ShortcutEntry, {translate, dialog}: ShortcutListParams, refreshFilter: () => void): Row {
	let current = value;
	let keys = createKeyCaps(current);
	const label = translate(definition.label);
	const element = h("button", {type: "button", className: "shortcut-row"}, h("span", {textContent: label}), keys);
	const edit = (event: Event): void => {
		event.preventDefault();
		dialog.edit({
			action: label,
			value: current,
			modifiersOnly: definition.suffixes !== undefined,
			onCommit(next) {
				current = next;
				const updated = createKeyCaps(current);
				keys.replaceWith(updated);
				keys = updated;
				onChange(next);
				refreshFilter();
			},
		});
	};
	element.addEventListener("dblclick", edit);
	element.addEventListener("contextmenu", edit);
	element.addEventListener("keydown", (event) => {
		if (event.key === "Enter" && !event.repeat) edit(event);
	});
	return {element, matches: (combo) => matchesShortcut(current, combo, definition.suffixes)};
}

/** ショートカットキーを見出しごとに並べ、押したキーで絞り込めるようにする。 */
export function createShortcutList(params: ShortcutListParams): HTMLElement {
	const {entries, site, translate, dialog} = params;
	let pressed: PressedShortcut | null = null;
	const refreshFilter = () => {
		if (pressed) filter(pressed);
	};
	const groups = [...Map.groupBy(entries, ({definition}) => definition.group)].map(([group, members]) => {
		const rows = members.map((entry) => createRow(entry, params, refreshFilter));
		return {element: createGroup(group, rows, site, translate), rows};
	});

	const searching = h("span", {className: "shortcut-searching", hidden: true});
	const noMatch = h("p", {className: "empty", textContent: translate("settings.shortcutNoMatch"), hidden: true});
	const filter = (next: PressedShortcut | null): void => {
		pressed = next;
		let found = false;
		for (const {element, rows} of groups) {
			let visible = false;
			for (const row of rows) {
				row.element.hidden = next !== null && !row.matches(next.combo);
				visible ||= !row.element.hidden;
			}
			element.hidden = !visible;
			// 見つかった操作は、閉じた見出しの中にあっても見せる
			if (next !== null && visible) element.open = true;
			found ||= visible;
		}
		noMatch.hidden = found;
		searching.hidden = next === null;
		searching.replaceChildren(
			h("span", {textContent: translate("settings.shortcutSearching")}),
			createKeyCaps(next?.value ?? ""),
			h("button", {type: "button", textContent: translate("settings.shortcutRemove"), onclick: () => filter(null)}),
		);
	};
	const search = h("button", {
		type: "button",
		className: "shortcut-search",
		textContent: translate("settings.shortcutSearch"),
		onclick: () => dialog.search({pressed, onSearch: filter}),
	});

	return h(
		"div",
		{className: "shortcut-list"},
		h("div", {className: "shortcut-toolbar"}, searching, search),
		...groups.map(({element}) => element),
		noMatch,
	);
}

function createGroup(group: ShortcutGroup<MessageKey>, rows: readonly Row[], site: string | null, translate: Translate): HTMLDetailsElement {
	const showNote = group.note && (site === null || group.note.sites.includes(site));
	return h(
		"details",
		{className: "shortcut-group", open: true},
		h("summary", {textContent: translate(group.title)}),
		...showNote && group.note ? [h("p", {className: "shortcut-note", textContent: translate(group.note.message)})] : [],
		...rows.map((row) => row.element),
	);
}
