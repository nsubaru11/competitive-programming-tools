import type {Locale} from "@catalog/messages";

/** ページの言語を優先する。meta が解析される前はブラウザの言語を使う。 */
export function detectLocale(): Locale {
	const meta = document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Language"]');
	return (meta?.content || navigator.language).startsWith("ja") ? "ja" : "en";
}
