# userscripts

UserScript の開発環境です。TypeScript で開発し、Bun で1ファイルの `.user.js` にまとめて、[Tampermonkey](https://www.tampermonkey.net/) 向けに配布します。

CP Toolkit を使うだけなら、[CpToolkit/README.md](./CpToolkit/README.md) を参照してください。

## 開発の流れ

1. `userscripts/<ScriptName>/src/main.ts` を編集する(必要なら `@atcoder-tools/shared` を import する)
2. `meta.json` で UserScript のヘッダー(`@match` など)を定義する
3. `bun run build` で `dist/<ScriptName>.user.js` を生成する
4. Tampermonkey に `dist/*.user.js` の URL を登録する

ソースは複数のモジュールに分け、`shared` を使っても構いません。配布物だけが1ファイルの `.user.js` になります。

`build` は `scripts/format-output.ts` で配布物をソースと同じ書式に整形します。IDE で整形し直す必要はありません。配布物の先頭の `@formatter:off` が、IDE の整形の対象から外します。

機能の追加と変更は CP Toolkit で行います。手順は [CpToolkit/DEVELOPMENT.md](./CpToolkit/DEVELOPMENT.md) を参照してください。

```text
<ScriptName>/
├── meta.json
├── src/main.ts
└── dist/<ScriptName>.user.js   # 生成物(直接編集しない)
```

## コマンド

リポジトリのルートで実行します。

```powershell
bun install
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
bun run --cwd userscripts watch
```

特定のスクリプトだけをビルドするときは、名前を指定します。

```powershell
bun run --cwd userscripts ./build.ts CpToolkit
```

## 型定義

- `types/userscript.d.ts`: `GM_*`、`unsafeWindow`、AtCoder のページ向けの Window の拡張
- `tsconfig.json`: `build.ts`、`scripts/`、`types/` を型チェックする(`CpToolkit` は層ごとの `tsconfig.json` で検査する)

## shared との関係

CP Toolkit は `@atcoder-tools/shared` の Local Runner API、ジャッジ、提出一覧のクエリ、Java の変換を使います。これらは Local Runner の CLI と共通です。

## 更新を終了したスクリプト

次の8本は CP Toolkit へ統合しました。今後は更新しません。最終版は [Release](https://github.com/nsubaru11/competitive-programming-tools/releases/tag/legacy-userscripts-final) から入手できます。利用者向けの手順は [旧スクリプトからの移行](./CpToolkit/README.md#旧スクリプトからの移行) にあります。

| スクリプト                         | CP Toolkit の機能                     |
|------------------------------------|---------------------------------------|
| AtCoder Custom Default Submissions | AC 提出へのボタン(既定の絞り込みは廃止) |
| AtCoder Easy Test for Java         | Easy Test、Local Runner               |
| AtCoder Highlighter                | 問題文の強調表示                      |
| AtCoder Listing Tasks              | 問題のドロップダウン                  |
| AtCoder Markdown Copier            | 問題文のコピー                        |
| AtCoder Performance Overlay        | ユーザーページのグラフへのパフォーマンス表示 |
| AtCoder Widen Container            | ページ幅の拡張                        |
| Java Code Submitter                | Java の提出補助                       |

別リポジトリの [Paiza Language Selector](https://github.com/nsubaru11/userscripts/blob/main/src/paiza-language-selector.user.js) も paiza の言語選択へ統合しました。

最終版は次のように動きます。

- ページの `data-cp-toolkit` の印で CP Toolkit の動作を判定し、動いていれば本体を実行しない
- 動いていなければ本体を今までどおり実行し、CP Toolkit への移行を1回だけ案内する
- 引き継ぐ設定をサイトの `localStorage` の `cp-toolkit:legacy:<スクリプト名>` へ書き出す。スクリプトごとの保存領域は CP Toolkit から読めないため
- CP Toolkit は起動時にこれを読み、設定へ取り込んで受け渡し場所を空にする
