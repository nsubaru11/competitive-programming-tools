// UserScript のメタデータを読み、ページの URL に当てはまるかを判定する。
import {readFileSync} from "node:fs";
import {basename, join} from "node:path";
import {SCRIPTS} from "./paths.mjs";

export function parseUserscript(path) {
	const code = readFileSync(path, "utf8");
	const header = /\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/.exec(code);
	if (!header) throw new Error(`no UserScript header: ${path}`);
	const meta = {match: [], include: [], exclude: [], require: [], grant: [], "run-at": "document-idle"};
	for (const line of header[1].split("\n")) {
		const m = /^\s*\/\/\s*@(\S+)\s*(.*?)\s*$/.exec(line);
		if (!m) continue;
		const [, key, value] = m;
		if (Array.isArray(meta[key])) meta[key].push(value);
		else meta[key] = value;
	}
	return {
		id: basename(path).replace(/\.user\.js$/, ""),
		name: meta.name,
		version: meta.version ?? "0",
		runAt: meta["run-at"] || "document-idle",
		match: meta.match,
		include: meta.include,
		exclude: meta.exclude,
		require: meta.require,
		grant: meta.grant,
		code,
	};
}

/** @match / @include の glob を正規表現にする。Tampermonkey と同じく `*` は任意の文字列。 */
function globToRegExp(glob) {
	let pattern = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
	pattern = pattern.replace(/^\.\*:\/\//, "https?://");
	return new RegExp(`^${pattern}$`);
}

export function matchesUrl(script, url) {
	const urlNoHash = url.split("#")[0];
	const patterns = [...script.match, ...script.include].map(globToRegExp);
	const excludes = script.exclude.map(globToRegExp);
	return patterns.some((re) => re.test(urlNoHash)) && !excludes.some((re) => re.test(urlNoHash));
}

const REQUIRE_DIR = join(SCRIPTS, "requires");

/** 版を書かない @require を、legacy.lock.json で固定した URL に置き換える(Tampermonkey に入れるとき用) */
export function pinRequires(code) {
	const lock = JSON.parse(readFileSync(new URL("../legacy.lock.json", import.meta.url), "utf8"));
	let out = code;
	for (const r of lock.requires) if (r.pinned) out = out.split(r.url).join(r.pinned);
	return out;
}

export function loadRequire(url) {
	const file = url.replace(/^https?:\/\//, "").replace(/[/:]/g, "_");
	return readFileSync(join(REQUIRE_DIR, file), "utf8");
}
