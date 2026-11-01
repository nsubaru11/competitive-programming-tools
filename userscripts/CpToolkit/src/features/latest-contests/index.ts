import {contestCatalog} from "@catalog/tables";
import {type ContestRow, parseContestTime} from "@domain/contest/latest";
import {loadLatestContests} from "@application/contest/latest-contests";
import {defineFeature} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";
import css from "./latest-contests.css" with {type: "text"};

const CONTEST_LIST_PATH = "/contests/";

function parseContestRows(html: string): readonly ContestRow[] {
	const page = new DOMParser().parseFromString(html, "text/html");
	return [...page.querySelectorAll("tbody tr")].flatMap((row) => {
		const id = row.querySelector('a[href^="/contests/"]')?.getAttribute("href")?.split("/")[2];
		const startMs = parseContestTime(row.querySelector("time")?.textContent ?? "");
		return id && !Number.isNaN(startMs) ? [{id, startMs}] : [];
	});
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
		const {latest} = contestCatalog;
		const target = latest.menuTargets.map((selector) => document.querySelector(selector)).find(Boolean);
		if (!target) return () => undefined;

		const style = injectStyle(css);
		const links = latest.kinds.map(({label, archiveUrl}) => {
			return {label, link: h("a", {href: archiveUrl, textContent: label})};
		});
		const toggle = h("a", {href: CONTEST_LIST_PATH}, h("span", {textContent: translate("latestContests.menu")}));
		const menu = h("ul", {className: "cp-latest-menu"}, ...links.map(({link}) => h("li", {}, link)));
		const item = h("li", {className: "cp-latest"}, toggle, menu);
		target.append(item);

		// 表示のたびに通信しないよう、メニューを開くまで取得しない
		const resolve = async (): Promise<void> => {
			const contests = await loadLatestContests(latest, {
				site,
				state,
				parse: parseContestRows,
				now: Date.now(),
			}).catch(() => null);
			for (const {label, link} of links) {
				const id = contests?.[label];
				if (!id) continue;
				link.href = `${CONTEST_LIST_PATH}${id}`;
				link.textContent = id.toUpperCase();
			}
		};
		item.addEventListener("mouseenter", () => void resolve(), {once: true});

		return () => {
			item.remove();
			style.remove();
		};
	},
});
