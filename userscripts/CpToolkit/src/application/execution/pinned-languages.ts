import {type KeyValueStore, readStored} from "@application/ports/key-value-store";
import {isArrayOf, isString} from "@domain/validation/guards";

const PINNED_KEY = "language-buttons:pinned";
const isPinned = isArrayOf(isString);

/**
 * ボタンを置く言語の ID。
 * ページにない ID も残すので、言語の少ないコンテストを開いても選択は失われない。
 */
export class PinnedLanguages {
	private readonly state: KeyValueStore;

	constructor(state: KeyValueStore) {
		this.state = state;
	}

	ids(): ReadonlySet<string> {
		return new Set(readStored(this.state, PINNED_KEY, isPinned, []));
	}

	set(id: string, pinned: boolean): void {
		const ids = new Set(this.ids());
		if (pinned) ids.add(id);
		else ids.delete(id);
		this.state.set(PINNED_KEY, [...ids]);
	}
}
