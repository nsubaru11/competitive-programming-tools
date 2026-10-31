import aoj from "@data/judges/aoj.yaml";
import atcoder from "@data/judges/atcoder.yaml";
import codeforces from "@data/judges/codeforces.yaml";
import libraryChecker from "@data/judges/library-checker.yaml";
import paiza from "@data/judges/paiza.yaml";
import yukicoder from "@data/judges/yukicoder.yaml";
import type {JudgeDefinition} from "@domain/page/route";

type JudgeData =
	| typeof aoj
	| typeof atcoder
	| typeof codeforces
	| typeof libraryChecker
	| typeof paiza
	| typeof yukicoder;

type RouteIdOf<J extends JudgeData> = J extends unknown ? `${J["id"]}:${Extract<keyof J["routes"], string>}` : never;

/** YAML のルートから生成した ID。存在しないルートを指定するとコンパイルエラーになる。 */
export type RouteId = RouteIdOf<JudgeData>;

export const judges: readonly JudgeDefinition[] = [atcoder, codeforces, yukicoder, aoj, libraryChecker, paiza];

export const atcoderSampleSelectors: readonly {readonly selector: string; readonly container: string}[] = atcoder.samples;

export const paizaLanguageSelect: {
	readonly selects: readonly string[];
	readonly hiddenFields: readonly string[];
} = paiza.languageSelect;
