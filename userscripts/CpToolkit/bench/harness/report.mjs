// 生データから、版ごとの表(reports/<版>/*.json)と詳細レポート(reports/<版>.md)を作る。run.sh から呼ぶ。
//   node harness/report.mjs <生データのフォルダ>           レポートを作る
//   node harness/report.mjs --check <生データのフォルダ>   全回でスクリプトが動いたかだけを確かめる
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {loadConditions} from "./conditions.mjs";
import {PAGES as URLS} from "./pages.mjs";
import {BENCH, toolkitDir} from "./paths.mjs";
import {SourceMap} from "./sourcemap.mjs";
import {matchesUrl} from "./userscript.mjs";

const args = process.argv.slice(2);
const checkOnly = args[0] === "--check";
const RAW = checkOnly ? args[1] : args[0];
const source = JSON.parse(readFileSync(join(RAW, "source.json"), "utf8"));
const VERSION = source.version;
process.env.BENCH_VERSION = VERSION;
const env = existsSync(join(RAW, "env.json")) ? JSON.parse(readFileSync(join(RAW, "env.json"), "utf8")) : {};
const read = (f) => existsSync(join(RAW, f))
	? readFileSync(join(RAW, f), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l))
	: [];

const PAGE_NAMES = {
	top: "トップ", contests: "コンテスト一覧", contest: "コンテストのトップ", tasks: "問題一覧", task: "問題文",
	editorial: "解説一覧", user: "ユーザー", history: "コンテスト成績表", tessoku: "鉄則本の問題一覧",
};
const conds = loadConditions({analysisBuild: true, version: VERSION});
// 条件の名前は本数を含むので、版ごとの条件から取る(対応する機能がない旧スクリプトは外れる)
const COND_NAMES = Object.fromEntries(["A", "B_own", "C_own", "B_all", "C_eq"].map((c) => [c, conds[c].label]));
const CONDS = Object.keys(COND_NAMES);
const PAIRS = {C_own: "B_own", C_eq: "B_all"};
const PAGES = Object.keys(PAGE_NAMES);

// ---- 統計 ----
const median = (a) => {
	if (!a.length) return NaN;
	const x = [...a].sort((p, q) => p - q);
	const m = (x.length - 1) / 2;
	return (x[Math.floor(m)] + x[Math.ceil(m)]) / 2;
};
const quantile = (a, q) => {
	const x = [...a].sort((p, r) => p - r);
	const pos = (x.length - 1) * q;
	return x[Math.floor(pos)] + (x[Math.ceil(pos)] - x[Math.floor(pos)]) * (pos - Math.floor(pos));
};
/** Mann-Whitney U の両側 p 値(正規近似、同順位は平均順位) */
const mwu = (a, b) => {
	if (!a.length || !b.length) return null;
	const all = [...a.map((v) => [v, 0]), ...b.map((v) => [v, 1])].sort((x, y) => x[0] - y[0]);
	const rk = all.map((_, i) => i + 1);
	for (let i = 0; i < all.length;) {
		let j = i;
		while (j + 1 < all.length && all[j + 1][0] === all[i][0]) j++;
		for (let k = i; k <= j; k++) rk[k] = (i + j) / 2 + 1;
		i = j + 1;
	}
	const n1 = a.length, n2 = b.length;
	const u = all.reduce((acc, [, g], i) => acc + (g === 0 ? rk[i] : 0), 0) - n1 * (n1 + 1) / 2;
	const z = (u - n1 * n2 / 2) / Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
	const t = 1 / (1 + 0.2316419 * Math.abs(z));
	const tail = 0.3989423 * Math.exp(-z * z / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
	return 2 * tail;
};
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const base = (page, cond) => ({page, page_name: PAGE_NAMES[page], cond, cond_name: COND_NAMES[cond]});
const by = (rows, page, cond) => rows.filter((r) => r.page === page && r.cond === cond);
const usSum = (o) => Object.entries(o ?? {}).filter(([k]) => k.startsWith("us:")).reduce((s, [, v]) => s + v, 0);

// ---- CP Toolkit のコードの位置を機能へ割り振る(ソースマップ) ----
const map = new SourceMap(join(toolkitDir(VERSION), "CpToolkit.analysis.user.js.map"));
const ownerCache = new Map();
function owner(frames, offset = 0) {
	const key = `${offset}|${frames.join("<")}`;
	if (ownerCache.has(key)) return ownerCache.get(key);
	let first = null, found = null;
	for (const f of frames) {
		const m = /(\d+):(\d+)$/.exec(f);
		if (!m) continue;
		const hit = map.lookup(Number(m[1]) - offset, Number(m[2]));
		if (!hit) continue;
		const src = hit.source.replace(/^(\.\.\/)+/, "");
		first ??= src;
		const fm = /src\/features\/([^/]+)\//.exec(src);
		if (fm) {
			found = fm[1];
			break;
		}
	}
	if (!found) {
		const lm = /src\/(app|adapters|application|ui|domain|catalog)\//.exec(first ?? "");
		found = lm ? `共通部分(${lm[1]})` : (first ?? "").startsWith("shared/") ? "共通部分(shared)" : first ? "ライブラリ" : "トップレベル";
	}
	ownerCache.set(key, found);
	return found;
}

// ---- 読み込み ----
const cpuRows = read("tm-cpu-x1.jsonl"), memRows = read("tm-memory-x1.jsonl");
const perf1 = read("tm-perf-x1.jsonl"), perf4 = read("tm-perf-x4.jsonl"), idleRows = read("tm-idle-x1.jsonl");
const traceRows = read("trace.jsonl");
const tmAll = [...cpuRows, ...memRows, ...perf1, ...perf4, ...idleRows];

// ---- 動作確認: 各回で、その URL に当てはまるスクリプトが全部動いたか ----
const failedRuns = tmAll.filter((r) => r.failed).length + traceRows.filter((r) => r.failed).length;
const ok = tmAll.filter((r) => !r.failed);
const incomplete = ok.filter((r) => {
	const expected = conds[r.cond].scripts.filter((s) => matchesUrl(s, URLS[r.page])).map((s) => s.id);
	return expected.some((id) => !(r.ran ?? []).includes(id));
});
const checks = {runs: tmAll.length, complete: ok.length - incomplete.length, incomplete: incomplete.length, failed: failedRuns};
console.log("動作確認:", checks);
if (checkOnly) {
	if (incomplete.length || failedRuns) {
		console.error("スクリプトが動かなかった回、または失敗した回があります。");
		process.exit(1);
	}
	process.exit(0);
}
const ROWS_OK = (rows) => rows.filter((r) => !r.failed);

// ---- CPU ----
const tmCpu = [];
for (const page of PAGES) for (const cond of CONDS) {
	const rs = ROWS_OK(by(cpuRows, page, cond));
	if (!rs.length) continue;
	const mgr = rs.map((r) => r.byBucket.tampermonkey || 0), us = rs.map((r) => usSum(r.byBucket));
	tmCpu.push({...base(page, cond), manager_ms: r1(median(mgr)), script_ms: r1(median(us)), total_ms: r1(median(rs.map((_, i) => mgr[i] + us[i]))), runs: rs.length});
}
for (const r of tmCpu) {
	const old = PAIRS[r.cond];
	const a = tmCpu.find((x) => x.page === r.page && x.cond === "A");
	r.overhead_ms = r1(r.total_ms - a.total_ms);
	if (!old) continue;
	const tot = (c) => ROWS_OK(by(cpuRows, r.page, c)).map((x) => (x.byBucket.tampermonkey || 0) + usSum(x.byBucket));
	r.p_vs_old = r2(mwu(tot(old), tot(r.cond)));
}

const breakdown = (rows, pages, field, stackField, scale, unit) => {
	const out = [];
	for (const page of pages) for (const cond of ["B_all", "C_eq"]) {
		const rs = ROWS_OK(by(rows, page, cond));
		const baseMgr = median(ROWS_OK(by(rows, page, "A")).map((r) => (r[field].tampermonkey || 0) / scale));
		const acc = {};
		for (const r of rs) {
			const one = {"Tampermonkey 自身(増えた分)": (r[field].tampermonkey || 0) / scale - baseMgr};
			if (cond === "C_eq") {
				for (const [stack, v] of Object.entries(r[stackField] ?? {})) {
					const o = stack ? owner(stack.split(" < "), r.toolkitLineOffset ?? 0) : "トップレベル";
					one[o] = (one[o] || 0) + v / scale;
				}
			} else {
				for (const [k, v] of Object.entries(r[field])) if (k.startsWith("us:")) one[k.slice(3)] = v / scale;
			}
			for (const [k, v] of Object.entries(one)) (acc[k] ??= []).push(v);
		}
		for (const [part, vs] of Object.entries(acc)) {
			const m = median([...vs, ...new Array(rs.length - vs.length).fill(0)]);
			if (Math.abs(m) >= (unit === "ms" ? 0.1 : 1)) out.push({...base(page, cond), part, [unit]: unit === "ms" ? r2(m) : r1(m)});
		}
	}
	return out;
};
const cpuBreakdown = breakdown(cpuRows, ["task", "editorial"], "byBucket", "toolkitStacks", 1, "ms");

// ---- メモリ ----
const tmMem = [];
for (const page of PAGES) {
	const a = median(ROWS_OK(by(memRows, page, "A")).map((r) => r.afterGc.JSHeapUsedSize / 1048576));
	for (const cond of CONDS) {
		const rs = ROWS_OK(by(memRows, page, cond));
		if (!rs.length) continue;
		const heap = median(rs.map((r) => r.afterGc.JSHeapUsedSize / 1048576));
		const row = {...base(page, cond), heap_mb: r2(heap), overhead_mb: r2(heap - a), runs: rs.length};
		const old = PAIRS[cond];
		if (old) row.p_vs_old = r2(mwu(ROWS_OK(by(memRows, page, old)).map((r) => r.afterGc.JSHeapUsedSize), rs.map((r) => r.afterGc.JSHeapUsedSize)));
		tmMem.push(row);
	}
}
const memBreakdown = breakdown(memRows, ["task"], "heapByBucket", "heapToolkitStacks", 1024, "kb");

// ---- ページ全体の処理時間 ----
const tmLoad = [];
for (const [th, rows] of [[1, perf1], [4, perf4]]) for (const page of PAGES) {
	const a = ROWS_OK(by(rows, page, "A"));
	if (!a.length) continue;
	const task = (r) => r.metrics.TaskDuration * 1000;
	const script = (r) => r.metrics.ScriptDuration * 1000;
	const ls = (r) => (r.metrics.LayoutDuration + r.metrics.RecalcStyleDuration) * 1000;
	for (const cond of CONDS) {
		const rs = ROWS_OK(by(rows, page, cond));
		if (!rs.length) continue;
		const row = {
			...base(page, cond), throttle: th, task_ms: r1(median(rs.map(task))), task_q1: r1(quantile(rs.map(task), .25)), task_q3: r1(quantile(rs.map(task), .75)),
			overhead_ms: r1(median(rs.map(task)) - median(a.map(task))), script_overhead_ms: r1(median(rs.map(script)) - median(a.map(script))),
			layout_style_overhead_ms: r1(median(rs.map(ls)) - median(a.map(ls))), longtask_ms: r1(median(rs.map((r) => r.page_?.longtasks?.total ?? 0))), runs: rs.length,
		};
		const old = PAIRS[cond];
		if (old) row.p_vs_old = r2(mwu(ROWS_OK(by(rows, page, old)).map(task), rs.map(task)));
		tmLoad.push(row);
	}
}

// ---- 放置時 ----
const tmIdle = [];
for (const page of PAGES) for (const cond of CONDS) {
	const rs = ROWS_OK(by(idleRows, page, cond));
	if (!rs.length) continue;
	const per = (k) => median(rs.map((r) => r.idle[k] * 1000 / (r.idleMs / 1000)));
	tmIdle.push({...base(page, cond), task_ms_per_s: r2(per("TaskDuration")), script_ms_per_s: r2(per("ScriptDuration")), runs: rs.length});
}

// ---- DOM への重複アクセス(シム) ----
const dom = [];
for (const page of PAGES) for (const cond of CONDS) {
	const r = ROWS_OK(traceRows).find((x) => x.page === page && x.cond === cond);
	if (!r?.page_?.trace) continue;
	const t = r.page_.trace;
	const owners = t.callers.map((c) => {
		const script = c.split("/")[0];
		return script === "CpToolkit" ? owner(c.split(" < ").filter((f) => f.startsWith("CpToolkit/main"))) : script;
	});
	const perEl = new Map();
	let ops = 0;
	for (const [key, n] of t.ops) {
		const [el, c, op] = key.split("|");
		ops += n;
		const kind = op.split(":")[0];
		let e = perEl.get(el);
		if (!e) perEl.set(el, e = new Map());
		const o = e.get(owners[c]) ?? {};
		o[kind] = (o[kind] || 0) + n;
		e.set(owners[c], o);
	}
	let repeated = 0;
	for (const e of perEl.values()) for (const o of e.values()) for (const n of Object.values(o)) if (n > 1) repeated += n - 1;
	const multi = [...perEl.values()].filter((e) => e.size >= 2);
	let queries = 0, qsaNodes = 0, observers = 0;
	for (const [key, v] of t.calls) {
		const api = key.split("|")[1];
		if (/^(querySelector|querySelectorAll|getElementsBy|getElementById|closest|matches)/.test(api)) queries += v.n;
		if (api === "querySelectorAll") qsaNodes += v.scanned;
		if (api === "MutationObserver.observe(subtree)") observers += v.n;
	}
	dom.push({
		...base(page, cond), elements: perEl.size, ops, shared: multi.length,
		shared_write: multi.filter((e) => [...e.values()].filter((o) => o.write).length >= 2).length,
		repeated, forced: t.forced.reduce((s, [, n]) => s + n, 0), queries, qsa_nodes: qsaNodes, observers,
	});
}

// ---- 書き出し ----
const outDir = join(BENCH, "reports", VERSION);
mkdirSync(outDir, {recursive: true});
const tables = {cpu: tmCpu, cpu_breakdown: cpuBreakdown, memory: tmMem, memory_breakdown: memBreakdown, load: tmLoad, idle: tmIdle, dom, checks: [checks], env: [{...env, cptoolkit: VERSION, commit: source.commit}]};
for (const [name, rows] of Object.entries(tables)) writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(rows, null, "\t")}\n`);

// ---- Markdown ----
const f1 = (v) => (v === undefined || v === null || Number.isNaN(v) ? "—" : v.toFixed(1));
const f2 = (v) => (v === undefined || v === null || Number.isNaN(v) ? "—" : v.toFixed(2));
const sgn = (v, f = f1) => (v > 0 ? "+" : "") + f(v);
const pv = (v) => (v === undefined || v === null ? "" : v < 0.01 ? "< 0.01" : v.toFixed(2));
const sum = (rows, cond, k) => rows.filter((r) => r.cond === cond).reduce((s, r) => s + r[k], 0);
const pct = (n, o) => (o ? `${n / o - 1 > 0 ? "+" : ""}${Math.round((n / o - 1) * 100)}%` : "—");
// 数値だけの列は右寄せ、それ以外は左寄せにする
const NUMERIC = /^([-+]?[\d.,]+( ms| MB)?|< 0\.01|—|)$/;
const table = (head, rows) => [
	`| ${head.join(" | ")} |`,
	`|${head.map((_, i) => (i > 0 && rows.every((r) => NUMERIC.test(String(r[i] ?? ""))) ? "---:" : "---")).join("|")}|`,
	...rows.map((r) => `| ${r.join(" | ")} |`),
].join("\n");
const C4 = ["B_own", "C_own", "B_all", "C_eq"];
const cell = (rows, page, cond, k, f = f1) => f(rows.find((r) => r.page === page && r.cond === cond)?.[k]);

const total = Object.fromEntries(C4.map((c) => [c, {
	cpu: sum(tmCpu, c, "overhead_ms"), mem: sum(tmMem, c, "overhead_mb"), shared: sum(dom, c, "shared"), forced: sum(dom, c, "forced"), ops: sum(dom, c, "ops"),
}]));
const heavy = tmCpu.filter((r) => r.cond === "C_eq").map((r) => ({page: r.page, c: r.overhead_ms, b: tmCpu.find((x) => x.page === r.page && x.cond === "B_all").overhead_ms, p: r.p_vs_old}));
const better = heavy.filter((h) => h.p !== null && h.p < 0.05 && h.c < h.b).map((h) => `${PAGE_NAMES[h.page]}(${f1(h.b)} → ${f1(h.c)} ms)`);
const worse = heavy.filter((h) => h.p !== null && h.p < 0.05 && h.c > h.b).map((h) => `${PAGE_NAMES[h.page]}(${f1(h.b)} → ${f1(h.c)} ms)`);
const cpuRunsN = median(tmCpu.map((r) => r.runs)), memRunsN = median(tmMem.map((r) => r.runs));

const md = `# CP Toolkit ${VERSION} の性能

統合前の UserScript 群と、CP Toolkit ${VERSION}(コミット \`${source.commit.slice(0, 7)}\`)を、実際の Tampermonkey で同じ条件で動かして比べた結果です。このファイルは \`bench/run.sh\` が生成しました。測り方と再現の手順は [bench/README.md](../README.md) にあります。

| 項目 | 値 |
|---|---|
| 計測日 | ${env.date ? env.date.slice(0, 10) : "—"} |
| CP Toolkit | ${VERSION}(\`${source.commit.slice(0, 12)}\`) |
| Tampermonkey | ${env.tampermonkey ?? "—"} |
| ブラウザ | Chromium ${env.chromium ?? "—"}(headless) |
| 環境 | ${env.os ?? "—"}、${env.cpu ?? "—"}(${env.cores ?? "—"} コア) |
| 計測の回数 | Tampermonkey ${checks.runs} 回(うち、ページに当てはまるスクリプトがすべて動いた回 ${checks.complete})、失敗 ${checks.failed} 回 |

## 1. 結果の要約

スクリプトなしの状態からの増分を、9ページで合計した値です。小さいほど軽いことを表します。

${table(["", ...C4.map((c) => COND_NAMES[c])], [
	["CPU 時間(Tampermonkey 自身 + UserScript)", ...C4.map((c) => `${f1(total[c].cpu)} ms`)],
	["GC 後の JS ヒープ", ...C4.map((c) => `${f2(total[c].mem)} MB`)],
	["複数のスクリプトや機能が触った要素(シム)", ...C4.map((c) => `${total[c].shared}`)],
	["強制レイアウトの疑い(シム)", ...C4.map((c) => `${total[c].forced}`)],
])}

- ${COND_NAMES.B_all}と比べて、CPU 時間は ${pct(total.C_eq.cpu, total.B_all.cpu)}、メモリは ${pct(total.C_eq.mem, total.B_all.mem)}、複数のスクリプトや機能が触った要素は ${pct(total.C_eq.shared, total.B_all.shared)} です。
- CPU 時間で CP Toolkit が有意に軽いページ: ${better.length ? better.join("、") : "なし"}
- CPU 時間で CP Toolkit が有意に重いページ: ${worse.length ? worse.join("、") : "なし"}
- ${COND_NAMES.B_own}と比べると、CPU 時間は ${pct(total.C_own.cpu, total.B_own.cpu)}、メモリは ${pct(total.C_own.mem, total.B_own.mem)} です。

有意は、Mann-Whitney U 検定で p < 0.05 のものです。

## 2. 比べた条件

| 条件 | 中身 |
|---|---|
| スクリプトなし | Tampermonkey だけを入れた状態。増分の基準 |
| ${COND_NAMES.B_own} | 統合前の nsubaru 版の最終版 |
| ${COND_NAMES.C_own} | 1つ上の行の旧スクリプトに対応する機能だけを ON にした CP Toolkit |
| ${COND_NAMES.B_all} | nsubaru 版と、SOURCES.md で「派生」「模倣」の元になった公開スクリプト |
| ${COND_NAMES.C_eq} | 1つ上の行の旧スクリプトに対応する機能だけを ON にした CP Toolkit |

対応する機能は ${conds.C_eq.features.join("、")} です。旧スクリプトの版は [legacy.lock.json](../legacy.lock.json) にあります。${conds.B_all.excluded.length ? `\n\nこの版には対応する機能がないので、次の旧スクリプトは比較から外しました: ${conds.B_all.excluded.join("、")}` : ""}

## 3. CPU 時間

読み込みから3秒後までの CPU プロファイル(100µs 間隔)から、Tampermonkey 自身と UserScript 本体の時間を足し、スクリプトなしとの差を出しました。各${cpuRunsN}回の中央値です(ms)。p 値は同じ機能の旧スクリプトとの比較です。

${table(["ページ", ...C4.map((c) => COND_NAMES[c]), `p(${COND_NAMES.B_own}と)`, `p(${COND_NAMES.B_all}と)`], PAGES.map((p) => [PAGE_NAMES[p], ...C4.map((c) => cell(tmCpu, p, c, "overhead_ms")), cell(tmCpu, p, "C_own", "p_vs_old", pv), cell(tmCpu, p, "C_eq", "p_vs_old", pv)]))}

### 3.1 内訳

問題文と解説一覧で、旧スクリプトはスクリプトごと、CP Toolkit はソースマップで機能ごとに分けた時間です(ms)。「Tampermonkey 自身」はスクリプトなしとの差です。

${["task", "editorial"].map((page) => `**${PAGE_NAMES[page]}**\n\n${table([COND_NAMES.B_all, "ms", "CP Toolkit(機能)", "ms"], (() => {
	const o = cpuBreakdown.filter((r) => r.page === page && r.cond === "B_all").sort((a, b) => b.ms - a.ms);
	const n = cpuBreakdown.filter((r) => r.page === page && r.cond === "C_eq").sort((a, b) => b.ms - a.ms);
	return Array.from({length: Math.max(o.length, n.length)}, (_, i) => [o[i]?.part ?? "", o[i] ? f1(o[i].ms) : "", n[i]?.part ?? "", n[i] ? f1(n[i].ms) : ""]);
})())}`).join("\n\n")}

## 4. メモリ

読み込みの3秒後に GC を2回かけて残った JS ヒープの、スクリプトなしとの差です。各${memRunsN}回の中央値です(MB)。

${table(["ページ", ...C4.map((c) => COND_NAMES[c]), `p(${COND_NAMES.B_own}と)`, `p(${COND_NAMES.B_all}と)`], PAGES.map((p) => [PAGE_NAMES[p], ...C4.map((c) => cell(tmMem, p, c, "overhead_mb", f2)), cell(tmMem, p, "C_own", "p_vs_old", pv), cell(tmMem, p, "C_eq", "p_vs_old", pv)]))}

### 4.1 内訳(問題文)

サンプリングヒーププロファイラ(1KB 間隔)で、GC 後も残ったオブジェクトを確保したスクリプトや機能に割り当てた値です(KB)。DOM の生成などブラウザ内部の確保は含みません。

${table([COND_NAMES.B_all, "KB", "CP Toolkit(機能)", "KB"], (() => {
	const o = memBreakdown.filter((r) => r.cond === "B_all").sort((a, b) => b.kb - a.kb);
	const n = memBreakdown.filter((r) => r.cond === "C_eq").sort((a, b) => b.kb - a.kb);
	return Array.from({length: Math.max(o.length, n.length)}, (_, i) => [o[i]?.part ?? "", o[i] ? f1(o[i].kb) : "", n[i]?.part ?? "", n[i] ? f1(n[i].kb) : ""]);
})())}

## 5. ページ全体の処理時間

CDP の \`Performance.getMetrics\` の TaskDuration(メインスレッドが使った時間)の、スクリプトなしとの差です(ms、中央値)。ページ自体の処理のばらつきが大きいので、差が出にくい指標です。

${[1, 4].map((th) => `**CPU ${th === 1 ? "等倍" : `${th}倍遅く`}**\n\n${table(["ページ", ...C4.map((c) => COND_NAMES[c]), `p(${COND_NAMES.B_all}と)`], PAGES.map((p) => [PAGE_NAMES[p], ...C4.map((c) => sgn(tmLoad.find((r) => r.page === p && r.cond === c && r.throttle === th)?.overhead_ms)), pv(tmLoad.find((r) => r.page === p && r.cond === "C_eq" && r.throttle === th)?.p_vs_old)]))}`).join("\n\n")}

## 6. 放置時

読み込み後に15秒放置したあいだの、1秒あたりのメインスレッドの時間です(ms/秒、中央値)。

${table(["ページ", ...CONDS.map((c) => COND_NAMES[c])], [...new Set(tmIdle.map((r) => r.page))].map((p) => [PAGE_NAMES[p], ...CONDS.map((c) => cell(tmIdle, p, c, "task_ms_per_s", f2))]))}

## 7. DOM への重複アクセス

この節だけは、Tampermonkey の代わりの軽いシムで測りました。Tampermonkey のスクリプトはページとは別の実行環境で動くので、ページ側で DOM API を包んでも呼び出しが見えないためです。DOM への操作の回数は、どの管理ソフトで動かしても変わりません。

${table(["ページ", "条件", "触った要素", "操作", "複数が触った要素", "複数が書いた要素", "同じ操作の繰り返し", "強制レイアウトの疑い"], dom.filter((r) => r.cond !== "A").map((r) => [r.page_name, r.cond_name, r.elements, r.ops, r.shared, r.shared_write, r.repeated, r.forced]))}

- 複数が触った要素: 2つ以上のスクリプト(CP Toolkit は機能)が取得・読み取り・書き換えした要素
- 同じ操作の繰り返し: 同じ要素に、同じスクリプトや機能が同じ種類の操作を2回目以降にした回数
- 強制レイアウトの疑い: DOM を書き換えた直後に、レイアウトを要する値を読んだ回数

## 8. 限界

- ページは AtCoder の公開ページ9つを計測の前に録画し、計測ではそれだけを返しました。提出一覧・順位表・提出画面はログインが要るので対象外です。提出まわりの機能(結果の平均、検索条件の保持など)は測れていません。
- Chrome 拡張(Statement Lens、comfortable-atcoder)は UserScript ではないので含めていません。
- クラウドなどの Linux 上の headless Chromium で測りました。絶対値より、条件の間の差を見てください。
- 表の数値は [reports/${VERSION}/](./${VERSION}/) の JSON にもあります。
`;
writeFileSync(join(BENCH, "reports", `${VERSION}.md`), md);
console.log(`書き出しました: reports/${VERSION}.md と reports/${VERSION}/`);
