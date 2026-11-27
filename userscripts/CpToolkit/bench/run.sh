#!/usr/bin/env bash
# CP Toolkit の性能を、統合前の旧スクリプトと比べて計測し、reports/<版>.md を作る(手順は README.md)。
#   ./run.sh                 いま checkout しているコミットの CP Toolkit を測る
#   ./run.sh <コミット>      そのコミットの CP Toolkit を測る(例: 8e3a12e9 は 1.0.26)
#   ./run.sh --quick [...]   問題文ページだけを各1回測る動作確認(約20分)。レポートは作らない
# 所要時間は約3.5時間。途中で止めたときは、同じコマンドで最初からやり直す。
set -euo pipefail
cd "$(dirname "$0")"
BENCH=$(pwd)
WORK=${BENCH_WORK:-$BENCH/.work}
export BENCH_WORK=$WORK

QUICK=0
if [ "${1:-}" = "--quick" ]; then QUICK=1; shift; fi
REF=${1:-HEAD}

[ -d "$WORK/tm-ext" ] || { echo "先に ./setup.sh を実行してください。" >&2; exit 1; }
REPO=$(git rev-parse --show-toplevel)

echo "== 計測する CP Toolkit を用意する"
# 浅い clone ではコミットが手元にないことがあるので、そのコミットだけ取ってくる
if ! git -C "$REPO" cat-file -e "$REF^{commit}" 2>/dev/null; then
	git -C "$REPO" fetch --depth=1 origin "$REF"
	REF=FETCH_HEAD
fi
COMMIT=$(git -C "$REPO" rev-parse "$REF^{commit}")
SRC="$WORK/src/$COMMIT"
if [ ! -d "$SRC" ]; then
	git -C "$REPO" worktree add --detach "$SRC" "$COMMIT"
fi
# レポートには、CP Toolkit のコード(bench/ と文書を除く)を最後に変えたコミットを載せる。
# 計測用のブランチで測っても、本体のどのコミットのコードかが分かるようにするため
CODE_COMMIT=$(git -C "$REPO" log -1 --format=%H "$COMMIT" -- userscripts/CpToolkit ':(exclude)userscripts/CpToolkit/bench' ':(exclude)*.md' 2>/dev/null)
node harness/prepare-toolkit.mjs "$SRC" "${CODE_COMMIT:-$COMMIT}"
VERSION=$(node -p "require('$SRC/userscripts/CpToolkit/meta.json').version")
export BENCH_VERSION=$VERSION
OUT="$WORK/results/$VERSION"
[ "$QUICK" = 1 ] && OUT="$WORK/results/$VERSION-quick"
rm -rf "$OUT"
mkdir -p "$OUT"
echo "CP Toolkit $VERSION を測ります。生データ: $OUT"
cp "$WORK/toolkit/$VERSION/source.json" "$OUT/source.json"
node harness/env.mjs "$OUT"

if [ "$QUICK" = 1 ]; then
	PAGES=task; PLAN=cpu:1,memory:1,perf:1,idle:1; IDLE_PAGES=task; TRACE_N=1
else
	PAGES=top,contests,contest,tasks,task,editorial,user,history,tessoku
	PLAN=cpu:8,memory:5,perf:10,perf:6:4,idle:3; IDLE_PAGES=top,contest,task,user; TRACE_N=1
fi

echo "== AtCoder のページを録画する(計測ではこの録画だけを返す)"
node harness/measure.mjs --mode record --n 1 --pages "$PAGES" --out "$OUT/record.jsonl"

echo "== 実際の Tampermonkey で計測する(CPU、メモリ、ページ全体の処理時間、放置時)"
# ブラウザを起動し直すと Tampermonkey のスクリプトが動かなくなるので、全モードを1回の起動で続けて測る
node harness/tm-measure.mjs --crx "$WORK/tm-ext" --plan "$PLAN" --pages "$PAGES" --idle-pages "$IDLE_PAGES" --out "$OUT/tm"

echo "== DOM への重複アクセスを数える(この計測だけは Tampermonkey の代わりのシムで動かす)"
node harness/measure.mjs --mode trace --n "$TRACE_N" --pages "$PAGES" --conds A,B_own,C_own,B_all,C_eq --out "$OUT/trace.jsonl"

if [ "$QUICK" = 1 ]; then
	node harness/report.mjs --check "$OUT"
	echo "動作確認が終わりました。本番の計測は --quick を外して実行します。"
else
	node harness/report.mjs "$OUT"
	echo "レポート: $BENCH/reports/$VERSION.md"
fi
