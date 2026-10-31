import {type LocalRunnerHeaderOption, modifyJavaCode} from "@atcoder-tools/shared";
import type {LocalRunnerClient} from "@application/execution/local-runner";

export type JavaTransformOptions = {
	readonly removePackage: boolean;
	readonly renameClass: boolean;
	readonly fixDebug: boolean;
	readonly header: LocalRunnerHeaderOption;
};

/** Local Runner で変換する。使えないときだけ、字句の置換で最低限の修正を行う。 */
export async function transformJava(
	code: string,
	localRunner: LocalRunnerClient,
	options: JavaTransformOptions,
): Promise<string> {
	if (localRunner.isAvailable()) {
		try {
			const transformed = await localRunner.transform(code, options.header);
			if (transformed.status === "success") return transformed.sourceCode;
		} catch {
			// Local Runner が起動していなければ、下の字句変換を使う
		}
	}
	return modifyJavaCode(code, options).modified;
}
