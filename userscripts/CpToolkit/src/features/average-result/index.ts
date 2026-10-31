import {type JudgeCase, summarizeJudgeCases} from "@domain/submission/status";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

const COLUMN_COUNT = 4;
const MIN_TABLES_WITH_CASES = 5;
const MIN_CASES = 2;

function readCase(row: Element): JudgeCase {
	const [, status, time, memory] = row.querySelectorAll("td");
	return {
		status: status?.textContent?.trim() ?? "",
		timeMs: Number.parseInt(time?.textContent ?? "", 10) || 0,
		memoryKb: Number.parseInt(memory?.textContent ?? "", 10) || 0,
	};
}

export const averageResult = defineFeature({
	id: "average-result",
	title: "averageResult.title",
	description: "averageResult.description",
	category: "category.submission",
	defaultEnabled: true,
	routes: ["atcoder:submissionDetail"],
	phase: "ready",
	options: {},
	live: true,
	start({translate}) {
		const tables = document.querySelectorAll("table");
		const body = tables[tables.length - 1]?.querySelector("tbody");
		const rows = [...(body?.querySelectorAll("tr") ?? [])];
		const isCaseTable = rows.every((row) => row.querySelectorAll("td").length === COLUMN_COUNT);
		if (tables.length < MIN_TABLES_WITH_CASES || !body || rows.length < MIN_CASES || !isCaseTable) return () => undefined;

		const {accepted, total, averageTimeMs, averageMemoryKb, timeIsLowerBound} = summarizeJudgeCases(rows.map(readCase));
		const allAccepted = accepted === total;
		const row = h(
			"tr",
			{},
			h("td", {className: "text-center"}, h("b", {textContent: translate("averageResult.average")})),
			h("td", {className: "text-center"}, h("span", {
				className: `label ${allAccepted ? "label-success" : "label-warning"}`,
				textContent: `${accepted}/${total}`,
			})),
			h("td", {className: "text-right", textContent: `${averageTimeMs}${timeIsLowerBound ? "+" : ""} ms`}),
			h("td", {className: "text-right", textContent: `${averageMemoryKb} KB`}),
		);
		body.prepend(row);
		return () => row.remove();
	},
});
