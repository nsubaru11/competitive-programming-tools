import {judges, type RouteId} from "@catalog/judges";
import {createTranslator, type Translate} from "@catalog/messages";
import {runnerCatalog} from "@catalog/tables";
import type {PageMatch} from "@domain/page/route";
import {normalizeOptions} from "@domain/settings/option";
import {LocalRunnerClient} from "@application/execution/local-runner";
import {RunnerCatalogService, type RunnerProvider} from "@application/execution/runner-catalog";
import type {FeatureServices} from "@application/feature/definition";
import type {JudgeSite} from "@application/ports/judge-site";
import type {SettingsService} from "@application/settings/settings-service";
import {CreateJsRatingGraph} from "@adapters/atcoder/rating-graph";
import {createJudgeSite} from "@adapters/judges/index";
import {PageCodeEditorLocator} from "@adapters/page/code-editors";
import {ElementScriptLoader} from "@adapters/page/element-script-loader";
import {detectLocale} from "@adapters/page/locale";
import {UnsafeWindowPageBridge} from "@adapters/page/page-bridge";
import {SameOriginHttpClient} from "@adapters/page/same-origin-http-client";
import {AtCoderRunnerProvider} from "@adapters/runners/atcoder-custom-test";
import {PyodideRunnerProvider} from "@adapters/runners/pyodide";
import {LocalRunnerProvider, PaizaRunnerProvider, TextRunnerProvider} from "@adapters/runners/simple-runners";
import {WandboxRunnerProvider} from "@adapters/runners/wandbox";
import {TurndownStatementConverter} from "@adapters/statement/statement-converter";
import {GmKeyValueStore} from "@adapters/userscript/gm-key-value-store";
import {GmClipboard, GmHttpClient, GmNotifier} from "@adapters/userscript/gm-services";
import {localRunner as localRunnerFeature} from "@features/local-runner/index";

export function createTranslate(): Translate {
	return createTranslator(detectLocale);
}

/** 機能が使うサービスを組み立てる。重いものは最初に使われるまで生成しない。 */
export function createServices(
	page: PageMatch | null,
	settings: SettingsService,
	openSettings: () => void,
): FeatureServices {
	const state = new GmKeyValueStore();
	const http = new GmHttpClient();
	const site = new SameOriginHttpClient();
	const scripts = new ElementScriptLoader();
	const bridge = new UnsafeWindowPageBridge();

	const localRunnerEndpoint = (): string | null => {
		const {id, defaultEnabled, options} = localRunnerFeature;
		if (!settings.isEnabled(id, defaultEnabled)) return null;
		return String(normalizeOptions(options, settings.storedOptions(id)).url);
	};
	const localRunner = new LocalRunnerClient(http, localRunnerEndpoint);

	let judgeSite: Promise<JudgeSite | null> | null = null;
	const getJudgeSite = (): Promise<JudgeSite | null> => {
		judgeSite ??= createJudgeSite(page?.judge.id, bridge, site);
		return judgeSite;
	};

	let providers: readonly RunnerProvider[] | null = null;
	const getProviders = (): readonly RunnerProvider[] => {
		providers ??= [
			new LocalRunnerProvider(localRunner),
			new AtCoderRunnerProvider(site, getJudgeSite),
			new TextRunnerProvider(),
			new PyodideRunnerProvider(scripts),
			new PaizaRunnerProvider(http),
			new WandboxRunnerProvider(http, state),
		];
		return providers;
	};

	let converter: TurndownStatementConverter | null = null;
	let graph: CreateJsRatingGraph | null = null;

	return {
		translate: createTranslate(),
		isOnRoute: (route: RouteId) => page?.routeIds.has(route) ?? false,
		judge: page?.judge ?? null,
		state,
		clipboard: new GmClipboard(),
		notifier: new GmNotifier(),
		http,
		site,
		scripts,
		page: bridge,
		editors: new PageCodeEditorLocator(),
		localRunner,
		runners: new RunnerCatalogService(getProviders, runnerCatalog.order, runnerCatalog.maxRetry),
		judgeSite: getJudgeSite,
		openSettings,
		get statementConverter() {
			converter ??= new TurndownStatementConverter();
			return converter;
		},
		get ratingGraph() {
			graph ??= new CreateJsRatingGraph();
			return graph;
		},
	};
}

export {judges};
