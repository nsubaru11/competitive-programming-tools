import {safeJsonParse} from "@atcoder-tools/shared";
import {type ContestHistoryEntry, ratedPerformances} from "@domain/rating/history";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

export const ratingGraph = defineFeature({
	id: "rating-graph",
	title: "ratingGraph.title",
	description: "ratingGraph.description",
	category: "category.rating",
	defaultEnabled: true,
	routes: ["atcoder:user"],
	phase: "load",
	options: {
		recentByDefault: option.boolean(true, "ratingGraph.recentByDefault"),
	},
	async start({options, ratingGraph: graph, site, translate}) {
		const userName = /^\/users\/([^/?#]+)/.exec(location.pathname)?.[1];
		const buttonGroups = document.querySelectorAll(".btn-text-group");
		const buttonGroup = buttonGroups[buttonGroups.length - 1];
		if (!userName || !buttonGroup) return;

		const heuristic = new URLSearchParams(location.search).get("contestType") === "heuristic";
		const url = `/users/${userName}/history/json${heuristic ? "?contestType=heuristic" : ""}`;
		const response = await site.send({url});
		const history = safeJsonParse<ContestHistoryEntry[]>(response.text, []);
		if (!(await graph.prepare(ratedPerformances(history)))) return;

		const view = {showPerformance: true, recentOnly: options.recentByDefault};
		const periodButton = h("button", {className: "btn btn-default btn-sm", type: "button"});
		const redraw = (): void => {
			periodButton.textContent = translate(view.recentOnly ? "ratingGraph.showAll" : "ratingGraph.showRecent");
			graph.draw(view);
		};
		periodButton.addEventListener("click", () => {
			view.recentOnly = !view.recentOnly;
			redraw();
		});
		const performanceButton = h("button", {
			className: "btn btn-default btn-sm",
			type: "button",
			textContent: translate("ratingGraph.togglePerformance"),
			onclick() {
				view.showPerformance = !view.showPerformance;
				redraw();
			},
		});
		performanceButton.style.marginLeft = "20px";
		periodButton.style.marginLeft = "10px";
		buttonGroup.append(performanceButton, periodButton);
		redraw();
	},
});
