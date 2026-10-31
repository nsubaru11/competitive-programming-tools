import {describe, expect, test} from "bun:test";
import {
	createDefaultSettings,
	CURRENT_SETTINGS_VERSION,
	parseSettings,
	updateFeatureSettings,
} from "@domain/settings/settings";

describe("parseSettings", () => {
	test("値がなければ既定の設定を返す", () => {
		expect(parseSettings(undefined)).toEqual(createDefaultSettings());
	});

	test("壊れた値は既定の設定として扱う", () => {
		expect(parseSettings("{broken")).toEqual(createDefaultSettings());
		expect(parseSettings([1, 2])).toEqual(createDefaultSettings());
	});

	test("機能の設定を読み取り、型の違う項目は捨てる", () => {
		const settings = parseSettings({
			version: CURRENT_SETTINGS_VERSION,
			features: {a: {enabled: "yes", options: {x: 1}}, b: {enabled: false}},
		});
		expect(settings.features).toEqual({a: {options: {x: 1}}, b: {enabled: false, options: {}}});
	});

	test("古い版は現在の版に上げる", () => {
		expect(parseSettings({version: 0, features: {}}).version).toBe(CURRENT_SETTINGS_VERSION);
	});

	test("新しい版を読んでも版を下げない", () => {
		const version = CURRENT_SETTINGS_VERSION + 1;
		expect(parseSettings({version, features: {}}).version).toBe(version);
	});
});

describe("updateFeatureSettings", () => {
	test("元の値を変更せず、他の項目を保持する", () => {
		const original = updateFeatureSettings(createDefaultSettings(), "a", {enabled: true, options: {x: 1}});
		const updated = updateFeatureSettings(original, "a", {options: {y: 2}});
		expect(original.features.a?.options).toEqual({x: 1});
		expect(updated.features.a).toEqual({enabled: true, options: {x: 1, y: 2}});
	});
});
