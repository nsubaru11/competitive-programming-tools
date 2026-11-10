import {isArrayOf, isObjectOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";

type SavedCode = {
	readonly path: string;
	readonly code: string;
};

const SAVED_CODE_KEY = "easy-test:saved-code";
const isSavedCodes = isArrayOf(isObjectOf<SavedCode>({path: isString, code: isString}));

/** 実行したコードを問題ごとに記憶する。古いものから上限を超えた分を捨てる。 */
export class SavedCodes {
	private readonly state: KeyValueStore;
	private readonly limit: number;

	constructor(state: KeyValueStore, limit: number) {
		this.state = state;
		this.limit = limit;
	}

	save(path: string, code: string): void {
		const others = this.list().filter((saved) => saved.path !== path);
		// slice(-0) は全件を返すので、上限が 0 のときは別に扱う
		this.state.set(SAVED_CODE_KEY, this.limit > 0 ? [...others, {path, code}].slice(-this.limit) : []);
	}

	find(path: string): string | null {
		return this.list().find((saved) => saved.path === path)?.code ?? null;
	}

	private list(): readonly SavedCode[] {
		return readStored(this.state, SAVED_CODE_KEY, isSavedCodes, []);
	}
}
