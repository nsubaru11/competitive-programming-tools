# CP Toolkit

競技プログラミングの補助機能を1本にまとめ、機能ごとに ON/OFF できるようにする UserScript です。既存の UserScript を順に移行しています。

## 使い方

Tampermonkey のメニューの「設定を開く」、または AtCoder のヘッダーの「CP Toolkit」から設定画面を開きます。

## 構成

責務ごとに層を分け、各層の中は機能名ではなく領域で分けます。依存は下の図の矢印の向きだけです。

```text
app ──► features ──► application ──► catalog ──► domain ──► shared
 │         └───────► ui
 └───► adapters ──► application
```

| 層 | 置くもの | 使える環境 API |
|---|---|---|
| `domain` | 判断と規則 | なし |
| `catalog` | YAML を読み込み、型を付けたデータ | なし |
| `application` | 手順とポート(外部とのインターフェース) | なし |
| `ui` | サイトと機能に依存しない部品 | DOM |
| `adapters` | ポートの実装。外部との接続 | DOM、`GM_*`、`unsafeWindow` |
| `features` | ON/OFF の単位。画面への配置とイベントの接続だけ | DOM |
| `app` | 起動と組み立て | DOM |

`application` と `domain` はタイマーも使えません。時間に関わる処理が必要になったらポートを追加します。

迷ったら次の基準で置き場所を決めます。

- 判断や計算は `domain`
- 手順は `application`
- 外部との接続は `adapters`
- 画面への配置は `features`

空の層は作りません。ページ幅の変更のように DOM だけで完結する機能は `features` で閉じます。

## 規則の検査

規則は文書ではなく検査で守ります。

| 規則 | 検査 |
|---|---|
| 層の依存方向 | `tsc -b`。各層の `tsconfig.json` の `references` にない層は import できない |
| 使える環境 API | `tsc -b`。層ごとの `lib` と `types` にない API は型エラーになる |
| YAML の形 | `tsc -b`。`catalog` で型に代入できなければ型エラーになる |
| 機能どうしの独立性 | `tests/architecture.test.ts` |
| YAML の内容 | `tests/data.test.ts`。正規表現の妥当性や ID の重複など |

## データ

人が管理する表はコードに書かず、次の順で考えます。

1. サイトや API から実行時に取れるなら、データとして持たない
2. 値だけが変わる表は `data/` の YAML に置く
3. 分岐を伴う処理は TypeScript に残す

CSS は `.css` に分けます。YAML と CSS はビルド時に JS へ同梱されるので、配布物は1ファイルのままです。

YAML の型は `scripts/gen-data-types.ts` が `<name>.d.yaml.ts` として生成します。`typecheck` と `test` が自動で実行し、生成物は Git に入れません。

`@match` は `data/judges/*.yaml` の `matches` から生成するので、`meta.json` には書きません。

## 機能の追加

1. `src/features/<機能名>/index.ts` で `defineFeature` を使って宣言する
2. 文言のキーを `data/i18n/ja.yaml` と `en.yaml` に追加する
3. 対象ページが新しければ `data/judges/*.yaml` の `routes` に追加する
4. `src/app/registry.ts` に登録する

設定画面は `options` の宣言から自動で生成します。

`start` が後始末の関数を返す機能は `live: true` を指定できます。ON/OFF と設定変更が再読み込みなしで反映されます。指定しない機能は再読み込みで反映します。

## コマンド

```powershell
cd tools
bun run --cwd userscripts typecheck
bun run --cwd userscripts build
bun run --cwd userscripts test
```

`test` は配布物も検査するので、先に `build` を実行します。
