import type {MessageKey} from "@catalog/messages";
import type {RunOptions, RunResult, TestCase} from "@domain/execution/result";
import {option} from "@domain/settings/option";
import {isRecordOf, isString} from "@domain/validation/guards";
import type {CodeRunner} from "@application/execution/runner-catalog";
import {defineFeature, type FeatureContext} from "@application/feature/definition";
import type {JudgeSite, SampleCase} from "@application/ports/judge-site";
import {readStored} from "@application/ports/key-value-store";
import {createDock, type Dock, type DockTab} from "@ui/dock/dock";
import {h, injectStyle} from "@ui/element";
import {registerShortcut} from "@ui/shortcuts";
import css from "./easy-test.css" with {type: "text"};
import resultRowCss from "./result-row.css" with {type: "text"};
import {SavedCodes} from "./saved-code";
import {createResultRow, createResultView, createTestPanel, type TestPanel, toneOf} from "./views";

const RUNNER_SELECTION_KEY = "easy-test:runner-selection";
const PRECOMPILE_DELAY_MS = 180;
const TEST_AND_SUBMIT_KEY = "Ctrl+Enter";
const TEST_ALL_KEY = "Alt+Enter";

const featureOptions = {
	precompile: option.boolean(true, "easyTest.precompile"),
	keyboardShortcuts: option.boolean(true, "easyTest.keyboardShortcuts"),
	savedCodeLimit: option.number(10, "easyTest.savedCodeLimit", {min: 0}),
	allowableError: option.text("1e-6", "easyTest.allowableError"),
};

type Context = FeatureContext<typeof featureOptions>;
type Execution = {readonly result: Promise<RunResult>; readonly tab: DockTab};

class EasyTest {
	private readonly dock: Dock;
	private readonly panel: TestPanel;
	private readonly savedCodes: SavedCodes;
	private readonly buttons: HTMLElement[] = [];
	private readonly resultList = h("div", {className: "row"});
	private candidates: readonly CodeRunner[] = [];
	private refreshing: Promise<void> = Promise.resolve();
	private runnable = false;
	private runCount = 0;
	private running = 0;

	constructor(private readonly site: JudgeSite, private readonly context: Context) {
		const {options, state, translate, openSettings} = context;
		this.savedCodes = new SavedCodes(state, options.savedCodeLimit);
		this.dock = createDock({css, toggleLabel: "Easy Test", closeLabel: translate("settings.close")});
		this.panel = createTestPanel(translate, options.allowableError, {
			onRun: () => void this.runPanel(),
			onOpenSettings: openSettings,
		});
		this.dock.addTab("Easy Test", this.panel.element);
	}

	start(): void {
		injectStyle(resultRowCss);
		this.panel.environment.addEventListener("change", () => this.rememberRunner());
		this.site.onLanguageChange(() => void this.refreshEnvironment());
		void this.refreshEnvironment();
		this.placeButtons();
		this.placeSampleButtons();
		if (this.context.options.precompile) this.watchSource();
		if (this.context.options.keyboardShortcuts) this.registerShortcuts();
	}

	/** 実行中でも次の実行を受け付けるので、見た目だけを切り替える。 */
	private createButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
		const button = h("button", {
			type: "button",
			className: `btn ${className}`,
			textContent: label,
			onclick: onClick,
		});
		button.classList.toggle("disabled", !this.runnable);
		this.buttons.push(button);
		return button;
	}

	private createTestButton(label: MessageKey, className: string, shortcut: string, onClick: () => void): HTMLElement {
		const button = this.createButton(this.context.translate(label), className, onClick);
		button.title = shortcut;
		button.style.marginLeft = "1rem";
		return button;
	}

	private placeButtons(): void {
		const {translate} = this.context;
		const {testButtons, sideButtons, results} = this.site.mounts;
		if (testButtons instanceof Element) {
			testButtons.append(
				this.createTestButton("easyTest.testAndSubmit", "btn-info", TEST_AND_SUBMIT_KEY, () => void this.testAndSubmit()),
				this.createTestButton("easyTest.testAll", "btn-default btn-sm", TEST_ALL_KEY, () => void this.testAll()),
			);
		}
		if (sideButtons instanceof Element) {
			sideButtons.append(h("a", {
				className: "btn btn-danger btn-sm",
				textContent: translate("easyTest.restore"),
				onclick: () => this.restore(),
			}));
		}
		if (results instanceof Element) results.append(this.resultList);
	}

	private placeSampleButtons(): void {
		void this.site.samples().then((samples) => {
			const label = this.context.translate("easyTest.run");
			for (const sample of samples) {
				if (!(sample.anchor instanceof Element)) continue;
				const button = this.createButton(label, "btn-primary btn-sm", () => void this.runSample(sample));
				button.style.verticalAlign = "top";
				button.style.marginLeft = "0.5em";
				sample.anchor.after(button);
			}
		});
	}

	private watchSource(): void {
		const {localRunner} = this.context;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const schedule = (): void => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				const code = this.site.sourceCode();
				if (code && localRunner.isAvailable()) void localRunner.prepare(code).catch(() => undefined);
			}, PRECOMPILE_DELAY_MS);
		};
		this.site.onSourceChange(schedule);
		schedule();
	}

	private registerShortcuts(): void {
		const handled = (action: () => void) => () => {
			action();
			return true;
		};
		registerShortcut(TEST_AND_SUBMIT_KEY, handled(() => void this.testAndSubmit()), {inTextFields: true});
		registerShortcut(TEST_ALL_KEY, handled(() => void this.testAll()), {inTextFields: true});
		registerShortcut("Alt+Escape", handled(() => this.dock.toggle()), {inTextFields: true});
	}

	private selections(): Readonly<Record<string, string>> {
		return readStored(this.context.state, RUNNER_SELECTION_KEY, isRecordOf(isString), {});
	}

	private rememberRunner(): void {
		const language = this.site.language();
		if (!language) return;
		this.context.state.set(RUNNER_SELECTION_KEY, {
			...this.selections(),
			[language.id]: this.panel.environment.value
		});
	}

	/** 言語の切り替えと実行が重なっても、最新の状態になるよう順番に更新する。 */
	private refreshEnvironment(): Promise<void> {
		this.refreshing = this.refreshing.then(() => this.loadEnvironment());
		return this.refreshing;
	}

	/** サイトで選んだ言語に合わせて、実行環境の候補を更新する。 */
	private async loadEnvironment(): Promise<void> {
		const {runners, translate} = this.context;
		const {environment} = this.panel;
		const language = this.site.language();
		const candidates = language ? await runners.candidates(language) : [];
		const previous = environment.value;
		this.candidates = candidates;
		const signature = candidates.map(({id, label}) => `${id}\n${label}`).join("\n");
		if (environment.dataset.signature !== signature || candidates.length === 0) {
			environment.dataset.signature = signature;
			environment.replaceChildren(...candidates.map(({id, label}) => h("option", {
				value: id,
				textContent: label,
			})));
			if (candidates.length === 0) environment.append(h("option", {textContent: translate("easyTest.noEnvironment")}));
		}
		const isCandidate = (id: string | undefined): boolean => candidates.some((candidate) => candidate.id === id);
		const local = candidates.find(({kind}) => kind === "local")?.id;
		const saved = language ? this.selections()[language.id] : undefined;
		const next = local ?? (isCandidate(previous) ? previous : isCandidate(saved) ? saved : candidates[0]?.id);
		if (next !== undefined) environment.value = next;
		this.setRunnable(candidates.length > 0 && this.running === 0);
	}

	private setRunnable(runnable: boolean): void {
		this.runnable = runnable;
		this.panel.setRunnable(runnable);
		for (const button of this.buttons) button.classList.toggle("disabled", !runnable);
	}

	private runOptions(extra: RunOptions): RunOptions {
		const allowableError = this.panel.allowableError();
		return {trim: true, split: true, ...(allowableError === undefined ? {} : {allowableError}), ...extra};
	}

	private execute(testCase: TestCase, options: RunOptions): Execution {
		const {runners, translate} = this.context;
		const code = this.site.sourceCode();
		if (code) this.savedCodes.save(this.site.taskUri(), code);

		const view = createResultView(translate);
		const tab = this.dock.addTab(`#${++this.runCount} ${testCase.title}`, view.element, {closable: true});
		this.running++;
		this.setRunnable(false);
		const firstRunnerId = this.panel.environment.value;
		const result = runners.test(this.candidates, firstRunnerId, code, testCase, this.runOptions(options));
		void result.then((value) => {
			view.show(value);
			const tone = toneOf(value.status);
			if (tone) tab.setTone(tone);
		}).finally(() => {
			if (--this.running === 0) this.setRunnable(this.candidates.length > 0);
		});
		return {result, tab};
	}

	private async runPanel(): Promise<void> {
		await this.refreshEnvironment();
		const {input, expected} = this.panel;
		this.execute({title: "Run", input: input.value, output: expected.value || null}, {});
	}

	private async runSample(sample: SampleCase): Promise<void> {
		await this.refreshEnvironment();
		const {result, tab} = this.execute(sample, {});
		await result;
		tab.show();
	}

	private async runSamples(): Promise<boolean> {
		const samples = await this.site.samples();
		await this.refreshEnvironment();
		const runGroupId = crypto.randomUUID();
		const executions = samples.map((sample) => this.execute(sample, {runGroupId}));
		// 次に開いたときは、このテストの先頭の結果から見られるようにする
		executions[0]?.tab.select();
		const row = createResultRow(samples.length, this.context.translate("settings.close"), () => {
			for (const {tab} of executions) tab.close();
		});
		this.resultList.prepend(row.element);
		for (const {result, tab} of executions) row.track(result, () => tab.show());
		const results = await Promise.all(executions.map(({result}) => result));
		return results.every(({status}) => status === "AC");
	}

	private async testAll(): Promise<void> {
		await this.runSamples();
	}

	private async testAndSubmit(): Promise<void> {
		if (await this.runSamples()) this.site.submit();
	}

	private restore(): void {
		const {translate} = this.context;
		const code = this.savedCodes.find(this.site.taskUri());
		if (code === null) {
			window.alert(translate("easyTest.noSavedCode"));
		} else if (!this.site.sourceCode() || window.confirm(translate("easyTest.restoreConfirm"))) {
			this.site.setSourceCode(code);
		}
	}
}

export const easyTest = defineFeature({
	id: "easy-test",
	title: "easyTest.title",
	description: "easyTest.description",
	category: "category.execution",
	defaultEnabled: true,
	routes: ["atcoder:task", "atcoder:submit", "yukicoder:problem", "codeforces:problem"],
	phase: "ready",
	options: featureOptions,
	async start(context) {
		const site = await context.judgeSite();
		if (site) new EasyTest(site, context).start();
	},
});
