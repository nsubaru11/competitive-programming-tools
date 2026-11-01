import {statementCatalog} from "@catalog/tables";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

const COPIED_LABEL_MS = 1500;
const EXCLUDED_FROM_COPY = ".btn, .btn-copy, .btn-pre, .div-btn-copy, .pull-right, .cp-title-control";

function isSampleHeading(section: Element): boolean {
	const title = section.querySelector("h3")?.textContent ?? "";
	return statementCatalog.sampleHeadings.some((heading) => title.includes(heading));
}

function withoutControls(element: Element): HTMLElement {
	const clone = element.cloneNode(true) as HTMLElement;
	for (const control of clone.querySelectorAll(EXCLUDED_FROM_COPY)) control.remove();
	return clone;
}

function findVisibleStatement(container: Element): Element {
	const languages = [...container.querySelectorAll(".lang-ja, .lang-en")];
	return languages.find((element) => getComputedStyle(element).display !== "none") ?? container;
}

export const statementCopy = defineFeature({
	id: "statement-copy",
	title: "statementCopy.title",
	description: "statementCopy.description",
	category: "category.statement",
	defaultEnabled: true,
	routes: ["atcoder:task"],
	phase: "ready",
	options: {
		format: option.select("markdown", "statementCopy.format", [
			{value: "markdown", label: "statementCopy.formatMarkdown"},
			{value: "plain", label: "statementCopy.formatPlain"},
		]),
	},
	live: true,
	start({options, clipboard, statementConverter, translate}) {
		const added: HTMLElement[] = [];
		const container = document.getElementById("task-statement");
		if (!container) return () => undefined;

		const convert = (element: Element): string => {
			const html = withoutControls(element).innerHTML;
			return options.format === "plain" ? statementConverter.toPlainText(html) : statementConverter.toMarkdown(html);
		};

		const createButton = (label: string, getText: () => string): HTMLButtonElement => {
			const button = h("button", {type: "button", className: "btn btn-default btn-sm", textContent: label});
			button.style.marginLeft = "10px";
			button.addEventListener("click", (event) => {
				event.preventDefault();
				clipboard.write(getText());
				button.textContent = translate("statementCopy.copied");
				setTimeout(() => {
					button.textContent = label;
				}, COPIED_LABEL_MS);
			});
			added.push(button);
			return button;
		};

		for (const section of container.querySelectorAll(".part section")) {
			if (isSampleHeading(section)) continue;
			section.querySelector("h3")?.append(createButton(translate("statementCopy.copy"), () => convert(section)));
		}

		const title = document.querySelector(".h2") ?? document.querySelector("h2");
		if (title) {
			const copyAll = (): string => {
				// 言語の表示は起動後に切り替わるので、コピーする時点で判定する
				const sections = [...findVisibleStatement(container).querySelectorAll(".part section")];
				const heading = withoutControls(title).textContent?.trim() || translate("statementCopy.defaultTitle");
				const firstSample = sections.findIndex(isSampleHeading);
				const body = (firstSample < 0 ? sections : sections.slice(0, firstSample)).map(convert).join("\n\n");
				const prefix = options.format === "plain" ? heading : `# ${heading}`;
				return `${prefix}\n\nURL: ${location.href}\n\n${body}`.trim();
			};
			const wrapper = h("span", {className: "pull-right"}, createButton(translate("statementCopy.copyAll"), copyAll));
			wrapper.style.fontSize = "14px";
			title.append(wrapper);
			added.push(wrapper);
		}

		return () => {
			for (const element of added) element.remove();
		};
	},
});
