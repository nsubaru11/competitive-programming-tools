# competitive-programming-tools

競技プログラミング向けの補助ツールです。

| ツール                                          | 内容                                                                      | 使い始める                                                                       |
|-------------------------------------------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [CP Toolkit](./userscripts/CpToolkit/README.md) | AtCoder などのページに補助機能を足す UserScript。機能ごとに ON/OFF できる | [Greasy Fork からインストール](https://greasyfork.org/scripts/603262-cp-toolkit) |
| [Local Runner](./local-runner/README.md)        | Java、C++、C、Python の解答を手元で実行、判定、提出する CLI とサーバー    | [セットアップ](./local-runner/README.md#セットアップ)                            |

CP Toolkit だけなら、インストールするだけで使えます。Local Runner は Java のライブラリの展開や、問題ページからの手元での実行に使います。

不具合や要望は [Issue](https://github.com/nsubaru11/competitive-programming-tools/issues) へお寄せください。

## 開発

開発には Claude Opus 5.5 を使用しました。設計と仕様は作者が決めています。

Bun のワークスペースで管理しています。

```text
competitive-programming-tools/
├── shared/         # Local Runner と CP Toolkit の共通コード
├── userscripts/    # UserScript
└── local-runner/   # CLI と Local Runner サーバー
```

| 対象         | 文書                                                                                                                       |
|--------------|----------------------------------------------------------------------------------------------------------------------------|
| CP Toolkit   | [userscripts/CpToolkit/DEVELOPMENT.md](./userscripts/CpToolkit/DEVELOPMENT.md)                                             |
| UserScript   | [userscripts/README.md](./userscripts/README.md)                                                                           |
| Local Runner | [local-runner/DEVELOPMENT.md](./local-runner/DEVELOPMENT.md)、[local-runner/java/README.md](./local-runner/java/README.md) |
| 共通コード   | [shared/README.md](./shared/README.md)                                                                                     |

### 方針

- パッケージマネージャは Bun。配布物は CI と同じ版(`.github/workflows` の `bun-version`)でビルドする。版が違うと出力が変わり、CI の配布物の検査が失敗する
- `@ts-nocheck` と `@ts-ignore` は使わない
- 型を消すだけで JS にならない構文(引数プロパティ、`enum`、`namespace`)は使わない。`tsconfig.base.json` の `erasableSyntaxOnly` で検査する
- 共通の設定は `tsconfig.base.json` に置く
- `userscripts/*/dist/*.user.js` は生成物なので、`src/` を編集して再ビルドする

### 変更後の確認

```powershell
bun install
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
bun run --cwd local-runner typecheck
```

## ライセンス

本リポジトリの内容は、[0BSD(Zero-Clause BSD)](./LICENSE)で提供します。第三者のスクリプトを改変した UserScript は元のライセンスに従います。対象と条件は [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) を参照してください。
