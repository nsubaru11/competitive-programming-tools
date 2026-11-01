import type {ContestMark, LatestContest} from "@domain/contest/latest";
import {type Guard, isArrayOf, isNumber, isObjectOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";
import type {HttpClient} from "@application/ports/services";

const CACHE_KEY = "latest-contests:cache";
const HOME_URL = "/home";
const MINUTE_MS = 60 * 1000;

type Cache = {
	readonly fetchedAt: number;
	readonly contests: readonly LatestContest[];
};

const isCache: Guard<Cache> = isObjectOf<Cache>({
	fetchedAt: isNumber,
	contests: isArrayOf(isObjectOf<LatestContest>({
		category: isString,
		id: isString,
		name: isString,
		marks: isArrayOf(isObjectOf<ContestMark>({text: isString, className: isString, title: isString})),
	})),
});

/** ホームの「次のコンテスト」の表を読む。 */
export async function loadLatestContests(
	cacheMinutes: number,
	{site, state, parse, now}: {
		site: HttpClient;
		state: KeyValueStore;
		parse: (html: string) => readonly LatestContest[];
		now: number;
	},
): Promise<readonly LatestContest[]> {
	const cache = readStored<Cache | null>(state, CACHE_KEY, isCache, null);
	if (cache && now - cache.fetchedAt < cacheMinutes * MINUTE_MS) return cache.contests;

	const response = await site.send({url: HOME_URL});
	if (response.status !== 200) throw new Error(`Failed to load ${HOME_URL}`);
	const contests = parse(response.text);
	// 表の形が変わって読めなかった結果は記憶しない
	if (contests.length > 0) state.set(CACHE_KEY, {fetchedAt: now, contests});
	return contests;
}
