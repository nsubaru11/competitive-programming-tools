import type {Guard} from "@domain/validation/guards";

export type StoredValue = object | string | number | boolean | null | undefined;

export interface KeyValueStore {
	get(key: string): unknown;

	set(key: string, value: StoredValue): void;

	/** 他のタブでの変更を通知する。自分のタブでの変更は通知しない。 */
	subscribeRemote(key: string, listener: (value: unknown) => void): void;
}

/** 保存値を読む。形が違う値は、壊れたものとして既定値に置き換える。 */
export function readStored<T>(store: KeyValueStore, key: string, isValid: Guard<T>, fallback: T): T {
	const value = store.get(key);
	return isValid(value) ? value : fallback;
}
