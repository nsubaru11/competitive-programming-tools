import {afterEach, beforeEach, describe, expect, mock, test} from "bun:test";
import {judges} from "@catalog/judges";
import {createTranslator} from "@catalog/messages";
import {matchPage} from "@domain/page/route";
import {option} from "@domain/settings/option";
import {defineFeature, type Feature} from "@application/feature/definition";
import {FeatureRuntime} from "@application/feature/runtime";
import {SettingsService} from "@application/settings/settings-service";
import {createSettingsPanel} from "@features/settings-panel/index";
import {addNavigationEntry} from "@features/settings-panel/navigation-entry";
import {createFakeServices, immediateLifecycle, MemoryStore, RecordingLogger} from "../support/fakes";

const translate = createTranslator(() => "ja");

const metadata = {
	description: "wideLayout.description",
	category: "category.layout",
	routes: ["atcoder:page"],
	phase: "start",
	defaultEnabled: true,
} as const;

const liveFeature = defineFeature({
	...metadata,
	id: "live",
	title: "wideLayout.title",
	options: {width: option.text("50%", "wideLayout.width", {validate: (value) => value.endsWith("%")})},
	live: true,
	start: () => () => {
	},
});

const reloadFeature = defineFeature({
	...metadata,
	id: "reload",
	title: "wideLayout.title",
	options: {},
	start: () => {
	},
});

const failingFeature = defineFeature({
	...metadata,
	id: "failing",
	title: "wideLayout.title",
	options: {},
	start: () => {
		throw new Error("boom");
	},
});

describe("設定画面", () => {
	let settings: SettingsService;
	let runtime: FeatureRuntime;

	async function openPanel(features: readonly Feature[]): Promise<ShadowRoot> {
		settings = new SettingsService(new MemoryStore());
		runtime = new FeatureRuntime({
			features,
			page: matchPage(judges, "https://atcoder.jp/home"),
			lifecycle: immediateLifecycle,
			settings,
			services: createFakeServices(),
			logger: new RecordingLogger(),
		});
		runtime.start();
		await runtime.settled();
		createSettingsPanel({features, settings, runtime, translate, version: "1.2.3"}).open();
		const host = document.body.lastElementChild;
		if (!host?.shadowRoot) throw new Error("設定画面が表示されていません");
		return host.shadowRoot;
	}

	const query = <T extends Element>(root: ShadowRoot, selector: string): T => {
		const element = root.querySelector<T>(selector);
		if (!element) throw new Error(`${selector} が見つかりません`);
		return element;
	};

	const toggle = (input: HTMLInputElement): void => {
		input.checked = !input.checked;
		input.dispatchEvent(new Event("change", {bubbles: true}));
	};

	beforeEach(() => {
		document.body.replaceChildren();
	});

	afterEach(() => {
		document.body.replaceChildren();
	});

	test("機能の一覧と状態を表示する", async () => {
		const root = await openPanel([liveFeature]);
		expect(query(root, "h3").textContent).toBe(translate("category.layout"));
		expect(query(root, ".feature-title").textContent).toBe(translate("wideLayout.title"));
		expect(query(root, ".status").textContent).toBe(translate("status.running"));
		expect(query(root, ".footer-version").textContent).toBe("v1.2.3");
		expect(query<HTMLDialogElement>(root, "dialog").open).toBe(true);
	});

	test("機能がなければその旨を表示する", async () => {
		const root = await openPanel([]);
		expect(query(root, ".empty").textContent).toBe(translate("settings.empty"));
	});

	test("スイッチで ON/OFF を保存し、状態を更新する", async () => {
		const root = await openPanel([liveFeature]);
		const input = query<HTMLInputElement>(root, "input[role=switch]");
		expect(input.checked).toBe(true);

		toggle(input);
		await runtime.settled();
		expect(settings.isEnabled("live", true)).toBe(false);
		expect(query(root, ".status").textContent).toBe(translate("status.disabled"));
	});

	test("再読み込みが必要になると案内を表示する", async () => {
		const root = await openPanel([reloadFeature]);
		const notice = query<HTMLElement>(root, ".notice");
		expect(notice.hidden).toBe(true);

		toggle(query<HTMLInputElement>(root, "input[role=switch]"));
		await runtime.settled();
		expect(notice.hidden).toBe(false);
		expect(query(root, ".status").textContent).toBe(translate("status.reloadRequired"));
	});

	test("起動に失敗した機能は原因を確認できる", async () => {
		const root = await openPanel([failingFeature]);
		const status = query<HTMLElement>(root, ".status");
		expect(status.textContent).toBe(translate("status.failed"));
		expect(status.title).toBe("Error: boom");
	});

	test("正しい値は保存し、不正な値は保存せずに知らせる", async () => {
		const root = await openPanel([liveFeature]);
		const input = query<HTMLInputElement>(root, ".feature-fields input");
		const error = query<HTMLElement>(root, ".field-error");
		expect(input.value).toBe("50%");

		input.value = "1200px";
		input.dispatchEvent(new Event("change", {bubbles: true}));
		expect(error.hidden).toBe(false);
		expect(settings.storedOptions("live")).toBeUndefined();

		input.value = "80%";
		input.dispatchEvent(new Event("change", {bubbles: true}));
		expect(error.hidden).toBe(true);
		expect(settings.storedOptions("live")).toEqual({width: "80%"});
	});

	test("入力の途中でも不正な値を知らせ、保存はしない", async () => {
		const root = await openPanel([liveFeature]);
		const input = query<HTMLInputElement>(root, ".feature-fields input");
		const error = query<HTMLElement>(root, ".field-error");

		input.value = "1200px";
		input.dispatchEvent(new Event("input", {bubbles: true}));
		expect(error.hidden).toBe(false);
		expect(input.getAttribute("aria-invalid")).toBe("true");

		input.value = "80%";
		input.dispatchEvent(new Event("input", {bubbles: true}));
		expect(error.hidden).toBe(true);
		expect(settings.storedOptions("live")).toBeUndefined();
	});

	test("機能が用意した案内があれば、不正な値のときに表示する", async () => {
		const root = await openPanel([defineFeature({
			...metadata,
			id: "messaged",
			title: "wideLayout.title",
			options: {
				range: option.text("20", "ratingGraph.recentRange", {invalidMessage: "ratingGraph.recentRangeInvalid"}),
			},
			live: true,
			start: () => () => {
			},
		})]);
		expect(query<HTMLElement>(root, ".field-error").textContent).toBe(translate("ratingGraph.recentRangeInvalid"));
	});

	test("初期化すると入力欄も既定値に戻る", async () => {
		const confirmMock = mock(() => true);
		const originalConfirm = window.confirm;
		window.confirm = confirmMock;
		try {
			const root = await openPanel([liveFeature]);
			settings.setOption("live", "width", "80%");
			const resetButton = [...root.querySelectorAll("button")]
				.find((button) => button.textContent === translate("settings.reset"));
			resetButton?.click();

			expect(confirmMock).toHaveBeenCalledTimes(1);
			expect(query<HTMLInputElement>(root, ".feature-fields input").value).toBe("50%");
		} finally {
			window.confirm = originalConfirm;
		}
	});
});

describe("addNavigationEntry", () => {
	beforeEach(() => {
		document.body.innerHTML = '<ul class="first"></ul><ul class="second"></ul>';
	});

	test("最初に見つかったメニューにリンクを追加する", () => {
		const onOpen = mock(() => {
		});
		addNavigationEntry([".missing", ".second", ".first"], "CP Toolkit", onOpen);

		const link = document.querySelector<HTMLAnchorElement>(".second a");
		expect(link?.textContent).toBe("CP Toolkit");
		expect(document.querySelector(".first a")).toBeNull();
		link?.click();
		expect(onOpen).toHaveBeenCalledTimes(1);
	});

	test("メニューが見つからなければ何もしない", () => {
		addNavigationEntry([".missing"], "CP Toolkit", () => {
		});
		expect(document.querySelector("a")).toBeNull();
	});
});
