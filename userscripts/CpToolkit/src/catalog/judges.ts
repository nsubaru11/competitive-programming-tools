import atcoder from "@data/judges/atcoder.yaml";
import type {JudgeDefinition} from "@domain/page/route";

type JudgeData = typeof atcoder;

type RouteIdOf<J extends JudgeData> = J extends unknown ? `${J["id"]}:${Extract<keyof J["routes"], string>}` : never;

/** YAML のルートから生成した ID。存在しないルートを指定するとコンパイルエラーになる。 */
export type RouteId = RouteIdOf<JudgeData>;

export const judges: readonly JudgeDefinition[] = [atcoder];
