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
const LAST_POLL_KEY = "result-notifier:lastPoll";
const LAST_FOCUS_KEY = "result-notifier:lastFocus";
const PENDING_LIFETIME_MS = 10 * 60 * 1000;
const INACTIVE_LIMIT_MS = 5 * 60 * 1000;

/** 判定待ちの提出をタブ間で共有する。通信が重複しないよう、確認は1つのタブだけが行う。 */
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

	markFocused(now: number): void {
		this.state.set(LAST_FOCUS_KEY, now);
	}

	/** 確認してよければ時刻を記録して true を返す。長く操作がなければ確認しない。 */
	claimPoll(now: number, intervalMs: number): boolean {
		const lastFocus = Number(this.state.get(LAST_FOCUS_KEY) ?? 0);
		const lastPoll = Number(this.state.get(LAST_POLL_KEY) ?? 0);
		if (now - lastFocus > INACTIVE_LIMIT_MS || now - lastPoll < intervalMs) return false;
		this.state.set(LAST_POLL_KEY, now);
		return true;
	}
}
