import crypto from "node:crypto";
import type {LocalRunnerPrepareResponse} from "@atcoder-tools/shared";
import {CanceledError} from "./processRunner";

/** コンパイルの条件。同じソースでも、条件が違えば別のものとして扱う。 */
export type PrepareOptions = {
	readonly debug: boolean;
	readonly autoImport: boolean;
	readonly validate: boolean;
};

/** 変換とコンパイルを行う。signal が中断されたら、できるだけ早く CanceledError を投げる。 */
export type PrepareFunction = (
	language: string,
	sourceCode: string,
	options: PrepareOptions,
	signal: AbortSignal,
) => Promise<LocalRunnerPrepareResponse>;

type Job = {
	readonly language: string;
	readonly controller: AbortController;
	readonly result: Promise<LocalRunnerPrepareResponse>;
	/** 結果を待っている要求の数。0 の間は、同じ言語の新しいソースが届いたら中断してよい。 */
	waiters: number;
	settled: boolean;
};

function keyOf(language: string, sourceCode: string, {debug, autoImport, validate}: PrepareOptions): string {
	const digest = crypto.createHash("md5").update(sourceCode).digest("hex");
	return `${language}:${debug ? 1 : 0}${autoImport ? 1 : 0}${validate ? 1 : 0}:${digest}`;
}

/**
 * コンパイルを1つずつ順番に行い、結果を覚えておく。
 *
 * 事前コンパイルは編集のたびに届くので、誰も結果を待っていないうちに同じ言語の新しいソースが届いたら、
 * 古いソースのコンパイルは中断する。実行が結果を待っているコンパイルは中断しない。
 */
export class PreparationQueue {
	private readonly prepare: PrepareFunction;
	private readonly maxEntries: number;
	private readonly jobs = new Map<string, Job>();
	private tail: Promise<unknown> = Promise.resolve();

	constructor(prepare: PrepareFunction, maxEntries: number) {
		this.prepare = prepare;
		this.maxEntries = maxEntries;
	}

	/** 先にコンパイルしておく。結果は待たない。 */
	schedule(language: string, sourceCode: string, options: PrepareOptions): void {
		this.obtain(language, sourceCode, options);
	}

	/** コンパイルの結果を待つ。待っている間は、このソースのコンパイルを中断しない。 */
	async wait(language: string, sourceCode: string, options: PrepareOptions): Promise<LocalRunnerPrepareResponse> {
		const job = this.obtain(language, sourceCode, options);
		job.waiters++;
		try {
			return await job.result;
		} finally {
			job.waiters--;
		}
	}

	/** 覚えている結果を捨てる。実行しようとしたプログラムが消えていたときに、作り直すために使う。 */
	forget(language: string, sourceCode: string, options: PrepareOptions): void {
		const key = keyOf(language, sourceCode, options);
		if (this.jobs.get(key)?.settled) this.jobs.delete(key);
	}

	private obtain(language: string, sourceCode: string, options: PrepareOptions): Job {
		const key = keyOf(language, sourceCode, options);
		this.cancelSuperseded(language, key);
		const existing = this.jobs.get(key);
		if (existing) {
			// 最近使ったものとして、追い出す順番の最後に回す
			this.jobs.delete(key);
			this.jobs.set(key, existing);
			return existing;
		}
		const controller = new AbortController();
		const result = this.tail.then(() => {
			if (controller.signal.aborted) throw new CanceledError();
			return this.prepare(language, sourceCode, options, controller.signal);
		});
		this.tail = result.catch(() => undefined);
		const job: Job = {language, controller, result, waiters: 0, settled: false};
		result.then(() => {
			job.settled = true;
		}, () => {
			// 中断や内部エラーの結果は覚えず、次の要求でやり直す
			job.settled = true;
			if (this.jobs.get(key) === job) this.jobs.delete(key);
		});
		this.jobs.set(key, job);
		this.evict();
		return job;
	}

	private cancelSuperseded(language: string, key: string): void {
		for (const [otherKey, job] of this.jobs) {
			if (otherKey === key || job.language !== language || job.settled || job.waiters > 0) continue;
			job.controller.abort();
			this.jobs.delete(otherKey);
		}
	}

	/** 終わった結果だけを、古いものから追い出す。 */
	private evict(): void {
		for (const [key, job] of this.jobs) {
			if (this.jobs.size <= this.maxEntries) return;
			if (job.settled) this.jobs.delete(key);
		}
	}
}
