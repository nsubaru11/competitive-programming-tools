import {buildCalendarUrl} from "@domain/contest/calendar";
import {defineFeature} from "@application/feature/definition";
import {h, injectStyle} from "@ui/element";
import css from "./contest-calendar.css" with {type: "text"};

export const contestCalendar = defineFeature({
	id: "contest-calendar",
	title: "contestCalendar.title",
	description: "contestCalendar.description",
	category: "category.contest",
	defaultEnabled: true,
	routes: ["atcoder:contest"],
	phase: "ready",
	options: {},
	live: true,
	start({page, translate}) {
		const period = page.contestPeriod();
		const duration = document.querySelector("small.contest-duration");
		const contestLink = document.querySelector<HTMLAnchorElement>("a.contest-title");
		if (!period || !duration || !contestLink || page.serverNow() >= period.endMs) return () => undefined;

		const title = contestLink.textContent?.trim() ?? "";
		const icon = h("span", {className: "glyphicon glyphicon-calendar", ariaHidden: "true"});
		// 行の高さに収まる大きさにして、下のタブを押し下げない
		const link = h("a", {
			className: "btn btn-default btn-xs cp-calendar-link",
			href: buildCalendarUrl({title, ...period, location: contestLink.href}),
			target: "_blank",
			rel: "noopener noreferrer",
		}, icon, ` ${translate("contestCalendar.add")}`);
		const style = injectStyle(css);
		duration.append(link);
		return () => {
			link.remove();
			style.remove();
		};
	},
});
