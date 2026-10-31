import {languageCatalog} from "@catalog/tables";
import {resolveFamily} from "@domain/execution/language";
import type {JudgeLanguage} from "@domain/execution/result";

/** サイトの言語の選択欄を読む。版と ID はサイトの表示をそのまま使う。 */
export function languagesOf(select: HTMLSelectElement | null): readonly JudgeLanguage[] {
	return [...(select?.options ?? [])]
		.filter(({value}) => value !== "")
		.map(({value, text}) => {
			const label = text.trim();
			return {id: value, label, family: resolveFamily(languageCatalog, label)};
		});
}
