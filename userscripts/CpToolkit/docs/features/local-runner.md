# Local Runner

[機能一覧へ戻る](../../README.md#4-機能一覧) ・ [English](local-runner.en.md)

> コードの変換と実行に使う、手元のサーバーへ接続します。別途、Local Runner の導入が必要です。同じ API を持つ自作のサーバーにも接続できます。

## 使い方

- 手元の PC で動くサーバーへ接続します。[Easy Test+](easy-test.md) での実行と、[Java の提出補助](java-submit.md)での変換に使います
- 専用の [Local Runner](https://github.com/nsubaru11/competitive-programming-tools/blob/main/local-runner/README.md) は Java に対応しています。別途導入が必要です
- **専用の Local Runner でなくても、下の API を満たす自作のサーバーを接続できます**。たとえば C++ や Python を手元で実行するサーバーを用意すれば、Easy Test+ でその言語を手元で実行できます
- 接続先の URL は詳細設定で変えられます。コードは手元の PC へ送るだけで、外部には送りません

## 詳細設定

設定画面の各機能の「詳細設定」で変えられます。

| 項目         | 既定値                  |
|--------------|-------------------------|
| 接続先の URL | `http://localhost:8080` |

## 自作のサーバーに必要な API

- 詳細設定の URL へ、JSON の本文で `POST` します。応答も JSON で、HTTP のステータスは 200 番台で返します
- CP Toolkit が通信を許可しているのは `localhost` と `127.0.0.1` だけです。サーバーは手元の PC で動かしてください
- 要求の `mode` で処理を分けます。Easy Test+ だけを使うなら `list`、`prepare`、`run` の3つで足ります

| `mode`      | 使う機能        | 要求の項目                           | 応答                                                                                                                                                                           |
|-------------|-----------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `list`      | Easy Test+      | なし                                 | `{language, compilerName, label}` の配列。`language` は言語名(例: `Java`、`C++`、`Python`)で、提出言語と同じ系統のものが実行環境の候補になります。`label` は画面に出す名前です |
| `prepare`   | Easy Test+      | `sourceCode`、`compilerName`         | `status`(`success` か `compileError`)、`programId`(成功したとき)、`diagnostics`(コンパイルエラーの内容)                                                                        |
| `run`       | Easy Test+      | `programId`、`stdin`、`compilerName` | `status`、`exitCode`、`stdout`、`stderr`、`time`(ミリ秒)、`memory`(KB。0 なら表示しません)                                                                                     |
| `transform` | Java の提出補助 | `sourceCode`、`header`               | `status`(`success` か `compileError`)、`sourceCode`(変換後のコード)、`diagnostics`、`libraryMissing`(任意)                                                                     |

- `compilerName` は `list` で返した値です。複数の言語を扱うサーバーは、これで言語を選びます
- `run` の `status` は `success`、`compileError`、`timeLimitExceeded`、`runtimeError`、`internalError`、`badRequest` のいずれかです
- `run` で `programId` のプログラムがもうないときは、`status` を `badRequest`、`stderr` を `Prepared program is unavailable:` で始めて返してください。CP Toolkit がコンパイルからやり直します
- `prepare` には `debug`、`autoImport`、`validate`、`header` も付きます。使わない項目は無視してかまいません

詳しい型は [local-runner.ts](https://github.com/nsubaru11/competitive-programming-tools/blob/main/shared/src/local-runner.ts) にあります。

## 動くページ

- コンテストのページ
- Codeforces
- yukicoder の問題ページ
- AOJ
- Library Checker
- paiza
