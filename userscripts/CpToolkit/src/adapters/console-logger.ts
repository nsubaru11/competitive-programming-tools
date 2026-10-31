import type {Logger} from "@application/ports/logger";

export class ConsoleLogger implements Logger {
	constructor(private readonly prefix: string) {
	}

	error(message: string, cause: unknown): void {
		console.error(`[${this.prefix}] ${message}`, cause);
	}
}
