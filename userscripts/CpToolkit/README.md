<div align="center">
<h1>CP Toolkit</h1>
<p><strong>競技プログラミングの補助機能を1本にまとめた UserScript</strong></p>
<p>AtCoder を中心に、問題文、提出、コンテスト、成績のページを使いやすくします。機能ごとに ON/OFF できます。</p>
<p><a href="https://greasyfork.org/scripts/603262-cp-toolkit"><img src="https://img.shields.io/greasyfork/v/603262?label=Greasy%20Fork&color=670000" alt="Greasy Fork の版"></a>
<a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md"><img src="https://img.shields.io/greasyfork/l/603262" alt="ライセンス"></a></p>
<p><a href="https://greasyfork.org/scripts/603262-cp-toolkit"><strong>インストール</strong></a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md">他のスクリプトとの併用</a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/issues">不具合と要望</a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.en.md">English</a></p>
</div>

## 1. インストール

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) を入れる
2. Chrome などの Chromium 系のブラウザでは、Tampermonkey の拡張機能の詳細で「ユーザー スクリプトを許可する」をオンにする
3. [Greasy Fork のページ](https://greasyfork.org/scripts/603262-cp-toolkit)からインストールする

## 2. 使い方

Tampermonkey のメニューの「設定を開く」、または AtCoder のヘッダーの「CP Toolkit」から設定画面を開きます。各機能はここで ON/OFF できます。機能によっては、「詳細設定」で動作を変えられます。

画面の文言は、サイトの言語に合わせて日本語と英語を切り替えます。

## 3. 対象サイト

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">サイト</th>
<th style="border: 1px solid #888">使える機能</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888">AtCoder</td>
<td style="border: 1px solid #888">paiza の言語選択以外のすべての機能</td>
</tr>
<tr>
<td style="border: 1px solid #888">yukicoder</td>
<td style="border: 1px solid #888">Easy Test+</td>
</tr>
<tr>
<td style="border: 1px solid #888">Codeforces</td>
<td style="border: 1px solid #888">Easy Test+、Java の提出補助</td>
</tr>
<tr>
<td style="border: 1px solid #888">AOJ、Library Checker</td>
<td style="border: 1px solid #888">Java の提出補助</td>
</tr>
<tr>
<td style="border: 1px solid #888">paiza</td>
<td style="border: 1px solid #888">Java の提出補助、paiza の言語選択</td>
</tr>
</tbody></table>

## 4. 機能一覧

機能名の横に <sub>既定で OFF</sub> とあるもの以外は、最初から有効です。<sub>詳細あり</sub> とある機能は、「5. 機能の詳細」に説明があります。

### 4.1 表示

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>ページ幅の拡張</strong></td>
<td style="border: 1px solid #888">ページ中央の幅を広げ、エディタに枠線を付けます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>メニューのホバー表示</strong></td>
<td style="border: 1px solid #888">マウスを重ねるだけでメニューを開きます</td>
</tr>
</tbody></table>

### 4.2 問題文

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>問題文の強調表示</strong></td>
<td style="border: 1px solid #888">数字、変数、実行時間とメモリの制限を強調します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>ホバーした変数と数値の強調</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">変数や数値に重ねると、同じ変数や数値をすべて強調します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>問題文のコピー</strong></td>
<td style="border: 1px solid #888">各項目と全体を Markdown またはプレーンテキストでコピーします</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>サンプルの横並び</strong> <sub>既定で OFF</sub></td>
<td style="border: 1px solid #888">入出力の形式とサンプルを横に並べます</td>
</tr>
</tbody></table>

### 4.3 提出

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>提出一覧の検索条件の保持</strong></td>
<td style="border: 1px solid #888">「すべての提出」と「自分の提出」を切り替えても、検索条件を保ちます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>AC 提出へのボタン</strong></td>
<td style="border: 1px solid #888">この問題の AC 提出を実行時間順とコード長順で開きます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>言語の切り替えボタン</strong></td>
<td style="border: 1px solid #888">よく使う言語をボタンで切り替えます。言語は選択欄の下の歯車から選びます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>ヘッダーとフッター</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">貼り付けたコードの先頭にヘッダー、末尾にフッターを追記します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>提出結果の通知</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">判定が終わると、どのページにいてもすぐに通知します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>テストケースの平均</strong></td>
<td style="border: 1px solid #888">提出の詳細に、実行時間とメモリの平均を表示します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>提出の予約</strong> <sub>既定で OFF</sub></td>
<td style="border: 1px solid #888">指定した時間が経ったら提出します</td>
</tr>
</tbody></table>

### 4.4 コンテスト

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Clar の通知</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">コンテスト中に運営からの回答や訂正が届くと通知します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>問題のドロップダウン</strong></td>
<td style="border: 1px solid #888">「問題」タブから各問題へ移動でき、複数の問題をまとめて開けます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>問題の正誤の色分け</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">問題一覧とドロップダウンを、コンテスト後を含む自分の提出で色分けします</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>解説の一覧表示</strong></td>
<td style="border: 1px solid #888">すべての問題の解説をまとめて表示します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>トップページのコンテスト一覧</strong></td>
<td style="border: 1px solid #888">種類ごとの過去問へのリンクに置き換えます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>次のコンテスト</strong></td>
<td style="border: 1px solid #888">ホームの「次のコンテスト」の一覧を、ヘッダーのメニューから開けます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>カレンダーへの登録</strong></td>
<td style="border: 1px solid #888">コンテストのページに、Google カレンダーへのリンクを置きます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>バーチャル参加のタイマー</strong></td>
<td style="border: 1px solid #888">開始までの時間と残り時間を、右下の時計に表示します</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>鉄則本の難易度表示</strong></td>
<td style="border: 1px solid #888">「競技プログラミングの鉄則」の問題一覧に、書籍の難易度を表示します</td>
</tr>
</tbody></table>

### 4.5 成績

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>ユーザーページのグラフへのパフォーマンス表示</strong></td>
<td style="border: 1px solid #888">ユーザーページのレーティンググラフにパフォーマンスを重ね、最近の範囲を回数か割合で指定できます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>成績表の色付け</strong></td>
<td style="border: 1px solid #888">成績表のパフォーマンスとレーティングに色を付けます</td>
</tr>
</tbody></table>

### 4.6 実行環境

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">機能</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Java の提出補助</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">貼り付けたコードを提出用に変換し、ショートカットで提出できます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Local Runner</strong> <sub>詳細あり</sub></td>
<td style="border: 1px solid #888">Java の変換と実行に使う、手元のサーバーへ接続します。別途、導入が必要です</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Easy Test+</strong> <sub>既定で OFF・詳細あり</sub></td>
<td style="border: 1px solid #888">問題ページからサンプルを実行し、結果を確かめます</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>paiza の言語選択</strong></td>
<td style="border: 1px solid #888">paiza の提出ページで、指定した言語を自動で選びます。言語を設定するまでは動きません</td>
</tr>
</tbody></table>

## 5. 機能の詳細

<details>
<summary><b>5.1 ホバーした変数と数値の強調</b></summary>
<ul>
<li>重ねた変数や数値と同じものを、問題文の中ですべて強調します。離れると強調を消します</li>
<li>クリックすると強調を固定します。もう一度クリックするか、<kbd>Esc</kbd> で解除します</li>
<li>詳細設定の「変数を強調する」と「数値を強調する」で、変数と数値を別々に ON/OFF できます</li>
<li>「10<sup>5</sup>」の「10」のように指数の付く数値も、ほかの「10」と同じ数値として扱います</li>
</ul>
</details>

<details>
<summary><b>5.2 ヘッダーとフッター</b></summary>
<p>問題ページと提出ページのエディタの左にある「ヘッダーとフッター」のボタンから、入力画面を開きます。内容があるとボタンの色が変わります。ヘッダーはコードの先頭、フッターは末尾に入り、内容は別々に保存します。参照元の URL などを書いておくのに使えます。</p>
<ul>
<li>貼り付けでコード全体が置き換わったときに追記します。コードの一部の貼り付けでは追記しません</li>
<li>内容は入力欄から離れたときに保存し、次の問題でも使います。「この問題のみ」を選ぶと、その問題だけに保存します</li>
<li>保存した内容は「履歴から復元」で呼び出せます。履歴は新しい順に20件までです。「名前を付けて保存」した内容は削除するまで残ります</li>
<li>言語を変えると、コメントの書き方も切り替えます。挿入した部分を編集すると、以降は書き換えません</li>
<li>既定では単一行コメントを並べます。設定で複数行コメントを選べます</li>
<li>「挿入時にコメントアウトする」を外すと、書いた文字列をそのまま挿入します。この場合はコメントの記号も自分で書きます</li>
<li><code>{url}</code>、<code>{task}</code>、<code>{contest}</code> は、問題の URL、問題の ID、コンテストの ID に置き換えます</li>
<li>コメントの書き方が分からない言語では挿入せず、通知で知らせます</li>
</ul>
</details>

<details>
<summary><b>5.3 提出結果の通知と Clar の通知</b></summary>
<ul>
<li>通知は、開いている AtCoder のタブが確認します。AtCoder のタブを1つは開いたままにしてください。すべて閉じると通知は届きません</li>
<li>AtCoder を見ていないときは、デスクトップ通知も出します。別のタブを見ているときだけでなく、ブラウザから離れているときにも出します。デスクトップ通知は詳細設定で止められます</li>
<li>Clar の通知は、コンテスト中だけ確認します</li>
</ul>
</details>

<details>
<summary><b>5.4 問題の正誤の色分け</b></summary>
<ul>
<li>自分の提出一覧を読み、コンテスト中とコンテスト後の提出をどちらも反映します</li>
<li>AC か得点のある提出が1つでもあれば正解、提出があって正解がなければ不正解の色にします。判定中の提出は数えません</li>
<li>色は詳細設定で変えられます</li>
<li>ログインしていないときと、コンテストの開始から5分の間は取得しません</li>
</ul>
</details>

<details>
<summary><b>5.5 Java の提出補助と Local Runner</b></summary>
<p>Java の提出補助は、<a href="https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner">Local Runner</a> がなくても動きます。</p>
<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">条件</th>
<th style="border: 1px solid #888">できること</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888">Local Runner がなくてもできる</td>
<td style="border: 1px solid #888">パッケージ宣言の削除、クラス名の <code>Main</code> への変更、<code>DEBUG</code> の無効化</td>
</tr>
<tr>
<td style="border: 1px solid #888">Local Runner が必要</td>
<td style="border: 1px solid #888"><code>import</code> の補完</td>
</tr>
<tr>
<td style="border: 1px solid #888">Local Runner の設定も必要</td>
<td style="border: 1px solid #888"><code>lib.*</code> の展開(<code>setlib</code>)、提出用ヘッダーの付与(<code>setheader</code>)</td>
</tr>
</tbody></table>
<p>接続できない状態や、ライブラリを設定していない状態で <code>import lib.</code> を含むコードを貼り付けると、設定方法へのリンクを通知します。このまま提出するとコンパイルエラーになるので注意してください。</p>
</details>

<details>
<summary><b>5.6 Easy Test+</b></summary>
<ul>
<li><a href="https://greasyfork.org/scripts/433152">AtCoder Easy Test v2</a> をもとに、機能を加えたものです</li>
<li>問題ページから、サンプルの実行(Run、Test All Samples)と、テストしてからの提出(Test &amp; Submit)ができます。提出は途中で中止できます</li>
<li>実行環境は、AtCoder のコードテスト、ブラウザでの Python の実行、PaizaIO、Wandbox から選べます。Wandbox の C++ では AtCoder Library を使えます。PaizaIO と Wandbox へコードを送るのは、それらを選んだときだけです</li>
<li>出力は許容誤差を指定して比べられます。実行したコードは問題ごとに保存し、「Restore Last Code」で戻せます</li>
<li>AtCoder のコードテストは、タブをまたいでも1件ずつ順番に実行します</li>
<li><kbd>Ctrl</kbd>+<kbd>Enter</kbd>、<kbd>Alt</kbd>+<kbd>Enter</kbd>、<kbd>Alt</kbd>+<kbd>Esc</kbd> のショートカットを使えます。詳細設定でオフにできます</li>
<li><strong>Java では機能が加わります</strong>。<a href="https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner">Local Runner</a> で手元の PC で実行でき、編集中のコードを事前にコンパイルするので結果が早く出ます。メモリは累積の割り当て量で表示します</li>
<li>AtCoder Easy Test v2 と同時に有効にするとボタンが重なるので、どちらか片方にしてください</li>
</ul>
</details>

## 6. 他のスクリプトとの併用

CP Toolkit と同じ機能を持つスクリプトとの併用は推奨しません。ボタンや通知が二重になることがあるので、機能ごとにどちらか片方だけを使ってください。そのスクリプトを使い続ける場合は、CP Toolkit の設定で同じ機能をオフにしてください。

機能が重ならないスクリプトは、そのまま併用できます。たとえば ac-predictor、AtCoderStandingsAnalysis、atcoder-difficulty-display です。

一覧は [他のスクリプトとの併用](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md) を参照してください。

## 7. 外部との通信

このスクリプトは、作者のサーバーへ情報を送りません。AtCoder などの表示中のサイトのほかに、次の場合だけ外部と通信します。

- **手元の Local Runner**(既定は `http://localhost:8080`): Java の変換と実行のために、コードを手元の PC へ送ります
- **PaizaIO、Wandbox**: Easy Test+ でこれらを実行環境に選んだときだけ、コードと入力を送ります。ほかの実行環境から自動で切り替わることはありません
- **jsDelivr**: 解説の数式とコードの表示に使う KaTeX と Prettify、ブラウザでの Python の実行に使う Pyodide、Wandbox の C++ で使う AtCoder Library を、必要なときだけ取得します

KaTeX、Prettify、Pyodide、AtCoder Library は、版を固定して読み込みます。「カレンダーへの登録」はリンクを置くだけで、開いたときにコンテストの情報が Google へ渡ります。

<details>
<summary><b>AtCoder への通信の頻度</b></summary>
<ul>
<li><strong>提出結果の通知</strong>: 判定中の提出があるときだけ確認します。間隔はサイトの指定に従い、下限は1秒、最長30分で打ち切ります</li>
<li><strong>Clar の通知</strong>: コンテスト中に1分に1回確認します。開始から5分は確認しません</li>
<li><strong>問題の正誤の色分け</strong>: 問題一覧を開いたときと、ドロップダウンを初めて開いたときに、自分の提出一覧を全ページ順に取得します。開始から5分は取得しません</li>
<li><strong>問題のドロップダウン</strong>: コンテストごとに1回取得し、10日間記憶します</li>
<li><strong>解説の一覧表示</strong>: 画面に表示された解説だけを、0.5秒間隔で取得します</li>
<li><strong>次のコンテスト</strong>: メニューを開いたときだけ取得し、1時間記憶します</li>
<li><strong>ユーザーページのグラフへのパフォーマンス表示</strong>: ユーザーのページを開いたときに1回取得します</li>
<li><strong>Easy Test+</strong>: 実行したときだけ通信します。AtCoder のコードテストは、タブをまたいでも1件ずつ順番に実行します</li>
</ul>
<p>通信に失敗したときは、確認の間隔を広げます。</p>
</details>

## 8. 旧スクリプトからの移行

次のスクリプトは CP Toolkit へ統合しました。最終版は [Release](https://github.com/nsubaru11/competitive-programming-tools/releases/tag/legacy-userscripts-final) から入手できます。

AtCoder Custom Default Submissions、AtCoder Easy Test for Java、AtCoder Highlighter、AtCoder Listing Tasks、AtCoder Markdown Copier、AtCoder Performance Overlay、AtCoder Widen Container、Java Code Submitter、Paiza Language Selector

<details>
<summary><b>移行の手順</b></summary>
<ol>
<li>旧スクリプトを最終版へ更新し、CP Toolkit も入れる</li>
<li>旧スクリプトが動くサイトを1つ開き、もう一度読み込む。設定は自動で引き継がれ、すでに CP Toolkit で設定した項目は上書きしません</li>
<li>設定の反映を確認したら、旧スクリプトを削除する</li>
</ol>
<p>両方が入っている間は、旧スクリプトは本体を実行しません。設定はサイトをまたいで共有するので、サイトごとに繰り返す必要はありません。</p>
<p>引き継ぐ設定は次のとおりです。</p>
<ul>
<li><strong>AtCoder Easy Test for Java</strong>: 編集中のコードの事前コンパイルなどの設定、Local Runner の URL</li>
<li><strong>AtCoder Highlighter</strong>: 強調の色</li>
<li><strong>AtCoder Widen Container</strong>: ページ幅</li>
<li><strong>Paiza Language Selector</strong>: 自動で選ぶ言語</li>
</ul>
</details>

<details>
<summary><b>旧スクリプトとの違い</b></summary>
<ul>
<li>提出タブの既定の絞り込みは廃止しました。AC 提出は問題ページの「AC提出」のボタンから開きます</li>
<li>Easy Test+ は既定で OFF です。旧版から移行すると ON になります</li>
<li>デスクトップ通知は、別のタブを見ているときだけでなく、ブラウザから離れているときにも出します</li>
<li>Java Code Submitter の設定と、Easy Test+ に保存したコードは引き継ぎません</li>
<li>色の設定は <code>#rrggbb</code> の形式だけを受け付けます</li>
<li>レーティンググラフの recent は、指定した範囲を表示します。既定は直近20回です</li>
<li>ショートカットは、修飾キーまで完全に一致したときだけ動きます</li>
<li>Easy Test+ の下部のパネルの設定ボタンは、CP Toolkit の設定画面を開きます</li>
<li>Codeforces では、Easy Test+ のボタンは飾りのない表示になります</li>
</ul>
</details>

## 9. ソースコードとライセンス

配布するコードは、TypeScript のソースを1ファイルにまとめたものです。難読化も最小化もしていません。ソースは [GitHub](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit) で公開しています。

開発には Claude Opus 5.5 を使用しました。設計と仕様は作者が決めています。

配布物には第三者のコードと turndown を含むので、ライセンスは `MIT AND Apache-2.0 AND 0BSD` です。各機能の出典は [SOURCES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/SOURCES.md)、第三者のコードのライセンスは [THIRD_PARTY_NOTICES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md) にあります。

開発の情報は [DEVELOPMENT.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/DEVELOPMENT.md) にまとめています。

## 10. 不具合と要望

[GitHub の Issue](https://github.com/nsubaru11/competitive-programming-tools/issues) か、Greasy Fork のフィードバックへお寄せください。
