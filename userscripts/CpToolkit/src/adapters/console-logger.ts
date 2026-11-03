import type {Logger} from "@application/ports/logger";

export class ConsoleLogger implements Logger {
	private readonly prefix: string;

	constructor(prefix: string) {
		this.prefix = prefix;
	}

	error(message: string, cause: unknown): void {
		console.error(`[${this.prefix}] ${message}`, cause);
	}
}
