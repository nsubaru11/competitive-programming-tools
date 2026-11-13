# shared

`local-runner` と `userscripts` の両方から使う TypeScript 共通ライブラリです。ワークスペース名は `@atcoder-tools/shared` です。

## モジュール一覧

| ファイル             | 内容                                                                                         |
|----------------------|----------------------------------------------------------------------------------------------|
| `atcoder-url.ts`     | 問題 URL の解析・生成、提出一覧 URL、提出詳細 URL                                            |
| `local-runner.ts`    | Local Runner HTTP API の型、`isStaleProgramResponse`、`toEasyTestStatus`                     |
| `easy-test-judge.ts` | Easy Test 互換の出力比較（trim / split / 誤差許容）                                          |
| `java-transform.ts`  | Local Runner がないときの Java ソースの字句変換、`lib.*` を使うかの判定（`usesJavaLibrary`） |
| `json.ts`            | `safeJsonParse`、`parseStoredObject`                                                         |
| `query.ts`           | `buildQueryString`                                                                           |
| `utils.ts`           | `normalizeNewlines`                                                                          |
| `async.ts`           | `sleep`                                                                                      |
| `types.ts`           | `AtCoderTaskId` など                                                                         |

## 利用例

```ts
import {
	parseAtCoderTaskUrl,
	buildAtCoderSubmissionsQuery,
	isStaleProgramResponse,
	evaluateEasyTestOutput,
	modifyJavaCode,
	parseStoredObject,
} from "@atcoder-tools/shared";
```

## 設計方針

- **ここに置くもの**: Local Runner と userscript の両方が必要とするロジック（URL、ジャッジ、Local Runner プロトコル、Java 変換、設定 JSON）
- **ここに置かないもの**: DOM 操作、Tampermonkey UI、CLI のログ表示、JVM 常駐プロセスなど環境依存の処理

`userscripts` のビルドでは Bun の alias `@shared` でこのパッケージをバンドルします。`local-runner` は workspace 依存として import します。`userscripts/CpToolkit` はプロジェクト参照で利用するので、`tsconfig.json` の `composite` は外さないでください。
