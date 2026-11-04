import {contestIdOf} from "@domain/page/route";
import {isJudging} from "@domain/submission/status";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import type {HttpClient} from "@application/ports/services";
import {injectStyle} from "@ui/element";
import css from "./task-status.css" with {type: "text"};

const TASK_TABLE_LINKS = '#main-container tbody a[href*="/tasks/"]';
const TASK_MENU_LINKS = '.cp-task-menu a[href*="/tasks/"]';
const ACCEPTED_CLASS = "cp-task-accepted";
const REJECTED_CLASS = "cp-task-rejected";
const PAGE_PATTERN = /[?&]page=(\d+)/;
/** サイトと同じく、混み合う開始直後は取得しない。 */
const START_QUIET_MS = 5 * 60 * 1000;

type TaskStatuses = ReadonlyMap<string, string>;

type SubmissionPage = {
	/** 正解したかを問題ごとに持つ。判定中の提出だけの問題は含めない。 */
	readonly results: ReadonlyMap<string, boolean>;
	readonly lastPage: number;
};

function taskIdOf(link: Element | null | undefined): string | undefined {
	return link?.getAttribute("href")?.split("?")[0]?.split("/").at(-1);
}

/** 自分の提出一覧の1ページを読む。AC か得点があれば正解として扱う。 */
function parseSubmissionPage(html: string): SubmissionPage {
	const page = new DOMParser().parseFromString(html, "text/html");
	const results = new Map<string, boolean>();
	for (const row of page.querySelectorAll(".table-responsive > table > tbody > tr")) {
		const id = taskIdOf(row.querySelector('a[href*="/tasks/"]'));
		const status = row.querySelector(".label")?.textContent?.trim() ?? "";
		if (!id || isJudging(status)) continue;
		const accepted = status === "AC" || Number(row.querySelector(".submission-score")?.textContent) > 0;
		results.set(id, (results.get(id) ?? false) || accepted);
	}
	const pages = [...page.querySelectorAll(".pagination a")]
		.map((link) => Number(PAGE_PATTERN.exec(link.getAttribute("href") ?? "")?.[1] ?? 1));
	return {results, lastPage: Math.max(1, ...pages)};
}

/** コンテスト後の提出も含めるため、得点のページではなく自分の提出一覧を全ページ読む。 */
async function loadStatuses(site: HttpClient, contestId: string): Promise<TaskStatuses> {
	const accepted = new Map<string, boolean>();
	let lastPage = 1;
	// 通信が重ならないよう、ページは順に取得する
	for (let page = 1; page <= lastPage; page++) {
		const response = await site.send({url: `/contests/${contestId}/submissions/me?page=${page}`});
		if (response.status !== 200) break;
		const parsed = parseSubmissionPage(response.text);
		for (const [id, ok] of parsed.results) accepted.set(id, (accepted.get(id) ?? false) || ok);
		lastPage = parsed.lastPage;
	}
	return new Map([...accepted].map(([id, ok]) => [id, ok ? ACCEPTED_CLASS : REJECTED_CLASS] as const));
}

function paint(statuses: TaskStatuses, links: string): void {
	for (const link of document.querySelectorAll(links)) {
		const status = statuses.get(taskIdOf(link) ?? "");
		if (status) link.closest("tr, li")?.classList.add(status);
	}
}

export const taskStatus = defineFeature({
	id: "task-status",
	title: "taskStatus.title",
	description: "taskStatus.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {
		acceptedColor: option.color("#c3e6cb", "taskStatus.acceptedColor"),
		rejectedColor: option.color("#f5c6cb", "taskStatus.rejectedColor"),
	},
	start({options, isOnRoute, page, site}) {
		const contestId = contestIdOf(location.pathname);
		if (!contestId || !page.isLoggedIn()) return;
		const period = page.contestPeriod();
		const sinceStart = period ? page.serverNow() - period.startMs : -1;
		if (sinceStart >= 0 && sinceStart < START_QUIET_MS) return;

		injectStyle(css);
		document.documentElement.style.setProperty("--cp-task-accepted", options.acceptedColor);
		document.documentElement.style.setProperty("--cp-task-rejected", options.rejectedColor);

		// 提出一覧などの表にも問題へのリンクがあるので、表を塗るのは問題一覧のページだけにする
		const links = isOnRoute("atcoder:tasks") ? `${TASK_TABLE_LINKS}, ${TASK_MENU_LINKS}` : TASK_MENU_LINKS;
		let statuses: Promise<TaskStatuses> | null = null;
		const paintAll = (): void => {
			statuses ??= loadStatuses(site, contestId).catch(() => new Map());
			void statuses.then((loaded) => paint(loaded, links));
		};

		if (isOnRoute("atcoder:tasks")) paintAll();
		// 問題のドロップダウンは、開かれるまで取得しない
		document.querySelector("#contest-nav-tabs")?.addEventListener("mouseover", (event) => {
			if (event.target instanceof Element && event.target.closest(".dropdown")?.querySelector(".cp-task-menu")) {
				paintAll();
			}
		});
	},
});
