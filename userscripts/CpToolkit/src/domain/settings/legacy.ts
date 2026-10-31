import {parseStoredObject} from "@atcoder-tools/shared";

/** 統合前のスクリプトの設定を、機能の設定へ変換した結果。 */
export type MigratedOptions = {
	readonly featureId: string;
	readonly options: Readonly<Record<string, unknown>>;
};

type Stored = Record<string, unknown>;

function defined(options: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined && value !== null));
}

/** EasyTest の設定は値も JSON の文字列になっている。 */
function parseFlag(value: unknown): boolean | undefined {
	return value === "true" ? true : value === "false" ? false : undefined;
}

export const LEGACY_SCRIPTS: Readonly<Record<string, (stored: Stored) => readonly MigratedOptions[]>> = {
	AtCoderHighlighter: (stored) => [{
		featureId: "statement-highlight",
		options: defined({
			numberColor: stored.numColor,
			variableColor: stored.varColor,
			timeColor: stored.timeLimitColor,
			memoryColor: stored.memoryLimitColor,
		}),
	}],
	AtCoderWidenContainer: (stored) => [{
		featureId: "wide-layout",
		options: defined({width: stored.containerWidth}),
	}],
	AtCoderCustomDefaultSubmissions: (stored) => {
		const config = parseStoredObject<Stored>(stored.config);
		return [{
			featureId: "submission-defaults",
			options: defined({
				language: config.language,
				status: config.status,
				orderBy: config.orderBy,
				taskFilter: config.includeTaskFilter,
			}),
		}];
	},
	AtCoderEasyTestForJava: (stored) => {
		const config = parseStoredObject<Stored>(stored.config);
		return [
			{featureId: "local-runner", options: defined({url: config["codeRunner.localRunnerURL"] || undefined})},
			{
				featureId: "easy-test",
				options: defined({
					precompile: parseFlag(config["codeRunner.precompile.enable"]),
					keyboardShortcuts: parseFlag(config["ui.useKeyboardShortcut"]),
				}),
			},
		];
	},
};
