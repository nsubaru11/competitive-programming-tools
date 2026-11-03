import type {PageMatch} from "@domain/page/route";
import type {Disposer, Feature, FeatureServices} from "@application/feature/definition";
import type {Logger} from "@application/ports/logger";
import type {PageLifecycle} from "@application/ports/page-lifecycle";
import type {SettingsService} from "@application/settings/settings-service";

export type FeatureStatus =
	| {readonly state: "disabled" | "outOfScope" | "pending" | "running" | "reloadRequired"}
	| {readonly state: "failed"; readonly message: string};

type FeatureEntry = {
	readonly feature: Feature;
	status: FeatureStatus;
	active: boolean;
	dispose: Disposer | undefined;
	/** 現在反映している設定。 */
	appliedKey: string;
	/** ページの読み込み時点の設定と状態。再読み込みが必要な機能はこの状態から変わらない。 */
	baseline: {key: string; status: FeatureStatus} | null;
	/** 起動と停止が重ならないよう順番に処理する。 */
	queue: Promise<void>;
};

export type FeatureRuntimeDependencies = {
	readonly features: readonly Feature[];
	readonly page: PageMatch | null;
	readonly lifecycle: PageLifecycle;
	readonly settings: SettingsService;
	readonly services: FeatureServices;
	readonly logger: Logger;
};

/** 機能の起動と停止を管理する。1つの機能の失敗は他の機能に影響しない。 */
export class FeatureRuntime {
	private readonly entries: FeatureEntry[];
	private readonly listeners = new Set<() => void>();
	private readonly dependencies: FeatureRuntimeDependencies;

	constructor(dependencies: FeatureRuntimeDependencies) {
		this.dependencies = dependencies;
		this.entries = dependencies.features.map((feature) => ({
			feature,
			status: {state: "pending"},
			active: false,
			dispose: undefined,
			appliedKey: "",
			baseline: null,
			queue: Promise.resolve(),
		}));
	}

	start(): void {
		for (const entry of this.entries) {
			entry.appliedKey = this.settingsKey(entry.feature);
			this.enqueue(entry, () => this.applyInitial(entry));
		}
		this.dependencies.settings.subscribe(() => this.applyChanges());
	}

	/** 起動と停止の処理が終わるまで待つ。 */
	async settled(): Promise<void> {
		await Promise.all(this.entries.map((entry) => entry.queue));
	}

	statusOf(featureId: string): FeatureStatus {
		return this.entries.find(({feature}) => feature.id === featureId)?.status ?? {state: "outOfScope"};
	}

	subscribe(listener: () => void): void {
		this.listeners.add(listener);
	}

	private settingsKey({id, defaultEnabled}: Feature): string {
		const {settings} = this.dependencies;
		return JSON.stringify([settings.isEnabled(id, defaultEnabled), settings.storedOptions(id)]);
	}

	private isEnabled({id, defaultEnabled}: Feature): boolean {
		return this.dependencies.settings.isEnabled(id, defaultEnabled);
	}

	private isInScope({routes}: Feature): boolean {
		const routeIds = this.dependencies.page?.routeIds;
		return routeIds !== undefined && routes.some((route) => routeIds.has(route));
	}

	private enqueue(entry: FeatureEntry, task: () => Promise<void> | void): void {
		entry.queue = entry.queue.then(task);
	}

	private applyChanges(): void {
		for (const entry of this.entries) {
			const key = this.settingsKey(entry.feature);
			if (key === entry.appliedKey) continue;
			entry.appliedKey = key;
			this.enqueue(entry, () => this.applyChange(entry, key));
		}
	}

	private async applyInitial(entry: FeatureEntry): Promise<void> {
		const {feature} = entry;
		if (!this.isInScope(feature)) {
			this.setStatus(entry, {state: "outOfScope"});
		} else if (this.isEnabled(feature)) {
			await this.activate(entry);
		} else {
			this.setStatus(entry, {state: "disabled"});
		}
		entry.baseline = {key: entry.appliedKey, status: entry.status};
	}

	private async applyChange(entry: FeatureEntry, key: string): Promise<void> {
		const {feature} = entry;
		// 連続して変更された場合は、最後の変更だけを反映する
		if (key !== entry.appliedKey || !this.isInScope(feature)) return;
		if (!feature.live) {
			this.setStatus(entry, this.statusBeforeReload(entry, key));
			return;
		}
		this.deactivate(entry);
		if (this.isEnabled(feature)) await this.activate(entry);
		else this.setStatus(entry, {state: "disabled"});
	}

	/** 読み込み時の設定に戻した場合と、無効のまま設定だけ変えた場合は再読み込みが要らない。 */
	private statusBeforeReload({feature, baseline}: FeatureEntry, key: string): FeatureStatus {
		if (baseline?.key === key) return baseline.status;
		const remainsDisabled = baseline?.status.state === "disabled" && !this.isEnabled(feature);
		return remainsDisabled ? {state: "disabled"} : {state: "reloadRequired"};
	}

	private async activate(entry: FeatureEntry): Promise<void> {
		const {feature} = entry;
		const {lifecycle, logger, services, settings} = this.dependencies;
		this.setStatus(entry, {state: "pending"});
		try {
			await lifecycle.reach(feature.phase);
			entry.dispose = await feature.run(settings.storedOptions(feature.id), services);
			entry.active = true;
			this.setStatus(entry, {state: "running"});
		} catch (error) {
			logger.error(`Failed to start ${feature.id}`, error);
			this.setStatus(entry, {state: "failed", message: String(error)});
		}
	}

	private deactivate(entry: FeatureEntry): void {
		if (!entry.active) return;
		try {
			entry.dispose?.();
		} catch (error) {
			this.dependencies.logger.error(`Failed to stop ${entry.feature.id}`, error);
		}
		entry.active = false;
		entry.dispose = undefined;
	}

	private setStatus(entry: FeatureEntry, status: FeatureStatus): void {
		entry.status = status;
		for (const listener of this.listeners) listener();
	}
}
