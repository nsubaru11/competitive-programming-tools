# userscripts

競技プログラミング向けの UserScript を TypeScript で開発し、[Tampermonkey](https://www.tampermonkey.net/) 向けに配布します。

## 開発の流れ

1. `tools/userscripts/<ScriptName>/src/main.ts` を編集する（必要なら `@atcoder-tools/shared` を import）
2. `meta.json` で UserScript ヘッダ（`@match` など）を定義する
3. `bun run build` で `dist/<ScriptName>.user.js` を生成する
4. Tampermonkey に `dist/*.user.js` の URL を登録する

ソースは複数モジュール・shared 利用で問題ありません。配布物だけが 1 ファイルの `.user.js` になります。

`build` は `scripts/format-output.ts` で配布物をソースと同じ書式に整形します。IDE で整形し直す必要はありません。配布物の先頭の `@formatter:off` が、IDE の整形の対象から外します。

機能の追加と変更は CP Toolkit で行います。手順は [CpToolkit/README.md](./CpToolkit/README.md) を参照してください。

```text
<ScriptName>/
├── meta.json
├── src/main.ts
└── dist/<ScriptName>.user.js   # 生成物（直接編集しない）
```

## コマンド

```powershell
cd tools
bun install
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
bun run --cwd userscripts watch
```

特定スクリプトのみビルド:

```powershell
bun run --cwd userscripts ./build.ts CpToolkit
```

## 型定義

- `types/userscript.d.ts` … `GM_*`、`unsafeWindow`、AtCoder ページ向け Window 拡張
- `tsconfig.json` … `**/src/**/*.ts` と `build.ts` を型チェック (`CpToolkit` は層ごとの `tsconfig.json` で検査)

## スクリプト一覧

### CP Toolkit

競技プログラミングの補助機能を1本にまとめ、機能ごとに ON/OFF できるスクリプトです。機能の一覧と構成は [CpToolkit/README.md](./CpToolkit/README.md) を参照してください。

- [インストール](https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js)
- ローカル実行: [local-runner/README.md](../local-runner/README.md)

### 更新を終了したスクリプト

次の8本は CP Toolkit へ統合しました。今後は更新しません。

| スクリプト                         | CP Toolkit の機能        |
|------------------------------------|--------------------------|
| AtCoder Custom Default Submissions | 提出一覧の既定の絞り込み |
| AtCoder Easy Test for Java         | Easy Test、Local Runner  |
| AtCoder Highlighter                | 問題文の強調表示         |
| AtCoder Listing Tasks              | 問題のドロップダウン     |
| AtCoder Markdown Copier            | 問題文のコピー           |
| AtCoder Performance Overlay        | パフォーマンスのグラフ   |
| AtCoder Widen Container            | ページ幅の拡張           |
| Java Code Submitter                | Java の提出補助          |

利用中の環境へ最終版が届くまでの間だけフォルダを残し、その後に削除します。

最終版は `build.ts` の `RETIRED_SCRIPTS` に載せたスクリプトの先頭へ `retirement.js` を埋め込んだものです。

- ページの `data-cp-toolkit` の印で CP Toolkit の動作を判定し、動いていれば本体を実行しない
- 動いていなければ本体を今までどおり実行し、CP Toolkit への移行を1回だけ案内する
- `RETIRED_SCRIPTS` に書いた設定をサイトの `localStorage` の `cp-toolkit:legacy:<スクリプト名>` へ書き出す。スクリプトごとの保存領域は CP Toolkit から読めないため
- CP Toolkit は起動時にこれを読み、設定へ取り込んで受け渡し場所を空にする

## 使い方（利用者向け）

1. Tampermonkey をインストールする
2. ブラウザで「サイトが JavaScript を使用できるようにする」を有効にする
3. 上記インストールリンクからスクリプトを追加する

## shared との関係

CP Toolkit は `@atcoder-tools/shared` の Local Runner API、ジャッジ、提出一覧クエリ、Java 変換を使います。これらは runner CLI と共通です。
