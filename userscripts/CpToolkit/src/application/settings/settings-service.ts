import {createDefaultSettings, parseSettings, type Settings, updateFeatureSettings} from "@domain/settings/settings";
import type {KeyValueStore} from "@application/ports/key-value-store";

const STORAGE_KEY = "settings";

export class SettingsService {
	private settings: Settings;
	private readonly listeners = new Set<() => void>();

	constructor(private readonly store: KeyValueStore) {
		this.settings = parseSettings(store.get(STORAGE_KEY));
		store.subscribeRemote(STORAGE_KEY, (value) => this.replace(parseSettings(value)));
	}

	isEnabled(featureId: string, defaultEnabled: boolean): boolean {
		return this.settings.features[featureId]?.enabled ?? defaultEnabled;
	}

	storedOptions(featureId: string): unknown {
		return this.settings.features[featureId]?.options;
	}

	setEnabled(featureId: string, enabled: boolean): void {
		this.commit(updateFeatureSettings(this.settings, featureId, {enabled}));
	}

	setOption(featureId: string, key: string, value: unknown): void {
		this.commit(updateFeatureSettings(this.settings, featureId, {options: {[key]: value}}));
	}

	reset(): void {
		this.commit(createDefaultSettings());
	}

	exportJson(): string {
		return JSON.stringify(this.settings, null, "\t");
	}

	/** JSON として読めない場合は false を返し、現在の設定を変更しない。 */
	importJson(text: string): boolean {
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			return false;
		}
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return false;
		this.commit(parseSettings(parsed));
		return true;
	}

	subscribe(listener: () => void): void {
		this.listeners.add(listener);
	}

	private commit(settings: Settings): void {
		this.store.set(STORAGE_KEY, settings);
		this.replace(settings);
	}

	private replace(settings: Settings): void {
		this.settings = settings;
		for (const listener of this.listeners) listener();
	}
}
