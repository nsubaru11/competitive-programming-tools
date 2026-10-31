import {tessokuDifficulties} from "@catalog/tables";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

const TASK_LIST = "#main-container > div.row > div:nth-child(2)";

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

		const tasks = [...body.querySelectorAll("tr")].map((row) => {
			const id = row.querySelector("td")?.textContent?.trim() ?? "";
			return {row, id, difficulty: tessokuDifficulties[id]};
		});
		for (const {row, difficulty} of tasks) {
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
				const sorted = tasks.toSorted((a, b) => {
					if (!sortedByDifficulty) return a.id.localeCompare(b.id);
					return (a.difficulty ?? Number.POSITIVE_INFINITY) - (b.difficulty ?? Number.POSITIVE_INFINITY);
				});
				body.append(...sorted.map(({row}) => row));
				const nextOrder = sortedByDifficulty ? "tessokuDifficulty.sortById" : "tessokuDifficulty.sortByDifficulty";
				button.textContent = translate(nextOrder);
			},
		});
		heading.after(button);
	},
});
