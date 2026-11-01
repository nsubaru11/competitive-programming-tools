import contestLinksData from "@data/contest-links.yaml";
import contestsData from "@data/contests.yaml";
import languagesData from "@data/languages.yaml";
import librariesData from "@data/libraries.yaml";
import ratingData from "@data/rating.yaml";
import runnersData from "@data/runners.yaml";
import statementData from "@data/statement.yaml";
import tessokuData from "@data/tessoku.yaml";
import type {ContestCatalog} from "@domain/contest/category";
import type {LanguageCatalog} from "@domain/execution/language";
import type {RatingScale} from "@domain/rating/scale";

export type RunnerKind = "local" | "judge" | "browser" | "paiza" | "wandbox";

/** ページの文脈へ読み込む外部のファイル。 */
export type ExternalResource = {
	readonly url: string;
	readonly integrity: string;
};

export type RunnerCatalog = {
	readonly order: readonly RunnerKind[];
	readonly maxRetry: number;
	readonly external: readonly RunnerKind[];
	readonly paiza: {
		readonly apiBase: string;
		readonly languages: readonly {readonly family: string; readonly language: string; readonly label: string}[];
	};
	readonly wandbox: {
		readonly listUrl: string;
		readonly compileUrl: string;
		readonly cacheHours: number;
		readonly aclBaseUrl: string;
	};
	readonly pyodide: {readonly baseUrl: string; readonly integrity: string};
};

export type StatementCatalog = {
	readonly targetHeadings: readonly string[];
	readonly sampleHeadings: readonly string[];
	readonly timeLimitKeywords: readonly string[];
	readonly memoryLimitKeywords: readonly string[];
	readonly skipTags: readonly string[];
};

export type ContestLink = {
	readonly title: string;
	readonly subtitle?: string;
	readonly label?: string;
	readonly labelClass?: string;
	readonly description: string;
	readonly href: string;
};

export const languageCatalog: LanguageCatalog = languagesData;
export const runnerCatalog: RunnerCatalog = runnersData;
export const statementCatalog: StatementCatalog = statementData;
export const contestCatalog: ContestCatalog = contestsData;
export const ratingScale: RatingScale = ratingData;
export const contestLinks: readonly (readonly ContestLink[])[] = contestLinksData.lists;
export const tessokuDifficulties: Readonly<Record<string, number>> = tessokuData.difficulties;

export const libraries: {
	readonly katexScript: ExternalResource;
	readonly katexAutoRender: ExternalResource;
	readonly katexStylesheet: ExternalResource;
	readonly prettify: ExternalResource;
} = librariesData;
