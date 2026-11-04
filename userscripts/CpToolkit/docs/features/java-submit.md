# Java の提出補助

[機能一覧へ戻る](../../README.md#4-機能一覧) ・ [English](java-submit.en.md)

> 貼り付けたコードを提出用に変換し、ショートカットで提出できるようにします。パッケージ宣言の削除、クラス名の変更、DEBUG の無効化は Local Runner がなくても動きます。lib.* の展開、import の補完、ヘッダーの付与には Local Runner が必要です。

## 使い方

- Java のコードを貼り付けると、提出できる形に変換します
- パッケージ宣言の削除、クラス名の `Main` への変更、`DEBUG` の無効化は、[Local Runner](local-runner.md) がなくても動きます
- `import` の補完には Local Runner が必要です。`lib.*` の展開(`setlib`)と提出用ヘッダーの付与(`setheader`)には、Local Runner の設定も必要です
- 接続できない状態や、ライブラリを設定していない状態で `import lib.` を含むコードを貼り付けると、設定方法へのリンクを通知します。このまま提出するとコンパイルエラーになります
- ショートカットで提出できます。AtCoder と Codeforces は <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd>、AOJ と paiza は <kbd>Ctrl</kbd>+<kbd>Enter</kbd>、Library Checker は <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>Enter</kbd> です
- 貼り付けたあと、クラスとコメントを折りたたみます。<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> でも折りたためます

## 詳細設定

設定画面の各機能の「詳細設定」で変えられます。

| 項目 | 既定値 |
|---|---|
| Local Runner がないときにパッケージ宣言を削除する | ON |
| Local Runner がないときにクラス名を Main にする | ON |
| Local Runner がないときに DEBUG を false にする | ON |
| 提出用のヘッダーを付ける | ON |
| ヘッダーの名前(空欄なら既定) | (空欄) |
| 貼り付け後にクラスとコメントを折りたたむ | ON |

## 動くページ

- 問題ページ
- 提出ページ
- コードテストのページ
- Codeforces
- AOJ
- Library Checker
- paiza
