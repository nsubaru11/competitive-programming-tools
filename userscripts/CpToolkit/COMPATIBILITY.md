# 他のスクリプトとの併用

CP Toolkit と一緒に使ってよいスクリプトと、一緒に使わないほうがよいスクリプトの一覧です。

- [併用できるスクリプト](#併用できるスクリプト): CP Toolkit にない機能を補います。必要なら入れてください
- [併用を推奨しないスクリプト](#併用を推奨しないスクリプト): CP Toolkit と同じ機能を持ちます。機能ごとにどちらか片方だけを使ってください

作者の表記は Greasy Fork と GitHub のものです(2026-11-01 に確認)。

## 併用できるスクリプト

CP Toolkit と機能が重ならないので、そのまま併用できます。

| スクリプト                                                                                    | 作者      | 役割                                     |
|-----------------------------------------------------------------------------------------------|-----------|------------------------------------------|
| [ac-predictor](https://greasyfork.org/scripts/369954)                                         | keymoon   | コンテスト中のパフォーマンスの予測       |
| [AtCoderStandingsAnalysis](https://greasyfork.org/scripts/398439)                             | RTnF      | 順位表の集計                             |
| [atcoder-standings-difficulty-analyzer](https://greasyfork.org/scripts/419541)                | iilj      | 順位表からの難易度の推定                 |
| [atcoder-difficulty-display](https://greasyfork.org/scripts/397185)                           | hotarunw  | 問題の難易度の表示                       |
| [ac-revisit](https://greasyfork.org/scripts/576017)                                           | yiwiy9    | 復習する問題の登録と、今日の一問の提案   |
| [AtCoder Duplicate Checker](https://greasyfork.org/scripts/454704)                            | Raclamusi | 同じコードの重複提出の検出               |
| [AtCoder Template](https://greasyfork.org/scripts/438105)                                     | magurofly | 言語ごとのコードのテンプレート           |
| [AtCoder Code Template](https://greasyfork.org/scripts/584183)                                | kirameku  | 名前付きのコードのテンプレート           |
| [AtCoder Submission User Colorizer](https://greasyfork.org/scripts/397710)                    | morioprog | 提出一覧のユーザー名の色付け             |
| [Disable Google AI Search & Hide Button (for AtCoder)](https://greasyfork.org/scripts/549396) | ぱるま    | コンテスト中の Google の AI 検索の無効化 |

テンプレートのスクリプトはコードの本体を入れます。CP Toolkit の「ヘッダーとフッター」はコードの先頭と末尾へ追記するだけなので、併用できます。

## 併用を推奨しないスクリプト

次のスクリプトは CP Toolkit と同じ機能を持ちます。同時に動かすと、ボタンや通知が二重になったり、表示が崩れたりすることがあります。機能ごとに、次のどちらかを選んでください。

- **CP Toolkit の機能を使う**: 右の列のスクリプトを無効にする
- **そのスクリプトを使い続ける**: CP Toolkit の設定で、左の列の機能をオフにする

CP Toolkit はほかの機能をそのまま使えるので、スクリプト1本のために全体を止める必要はありません。

| CP Toolkit の機能                            | 同じ機能を持つスクリプト                                                                                                                                                                                                              |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ページ幅の拡張                               | [AtCoder Style Optimizer for Single Display](https://greasyfork.org/scripts/463585)、[AtCoder for Large Display](https://greasyfork.org/scripts/439100)                                                                               |
| メニューのホバー表示                         | [Atcoder Easy Accordion](https://greasyfork.org/scripts/532617)                                                                                                                                                                       |
| 問題文の強調表示                             | [Time Limit Emphasizer](https://greasyfork.org/scripts/406381)、[timemory-limit-emphasizer](https://greasyfork.org/scripts/480675)、[AtCoder Limit Colorizer](https://github.com/sevenc-nanashi/atcoder-limit-colorizer)              |
| ホバーした変数と数値の強調                   | [AtCoder Statement Lens](https://chromewebstore.google.com/detail/atcoder-statement-lens/ekoolnikabaabeeofcfmpmdpnmiejcmn)(Chrome 拡張)                                                                                               |
| 問題文のコピー                               | [AtCoder Question Copier](https://greasyfork.org/scripts/597743)、[AtCoderProblemCopier](https://greasyfork.org/scripts/565854)                                                                                                       |
| 提出一覧の検索条件の保持                     | [AtCoder Search Query Holder](https://greasyfork.org/scripts/460696)                                                                                                                                                                  |
| AC 提出へのボタン                            | [AtCoder Custom Default Submissions](https://greasyfork.org/scripts/393705)、[AtCoder Add Submissions Shortcuts](https://greasyfork.org/scripts/463453)、[AtCoder quickly check fastest codes](https://greasyfork.org/scripts/499102) |
| 言語の切り替えボタン                         | [AtCoderLanguageButtons](https://greasyfork.org/scripts/421663)                                                                                                                                                                       |
| 提出結果の通知                               | [AtCoderResultNotifier](https://greasyfork.org/scripts/371225)、[comfortable-atcoder](https://github.com/urneighbor1/comfortable-atcoder)                                                                                             |
| Clar の通知                                  | [comfortable-atcoder](https://github.com/urneighbor1/comfortable-atcoder)                                                                                                                                                             |
| テストケースの平均                           | [AtCoderAverageResult](https://greasyfork.org/scripts/429155)                                                                                                                                                                         |
| 問題のドロップダウン                         | [AtCoder Listing Tasks](https://github.com/luuguas/AtCoderListingTasks)、[AtCoder Dropdown Tasks](https://greasyfork.org/scripts/529085)、[atcoder_all_open](https://greasyfork.org/scripts/387471)                                   |
| 問題の正誤の色分け                           | [atcoder-tasks-page-colorize-during-contests](https://greasyfork.org/scripts/426049)、[atcoder-tasks-page-colorizer](https://greasyfork.org/scripts/380404)                                                                           |
| 解説の一覧表示                               | [View All Editorials(解説ぜんぶ見る)](https://greasyfork.org/scripts/416554)                                                                                                                                                          |
| トップページのコンテスト一覧                 | [Add a link to the AtCoder contest description](https://greasyfork.org/scripts/579801)                                                                                                                                                |
| 次のコンテスト                               | [AtCoder-RedirectRecentABC](https://greasyfork.org/scripts/508772)、[AtCoder AWC Tab](https://greasyfork.org/scripts/566748)                                                                                                          |
| カレンダーへの登録                           | [AtCoder-Google-Calender](https://greasyfork.org/scripts/390758)                                                                                                                                                                      |
| バーチャル参加のタイマー                     | [AtCoderVirtualTimer](https://github.com/ocha98/AtCoderVirtualTimer)                                                                                                                                                                  |
| 鉄則本の難易度表示                           | [tessoku_display_difficulty](https://greasyfork.org/scripts/453352)                                                                                                                                                                   |
| ユーザーページのグラフへのパフォーマンス表示 | [AtCoder Perf Graph](https://greasyfork.org/scripts/476103)、[New AtCoder Perf Graph](https://greasyfork.org/scripts/586685)                                                                                                          |
| 成績表の色付け                               | [AtCoderPerformanceColorizer](https://greasyfork.org/scripts/371693)                                                                                                                                                                  |
| Java の提出補助                              | [AtCoder_submit_keyboard_shortcut](https://greasyfork.org/scripts/378760)、[Atcoder Submission Shortcut](https://greasyfork.org/scripts/509606)                                                                                       |

「Java の提出補助」と重なるのは提出のショートカットだけです。AtCoder の問題ページで使うキーは `Ctrl+Shift+Enter` です。

### 既定で OFF の機能

次の機能は最初からオフなので、そのままなら右の列のスクリプトと併用できます。オンにするときは、右の列のスクリプトを無効にしてください。

| CP Toolkit の機能 | 同じ機能を持つスクリプト                                          | 補足                                                                                                               |
|-------------------|-------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Easy Test+        | [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152)     | 同時に有効にするとボタンが重なるので、どちらか片方を使ってください                                                 |
| サンプルの横並び  | [AtCoder Efficient Layout](https://greasyfork.org/scripts/453117) |                                                                                                                    |
| 提出の予約        | [AtCoder Submission Timer](https://greasyfork.org/scripts/451696) |                                                                                                                    |

### 乗り換えるとき

- AtCoderLanguageButtons の設定は引き継げません。言語の選択欄の下の歯車から選び直してください
- nsubaru の旧スクリプトは、最終版へ更新すれば CP Toolkit が動いている間は自動で止まります。手順は [旧スクリプトからの移行](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit#旧スクリプトからの移行)を参照してください
