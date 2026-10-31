import type {JudgeSite} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import type {HttpClient} from "@application/ports/services";
import {AtCoderSite} from "./atcoder";
import {CodeforcesMobileSite, CodeforcesSite} from "./codeforces";
import {YukicoderSite} from "./yukicoder";

const CODEFORCES_MOBILE_HOST = /^m[1-3]\.codeforces\.com$/;

export async function createJudgeSite(
	judgeId: string | undefined,
	bridge: PageBridge,
	site: HttpClient,
): Promise<JudgeSite | null> {
	switch (judgeId) {
		case "atcoder":
			return new AtCoderSite(bridge, site);
		case "yukicoder":
			return new YukicoderSite(bridge);
		case "codeforces":
			if (CODEFORCES_MOBILE_HOST.test(location.host)) return CodeforcesMobileSite.create(bridge);
			return new CodeforcesSite(bridge);
		default:
			return null;
	}
}
