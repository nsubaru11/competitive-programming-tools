import {buildAtCoderSubmissionStatusJsonUrl, buildAtCoderSubmissionUrl, safeJsonParse} from "@atcoder-tools/shared";
import {isJudging} from "@domain/submission/status";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {type PendingSubmission, PendingSubmissions} from "@application/submission/pending-submissions";
import {showToast} from "@ui/toast/toast";

const POLL_INTERVAL_MS = 5000;
const TOAST_DURATION_MS = 10_000;
const SUBMISSION_ID_PATTERN = /\/submissions\/(\d+)/;

type StatusResponse = {
	readonly Result?: Readonly<Record<string, {readonly Html: string}>>;
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
	routes: ["atcoder:page"],
	phase: "ready",
	options: {
		desktop: option.boolean(true, "resultNotifier.desktop"),
	},
	live: true,
	start({options, isOnRoute, notifier, site, state}) {
		const pending = new PendingSubmissions(state);
		const contestId = /^\/contests\/([^/?#]+)/.exec(location.pathname)?.[1];
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
				durationMs: TOAST_DURATION_MS
			});
			if (options.desktop && document.hidden) notifier.notify({title, text: detail, url});
		};

		const checkContest = async (id: string, submissions: readonly PendingSubmission[]): Promise<void> => {
			const url = buildAtCoderSubmissionStatusJsonUrl(id, submissions.map((submission) => submission.id));
			const response = await site.send({url});
			if (response.status !== 200) return;
			const results = safeJsonParse<StatusResponse>(response.text, {}).Result ?? {};
			const finished = submissions.flatMap((submission) => {
				const html = results[submission.id]?.Html;
				const result = html === undefined ? null : parseResult(html);
				if (!result || isJudging(result.status)) return [];
				notify(submission, result);
				return [submission.id];
			});
			pending.remove(finished, Date.now());
		};

		const poll = (): void => {
			const now = Date.now();
			if (document.hasFocus()) pending.markFocused(now);
			const submissions = pending.list(now);
			if (submissions.length === 0 || !pending.claimPoll(now, POLL_INTERVAL_MS)) return;
			const contests = new Set(submissions.map((submission) => submission.contestId));
			for (const id of contests) {
				void checkContest(id, submissions.filter((submission) => submission.contestId === id)).catch(() => undefined);
			}
		};

		pending.markFocused(Date.now());
		const timer = setInterval(poll, POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	},
});
