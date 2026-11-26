# CP Toolkit の変更履歴

新しい版から順に、使えるようになった機能、修正した不具合、更新時に必要な操作をまとめています。

[3.x](#3x) ・ [2.x](#2x) ・ [1.x](#1x) ・ [0.x](#0x)

3.0.2 までの各版には、履歴の出典を添えています。日付はいずれも日本時間です。

- **Greasy Fork** の日付は、その版番号で最後に掲載されたコードの掲載日です。リンクから当時の版を確認できます。
- **Git の記録** の日付は、その版番号が Git の配布物に初めて現れた日です。開発途中の版も含まれます。Greasy Fork から更新した場合は、前の配布版から更新先までの間にある項目もあわせてご覧ください。

## 3.x

### 3.0.2

2026-11-24 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2009046)

- Easy Test+ の「Test & Submit」などで、開始後に許容誤差を書き換えるとサンプルごとに判定基準が変わる不具合を修正しました。実行ボタンを押した時点の値を全サンプルに使い、最後のテストが終わると再び編集できます。非常に大きい数を比べたときの誤判定も修正しました。
- AtCoder・Codeforces・yukicoder の問題ページで、取得できた入出力例だけを全サンプルとして扱い、残りを確かめずに提出に進める不具合を修正しました。AtCoder では日英の問題文で例の数や内容が異なる場合に「Run」が別の例に対応する問題も修正しました。
- Easy Test+ で、貼り付けたコードの変換や実行環境の準備が終わる前に実行が始まる問題を修正しました。
- Java の提出補助で、日本語などを含む有効なライブラリのパッケージ名が設定画面で拒否される問題と、変換エラーの通知で見つからない `import` を正しく示せない場合を修正しました。

### 3.0.1

2026-11-23 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2008026)

- Easy Test+ で許容誤差に `10^-6` など解釈できない値を入力してもテストや提出に進める不具合を修正しました。該当する欄を赤く示します。百万分の一を指定する場合は `1e-6` と入力できます。
- 設定画面で、許容誤差、ヘッダー名、デバッグ用の変数名、ライブラリのパッケージ名、保存件数などに無効な値を設定できる不具合を修正しました。

### 3.0.0

2026-11-23 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2007945)

- **提出補助を使う方は、更新後に設定画面で有効にしてください。** 旧「Java の提出補助」を使っていた場合も、新しい「提出補助」の既定値は無効です。Greasy Fork の 2.1.6 から更新する場合は、[2.1.7](#217)・[2.2.0](#220) に記載した Java の `import`、デバッグ用の変数、提出用ヘッダーの変更も適用されます。
- Local Runner にコードの変換や提出用ヘッダーの取得を任せる場合は、Local Runner を 2.0.0 以降に更新してください。Easy Test+ での実行は Local Runner 1.x でも使えます。
- 対応サイトの設定をサイト別に保存できるようにしました。設定画面のタブで対象サイトを選ぶと、そこで使える機能と項目が表示されます。個別に設定するまでは従来の値を使い、Local Runner の URL などは全サイトで共通です。設定のバックアップ・復元とページの再読み込みも同じ画面からできます。
- ショートカットキーを設定画面で変更できるようにしました。AtCoder のコンテストでは問題の切り替え、順位表・自分の提出・解説への移動ができ、対応する問題ページでは番号を指定して入出力例をコピーできます。提出の既定は `Ctrl+Shift+Enter` です。エディタではカーソル位置のブロックを折りたたみ・展開でき、Mac の Command・Option にも対応しました。
- 提出補助では、Local Runner がない場合も Python・C・C++・Go・Rust の指定したデバッグ用変数を書き換えられるようにしました。全文を貼り付けた後、いちばん外側のブロックとコメントだけを折りたたむ設定も選べます。
- 変換やヘッダーの取得中に提出を押した場合は、準備が終わるまで待つようにしました。待機中にコード・言語・問題が変わった場合や変換に失敗した場合は提出を取り消します。ヘッダーの重複挿入や、空のエディタで言語を切り替えただけでヘッダーが入る問題も修正しました。
- Easy Test+ で手動選択した実行先を保持し、Codeforces のコピーボタンがない例も実行できるようにしました。出力が途中で切れたのに正解と判定する場合や、指数表記を許容誤差で比較する場合を修正しました。Local Runner のヘッダーや変換で行番号がずれたときは、エラー欄にエディタとの行数の差を表示します。
- Easy Test+ のブラウザ内 Python で読み込みに失敗した後に再試行できるようにしました。Wandbox で Java の入れ子の型まで書き換えてしまう不具合も修正しました。
- 設定の復元で無関係な JSON を読み込む問題と、遠い日付に予約した提出が予定時刻より早く実行される問題を修正しました。翌日以降の提出予約には日付も表示します。

---

## 2.x

### 2.2.0

2026-11-22 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/28c14aaf755879f01fa5903d5e5bb1568eef3cca)

- 提出補助でデバッグ用の変数を書き換えるには、詳細設定で変数名を指定してください。既定では書き換えません。Local Runner を使わない Java の簡易変換では、起動クラスにある指定名の変数だけが対象になります。
- AtCoder の問題・提出ページなどで、Java 以外の言語も Local Runner を使って提出用に変換できるようにしました。Java の簡易変換ではパッケージ宣言の削除と `Main` への改名を一緒に適用するようにしました。Local Runner で変換に失敗したときは、通知で診断の全文を開けます。
- AtCoder の問題・提出ページで、Local Runner に登録した提出用ヘッダーを、問題ごとのヘッダーの上・下に付けるか、付けないかを選べるようにしました。編集画面の「コードへ反映」でも同じ設定を使います。

### 2.1.7

2026-11-22 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/de79d42d49d7f21e805ec3797cf0833c2ed88129)

- Java の提出補助で、コードの一部を貼り付けただけなのに全体が変換されたり、Java と判定できないエディタで変換が動いたりする不具合を修正しました。簡易変換では起動する型を特定できる場合だけ改名し、すでに別の `Main` があるコードを保護します。
- Local Runner でのライブラリ展開を通常の Java と同じ規則にそろえ、書き忘れた `import` を自動で補う機能を削除しました。自作ライブラリの型を短い名前で使う場合は、対応する `import` をソースに書いてください。
- 接続中の Local Runner で変換に失敗したときは元のコードを残し、見つからない `import` やコンパイルの診断を通知するようにしました。未接続時にライブラリの導入案内を受けたい場合は、詳細設定にパッケージ名を指定できます。

### 2.1.6

2026-11-19 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2003373)

- 「メニュー」では AtCoder 上のどこを指すか分かりにくかったため、設定画面の「メニューのホバー表示」を「ドロップダウンをホバーで開く」に改名しました。ユーザー名、表示言語、「提出結果」にマウスを重ねて選択肢を開く機能です。
- 設定画面の「問題の正誤の色分け」を「提出結果による問題の色分け」に、「ヘッダーとフッター」を「コードのヘッダーとフッター」に改名しました。「サンプルの横並び」の説明も、自動で幅を決める既定の動作に合わせました。

### 2.1.5

2026-11-19 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2002958)

- AtCoder の新しいヘッダーで、ユーザー名にマウスを重ねたときと離したときに、選択肢がサイト標準のクリック操作と同じように開閉するよう修正しました。

### 2.1.4

2026-11-19 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2002952)

- AtCoder のトップページ、コンテスト一覧、ユーザーページなどで、新しいヘッダーのユーザー名にマウスを重ねても選択肢が開かない不具合を修正しました。

### 2.1.3

2026-11-18 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2002321)

- AtCoder の問題文を英語で表示すると、Easy Test+ の「Run」ボタンが入出力例に表示されない不具合を修正しました。ページ内で言語を切り替えた後も、その言語の例から実行できます。

### 2.1.2

2026-11-17 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=2000933)

- AtCoder を複数のタブで開くと、同じ提出結果や Clar のデスクトップ通知が重複し、閉じるまで画面に残る不具合を修正しました。

### 2.1.1

2026-11-16 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1999105)

- Easy Test+ の操作方法を保ったまま、実行環境の選択とテスト実行の内部処理を整理しました。

### 2.1.0

2026-11-15 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1997836)

- CP Toolkit の対応ページで、新しい版が見つかると画面に通知するようにしました。導入元を1日1回確認し、設定画面から現在の版の確認、手動の更新確認、更新先への移動ができます。
- 画面内の通知に閉じるボタンを追加し、カーソルやフォーカスを置いた間は通知を読めるようにしました。通知の読み上げと動きを減らす設定に対応し、ダイアログの操作部品もダークモードに合わせました。

### 2.0.0

2026-11-14 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1996860)

- 自作サーバーを Easy Test+ につないでいる場合は、事前コンパイルを受け付ける `precompile` と、ソースコードを受け取る `run` に対応してください。従来の `prepare` とプログラム ID による実行から連携方式が変わりました。
- Local Runner を使う Easy Test+ で、編集を繰り返した直後の実行開始を速くしました。Greasy Fork の 1.1.5 から更新する場合は、[1.2.0](#120) に記載した処理系の選択とメモリ表示の変更も含まれます。

---

## 1.x

### 1.2.0

2026-11-13 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/009e2eb850d798bac58c61ad8ad2f44719436f6e)

この版の変更は [2.0.0](#200) で公開されました。

- Easy Test+ で Local Runner を使うとき、提出欄の言語と処理系に合う実行環境を優先するようにしました。たとえば PyPy を選んだページで Codon が先に選ばれる問題を修正しました。
- Local Runner が最大メモリ使用量を返す場合は、実行結果にその値を表示するようにしました。

### 1.1.5

2026-11-12 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1994600)

- AtCoder の「問題の正誤の色分け」で、自分の提出の2ページ目以降にしか AC がない問題が不正解の色になる不具合を修正しました。

### 1.1.4

2026-11-11 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1993865)

- yukicoder の問題ページで、Easy Test+ がエディタから解答コードを読み取れず、実行できない不具合を修正しました。コードが空のときは、実行・提出の前に知らせます。
- Easy Test+ の実行先に Wandbox を選んだとき、Java の `public` クラスを含む解答がファイル名の不一致でコンパイルエラーになる不具合を修正しました。

### 1.1.3

2026-11-11 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1992740)

- AtCoder の問題文の強調表示を軽くしました。印刷用の問題文では、先頭の問題でしか変数と数値を強調できなかった不具合を修正しました。
- AtCoder の提出一覧の一部を取得できなかったとき、確認できていない問題まで不正解の色で表示される不具合を修正しました。
- Easy Test+ のコード保存件数を0にしても無制限に保存される不具合と、設定画面の案内がページの表示言語に従わない不具合を修正しました。

### 1.1.2

2026-11-10 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1992483)

- AtCoder の言語切り替えボタンを横に並べ、ボタンの追加でヘッダーが2段になる不具合を修正しました。

### 1.1.1

2026-11-10 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1992440)

- AtCoder の入出力例が少ない問題で、自動調整の上限に合わせて幅が狭くなり、1組しかない例まで折り返される問題を修正しました。

### 1.1.0

2026-11-10 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1992432)

- AtCoder の問題ページで、横並びにした入出力例の幅を中身の長さに合わせて決められるようにし、この方式を既定にしました。詳細設定で自動調整の上限を指定でき、従来の固定幅も選べます。

### 1.0.38

2026-11-10 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1992314)

- AtCoder の「解説の一覧表示」がコンテスト全体の解説ページでしか動かず、問題別の解説ページでは使えなかった不具合を修正しました。

### 1.0.37

2026-11-06 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1988456)

- AtCoder のユーザーページで、パフォーマンス表示を切り替えた後にレーティンググラフが前の表示に戻る不具合を修正しました。

### 1.0.36

2026-11-06 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1988287)

- AtCoder の問題文で、数式の `10` が「1」と「0」に分かれたり、`10⁹` の指数が強調の対象から外れたりする不具合を修正しました。小数もひと続きの数値として扱います。

### 1.0.35

2026-11-06 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1988271)

- AtCoder の問題文で、実行時間制限が2秒、メモリ制限が1024 MiB の場合は、それぞれ既定の強調表示から外しました。従来どおり強調したい場合は、設定で常に強調するよう指定できます。

### 1.0.34

2026-11-05 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1987284)

- AtCoder の「提出一覧の検索条件の保持」で、設定の変更をページの再読み込み後に反映する動作に戻しました。URL で指定した言語は引き続き言語欄に表示されます。

### 1.0.33

2026-11-05 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1987263)

- AtCoder の成績表の色付けを削除しました。パフォーマンスとレーティングはもともと文字色で区別でき、背景にも色を付けるとかえって数字が読みにくくなるためです。
- 「メニューのホバー表示」から、AtCoder の問題文の折りたたみを自動で開く設定を削除しました。ヘッダーのドロップダウンをマウスで開く操作は引き続き使えます。
- AtCoder の問題ページで、AC 提出を提出時間順・メモリ順でも開けるようにしました。詳細設定で表示するボタンを選べます。コンテスト中にはボタンを表示しません。
- AtCoder の問題・提出ページで、ヘッダーとフッターに複数行コメントを使うかどうかをそれぞれ指定できるようにしました。
- AtCoder の表示を調整し、サンプルの横並びは1組の既定幅を画面幅の23%にしました。「次のコンテスト」の大会カテゴリ表記と、ページ幅を広げたときのエディタの枠線も外しました。
- AtCoder の提出一覧で、URL と選択肢で言語名の大文字・小文字が異なっていても、言語欄に選択が反映されます。
- 自作の実行サーバーに、Easy Test+ で選んだコンパイラ名を渡すようにしました。

### 1.0.32

2026-11-05 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1986542)

- AtCoder の提出詳細で、テストケースの平均メモリ使用量の単位が実際の値と合っていなかったため、KiB 表記に修正しました。

### 1.0.31

2026-11-05 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1986452)

- AtCoder の問題文で、変数に加えて数値にもマウスを重ねて、同じ数値をまとめて強調できるようにしました。
- 設定画面の機能名を実際の操作に合わせました。サンプルを実行する「Easy Test」を「Easy Test+」に改名し、「AC 提出へのボタン」「提出の予約」「問題の正誤の色分け」なども名前から用途を区別しやすくしました。

### 1.0.30

2026-11-04 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/610bc72220ea6a45745303a5c03f5aacd5227794)

- AtCoder の問題一覧と「問題」タブの正誤の色分けに、コンテスト終了後の自分の提出も反映するようにしました。終了後に解き直して AC した問題も正解の色で表示されます。

### 1.0.29

2026-11-04 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1986087)

- AtCoder の Clar の通知と Java の提出補助の処理を軽くしました。

### 1.0.28

2026-11-04 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1985452)

- Easy Test のブラウザ内 Python を AtCoder と同じ Python 3.13 系に更新し、`sys.stdin.buffer` からの入力に対応しました。
- 数式を表示するときに特定の入力でタブが応答しなくなる問題に対処し、外部から読み込む数式・コード表示用のファイルの検証を見直しました。
- Local Runner との連携に、事前コンパイル（`prepare`）を利用できるサーバーが必要になりました。2026年9月より前のサーバーを使用している場合は更新してください。

### 1.0.27

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1984151)

- AtCoder の「ページ幅の拡張」は、幅の設定が空欄ならサイト本来の幅を保つようにしました。広げたい場合だけ幅を指定してください。

### 1.0.26

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983711)

- Java の自作ライブラリを使うコードを貼り付けたとき、Local Runner にライブラリのフォルダが登録されていなければ、提出前に設定方法を確認できるようにしました。

### 1.0.25

2026-11-02 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/26610f936a6d0df77f0a121fc8987808b1e31ca0)

- Easy Test で実行環境の内部エラーが起きたときに、別の実行環境を選んで再実行できることを案内するようにしました。設定画面では、Java の提出補助のうち Local Runner が必要な操作を明記しました。

### 1.0.24

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983661)

- Easy Test の操作ボタンや提出ボタンにマウスを重ねると、対応するショートカットキーを吹き出しで確認できるようにしました。

### 1.0.23

2026-11-02 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/c5588da9f120d4ab6354f77fda5ebcd640231f28)

- AtCoder の問題・提出・コードテストの各ページに、提出言語を直接切り替えるボタンを追加しました。

### 1.0.22

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983653)

- Easy Test の「Test & Submit」で、テスト中に自動提出だけを取り消せるようにしました。結果の行を閉じた場合も提出を取り消します。
- ショートカットを連打すると二重に提出される問題と、サンプルを取得できなかったときに未検証のまま提出される問題を修正しました。

### 1.0.21

2026-11-02 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/ce189988ea20b28bc00cf8ae7ce88733d4974638)

- Easy Test で提出言語を切り替えた後も前の実行環境が選ばれ、提出時と異なる環境でテストされる不具合を修正しました。
- 複数タブから AtCoder のコードテストを同時に使ったとき、後から開始したテストが内部エラーになる不具合を修正しました。

### 1.0.20

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983624)

- AtCoder の問題ページで、「部分点」の説明が入出力例に混ざって横並びになる不具合を修正しました。

### 1.0.19

2026-11-02 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/a0c5b3becf1dfe05c4048b7bc22a9ef128db32cc)

- AtCoder の問題ページで、横並びの入出力例が長いとページ全体に横スクロールが発生する不具合を修正しました。

### 1.0.18

2026-11-02 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/c77401cf7b684d93741d62766d1e6a994fd5020c)

- Local Runner を使わない Java の提出補助で、引数に `final` を付けた `main` を見落とし、別のクラスを `Main` に改名する不具合を修正しました。

### 1.0.17

2026-11-02 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983261)

- paiza の提出ページで、使用言語を設定するまではサイトで選んだ言語を保つようにしました。未設定のまま C++ に切り替わることがなくなります。

### 1.0.16

2026-11-01 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1983002)

- AtCoder のコンテストページで、「カレンダーに追加」のリンクをボタンとして見分けやすくしました。

### 1.0.15

2026-11-01 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1982977)

- AtCoder のヘッダーの「最新のコンテスト」で、大会名を青いリンクにし、公式の一覧で大会名に付いている印も表示するようにしました。

### 1.0.14

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/cc1f1bf1cb65acb64222e02cb41c040a3091ba8d)

- AtCoder の「問題」タブで、正誤の色が付いた項目のどれにマウスやキーボードのフォーカスがあるかを見分けやすくしました。
- ヘッダーとフッターの編集画面で、入力欄を縦に並べ、履歴と名前付きの文面を選ぶ欄をまとめました。

### 1.0.13

2026-11-01 ・ [Greasy Fork](https://greasyfork.org/ja/scripts/603262-cp-toolkit?version=1982801)

- paiza の提出ページで、旧 Paiza Language Selector に設定していた言語を引き継げるようにしました。

### 1.0.12

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/14bc3eea0ab79746865fab153059b5bb3d1deacb)

- 旧 Easy Test から移行したとき、旧スクリプトと CP Toolkit の Easy Test が両方無効になり、実行ボタンが消える問題を修正しました。移行時に一度だけ有効にし、すでに自分で選んだ設定を尊重します。

### 1.0.11

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/bfba18590d69bf05d995f95992ece83051d83d38)

- AtCoder のヘッダーから、トップページの「次のコンテスト」に掲載された大会を開けるようにしました。設定画面を開く「CP Toolkit」には歯車のアイコンを付けました。

### 1.0.10

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/4972d635ca4dcfd365c5a030d1b9ba07cd183264)

- AtCoder の提出一覧で「問題」タブのドロップダウンを開くと、提出一覧の行まで正誤の色に変わる不具合を修正しました。

### 1.0.9

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/a2666427b04d2cea8ad5b6116432450db22ce888)

- AtCoder の問題・提出ページで、ヘッダーとフッターの入力欄をボタンから開く編集画面へ移しました。登録済みの内容はボタンの色で分かり、挿入できなかった場合は通知が出ます。
- ページ幅を広げたときにエディタの右端と背景の境目が分かるよう、枠線を追加しました。

### 1.0.8

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/d7bd1735e8d7ff3f5de5c7a4348e0f201bbe1899)

- AtCoder の判定結果の通知と問題の色分けで、ログイン切れや通信失敗、コンテスト開始直後に問い合わせが集中する問題を改善しました。
- Easy Test で実行環境がエラーを返したときに、選んでいない外部サービスへ解答コードを送ってしまう場合を修正しました。外部ファイルの取得時の検証と、認証情報を送る範囲も見直しました。
- Local Runner に接続していない状態で自作ライブラリを使う Java コードを貼り付けると、提出欄に導入方法を案内するようにしました。

### 1.0.7

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/afae886f08797b70194dd887b3c280578089a48c)

- AtCoder の問題・提出ページで、貼り付けたコードにヘッダーとフッターを追加できるようにしました。問題ごとに文面を保存でき、履歴、名前を付けて保存した文面、問題 URL の差し込みを使えます。提出言語を変えるとコメント形式も切り替わります。
- Easy Test を既定で無効にしました。使う場合は設定画面で有効にしてください。

### 1.0.6

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/ecac07bbe65cdf0c2f08cdd395abb7fe45f47063)

- AtCoder の判定結果の通知を速くし、別のアプリを操作しているときもデスクトップで結果を受け取れるようにしました。コンテスト中には、新しい質問への回答や訂正（Clar）も通知できます。
- AtCoder の問題一覧と「問題」タブのドロップダウンを、自分の提出結果に応じて色分けできるようにしました。問題文では、変数にマウスを重ねると同じ変数をまとめて強調でき、数式のコピーで余分な表示内容が混ざる問題も修正しました。
- AtCoder のヘッダーに最新のコンテストへのリンク、コンテストページに Google カレンダーへの登録リンクを追加しました。バーチャル参加のページを開くと、開始までの時間と競技の残り時間をコンテストの時計で確認できます。

### 1.0.5

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/658139f4e697b5ca328bebf80e145b3bf86d4dc9)

- AtCoder のユーザーページで、レーティンググラフに表示する「最近の結果」の範囲を、直近の参加回数（例：20回）または全参加回数に対する割合（例：50%）で指定できるようにしました。設定画面では、範囲外の値を入力すると保存前に警告が出ます。

### 1.0.4

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/71fa363b4ec83cbd091b9cafe11d9ac5377d7f25)

- AtCoder の問題ページから AC 提出を直接開けるようになったため、「提出」タブを開くたびに既定の絞り込みを適用する機能を削除しました。
- 提出一覧の「すべての提出」と「自分の提出」を切り替えたときに検索条件を保つ機能は、単独で有効・無効を選べるようにしました。

### 1.0.3

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/54222e503a0dc17e78b056c01fbd51e8b04d7fdc)

- AtCoder の問題ページで、実行時間順とコード長順のリンクを「AC提出」の見出しの下にまとめました。どちらもその問題の AC 提出を開くボタンだと分かります。

### 1.0.2

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/95722df4850aa8c20ebbe6b95e85df4751d5c3eb)

- エディタで使用中の言語を判定する処理を軽くしました。

### 1.0.1

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/cc8868994ff840f67944dcc7efcf1a5c3b533e08)

- Easy Test で Local Runner の実行が30秒で打ち切られる不具合を修正しました。Java の提出補助では、一部のエディタで貼り付けを認識しない場合や、ある行を折りたためないと後の行まで処理が止まる場合を修正しました。
- AtCoder のレーティンググラフの最高パフォーマンスの点と操作ボタン、「問題」タブのドロップダウンのアイコンを旧スクリプトと同じ表示に戻しました。

### 1.0.0

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/adf66980ac5c133af68949a9b9fb5a7d8dc5641b)

- 旧スクリプト8本を統合し、設定画面で20の機能を個別に選べるようにしました。
- AtCoder の問題ページに、問題文の強調とコピー、入出力例の横並び、AC 提出へのリンクを追加しました。「問題」タブから各問題へ移動でき、解説ページでは全問の解説をまとめて読めます。
- AtCoder の提出一覧で既定の検索条件を指定できるようにしました。提出時刻の予約、判定結果の通知、提出詳細での実行時間とメモリの平均表示にも対応しました。
- AtCoder のトップページから種類別の過去問へ移動できるようにし、「競技プログラミングの鉄則」の問題一覧には書籍の難易度を表示しました。ユーザーページにはパフォーマンスのグラフ表示と成績表の色付けを追加しました。ヘッダーでは選択肢にマウスを重ねて開けます。
- 対応する提出欄に Java コードを貼り付けて提出用に変換できるようにしました。Local Runner を接続すると、手元で変換・実行できます。AtCoder・Codeforces・yukicoder の問題ページでは Easy Test からサンプルを実行でき、paiza の提出ページでは使用言語を自動で選べます。

---

## 0.x

### 0.1.0

2026-11-01 ・ [Git の記録](https://github.com/nsubaru11/competitive-programming-tools/commit/0b7fdcb48d88b113f6c8b8ad5fbbfe04f5bd2c1f)

- AtCoder のページ幅を設定できるようにしました。Tampermonkey のメニューと AtCoder のヘッダーから設定画面を開き、機能の有効・無効を切り替えられます。
