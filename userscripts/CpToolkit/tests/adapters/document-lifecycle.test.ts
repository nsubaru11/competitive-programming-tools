import {afterEach, describe, expect, test} from "bun:test";
import {DocumentLifecycle} from "@adapters/page/document-lifecycle";

const setReadyState = (value: DocumentReadyState): void => {
	Object.defineProperty(document, "readyState", {value, configurable: true});
};

describe("DocumentLifecycle", () => {
	afterEach(() => {
		delete (document as {readyState?: DocumentReadyState}).readyState;
	});

	test("ready はサイトの DOMContentLoaded の処理が終わるまで待つ", async () => {
		setReadyState("loading");
		let reached = false;
		const ready = new DocumentLifecycle().reach("ready").then(() => {
			reached = true;
		});
		document.dispatchEvent(new Event("DOMContentLoaded"));
		for (let index = 0; index < 5; index++) await Promise.resolve();
		expect(reached).toBe(false);
		await ready;
		expect(reached).toBe(true);
	});

	test("読み込みが終わっていればすぐに到達する", async () => {
		setReadyState("complete");
		await new DocumentLifecycle().reach("ready");
		await new DocumentLifecycle().reach("load");
	});
});
