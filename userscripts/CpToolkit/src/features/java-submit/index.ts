import type {SubmissionTarget} from "@domain/page/route";
import {findFoldStartLines} from "@domain/source/fold-lines";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {transformJava} from "@application/source/transform-java";
import {registerShortcut} from "@ui/shortcuts";

const FOLD_SHORTCUT = "Ctrl+Shift+M";
const MIN_SOURCE_LENGTH = 30;
const FOLD_DELAY_MS = 100;

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
	start({options, judge, editors, localRunner}) {
		const target = judge?.submission;
		if (!target) return;

		registerShortcut(target.shortcut, () => {
			const button = findSubmitButton(target);
			button?.click();
			return button !== null;
		});

		// エディタのないページも多いので、見つかるのを待たずに起動を終える
		const header = options.addHeader ? options.headerName || true : false;
		void editors.locate(target).then((editor) => {
			if (!editor) return;
			const fold = (): void => editor.foldLines(findFoldStartLines(editor.getValue()));
			registerShortcut(FOLD_SHORTCUT, () => {
				fold();
				return true;
			});
			editor.onPaste(() => {
				const code = editor.getValue();
				if (!editor.isJava() || code.length < MIN_SOURCE_LENGTH) return;
				void transformJava(code, localRunner, {...options, header}).then((transformed) => {
					// 変換中に編集された場合は、その内容を上書きしない
					if (transformed === code || editor.getValue() !== code) return;
					editor.setValue(transformed);
					if (options.foldOnPaste) setTimeout(fold, FOLD_DELAY_MS);
				});
			});
		});
	},
});
