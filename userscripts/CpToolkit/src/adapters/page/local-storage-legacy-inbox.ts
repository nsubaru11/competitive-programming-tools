import {safeJsonParse} from "@atcoder-tools/shared";
import type {LegacySettingsInbox} from "@application/settings/legacy-import";

const KEY_PREFIX = "cp-toolkit:legacy:";

/** スクリプトごとの保存領域は互いに読めないので、サイトの localStorage を経由して受け取る。 */
export class LocalStorageLegacyInbox implements LegacySettingsInbox {
	take(scriptId: string): unknown {
		const key = KEY_PREFIX + scriptId;
		const value = localStorage.getItem(key);
		if (value === null) return undefined;
		localStorage.removeItem(key);
		return safeJsonParse<unknown>(value, undefined);
	}
}
