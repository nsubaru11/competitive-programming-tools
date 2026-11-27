import type {FeatureSettings, Settings} from "./settings";

/** Easy Test+ のキーを使わない設定。旧版の設定の取り込みでも使う。 */
export const EASY_TEST_KEYS_OFF = {testAndSubmit: "", testAll: "", toggleEasyTest: ""} as const;

/**
 * Toolkit 3.0 への移行。
 * Easy Test+ のキーはショートカットキーの機能へ移したので、Easy Test+ のショートカットを OFF にしていた人はキーを使わないままにする。
 */
export function migrateToVersion2(settings: Settings): Settings {
	const easyTest = settings.features["easy-test"];
	if (!easyTest) return settings;
	const {keyboardShortcuts, ...easyTestOptions} = easyTest.options ?? {};
	const features: Record<string, FeatureSettings> = {...settings.features, "easy-test": {...easyTest, options: easyTestOptions}};
	if (keyboardShortcuts === false) {
		const shortcuts = settings.features["keyboard-shortcuts"];
		features["keyboard-shortcuts"] = {...shortcuts, options: {...EASY_TEST_KEYS_OFF, ...shortcuts?.options}};
	}
	return {...settings, features};
}
