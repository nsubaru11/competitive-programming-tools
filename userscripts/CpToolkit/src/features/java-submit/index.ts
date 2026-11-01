import type {SubmissionTarget} from "@domain/page/route";
import {findFoldStartLines} from "@domain/source/fold-lines";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {type CodeEditor, EDITOR_SETUP_DELAY_MS} from "@application/ports/code-editor";
import {transformJava, usesLibrary} from "@application/source/transform-java";
import {registerShortcut} from "@ui/shortcuts";
import {showToast} from "@ui/toast/toast";

const FOLD_SHORTCUT = "Ctrl+Shift+M";
const MIN_SOURCE_LENGTH = 30;
const FOLD_DELAY_MS = 100;
const PASTE_ORDER = 10;
const LOCAL_RUNNER_GUIDE_URL = "https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner";
const GUIDE_DURATION_MS = 15_000;

function findSubmitButton({submitButtons, labeledSubmit}: SubmissionTarget): HTMLElement | null {
	for (const selector of submitButtons) {
		const button = document.querySelector<HTMLElement>(selector);
		if (button) return button;
	}
	if (!labeledSubmit) return null;
	const candidates = [...document.querySelectorAll<HTMLElement>(labeledSubmit.selector)];
	for (const label of labeledSubmit.labels) {
		const button = candidates.find((candidate) => {
			const text = candidate instanceof HTMLInputElement ? candidate.value : candidate.textContent;
			return text?.trim().toLowerCase().includes(label);
		});
		if (button) return button;
	}
	return null;
}

export const javaSubmit = defineFeature({
	id: "java-submit",
	title: "javaSubmit.title",
	description: "javaSubmit.description",
	category: "category.execution",
	defaultEnabled: true,
	routes: ["atcoder:contest", "codeforces:page", "aoj:page", "libraryChecker:page", "paiza:page"],
	phase: "ready",
	options: {
		removePackage: option.boolean(true, "javaSubmit.removePackage"),
		renameClass: option.boolean(true, "javaSubmit.renameClass"),
		fixDebug: option.boolean(true, "javaSubmit.fixDebug"),
		addHeader: option.boolean(true, "javaSubmit.addHeader"),
		headerName: option.text("", "javaSubmit.headerName"),
		foldOnPaste: option.boolean(true, "javaSubmit.foldOnPaste"),
	},
	start({options, judge, editors, localRunner, paste, translate}) {
		const target = judge?.submission;
		if (!target) return;

		registerShortcut(target.shortcut, () => {
			const button = findSubmitButton(target);
			button?.click();
			return button !== null;
		});

		// エディタのないページも多いので、見つかるのを待たずに起動を終える
		const header = options.addHeader ? options.headerName || true : false;
		const lookup = {delayMs: EDITOR_SETUP_DELAY_MS};
		const fold = (editor: CodeEditor): void => editor.foldLines(findFoldStartLines(editor.getValue()));
		void editors.locate(target, lookup).then((editor) => {
			if (!editor) return;
			registerShortcut(FOLD_SHORTCUT, () => {
				fold(editor);
				return true;
			});
		});
		paste.add(target, lookup, {
			order: PASTE_ORDER,
			async transform(code, {editor}) {
				if (!editor.isJava() || code.length < MIN_SOURCE_LENGTH) return code;
				const {sourceCode, connected} = await transformJava(code, localRunner, {...options, header});
				if (!connected && usesLibrary(code)) {
					showToast({
						title: translate("javaSubmit.localRunnerRequired"),
						detail: translate("javaSubmit.localRunnerGuide"),
						tone: "warning",
						href: LOCAL_RUNNER_GUIDE_URL,
						durationMs: GUIDE_DURATION_MS,
					});
				}
				return sourceCode;
			},
			applied(editor) {
				if (options.foldOnPaste) setTimeout(() => fold(editor), FOLD_DELAY_MS);
			},
		});
	},
});
