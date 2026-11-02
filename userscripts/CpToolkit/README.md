# CP Toolkit

競技プログラミングの補助機能を1本にまとめた UserScript です。AtCoder を中心に、機能ごとに ON/OFF できます。

[English](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.en.md)

## インストール

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) を入れる
2. Chrome などの Chromium 系のブラウザでは、Tampermonkey の拡張機能の詳細で「ユーザー スクリプトを許可する」をオンにする
3. [Greasy Fork のページ](https://greasyfork.org/scripts/603262-cp-toolkit)からインストールする

## 使い方

Tampermonkey のメニューの「設定を開く」、または AtCoder のヘッダーの「CP Toolkit」から設定画面を開きます。各機能はここで ON/OFF できます。

画面の文言は、サイトの言語に合わせて日本語と英語を切り替えます。

## 機能

「既定で OFF」と書いたもの以外は、最初から有効です。

### 表示

- **ページ幅の拡張**: ページ中央の幅を広げ、エディタに枠線を付けます
- **メニューのホバー表示**: マウスを重ねるだけでメニューを開きます

### 問題文

- **問題文の強調表示**: 数字、変数、実行時間とメモリの制限を強調します
- **変数の強調**: 変数に重ねると、同じ変数をすべて強調します。クリックで固定し、Esc で解除します
- **問題文のコピー**: 各項目と全体を Markdown またはプレーンテキストでコピーします
- **サンプルの横並び(既定で OFF)**: 入出力の形式とサンプルを横に並べます

### 提出

- **検索条件の保持**: 「すべての提出」と「自分の提出」を切り替えても、検索条件を保ちます
- **AC 提出への近道**: AC 提出を実行時間順とコード長順で開きます
- **言語のボタン**: よく使う言語をボタンで切り替えます。言語は選択欄の下の歯車から選びます
- **ソースコードのコメント**: 貼り付けたコードの先頭と末尾へ、参照元の URL などを追記します
- **提出結果の通知**: 判定が終わると、どのページにいてもすぐに通知します。AtCoder を離れていれば、デスクトップ通知も出します
- **実行結果の平均**: 提出の詳細に、実行時間とメモリの平均を表示します
- **時間指定の提出(既定で OFF)**: 指定した時間が経ったら提出します

### コンテスト

- **Clar の通知**: コンテスト中に運営からの回答や訂正が届くと通知します
- **問題のドロップダウン**: 「問題」タブから各問題へ移動でき、複数の問題をまとめて開けます
- **問題の提出状況**: 問題一覧とドロップダウンを、自分の結果で色分けします
- **解説の一覧表示**: すべての問題の解説をまとめて表示します
- **トップページのコンテスト一覧**: 種類ごとの過去問へのリンクに置き換えます
- **最新のコンテスト**: ホームの「次のコンテスト」の一覧を、ヘッダーのメニューから開けます
- **カレンダーへの登録**: コンテストのページに、Google カレンダーへのリンクを置きます
- **バーチャル参加のタイマー**: 開始までの時間と残り時間を、右下の時計に表示します
- **鉄則本の難易度表示**: 「競技プログラミングの鉄則」の問題一覧に、書籍の難易度を表示します

### 成績

- **パフォーマンスのグラフ**: レーティンググラフにパフォーマンスを重ね、最近の範囲を回数か割合で指定できます
- **成績表の色付け**: 成績表のパフォーマンスとレーティングに色を付けます

### 実行環境

- **Java の提出補助**: 貼り付けたコードを提出用に変換し、ショートカットで提出できます
- **Local Runner**: Java の変換と実行に使う、手元のサーバーへ接続します。別途、導入が必要です
- **Easy Test(Java 向け、既定で OFF)**: Java の解答向けに、問題ページからサンプルを実行します
- **paiza の言語選択**: paiza の提出ページで、指定した言語を自動で選びます。言語を設定するまでは動きません

## 対象サイト

AtCoder が中心です。Easy Test は yukicoder と Codeforces でも動きます。Java の提出補助は Codeforces、AOJ、Library Checker、paiza でも動きます。

## 他のスクリプトとの併用

CP Toolkit と同じ機能を持つスクリプトとの併用は推奨しません。ボタンや通知が二重になることがあるので、機能ごとにどちらか片方だけを使ってください。そのスクリプトを使い続ける場合は、CP Toolkit の設定で同じ機能をオフにしてください。

機能が重ならないスクリプトは、そのまま併用できます。たとえば ac-predictor、AtCoderStandingsAnalysis、atcoder-difficulty-display です。

一覧は [他のスクリプトとの併用](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md) を参照してください。

## ソースコードのコメント

問題ページと提出ページのエディタの左にある「ヘッダーとフッター」のボタンから、入力画面を開きます。内容があるとボタンの色が変わります。ヘッダーはコードの先頭、フッターは末尾に入り、内容は別々に保存します。

- 貼り付けでコード全体が置き換わったときに追記します。コードの一部の貼り付けでは追記しません
- 内容は入力欄から離れたときに保存し、次の問題でも使います。「この問題のみ」を選ぶと、その問題だけに保存します
- 保存した内容は「履歴から復元」で呼び出せます。履歴は新しい順に20件までです。「名前を付けて保存」した内容は削除するまで残ります
- 言語を変えると、コメントの書き方も切り替えます。挿入した部分を編集すると、以降は書き換えません
- 既定では単一行コメントを並べます。設定で複数行コメントを選べます
- 「挿入時にコメントアウトする」を外すと、書いた文字列をそのまま挿入します。この場合はコメントの記号も自分で書きます
- `{url}`、`{task}`、`{contest}` は、問題の URL、問題の ID、コンテストの ID に置き換えます
- コメントの書き方が分からない言語では挿入せず、通知で知らせます

## Java の提出補助と Local Runner

Java の提出補助は、[Local Runner](https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner) がなくても動きます。

- **Local Runner がなくてもできること**: パッケージ宣言の削除、クラス名の `Main` への変更、`DEBUG` の無効化
- **Local Runner が必要なこと**: `lib.*` の展開、`import` の補完、提出用ヘッダーの付与

接続できない状態で `import lib.` を含むコードを貼り付けると、導入方法へのリンクを通知します。このまま提出するとコンパイルエラーになるので注意してください。

## 外部との通信

このスクリプトは、作者のサーバーへ情報を送りません。AtCoder などの表示中のサイトのほかに、次の場合だけ外部と通信します。

- **手元の Local Runner**(既定は `http://localhost:8080`): Java の変換と実行のために、コードを手元の PC へ送ります
- **PaizaIO、Wandbox**: Easy Test でこれらを実行環境に選んだときだけ、コードと入力を送ります。ほかの実行環境から自動で切り替わることはありません
- **jsDelivr**: 解説の数式の表示に使う KaTeX、ブラウザでの Python の実行に使う Pyodide、Wandbox の C++ で使う AtCoder Library を、必要なときだけ取得します
- **cdnjs**: 解説のコードの表示に使う Prettify を、必要なときだけ取得します

KaTeX、Prettify、Pyodide は、版を固定して読み込みます。「カレンダーへの登録」はリンクを置くだけで、開いたときにコンテストの情報が Google へ渡ります。

### AtCoder への通信の頻度

- **提出結果の通知**: 判定中の提出があるときだけ確認します。間隔はサイトの指定に従い、下限は1秒、最長30分で打ち切ります
- **Clar の通知**: コンテスト中に1分に1回確認します。開始から5分は確認しません
- **問題の提出状況**: 問題一覧を開いたときと、ドロップダウンを初めて開いたときに取得します。開始から5分は取得しません
- **問題のドロップダウン**: コンテストごとに1回取得し、10日間記憶します
- **解説の一覧表示**: 画面に表示された解説だけを、0.5秒間隔で取得します
- **最新のコンテスト**: メニューを開いたときだけ取得し、1時間記憶します
- **パフォーマンスのグラフ**: ユーザーのページを開いたときに1回取得します
- **Easy Test**: 実行したときだけ通信します。AtCoder のコードテストは、タブをまたいでも1件ずつ順番に実行します

通信に失敗したときは、確認の間隔を広げます。

## 通知を受け取るには

提出結果の通知と Clar の通知は、開いている AtCoder のタブが確認します。AtCoder のタブを1つは開いたままにしてください。すべて閉じると通知は届きません。

## 旧スクリプトからの移行

次のスクリプトは CP Toolkit へ統合しました。

AtCoder Custom Default Submissions、AtCoder Easy Test for Java、AtCoder Highlighter、AtCoder Listing Tasks、AtCoder Markdown Copier、AtCoder Performance Overlay、AtCoder Widen Container、Java Code Submitter、Paiza Language Selector

最終版は [Release](https://github.com/nsubaru11/competitive-programming-tools/releases/tag/legacy-userscripts-final) から入手できます。

1. 旧スクリプトを最終版へ更新し、CP Toolkit も入れる
2. 旧スクリプトが動くサイトを1つ開き、もう一度読み込む。設定は自動で引き継がれ、すでに CP Toolkit で設定した項目は上書きしません
3. 設定の反映を確認したら、旧スクリプトを削除する

両方が入っている間は、旧スクリプトは本体を実行しません。設定はサイトをまたいで共有するので、サイトごとに繰り返す必要はありません。

引き継ぐ設定は次のとおりです。

- **AtCoder Easy Test for Java**: 編集中のコードの事前コンパイルなどの設定、Local Runner の URL
- **AtCoder Highlighter**: 強調の色
- **AtCoder Widen Container**: ページ幅
- **Paiza Language Selector**: 自動で選ぶ言語

次の点は旧スクリプトと異なります。

- 提出タブの既定の絞り込みは廃止しました。AC 提出は問題ページの「AC提出」のボタンから開きます
- Easy Test は既定で OFF です。旧版から移行すると ON になります
- デスクトップ通知は、別のタブを見ているときだけでなく、ブラウザから離れているときにも出します
- Java Code Submitter の設定と、Easy Test に保存したコードは引き継ぎません
- 色の設定は `#rrggbb` の形式だけを受け付けます
- レーティンググラフの recent は、指定した範囲を表示します。既定は直近20回です
- ショートカットは、修飾キーまで完全に一致したときだけ動きます
- Easy Test の下部のパネルの設定ボタンは、CP Toolkit の設定画面を開きます
- Codeforces では、Easy Test のボタンは飾りのない表示になります

## ソースコードとライセンス

配布するコードは、TypeScript のソースを1ファイルにまとめたものです。難読化も最小化もしていません。ソースは [GitHub](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit) で公開しています。

配布物には第三者のコードと turndown を含むので、ライセンスは `MIT AND Apache-2.0 AND 0BSD` です。各機能の出典は [SOURCES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/SOURCES.md)、第三者のコードのライセンスは [THIRD_PARTY_NOTICES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md) にあります。

開発の情報は [DEVELOPMENT.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/DEVELOPMENT.md) にまとめています。

## 不具合と要望

[GitHub の Issue](https://github.com/nsubaru11/competitive-programming-tools/issues) か、Greasy Fork のフィードバックへお寄せください。
