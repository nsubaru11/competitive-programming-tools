/** 同時に実行できない処理を、受け付けた順に1件ずつ実行する。失敗しても次の処理は止めない。 */
export class SerialQueue {
	private last: Promise<unknown> = Promise.resolve();

	run<T>(task: () => Promise<T>): Promise<T> {
		const result = this.last.then(task);
		this.last = result.catch(() => undefined);
		return result;
	}
}
