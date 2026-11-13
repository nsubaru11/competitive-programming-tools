export const ANSI = {
	RESET: "\x1b[0m",
	GREEN: "\x1b[32m",
	RED: "\x1b[31m",
	YELLOW: "\x1b[33m",
	ORANGE: "\x1b[38;5;208m",
	CYAN: "\x1b[36m",
};

/** 色の指定(ANSI のエスケープ)を除く。 */
export function stripAnsi(text: string): string {
	return text.replace(/\x1B\[[0-9;]*m/g, "");
}

export function supportsCliColor() {
	return process.stdout.isTTY && !process.env.NO_COLOR;
}

export function supportsRunnerColor() {
	return !process.env.NO_COLOR;
}

export function colorizeStatus(status: string, mode: "cli" | "runner" = "cli") {
	const supportsColor = mode === "runner" ? supportsRunnerColor() : supportsCliColor();
	if (!supportsColor) return status;
	if (status === "AC") return `${ANSI.GREEN}${status}${ANSI.RESET}`;
	if (status === "WA") return `${ANSI.RED}${status}${ANSI.RESET}`;
	if (status === "CE") return `${ANSI.YELLOW}${status}${ANSI.RESET}`;
	if (["RE", "TLE", "MLE", "OLE", "IE"].includes(status)) return `${ANSI.ORANGE}${status}${ANSI.RESET}`;
	if (["WJ", "WR"].includes(status)) return `${ANSI.CYAN}${status}${ANSI.RESET}`;
	return status;
}
