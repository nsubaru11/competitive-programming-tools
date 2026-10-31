import type {KeyValueStore, StoredValue} from "@application/ports/key-value-store";
import type {Logger} from "@application/ports/logger";
import type {PageLifecycle} from "@application/ports/page-lifecycle";

export class MemoryStore implements KeyValueStore {
	private readonly values = new Map<string, unknown>();
	private readonly listeners = new Map<string, (value: unknown) => void>();

	get(key: string): unknown {
		return this.values.get(key);
	}

	set(key: string, value: StoredValue): void {
		this.values.set(key, value);
	}

	subscribeRemote(key: string, listener: (value: unknown) => void): void {
		this.listeners.set(key, listener);
	}

	/** 別のタブで値が変わった状況を再現する。 */
	changeRemotely(key: string, value: unknown): void {
		this.values.set(key, value);
		this.listeners.get(key)?.(value);
	}
}

export const immediateLifecycle: PageLifecycle = {
	reach: () => Promise.resolve(),
};

export class RecordingLogger implements Logger {
	readonly errors: string[] = [];

	error(message: string): void {
		this.errors.push(message);
	}
}
