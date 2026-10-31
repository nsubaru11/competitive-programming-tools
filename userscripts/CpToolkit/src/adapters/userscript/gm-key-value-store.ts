import type {KeyValueStore, StoredValue} from "@application/ports/key-value-store";

export class GmKeyValueStore implements KeyValueStore {
	get(key: string): unknown {
		return GM_getValue<unknown>(key);
	}

	set(key: string, value: StoredValue): void {
		GM_setValue(key, value);
	}

	subscribeRemote(key: string, listener: (value: unknown) => void): void {
		GM_addValueChangeListener(key, (_name, _oldValue, newValue, remote) => {
			if (remote) listener(newValue);
		});
	}
}
