import {expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {loadLocalSamples} from "./localSamples";

test("空入力でも、期待出力が空の場合と未指定の場合を区別する", () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "empty-samples-"));
	try {
		for (const name of ["1.in", "1.out", "2.in"]) fs.writeFileSync(path.join(dir, name), "");
		const cases = loadLocalSamples("Main.cpp", dir);
		expect(cases.map(sample => sample.read())).toEqual([
			{index: 1, input: "", expectedOutput: ""},
			{index: 2, input: ""},
		]);
	} finally {
		fs.rmSync(dir, {recursive: true, force: true});
	}
});
