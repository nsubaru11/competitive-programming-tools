# 開発

このリポジトリのツールを変更する人向けの文書です。使い方は [README.md](../README.md) にあります。

## 構成

Bun のワークスペースで管理しています。

```text
competitive-programming-tools/
├── shared/         # Local Runner と CP Toolkit の共通コード
├── userscripts/    # UserScript
└── local-runner/   # CLI と Local Runner サーバー
```

| 対象         | 文書                                                                                                                                   |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------|
| CP Toolkit   | [userscripts/CpToolkit/DEVELOPMENT.md](../userscripts/CpToolkit/DEVELOPMENT.md)                                                        |
| UserScript   | [userscripts/README.md](../userscripts/README.md)                                                                                      |
| Local Runner | [local-runner/docs/DEVELOPMENT.md](../local-runner/docs/DEVELOPMENT.md)、[local-runner/java/README.md](../local-runner/java/README.md) |
| 共通コード   | [shared/README.md](../shared/README.md)                                                                                                |

## 方針

- パッケージマネージャは Bun。配布物は CI と同じ版(`.github/workflows` の `bun-version`)でビルドする。版が違うと出力が変わり、CI の配布物の検査が失敗する
- `@ts-nocheck` と `@ts-ignore` は使わない
- 型を消すだけで JS にならない構文(引数プロパティ、`enum`、`namespace`)は使わない。`tsconfig.base.json` の `erasableSyntaxOnly` で検査する
- 共通の設定は `tsconfig.base.json` に置く
- `userscripts/*/dist/*.user.js` は生成物なので、`src/` を編集して再ビルドする

## 変更後の確認

```powershell
bun install
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
bun run --cwd local-runner typecheck
```
