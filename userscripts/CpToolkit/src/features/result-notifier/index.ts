import {buildAtCoderSubmissionStatusJsonUrl, buildAtCoderSubmissionUrl, safeJsonParse} from "@atcoder-tools/shared";
import {contestIdOf} from "@domain/page/route";
import {isJudging} from "@domain/submission/status";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {type PendingSubmission, PendingSubmissions} from "@application/submission/pending-submissions";
import {showToast} from "@ui/toast/toast";

/** 確認の下限。判定中はサイトが返す間隔に従うので、これより速くは確認しない。 */
const MIN_POLL_INTERVAL_MS = 1000;
/** 確認の時刻を逃さないよう、間隔より短い周期で調べる。 */
const TICK_INTERVAL_MS = 100;
const TOAST_DURATION_MS = 10_000;
const SUBMISSION_ID_PATTERN = /\/submissions\/(\d+)/;

type StatusResponse = {
	readonly Result?: Readonly<Record<string, {readonly Html: string}>>;
	readonly Interval?: number;
};

type SubmissionResult = {
	readonly status: string;
	readonly detail: string;
};

function parseResult(html: string): SubmissionResult {
	const page = new DOMParser().parseFromString(`<table><tr>${html}</tr></table>`, "text/html");
	const status = page.querySelector(".label")?.textContent?.trim() ?? "";
	const detail = [...page.querySelectorAll("td")].slice(1).map((cell) => cell.textContent?.trim()).join("  ");
	return {status, detail};
}

/** 自分の提出一覧から、判定中の提出を集める。 */
function collectPending(contestId: string, now: number): PendingSubmission[] {
	return [...document.querySelectorAll(".table-responsive > table > tbody > tr")].flatMap((row) => {
		const status = row.querySelector(".label")?.textContent?.trim() ?? "";
		const id = [...row.querySelectorAll("a")].map((link) => SUBMISSION_ID_PATTERN.exec(link.href)?.[1]).find(Boolean);
		if (!id || !isJudging(status)) return [];
		return [{id, contestId, taskName: row.querySelectorAll("td")[1]?.textContent?.trim() ?? "", addedAt: now}];
	});
}

export const resultNotifier = defineFeature({
	id: "result-notifier",
	title: "resultNotifier.title",
	description: "resultNotifier.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:page", "atcoder:home"],
	phase: "ready",
	options: {
		desktop: option.boolean(true, "resultNotifier.desktop"),
	},
	live: true,
	start({options, isOnRoute, notifier, site, state, ticker}) {
		const pending = new PendingSubmissions(state);
		const contestId = contestIdOf(location.pathname);
		if (contestId && isOnRoute("atcoder:submissions") && location.pathname.includes("/submissions/me")) {
			pending.add(collectPending(contestId, Date.now()), Date.now());
		}

		const notify = (submission: PendingSubmission, {status, detail}: SubmissionResult): void => {
			const url = buildAtCoderSubmissionUrl(submission.contestId, submission.id);
			const title = `${status}: ${submission.taskName}`;
			showToast({
				title,
				detail,
				tone: status === "AC" ? "success" : "warning",
				href: url,
				durationMs: TOAST_DURATION_MS,
			});
			if (options.desktop && !document.hasFocus()) notifier.notify({title, text: detail, url});
		};

		const checkContest = async (id: string, submissions: readonly PendingSubmission[]): Promise<void> => {
			const url = buildAtCoderSubmissionStatusJsonUrl(id, submissions.map((submission) => submission.id));
			const response = await site.send({url});
			if (response.status !== 200) return;
			const {Result: results = {}, Interval: interval} = safeJsonParse<StatusResponse>(response.text, {});
			const now = Date.now();
			// 同時に確認した別のタブが先に通知していれば、重ねて通知しない
			const waiting = new Set(pending.list(now).map((submission) => submission.id));
			const finished = submissions.flatMap((submission) => {
				const html = results[submission.id]?.Html;
				const result = html === undefined ? null : parseResult(html);
				if (!result || isJudging(result.status) || !waiting.has(submission.id)) return [];
				notify(submission, result);
				return [submission.id];
			});
			pending.remove(finished, now);
			if (interval !== undefined) pending.postponePoll(now + interval);
		};

		let checking = false;
		let stopTicker: (() => void) | null = null;

		const poll = (): void => {
			const now = Date.now();
			const submissions = pending.list(now);
			if (submissions.length === 0) {
				stopTicker?.();
				stopTicker = null;
				return;
			}
			if (document.hasFocus()) pending.markFocused(now);
			else if (pending.isFocusedElsewhere(now)) return;
			if (checking || !pending.claimPoll(now, MIN_POLL_INTERVAL_MS)) return;
			checking = true;
			const groups = Map.groupBy(submissions, (submission) => submission.contestId);
			const checks = [...groups].map(([id, contestSubmissions]) => checkContest(id, contestSubmissions));
			void Promise.allSettled(checks).then(() => {
				checking = false;
			});
		};

		const watch = (): void => {
			stopTicker ??= ticker.start(TICK_INTERVAL_MS, poll);
			poll();
		};

		const controller = new AbortController();
		window.addEventListener("blur", () => pending.clearFocus(), {signal: controller.signal});
		const unsubscribe = pending.subscribe(watch);
		if (pending.list(Date.now()).length > 0) watch();

		return () => {
			controller.abort();
			unsubscribe();
			stopTicker?.();
			stopTicker = null;
		};
	},
});
