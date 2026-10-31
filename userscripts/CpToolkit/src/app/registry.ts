import type {Feature} from "@application/feature/definition";
import {averageResult} from "@features/average-result/index";
import {easyTest} from "@features/easy-test/index";
import {editorialList} from "@features/editorial-list/index";
import {efficientLayout} from "@features/efficient-layout/index";
import {historyColors} from "@features/history-colors/index";
import {hoverMenu} from "@features/hover-menu/index";
import {javaSubmit} from "@features/java-submit/index";
import {localRunner} from "@features/local-runner/index";
import {paizaLanguage} from "@features/paiza-language/index";
import {ratingGraph} from "@features/rating-graph/index";
import {resultNotifier} from "@features/result-notifier/index";
import {statementCopy} from "@features/statement-copy/index";
import {statementHighlight} from "@features/statement-highlight/index";
import {submissionDefaults} from "@features/submission-defaults/index";
import {submissionShortcuts} from "@features/submission-shortcuts/index";
import {submissionTimer} from "@features/submission-timer/index";
import {taskDropdown} from "@features/task-dropdown/index";
import {tessokuDifficulty} from "@features/tessoku-difficulty/index";
import {topLinks} from "@features/top-links/index";
import {wideLayout} from "@features/wide-layout/index";

/** 設定画面にはこの順に表示する。 */
export const features: readonly Feature[] = [
	wideLayout,
	hoverMenu,
	statementHighlight,
	statementCopy,
	efficientLayout,
	submissionDefaults,
	submissionShortcuts,
	resultNotifier,
	averageResult,
	submissionTimer,
	taskDropdown,
	editorialList,
	topLinks,
	tessokuDifficulty,
	ratingGraph,
	historyColors,
	localRunner,
	javaSubmit,
	easyTest,
	paizaLanguage,
];
