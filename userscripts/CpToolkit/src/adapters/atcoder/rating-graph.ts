import {ratingScale} from "@catalog/tables";
import {dropOldest} from "@domain/rating/history";
import {tierOf, tierProgress} from "@domain/rating/scale";
import type {RatingGraph, RatingGraphView} from "@application/ports/rating-graph";
import {pageGlobals} from "@adapters/page/globals";

type RatingEntry = {
	readonly ContestName: string;
	readonly EndTime: number;
	readonly NewRating: number;
	readonly OldRating: number;
	readonly Place: number;
	readonly StandingsUrl: string;
};

/** createjs の表示オブジェクト。サイト側のライブラリなので型を持たない。 */
type Easel = any;

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

/** サイトの描画を止めるため、リスナーを持たない複製に置き換える。 */
function replaceCanvas(id: string): HTMLCanvasElement | null {
	const canvas = document.getElementById(id);
	if (!(canvas instanceof HTMLCanvasElement)) return null;
	const clone = canvas.cloneNode(false) as HTMLCanvasElement;
	canvas.replaceWith(clone);
	return clone;
}

function scaleStage(stage: Easel, canvas: HTMLCanvasElement): {width: number; height: number} {
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
	stage.enableMouseOver();
	return {width, height};
}

/** サイトのレーティンググラフを、パフォーマンスを重ねて描き直す。 */
export class CreateJsRatingGraph implements RatingGraph {
	private history: readonly RatingEntry[] = [];
	private performances: readonly number[] = [];
	private graphCanvas: HTMLCanvasElement | null = null;
	private statusCanvas: HTMLCanvasElement | null = null;

	async prepare(performances: readonly number[]): Promise<boolean> {
		const deadline = Date.now() + READY_TIMEOUT_MS;
		const isReady = (): boolean => {
			const page = pageGlobals();
			return Array.isArray(page.rating_history)
				&& page.createjs !== undefined
				&& document.getElementById("ratingGraph") !== null
				&& document.getElementById("ratingStatus") !== null;
		};
		while (!isReady()) {
			if (Date.now() > deadline) return false;
			await new Promise((resolve) => setTimeout(resolve, READY_INTERVAL_MS));
		}
		this.history = (pageGlobals().rating_history ?? []) as readonly RatingEntry[];
		this.performances = performances;
		pageGlobals().createjs.Ticker.removeAllEventListeners("tick");
		this.graphCanvas = replaceCanvas("ratingGraph");
		this.statusCanvas = replaceCanvas("ratingStatus");
		return this.history.length > 0;
	}

	draw({showPerformance, recentOnly}: RatingGraphView): void {
		if (!this.graphCanvas || !this.statusCanvas) return;
		const history = recentOnly ? dropOldest(this.history) : this.history;
		const performances = recentOnly ? dropOldest(this.performances) : this.performances;
		const count = history.length;
		if (count === 0) return;

		const cj: Easel = pageGlobals().createjs;
		const stageGraph: Easel = new cj.Stage(this.graphCanvas);
		const stageStatus: Easel = new cj.Stage(this.statusCanvas);
		const graphSize = scaleStage(stageGraph, this.graphCanvas);
		const statusSize = scaleStage(stageStatus, this.statusCanvas);
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

		const newShape = (parent: Easel): Easel => {
			const shape = new cj.Shape();
			parent.addChild(shape);
			return shape;
		};
		const newText = (parent: Easel, x: number, y: number, font: string): Easel => {
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
			const addLabel = (text: string, x: number, y: number, textAlign: string, textBaseline: string): void => {
				const label = new cj.Text(text, LABEL_FONT, "#000");
				Object.assign(label, {x, y, textAlign, textBaseline});
				stageGraph.addChild(label);
			};

			let top = 0;
			for (const tier of [...ratingScale.tiers].reverse()) {
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
				addLabel(String(value), OFFSET_X - 10, OFFSET_Y + y, "right", "middle");
				border.graphics.beginStroke(value === 2000 ? "#000" : "#FFF").setStrokeStyle(0.5);
				border.graphics.moveTo(0, y).lineTo(panelWidth, y);
			}
			border.graphics.beginStroke("#FFF").setStrokeStyle(0.5);

			let monthStep = 6;
			for (let years = 3; years >= 1; years--) {
				if (xMax - xMin <= YEAR_SECONDS * years + MARGIN_X * 2) monthStep = years;
			}
			let isFirst = true;
			for (let year = START_YEAR; year < 3000; year++) {
				let finished = false;
				for (let month = 0; month < 12; month += monthStep) {
					const paddedMonth = String(month + 1).padStart(2, "0");
					const unix = Date.parse(`${year}-${paddedMonth}-01T00:00:00`) / 1000;
					if (xMin < unix && unix < xMax) {
						const x = panelWidth * ratio(unix, xMin, xMax);
						addLabel(MONTH_NAMES[month] ?? "", OFFSET_X + x, OFFSET_Y + panelHeight + 2, "center", "top");
						if (month === 0 || isFirst) {
							addLabel(String(year), OFFSET_X + x, OFFSET_Y + panelHeight + 15, "center", "top");
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

		const particles: Easel[] = [];
		let status: Easel = {};

		const setParticles = (rating: number, color: string, alpha: number): void => {
			const progress = tierProgress(ratingScale, rating);
			const active = Math.floor(progress ** 2 * (PARTICLE_MAX - PARTICLE_MIN) + PARTICLE_MIN);
			particles.forEach((particle, index) => {
				if (index >= active) {
					Object.assign(particle, {life: 0, visible: false});
					return;
				}
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 4 + 4;
				Object.assign(particle, {
					x: status.rating.x,
					y: status.rating.y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					rotationSpeed: Math.random() * 20 + 10,
					life: PARTICLE_LIFE,
					visible: true,
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
			status.border.graphics.c().s(color).ss(1).rr(OFFSET_X, OFFSET_Y, statusWidth, statusHeight, 2);
			status.rating.text = entry.NewRating;
			status.rating.color = color;
			status.performance.text = showPerformance ? `perf: ${performances[index] ?? "-"}` : "";
			status.place.text = ordinal(entry.Place);
			status.diff.text = signed(entry.NewRating - entry.OldRating);
			status.date.text = new Date(entry.EndTime * 1000).toLocaleDateString();
			status.contest.text = entry.ContestName;
			status.standingsUrl = entry.StandingsUrl;
			if (withParticles) setParticles(entry.NewRating, color, alpha);
			stageGraph.update();
		};

		const drawSeries = (
			values: readonly number[],
			lineColor: string,
			highestLabel: string,
			radius: number,
		): void => {
			const container = new cj.Container();
			stageGraph.addChild(container);
			container.shadow = new cj.Shadow("rgba(0,0,0,0.3)", 1, 2, 3);
			const line = newShape(container);
			const highestShape = newShape(container);
			const highestIndex = values.indexOf(Math.max(...values));

			const onHover = (event: Easel): void => {
				const vertex = vertices[event.target.index];
				vertex.scaleX = vertex.scaleY = 1.2;
				stageGraph.update();
				updateStatus(event.target.index, true);
			};
			const onLeave = (event: Easel): void => {
				const vertex = vertices[event.target.index];
				vertex.scaleX = vertex.scaleY = 1;
				stageGraph.update();
			};

			const vertices: Easel[] = values.map((value, index) => {
				const vertex = newShape(container);
				vertex.graphics.beginStroke(index === highestIndex ? "#000" : "#FFF");
				vertex.graphics.setStrokeStyle(0.5).beginFill(tierOf(ratingScale, value).color).dc(0, 0, radius);
				vertex.x = pointX(history[index]?.EndTime ?? 0);
				vertex.y = pointY(value);
				vertex.index = index;
				const hitArea = new cj.Shape();
				hitArea.graphics.f("#000").dc(1.5, 1.5, 6);
				vertex.hitArea = hitArea;
				vertex.addEventListener("mouseover", onHover);
				vertex.addEventListener("mouseout", onLeave);
				return vertex;
			});

			const highest = vertices[highestIndex];
			const x = highest.x + ((xMin + xMax) / 2 < (history[highestIndex]?.EndTime ?? 0) ? -80 : 80);
			const y = highest.y - 16;
			highestShape.graphics.s("#FFF").mt(highest.x, highest.y).lt(x, y);
			highestShape.graphics.s("#888").f("#FFF").rr(x - HIGHEST_WIDTH / 2, y - HIGHEST_HEIGHT / 2, HIGHEST_WIDTH, HIGHEST_HEIGHT, 2);
			highestShape.index = highestIndex;
			newText(stageGraph, x, y, LABEL_FONT).text = `${highestLabel}: ${values[highestIndex]}`;
			highestShape.addEventListener("mouseover", onHover);
			highestShape.addEventListener("mouseout", onLeave);

			line.graphics.s("#AAA").ss(2).mt(vertices[0].x, vertices[0].y);
			for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
			line.graphics.s(lineColor).ss(0.5).mt(vertices[0].x, vertices[0].y);
			for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
		};

		const createStatus = (): void => {
			const middle = OFFSET_Y + statusHeight / 2;
			status = {
				border: newShape(stageStatus),
				rating: newText(stageStatus, OFFSET_X + 75, middle, "48px 'Squada One'"),
				performance: newText(stageStatus, OFFSET_X + 75, middle + 25, "16px 'Squada One'"),
				place: newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 2.7, "16px Lato"),
				diff: newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 1.5, "11px Lato"),
				date: newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 4, "14px Lato"),
				contest: newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 1.6, "20px Lato"),
				standingsUrl: "",
			};
			status.diff.color = "#888";
			status.date.textAlign = status.contest.textAlign = "left";
			status.contest.maxWidth = statusWidth - 200 - 10;
			const hitArea = new cj.Shape();
			hitArea.graphics.f("#000").r(0, -12, status.contest.maxWidth, 24);
			status.contest.hitArea = hitArea;
			status.contest.cursor = "pointer";
			status.contest.addEventListener("click", () => {
				location.href = status.standingsUrl;
			});
			for (let index = 0; index < PARTICLE_MAX; index++) {
				const particle = newText(stageStatus, 0, 0, "64px Lato");
				particle.visible = false;
				particles.push(particle);
			}
		};

		const onTick = (): void => {
			for (const particle of particles) {
				if (particle.life <= 0) {
					particle.visible = false;
					continue;
				}
				particle.x += particle.vx;
				particle.vx *= 0.9;
				particle.y += particle.vy;
				particle.vy *= 0.9;
				particle.life--;
				particle.scaleX = particle.scaleY = particle.life / PARTICLE_LIFE;
				particle.rotation += particle.rotationSpeed;
			}
			stageStatus.update();
		};

		drawBackground();
		createStatus();
		drawSeries(history.map((entry) => entry.NewRating), "#000", "Highest(Rate)", 3.5);
		if (showPerformance && performances.length > 0) drawSeries(performances, "#F00", "Highest(Perf)", 2.8);
		updateStatus(count - 1, false);
		stageGraph.update();
		stageStatus.update();

		cj.Ticker.removeAllEventListeners("tick");
		cj.Ticker.setFPS(60);
		cj.Ticker.addEventListener("tick", onTick);
	}
}
