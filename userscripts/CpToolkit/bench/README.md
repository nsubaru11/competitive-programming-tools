# CP Toolkit の性能の計測

CP Toolkit と、統合前の UserScript 群を同じ条件で動かし、CPU 時間・メモリ・DOM への重複アクセスを比べるための計測です。結果の要約は [PERFORMANCE.md](../PERFORMANCE.md)、版ごとの詳細は [reports/](./reports/) にあります。

## 1. 必要なもの

| もの | 用途 |
|---|---|
| Linux か macOS | 計測は Linux(4 コア、16 GB)で確かめています |
| Node.js 20 以上と npm | 計測のコード。Playwright は `bench/` の中だけに入れ、リポジトリの依存関係には足しません |
| Bun | 計測する版の CP Toolkit のビルド。リポジトリの [docs/DEVELOPMENT.md](../../../docs/DEVELOPMENT.md) と同じ版 |
| git、unzip | 計測するコミットの取り出しと、Tampermonkey の展開 |
| 空き容量 2 GB ほど | Chromium、Tampermonkey、録画したページ、生データ |
| 次のホストへの接続 | atcoder.jp と、そのページが読み込むもの、greasyfork.org、raw.githubusercontent.com、unpkg.com、cdn.jsdelivr.net、ajax.googleapis.com、clients2.google.com(Tampermonkey)、Playwright の Chromium の配布元 |

Linux で Chromium の起動に必要なライブラリが足りないときは、`npx playwright install-deps chromium` を root で実行します。

## 2. 準備

```bash
cd userscripts/CpToolkit/bench
./setup.sh
```

`setup.sh` は次のことをします。最初に1回だけ実行します。

1. Node.js、npm、git、Bun、unzip があるかを確かめます。
2. `package.json` の版の Playwright と Chromium を `bench/node_modules` に入れます。
3. 旧スクリプトを [legacy.lock.json](./legacy.lock.json) の版で取得し、sha256 を照合します。`@require` のライブラリも同じように取得して照合します。
4. Tampermonkey を Chrome ウェブストアから取得して展開します。

第三者の UserScript にはライセンスの表記がないものがあるので、リポジトリには入れず、ここで取得します。取得したファイル、録画したページ、生データはすべて `bench/.work/` に置きます(Git では無視します)。

## 3. 計測

```bash
./run.sh --quick     # 動作確認。問題文のページだけを各1回測る(約30分)
./run.sh             # いま checkout しているコミットの CP Toolkit を測る(約3.5時間)
./run.sh 8e3a12e9    # 指定したコミットの CP Toolkit を測る(この例は 1.0.26)
```

`run.sh` は次のことを順に行い、`reports/<版>.md` と `reports/<版>/*.json` を書き出します。

1. 指定したコミットを `.work/src/` に取り出し、CP Toolkit を2通りに用意します。配布物(`dist`)と、同じ中身をソースマップ付きで整形せずにビルドしたものです。後者は、CPU 時間やメモリを機能ごとに分けるために使います。
2. その版の機能の一覧と、旧スクリプトとの対応表(`harness/conditions.mjs` の `LEGACY_TO_FEATURES`)を突き合わせます。対応が取れないときは、ここで止まります(「5. 新しい版を測るとき」を参照)。
3. AtCoder の公開ページ9つを録画します。まだ録画していない URL だけを取得し、以降の計測ではこの録画だけを返します。
4. Tampermonkey を入れた Chromium に、条件ごとにスクリプトを自動でインストールし、CPU、メモリ、ページ全体の処理時間、放置時を測ります。
5. DOM への重複アクセスを、Tampermonkey の代わりのシムで数えます。
6. 生データを集計してレポートを書き出します。

途中で止まったときは、同じコマンドでやり直します。生データは `.work/results/<版>/` に残ります。ほかの重い処理と同時に動かすと、CPU の取り合いで値がゆがむので、計測中はマシンを空けておきます。

## 4. 測り方

### 4.1 比べる条件

| 条件 | 中身 |
|---|---|
| スクリプトなし | Tampermonkey だけを入れた状態。増分の基準 |
| 旧 nsubaru 版 | 統合前の nsubaru 版8本の最終版(コミット `7c4fc38` の直前) |
| CP Toolkit(旧 nsubaru 版と同じ機能) | 旧 nsubaru 版に対応する機能だけを ON にした CP Toolkit |
| 旧スクリプト | 旧 nsubaru 版と、[SOURCES.md](../SOURCES.md) で「派生」「模倣」の元になった公開スクリプト18本 |
| CP Toolkit(旧スクリプトと同じ機能) | 旧スクリプトに対応する機能だけを ON にした CP Toolkit |

Chrome 拡張(Statement Lens、comfortable-atcoder)は UserScript ではないので含めません。CP Toolkit の機能の ON/OFF は、インストールするときに設定の初期値として書き込みます。

### 4.2 ページ

トップ、コンテスト一覧、コンテストのトップ、問題一覧、問題文、解説一覧、ユーザー、コンテスト成績表、鉄則本の問題一覧の9つです(`harness/pages.mjs`)。提出一覧・順位表・提出画面はログインが要るので対象外です。広告と解析のスクリプトは、どの条件でも遮断します。

### 4.3 指標

| 指標 | 測り方 | 回数 |
|---|---|---|
| CPU 時間 | 読み込みから3秒後までの CPU プロファイル(100µs 間隔)。Tampermonkey 自身と UserScript 本体に分け、CP Toolkit はソースマップで機能ごとに分ける | 各8回 |
| メモリ | 読み込みの3秒後に GC を2回かけて残った JS ヒープ。サンプリングヒーププロファイラで、確保したスクリプトや機能に割り当てる | 各5回 |
| ページ全体の処理時間 | CDP `Performance.getMetrics` の TaskDuration と Long Task。CPU 等倍と4倍遅くした場合 | 各10回・6回 |
| 放置時の CPU 時間 | 読み込み後に15秒放置したあいだの、1秒あたりのメインスレッドの時間 | 各3回 |
| DOM への重複アクセス | DOM API を包み、要素ごとに「どのスクリプトや機能が、取得・読み取り・書き換えを何回したか」を数える | 各1回 |

値は中央値です。旧スクリプトと CP Toolkit の差は、Mann-Whitney U 検定で確かめます。条件は順番に回し、時間による偏りを条件の間で均します。

DOM への重複アクセスだけは、Tampermonkey の代わりのシム(`harness/page/gm-shim.js`)で動かします。Tampermonkey のスクリプトはページとは別の実行環境で動き、ページ側で DOM API を包んでも呼び出しが見えないためです。DOM への操作の回数は、どの管理ソフトで動かしても変わりません。

### 4.4 スクリプトが動いたことの確認

Tampermonkey での計測では、毎回、計測が終わったあとに読み込まれたスクリプトを Debugger から集め、そのページに当てはまるスクリプトがすべて動いたかを記録します。レポートの冒頭に、その回数を載せています。

ブラウザを起動し直すと、Tampermonkey のスクリプトが動かなくなることがあります。そのため `run.sh` は、毎回プロファイルを作り直してスクリプトを入れ直し、全種類の計測を1回の起動の中で続けて行います。

## 5. 新しい版を測るとき

1. その版のコミットを checkout して `./run.sh` を実行します。
2. `reports/<版>.md` と `reports/<版>/` をコミットします。
3. [PERFORMANCE.md](../PERFORMANCE.md) の「結果」を新しい版の値に書き換え、「版ごとの結果」の表に1行足します。

`run.sh` が「旧スクリプト ○○ に対応する機能が、この版の CP Toolkit にありません」で止まったときは、機能の ID が変わったか、機能がなくなっています。`harness/conditions.mjs` の `LEGACY_TO_FEATURES` で、その旧スクリプトの行に新しい ID の組を足します。対応する機能がなくなったときは、空の組 `[]` を足します。その旧スクリプトはその版の比較から外れ、レポートにその旨が載ります。

## 6. 再現性について

固定しているもの:

- 旧スクリプトとそのライブラリ(`legacy.lock.json` の URL と sha256)
- Playwright と Chromium(`package.json` と `package-lock.json`)
- 計測する CP Toolkit(コミット)

固定できないもの:

- Tampermonkey: Chrome ウェブストアは最新版しか配らないので、取得した版をレポートに記録します。取得し直すときは `./setup.sh --refresh-tampermonkey` を実行します。
- AtCoder のページ: 最初の計測で録画し、以降の版も同じ録画で測ります。録画し直すときは `.work/fixtures/` を消します。別のマシンで録画すると、ページの中身が変わって値も変わります。
- マシン: 値はマシンの速さで変わります。版の間で比べるときは、同じマシンで測った値を比べてください。

## 7. ファイル

| ファイル | 内容 |
|---|---|
| `setup.sh` | 準備 |
| `run.sh` | 計測からレポートまで |
| `legacy.lock.json` | 旧スクリプトとライブラリの取得元、版、sha256 |
| `harness/conditions.mjs` | 比べる条件と、旧スクリプトと機能の対応表 |
| `harness/tm-measure.mjs` | Tampermonkey での計測 |
| `harness/measure.mjs` | ページの録画と、シムでの計測 |
| `harness/page/gm-shim.js` | Tampermonkey の代わりのシム |
| `harness/page/dom-trace.js` | DOM API を包んで数える部分 |
| `harness/report.mjs` | 集計とレポートの書き出し |
| `reports/<版>.md`、`reports/<版>/` | 版ごとの詳細レポートと、表の JSON |
