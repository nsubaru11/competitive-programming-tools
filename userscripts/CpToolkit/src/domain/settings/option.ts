import {parseStoredObject} from "@atcoder-tools/shared";

type OptionBase<T, L extends string> = {
	readonly defaultValue: T;
	readonly label: L;
	/** 保存値や入力値を検証して正規化する。不正な値は undefined を返す。 */
	normalize(value: unknown): T | undefined;
};

export type BooleanOption<L extends string = string> = OptionBase<boolean, L> & {readonly kind: "boolean"};
export type TextOption<L extends string = string> = OptionBase<string, L> & {readonly kind: "text"};
export type ColorOption<L extends string = string> = OptionBase<string, L> & {readonly kind: "color"};
export type NumberOption<L extends string = string> = OptionBase<number, L> & {
	readonly kind: "number";
	readonly min?: number;
	readonly max?: number;
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
		{validate}: {validate?: (value: string) => boolean} = {},
	): TextOption<L> {
		return {
			kind: "text",
			defaultValue,
			label,
			normalize(value) {
				if (typeof value !== "string") return undefined;
				const text = value.trim();
				return !validate || validate(text) ? text : undefined;
			},
		};
	},
	color<L extends string>(defaultValue: string, label: L): ColorOption<L> {
		return {kind: "color", defaultValue, label, normalize: normalizeColor};
	},
	number<L extends string>(
		defaultValue: number,
		label: L,
		{min = -Infinity, max = Infinity}: {min?: number; max?: number} = {},
	): NumberOption<L> {
		return {
			kind: "number",
			defaultValue,
			label,
			min,
			max,
			normalize: (value) => (typeof value === "number" && value >= min && value <= max ? value : undefined),
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

/** 保存値を定義に合わせて補正する。未保存や不正な値は既定値に置き換え、未知のキーは捨てる。 */
export function normalizeOptions<S extends OptionSet>(schema: S, stored: unknown): OptionValues<S> {
	const source = parseStoredObject<Record<string, unknown>>(stored);
	const entries = Object.entries(schema).map(([key, definition]) => {
		return [key, definition.normalize(source[key]) ?? definition.defaultValue];
	});
	return Object.fromEntries(entries) as OptionValues<S>;
}
