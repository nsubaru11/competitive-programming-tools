import fs from "node:fs";
import path from "node:path";

/** 利用者がコマンドで設定する値。環境ごとに違うので、リポジトリには入れない。 */
export type LocalSettings = {
	librarySourceRoot?: string;
	/** 言語やヘッダーの名前ごとの、提出物の先頭に付けるファイル。 */
	headerFiles?: Record<string, string>;
};

function isStringRecord(value: unknown): value is Record<string, string> {
	return typeof value === "object" && value !== null && Object.values(value).every((item) => typeof item === "string");
}

/** ヘッダーの名前は HTTP でも受け取るので、形式を限定する。 */
export function isHeaderName(name: string): boolean {
	return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name);
}

export function readLocalSettings(file: string): LocalSettings {
	try {
		const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
		if (typeof parsed !== "object" || parsed === null) return {};
		const {librarySourceRoot, headerFiles} = parsed as Record<string, unknown>;
		return {
			...(typeof librarySourceRoot === "string" ? {librarySourceRoot} : {}),
			...(isStringRecord(headerFiles) ? {headerFiles} : {}),
		};
	} catch {
		return {};
	}
}

export function writeLocalSettings(file: string, settings: LocalSettings): void {
	fs.writeFileSync(file, `${JSON.stringify(settings, null, "\t")}\n`, "utf8");
}

/** 指定されたフォルダから、`lib` を直下に持つ `src` フォルダを探す。ライブラリのルートでも `src` でも受け付ける。 */
export function resolveLibrarySource(input: string): string {
	const root = path.resolve(input);
	const candidates = [root, path.join(root, "src")];
	const found = candidates.find((candidate) => fs.existsSync(path.join(candidate, "lib")));
	if (!found) throw new Error(`The lib folder was not found. Tried: ${candidates.join(", ")}`);
	return found;
}

/** Windows の CLI で設定したパスを、WSL のサーバーから読める形にする。 */
export function toRuntimePath(value: string, platform: NodeJS.Platform = process.platform): string {
	const windowsPath = /^([A-Za-z]):[\\/](.*)$/.exec(value);
	if (platform !== "linux" || !windowsPath) return value;
	const [, drive = "", rest = ""] = windowsPath;
	return `/mnt/${drive.toLowerCase()}/${rest.replaceAll("\\", "/")}`;
}
