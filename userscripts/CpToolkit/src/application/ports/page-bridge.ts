/**
 * ページの文脈にあるライブラリへの入口。
 * application は DOM の型を持たないので、要素は object として受け取る。
 */
export interface PageBridge {
	/** サイトのライブラリが発行する change も受け取る。 */
	onChange(element: object, listener: () => void): void;

	/** サイトのライブラリにも伝わる change を発行する。 */
	triggerChange(element: object): void;

	renderMath(target: object): void;

	highlightCode(): void;
}
