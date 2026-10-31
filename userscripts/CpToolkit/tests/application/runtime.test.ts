import {beforeEach, describe, expect, mock, test} from "bun:test";
import {createTranslator} from "@catalog/messages";
import {option} from "@domain/settings/option";
import {matchPage} from "@domain/page/route";
import {judges} from "@catalog/judges";
import {defineFeature, type Feature} from "@application/feature/definition";
import {FeatureRuntime} from "@application/feature/runtime";
import {SettingsService} from "@application/settings/settings-service";
import {immediateLifecycle, MemoryStore, RecordingLogger} from "../support/fakes";

const metadata = {
	title: "wideLayout.title",
	description: "wideLayout.description",
	category: "category.layout",
	routes: ["atcoder:page"],
	phase: "start",
} as const;

function liveFeature(start: (value: string) => () => void, defaultEnabled = true): Feature {
	return defineFeature({
		...metadata,
		id: "live",
		defaultEnabled,
		options: {value: option.text("initial", "wideLayout.width")},
		live: true,
		start: ({options}) => start(options.value),
	});
}

function reloadFeature(start: () => void, defaultEnabled = true): Feature {
	return defineFeature({
		...metadata,
		id: "reload",
		defaultEnabled,
		options: {value: option.text("initial", "wideLayout.width")},
		start,
	});
}

describe("FeatureRuntime", () => {
	let settings: SettingsService;
	let logger: RecordingLogger;

	beforeEach(() => {
		settings = new SettingsService(new MemoryStore());
		logger = new RecordingLogger();
	});

	function createRuntime(features: readonly Feature[], href = "https://atcoder.jp/home"): FeatureRuntime {
		return new FeatureRuntime({
			features,
			page: matchPage(judges, href),
			lifecycle: immediateLifecycle,
			settings,
			services: {translate: createTranslator(() => "ja")},
			logger,
		});
	}

	async function startRuntime(features: readonly Feature[], href?: string): Promise<FeatureRuntime> {
		const runtime = createRuntime(features, href);
		runtime.start();
		await runtime.settled();
		return runtime;
	}

	test("有効な機能を起動する", async () => {
		const start = mock(() => {
		});
		const runtime = await startRuntime([reloadFeature(start)]);
		expect(start).toHaveBeenCalledTimes(1);
		expect(runtime.statusOf("reload")).toEqual({state: "running"});
	});

	test("無効な機能は起動しない", async () => {
		const start = mock(() => {
		});
		const runtime = await startRuntime([reloadFeature(start, false)]);
		expect(start).not.toHaveBeenCalled();
		expect(runtime.statusOf("reload")).toEqual({state: "disabled"});
	});

	test("対象外のページでは起動しない", async () => {
		const start = mock(() => {
		});
		const runtime = await startRuntime([reloadFeature(start)], "https://atcoder.jp/");
		expect(start).not.toHaveBeenCalled();
		expect(runtime.statusOf("reload")).toEqual({state: "outOfScope"});
	});

	test("1つの機能が失敗しても他の機能は動く", async () => {
		const failing = reloadFeature(() => {
			throw new Error("boom");
		});
		const start = mock(() => () => {
		});
		const runtime = await startRuntime([failing, liveFeature(start)]);

		expect(runtime.statusOf("reload")).toEqual({state: "failed", message: "Error: boom"});
		expect(runtime.statusOf("live")).toEqual({state: "running"});
		expect(logger.errors).toEqual(["Failed to start reload"]);
	});

	test("非同期の失敗も隔離する", async () => {
		const failing = defineFeature({
			...metadata,
			id: "async",
			defaultEnabled: true,
			options: {},
			start: () => Promise.reject(new Error("boom")),
		});
		const runtime = await startRuntime([failing]);
		expect(runtime.statusOf("async")).toEqual({state: "failed", message: "Error: boom"});
	});

	describe("再読み込みなしで反映できる機能", () => {
		test("OFF で後始末を呼び、ON で再び起動する", async () => {
			const dispose = mock(() => {
			});
			const start = mock(() => dispose);
			const runtime = await startRuntime([liveFeature(start)]);

			settings.setEnabled("live", false);
			await runtime.settled();
			expect(dispose).toHaveBeenCalledTimes(1);
			expect(runtime.statusOf("live")).toEqual({state: "disabled"});

			settings.setEnabled("live", true);
			await runtime.settled();
			expect(start).toHaveBeenCalledTimes(2);
			expect(runtime.statusOf("live")).toEqual({state: "running"});
		});

		test("設定を変えると新しい値で起動し直す", async () => {
			const started: string[] = [];
			const dispose = mock(() => {
			});
			const runtime = await startRuntime([liveFeature((value) => {
				started.push(value);
				return dispose;
			})]);

			settings.setOption("live", "value", "changed");
			await runtime.settled();
			expect(started).toEqual(["initial", "changed"]);
			expect(dispose).toHaveBeenCalledTimes(1);
		});

		test("他の機能の変更では起動し直さない", async () => {
			const start = mock(() => () => {
			});
			const runtime = await startRuntime([liveFeature(start), reloadFeature(() => {
			})]);

			settings.setEnabled("reload", false);
			await runtime.settled();
			expect(start).toHaveBeenCalledTimes(1);
		});

		test("連続して変更すると最後の値だけを反映する", async () => {
			const events: string[] = [];
			const runtime = await startRuntime([liveFeature((value) => {
				events.push(`start:${value}`);
				return () => events.push(`stop:${value}`);
			})]);

			settings.setOption("live", "value", "a");
			settings.setOption("live", "value", "b");
			await runtime.settled();
			expect(events).toEqual(["start:initial", "stop:initial", "start:b"]);
		});
	});

	describe("再読み込みが必要な機能", () => {
		test("変更すると再読み込み待ちになり、起動済みの処理はそのまま動く", async () => {
			const start = mock(() => {
			});
			const runtime = await startRuntime([reloadFeature(start)]);

			settings.setEnabled("reload", false);
			await runtime.settled();
			expect(runtime.statusOf("reload")).toEqual({state: "reloadRequired"});
			expect(start).toHaveBeenCalledTimes(1);
		});

		test("読み込み時の設定に戻すと再読み込み待ちを解除する", async () => {
			const runtime = await startRuntime([reloadFeature(() => {
			})]);

			settings.setOption("reload", "value", "changed");
			await runtime.settled();
			expect(runtime.statusOf("reload")).toEqual({state: "reloadRequired"});

			settings.reset();
			await runtime.settled();
			expect(runtime.statusOf("reload")).toEqual({state: "running"});
		});

		test("無効のまま設定を変えても再読み込みを求めない", async () => {
			const runtime = await startRuntime([reloadFeature(() => {
			}, false)]);

			settings.setOption("reload", "value", "changed");
			await runtime.settled();
			expect(runtime.statusOf("reload")).toEqual({state: "disabled"});
		});

		test("失敗した機能は他の機能の変更で状態が変わらない", async () => {
			const failing = reloadFeature(() => {
				throw new Error("boom");
			});
			const runtime = await startRuntime([failing, liveFeature(() => () => {
			})]);

			settings.setEnabled("live", false);
			await runtime.settled();
			expect(runtime.statusOf("reload").state).toBe("failed");
		});
	});
});
