/** start は document-start、ready は DOM の構築とサイト自身の初期化の後、load はサブリソースの読み込み後。 */
export type PagePhase = "start" | "ready" | "load";

export interface PageLifecycle {
	reach(phase: PagePhase): Promise<void>;
}
