export type StoredValue = object | string | number | boolean | null | undefined;

export interface KeyValueStore {
	get(key: string): unknown;

	set(key: string, value: StoredValue): void;

	/** 他のタブでの変更を通知する。自分のタブでの変更は通知しない。 */
	subscribeRemote(key: string, listener: (value: unknown) => void): void;
}
