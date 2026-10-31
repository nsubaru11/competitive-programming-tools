import {libraries} from "@catalog/tables";
import {defineFeature, type FeatureServices} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";

const EDITORIAL_LINK_PATTERN = /\/contests\/[^/]+\/editorial\/\d+$/;
const EDITORIAL_BODY = "#main-container > div.row > div:nth-child(2)";
// 200ms では AtCoder から 429 が返った
const LOAD_INTERVAL_MS = 500;

const css = `.cp-editorial {margin-top: 0.3em; font-size: smaller;}
${EDITORIAL_BODY} > ul > li {font-size: larger;}
pre code {tab-size: 4;}`;

async function loadLibraries({scripts}: FeatureServices): Promise<void> {
	await scripts.loadStylesheet(libraries.katexStylesheet);
	await scripts.loadScript(libraries.katexScript);
	await Promise.all([scripts.loadScript(libraries.katexAutoRender), scripts.loadScript(libraries.prettify)]);
}

async function loadEditorial(link: HTMLAnchorElement, {site, page}: FeatureServices): Promise<void> {
	const response = await site.send({url: link.href});
	if (response.status !== 200) throw new Error(`Failed to load ${link.href}`);
	const parsed = new DOMParser().parseFromString(response.text, "text/html");
	const content = parsed.querySelector(`${EDITORIAL_BODY} > div:nth-of-type(1)`);
	if (!content) throw new Error(`Editorial was not found in ${link.href}`);
	const history = parsed.querySelector(`${EDITORIAL_BODY} > div:nth-of-type(2)`);
	const container = h("div", {className: "cp-editorial"}, content);
	if (history) container.append(history);
	link.parentElement?.append(container);
	page.renderMath(container);
	page.highlightCode();
}

export const editorialList = defineFeature({
	id: "editorial-list",
	title: "editorialList.title",
	description: "editorialList.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:editorial"],
	phase: "ready",
	options: {},
	async start(context) {
		const links = [...document.querySelectorAll("a")].filter((link) => {
			return EDITORIAL_LINK_PATTERN.test(link.href) && !link.classList.contains("spoiler");
		});
		if (links.length === 0) return;
		injectStyle(css);
		await loadLibraries(context);

		// 表示された解説から順に、間隔を空けて読み込む
		const queue = new Set<HTMLAnchorElement>();
		let timer: ReturnType<typeof setInterval> | undefined;
		const loadNext = (): void => {
			const [link] = queue;
			if (!link) {
				clearInterval(timer);
				timer = undefined;
				return;
			}
			queue.delete(link);
			observer.unobserve(link);
			void loadEditorial(link, context).catch((error: unknown) => console.warn(error));
		};
		const observer = new IntersectionObserver((entries) => {
			for (const {target, isIntersecting} of entries) {
				if (!(target instanceof HTMLAnchorElement)) continue;
				if (isIntersecting) queue.add(target);
				else queue.delete(target);
			}
			timer ??= setInterval(loadNext, LOAD_INTERVAL_MS);
		});
		for (const link of links) observer.observe(link);
	},
});
