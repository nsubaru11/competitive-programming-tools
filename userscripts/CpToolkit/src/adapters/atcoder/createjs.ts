// サイトが読み込む createjs のうち、レーティンググラフの描画で使う範囲の型。

export type Graphics = {
	beginFill(color: string): Graphics;
	beginStroke(color: string): Graphics;
	setStrokeStyle(width: number): Graphics;
	moveTo(x: number, y: number): Graphics;
	lineTo(x: number, y: number): Graphics;
	rect(x: number, y: number, width: number, height: number): Graphics;
	/** 以降は上の処理などの短縮名。 */
	c(): Graphics;
	f(color: string): Graphics;
	s(color: string): Graphics;
	ss(width: number): Graphics;
	mt(x: number, y: number): Graphics;
	lt(x: number, y: number): Graphics;
	r(x: number, y: number, width: number, height: number): Graphics;
	rr(x: number, y: number, width: number, height: number, radius: number): Graphics;
	dc(x: number, y: number, radius: number): Graphics;
};

export type DisplayObject = {
	x: number;
	y: number;
	alpha: number;
	scaleX: number;
	scaleY: number;
	rotation: number;
	visible: boolean;
	cursor: string | null;
	hitArea: DisplayObject | null;
	addEventListener(type: "click" | "mouseover" | "mouseout", listener: () => void): void;
};

export type Shape = DisplayObject & {
	readonly graphics: Graphics;
};

export type Text = DisplayObject & {
	text: string | number;
	color: string;
	textAlign: CanvasTextAlign;
	textBaseline: CanvasTextBaseline;
	maxWidth: number | null;
};

export type Shadow = object;

export type Container = DisplayObject & {
	shadow: Shadow | null;
	addChild(child: DisplayObject): void;
	removeAllChildren(): void;
};

export type Stage = Container & {
	enableMouseOver(): void;
	update(): void;
};

export type CreateJs = {
	readonly Container: new () => Container;
	readonly Shadow: new (color: string, offsetX: number, offsetY: number, blur: number) => Shadow;
	readonly Shape: new () => Shape;
	readonly Stage: new (canvas: HTMLCanvasElement) => Stage;
	readonly Text: new (text: string, font: string, color: string) => Text;
	readonly Ticker: {
		setFPS(framesPerSecond: number): void;
		addEventListener(type: "tick", listener: () => void): void;
		removeAllEventListeners(type: "tick"): void;
	};
};
