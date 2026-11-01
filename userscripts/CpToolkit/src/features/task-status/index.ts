import {contestIdOf} from "@domain/page/route";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {injectStyle} from "@ui/element";
import css from "./task-status.css" with {type: "text"};

const TASK_TABLE_LINKS = '#main-container tbody a[href*="/tasks/"]';
const TASK_MENU_LINKS = '.cp-task-menu a[href*="/tasks/"]';
const ACCEPTED_CLASS = "cp-task-accepted";
const REJECTED_CLASS = "cp-task-rejected";
const NOT_SUBMITTED = "-";
/** サイトと同じく、混み合う開始直後は取得しない。 */
const START_QUIET_MS = 5 * 60 * 1000;

type TaskStatuses = ReadonlyMap<string, string>;

function taskIdOf(link: Element | null | undefined): string | undefined {
	return link?.getAttribute("href")?.split("/").at(-1);
}

/** 自分の得点のページから、提出した問題の結果を読む。得点があれば正解として扱う。 */
function parseScorePage(html: string): TaskStatuses {
	const page = new DOMParser().parseFromString(html, "text/html");
	return new Map([...page.querySelectorAll("#main-div tbody tr")].flatMap((row) => {
		const [task, , score, submittedAt] = row.querySelectorAll("td");
		const id = taskIdOf(task?.querySelector('a[href*="/tasks/"]'));
		if (!id || submittedAt?.textContent?.trim() === NOT_SUBMITTED) return [];
		return [[id, Number(score?.textContent) > 0 ? ACCEPTED_CLASS : REJECTED_CLASS] as const];
	}));
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
			statuses ??= site.send({url: `/contests/${contestId}/score`})
				.then((response) => (response.status === 200 ? parseScorePage(response.text) : new Map()))
				.catch(() => new Map());
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
