import {languageCatalog} from "@catalog/tables";
import {resolveFamily} from "@domain/execution/language";
import type {JudgeLanguage} from "@domain/execution/result";

function toLanguage({value, text}: HTMLOptionElement): JudgeLanguage {
	const label = text.trim();
	return {id: value, label, family: resolveFamily(languageCatalog, label)};
}

/** サイトの言語の選択欄を読む。版と ID はサイトの表示をそのまま使う。 */
export function languagesOf(select: HTMLSelectElement | null): readonly JudgeLanguage[] {
	return [...(select?.options ?? [])].filter(({value}) => value !== "").map(toLanguage);
}

export function selectedLanguageOf(select: HTMLSelectElement | null): JudgeLanguage | null {
	const option = select?.selectedOptions[0];
	return option?.value ? toLanguage(option) : null;
}
