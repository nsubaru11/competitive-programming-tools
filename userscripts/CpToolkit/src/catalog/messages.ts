import en from "@data/i18n/en.yaml";
import ja from "@data/i18n/ja.yaml";

export type MessageKey = keyof typeof ja;
export type Locale = "ja" | "en";
export type Translate = (key: MessageKey) => string;

const MESSAGES: Readonly<Record<Locale, Readonly<Record<MessageKey, string>>>> = {ja, en};

/** ロケールは呼び出しごとに取得する。document-start の時点ではページの言語が確定しないため。 */
export function createTranslator(getLocale: () => Locale): Translate {
	return (key) => MESSAGES[getLocale()][key];
}
