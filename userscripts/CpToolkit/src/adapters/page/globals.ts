import type {CreateJs} from "@adapters/atcoder/createjs";

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
	/** cursor が -1 なら先頭へカーソルを移す。省略すると全体を選択する。 */
	setValue(value: string, cursor?: number): void;
	getReadOnly(): boolean;
	setReadOnly(readOnly: boolean): void;
	on(event: "paste", listener: (event: {text: string}) => void): void;
};

export type MonacoModel = {
	getValue(): string;
	getValueInRange(range: unknown): string;
	setValue(value: string): void;
	getLanguageId(): string;
	onDidChangeContent(listener: (event: {isFlush: boolean; changes: ReadonlyArray<{text: string}>}) => void): void;
};

export type MonacoEditor = {
	getModel(): MonacoModel | null;
	getPosition(): unknown;
	setPosition(position: unknown): void;
	getAction(id: string): {run(): Promise<void>} | null;
	onDidPaste(listener: (event: {range: unknown}) => void): void;
};

type JQueryObject = {
	on(event: string, listener: () => void): JQueryObject;
	trigger(event: string): JQueryObject;
	data(key: string): {doc: {setValue(value: string): void}};
};

export type PyodideApi = {
	globals: {
		set(name: string, value: unknown): void;
		get(name: "__code"): unknown;
		get(name: "__stdout" | "__stderr"): {getvalue(): string};
	};
	loadPackagesFromImports(code: string): Promise<void>;
	runPythonAsync(code: string): Promise<void>;
	runPython(code: string): void;
};

export type RatingEntry = {
	readonly ContestName: string;
	readonly EndTime: number;
	readonly NewRating: number;
	readonly OldRating: number;
	readonly Place: number;
	readonly StandingsUrl: string;
};

/** moment のオブジェクト。ミリ秒への変換だけを使う。 */
type PageMoment = {valueOf(): number};

export type PageGlobals = {
	ace?: {edit(target: Element | string): AceEditor};
	monaco?: {editor: {getEditors(): MonacoEditor[]}};
	jQuery?: (target: unknown) => JQueryObject;
	createjs?: CreateJs;
	rating_history?: readonly RatingEntry[];
	csrfToken?: string;
	contestScreenName?: string;
	userScreenName?: string;
	startTime?: PageMoment;
	endTime?: PageMoment;
	getServerTime?: () => PageMoment;
	getSourceCode?: () => string;
	renderMathInElement?: (target: Element, options: object) => void;
	PR?: {prettyPrint(): void};
	loadPyodide?: (options: {indexURL: string}) => Promise<PyodideApi>;
};

export function pageGlobals(): PageGlobals {
	return unsafeWindow as unknown as PageGlobals;
}
