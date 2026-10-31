import {parseStoredObject} from "@atcoder-tools/shared";

export const CURRENT_SETTINGS_VERSION = 1;

export type FeatureSettings = {
	readonly enabled?: boolean;
	readonly options?: Readonly<Record<string, unknown>>;
};

export type Settings = {
	readonly version: number;
	readonly features: Readonly<Record<string, FeatureSettings>>;
};

type SettingsMigration = (settings: Settings) => Settings;

/** キーの版から次の版へ移行する処理。保存形式を変えるたびに追加する。 */
const MIGRATIONS: Readonly<Record<number, SettingsMigration>> = {};

export function createDefaultSettings(): Settings {
	return {version: CURRENT_SETTINGS_VERSION, features: {}};
}

function parseFeatureSettings(raw: unknown): FeatureSettings {
	const {enabled, options} = parseStoredObject<Record<string, unknown>>(raw);
	return {
		...(typeof enabled === "boolean" ? {enabled} : {}),
		options: parseStoredObject<Record<string, unknown>>(options),
	};
}

/** 保存値を読み取り、現在の版へ移行する。壊れた値は既定値として扱う。 */
export function parseSettings(raw: unknown): Settings {
	const {version, features} = parseStoredObject<Record<string, unknown>>(raw);
	const entries = Object.entries(parseStoredObject<Record<string, unknown>>(features));
	let settings: Settings = {
		version: typeof version === "number" ? version : CURRENT_SETTINGS_VERSION,
		features: Object.fromEntries(entries.map(([id, value]) => [id, parseFeatureSettings(value)])),
	};
	while (settings.version < CURRENT_SETTINGS_VERSION) {
		const migrated = MIGRATIONS[settings.version]?.(settings) ?? settings;
		settings = {...migrated, version: settings.version + 1};
	}
	return settings;
}

export function updateFeatureSettings(settings: Settings, featureId: string, patch: FeatureSettings): Settings {
	const current = settings.features[featureId];
	const next = {...current, ...patch, options: {...current?.options, ...patch.options}};
	return {...settings, features: {...settings.features, [featureId]: next}};
}
