const FOLDABLE_TYPE_PATTERN = /^\s*(?:(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp)\s+)*(?:class|interface|enum|record|@interface)\b/;
const BLOCK_COMMENT_PATTERN = /^\s*\/\*/;

/** トップレベルの型と複数行コメントが始まる行を返す。 */
export function findFoldStartLines(source: string): number[] {
	return source.split("\n").flatMap((line, index) => {
		return FOLDABLE_TYPE_PATTERN.test(line) || BLOCK_COMMENT_PATTERN.test(line) ? [index] : [];
	});
}
