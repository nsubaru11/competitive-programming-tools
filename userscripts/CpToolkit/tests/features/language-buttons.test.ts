import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import type {JudgeLanguage} from "@domain/execution/result";
import type {JudgeSite} from "@application/ports/judge-site";
import {languageButtons} from "@features/language-buttons/index";
import {createFakeServices, MemoryStore} from "../support/fakes";

const java: JudgeLanguage = {id: "1", label: "Java 24", family: "java"};
const python: JudgeLanguage = {id: "2", label: "Python 3", family: "python3"};
const STORAGE_KEY = "language-buttons:pinned";

function createSite(initial: readonly JudgeLanguage[] = [java, python]) {
	let languages = initial;
	let current: JudgeLanguage | null = java;
	let onLanguageChange = (): void => undefined;
	const site: JudgeSite = {
		id: "atcoder",
		mounts: {testButtons: null, sideButtons: null, results: null},
		taskUri: () => "",
		languages: () => languages,
		language: () => current,
		selectLanguage(id) {
			current = languages.find((language) => language.id === id) ?? null;
			onLanguageChange();
		},
		onLanguageChange(listener) {
			onLanguageChange = listener;
		},
		onSourceChange: () => undefined,
		sourceCode: () => "",
		setSourceCode: () => undefined,
		submit: () => undefined,
		samples: async () => [],
	};
	return {
		site,
		switchTask(next: readonly JudgeLanguage[]) {
			languages = next;
			onLanguageChange();
		},
	};
}

async function start(site: JudgeSite, state = new MemoryStore()) {
	await languageButtons.run(undefined, createFakeServices({judgeSite: async () => site, state}));
	return state;
}

const languageButton = (label: string) => [...document.querySelectorAll("#select-lang button")].find(({textContent}) => textContent === label) as HTMLButtonElement | undefined;
const configButton = () => document.querySelector("#select-lang .glyphicon-cog")?.parentElement as HTMLButtonElement;
const checkboxes = () => [...document.body.children]
	.flatMap((element) => [...element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []]);

beforeEach(() => {
	document.body.innerHTML = '<div id="select-lang"></div>';
});

afterEach(() => {
	document.body.replaceChildren();
});

describe("languageButtons", () => {
	test("選んだ言語だけをボタンにし、選択中の言語を強調する", async () => {
		await start(createSite().site, seeded([java.id, python.id]));
		expect(languageButton("Java 24")?.classList.contains("btn-success")).toBe(true);
		expect(languageButton("Python 3")?.classList.contains("btn-default")).toBe(true);
	});

	test("ボタンを押すと言語を切り替える", async () => {
		await start(createSite().site, seeded([python.id]));
		languageButton("Python 3")?.click();
		expect(languageButton("Python 3")?.classList.contains("btn-success")).toBe(true);
	});

	test("設定画面で選ぶとボタンが増え、保存される", async () => {
		const state = await start(createSite().site);
		expect(languageButton("Python 3")).toBeUndefined();
		configButton().click();
		const [, checkbox] = checkboxes();
		if (!checkbox) throw new Error("checkbox not found");
		checkbox.checked = true;
		checkbox.dispatchEvent(new Event("change"));
		expect(languageButton("Python 3")).toBeDefined();
		expect(state.get(STORAGE_KEY)).toEqual([python.id]);
	});

	test("言語が減った問題でも、選択は残す", async () => {
		const {site, switchTask} = createSite();
		const state = await start(site, seeded([java.id, python.id]));
		switchTask([java]);
		expect(languageButton("Python 3")).toBeUndefined();
		configButton().click();
		const [checkbox] = checkboxes();
		if (!checkbox) throw new Error("checkbox not found");
		checkbox.checked = false;
		checkbox.dispatchEvent(new Event("change"));
		expect(state.get(STORAGE_KEY)).toEqual([python.id]);
	});

	test("壊れた保存値では何も表示しない", async () => {
		const state = new MemoryStore();
		state.set(STORAGE_KEY, "broken");
		await start(createSite().site, state);
		expect(languageButton("Java 24")).toBeUndefined();
	});

	test("言語の選択欄がないページでは何もしない", async () => {
		document.body.replaceChildren();
		await start(createSite().site);
		expect(document.body.childElementCount).toBe(0);
	});
});

function seeded(ids: readonly string[]): MemoryStore {
	const state = new MemoryStore();
	state.set(STORAGE_KEY, ids);
	return state;
}
