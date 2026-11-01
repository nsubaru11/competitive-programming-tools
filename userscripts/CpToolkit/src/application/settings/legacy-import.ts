import {parseStoredObject} from "@atcoder-tools/shared";
import {LEGACY_SCRIPTS} from "@domain/settings/legacy";
import type {SettingsService} from "@application/settings/settings-service";

/** 統合前のスクリプトが書き出した設定の受け渡し場所。 */
export interface LegacySettingsInbox {
	/** 取り出した値は受け渡し場所から消える。 */
	take(scriptId: string): unknown;
}

/** 書き出された設定を取り込む。すでに設定してある機能と、ON/OFF を選んだ機能は上書きしない。 */
export function importLegacySettings(inbox: LegacySettingsInbox, settings: SettingsService): void {
	for (const [scriptId, migrate] of Object.entries(LEGACY_SCRIPTS)) {
		const stored = inbox.take(scriptId);
		if (stored === undefined) continue;
		for (const {featureId, options, enable} of migrate(parseStoredObject<Record<string, unknown>>(stored))) {
			if (enable && !settings.hasEnabledChoice(featureId)) settings.setEnabled(featureId, true);
			if (Object.keys(parseStoredObject(settings.storedOptions(featureId))).length > 0) continue;
			for (const [key, value] of Object.entries(options)) settings.setOption(featureId, key, value);
		}
	}
}
