import {isNumber, isRecordOf} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";

const SEEN_KEY = "clar-notifier:seen";
const LAST_POLL_KEY = "clar-notifier:lastPoll";
const isSeenCounts = isRecordOf(isNumber);

/** 通知済みの Clar の件数をタブ間で共有する。通信が重複しないよう、確認は1つのタブだけが行う。 */
export class ClarificationCounter {
	constructor(private readonly state: KeyValueStore) {
	}

	/** 確認してよければ時刻を記録して true を返す。 */
	claimPoll(now: number, intervalMs: number): boolean {
		if (now - readStored(this.state, LAST_POLL_KEY, isNumber, 0) < intervalMs) return false;
		this.state.set(LAST_POLL_KEY, now);
		return true;
	}

	/** 今回の件数を記録し、前回より増えた件数を返す。 */
	update(contestId: string, count: number): number {
		const seen = readStored(this.state, SEEN_KEY, isSeenCounts, {});
		const previous = seen[contestId] ?? 0;
		if (count !== previous) this.state.set(SEEN_KEY, {...seen, [contestId]: count});
		return Math.max(count - previous, 0);
	}
}
