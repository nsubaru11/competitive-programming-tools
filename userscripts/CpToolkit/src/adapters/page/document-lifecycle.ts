import type {PageLifecycle, PagePhase} from "@application/ports/page-lifecycle";

function waitForEvent(target: EventTarget, eventName: string): Promise<void> {
	return new Promise((resolve) => target.addEventListener(eventName, () => resolve(), {once: true}));
}

export class DocumentLifecycle implements PageLifecycle {
	async reach(phase: PagePhase): Promise<void> {
		if (phase === "ready" && document.readyState === "loading") {
			await waitForEvent(document, "DOMContentLoaded");
			// document-start で登録すると、サイト自身の初期化より先に呼ばれるので、それが終わるのを待つ
			await new Promise((resolve) => setTimeout(resolve));
		}
		if (phase === "load" && document.readyState !== "complete") {
			await waitForEvent(window, "load");
		}
	}
}
