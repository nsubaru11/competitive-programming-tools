import {sleep} from "@atcoder-tools/shared";
import {ratingScale} from "@catalog/tables";
import {recentCount} from "@domain/rating/history";
import {tierOf, tierProgress} from "@domain/rating/scale";
import type {RatingGraph, RatingGraphView} from "@application/ports/rating-graph";
import {pageGlobals, type RatingEntry} from "@adapters/page/globals";
import type {Container, CreateJs, Shape, Stage, Text} from "./createjs";

type Prepared = {
	readonly cj: CreateJs;
	readonly history: readonly RatingEntry[];
	readonly performances: readonly number[];
	readonly graphCanvas: HTMLCanvasElement;
	readonly statusCanvas: HTMLCanvasElement;
	/**
	 * canvas ごとに1つだけ作り、描き直すときは中身を空にして使い回す。
	 * 作り直すと古い Stage が同じ canvas のマウス操作に反応し続け、前の図を描き戻してしまう。
	 */
	readonly stageGraph: Stage;
	readonly stageStatus: Stage;
};

type Particle = {
	readonly text: Text;
	vx: number;
	vy: number;
	rotationSpeed: number;
	life: number;
};

type SeriesStyle = {
	readonly lineColor: string;
	readonly highestLabel: string;
	readonly radius: number;
	/** 最高値の点だけ描き方を変えるときに指定する。 */
	readonly highestVertex?: {readonly radius: number; readonly strokeWidth: number};
};

const MARGIN_X = 86400 * 30;
const MARGIN_Y_LOW = 100;
const MARGIN_Y_HIGH = 300;
const OFFSET_X = 50;
const OFFSET_Y = 5;
const DEFAULT_WIDTH = 640;
const HIGHEST_WIDTH = 115;
const HIGHEST_HEIGHT = 20;
const LABEL_FONT = "12px Lato";
const START_YEAR = 2010;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_SECONDS = 86400 * 365;
const STEP_SIZE = 400;
const VERTEX_STROKE_WIDTH = 0.5;
const PARTICLE_MIN = 3;
const PARTICLE_MAX = 20;
const PARTICLE_LIFE = 30;
const READY_TIMEOUT_MS = 10_000;
const READY_INTERVAL_MS = 50;
const ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];

const ratio = (value: number, low: number, high: number): number => (value - low) / (high - low);

function ordinal(value: number): string {
	const tail = value % 100;
	return `${value}${ORDINAL_SUFFIXES[(tail - 20) % 10] ?? ORDINAL_SUFFIXES[tail] ?? ORDINAL_SUFFIXES[0]}`;
}

function signed(value: number): string {
	return `${value === 0 ? "±" : value < 0 ? "-" : "+"}${Math.abs(value)}`;
}

/** グラフの描画に必要なものが揃っていれば返す。 */
function findDependencies(): {cj: CreateJs; history: readonly RatingEntry[]} | null {
	const {createjs: cj, rating_history: history} = pageGlobals();
	const hasCanvases = document.getElementById("ratingGraph") && document.getElementById("ratingStatus");
	return cj && Array.isArray(history) && hasCanvases ? {cj, history} : null;
}

/** サイトの描画を止めるため、リスナーを持たない複製に置き換える。 */
function replaceCanvas(id: string): HTMLCanvasElement | null {
	const canvas = document.getElementById(id);
	if (!(canvas instanceof HTMLCanvasElement)) return null;
	const clone = canvas.cloneNode(false) as HTMLCanvasElement;
	canvas.replaceWith(clone);
	return clone;
}

function scaleStage(stage: Stage, canvas: HTMLCanvasElement): {width: number; height: number} {
	const rect = canvas.getBoundingClientRect();
	const width = Math.round(rect.width || canvas.clientWidth || canvas.width || DEFAULT_WIDTH);
	const height = Math.round(rect.height || canvas.clientHeight || canvas.height);
	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width = Math.round(width * pixelRatio);
	canvas.height = Math.round(height * pixelRatio);
	stage.scaleX = stage.scaleY = pixelRatio;
	Object.assign(canvas.style, {
		width: `${width}px`,
		height: `${height}px`,
		maxWidth: `${width}px`,
		maxHeight: `${height}px`,
	});
	return {width, height};
}

/** サイトのレーティンググラフを、パフォーマンスを重ねて描き直す。 */
export class CreateJsRatingGraph implements RatingGraph {
	private prepared: Prepared | null = null;

	async prepare(performances: readonly number[]): Promise<boolean> {
		const deadline = Date.now() + READY_TIMEOUT_MS;
		let dependencies = findDependencies();
		while (!dependencies) {
			if (Date.now() > deadline) return false;
			await sleep(READY_INTERVAL_MS);
			dependencies = findDependencies();
		}
		const {cj, history} = dependencies;
		cj.Ticker.removeAllEventListeners("tick");
		const graphCanvas = replaceCanvas("ratingGraph");
		const statusCanvas = replaceCanvas("ratingStatus");
		if (!graphCanvas || !statusCanvas) return false;
		const stageGraph = new cj.Stage(graphCanvas);
		const stageStatus = new cj.Stage(statusCanvas);
		stageGraph.enableMouseOver();
		stageStatus.enableMouseOver();
		this.prepared = {cj, history, performances, graphCanvas, statusCanvas, stageGraph, stageStatus};
		return history.length > 0;
	}

	draw({showPerformance, recent}: RatingGraphView): void {
		if (!this.prepared) return;
		const {cj, graphCanvas, statusCanvas, stageGraph, stageStatus} = this.prepared;
		const total = this.prepared.history.length;
		const shown = recent ? recentCount(recent, total) : total;
		const history = this.prepared.history.slice(-shown);
		const performances = this.prepared.performances.slice(-shown);
		const count = history.length;
		if (count === 0) return;

		cj.Ticker.removeAllEventListeners("tick");
		stageGraph.removeAllChildren();
		stageStatus.removeAllChildren();
		const graphSize = scaleStage(stageGraph, graphCanvas);
		const statusSize = scaleStage(stageStatus, statusCanvas);
		const panelWidth = graphSize.width - OFFSET_X - 10;
		const panelHeight = graphSize.height - OFFSET_Y - 30;
		const statusWidth = statusSize.width - OFFSET_X - 10;
		const statusHeight = statusSize.height - OFFSET_Y - 5;

		const times = history.map((entry) => entry.EndTime);
		const xMin = Math.min(...times) - MARGIN_X;
		const xMax = Math.max(...times) + MARGIN_X;
		const shownValues = [...history.map((entry) => entry.NewRating), ...(showPerformance ? performances : [])];
		const yMin = Math.min(1500, Math.max(0, Math.min(...shownValues) - MARGIN_Y_LOW));
		const yMax = Math.max(...shownValues) + MARGIN_Y_HIGH;
		const pointX = (time: number): number => OFFSET_X + panelWidth * ratio(time, xMin, xMax);
		const pointY = (value: number): number => OFFSET_Y + (panelHeight - panelHeight * ratio(value, yMin, yMax));

		const newShape = (parent: Container): Shape => {
			const shape = new cj.Shape();
			parent.addChild(shape);
			return shape;
		};
		const newText = (parent: Container, x: number, y: number, font: string): Text => {
			const text = new cj.Text("", font, "#000");
			Object.assign(text, {x, y, textAlign: "center", textBaseline: "middle"});
			parent.addChild(text);
			return text;
		};

		const drawBackground = (): void => {
			const panel = newShape(stageGraph);
			Object.assign(panel, {x: OFFSET_X, y: OFFSET_Y, alpha: 0.3});
			const border = newShape(stageGraph);
			Object.assign(border, {x: OFFSET_X, y: OFFSET_Y});
			const addLabel = (text: string, x: number, y: number, align: Pick<Text, "textAlign" | "textBaseline">): void => {
				const label = new cj.Text(text, LABEL_FONT, "#000");
				Object.assign(label, {x, y, ...align});
				stageGraph.addChild(label);
			};

			let top = 0;
			for (const tier of ratingScale.tiers.toReversed()) {
				const bottom = panelHeight - panelHeight * ratio(tier.min, yMin, yMax);
				if (bottom > 0 && top < panelHeight) {
					top = Math.max(top, 0);
					panel.graphics.beginFill(tier.color).rect(0, top, panelWidth, Math.min(bottom, panelHeight) - top);
				}
				top = bottom;
			}

			for (let value = 0; value <= yMax; value += STEP_SIZE) {
				if (value < yMin) continue;
				const y = panelHeight - panelHeight * ratio(value, yMin, yMax);
				addLabel(String(value), OFFSET_X - 10, OFFSET_Y + y, {textAlign: "right", textBaseline: "middle"});
				border.graphics.beginStroke(value === 2000 ? "#000" : "#FFF").setStrokeStyle(0.5);
				border.graphics.moveTo(0, y).lineTo(panelWidth, y);
			}
			border.graphics.beginStroke("#FFF").setStrokeStyle(0.5);

			let monthStep = 6;
			for (let years = 3; years >= 1; years--) {
				if (xMax - xMin <= YEAR_SECONDS * years + MARGIN_X * 2) monthStep = years;
			}
			const axisLabel = {textAlign: "center", textBaseline: "top"} as const;
			let isFirst = true;
			for (let year = START_YEAR; year < 3000; year++) {
				let finished = false;
				for (let month = 0; month < 12; month += monthStep) {
					const paddedMonth = String(month + 1).padStart(2, "0");
					const unix = Date.parse(`${year}-${paddedMonth}-01T00:00:00`) / 1000;
					if (xMin < unix && unix < xMax) {
						const x = panelWidth * ratio(unix, xMin, xMax);
						addLabel(MONTH_NAMES[month] ?? "", OFFSET_X + x, OFFSET_Y + panelHeight + 2, axisLabel);
						if (month === 0 || isFirst) {
							addLabel(String(year), OFFSET_X + x, OFFSET_Y + panelHeight + 15, axisLabel);
							isFirst = false;
						}
						border.graphics.mt(x, 0).lt(x, panelHeight);
					}
					if (unix > xMax) {
						finished = true;
						break;
					}
				}
				if (finished) break;
			}
			border.graphics.s("#888").ss(1.5).rr(0, 0, panelWidth, panelHeight, 2);
		};

		const middle = OFFSET_Y + statusHeight / 2;
		const border = newShape(stageStatus);
		const ratingText = newText(stageStatus, OFFSET_X + 75, middle, "48px 'Squada One'");
		const performanceText = newText(stageStatus, OFFSET_X + 75, middle + 25, "16px 'Squada One'");
		const placeText = newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 2.7, "16px Lato");
		const diffText = newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 1.5, "11px Lato");
		const dateText = newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 4, "14px Lato");
		const contestText = newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 1.6, "20px Lato");
		const contestWidth = statusWidth - 200 - 10;
		let standingsUrl = "";

		diffText.color = "#888";
		dateText.textAlign = contestText.textAlign = "left";
		contestText.maxWidth = contestWidth;
		const contestHitArea = new cj.Shape();
		contestHitArea.graphics.f("#000").r(0, -12, contestWidth, 24);
		contestText.hitArea = contestHitArea;
		contestText.cursor = "pointer";
		contestText.addEventListener("click", () => {
			location.href = standingsUrl;
		});

		const particles = Array.from({length: PARTICLE_MAX}, (): Particle => {
			const text = newText(stageStatus, 0, 0, "64px Lato");
			text.visible = false;
			return {text, vx: 0, vy: 0, rotationSpeed: 0, life: 0};
		});

		const burstParticles = (rating: number, color: string, alpha: number): void => {
			const progress = tierProgress(ratingScale, rating);
			const active = Math.floor(progress ** 2 * (PARTICLE_MAX - PARTICLE_MIN) + PARTICLE_MIN);
			particles.forEach((particle, index) => {
				const isActive = index < active;
				particle.text.visible = isActive;
				particle.life = isActive ? PARTICLE_LIFE : 0;
				if (!isActive) return;
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 4 + 4;
				particle.vx = Math.cos(angle) * speed;
				particle.vy = Math.sin(angle) * speed;
				particle.rotationSpeed = Math.random() * 20 + 10;
				Object.assign(particle.text, {
					x: ratingText.x,
					y: ratingText.y,
					color,
					text: rating >= ratingScale.crownMin ? "★" : "@",
					alpha,
				});
			});
		};

		const updateStatus = (index: number, withParticles: boolean): void => {
			const entry = history[index];
			if (!entry) return;
			const {color, alpha} = tierOf(ratingScale, entry.NewRating);
			border.graphics.c().s(color).ss(1).rr(OFFSET_X, OFFSET_Y, statusWidth, statusHeight, 2);
			ratingText.text = entry.NewRating;
			ratingText.color = color;
			performanceText.text = showPerformance ? `perf: ${performances[index] ?? "-"}` : "";
			placeText.text = ordinal(entry.Place);
			diffText.text = signed(entry.NewRating - entry.OldRating);
			dateText.text = new Date(entry.EndTime * 1000).toLocaleDateString();
			contestText.text = entry.ContestName;
			standingsUrl = entry.StandingsUrl;
			if (withParticles) burstParticles(entry.NewRating, color, alpha);
			stageGraph.update();
		};

		const drawSeries = (values: readonly number[], style: SeriesStyle): void => {
			const {lineColor, highestLabel, radius, highestVertex} = style;
			const container = new cj.Container();
			stageGraph.addChild(container);
			container.shadow = new cj.Shadow("rgba(0,0,0,0.3)", 1, 2, 3);
			const line = newShape(container);
			const highestShape = newShape(container);
			const highestIndex = values.indexOf(Math.max(...values));

			const emphasizeOnHover = (target: Shape, vertex: Shape, index: number): void => {
				target.addEventListener("mouseover", () => {
					vertex.scaleX = vertex.scaleY = 1.2;
					stageGraph.update();
					updateStatus(index, true);
				});
				target.addEventListener("mouseout", () => {
					vertex.scaleX = vertex.scaleY = 1;
					stageGraph.update();
				});
			};

			const vertices = values.map((value, index) => {
				const isHighest = index === highestIndex;
				const vertex = newShape(container);
				vertex.graphics.beginStroke(isHighest ? "#000" : "#FFF");
				vertex.graphics.setStrokeStyle((isHighest && highestVertex?.strokeWidth) || VERTEX_STROKE_WIDTH);
				vertex.graphics.beginFill(tierOf(ratingScale, value).color);
				vertex.graphics.dc(0, 0, (isHighest && highestVertex?.radius) || radius);
				vertex.x = pointX(history[index]?.EndTime ?? 0);
				vertex.y = pointY(value);
				const hitArea = new cj.Shape();
				hitArea.graphics.f("#000").dc(1.5, 1.5, 6);
				vertex.hitArea = hitArea;
				emphasizeOnHover(vertex, vertex, index);
				return vertex;
			});

			const highest = vertices[highestIndex];
			const first = vertices[0];
			if (!highest || !first) return;
			const x = highest.x + ((xMin + xMax) / 2 < (history[highestIndex]?.EndTime ?? 0) ? -80 : 80);
			const y = highest.y - 16;
			highestShape.graphics.s("#FFF").mt(highest.x, highest.y).lt(x, y);
			const [boxX, boxY] = [x - HIGHEST_WIDTH / 2, y - HIGHEST_HEIGHT / 2];
			highestShape.graphics.s("#888").f("#FFF").rr(boxX, boxY, HIGHEST_WIDTH, HIGHEST_HEIGHT, 2);
			newText(stageGraph, x, y, LABEL_FONT).text = `${highestLabel}: ${values[highestIndex]}`;
			emphasizeOnHover(highestShape, highest, highestIndex);

			line.graphics.s("#AAA").ss(2).mt(first.x, first.y);
			for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
			line.graphics.s(lineColor).ss(0.5).mt(first.x, first.y);
			for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
		};

		const onTick = (): void => {
			for (const particle of particles) {
				const {text} = particle;
				if (particle.life <= 0) {
					text.visible = false;
					continue;
				}
				text.x += particle.vx;
				particle.vx *= 0.9;
				text.y += particle.vy;
				particle.vy *= 0.9;
				particle.life--;
				text.scaleX = text.scaleY = particle.life / PARTICLE_LIFE;
				text.rotation += particle.rotationSpeed;
			}
			stageStatus.update();
		};

		drawBackground();
		drawSeries(history.map((entry) => entry.NewRating), {
			lineColor: "#000",
			highestLabel: "Highest(Rate)",
			radius: 3.5,
		});
		if (showPerformance && performances.length > 0) {
			drawSeries(performances, {
				lineColor: "#F00",
				highestLabel: "Highest(Perf)",
				radius: 2.8,
				highestVertex: {radius: 2.5, strokeWidth: 1},
			});
		}
		updateStatus(count - 1, false);
		stageGraph.update();
		stageStatus.update();

		cj.Ticker.removeAllEventListeners("tick");
		cj.Ticker.setFPS(60);
		cj.Ticker.addEventListener("tick", onTick);
	}
}
