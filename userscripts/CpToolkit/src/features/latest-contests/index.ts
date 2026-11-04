import {contestCatalog} from "@catalog/tables";
import type {ContestMark, LatestContest} from "@domain/contest/latest";
import {loadLatestContests} from "@application/contest/latest-contests";
import {defineFeature} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";
import css from "./latest-contests.css" with {type: "text"};

const CONTEST_LIST_PATH = "/contests/";

/** リンクの直前に並ぶ印を読む。ADT は1つのセルに複数のコンテストがあり、`br` で区切られる。 */
function marksBefore(link: Element): readonly ContestMark[] {
	const marks: ContestMark[] = [];
	for (let mark = link.previousElementSibling; mark?.tagName === "SPAN"; mark = mark.previousElementSibling) {
		marks.unshift({
			text: mark.textContent ?? "",
			className: mark.className,
			title: mark.getAttribute("title") ?? "",
		});
	}
	return marks;
}

/** 「次のコンテスト」の表だけが、行の先頭に見出しのセルを持つ。 */
function parseNextContests(html: string): readonly LatestContest[] {
	const page = new DOMParser().parseFromString(html, "text/html");
	return [...page.querySelectorAll("tbody tr")].flatMap((row) => {
		const heading = row.firstElementChild;
		if (heading?.tagName !== "TH") return [];
		return [...row.querySelectorAll('a[href^="/contests/"]')].flatMap((link) => {
			const id = link.getAttribute("href")?.split("/")[2];
			return id ? [{id, name: link.textContent?.trim() ?? id, marks: marksBefore(link)}] : [];
		});
	});
}

function createContestItem({id, name, marks}: LatestContest): HTMLElement {
	return h("li", {}, h(
		"a",
		{href: `${CONTEST_LIST_PATH}${id}`},
		...marks.map(({text, className, title}) => h("span", {textContent: text, className, title})),
		" ",
		h("span", {className: "cp-latest-name", textContent: name}),
	));
}

function createMessage(text: string): HTMLElement {
	return h("li", {className: "cp-latest-message", textContent: text});
}

export const latestContests = defineFeature({
	id: "latest-contests",
	title: "latestContests.title",
	description: "latestContests.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:page", "atcoder:home"],
	phase: "ready",
	options: {},
	live: true,
	start({site, state, translate}) {
		const {menuTargets, cacheMinutes} = contestCatalog.latest;
		const target = menuTargets.map((selector) => document.querySelector(selector)).find(Boolean);
		if (!target) return () => undefined;

		const style = injectStyle(css);
		const toggle = h("a", {href: CONTEST_LIST_PATH}, h("span", {textContent: translate("latestContests.menu")}));
		const menu = h("ul", {className: "cp-latest-menu"}, createMessage(translate("latestContests.loading")));
		const item = h("li", {className: "cp-latest"}, toggle, menu);
		target.append(item);

		// 表示のたびに通信しないよう、メニューを開くまで取得しない
		const resolve = async (): Promise<void> => {
			const contests = await loadLatestContests(cacheMinutes, {
				site,
				state,
				parse: parseNextContests,
				now: Date.now(),
			}).catch(() => []);
			if (contests.length > 0) menu.replaceChildren(...contests.map(createContestItem));
			else menu.replaceChildren(createMessage(translate("latestContests.failed")));
		};
		item.addEventListener("mouseenter", () => void resolve(), {once: true});

		return () => {
			item.remove();
			style.remove();
		};
	},
});
