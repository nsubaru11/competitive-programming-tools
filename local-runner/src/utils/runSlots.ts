/** 実行中の分だけ枠を消費し、解放された枠は先頭の待ち手に直接渡す。 */
export class RunSlots {
	private free: number;
	private readonly waiting: Array<() => void> = [];

	constructor(limit: number) {
		if (!Number.isInteger(limit) || limit < 1) throw new RangeError("Run limit must be a positive integer.");
		this.free = limit;
	}

	async run<T>(work: () => Promise<T>): Promise<T> {
		if (this.free > 0) this.free--;
		else await new Promise<void>(resolve => this.waiting.push(resolve));
		try {
			return await work();
		} finally {
			const next = this.waiting.shift();
			if (next) next();
			else this.free++;
		}
	}
}
