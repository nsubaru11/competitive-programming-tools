# CP Toolkit の開発

CP Toolkit を変更する人向けの文書です。利用者向けの説明は [README.md](./README.md) にあります。

## 文書の分担

| 文書                                    | 読者   | 内容                                                       |
|-----------------------------------------|--------|------------------------------------------------------------|
| [README.md](./README.md)                | 利用者 | 導入、機能、通信、移行。Greasy Fork の説明文を兼ねる       |
| [README.en.md](./README.en.md)          | 利用者 | README の英語版。Greasy Fork の英語の説明文を兼ねる        |
| [COMPATIBILITY.md](./COMPATIBILITY.md)  | 利用者 | 併用できるスクリプトと、併用を推奨しないスクリプト         |
| [SOURCES.md](./SOURCES.md)              | 全員   | 各機能の出典                                               |
| この文書                                | 開発者 | 構成、規則、内部の仕様、判断の記録                         |

README は GitHub 以外でも読まれるので、リンクは絶対 URL で書き、表は使いません。機能を変えたら README、README.en、設定画面の文言(`data/i18n/`)を揃えます。同じ機能を持つスクリプトが見つかったら COMPATIBILITY に追加します。

## 公開の手順

1. `meta.json` の `version` を上げる
2. `bun run --cwd userscripts build` で配布物を作る
3. `main` へ push する。Greasy Fork は `dist/CpToolkit.user.js` の raw URL から同期する

説明文は配布物とは別に同期します。Greasy Fork の設定に README の raw URL を指定するか、README の変更を貼り付けます。

## 構成

責務ごとに層を分け、各層の中は機能名ではなく領域で分けます。依存は下の図の矢印の向きだけです。

```text
app ──► features ──► application ──► catalog ──► domain ──► shared
 │         └───────► ui
 └───► adapters ──► application
```

| 層            | 置くもの                                        | 使える環境 API              |
|---------------|-------------------------------------------------|-----------------------------|
| `domain`      | 判断と規則                                      | なし                        |
| `catalog`     | YAML を読み込み、型を付けたデータ               | なし                        |
| `application` | 手順とポート(外部とのインターフェース)          | なし                        |
| `ui`          | サイトと機能に依存しない部品                    | DOM                         |
| `adapters`    | ポートの実装。外部との接続                      | DOM、`GM_*`、`unsafeWindow` |
| `features`    | ON/OFF の単位。画面への配置とイベントの接続だけ | DOM                         |
| `app`         | 起動と組み立て                                  | DOM                         |

`application` と `domain` はタイマーも使えません。時間に関わる処理が必要になったらポートを追加します。

迷ったら次の基準で置き場所を決めます。

- 判断や計算は `domain`
- 手順は `application`
- 外部との接続は `adapters`
- 画面への配置は `features`

空の層は作りません。ページ幅の変更のように DOM だけで完結する機能は `features` で閉じます。

## 規則の検査

規則は文書ではなく検査で守ります。

| 規則                   | 検査                                                                                                        |
|------------------------|-------------------------------------------------------------------------------------------------------------|
| 層の依存方向           | `tsc -b`。各層の `tsconfig.json` の `references` にない層は import できない                                 |
| 使える環境 API         | `tsc -b`。層ごとの `lib` と `types` にない API は型エラーになる                                             |
| YAML の形              | `tsc -b`。`catalog` で型に代入できなければ型エラーになる                                                    |
| 型を消せば JS になる   | `tsc -b`。`erasableSyntaxOnly` により、引数プロパティ、`enum`、`namespace` は型エラーになる                 |
| 機能どうしの独立性     | `tests/architecture.test.ts`                                                                                |
| 文字列を HTML にしない | `tests/architecture.test.ts`。`innerHTML`、`insertAdjacentHTML`、`eval`、文字列の `setTimeout` などを禁じる |
| YAML の内容            | `tests/data.test.ts`。正規表現の妥当性や ID の重複、外部ファイルの版の固定と integrity など                 |

## データ

人が管理する表はコードに書かず、次の順で考えます。

1. サイトや API から実行時に取れるなら、データとして持たない
2. 値だけが変わる表は `data/` の YAML に置く
3. 分岐を伴う処理は TypeScript に残す

CSS は `.css` に分けます。YAML と CSS はビルド時に JS へ同梱されるので、配布物は1ファイルのままです。

YAML の型は `scripts/gen-data-types.ts` が `<name>.d.yaml.ts` として生成します。`typecheck` と `test` が自動で実行し、生成物は Git に入れません。

機能が記憶する値は、以前の版が書いた形のまま残ることがあります。`KeyValueStore` の値はキャストせず、`readStored` と `domain/validation/guards.ts` で形を確かめて読みます。

`@match` は `data/judges/*.yaml` の `matches` から、`@connect` は `data/runners.yaml` の `connect` から生成するので、`meta.json` には書きません。

コメントの書き方は `data/languages.yaml` にあります。

`data/tessoku.yaml` の難易度は「競技プログラミングの鉄則」の書籍を出典とします。第三者のスクリプトから写したものではありません。

## 機能の追加

1. `src/features/<機能名>/index.ts` で `defineFeature` を使って宣言する
2. 文言のキーを `data/i18n/ja.yaml` と `en.yaml` に追加する
3. 対象ページが新しければ `data/judges/*.yaml` の `routes` に追加する
4. `src/app/registry.ts` に登録する

貼り付けたコードを加工する機能は、`editor.onPaste` ではなく `paste.add` に登録します。加工の順番が結果に影響するので、`order` の小さいものから順に実行します。

設定画面は `options` の宣言から自動で生成します。

`phase: "ready"` の機能は、サイト自身の `DOMContentLoaded` の処理が終わってから起動します。AtCoder はこの時点で問題文の Copy ボタンや数式の描画を行うので、それより前に DOM を変えないようにします。

`start` が後始末の関数を返す機能は `live: true` を指定できます。ON/OFF と設定変更が再読み込みなしで反映されます。指定しない機能は再読み込みで反映します。

## 内部の仕様

### 判定と Clar の確認

- 提出の直後に一覧のページが開いた時点で最初の確認を行い、以降はサイトが返す `Interval` の間隔で確認する。下限は1秒
- 確認の周期は Web Worker のタイマーで作る。ブラウザが背景のタブのタイマーを間引いても遅れない
- 別のアプリを操作していても確認を止めない。提出から30分で打ち切る
- 確認に失敗すると待ち時間を5秒から倍にしていき、最長で1分にする
- 確認は1つのタブだけが行う。操作中のタブがあれば、そのタブが確認する
- Clar の確認はサイトと同じ1分間隔

### 通信

`SameOriginHttpClient` は表示中のサイトにしか送りません。外部のサービスは `data/runners.yaml` の `external` に書き、利用者が選んだときだけ使います。内部エラーで次の候補へ切り替わるときも、`external` の実行環境は選びません。

ページの文脈で動くライブラリ(KaTeX、Prettify、Pyodide)は `data/libraries.yaml` と `data/runners.yaml` に置き、npm の版番号か GitHub のコミットの SHA で固定して、integrity で検証します。読み込んだ先でさらに別のファイルを検証なしで読むもの(Prettify の `run_prettify.js` など)は使いません。Pyodide は AtCoder と同じ Python の版の系列から選びます。

### ソースコードのコメント

- Java の変換があるときは、その後に追記する
- 複数行コメントがない言語や、閉じる記号を含む文字列では単一行コメントで書く
- シェバンのある言語と PHP の `<?php` では、その行の後ろにヘッダーを置く。PHP の `?>` で終わるコードでは、その前にフッターを置く

### Java の変換

`lib.*` の展開は Java Compiler API で構文を解析し、使っている部分だけを取り込む処理です。ブラウザの字句の置換では正しく再現できないので、代わりの処理は持ちません。

### Easy Test

画面は Shadow DOM の中に作り、ページの `window` には何も公開しません。Codeforces には Bootstrap を読み込みません。

### 旧スクリプトとの違い

Local Runner の既定の URL は `http://localhost:8080` です。利用者に影響する違いは README に書きます。引き継ぎの仕組みは [userscripts/README.md](../README.md#更新を終了したスクリプト) にあります。

## サイトの仕様

次の機能は AtCoder のページが使う仕組みに合わせています。

| 機能               | 参照したもの                                                                            |
|--------------------|-----------------------------------------------------------------------------------------|
| 言語のボタン       | コンテストのページの言語の処理(`#select-lang select.current`、`defaultLang` の記憶)     |
| 提出結果の通知     | コンテストのページの判定待ちの処理(`submissions/me/status/json` と応答の `Interval`)    |
| Clar の通知        | コンテストのページの Clar の処理(`clarifications/count`、1分の間隔、開始直後を避ける)   |
| 問題の提出状況     | 自分の得点のページ(`/contests/<id>/score`)                                              |
| バーチャル参加     | 参加のページの開始時刻(`#main-container time.fixtime-second`)、ページの `getServerTime` |
| 問題の提出状況の色 | AtCoder Problems の表の配色に近い、Bootstrap の `#c3e6cb` と `#f5c6cb`                  |

## 統合しないスクリプト

更新が盛んなもの、サイトやデータの変更への追従が欠かせないものは統合しません。

| スクリプト                                                                     | 理由                                                           |
|--------------------------------------------------------------------------------|----------------------------------------------------------------|
| [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152)                  | CP Toolkit の Easy Test は Java 向けで、置き換えるものではない |
| [ac-predictor](https://greasyfork.org/scripts/369954)                          | 更新が盛んで、サイトの変更への追従が欠かせない                 |
| [atcoder-difficulty-display](https://greasyfork.org/scripts/397185)            | 更新が盛んで、外部のデータにも依存する                         |
| [AtCoderStandingsAnalysis](https://greasyfork.org/scripts/398439)              | 順位表のデータに強く依存し、機能も大きい                       |
| [atcoder-standings-difficulty-analyzer](https://greasyfork.org/scripts/419541) | 順位表のデータに強く依存し、機能も大きい                       |
| AtCoder History Exporter                                                       | 導入しない                                                     |
| AtCoder Problems Advanced Summary Exporter                                     | 導入しない                                                     |

## コマンド

リポジトリのルートで実行します。

```powershell
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
```

`test` は配布物も検査するので、先に `build` を実行します。
