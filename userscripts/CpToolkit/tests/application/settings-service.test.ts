import {beforeEach, describe, expect, mock, test} from "bun:test";
import {SettingsService} from "@application/settings/settings-service";
import {MemoryStore} from "../support/fakes";

describe("SettingsService", () => {
	let store: MemoryStore;
	let settings: SettingsService;

	beforeEach(() => {
		store = new MemoryStore();
		settings = new SettingsService(store);
	});

	test("保存値がなければ機能の既定値を使う", () => {
		expect(settings.isEnabled("a", true)).toBe(true);
		expect(settings.isEnabled("a", false)).toBe(false);
	});

	test("変更を保存し、購読者に知らせる", () => {
		const listener = mock();
		settings.subscribe(listener);
		settings.setEnabled("a", false);
		settings.setOption("a", "width", "80%");

		expect(listener).toHaveBeenCalledTimes(2);
		const reloaded = new SettingsService(store);
		expect(reloaded.isEnabled("a", true)).toBe(false);
		expect(reloaded.storedOptions("a")).toEqual({width: "80%"});
	});

	test("他のタブでの変更を反映する", () => {
		const listener = mock();
		settings.subscribe(listener);
		store.changeRemotely("settings", {version: 1, features: {a: {enabled: true}}});

		expect(settings.isEnabled("a", false)).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	test("書き出した設定を読み込める", () => {
		settings.setOption("a", "width", "80%");
		const exported = settings.exportJson();
		settings.reset();
		expect(settings.storedOptions("a")).toBeUndefined();

		expect(settings.importJson(exported)).toBe(true);
		expect(settings.storedOptions("a")).toEqual({width: "80%"});
	});

	test("読み込めない内容では現在の設定を変更しない", () => {
		settings.setEnabled("a", false);
		for (const text of ["{broken", "[]", "null", "1"]) {
			expect(settings.importJson(text)).toBe(false);
		}
		expect(settings.isEnabled("a", true)).toBe(false);
	});
});
