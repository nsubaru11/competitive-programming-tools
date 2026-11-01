import {beforeEach} from "bun:test";
import {GlobalRegistrator} from "@happy-dom/global-registrator";

GlobalRegistrator.register({url: "https://atcoder.jp/contests/abc420/tasks/abc420_a"});

// テストファイルの実行順は OS によって変わるので、前のファイルの DOM を持ち越さない
beforeEach(() => {
	document.head.replaceChildren();
	document.body.replaceChildren();
});
