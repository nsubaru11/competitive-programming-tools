export type VirtualClock =
	| {readonly phase: "before" | "running"; readonly remainingMs: number}
	| {readonly phase: "finished"};

export function virtualClock(now: number, startMs: number, durationMs: number): VirtualClock {
	if (now < startMs) return {phase: "before", remainingMs: startMs - now};
	const remainingMs = startMs + durationMs - now;
	return remainingMs > 0 ? {phase: "running", remainingMs} : {phase: "finished"};
}

/** 残り時間を HH:mm:ss で表す。1日以上でも時間のまま数える。 */
export function formatClock(remainingMs: number): string {
	const seconds = Math.ceil(remainingMs / 1000);
	return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
		.map((value) => String(value).padStart(2, "0"))
		.join(":");
}
