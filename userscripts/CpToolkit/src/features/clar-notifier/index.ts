import {buildAtCoderClarificationCountUrl, buildAtCoderClarificationsUrl, safeJsonParse} from "@atcoder-tools/shared";
import {contestIdOf} from "@domain/page/route";
import {option} from "@domain/settings/option";
import {ClarificationCounter} from "@application/contest/clarification-counter";
import {defineFeature} from "@application/feature/definition";
import {showToast} from "@ui/toast/toast";

/** サイトが確認する間隔と同じ。 */
const POLL_INTERVAL_MS = 60 * 1000;
const TICK_INTERVAL_MS = 5000;
/** サイトと同じく、混み合う開始直後を避けて確認を始める。 */
const START_DELAY_MS = 5 * 60 * 1000;
const START_SPREAD_MS = 60 * 1000;
/** 常設のコンテストでは確認し続けない。 */
const MAX_CONTEST_MS = 30 * 24 * 60 * 60 * 1000;
const TOAST_DURATION_MS = 30 * 1000;

export const clarNotifier = defineFeature({
	id: "clar-notifier",
	title: "clarNotifier.title",
	description: "clarNotifier.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {
		desktop: option.boolean(true, "clarNotifier.desktop"),
	},
	live: true,
	start({options, notifier, page, site, state, ticker, translate}) {
		const contestId = contestIdOf(location.pathname);
		const period = page.contestPeriod();
		const hasBadge = document.querySelector("#clar-badge") !== null;
		if (!contestId || !period || !hasBadge || period.endMs - period.startMs > MAX_CONTEST_MS) {
			return () => undefined;
		}

		const counter = new ClarificationCounter(state);
		const beginAt = period.startMs + START_DELAY_MS + Math.random() * START_SPREAD_MS;

		const check = async (): Promise<void> => {
			const response = await site.send({url: buildAtCoderClarificationCountUrl(contestId, period.startMs)});
			const count = safeJsonParse<unknown>(response.text, null);
			if (response.status !== 200 || typeof count !== "number") return;
			const added = counter.update(contestId, count);
			if (added === 0) return;
			const url = buildAtCoderClarificationsUrl(contestId);
			const title = translate("clarNotifier.arrived").replace("{count}", String(added));
			const text = document.querySelector(".contest-title")?.textContent?.trim() ?? contestId;
			showToast({title, detail: text, tone: "warning", href: url, durationMs: TOAST_DURATION_MS});
			if (options.desktop && !document.hasFocus()) notifier.notify({title, text, url});
		};

		const stop = ticker.start(TICK_INTERVAL_MS, () => {
			const now = page.serverNow();
			if (now >= period.endMs) stop();
			else if (now >= beginAt && counter.claimPoll(now, POLL_INTERVAL_MS)) void check().catch(() => undefined);
		});
		return stop;
	},
});
