// YAML の隣に型定義 (<name>.d.yaml.ts) を生成する。JSON の文字列はそのまま TypeScript のリテラル型になる。
// 値そのものは Bun がビルド時に同梱するため、この生成物は tsc だけが使う。

import {Glob} from "bun";
import {dirname, join} from "node:path";

const userscriptsDir = join(dirname(Bun.main), "..");

async function toDeclaration(path: string): Promise<string> {
	try {
		const data: unknown = Bun.YAML.parse(await Bun.file(path).text());
		// Bun は行末の「...」を文書の終わりと解釈する。値を引用符で囲めば防げる
		if (Array.isArray(data)) throw new Error("expected a single document; quote any value ending with '...'");
		return `declare const data: ${JSON.stringify(data)};\nexport default data;\n`;
	} catch (e) {
		throw new Error(`${path}: ${e instanceof Error ? e.message : String(e)}`);
	}
}

async function main(): Promise<void> {
	let generated = 0;
	for await (const path of new Glob("*/data/**/*.yaml").scan({cwd: userscriptsDir, absolute: true})) {
		const declaration = await toDeclaration(path);
		const output = path.replace(/\.yaml$/, ".d.yaml.ts");
		const outputFile = Bun.file(output);
		// watch が再ビルドを繰り返さないよう、内容が変わったときだけ書き込む
		if ((await outputFile.exists()) && (await outputFile.text()) === declaration) continue;
		await Bun.write(output, declaration);
		generated++;
	}
	console.log(`Generated ${generated} data type file(s).`);
}

await main();
