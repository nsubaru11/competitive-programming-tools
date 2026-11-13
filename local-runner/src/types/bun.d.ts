// サーバーとテストは Bun で動く。使う範囲の Bun.spawn だけを宣言し、型のパッケージは足さない。
type BunSubprocess = {
	readonly pid: number;
	readonly stdout: ReadableStream<Uint8Array>;
	readonly stderr: ReadableStream<Uint8Array>;
	readonly exited: Promise<number>;
	readonly exitCode: number | null;
	readonly signalCode: string | null;
	kill(signal?: string | number): void;
	/** プロセスの終了後に値を返す。maxRSS はバイト。 */
	resourceUsage(): {maxRSS: number} | undefined;
};

declare const Bun: {
	spawn(options: {
		cmd: string[];
		cwd?: string;
		env?: Record<string, string | undefined>;
		stdin: Uint8Array | "ignore";
		stdout: "pipe";
		stderr: "pipe";
		/** 新しいプロセスグループで起動する。子プロセスもまとめて止められるようにする。 */
		detached?: boolean;
	}): BunSubprocess;
};
