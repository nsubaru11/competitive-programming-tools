import type {Ticker} from "@application/ports/services";

const WORKER_SOURCE = "onmessage = ({data}) => setInterval(() => postMessage(0), data);";

function tickOnPage(intervalMs: number, listener: () => void): () => void {
	const timer = setInterval(listener, intervalMs);
	return () => clearInterval(timer);
}

/**
 * ブラウザは背景のタブのタイマーを間引き、長く隠れたタブでは1分に1回まで落とす。
 * Worker のタイマーは間引かれないので、別の作業をしていても遅れない。
 * Worker を使えないページでは通常のタイマーに切り替える。
 */
export class WorkerTicker implements Ticker {
	start(intervalMs: number, listener: () => void): () => void {
		let stop: () => void;
		const fallBack = (): void => {
			stop();
			stop = tickOnPage(intervalMs, listener);
		};
		try {
			const url = URL.createObjectURL(new Blob([WORKER_SOURCE], {type: "text/javascript"}));
			const worker = new Worker(url);
			stop = () => {
				worker.terminate();
				URL.revokeObjectURL(url);
			};
			worker.onmessage = () => listener();
			worker.onerror = fallBack;
			worker.postMessage(intervalMs);
		} catch {
			stop = tickOnPage(intervalMs, listener);
		}
		return () => stop();
	}
}
