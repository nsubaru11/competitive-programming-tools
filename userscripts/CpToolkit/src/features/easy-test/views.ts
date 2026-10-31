import type {Translate} from "@catalog/messages";
import type {RunResult} from "@domain/execution/result";
import type {DockTone} from "@ui/dock/dock";
import {h} from "@ui/element";

export function toneOf({status}: RunResult): DockTone | null {
	if (status === "AC") return "success";
	return status === "OK" ? null : "warning";
}

function resultField(label: string, rows: number): {element: HTMLElement; textarea: HTMLTextAreaElement} {
	const textarea = h("textarea", {rows, readOnly: true});
	return {textarea, element: h("label", {className: "result-field"}, label, textarea)};
}

/** 1回の実行結果を表示する要素を作る。結果が出るまでは空欄のまま表示する。 */
export function createResultView(translate: Translate): {element: HTMLElement; show(result: RunResult): void} {
	const input = resultField(translate("easyTest.standardInput"), 3);
	const expected = resultField(translate("easyTest.expectedOutput"), 3);
	const output = resultField(translate("easyTest.standardOutput"), 5);
	const error = resultField(translate("easyTest.standardError"), 5);
	expected.element.hidden = true;
	error.element.hidden = true;
	const exitCode = h("td");
	const execTime = h("td");
	const memory = h("td");
	const element = h(
		"div",
		{className: "result"},
		h("div", {className: "result-inputs"}, input.element, expected.element),
		h(
			"table",
			{className: "result-stats"},
			h(
				"tbody",
				{},
				h(
					"tr",
					{},
					h("th", {textContent: translate("easyTest.exitCode")}),
					h("th", {textContent: translate("easyTest.execTime")}),
					h("th", {textContent: translate("easyTest.memory")}),
				),
				h("tr", {}, exitCode, execTime, memory),
			),
		),
		h("div", {className: "result-outputs"}, output.element, error.element),
	);
	return {
		element,
		show(result) {
			const tone = toneOf(result);
			if (tone) output.textarea.dataset.tone = tone;
			input.textarea.value = result.input;
			output.textarea.value = result.output ?? "";
			if (result.expectedOutput !== undefined) {
				expected.textarea.value = result.expectedOutput;
				expected.element.hidden = false;
			}
			if (result.error) {
				error.textarea.value = result.error;
				error.element.hidden = false;
			}
			exitCode.textContent = String(result.exitCode ?? "");
			exitCode.dataset.tone = String(result.exitCode) === "0" ? "success" : "danger";
			execTime.textContent = result.execTime === undefined ? "" : `${result.execTime} ms`;
			memory.textContent = result.memory === undefined ? "" : `${result.memory} KB`;
		},
	};
}

export type ResultRow = {
	readonly element: HTMLElement;
	/** 1件分のラベルを追加し、結果が出たら進捗に反映する。 */
	track(result: Promise<RunResult>, onShow: () => void): void;
};

/** 同時に実行したサンプルの進捗をまとめて表示する行を作る。 */
export function createResultRow(total: number, closeLabel: string, onClose: () => void): ResultRow {
	const bar = h("div", {className: "cp-et-progress-bar", textContent: `0 / ${total}`});
	const element = h(
		"div",
		{className: "cp-et-row"},
		h("button", {
			type: "button",
			className: "cp-et-close",
			textContent: "×",
			ariaLabel: closeLabel,
			onclick() {
				element.remove();
				onClose();
			},
		}),
		h("div", {className: "cp-et-progress"}, bar),
		h("div", {className: "cp-et-time", textContent: new Date().toTimeString().slice(0, 8)}),
	);
	let finished = 0;
	let accepted = 0;
	return {
		element,
		track(result, onShow) {
			const label = h("div", {className: "cp-et-label", textContent: "WJ", onclick: onShow});
			element.append(label);
			void result.then(({status}) => {
				label.textContent = status;
				if (status === "IE") label.dataset.tone = "danger";
				else if (status === "AC") label.dataset.tone = "success";
				else if (status !== "OK") label.dataset.tone = "warning";
				finished++;
				if (status === "AC") accepted++;
				bar.textContent = `${finished} / ${total}`;
				bar.style.width = `${100 * finished / total}%`;
				if (finished === total) element.dataset.tone = accepted === total ? "success" : "warning";
			});
		},
	};
}

export type TestPanel = {
	readonly element: HTMLElement;
	readonly environment: HTMLSelectElement;
	readonly input: HTMLTextAreaElement;
	readonly expected: HTMLTextAreaElement;
	/** 許容誤差を使わないなら undefined を返す。 */
	allowableError(): number | undefined;
	setRunnable(runnable: boolean): void;
};

function formRow(label: string, control: HTMLElement): HTMLElement {
	return h("div", {className: "form-row"}, h("span", {className: "form-row-label", textContent: label}), control);
}

/** 任意の入力で実行するためのパネルを作る。 */
export function createTestPanel(
	translate: Translate,
	allowableError: string,
	{onRun, onOpenSettings}: {onRun: () => void; onOpenSettings: () => void},
): TestPanel {
	const environment = h("select", {className: "environment"});
	const input = h("textarea", {rows: 3});
	const expected = h("textarea", {rows: 3});
	const allowable = h("input", {type: "text", value: allowableError});
	const useAllowable = h("input", {
		type: "checkbox",
		checked: true,
		onchange() {
			allowable.disabled = !useAllowable.checked;
		},
	});
	const runButton = h("button", {type: "button", className: "run-button", textContent: translate("easyTest.run"), onclick: onRun});
	const element = h(
		"div",
		{},
		h(
			"div",
			{className: "test-form"},
			h(
				"div",
				{},
				formRow(translate("easyTest.environment"), environment),
				formRow(translate("easyTest.standardInput"), input),
			),
			h(
				"details",
				{},
				h("summary", {textContent: translate("easyTest.expectedOutput")}),
				formRow(
					translate("easyTest.allowableError"),
					h("div", {className: "input-group"}, h("span", {className: "input-group-addon"}, useAllowable), allowable),
				),
				formRow(translate("easyTest.expectedOutput"), expected),
			),
		),
		h(
			"div",
			{className: "test-actions"},
			runButton,
			h("button", {
				type: "button",
				className: "settings-button",
				textContent: translate("settings.open"),
				onclick: onOpenSettings,
			}),
		),
	);
	return {
		element,
		environment,
		input,
		expected,
		allowableError() {
			const value = Number.parseFloat(allowable.value);
			return useAllowable.checked && value > 0 ? value : undefined;
		},
		setRunnable(runnable) {
			runButton.disabled = !runnable;
		},
	};
}
