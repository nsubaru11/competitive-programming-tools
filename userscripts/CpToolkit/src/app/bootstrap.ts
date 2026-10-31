import {judges} from "@catalog/judges";
import {createTranslator} from "@catalog/messages";
import {matchPage} from "@domain/page/route";
import {FeatureRuntime} from "@application/feature/runtime";
import {SettingsService} from "@application/settings/settings-service";
import {ConsoleLogger} from "@adapters/console-logger";
import {DocumentLifecycle} from "@adapters/page/document-lifecycle";
import {detectLocale} from "@adapters/page/locale";
import {GmKeyValueStore} from "@adapters/userscript/gm-key-value-store";
import {GmScriptHost} from "@adapters/userscript/gm-script-host";
import {createSettingsPanel} from "@features/settings-panel/index";
import {addNavigationEntry} from "@features/settings-panel/navigation-entry";
import {features} from "./registry";

export function bootstrap(): void {
	const host = new GmScriptHost();
	// 移行前のスクリプトは、この印を見て二重に動かないようにする
	document.documentElement.dataset.cpToolkit = host.version;

	const lifecycle = new DocumentLifecycle();
	const settings = new SettingsService(new GmKeyValueStore());
	const translate = createTranslator(detectLocale);
	const page = matchPage(judges, location.href);

	const runtime = new FeatureRuntime({
		features,
		page,
		lifecycle,
		settings,
		services: {translate},
		logger: new ConsoleLogger(host.name),
	});
	runtime.start();

	const panel = createSettingsPanel({features, settings, runtime, translate, version: host.version});
	// ページの言語は DOM の構築後に確定するので、それを待ってから文言を決める
	void lifecycle.reach("ready").then(() => {
		host.registerCommand(translate("settings.open"), () => panel.open());
		if (page) addNavigationEntry(page.judge.navigationLists, host.name, () => panel.open());
	});
}
