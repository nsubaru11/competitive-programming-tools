import type {PageLifecycle, PagePhase} from "@application/ports/page-lifecycle";

function waitForEvent(target: EventTarget, eventName: string): Promise<void> {
	return new Promise((resolve) => target.addEventListener(eventName, () => resolve(), {once: true}));
}

export class DocumentLifecycle implements PageLifecycle {
	async reach(phase: PagePhase): Promise<void> {
		if (phase === "ready" && document.readyState === "loading") {
			await waitForEvent(document, "DOMContentLoaded");
		}
		if (phase === "load" && document.readyState !== "complete") {
			await waitForEvent(window, "load");
		}
	}
}
