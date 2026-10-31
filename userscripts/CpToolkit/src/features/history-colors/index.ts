import {ratingScale} from "@catalog/tables";
import {backgroundOf, crownImageOf, tierOf} from "@domain/rating/scale";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

const PERFORMANCE_COLUMN = 3;
const RATING_COLUMN = 4;

const modeChoices = [
	{value: "none", label: "historyColors.modeNone"},
	{value: "text", label: "historyColors.modeText"},
	{value: "background", label: "historyColors.modeBackground"},
] as const;

type ColorMode = (typeof modeChoices)[number]["value"];

function colorizeText(cell: HTMLElement, value: number): void {
	const crown = crownImageOf(ratingScale, value);
	cell.replaceChildren();
	if (crown) cell.append(h("img", {src: crown}), " ");
	cell.append(h("span", {className: tierOf(ratingScale, value).className, textContent: String(value)}));
}

function colorizeCell(cell: HTMLElement | undefined, mode: ColorMode): void {
	const value = Number(cell?.textContent?.trim() || Number.NaN);
	if (!cell || Number.isNaN(value)) return;
	if (mode === "text") colorizeText(cell, value);
	if (mode === "background") cell.style.background = backgroundOf(ratingScale, value);
}

export const historyColors = defineFeature({
	id: "history-colors",
	title: "historyColors.title",
	description: "historyColors.description",
	category: "category.rating",
	defaultEnabled: true,
	routes: ["atcoder:userHistory"],
	phase: "ready",
	options: {
		performanceMode: option.select("background", "historyColors.performanceMode", modeChoices),
		ratingMode: option.select("background", "historyColors.ratingMode", modeChoices),
	},
	start({options}) {
		for (const row of document.querySelectorAll("#history tbody tr")) {
			const cells = row.querySelectorAll("td");
			colorizeCell(cells[PERFORMANCE_COLUMN], options.performanceMode);
			colorizeCell(cells[RATING_COLUMN], options.ratingMode);
		}
	},
});
