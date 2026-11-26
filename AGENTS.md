# AGENTS.md

## リポジトリの概要

- 解答を手元で実行・判定・提出する Local Runner と、ジャッジサイトの補助機能を足す UserScript（CP Toolkit）のソースを管理する。
- Bun のワークスペースは `shared/`（共通コード）、`local-runner/`（CLI とサーバー）、`userscripts/`（UserScript）に分かれる。
- 開発の入口は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。CP Toolkit は [userscripts/CpToolkit/DEVELOPMENT.md](userscripts/CpToolkit/DEVELOPMENT.md)、Local Runner は [local-runner/docs/DEVELOPMENT.md](local-runner/docs/DEVELOPMENT.md) を読む。
- このリポジトリ単独でビルドとテストができる。

## 守ること

- 開発の方針（配布物は生成物で直接編集しない、`erasableSyntaxOnly`、`@ts-ignore` を使わない、Bun のバージョン）は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) の「方針」に従う。
- 配布物が変わる変更では、`userscripts/CpToolkit/meta.json` の `version` を上げる。版番号と同じコミットで変更履歴を更新する。[DEVELOPMENT.md](userscripts/CpToolkit/DEVELOPMENT.md) の「版の付け方」と「変更履歴の書き方」に従う。文書、テスト、画像だけの変更では上げない。
- パッケージの導入・更新は、利用者と合意してから行う。
- `SCRIPT_NAMESPACE`（`userscripts/build.ts`）は旧名の `atcoder-java-tools` のまま変えない。変えると、インストール済みの UserScript が別物として扱われる。

## 文書の書き方

- 利用者向けの説明と操作手順は「です・ます」で書き、AI 向けの指示は「〜する」「〜しない」で書く。見出しや項目名には名詞を使える。
- 同じ箇条書きでは項目の形をそろえる。文には句点を付け、短い名称には付けない。理由や条件が続く説明は段落にまとめ、操作の順番には番号を付ける。
- 概要には要点を書き、設定や例外の詳細は該当ページへ相対リンクで案内する。

## 検証

変更した場所に合うものだけを実行する。時間のかかるビルドや全件の実行は、頼まれたときだけ行う。

| 変更した場所 | コマンド                                                                                |
|--------------|-----------------------------------------------------------------------------------------|
| TypeScript   | `bun run typecheck:userscripts`、`bun run typecheck:runner`、`bun run typecheck:shared` |
| UserScript   | `bun run build:userscripts` のあと `bun run test:userscripts`                           |
| Local Runner | `bun run test:runner`（JDK 24 の `javac` が PATH に必要）                               |

- フォルダを指定するときは `bun run --cwd <フォルダ> <スクリプト>` と書く。`bun --cwd <フォルダ> run <スクリプト>` は何も実行せずに正常終了する。
- 配布物の一致検査（CI）は、`.github/workflows` の `bun-version` の Bun でビルドした出力と比べる。手元のバージョンが違うときは `bunx --bun bun@<bun-version> run build:userscripts` でビルドする。
- `node_modules` は消さない。消えたら `bun install` で戻す。

## Git

- 公開リポジトリなので、コミットの前に、差分にセッション、パスワード、トークン、メールアドレスがないか確かめる。
- コミットメッセージは日本語で `feat:`・`fix:`・`perf:`・`refactor:`・`docs:`・`chore:` を付ける。CP Toolkit や Local Runner のバージョンを上げたときは、「1.2.0 にする」のように書く。
- push は頼まれたときだけ行う。force push はせず、push 済みの履歴は書き換えない。
