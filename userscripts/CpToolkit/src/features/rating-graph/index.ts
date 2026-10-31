import {safeJsonParse} from "@atcoder-tools/shared";
import {type ContestHistoryEntry, ratedPerformances} from "@domain/rating/history";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

function createGraphButton(marginLeft: string, onClick: () => void): HTMLButtonElement {
	const button = h("button", {className: "btn btn-default", type: "button", onclick: onClick});
	Object.assign(button.style, {
		marginLeft,
		padding: "5px 10px",
		border: "1px solid #ccc",
		borderRadius: "4px",
		backgroundColor: "#fff",
		color: "#0275d8",
		fontSize: "14px",
	});
	return button;
}

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
		const redraw = (): void => {
			periodButton.textContent = translate(view.recentOnly ? "ratingGraph.showAll" : "ratingGraph.showRecent");
			graph.draw(view);
		};
		const periodButton = createGraphButton("10px", () => {
			view.recentOnly = !view.recentOnly;
			redraw();
		});
		const performanceButton = createGraphButton("100px", () => {
			view.showPerformance = !view.showPerformance;
			redraw();
		});
		performanceButton.textContent = translate("ratingGraph.togglePerformance");
		buttonGroup.append(performanceButton, periodButton);
		redraw();
	},
});
