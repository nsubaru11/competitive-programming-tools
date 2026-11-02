import fs from "node:fs";
import path from "node:path";

/** 利用者がコマンドで設定する値。環境ごとに違うので、リポジトリには入れない。 */
export type LocalSettings = {
	librarySourceRoot?: string;
};

export function readLocalSettings(file: string): LocalSettings {
	try {
		const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
		if (typeof parsed !== "object" || parsed === null) return {};
		const {librarySourceRoot} = parsed as Record<string, unknown>;
		return typeof librarySourceRoot === "string" ? {librarySourceRoot} : {};
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
