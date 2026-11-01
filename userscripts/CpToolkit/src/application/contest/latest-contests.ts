import {type ContestRow, type LatestContestCatalog, pickLatestContest} from "@domain/contest/latest";
import {type Guard, isNumber, isObjectOf, isRecordOf, isString} from "@domain/validation/guards";
import {type KeyValueStore, readStored} from "@application/ports/key-value-store";
import type {HttpClient} from "@application/ports/services";

const CACHE_KEY = "latest-contests:cache";
const CONTEST_LIST_URL = "/contests/";
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

type Cache = {
	readonly fetchedAt: number;
	readonly contests: Readonly<Record<string, string>>;
};

const isCache: Guard<Cache> = isObjectOf<Cache>({fetchedAt: isNumber, contests: isRecordOf(isString)});

/** 種類ごとの最新のコンテストを、ラベルをキーにして返す。 */
export async function loadLatestContests(
	catalog: LatestContestCatalog,
	{site, state, parse, now}: {
		site: HttpClient;
		state: KeyValueStore;
		parse: (html: string) => readonly ContestRow[];
		now: number;
	},
): Promise<Readonly<Record<string, string>>> {
	const cache = readStored<Cache | null>(state, CACHE_KEY, isCache, null);
	if (cache && now - cache.fetchedAt < catalog.cacheMinutes * MINUTE_MS) return cache.contests;

	// サイトが不調のときに通信を重ねないよう、失敗したら打ち切って記憶しない
	const fetchRows = async (url: string): Promise<readonly ContestRow[]> => {
		const response = await site.send({url});
		if (response.status !== 200) throw new Error(`Failed to load ${url}`);
		return parse(response.text);
	};
	const leadMs = catalog.leadHours * HOUR_MS;
	const rows = await fetchRows(CONTEST_LIST_URL);
	const entries = await Promise.all(catalog.kinds.map(async ({label, idPattern, archiveUrl}) => {
		const pattern = new RegExp(idPattern);
		const id = pickLatestContest(rows, pattern, now, leadMs)
			?? pickLatestContest(await fetchRows(archiveUrl), pattern, now, leadMs);
		return id ? [[label, id] as const] : [];
	}));
	const contests = Object.fromEntries(entries.flat());
	state.set(CACHE_KEY, {fetchedAt: now, contests});
	return contests;
}
