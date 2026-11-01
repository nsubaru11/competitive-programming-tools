import type {MessageKey} from "@catalog/messages";
import {formatClock, virtualClock} from "@domain/contest/virtual";
import {contestIdOf} from "@domain/page/route";
import {VirtualParticipations} from "@application/contest/virtual-participation";
import {defineFeature} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";
import css from "./virtual-timer.css" with {type: "text"};

const UPDATE_INTERVAL_MS = 200;
const PHASE_LABELS: Readonly<Record<"before" | "running", MessageKey>> = {
	before: "virtualTimer.untilStart",
	running: "virtualTimer.remaining",
};

/** 参加のページに表示された開始時刻を読む。登録していなければ null。 */
function readVirtualStart(): number | null {
	const startMs = Date.parse(document.querySelector("#main-container time.fixtime-second")?.textContent ?? "");
	return Number.isNaN(startMs) ? null : startMs;
}

export const virtualTimer = defineFeature({
	id: "virtual-timer",
	title: "virtualTimer.title",
	description: "virtualTimer.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {},
	live: true,
	start({isOnRoute, page, state, translate}) {
		const contestId = contestIdOf(location.pathname);
		const period = page.contestPeriod();
		const siteTimer = document.querySelector<HTMLElement>("#fixed-server-timer");
		if (!contestId || !period || !siteTimer) return () => undefined;

		const participations = new VirtualParticipations(state);
		if (isOnRoute("atcoder:virtual")) {
			const recorded = readVirtualStart();
			if (recorded === null) participations.forget(contestId);
			else participations.record(contestId, recorded);
		}
		const startMs = participations.startOf(contestId);
		if (startMs === null) return () => undefined;

		const style = injectStyle(css);
		const controller = new AbortController();
		const {signal} = controller;
		const label = h("span");
		const clock = h("span");
		const timer = h("p", {className: "contest-timer cp-virtual-timer"}, label, h("br"), clock);
		document.body.append(timer);

		const show = (virtual: boolean): void => {
			timer.hidden = !virtual;
			siteTimer.style.display = virtual ? "none" : "";
		};
		timer.addEventListener("click", () => show(false), {signal});
		siteTimer.addEventListener("click", () => show(true), {signal});
		show(true);

		const update = (): void => {
			const clockState = virtualClock(page.serverNow(), startMs, period.endMs - period.startMs);
			if (clockState.phase === "finished") {
				participations.forget(contestId);
				stop();
				return;
			}
			label.textContent = translate(PHASE_LABELS[clockState.phase]);
			clock.textContent = formatClock(clockState.remainingMs);
		};
		const interval = setInterval(update, UPDATE_INTERVAL_MS);
		const stop = (): void => {
			clearInterval(interval);
			controller.abort();
			show(false);
			timer.remove();
			style.remove();
		};
		update();
		return stop;
	},
});
