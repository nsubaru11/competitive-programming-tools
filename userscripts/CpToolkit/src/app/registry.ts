import type {Feature} from "@application/feature/definition";
import {averageResult} from "@features/average-result/index";
import {clarNotifier} from "@features/clar-notifier/index";
import {contestCalendar} from "@features/contest-calendar/index";
import {easyTest} from "@features/easy-test/index";
import {editorialList} from "@features/editorial-list/index";
import {efficientLayout} from "@features/efficient-layout/index";
import {historyColors} from "@features/history-colors/index";
import {hoverMenu} from "@features/hover-menu/index";
import {javaSubmit} from "@features/java-submit/index";
import {languageButtons} from "@features/language-buttons/index";
import {latestContests} from "@features/latest-contests/index";
import {localRunner} from "@features/local-runner/index";
import {paizaLanguage} from "@features/paiza-language/index";
import {ratingGraph} from "@features/rating-graph/index";
import {resultNotifier} from "@features/result-notifier/index";
import {sourceComments} from "@features/source-comments/index";
import {statementCopy} from "@features/statement-copy/index";
import {statementHighlight} from "@features/statement-highlight/index";
import {submissionQuery} from "@features/submission-query/index";
import {submissionShortcuts} from "@features/submission-shortcuts/index";
import {submissionTimer} from "@features/submission-timer/index";
import {taskDropdown} from "@features/task-dropdown/index";
import {taskStatus} from "@features/task-status/index";
import {tessokuDifficulty} from "@features/tessoku-difficulty/index";
import {topLinks} from "@features/top-links/index";
import {variableHover} from "@features/variable-hover/index";
import {virtualTimer} from "@features/virtual-timer/index";
import {wideLayout} from "@features/wide-layout/index";

/** 設定画面にはこの順に表示する。 */
export const features: readonly Feature[] = [
	wideLayout,
	hoverMenu,
	statementHighlight,
	variableHover,
	statementCopy,
	efficientLayout,
	submissionQuery,
	submissionShortcuts,
	languageButtons,
	sourceComments,
	resultNotifier,
	clarNotifier,
	averageResult,
	submissionTimer,
	taskDropdown,
	taskStatus,
	editorialList,
	topLinks,
	latestContests,
	contestCalendar,
	virtualTimer,
	tessokuDifficulty,
	ratingGraph,
	historyColors,
	localRunner,
	javaSubmit,
	easyTest,
	paizaLanguage,
];
