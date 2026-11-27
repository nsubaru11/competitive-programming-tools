#!/usr/bin/env bash
# 性能の計測の準備。最初に1回だけ実行する(手順は README.md)。
#   ./setup.sh                          準備する
#   ./setup.sh --refresh-tampermonkey   Tampermonkey を取得し直す
set -euo pipefail
cd "$(dirname "$0")"

need() { command -v "$1" >/dev/null 2>&1 || { echo "$1 が見つかりません。$2" >&2; exit 1; }; }
need node "Node.js 20 以上を入れてください。"
need npm "Node.js に付属の npm が必要です。"
need git "git が必要です。"
need bun "Bun が必要です(CP Toolkit のビルドに使います)。リポジトリの docs/DEVELOPMENT.md を参照してください。"
need unzip "unzip が必要です(Tampermonkey の展開に使います)。"
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) { console.error("Node.js 20 以上が必要です(今は " + process.version + ")"); process.exit(1); }'

echo "== Playwright と Chromium(bench/node_modules に入れる。リポジトリの依存関係には足さない)"
npm ci --no-audit --no-fund
# Tampermonkey を読み込むには、headless shell ではない Chromium が必要
npx playwright install chromium

echo "== 旧スクリプトと Tampermonkey"
node harness/setup.mjs "$@"

echo
echo "準備ができました。計測は ./run.sh で始めます(README.md を参照)。"
