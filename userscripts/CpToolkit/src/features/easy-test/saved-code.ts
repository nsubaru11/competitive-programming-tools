import type {KeyValueStore} from "@application/ports/key-value-store";

type SavedCode = {
	readonly path: string;
	readonly code: string;
};

const SAVED_CODE_KEY = "easy-test:saved-code";

/** 実行したコードを問題ごとに記憶する。古いものから上限を超えた分を捨てる。 */
export class SavedCodes {
	constructor(private readonly state: KeyValueStore, private readonly limit: number) {
	}

	private list(): readonly SavedCode[] {
		return (this.state.get(SAVED_CODE_KEY) ?? []) as readonly SavedCode[];
	}

	save(path: string, code: string): void {
		const others = this.list().filter((saved) => saved.path !== path);
		this.state.set(SAVED_CODE_KEY, [...others, {path, code}].slice(-this.limit));
	}

	find(path: string): string | null {
		return this.list().find((saved) => saved.path === path)?.code ?? null;
	}
}
