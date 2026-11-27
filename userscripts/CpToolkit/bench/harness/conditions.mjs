// 比較する条件。各条件は「どのスクリプトを入れ、CP Toolkit の設定をどうするか」で決まる。
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {SCRIPTS, toolkitDir} from "./paths.mjs";
import {parseUserscript} from "./userscript.mjs";

const load = (dir) => readdirSync(join(SCRIPTS, dir))
	.filter((f) => f.endsWith(".user.js"))
	.sort()
	.map((f) => parseUserscript(join(SCRIPTS, dir, f)));

/**
 * 旧スクリプトと CP Toolkit の機能の対応。SOURCES.md の「移植」「派生」「模倣」に基づく。
 * 版によって機能の ID が変わるので、候補を並べ、その版にすべて揃っている最初の組を使う。
 * 空の組 [] は「この版には対応する機能がない」の意味で、その旧スクリプトを比較から外す。
 * 候補のどれも揃わないときは、機能の改名に気づかずに比べないよう、計測を止める。
 */
export const LEGACY_TO_FEATURES = {
	// nsubaru さんの旧スクリプト(統合前の最終版)
	AtCoderWidenContainer: [["wide-layout"]],
	AtCoderHighlighter: [["statement-highlight"]],
	AtCoderMarkdownCopier: [["statement-copy"]],
	AtCoderCustomDefaultSubmissions: [["submission-shortcuts"]],
	AtCoderListingTasks: [["task-dropdown"]],
	AtCoderPerformanceOverlay: [["rating-graph"]],
	AtCoderEasyTestForJava: [["easy-test"]],
	// 2.x 以降は「提出補助」と「ショートカットキー」に分かれた
	JavaCodeSubmitter: [["java-submit"], ["submission-helper", "keyboard-shortcuts"]],
	// 公開スクリプト
	EasyAccordion: [["hover-menu"]],
	QuestionCopier: [["statement-copy"]],
	ProblemCopier: [["statement-copy"]],
	EfficientLayout: [["efficient-layout"]],
	SearchQueryHolder: [["submission-query"]],
	LanguageButtons: [["language-buttons"]],
	ResultNotifier: [["result-notifier"]],
	AverageResult: [["average-result"]],
	SubmissionTimer: [["submission-timer"]],
	TasksColorizeDuringContest: [["task-status"]],
	ViewAllEditorials: [["editorial-list"]],
	ContestDescriptionLink: [["top-links"]],
	RedirectRecentABC: [["latest-contests"]],
	AwcTab: [["latest-contests"]],
	GoogleCalender: [["contest-calendar"]],
	VirtualTimer: [["virtual-timer"]],
	TessokuDifficulty: [["tessoku-difficulty"]],
	// 3.0 で「成績表の色付け」がなくなった
	PerformanceColorizer: [["history-colors"], []],
};

/** その版の機能の一覧(run.sh が src/features から作る) */
export function toolkitFeatures(version) {
	const file = join(toolkitDir(version), "features.json");
	if (!existsSync(file)) throw new Error(`${file} がありません。run.sh で CP Toolkit を用意してください`);
	return JSON.parse(readFileSync(file, "utf8"));
}

/** 旧スクリプトに対応する機能を、その版の ID で返す。対応のない旧スクリプトは excluded に入れる */
export function featuresOf(scripts, features) {
	const have = new Set(features);
	const out = new Set();
	const excluded = [];
	for (const s of scripts) {
		const pick = LEGACY_TO_FEATURES[s.id]?.find((ids) => ids.every((id) => have.has(id)));
		if (!pick) throw new Error(`旧スクリプト ${s.id} に対応する機能が、この版の CP Toolkit にありません。harness/conditions.mjs の LEGACY_TO_FEATURES を直してください`);
		if (pick.length === 0) excluded.push(s.id);
		for (const id of pick) out.add(id);
	}
	return {features: [...out], excluded};
}

function toolkitSettings(enabledFeatures, features) {
	const set = new Set(enabledFeatures);
	return {
		settings: {
			version: 1,
			features: Object.fromEntries(features.map((id) => [id, {enabled: set.has(id), options: {}}])),
		},
	};
}

export function loadConditions({analysisBuild = false, version = process.env.BENCH_VERSION} = {}) {
	const own = load("legacy-nsubaru");
	const pub = load("legacy-public");
	const features = toolkitFeatures(version);
	const toolkitFile = analysisBuild ? "CpToolkit.analysis.user.js" : "CpToolkit.user.js";
	const toolkit = parseUserscript(join(toolkitDir(version), toolkitFile));
	toolkit.id = "CpToolkit";
	const ownMap = featuresOf(own, features);
	const allMap = featuresOf([...own, ...pub], features);
	// 対応する機能がない旧スクリプトは、比較から外す
	const ownKept = own.filter((s) => !ownMap.excluded.includes(s.id));
	const allKept = [...own, ...pub].filter((s) => !allMap.excluded.includes(s.id));
	return {
		A: {label: "スクリプトなし", scripts: []},
		B_own: {label: `旧 nsubaru 版 ${ownKept.length}本`, scripts: ownKept, excluded: ownMap.excluded},
		C_own: {label: `CP Toolkit(旧${ownKept.length}本と同じ機能)`, scripts: [{...toolkit, store: toolkitSettings(ownMap.features, features)}], features: ownMap.features},
		B_all: {label: `旧スクリプト ${allKept.length}本`, scripts: allKept, excluded: allMap.excluded},
		C_eq: {label: `CP Toolkit(旧${allKept.length}本と同じ機能)`, scripts: [{...toolkit, store: toolkitSettings(allMap.features, features)}], features: allMap.features},
		C_default: {label: "CP Toolkit(既定の設定)", scripts: [{...toolkit, store: {}}]},
	};
}
