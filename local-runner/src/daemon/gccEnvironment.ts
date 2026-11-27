import fs from "node:fs";

/** WSL 1 の drvfs と、WSL 2 で drvfs を公開する 9p のマウント位置を読む。 */
export function windowsMounts(info: string): string[] {
	const mounts: string[] = [];
	for (const line of info.split("\n")) {
		const [fields, filesystem] = line.split(" - ");
		if (!filesystem || !(/^drvfs /.test(filesystem) || /^9p .*\baname=drvfs\b/.test(filesystem))) continue;
		const mount = fields?.split(" ")[4];
		if (mount) mounts.push(mount.replace(/\\([0-7]{3})/g, (_, digits: string) => String.fromCharCode(parseInt(digits, 8))));
	}
	return mounts;
}

/** WSL の GCC が補助ツールを探すときだけ、Windows ドライブへのアクセスを省く。 */
export function gccSearchPath(compiler: string, searchPath: string, mounts: readonly string[]): string | undefined {
	const windowsDrive = (file: string) => mounts.some(mount => file === mount || file.startsWith(mount + "/"));
	if (windowsDrive(compiler) || !/(?:^|[/-])(?:gcc|g\+\+)(?:-\d+(?:\.\d+)*)?$/.test(compiler)) return undefined;
	const original = searchPath.split(":");
	const native = original.filter((directory) => !windowsDrive(directory));
	if (native.length === original.length || native.length === 0) return undefined;
	return native.join(":");
}

/** gcc という名前のラッパースクリプトや実体を読めないコマンドには、元の PATH を渡す。 */
export function nativeGccSearchPath(command: string): string | undefined {
	try {
		const file = fs.realpathSync(command);
		const mounts = windowsMounts(fs.readFileSync("/proc/self/mountinfo", "utf8"));
		const searchPath = gccSearchPath(file, process.env.PATH ?? "", mounts);
		if (searchPath === undefined) return undefined;
		const fd = fs.openSync(file, "r");
		try {
			const magic = Buffer.alloc(4);
			fs.readSync(fd, magic, 0, magic.length, 0);
			return magic.readUInt32BE() === 0x7f454c46 ? searchPath : undefined;
		} finally {
			fs.closeSync(fd);
		}
	} catch {
		return undefined;
	}
}
