// ローカルランナーを利用するユーザースクリプトが動作するジャッジサイト（@match と一致）。
// サーバーはコードを実行できるので、許可するホストは必要な範囲に絞る。
export const ALLOWED_ORIGIN_HOSTS = [
	"atcoder.jp", "yukicoder.me", "codeforces.com", "onlinejudge.u-aizu.ac.jp", "judge.yosupo.jp", "paiza.jp",
];
// サブドメインも配信に使うサイト。
const ALLOWED_ORIGIN_SUFFIXES = [".codeforces.com"];

/**
 * ブラウザ Origin を検査する。Origin 無し（非ブラウザ＝CLI 等）は許可。
 * overrides があれば、完全一致のオリジン許可リストとして使う。
 * http のオリジンは経路上で書き換えられるので許可しない。
 */
export function isAllowedOrigin(origin: string | undefined, overrides: readonly string[] = []): boolean {
	if (!origin) return true;
	if (overrides.length > 0) return overrides.includes(origin);
	let url: URL;
	try {
		url = new URL(origin);
	} catch {
		return false;
	}
	if (url.protocol !== "https:") return false;
	return ALLOWED_ORIGIN_HOSTS.includes(url.hostname)
		|| ALLOWED_ORIGIN_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));
}
