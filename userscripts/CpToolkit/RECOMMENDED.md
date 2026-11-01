# 併用するスクリプト

CP Toolkit に統合していないスクリプトと、外すべきスクリプトの一覧です。作者とライセンスは Greasy Fork の表記です(2026-11-01 に確認)。統合した機能の出典は [SOURCES.md](./SOURCES.md) を参照してください。

## 単独で入れるもの

次のスクリプトは CP Toolkit に統合しません。必要なら、それぞれ単独で入れてください。

| スクリプト                                                                       | 作者      | ライセンス | 役割                                 | 単独で入れる理由                                               |
|----------------------------------------------------------------------------------|-----------|------------|--------------------------------------|----------------------------------------------------------------|
| [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152)                    | magurofly | MIT        | 全言語のサンプル実行                 | CP Toolkit の Easy Test は Java 向けで、置き換えるものではない |
| [ac-predictor](https://greasyfork.org/scripts/369954)                            | keymoon   | MIT        | コンテスト中のパフォーマンスの予測   | 更新が盛んで、サイトの変更への追従が欠かせない                 |
| [AtCoderStandingsAnalysis](https://greasyfork.org/scripts/398439)                | RTnF      | CC0-1.0    | 順位表の集計                         | 順位表のデータに強く依存し、機能も大きい                       |
| [atcoder-standings-difficulty-analyzer](https://greasyfork.org/scripts/419541)   | iilj      | MIT        | 順位表からの難易度の推定             | 順位表のデータに強く依存し、機能も大きい                       |
| [atcoder-difficulty-display](https://greasyfork.org/scripts/397185)              | hotarunw  | MIT        | 問題の難易度の表示                   | 更新が盛んで、外部のデータにも依存する                         |

AtCoder Easy Test v2 と CP Toolkit の Easy Test を同時に有効にすると、ボタンが重なります。Java だけを使うときは CP Toolkit の Easy Test を設定で有効にし、ほかの言語も使うときは AtCoder Easy Test v2 を入れて、どちらか片方を使ってください。

## 必要に応じて入れるもの

| スクリプト                                                                                        | 作者       | ライセンス | 役割                                     |
|---------------------------------------------------------------------------------------------------|------------|------------|------------------------------------------|
| [ac-revisit](https://greasyfork.org/scripts/576017)                                               | yiwiy9     | MIT        | 復習する問題の登録と、今日の一問の提案   |
| [AtCoder Duplicate Checker](https://greasyfork.org/scripts/454704)                                | Raclamusi  | MIT        | 同じコードの重複提出の検出               |
| [AtCoder Template](https://greasyfork.org/scripts/438105)                                         | magurofly  | CC0-1.0    | 言語ごとのコードのテンプレート           |
| [AtCoder Code Template](https://greasyfork.org/scripts/584183)                                    | kirameku   | MIT        | 名前付きのコードのテンプレート           |
| [AtCoder Submission User Colorizer](https://greasyfork.org/scripts/397710)                        | morioprog  | CC0        | 提出一覧のユーザー名の色付け             |
| [Disable Google AI Search & Hide Button (for AtCoder)](https://greasyfork.org/scripts/549396)     | ぱるま     | MIT        | コンテスト中の Google の AI 検索の無効化 |

ソースコードのコメントの機能はコードの先頭と末尾への追記だけを行うので、コードの本体を入れるテンプレートのスクリプトとは役割が異なります。

## 外すもの

次のスクリプトは CP Toolkit と機能が重なり、同時に入れると二重に動きます。CP Toolkit を入れたら無効にしてください。

| スクリプト                                    | CP Toolkit の機能            |
|-----------------------------------------------|------------------------------|
| Add a link to the AtCoder contest description | トップページのコンテスト一覧 |
| AtCoder Efficient Layout                      | サンプルの横並び             |
| Atcoder Easy Accordion                        | メニューのホバー表示         |
| AtCoder Question Copier                       | 問題文のコピー               |
| AtCoder Search Query Holder                   | 検索条件の保持               |
| AtCoder Submission Timer                      | 時間指定の提出               |
| AtCoderAverageResult                          | 実行結果の平均               |
| AtCoderPerformanceColorizer                   | 成績表の色付け               |
| AtCoderResultNotifier                         | 提出結果の通知               |
| Paiza Language Selector                       | paiza の言語選択             |
| tessoku_display_difficulty                    | 鉄則本の難易度表示           |
| View All Editorials                           | 解説の一覧表示               |

nsubaru の旧スクリプト8本は最終版へ更新すれば、CP Toolkit が動いている間は本体を実行しません。
