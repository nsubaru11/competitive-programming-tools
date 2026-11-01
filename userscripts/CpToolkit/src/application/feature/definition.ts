import type {RouteId} from "@catalog/judges";
import type {MessageKey, Translate} from "@catalog/messages";
import type {JudgeDefinition} from "@domain/page/route";
import {normalizeOptions, type OptionSet, type OptionValues} from "@domain/settings/option";
import type {LocalRunnerClient} from "@application/execution/local-runner";
import type {RunnerCatalogService} from "@application/execution/runner-catalog";
import type {CodeEditorLocator} from "@application/ports/code-editor";
import type {JudgeSite} from "@application/ports/judge-site";
import type {KeyValueStore} from "@application/ports/key-value-store";
import type {PageBridge} from "@application/ports/page-bridge";
import type {PagePhase} from "@application/ports/page-lifecycle";
import type {RatingGraph} from "@application/ports/rating-graph";
import type {Clipboard, HttpClient, Notifier, ScriptLoader, StatementConverter, Ticker} from "@application/ports/services";

export type Disposer = () => void;

/** 機能が受け取るサービス。使われるまで生成しないものを含む。 */
export type FeatureServices = {
	readonly translate: Translate;
	readonly isOnRoute: (route: RouteId) => boolean;
	/** 表示中のサイト。対象サイト以外では null。 */
	readonly judge: JudgeDefinition | null;
	/** 機能が記憶する値。設定画面には表示しない。 */
	readonly state: KeyValueStore;
	readonly clipboard: Clipboard;
	readonly notifier: Notifier;
	/** 背景のタブでも遅れない時計。 */
	readonly ticker: Ticker;
	/** 別のサイトとの通信。 */
	readonly http: HttpClient;
	/** 表示中のサイトとの通信。 */
	readonly site: HttpClient;
	readonly scripts: ScriptLoader;
	readonly page: PageBridge;
	readonly editors: CodeEditorLocator;
	readonly localRunner: LocalRunnerClient;
	readonly runners: RunnerCatalogService;
	readonly statementConverter: StatementConverter;
	readonly ratingGraph: RatingGraph;
	/** EasyTest が対応するサイトなら、そのサイトの操作を返す。 */
	readonly judgeSite: () => Promise<JudgeSite | null>;
	readonly openSettings: () => void;
};

export type FeatureContext<S extends OptionSet> = FeatureServices & {
	readonly options: OptionValues<S>;
};

type FeatureMetadata<S extends OptionSet<MessageKey>> = {
	readonly id: string;
	readonly title: MessageKey;
	readonly description: MessageKey;
	readonly category: MessageKey;
	readonly defaultEnabled: boolean;
	readonly routes: readonly RouteId[];
	readonly phase: PagePhase;
	readonly options: S;
};

/** 後始末を返す機能は、再読み込みなしで ON/OFF と設定変更を反映できる。 */
type LiveFeatureDefinition<S extends OptionSet<MessageKey>> = FeatureMetadata<S> & {
	readonly live: true;
	start(context: FeatureContext<S>): Disposer | Promise<Disposer>;
};

type ReloadFeatureDefinition<S extends OptionSet<MessageKey>> = FeatureMetadata<S> & {
	readonly live?: false;
	start(context: FeatureContext<S>): void | Promise<void>;
};

export type FeatureDefinition<S extends OptionSet<MessageKey>> = LiveFeatureDefinition<S> | ReloadFeatureDefinition<S>;

export type Feature = FeatureMetadata<OptionSet<MessageKey>> & {
	readonly live: boolean;
	run(storedOptions: unknown, services: FeatureServices): Promise<Disposer | undefined>;
};

export function defineFeature<S extends OptionSet<MessageKey>>(definition: FeatureDefinition<S>): Feature {
	return {
		id: definition.id,
		title: definition.title,
		description: definition.description,
		category: definition.category,
		defaultEnabled: definition.defaultEnabled,
		routes: definition.routes,
		phase: definition.phase,
		options: definition.options,
		live: definition.live === true,
		async run(storedOptions, services) {
			const options = normalizeOptions(definition.options, storedOptions);
			// スプレッドではサービスの遅延生成が失われるので、プロトタイプとして渡す
			const context = Object.assign(Object.create(services) as FeatureServices, {options});
			return (await definition.start(context)) ?? undefined;
		},
	};
}
