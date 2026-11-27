// 計測の作業用ファイルの置き場所。リポジトリには入れない(bench/.gitignore)。
//   BENCH_WORK    … 作業用フォルダ(既定は bench/.work)
//   BENCH_VERSION … 計測する CP Toolkit の版(run.sh が設定する)
import {join} from "node:path";

export const BENCH = new URL("../", import.meta.url).pathname;
export const WORK = process.env.BENCH_WORK || join(BENCH, ".work");
export const SCRIPTS = join(WORK, "scripts");
export const FIXTURES = join(WORK, "fixtures");

export function toolkitDir(version = process.env.BENCH_VERSION) {
	if (!version) throw new Error("BENCH_VERSION が設定されていません(run.sh から実行してください)");
	return join(WORK, "toolkit", version);
}

export function resultsDir(version = process.env.BENCH_VERSION) {
	if (!version) throw new Error("BENCH_VERSION が設定されていません(run.sh から実行してください)");
	return join(WORK, "results", version);
}
