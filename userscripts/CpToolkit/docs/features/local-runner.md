# Local Runner との連携

[機能一覧へ戻る](../../README.md#4-機能一覧) ・ [English](local-runner.en.md)

> Easy Test+ と提出補助で使うサーバーの接続先を設定します。

## 使い方

- [Easy Test+](easy-test.md) での実行と、[提出補助](submission-helper.md) での提出用の変換、[コードのヘッダーとフッター](source-comments.md) での提出用のヘッダーに使う共通設定です。
- 接続先には、自分のサーバーの URL を指定します。[Local Runner](../../../../local-runner/README.md) か、同じ API に対応するサーバーを使えます。Local Runner は別途導入が必要です。
- 手元で Local Runner を既定の設定で起動した場合は、接続先に `http://localhost:8080` を使います。

Easy Test+ の実行は Local Runner 1.x でも使えます。提出補助の変換と、ヘッダーの取得には 2.0.0 以降が必要です。

## 詳細設定

設定画面でこの機能の「詳細設定」を開きます。

| 項目         | 既定値                  |
|--------------|-------------------------|
| 接続先の URL | `http://localhost:8080` |

## 自作のサーバーに必要な API

- 詳細設定の URL へ、JSON の本文で `POST` します。応答も JSON で、HTTP のステータスは 200 番台で返します。
- 要求の `mode` で処理を分けます。Easy Test+ だけを使うなら `list`、`precompile`、`run` の3つで足ります。

| `mode`       | 使う機能                   | 要求の項目                                                                      | 応答                                                                                                                                                                                               |
|--------------|----------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `list`       | Easy Test+                 | なし                                                                            | `{language, compilerName, label}` の配列。`language` は言語名（例：`Java`、`C++`、`Python`）で、提出言語と同じ系統のものが実行環境の候補になります。`label` は画面に出す名前です。                 |
| `precompile` | Easy Test+                 | `sourceCode`、`compilerName`、`debug`                                           | `{status: "accepted"}`。要求を受け付けたら返し、バックグラウンドでコンパイルします。                                                                                                               |
| `run`        | Easy Test+                 | `sourceCode`、`stdin`、`compilerName`、`debug`                                  | `status`、`exitCode`、`stdout`、`stderr`、`time`（ミリ秒）、`memory`（累積の割り当て量。KB。0 なら表示しません）、`peakMemory`（任意。使用量の最大値。KB）、`lineOffset`（任意。変換で増えた行数） |
| `transform`  | 提出補助                   | `sourceCode`、`compilerName`、`header: false`、`debug: false`、`validate: true` | `status`（`success` または `compileError`）、`sourceCode`、`diagnostics`、`diagnosticItems`、`inlinedClasses`。import の診断には `importName` を含められます。                                     |
| `status`     | 提出補助・ヘッダー         | なし                                                                            | `{status: "running", version: "2.0.0"}`。実行中のサーバーのバージョンを返します。                                                                                                                  |
| `header`     | コードのヘッダーとフッター | `compilerName`、`header`                                                        | `{status: "success", header}`。`header` は提出物に付けるヘッダーの文で、無ければ `null` です。要求の `header` は、`true` なら言語の既定、文字列ならその名前のヘッダーです。                        |

- `compilerName` は `list` で返した値です。複数の言語を扱うサーバーは、これで言語を選びます。
- `list` の各要素には、任意で `family` と `match` を付けられます。
    - `family` は言語の種類の ID（`cpp`、`python3`、`java` など）です。あれば、`language` からの判定の代わりに使います。
    - `match` は語の配列です。同じ種類の実行環境が複数あるとき、ページの言語の表記にその語を含むものを先頭にし、残りは `list` の順に並べます。たとえば PyPy の実行環境に `["PyPy"]` を付けると、PyPy のページで先に選ばれます。
- メモリは、`peakMemory` があれば使用量として、`memory` があれば累積の割り当て量として表示します。
- `lineOffset` の `header` と `transform` の和が 0 でなければ、エラーの欄に、エディタの行よりずれている行数を表示します。`transform` が `null`(bundle を通したか、Java の字句を読み切れず分からない)なら表示しません。コンパイルエラーの応答にも付けます。
- `run` の `status` は `success`、`compileError`、`timeLimitExceeded`、`runtimeError`、`internalError`、`badRequest` のいずれかです。
- `run` は、そのソースのコンパイルが終わるのを待ってから実行します。コンパイルエラーなら、`status` を `compileError`、`stderr` をエラーの内容にして返してください。
- Easy Test+ は最後の編集から約180 ms 後に `precompile` を送ります。応答を待つ間は CP Toolkit のほかの要求も止まるので、コンパイルを待たずに返してください。同じソースの `run` が来たら、その結果を使えます。
- `run` もコンパイルを待つ間に、ほかの要求を止めます。待つ前に応答のヘッダーだけを先に返すと、止めずに済みます。

詳しい型は [local-runner.ts](https://github.com/nsubaru11/competitive-programming-tools/blob/main/shared/src/local-runner.ts) にあります。

## 動くページ

- コンテストのページ
- Codeforces
- yukicoder の問題ページ
- AOJ
- Library Checker
- paiza
