export interface Logger {
	error(message: string, cause: unknown): void;
}
