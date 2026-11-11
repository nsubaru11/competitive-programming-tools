import {type LocalRunnerHeaderOption, modifyJavaCode} from "@atcoder-tools/shared";
import type {LocalRunnerClient} from "@application/execution/local-runner";

export type JavaTransformOptions = {
	readonly removePackage: boolean;
	readonly renameClass: boolean;
	readonly fixDebug: boolean;
	readonly header: LocalRunnerHeaderOption;
};

export type JavaTransformResult = {
	readonly sourceCode: string;
	/** Local Runner と通信できたか。偽なら字句の置換だけの結果になる。 */
	readonly connected: boolean;
	/** Local Runner にライブラリが設定されていないので、lib.* を展開できなかった。 */
	readonly libraryMissing: boolean;
};

/** Local Runner で変換する。使えないときだけ、字句の置換で最低限の修正を行う。 */
export async function transformJava(
	code: string,
	localRunner: LocalRunnerClient,
	options: JavaTransformOptions,
): Promise<JavaTransformResult> {
	let connected = false;
	let libraryMissing = false;
	if (localRunner.isAvailable()) {
		try {
			const transformed = await localRunner.transform(code, options.header);
			connected = true;
			if (transformed.status === "success") return {
				sourceCode: transformed.sourceCode,
				connected,
				libraryMissing
			};
			libraryMissing = transformed.libraryMissing === true;
		} catch {
			// Local Runner が起動していなければ、下の字句変換を使う
		}
	}
	return {sourceCode: modifyJavaCode(code, options).modified, connected, libraryMissing};
}
