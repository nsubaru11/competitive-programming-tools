import {type ContestLink, contestLinks} from "@catalog/tables";
import {defineFeature} from "@application/feature/definition";
import {h} from "@ui/element";

function createLink({title, subtitle, label, labelClass, description, href}: ContestLink): HTMLElement {
	const heading = h("h4", {className: "list-group-item-heading clearfix"}, h("b", {textContent: title}));
	if (subtitle) heading.append(" ", h("small", {className: "no-break", textContent: `(${subtitle})`}));
	if (label) heading.append(h("span", {className: `label ${labelClass ?? ""} pull-right`, textContent: label}));
	return h(
		"a",
		{href, className: "list-group-item"},
		heading,
		h("p", {className: "list-group-item-text text-muted", textContent: description}),
	);
}

export const topLinks = defineFeature({
	id: "top-links",
	title: "topLinks.title",
	description: "topLinks.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:home"],
	phase: "ready",
	options: {},
	start() {
		const lists = document.querySelectorAll(".list-group.contest-list");
		lists.forEach((list, index) => {
			const links = contestLinks[index];
			if (links) list.replaceChildren(...links.map(createLink));
		});
	},
});
