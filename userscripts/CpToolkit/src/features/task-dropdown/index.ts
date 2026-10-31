import type {Translate} from "@catalog/messages";
import {contestCatalog} from "@catalog/tables";
import {contestCategory, type TaskRange} from "@domain/contest/category";
import {type ContestTask, loadContestTasks} from "@application/contest/task-list";
import {defineFeature} from "@application/feature/definition";
import type {KeyValueStore} from "@application/ports/key-value-store";
import {h, injectStyle} from "@ui/element";
import {createOpenTasksModal} from "./open-tasks-modal";
import css from "./task-dropdown.css" with {type: "text"};

const NEW_TAB_KEY = "task-dropdown:newTab";
const REVERSE_KEY = "task-dropdown:reverse";
const RANGES_KEY = "task-dropdown:ranges";

function parseTaskPage(html: string): readonly ContestTask[] {
	const page = new DOMParser().parseFromString(html, "text/html");
	return [...page.querySelectorAll("#contest-nav-tabs + .col-sm-12 tbody tr")].flatMap((row) => {
		const [labelCell, nameCell] = row.querySelectorAll("td");
		const link = labelCell?.querySelector("a");
		const url = link?.getAttribute("href");
		if (!link || !url) return [];
		return [{url, label: link.textContent ?? "", name: nameCell?.textContent?.trim() ?? ""}];
	});
}

function turnIntoDropdown(tab: HTMLAnchorElement): HTMLElement {
	tab.className = "dropdown-toggle";
	tab.href = "#";
	tab.setAttribute("data-toggle", "dropdown");
	tab.setAttribute("role", "button");
	tab.setAttribute("aria-haspopup", "true");
	tab.setAttribute("aria-expanded", "false");
	tab.append(h("span", {className: "caret"}));
	const menu = h("ul", {className: "dropdown-menu cp-task-menu"});
	const item = tab.parentElement;
	item?.classList.add("dropdown");
	item?.append(menu);
	item?.addEventListener("mouseenter", () => item.classList.add("open"));
	item?.addEventListener("mouseleave", () => item.classList.remove("open"));
	return menu;
}

function createNewTabToggle(state: KeyValueStore, translate: Translate): HTMLElement {
	const checkbox = h("input", {type: "checkbox", checked: state.get(NEW_TAB_KEY) === true});
	checkbox.addEventListener("change", () => state.set(NEW_TAB_KEY, checkbox.checked));
	const label = h("label", {}, checkbox, translate("taskDropdown.newTab"));
	// メニューを閉じないよう、チェックボックスの操作をサイトへ伝えない
	label.addEventListener("click", (event) => event.stopPropagation());
	return h("li", {}, label);
}

function withIcon(link: HTMLAnchorElement, icon: string): HTMLAnchorElement {
	link.prepend(h("span", {className: `glyphicon ${icon}`, ariaHidden: "true"}), " ");
	return link;
}

function createTaskLink(href: string, text: string, state: KeyValueStore, icon?: string): HTMLElement {
	const link = h("a", {href, textContent: text});
	if (icon) withIcon(link, icon);
	link.addEventListener("click", () => {
		const newTab = state.get(NEW_TAB_KEY) === true;
		link.target = newTab ? "_blank" : "_self";
		link.rel = newTab ? "noopener noreferrer" : "";
	});
	return h("li", {}, link);
}

export const taskDropdown = defineFeature({
	id: "task-dropdown",
	title: "taskDropdown.title",
	description: "taskDropdown.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {},
	async start({site, state, translate}) {
		const tab = document.querySelector<HTMLAnchorElement>('#contest-nav-tabs a[href$="tasks"]');
		const contestId = /^\/contests\/([^/?#]+)/.exec(location.pathname)?.[1];
		if (!tab || !contestId) return;

		injectStyle(css);
		const taskTableUrl = tab.href;
		const menu = turnIntoDropdown(tab);
		menu.append(createNewTabToggle(state, translate), createTaskLink(taskTableUrl, translate("taskDropdown.taskTable"), state, "glyphicon-list"));

		const tasks = await loadContestTasks(contestId, {
			site,
			state,
			parse: parseTaskPage,
			cacheDays: contestCatalog.taskCacheDays,
		}).catch(() => null);
		if (!tasks) {
			menu.append(h("li", {className: "divider"}), h("li", {}, h("a", {textContent: translate("taskDropdown.loadFailed")})));
			return;
		}

		const category = contestCategory(contestCatalog, contestId, tasks.length);
		const ranges = (state.get(RANGES_KEY) ?? {}) as Readonly<Record<string, TaskRange>>;
		const modal = createOpenTasksModal({
			tasks,
			maxTabs: contestCatalog.maxTabsAtOnce,
			savedRange: ranges[category] ?? null,
			savedReverse: state.get(REVERSE_KEY) === true,
			translate,
			onOpen(range, reverse) {
				state.set(REVERSE_KEY, reverse);
				if (category !== "other") state.set(RANGES_KEY, {...ranges, [category]: range});
			},
		});
		const openAtOnce = withIcon(h("a", {href: "#", textContent: `${translate("taskDropdown.openAtOnce")}...`}), "glyphicon-sort-by-attributes-alt");
		openAtOnce.addEventListener("click", (event) => {
			event.preventDefault();
			modal.open();
		});
		menu.append(h("li", {}, openAtOnce), h("li", {className: "divider"}));
		menu.append(...tasks.map((task) => createTaskLink(task.url, `${task.label} - ${task.name}`, state)));
	},
});
