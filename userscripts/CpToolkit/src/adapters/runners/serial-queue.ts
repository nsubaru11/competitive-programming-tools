/** 同時に実行できない処理を、受け付けた順に1件ずつ実行する。失敗しても次の処理は止めない。 */
export class SerialQueue {
	private last: Promise<unknown> = Promise.resolve();

	run<T>(task: () => Promise<T>): Promise<T> {
		const result = this.last.then(task);
		this.last = result.catch(() => undefined);
		return result;
	}
}

/** 同じサイトのタブの間でも、受け付けた順に1件ずつ実行する。Web Locks がなければタブの中だけで順番を守る。 */
export class CrossTabQueue {
	private readonly queue = new SerialQueue();
	private readonly lockName: string;

	constructor(lockName: string) {
		this.lockName = lockName;
	}

	/** Web Locks はタブの中の要求も受け付けた順に並べるので、ここで並べるのは Web Locks がないときだけ。 */
	run<T>(task: () => Promise<T>): Promise<T> {
		if (!navigator.locks) return this.queue.run(task);
		return navigator.locks.request(this.lockName, task) as Promise<T>;
	}
}
