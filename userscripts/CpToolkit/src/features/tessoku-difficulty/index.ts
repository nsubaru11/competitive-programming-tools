import {tessokuDifficulties} from "@catalog/tables";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

const TASK_LIST = "#main-container > div.row > div:nth-child(2)";

const taskIdOf = (row: Element): string => row.querySelector("td")?.textContent?.trim() ?? "";
const difficultyOf = (row: Element): number => tessokuDifficulties[taskIdOf(row)] ?? Number.POSITIVE_INFINITY;

export const tessokuDifficulty = defineFeature({
	id: "tessoku-difficulty",
	title: "tessokuDifficulty.title",
	description: "tessokuDifficulty.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:tessokuTasks"],
	phase: "ready",
	options: {},
	start({translate}) {
		const body = document.querySelector(`${TASK_LIST} > div > table > tbody`);
		const heading = document.querySelector(`${TASK_LIST} > h2`);
		if (!body || !heading) return;

		const rows = [...body.querySelectorAll("tr")];
		for (const row of rows) {
			const difficulty = tessokuDifficulties[taskIdOf(row)];
			const link = row.querySelector("td:nth-child(2) a");
			if (difficulty !== undefined && link) link.prepend(`【☆${difficulty}】 `);
		}

		let sortedByDifficulty = false;
		const button = h("button", {
			type: "button",
			className: "btn btn-default",
			textContent: translate("tessokuDifficulty.sortByDifficulty"),
			onclick() {
				sortedByDifficulty = !sortedByDifficulty;
				const sorted = [...rows].sort((a, b) => {
					return sortedByDifficulty ? difficultyOf(a) - difficultyOf(b) : taskIdOf(a).localeCompare(taskIdOf(b));
				});
				body.append(...sorted);
				button.textContent = translate(sortedByDifficulty ? "tessokuDifficulty.sortById" : "tessokuDifficulty.sortByDifficulty");
			},
		});
		heading.after(button);
	},
});
