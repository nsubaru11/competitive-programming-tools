import {isNumber, isRecordOf} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";

const STARTS_KEY = "virtual-timer:starts";
const isStarts = isRecordOf(isNumber);

/** バーチャル参加の開始時刻を記憶する。参加のページを開いたときに更新する。 */
export class VirtualParticipations {
	constructor(private readonly state: KeyValueStore) {
	}

	startOf(contestId: string): number | null {
		return this.starts()[contestId] ?? null;
	}

	record(contestId: string, startMs: number): void {
		this.state.set(STARTS_KEY, {...this.starts(), [contestId]: startMs});
	}

	forget(contestId: string): void {
		const {[contestId]: _forgotten, ...rest} = this.starts();
		this.state.set(STARTS_KEY, rest);
	}

	private starts(): Readonly<Record<string, number>> {
		return readStored(this.state, STARTS_KEY, isStarts, {});
	}
}
