const PUBLIC_TYPE_PATTERN = /^((?:(?:abstract|final|sealed|non-sealed|strictfp)[ \t]+)*)public[ \t]+(?=(?:(?:abstract|final|sealed|non-sealed|strictfp)[ \t]+)*(?:class|interface|enum|record|@interface)\b)/gm;

/** 行頭から始まる型の宣言から public を外す。行数は変えない。 */
export function withoutPublicTypes(source: string): string {
	return source.replace(PUBLIC_TYPE_PATTERN, "$1");
}
