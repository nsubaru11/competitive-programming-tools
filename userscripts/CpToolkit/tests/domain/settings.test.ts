import {describe, expect, test} from "bun:test";
import {SettingsService} from "@application/settings/settings-service";
import {normalizeOptions, option} from "@domain/settings/option";
import {createDefaultSettings, CURRENT_SETTINGS_VERSION, featureOptions, isFeatureEnabled, parseSettings, updateFeatureSettings, updateSiteFeatureSettings} from "@domain/settings/settings";
import {matchesShortcut, normalizeModifiers, normalizeShortcut, readModifierSetting, readShortcutSetting} from "@domain/settings/shortcut";
import {easyTest} from "@features/easy-test/index";
import {sourceComments} from "@features/source-comments/index";
import {submissionHelper} from "@features/submission-helper/index";
import {MemoryStore} from "../support/fakes";

describe("option", () => {
	test("boolean は真偽値だけを受け付ける", () => {
		const definition = option.boolean(false, "label");
		expect(definition.normalize(true)).toBe(true);
		expect(definition.normalize("true")).toBeUndefined();
	});

	test("text は前後の空白を除いて検証する", () => {
		const definition = option.text("x", "label", {validate: (value) => value.endsWith("px")});
		expect(definition.normalize(" 10px ")).toBe("10px");
		expect(definition.normalize("10")).toBeUndefined();
		expect(definition.normalize(10)).toBeUndefined();
	});

	test("color は短い形式を6桁に揃える", () => {
		const definition = option.color("#000000", "label");
		expect(definition.normalize("#03B")).toBe("#0033bb");
		expect(definition.normalize("#0033B3")).toBe("#0033b3");
		expect(definition.normalize("rgb(0,0,0)")).toBeUndefined();
	});

	test("number は範囲外と NaN を拒否する", () => {
		const definition = option.number(1, "label", {min: 0, max: 10});
		expect(definition.normalize(10)).toBe(10);
		expect(definition.normalize(11)).toBeUndefined();
		expect(definition.normalize(Number.NaN)).toBeUndefined();
	});

	test("integer の number は小数を拒否する", () => {
		const definition = option.number(1, "label", {min: 0, integer: true});
		expect(definition.normalize(3)).toBe(3);
		expect(definition.normalize(2.5)).toBeUndefined();
	});

	test("入力欄の検査: 許容誤差、ヘッダーの名前、DEBUG の名前、ライブラリのパッケージ", () => {
		const cases = [
			[easyTest.options.allowableError, ["1e-6", "0.001"], ["10^-6", "1e", "0"]],
			[sourceComments.options.runnerHeaderName, ["", "short", "java-2"], ["../x", "-a", "a b"]],
			[submissionHelper.options.debugFlag, ["", "DEBUG", "_debug1"], ["1DEBUG", "DE-BUG", "debug flag"]],
			[submissionHelper.options.libraryPackage, ["", "lib", "lib.io", "my_lib.x2", "競技.道具"], ["lib.", ".lib", "lib..io", "lib-io", "1lib"]],
		] as const;
		for (const [definition, valid, invalid] of cases) {
			for (const value of valid) expect(definition!.normalize(value)).toBe(value);
			for (const value of invalid) expect(definition!.normalize(value)).toBeUndefined();
		}
		expect(easyTest.options.savedCodeLimit!.normalize(2.5)).toBeUndefined();
	});

	test("select は選択肢にある値だけを受け付ける", () => {
		const definition = option.select("a", "label", [{value: "a", label: "A"}, {value: "b", label: "B"}]);
		expect(definition.normalize("b")).toBe("b");
		expect(definition.normalize("c")).toBeUndefined();
	});
});

describe("normalizeOptions", () => {
	const schema = {
		enabled: option.boolean(false, "label"),
		width: option.text("50%", "label"),
	};

	test("未保存の値は既定値になる", () => {
		expect(normalizeOptions(schema, undefined)).toEqual({enabled: false, width: "50%"});
	});

	test("不正な値は既定値に戻し、正しい値は保持する", () => {
		expect(normalizeOptions(schema, {enabled: "yes", width: "80%"})).toEqual({enabled: false, width: "80%"});
	});

	test("偽の値も既定値に置き換えない", () => {
		const values = normalizeOptions({flag: option.boolean(true, "label"), text: option.text("x", "label")}, {
			flag: false,
			text: "",
		});
		expect(values).toEqual({flag: false, text: ""});
	});

	test("未知のキーは捨てる", () => {
		expect(normalizeOptions(schema, {removed: 1})).toEqual({enabled: false, width: "50%"});
	});
});

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

describe("3.0 への移行", () => {
	test("Easy Test+ のショートカットを OFF にしていた人は、Easy Test+ のキーを使わないままにする", () => {
		const migrated = parseSettings({version: 1, features: {"easy-test": {enabled: true, options: {keyboardShortcuts: false, precompile: false}}}});
		expect(migrated.features["easy-test"]).toEqual({enabled: true, options: {precompile: false}});
		expect(migrated.features["keyboard-shortcuts"]?.options).toEqual({testAndSubmit: "", testAll: "", toggleEasyTest: ""});
		const kept = parseSettings({version: 1, features: {"easy-test": {options: {keyboardShortcuts: true}}}});
		expect(kept.features["keyboard-shortcuts"]).toBeUndefined();
		// 新しい形式でキーを決めていれば、そちらを優先する
		const chosen = parseSettings({version: 1, features: {"easy-test": {options: {keyboardShortcuts: false}}, "keyboard-shortcuts": {options: {testAll: "Alt+T"}}}});
		expect(chosen.features["keyboard-shortcuts"]?.options?.testAll).toBe("Alt+T");
	});

});

describe("サイトごとの設定", () => {
	test("サイトの値が無ければ、分ける前の値、既定値の順に使う", () => {
		const settings = parseSettings({version: 2, features: {a: {enabled: false, options: {x: 1, y: 2}, sites: {atcoder: {enabled: true, options: {x: 3}}}}}});
		expect(isFeatureEnabled(settings, "a", "atcoder", false)).toBe(true);
		expect(isFeatureEnabled(settings, "a", "codeforces", true)).toBe(false);
		expect(isFeatureEnabled(settings, "b", "codeforces", true)).toBe(true);
		expect(featureOptions(settings, "a", "atcoder")).toEqual({x: 3, y: 2});
		expect(featureOptions(settings, "a", "codeforces")).toEqual({x: 1, y: 2});
	});

	test("1つのサイトの変更は、ほかのサイトに影響しない", () => {
		const updated = updateSiteFeatureSettings(createDefaultSettings(), "a", "atcoder", {enabled: false, options: {x: 1}});
		expect(isFeatureEnabled(updated, "a", "atcoder", true)).toBe(false);
		expect(isFeatureEnabled(updated, "a", "codeforces", true)).toBe(true);
		expect(featureOptions(updated, "a", "codeforces")).toEqual({});
		const restored = parseSettings(JSON.parse(JSON.stringify(updated)));
		expect(featureOptions(restored, "a", "atcoder")).toEqual({x: 1});
		expect(isFeatureEnabled(restored, "a", "atcoder", true)).toBe(false);
	});

	test("全サイトで同じ値を使う項目は、どのサイトから変えても全サイトに効く", () => {
		const service = new SettingsService(new MemoryStore());
		const atcoder = service.forSite("atcoder");
		atcoder.setOption("a", "key", "Alt+S");
		atcoder.setSharedOption("a", "url", "http://localhost:9000");
		expect(service.forSite("codeforces").storedOptions("a")).toEqual({url: "http://localhost:9000"});
		expect(atcoder.storedOptions("a")).toEqual({url: "http://localhost:9000", key: "Alt+S"});
		expect(service.forSite(null)).toBe(service);
	});
});

describe("キーの書き方", () => {
	test("修飾キーの順番と大文字をそろえる", () => {
		expect(normalizeShortcut("shift+ctrl+enter")).toBe("Ctrl+Shift+Enter");
		expect(normalizeShortcut("alt+ctrl+,")).toBe("Ctrl+Alt+,");
		expect(normalizeShortcut("ctrl+shift+alt+p")).toBe("Ctrl+Shift+Alt+P");
		expect(normalizeShortcut("command+p")).toBe("Cmd+P");
		expect(normalizeShortcut("option+cmd+ctrl+[")).toBe("Ctrl+Alt+Cmd+[");
		expect(normalizeShortcut("meta+p")).toBeNull();
		expect(normalizeShortcut("ctrl+f12")).toBe("Ctrl+F12");
	});

	test("保存する値は短い名前にそろえ、読み直しても同じキーになる。none は空欄にする", () => {
		expect(readShortcutSetting("None")).toBe("");
		expect(readShortcutSetting("")).toBe("");
		expect(readShortcutSetting("ctrl+arrowleft")).toBe("Ctrl+Left");
		// 照合では空白の文字になるキーも、名前で保存する
		expect(readShortcutSetting("Ctrl+space")).toBe("Ctrl+Space");
		expect(normalizeShortcut("Ctrl+Space")).toBe("Ctrl+ ");
		expect(readShortcutSetting("Ctrl+Control")).toBeUndefined();
	});

	test("修飾キーだけの設定は、修飾キーが1つ以上あり、ほかのキーを含まない", () => {
		expect(normalizeModifiers("alt + ctrl")).toBe("Ctrl+Alt");
		expect(normalizeModifiers("Cmd+Option")).toBe("Alt+Cmd");
		expect(normalizeModifiers("Ctrl+Alt+1")).toBeNull();
		expect(normalizeModifiers("")).toBeNull();
		expect(readModifierSetting("none")).toBe("");
		expect(readModifierSetting("shift+ctrl+alt")).toBe("Ctrl+Shift+Alt");
		expect(readModifierSetting("Ctrl+1")).toBeUndefined();
	});

	test("押したキーで操作を探す。修飾キーだけの設定は、後ろに続けるキーまで押しても当たる", () => {
		expect(matchesShortcut("Ctrl+Left", "Ctrl+ArrowLeft")).toBe(true);
		expect(matchesShortcut("Ctrl+Enter", "Ctrl")).toBe(false);
		expect(matchesShortcut("", "Ctrl")).toBe(false);
		expect(matchesShortcut("Ctrl+Alt", "Ctrl+Alt", ["1"])).toBe(true);
		expect(matchesShortcut("Ctrl+Alt", "Ctrl+Alt+1", ["1"])).toBe(true);
		expect(matchesShortcut("Ctrl+Alt", "Ctrl+Alt+A", ["1"])).toBe(false);
		expect(matchesShortcut("", "Ctrl", ["1"])).toBe(false);
	});
});
