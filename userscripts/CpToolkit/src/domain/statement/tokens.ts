export type TextSegment = {
	readonly text: string;
	readonly emphasized: boolean;
};

const NUMBER_PATTERN = /(^|\W)([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?)/gi;
const PURE_NUMBER_PATTERN = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?$/i;

export function isPureNumber(text: string): boolean {
	return PURE_NUMBER_PATTERN.test(text.trim());
}

/** 文章を数字とそれ以外に分ける。 */
export function splitNumbers(text: string): TextSegment[] {
	const segments: TextSegment[] = [];
	let position = 0;
	for (const match of text.matchAll(NUMBER_PATTERN)) {
		const prefix = match[1] ?? "";
		const value = match[2] ?? "";
		const start = match.index + prefix.length;
		if (start > position) segments.push({text: text.slice(position, start), emphasized: false});
		segments.push({text: value, emphasized: true});
		position = start + value.length;
	}
	if (position < text.length) segments.push({text: text.slice(position), emphasized: false});
	return segments;
}

/**
 * 「Time Limit: 2 sec」のような表記を、数値とそれ以外に分ける。
 * 値が ignoredValue と等しい表記は強調しない。強調する値がなければ null を返す。
 */
export function splitLimitValue(text: string, keyword: string, ignoredValue?: number): TextSegment[] | null {
	const pattern = new RegExp(`${keyword}\\s*[:：]\\s*([0-9][0-9,]*(?:\\.[0-9]+)?)`, "g");
	const segments: TextSegment[] = [];
	let position = 0;
	for (const match of text.matchAll(pattern)) {
		const value = match[1] ?? "";
		if (Number(value.replaceAll(",", "")) === ignoredValue) continue;
		const valueStart = match.index + match[0].length - value.length;
		segments.push({text: text.slice(position, valueStart), emphasized: false});
		segments.push({text: value, emphasized: true});
		position = valueStart + value.length;
	}
	if (position === 0) return null;
	if (position < text.length) segments.push({text: text.slice(position), emphasized: false});
	return segments;
}
