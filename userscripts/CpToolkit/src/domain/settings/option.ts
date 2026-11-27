import {parseStoredObject} from "@atcoder-tools/shared";
import {readModifierSetting, readShortcutSetting} from "./shortcut";

type OptionBase<T, L extends string> = {
	readonly defaultValue: T;
	readonly label: L;
	/** 不正な値を入力したときの案内。省略すると共通の文言を表示する。 */
	readonly invalidMessage?: L;
	/** 保存値や入力値を検証して正規化する。不正な値は undefined を返す。 */
	normalize(value: unknown): T | undefined;
	/** 設定画面に表示するサイト。省略すると、機能が動くすべてのサイトで表示する。 */
	readonly sites?: readonly string[];
	/** 全サイトで同じ値を使う(Local Runner の URL など)。省略するとサイトごとに値を持つ。 */
	readonly shared?: boolean;
};

export type BooleanOption<L extends string = string> = OptionBase<boolean, L> & {readonly kind: "boolean"};
export type TextOption<L extends string = string> = OptionBase<string, L> & {readonly kind: "text"};
export type ColorOption<L extends string = string> = OptionBase<string, L> & {readonly kind: "color"};
export type NumberOption<L extends string = string> = OptionBase<number, L> & {
	readonly kind: "number";
	readonly min?: number;
	readonly max?: number;
	/** 整数だけを受け付けるか(件数など)。 */
	readonly integer?: boolean;
};
/** 設定画面でショートカットキーをまとめる見出し。 */
export type ShortcutGroup<L extends string = string> = {
	readonly title: L;
	/** 見出しの下に添える補足。指定したサイトの設定画面だけに出す。 */
	readonly note?: {readonly message: L; readonly sites: readonly string[]};
};
export type ShortcutOption<L extends string = string> = OptionBase<string, L> & {
	readonly kind: "shortcut";
	readonly group: ShortcutGroup<L>;
	/** 修飾キーだけを保存する項目の、後ろに続けて押すキー。 */
	readonly suffixes?: readonly string[];
};
export type SelectChoice<T extends string = string, L extends string = string> = {
	readonly value: T;
	readonly label: L;
};
export type SelectOption<T extends string = string, L extends string = string> = OptionBase<T, L> & {
	readonly kind: "select";
	readonly choices: readonly SelectChoice<T, L>[];
};

export type OptionDefinition<L extends string = string> =
	| BooleanOption<L>
	| TextOption<L>
	| ColorOption<L>
	| NumberOption<L>
	| ShortcutOption<L>
	| SelectOption<string, L>;

export type OptionSet<L extends string = string> = Readonly<Record<string, OptionDefinition<L>>>;

export type OptionValues<S extends OptionSet> = { readonly [K in keyof S]: S[K]["defaultValue"] };

const SHORT_HEX_COLOR_PATTERN = /^#[0-9a-f]{3}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;

function normalizeColor(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const color = value.trim().toLowerCase();
	if (HEX_COLOR_PATTERN.test(color)) return color;
	if (!SHORT_HEX_COLOR_PATTERN.test(color)) return undefined;
	return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
}

export const option = {
	boolean<L extends string>(defaultValue: boolean, label: L): BooleanOption<L> {
		return {
			kind: "boolean",
			defaultValue,
			label,
			normalize: (value) => (typeof value === "boolean" ? value : undefined),
		};
	},
	text<L extends string>(
		defaultValue: string,
		label: L,
		{validate, invalidMessage}: {validate?: (value: string) => boolean; invalidMessage?: L} = {},
	): TextOption<L> {
		return {
			kind: "text",
			defaultValue,
			label,
			...(invalidMessage !== undefined && {invalidMessage}),
			normalize(value) {
				if (typeof value !== "string") return undefined;
				const text = value.trim();
				return !validate || validate(text) ? text : undefined;
			},
		};
	},
	shortcut<L extends string>(
		defaultValue: string,
		label: L,
		{group, suffixes}: {group: ShortcutGroup<L>; suffixes?: readonly string[]},
	): ShortcutOption<L> {
		const read = suffixes ? readModifierSetting : readShortcutSetting;
		return {
			kind: "shortcut",
			defaultValue,
			label,
			group,
			...(suffixes !== undefined && {suffixes}),
			normalize: (value) => (typeof value === "string" ? read(value.trim()) : undefined),
		};
	},
	color<L extends string>(defaultValue: string, label: L): ColorOption<L> {
		return {kind: "color", defaultValue, label, normalize: normalizeColor};
	},
	number<L extends string>(
		defaultValue: number,
		label: L,
		{min = -Infinity, max = Infinity, integer = false}: {min?: number; max?: number; integer?: boolean} = {},
	): NumberOption<L> {
		return {
			kind: "number",
			defaultValue,
			label,
			min,
			max,
			integer,
			normalize: (value) => (typeof value === "number" && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : undefined),
		};
	},
	select<T extends string, L extends string>(
		defaultValue: T,
		label: L,
		choices: readonly SelectChoice<T, L>[],
	): SelectOption<T, L> {
		return {
			kind: "select",
			defaultValue,
			label,
			choices,
			normalize: (value) => choices.find((choice) => choice.value === value)?.value,
		};
	},
};

/** 項目を、指定したサイトの設定画面だけに表示する。 */
export function onSites<D extends OptionDefinition>(definition: D, sites: readonly string[]): D {
	return {...definition, sites};
}

/** 項目を、全サイトで同じ値を使うものにする。 */
export function sharedAcrossSites<D extends OptionDefinition>(definition: D): D {
	return {...definition, shared: true};
}

/** 項目をサイトの設定画面に表示するか。 */
export function isOptionOnSite(definition: OptionDefinition, site: string | null): boolean {
	return site === null || definition.sites === undefined || definition.sites.includes(site);
}

/** 保存値を定義に合わせて補正する。未保存や不正な値は既定値に置き換え、未知のキーは捨てる。 */
export function normalizeOptions<S extends OptionSet>(schema: S, stored: unknown): OptionValues<S> {
	const source = parseStoredObject<Record<string, unknown>>(stored);
	const entries = Object.entries(schema).map(([key, definition]) => {
		return [key, definition.normalize(source[key]) ?? definition.defaultValue];
	});
	return Object.fromEntries(entries) as OptionValues<S>;
}
