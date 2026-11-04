# Easy Test+

[機能一覧へ戻る](../../README.md#4-機能一覧) ・ [English](easy-test.en.md)

> AtCoder Easy Test v2 をもとに、機能を加えたものです。問題ページからサンプルを実行して結果を確認します。Java では Local Runner で手元で実行でき、編集中のコードを事前にコンパイルします。AtCoder Easy Test v2 と同時に有効にするとボタンが重なるので、どちらか片方にしてください。

**この機能は既定で OFF です。設定画面で有効にしてください。**

![Easy Test+](../images/easy-test.png)

## 使い方

- [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152) をもとに、機能を加えたものです
- 問題ページから、サンプルの実行(Run、Test All Samples)と、テストしてからの提出(Test & Submit)ができます。提出は途中で中止できます
- 実行環境は、AtCoder のコードテスト、ブラウザでの Python の実行、PaizaIO、Wandbox から選べます。Wandbox の C++ では AtCoder Library を使えます。PaizaIO と Wandbox へコードを送るのは、それらを選んだときだけです
- 出力は許容誤差を指定して比べられます。実行したコードは問題ごとに保存し、「Restore Last Code」で戻せます
- AtCoder のコードテストは、タブをまたいでも1件ずつ順番に実行します
- <kbd>Ctrl</kbd>+<kbd>Enter</kbd> で Test & Submit、<kbd>Alt</kbd>+<kbd>Enter</kbd> で Test All Samples、<kbd>Alt</kbd>+<kbd>Esc</kbd> で下のパネルの開閉です
- **Java では機能が加わります**。[Local Runner](local-runner.md) で手元の PC で実行でき、編集中のコードを事前にコンパイルするので結果が早く出ます。メモリは累積の割り当て量で表示します
- AtCoder Easy Test v2 と同時に有効にするとボタンが重なるので、どちらか片方にしてください

## 詳細設定

設定画面の各機能の「詳細設定」で変えられます。

| 項目 | 既定値 |
|---|---|
| Local Runner で編集中のコードを事前にコンパイルする | ON |
| ショートカットを使う(Ctrl+Enter、Alt+Enter、Alt+Esc) | ON |
| 保存するコードの数 | `10` |
| 許容誤差 | `1e-6` |

## 動くページ

- 問題ページ
- 提出ページ
- yukicoder の問題ページ
- Codeforces の問題ページ
