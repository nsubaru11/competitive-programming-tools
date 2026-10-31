import {type Guard, isNumber, isObjectOf} from "@domain/validation/guards";

export type ContestCatalog = {
	readonly regularPrefixes: readonly string[];
	readonly permanentPrefixes: readonly string[];
	readonly maxTabsAtOnce: number;
	readonly taskCacheDays: number;
};

export type TaskRange = {
	readonly begin: number;
	readonly end: number;
};

export const isTaskRange: Guard<TaskRange> = isObjectOf<TaskRange>({begin: isNumber, end: isNumber});

/** 同じ種類のコンテストで範囲の設定を共有するための分類を返す。 */
export function contestCategory(catalog: ContestCatalog, contestId: string, taskCount: number): string {
	const regular = catalog.regularPrefixes.find((prefix) => contestId.startsWith(prefix));
	if (regular) return `${regular}-${taskCount}`;
	return catalog.permanentPrefixes.find((prefix) => contestId.startsWith(prefix)) ?? "other";
}

export function defaultRange(taskCount: number, maxTabs: number): TaskRange {
	return {begin: 0, end: Math.min(maxTabs, taskCount) - 1};
}

/** 片方の端を動かしたとき、順序と上限を保つようにもう片方を調整する。 */
export function adjustRange(range: TaskRange, changed: "begin" | "end", maxTabs: number): TaskRange {
	const {begin, end} = range;
	if (changed === "begin") {
		if (end < begin) return {begin, end: begin};
		return {begin, end: Math.min(end, begin + maxTabs - 1)};
	}
	if (begin > end) return {begin: end, end};
	return {begin: Math.max(begin, end - maxTabs + 1), end};
}

export function rangeIndices({begin, end}: TaskRange, reverse: boolean): number[] {
	const indices = Array.from({length: end - begin + 1}, (_, index) => begin + index);
	return reverse ? indices.toReversed() : indices;
}
