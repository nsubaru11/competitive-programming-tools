import fs from "node:fs";
import path from "node:path";

/** 配布用の実行ファイルに埋め込むファイルの名前(scripts/package.ts が埋め込む)。 */
export const EMBEDDED_FILES = {
	dispatcherJar: "dispatcher.jar",
	launcher: "launcher.elf",
	warmUpSource: "WarmUp.java",
} as const;

/** 実行ファイルに埋め込んだファイルを名前で探す。ソースから動かすときは埋め込みが無いので、常に undefined。 */
function findEmbeddedFile(name: string): Blob | undefined {
	return Bun.embeddedFiles.find((file) => file.name === name);
}

/** 埋め込んだテキストのファイルを読む。埋め込みが無ければ null。 */
export async function readEmbeddedText(name: string): Promise<string | null> {
	const file = findEmbeddedFile(name);
	return file ? await file.text() : null;
}

/**
 * 埋め込んだファイルを target へ書き出し、そのパスを返す。埋め込みが無ければ null。
 * 中身が同じなら書き直さない。動いているプログラムを書き換えないよう、別名で書いてから置き換える。
 */
export async function extractEmbeddedFile(name: string, target: string, mode = 0o644): Promise<string | null> {
	const file = findEmbeddedFile(name);
	if (!file) return null;
	const content = Buffer.from(await file.arrayBuffer());
	if (fs.existsSync(target) && fs.readFileSync(target).equals(content)) return target;
	fs.mkdirSync(path.dirname(target), {recursive: true});
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, content, {mode});
	fs.renameSync(temporary, target);
	return target;
}
