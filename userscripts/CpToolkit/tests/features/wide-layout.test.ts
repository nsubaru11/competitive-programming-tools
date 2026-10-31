import {afterEach, describe, expect, test} from "bun:test";
import {createFakeServices} from "../support/fakes";
import {wideLayout} from "@features/wide-layout/index";

const services = createFakeServices();

function injectedStyles(): string[] {
	return [...document.querySelectorAll("style")].map((style) => style.textContent ?? "");
}

describe("wideLayout", () => {
	afterEach(() => {
		document.head.replaceChildren();
	});

	test("保存された幅をスタイルに反映する", async () => {
		await wideLayout.run({width: "1200px"}, services);
		const [css] = injectedStyles();
		expect(css).toContain("--cp-main-width: 1200px;");
		expect(css).toContain("#main-container");
	});

	test("後始末でスタイルを取り除く", async () => {
		const dispose = await wideLayout.run(undefined, services);
		expect(injectedStyles()).toHaveLength(1);
		dispose?.();
		expect(injectedStyles()).toHaveLength(0);
	});
});
