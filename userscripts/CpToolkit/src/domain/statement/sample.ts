/** 見出しの文言からサンプルの項目かどうかを判定する。 */
export function isSampleTitle(sampleHeadings: readonly string[], title: string): boolean {
	return sampleHeadings.some((heading) => title.includes(heading));
}
