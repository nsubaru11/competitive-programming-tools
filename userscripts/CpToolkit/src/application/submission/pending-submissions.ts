import {isArrayOf, isNumber, isObjectOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";

export type PendingSubmission = {
	readonly id: string;
	readonly contestId: string;
	readonly taskName: string;
	readonly addedAt: number;
};

const isPendingList = isArrayOf(isObjectOf<PendingSubmission>({
	id: isString,
	contestId: isString,
	taskName: isString,
	addedAt: isNumber,
}));

const PENDING_KEY = "result-notifier:pending";
const NEXT_POLL_KEY = "result-notifier:nextPoll";
const LAST_FOCUS_KEY = "result-notifier:lastFocus";
const PENDING_LIFETIME_MS = 30 * 60 * 1000;
const FOCUS_REFRESH_MS = 1000;
const FOCUS_TIMEOUT_MS = 3000;

/**
 * 判定待ちの提出をタブ間で共有する。通信が重複しないよう、確認は1つのタブだけが行う。
 * 操作中のタブがあれば、そのタブが確認する。通知を画面の内側に出せるので。
 */
export class PendingSubmissions {
	constructor(private readonly state: KeyValueStore) {
	}

	list(now: number): readonly PendingSubmission[] {
		const pending = readStored(this.state, PENDING_KEY, isPendingList, []);
		return pending.filter(({addedAt}) => now - addedAt < PENDING_LIFETIME_MS);
	}

	add(submissions: readonly PendingSubmission[], now: number): void {
		const current = this.list(now);
		const known = new Set(current.map(({id}) => id));
		this.state.set(PENDING_KEY, [...current, ...submissions.filter(({id}) => !known.has(id))]);
	}

	remove(ids: readonly string[], now: number): void {
		const removed = new Set(ids);
		this.state.set(PENDING_KEY, this.list(now).filter(({id}) => !removed.has(id)));
	}

	/** 他のタブで登録や削除があったときに呼ぶ。解除する関数を返す。 */
	subscribe(listener: () => void): () => void {
		return this.state.subscribeRemote(PENDING_KEY, listener);
	}

	markFocused(now: number): void {
		if (now - this.lastFocus() >= FOCUS_REFRESH_MS) this.state.set(LAST_FOCUS_KEY, now);
	}

	clearFocus(): void {
		this.state.set(LAST_FOCUS_KEY, 0);
	}

	/** このタブ以外のタブが操作されていれば真。 */
	isFocusedElsewhere(now: number): boolean {
		return now - this.lastFocus() < FOCUS_TIMEOUT_MS;
	}

	/** 確認してよければ次の確認の時刻を記録して true を返す。 */
	claimPoll(now: number, intervalMs: number): boolean {
		if (now < this.nextPoll()) return false;
		this.state.set(NEXT_POLL_KEY, now + intervalMs);
		return true;
	}

	/** サイトが勧める間隔に合わせて、次の確認を遅らせる。 */
	postponePoll(until: number): void {
		if (until > this.nextPoll()) this.state.set(NEXT_POLL_KEY, until);
	}

	private lastFocus(): number {
		return readStored(this.state, LAST_FOCUS_KEY, isNumber, 0);
	}

	private nextPoll(): number {
		return readStored(this.state, NEXT_POLL_KEY, isNumber, 0);
	}
}
