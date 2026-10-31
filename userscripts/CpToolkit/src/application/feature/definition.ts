import type {RouteId} from "@catalog/judges";
import type {MessageKey, Translate} from "@catalog/messages";
import {normalizeOptions, type OptionSet, type OptionValues} from "@domain/settings/option";
import type {PagePhase} from "@application/ports/page-lifecycle";

export type Disposer = () => void;

/** 機能が受け取るサービス。ポートを追加するときはここに加える。 */
export type FeatureServices = {
	readonly translate: Translate;
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
			return (await definition.start({...services, options})) ?? undefined;
		},
	};
}
