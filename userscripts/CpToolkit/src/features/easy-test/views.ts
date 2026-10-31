import type {Translate} from "@catalog/messages";
import type {RunResult} from "@domain/execution/result";
import type {DockTone} from "@ui/dock/dock";
import {h} from "@ui/element";

export function toneOf({status}: RunResult): DockTone | null {
	if (status === "AC") return "success";
	return status === "OK" ? null : "warning";
}

function outputField(label: string, value: string): HTMLElement {
	return h("label", {className: "panel-field"}, label, h("textarea", {readOnly: true, rows: 5, value}));
}

/** 1回の実行結果を表示する要素を作る。 */
export function createResultView(translate: Translate): {element: HTMLElement; show(result: RunResult): void} {
	const element = h("div", {textContent: translate("easyTest.running")});
	return {
		element,
		show(result) {
			const status = h("b", {className: "result-status", textContent: result.status});
			const tone = toneOf(result);
			if (tone) status.dataset.tone = tone;
			const fields = [
				outputField(translate("easyTest.standardInput"), result.input),
				outputField(translate("easyTest.standardOutput"), result.output ?? ""),
			];
			if (result.expectedOutput !== undefined) {
				fields.push(outputField(translate("easyTest.expectedOutput"), result.expectedOutput));
			}
			if (result.error) fields.push(outputField(translate("easyTest.standardError"), result.error));
			element.replaceChildren(
				h(
					"div",
					{className: "result-summary"},
					status,
					h("span", {textContent: `${translate("easyTest.exitCode")}: ${result.exitCode ?? "-"}`}),
					h("span", {textContent: `${translate("easyTest.execTime")}: ${result.execTime ?? "-"} ms`}),
					h("span", {textContent: `${translate("easyTest.memory")}: ${result.memory ?? "-"} KB`}),
				),
				h("div", {className: "result-grid"}, ...fields),
			);
		},
	};
}

export type TestPanel = {
	readonly element: HTMLElement;
	readonly environment: HTMLSelectElement;
	readonly input: HTMLTextAreaElement;
	readonly expected: HTMLTextAreaElement;
	readonly allowableError: HTMLInputElement;
	setRunnable(runnable: boolean): void;
};

/** 任意の入力で実行するためのパネルを作る。 */
export function createTestPanel(translate: Translate, allowableError: string, onRun: () => void): TestPanel {
	const environment = h("select");
	const input = h("textarea", {rows: 4});
	const expected = h("textarea", {rows: 4});
	const allowable = h("input", {type: "text", value: allowableError});
	const runButton = h("button", {type: "button", textContent: translate("easyTest.run"), onclick: onRun});
	const element = h(
		"div",
		{},
		h(
			"div",
			{className: "panel-grid"},
			h("label", {className: "panel-field"}, translate("easyTest.environment"), environment),
			h("label", {className: "panel-field"}, translate("easyTest.allowableError"), allowable),
			h("label", {className: "panel-field"}, translate("easyTest.standardInput"), input),
			h("label", {className: "panel-field"}, translate("easyTest.expectedOutput"), expected),
		),
		h("div", {className: "panel-actions"}, runButton),
	);
	return {
		element,
		environment,
		input,
		expected,
		allowableError: allowable,
		setRunnable(runnable) {
			runButton.disabled = !runnable;
		},
	};
}
