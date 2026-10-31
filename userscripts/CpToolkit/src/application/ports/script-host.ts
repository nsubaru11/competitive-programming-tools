export interface ScriptHost {
	readonly name: string;
	readonly version: string;

	/** ユーザースクリプトのメニューに項目を追加する。 */
	registerCommand(label: string, action: () => void): void;
}
