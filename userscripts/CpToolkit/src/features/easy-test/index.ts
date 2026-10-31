import type {RunOptions, RunResult, TestCase} from "@domain/execution/result";
import {option} from "@domain/settings/option";
import type {CodeRunner} from "@application/execution/runner-catalog";
import {defineFeature, type FeatureContext} from "@application/feature/definition";
import type {JudgeSite, SampleCase} from "@application/ports/judge-site";
import {createDock, type Dock, type DockTab} from "@ui/dock/dock";
import {h} from "@ui/element";
import {registerShortcut} from "@ui/shortcuts";
import css from "./easy-test.css" with {type: "text"};
import {SavedCodes} from "./saved-code";
import {createResultView, createTestPanel, type TestPanel, toneOf} from "./views";

const RUNNER_SELECTION_KEY = "easy-test:runner-selection";
const PRECOMPILE_DELAY_MS = 180;

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
	private readonly buttons: HTMLButtonElement[] = [];
	private readonly resultList = h("div");
	private candidates: readonly CodeRunner[] = [];
	private runnable = false;
	private refreshToken = 0;
	private runCount = 0;
	private running = 0;

	constructor(private readonly site: JudgeSite, private readonly context: Context) {
		const {options, state, translate} = context;
		this.savedCodes = new SavedCodes(state, options.savedCodeLimit);
		this.dock = createDock({css, toggleLabel: "Easy Test", closeLabel: translate("settings.close")});
		this.panel = createTestPanel(translate, options.allowableError, () => {
			const {input, expected} = this.panel;
			this.execute({title: "Run", input: input.value, output: expected.value || null}, {});
		});
		this.dock.addTab("Easy Test", this.panel.element);
	}

	start(): void {
		this.panel.environment.addEventListener("change", () => this.rememberRunner());
		this.site.onLanguageChange(() => void this.refreshEnvironment());
		void this.refreshEnvironment();
		this.placeButtons();
		this.placeSampleButtons();
		if (this.context.options.precompile) this.watchSource();
		if (this.context.options.keyboardShortcuts) this.registerShortcuts();
	}

	private createButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
		const button = h("button", {type: "button", className: `btn ${className}`, textContent: label, disabled: !this.runnable, onclick: onClick});
		button.style.marginLeft = "1rem";
		this.buttons.push(button);
		return button;
	}

	private placeButtons(): void {
		const {translate} = this.context;
		const {testButtons, sideButtons, results} = this.site.mounts;
		if (testButtons instanceof Element) {
			testButtons.append(
				this.createButton(translate("easyTest.testAndSubmit"), "btn-info", () => void this.testAndSubmit()),
				this.createButton(translate("easyTest.testAll"), "btn-default btn-sm", () => void this.testAll()),
			);
		}
		if (sideButtons instanceof Element) {
			sideButtons.append(this.createButton(translate("easyTest.restore"), "btn-danger btn-sm", () => this.restore()));
		}
		if (results instanceof Element) results.append(this.resultList);
	}

	private placeSampleButtons(): void {
		void this.site.samples().then((samples) => {
			for (const sample of samples) {
				if (!(sample.anchor instanceof Element)) continue;
				const button = this.createButton("Run", "btn-primary btn-sm", () => {
					void this.execute(sample, {}).then(({tab}) => tab.show());
				});
				sample.anchor.after(button);
			}
		});
	}

	private watchSource(): void {
		const {localRunner} = this.context;
		let timer: ReturnType<typeof setTimeout> | undefined;
		this.site.onSourceChange(() => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				const code = this.site.sourceCode();
				if (code && localRunner.isAvailable()) void localRunner.prepare(code).catch(() => undefined);
			}, PRECOMPILE_DELAY_MS);
		});
	}

	private registerShortcuts(): void {
		const handled = (action: () => void) => () => {
			action();
			return true;
		};
		registerShortcut("Ctrl+Enter", handled(() => void this.testAndSubmit()));
		registerShortcut("Alt+Enter", handled(() => void this.testAll()));
		registerShortcut("Alt+Escape", handled(() => this.dock.toggle()));
	}

	private selections(): Readonly<Record<string, string>> {
		return (this.context.state.get(RUNNER_SELECTION_KEY) ?? {}) as Readonly<Record<string, string>>;
	}

	private rememberRunner(): void {
		const language = this.site.language();
		if (!language) return;
		this.context.state.set(RUNNER_SELECTION_KEY, {...this.selections(), [language.id]: this.panel.environment.value});
	}

	/** サイトで選んだ言語に合わせて、実行環境の候補を更新する。 */
	private async refreshEnvironment(): Promise<void> {
		const token = ++this.refreshToken;
		const {environment} = this.panel;
		const language = this.site.language();
		const candidates = language ? await this.context.runners.candidates(language) : [];
		if (token !== this.refreshToken) return;
		this.candidates = candidates;
		environment.replaceChildren(...candidates.map(({id, label}) => h("option", {value: id, textContent: label})));
		const local = candidates.find(({kind}) => kind === "local")?.id;
		const saved = language ? this.selections()[language.id] : undefined;
		const preferred = local ?? (candidates.some(({id}) => id === saved) ? saved : undefined);
		if (preferred) environment.value = preferred;
		this.setRunnable(candidates.length > 0);
	}

	private setRunnable(runnable: boolean): void {
		this.runnable = runnable;
		this.panel.setRunnable(runnable);
		for (const button of this.buttons) button.disabled = !runnable;
	}

	private runOptions(extra: RunOptions): RunOptions {
		const allowableError = Number.parseFloat(this.panel.allowableError.value);
		return {trim: true, split: true, ...(allowableError > 0 ? {allowableError} : {}), ...extra};
	}

	private async execute(testCase: TestCase, options: RunOptions): Promise<Execution> {
		await this.refreshEnvironment();
		const {runners, translate} = this.context;
		const code = this.site.sourceCode();
		if (code) this.savedCodes.save(this.site.taskUri(), code);

		const view = createResultView(translate);
		const tab = this.dock.addTab(`#${++this.runCount} ${testCase.title}`, view.element, {closable: true});
		this.running++;
		this.setRunnable(false);
		const result = runners.test(this.candidates, this.panel.environment.value, code, testCase, this.runOptions(options));
		void result.then((value) => {
			view.show(value);
			const tone = toneOf(value);
			if (tone) tab.setTone(tone);
		}).finally(() => {
			if (--this.running === 0) this.setRunnable(this.candidates.length > 0);
		});
		return {result, tab};
	}

	private async runSamples(samples: readonly SampleCase[]): Promise<boolean> {
		const runGroupId = crypto.randomUUID();
		const executions = await Promise.all(samples.map((sample) => this.execute(sample, {runGroupId})));
		const row = h("div", {className: "alert alert-info", textContent: "..."});
		this.resultList.prepend(row);
		const results = await Promise.all(executions.map(({result}) => result));
		const accepted = results.every(({status}) => status === "AC");
		row.className = `alert ${accepted ? "alert-success" : "alert-warning"}`;
		row.replaceChildren(...results.map(({status}, index) => {
			const label = h("span", {className: `label ${status === "AC" ? "label-success" : "label-warning"}`, textContent: status});
			label.style.margin = "3px";
			label.style.cursor = "pointer";
			label.addEventListener("click", () => executions[index]?.tab.show());
			return label;
		}));
		return accepted;
	}

	private async testAll(): Promise<void> {
		await this.runSamples(await this.site.samples());
	}

	private async testAndSubmit(): Promise<void> {
		if (await this.runSamples(await this.site.samples())) this.site.submit();
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
