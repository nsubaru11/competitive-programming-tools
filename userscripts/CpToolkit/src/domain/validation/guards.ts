/** 保存値など、形が保証されない値を確かめる関数。 */
export type Guard<T> = (value: unknown) => value is T;

export const isString: Guard<string> = (value): value is string => typeof value === "string";
export const isNumber: Guard<number> = (value): value is number => typeof value === "number";

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArrayOf<T>(isItem: Guard<T>): Guard<readonly T[]> {
	return (value): value is readonly T[] => Array.isArray(value) && value.every(isItem);
}

export function isRecordOf<T>(isItem: Guard<T>): Guard<Readonly<Record<string, T>>> {
	return (value): value is Readonly<Record<string, T>> => isPlainObject(value) && Object.values(value).every(isItem);
}

/** 指定した項目がすべて正しいオブジェクトか判定する。それ以外の項目は見ない。 */
export function isObjectOf<T extends object>(fields: {readonly [K in keyof T]: Guard<T[K]>}): Guard<T> {
	const entries: ReadonlyArray<readonly [string, Guard<unknown>]> = Object.entries(fields);
	return (value): value is T => isPlainObject(value) && entries.every(([key, isField]) => isField(value[key]));
}
