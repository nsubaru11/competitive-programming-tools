import {type Guard, isArrayOf, isBoolean, isObjectOf, isOptional, isRecordOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";

export type CommentSlot = "header" | "footer";

export type CommentEntry = {
	readonly text: string;
	readonly commentOut: boolean;
	/** 複数行コメントで書くか。省略すると詳細設定の既定に従う。 */
	readonly multiline?: boolean;
};

export type NamedComment = CommentEntry & {
	readonly name: string;
};

export type SlotContent = CommentEntry & {
	/** 真なら、この問題だけに保存する。 */
	readonly taskOnly: boolean;
};

const HISTORY_LIMIT = 20;
const EMPTY_ENTRY: CommentEntry = {text: "", commentOut: true};

const isEntry: Guard<CommentEntry> = isObjectOf<CommentEntry>({text: isString, commentOut: isBoolean, multiline: isOptional(isBoolean)});
const isNamed: Guard<NamedComment> = isObjectOf<NamedComment>({
	name: isString,
	text: isString,
	commentOut: isBoolean,
	multiline: isOptional(isBoolean),
});

/** ヘッダーとフッターを別々に記憶する。 */
export class SourceComments {
	private readonly state: KeyValueStore;

	constructor(state: KeyValueStore) {
		this.state = state;
	}

	/** この問題だけの内容があればそれを、なければ前回の内容を返す。 */
	content(slot: CommentSlot, task: string): SlotContent {
		const taskEntry = this.taskEntries(slot)[task];
		if (taskEntry) return {...taskEntry, taskOnly: true};
		return {...readStored(this.state, this.key(slot, "last"), isEntry, EMPTY_ENTRY), taskOnly: false};
	}

	save(slot: CommentSlot, task: string, {text, commentOut, multiline, taskOnly}: SlotContent): void {
		const entry: CommentEntry = {text, commentOut, ...(multiline !== undefined && {multiline})};
		const {[task]: _replaced, ...others} = this.taskEntries(slot);
		this.state.set(this.key(slot, "tasks"), taskOnly ? {...others, [task]: entry} : others);
		if (!taskOnly) this.state.set(this.key(slot, "last"), entry);
		if (text.trim()) this.remember(slot, entry);
	}

	/** 新しいものから順に返す。 */
	history(slot: CommentSlot): readonly CommentEntry[] {
		return readStored(this.state, this.key(slot, "history"), isArrayOf(isEntry), []);
	}

	presets(slot: CommentSlot): readonly NamedComment[] {
		return readStored(this.state, this.key(slot, "presets"), isArrayOf(isNamed), []);
	}

	/** 同じ名前があれば上書きする。 */
	savePreset(slot: CommentSlot, preset: NamedComment): void {
		const others = this.presets(slot).filter(({name}) => name !== preset.name);
		const presets = [...others, preset].toSorted((a, b) => a.name.localeCompare(b.name));
		this.state.set(this.key(slot, "presets"), presets);
	}

	removePreset(slot: CommentSlot, name: string): void {
		this.state.set(this.key(slot, "presets"), this.presets(slot).filter((preset) => preset.name !== name));
	}

	private remember(slot: CommentSlot, entry: CommentEntry): void {
		const others = this.history(slot).filter(({text, commentOut, multiline}) => {
			return text !== entry.text || commentOut !== entry.commentOut || multiline !== entry.multiline;
		});
		this.state.set(this.key(slot, "history"), [entry, ...others].slice(0, HISTORY_LIMIT));
	}

	private taskEntries(slot: CommentSlot): Readonly<Record<string, CommentEntry>> {
		return readStored(this.state, this.key(slot, "tasks"), isRecordOf(isEntry), {});
	}

	private key(slot: CommentSlot, name: string): string {
		return `source-comments:${slot}:${name}`;
	}
}
