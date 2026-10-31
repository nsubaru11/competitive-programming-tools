// ページの文脈にある値の型。サイト側のライブラリなので、使う範囲だけを宣言する。

export type AceSession = {
	getValue(): string;
	setValue(value: string): void;
	getMode(): {$id?: string};
	getAllFolds(): Array<{start: {row: number}}>;
	getFoldWidget(row: number): unknown;
	getFoldWidgetRange(row: number): unknown;
	addFold(placeholder: string, range: unknown): void;
	on(event: string, listener: () => void): void;
};

export type AceEditor = {
	getSession(): AceSession;
	getValue(): string;
	setValue(value: string): void;
	getReadOnly(): boolean;
	setReadOnly(readOnly: boolean): void;
	on(event: string, listener: () => void): void;
};

export type MonacoModel = {
	getValue(): string;
	setValue(value: string): void;
	getLanguageId(): string;
	onDidChangeContent(listener: () => void): void;
};

export type MonacoEditor = {
	getModel(): MonacoModel | null;
	getPosition(): unknown;
	setPosition(position: unknown): void;
	getAction(id: string): {run(): Promise<void>} | null;
	onDidPaste(listener: () => void): void;
};

type JQueryObject = {
	on(event: string, listener: () => void): JQueryObject;
	trigger(event: string): JQueryObject;
	data(key: string): {doc: {setValue(value: string): void}};
};

export type PyodideApi = {
	globals: {set(name: string, value: unknown): void; get(name: string): any};
	loadPackagesFromImports(code: string): Promise<void>;
	runPythonAsync(code: string): Promise<void>;
	runPython(code: string): void;
};

export type PageGlobals = {
	ace?: {edit(target: Element | string): AceEditor};
	monaco?: {editor: {getEditors(): MonacoEditor[]}};
	jQuery?: (target: unknown) => JQueryObject;
	createjs?: any;
	rating_history?: unknown[];
	csrfToken?: string;
	contestScreenName?: string;
	getSourceCode?: () => string;
	renderMathInElement?: (target: Element, options: object) => void;
	PR?: {prettyPrint(): void};
	loadPyodide?: (options: {indexURL: string}) => Promise<PyodideApi>;
};

export function pageGlobals(): PageGlobals {
	return unsafeWindow as unknown as PageGlobals;
}
