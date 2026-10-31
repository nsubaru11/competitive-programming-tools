import {type Guard, isArrayOf, isNumber, isObjectOf, isRecordOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";
import type {HttpClient} from "@application/ports/services";

export type ContestTask = {
	readonly url: string;
	readonly label: string;
	readonly name: string;
};

type CacheEntry = {
	readonly tasks: readonly ContestTask[];
	readonly lastAccess: number;
};

const isCacheEntry: Guard<CacheEntry> = isObjectOf<CacheEntry>({
	tasks: isArrayOf(isObjectOf<ContestTask>({url: isString, label: isString, name: isString})),
	lastAccess: isNumber,
});

const CACHE_KEY = "task-dropdown:tasks";
const DAY_MS = 24 * 60 * 60 * 1000;

export type TaskPageParser = (html: string) => readonly ContestTask[];

/** 問題一覧を取得する。一度取得したコンテストは保持期間内ならキャッシュを使う。 */
export async function loadContestTasks(
	contestId: string,
	{site, state, parse, cacheDays}: {
		site: HttpClient;
		state: KeyValueStore;
		parse: TaskPageParser;
		cacheDays: number;
	},
): Promise<readonly ContestTask[] | null> {
	const cache = readStored(state, CACHE_KEY, isRecordOf(isCacheEntry), {});
	const now = Date.now();
	const fresh = Object.entries(cache).filter(([, entry]) => now - entry.lastAccess < cacheDays * DAY_MS);
	let tasks = cache[contestId]?.tasks ?? null;
	if (!tasks) {
		const response = await site.send({url: `/contests/${contestId}/tasks`});
		if (response.status !== 200) return null;
		tasks = parse(response.text);
	}
	state.set(CACHE_KEY, {...Object.fromEntries(fresh), [contestId]: {tasks, lastAccess: now}});
	return tasks;
}
