import {buildQueryString} from "@atcoder-tools/shared";

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/render";

export type CalendarEvent = {
	readonly title: string;
	readonly startMs: number;
	readonly endMs: number;
	readonly location: string;
};

function toCalendarTime(timeMs: number): string {
	return new Date(timeMs).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function buildCalendarUrl({title, startMs, endMs, location}: CalendarEvent): string {
	const query = buildQueryString({
		action: "TEMPLATE",
		text: title,
		dates: `${toCalendarTime(startMs)}/${toCalendarTime(endMs)}`,
		location,
	});
	return `${GOOGLE_CALENDAR_URL}?${query}`;
}
