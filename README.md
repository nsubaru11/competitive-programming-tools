# competitive-programming-tools

競技プログラミング向けの補助ツールを Bun ワークスペースで管理しています。

## ワークスペース構成

```text
competitive-programming-tools/
├── package.json          # workspaces: shared, local-runner, userscripts
├── bun.lock
├── tsconfig.base.json
├── shared/               # @atcoder-tools/shared
├── userscripts/          # @atcoder-tools/userscripts
└── local-runner/        # @atcoder-tools/runner
```

## shared

runner と userscripts の両方が使うコードです。詳細は [shared/README.md](./shared/README.md) を参照してください。

主なモジュール:

- AtCoder URL・提出一覧クエリ (`atcoder-url.ts`)
- Local Runner API 型とリクエスト (`local-runner.ts`)
- Easy Test 互換ジャッジ (`easy-test-judge.ts`)
- Java ソース変換 (`java-transform.ts`)
- JSON 設定の読み込み (`json.ts`)

```ts
import {parseAtCoderTaskUrl, evaluateEasyTestOutput} from "@atcoder-tools/shared";
```

## userscripts

TypeScript で開発し、Bun で Tampermonkey 用の単一 `.user.js`
にバンドルします。詳細は [userscripts/README.md](./userscripts/README.md) を参照してください。

```powershell
cd competitive-programming-tools
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts watch
```

## runner

サンプルケースのローカル実行 (`test`) と提出 (`submit`) を行う CLI と、常駐 Local Runner HTTP サーバーです。詳細は [local-runner/README.md](./local-runner/README.md) を参照してください。

```powershell
cd competitive-programming-tools
bun run --cwd local-runner typecheck
bun run --cwd local-runner test abc001_a A.java
```

## TypeScript の方針

- パッケージマネージャは **Bun**（`competitive-programming-tools/bun.lock`）
- `@ts-nocheck` / `@ts-ignore` は使わない
- 共通設定は `tsconfig.base.json`
- `userscripts/dist/*.user.js` は生成物。`src/main.ts` を編集して再ビルドする

## 変更後の確認

```powershell
cd competitive-programming-tools
bun install
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd local-runner typecheck
```

## ライセンス

本リポジトリの内容は、[0BSD（Zero-Clause BSD）](./LICENSE)で提供します。第三者のスクリプトを改変した UserScript は元のライセンスに従います。対象と条件は [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) を参照してください。
