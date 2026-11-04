# 出典

CP Toolkit の機能の出典をまとめます。各機能は元のスクリプトの動作を手本に作り直したもので、上流には追従しません。

| 区分 | 意味                                                                                                 |
|------|------------------------------------------------------------------------------------------------------|
| 派生 | コードを引き継いだ。ライセンスの表記は [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) にある |
| 模倣 | 公開されたスクリプトの動作を手本に、コードを写さずに作成した                                         |
| 移植 | nsubaru のスクリプトを移した                                                                         |
| 参照 | 類似する公開スクリプト。動作や実装を読み比べた                                                       |
| 独自 | 手本がない                                                                                           |

作者とライセンスの欄は Greasy Fork と GitHub の表記です(2026-11-01 に確認)。「記載なし」は表記がないもの、「不明」は確認できなかったものです。模倣と参照ではコードを含めないので、配布物のライセンスには影響しません。

## 機能ごとの出典

### 表示

| 機能                 | 区分 | スクリプト                                                                          | 作者      | ライセンス |
|----------------------|------|-------------------------------------------------------------------------------------|-----------|------------|
| ページ幅の拡張       | 移植 | AtCoder Widen Container                                                             | nsubaru   | MIT        |
|                      | 参照 | [AtCoder Style Optimizer for Single Display](https://greasyfork.org/scripts/463585) | xero_cats | MIT        |
|                      | 参照 | [AtCoder for Large Display](https://greasyfork.org/scripts/439100)                  | magurofly | CC0-1.0    |
| メニューのホバー表示 | 模倣 | [Atcoder Easy Accordion](https://greasyfork.org/scripts/532617)                     | Rac75116  | MIT        |

### 問題文

| 機能                 | 区分 | スクリプト                                                                                                                                                                                | 作者                       | ライセンス |
|----------------------|------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|------------|
| 問題文の強調表示     | 移植 | [AtCoder Highlighter](https://greasyfork.org/scripts/566471)                                                                                                                              | nsubaru                    | MIT        |
|                      | 参照 | [Time Limit Emphasizer](https://greasyfork.org/scripts/406381)                                                                                                                            | Ogtsn99                    | 記載なし   |
|                      | 参照 | [timemory-limit-emphasizer](https://greasyfork.org/scripts/480675)                                                                                                                        | hotarunw                   | MIT        |
|                      | 参照 | [AtCoder Limit Colorizer](https://github.com/sevenc-nanashi/atcoder-limit-colorizer)                                                                                                      | sevenc-nanashi             | MIT        |
| 同じ変数と数値の強調 | 模倣 | [AtCoder Statement Lens](https://chromewebstore.google.com/detail/atcoder-statement-lens/ekoolnikabaabeeofcfmpmdpnmiejcmn)(Chrome 拡張。ソースは未公開で、説明にある動作だけを手本にした) | 不明                       | 不明       |
| 問題文のコピー       | 移植 | [AtCoder Markdown Copier](https://greasyfork.org/scripts/580283)                                                                                                                          | nsubaru                    | MIT        |
|                      | 模倣 | [AtCoder Question Copier](https://greasyfork.org/scripts/597743)(テキスト形式)                                                                                                            | Yuki Takemura (Twil3akine) | MIT        |
|                      | 模倣 | [AtCoderProblemCopier](https://greasyfork.org/scripts/565854)(別行立ての数式を `$$` で囲む)                                                                                               | LIama                      | MIT        |
| サンプルの横並び     | 模倣 | [AtCoder Efficient Layout](https://greasyfork.org/scripts/453117)                                                                                                                         | magurofly                  | CC0-1.0    |

### 提出

| 機能                     | 区分 | スクリプト                                                                                     | 作者        | ライセンス   |
|--------------------------|------|------------------------------------------------------------------------------------------------|-------------|--------------|
| 提出一覧の検索条件の保持 | 模倣 | [AtCoder Search Query Holder](https://greasyfork.org/scripts/460696)                           | gmmtea      | MIT          |
| AC 提出一覧へのリンク    | 派生 | [AtCoder Custom Default Submissions](https://greasyfork.org/scripts/393705)                    | ktnyori     | MIT          |
|                          | 参照 | [AtCoder Add Submissions Shortcuts](https://greasyfork.org/scripts/463453)                     | xero_cats   | MIT          |
|                          | 参照 | [AtCoder quickly check fastest codes](https://greasyfork.org/scripts/499102)                   | zica87      | GPL-3.0-only |
| 言語の切り替えボタン     | 模倣 | [AtCoderLanguageButtons](https://greasyfork.org/scripts/421663)                                | magurofly   | 記載なし     |
| ヘッダーとフッター       | 参照 | [AtCoder Template](https://greasyfork.org/scripts/438105)(言語ごとの保存)                      | magurofly   | CC0-1.0      |
|                          | 参照 | [AtCoder Code Template](https://greasyfork.org/scripts/584183)(名前付きの保存、挿入内容の記憶) | kirameku    | MIT          |
| 提出結果の通知           | 模倣 | [AtCoderResultNotifier](https://greasyfork.org/scripts/371225)                                 | satanic0258 | MIT          |
|                          | 参照 | [comfortable-atcoder](https://github.com/urneighbor1/comfortable-atcoder)(判定の監視)          | urneighbor1 | 記載なし     |
| テストケースの平均       | 模倣 | [AtCoderAverageResult](https://greasyfork.org/scripts/429155)                                  | merom686    | 記載なし     |
| 提出の予約               | 模倣 | [AtCoder Submission Timer](https://greasyfork.org/scripts/451696)                              | Coki628     | MIT          |

### コンテスト

| 機能                         | 区分 | スクリプト                                                                             | 作者           | ライセンス |
|------------------------------|------|----------------------------------------------------------------------------------------|----------------|------------|
| Clar の通知                  | 模倣 | [comfortable-atcoder](https://github.com/urneighbor1/comfortable-atcoder)(Clar の監視) | urneighbor1    | 記載なし   |
| 問題のドロップダウン         | 派生 | [AtCoder Listing Tasks](https://github.com/luuguas/AtCoderListingTasks)                | luuguas        | Apache-2.0 |
|                              | 参照 | [AtCoder Dropdown Tasks](https://greasyfork.org/scripts/529085)                        | magurofly      | CC0-1.0    |
|                              | 参照 | [atcoder_all_open](https://greasyfork.org/scripts/387471)                              | man hot        | 記載なし   |
| 問題の正誤の色分け           | 模倣 | [atcoder-tasks-page-colorize-during-contests](https://greasyfork.org/scripts/426049)   | iilj           | MIT        |
|                              | 参照 | [atcoder-tasks-page-colorizer](https://greasyfork.org/scripts/380404)                  | keymoon        | MIT        |
| 解説の一覧表示               | 模倣 | [View All Editorials(解説ぜんぶ見る)](https://greasyfork.org/scripts/416554)           | w0mbat         | 記載なし   |
| トップページのコンテスト一覧 | 模倣 | [Add a link to the AtCoder contest description](https://greasyfork.org/scripts/579801) | kirameku       | MIT        |
| 次のコンテスト               | 模倣 | [AtCoder-RedirectRecentABC](https://greasyfork.org/scripts/508772)                     | PenguinCabinet | MIT        |
|                              | 模倣 | [AtCoder AWC Tab](https://greasyfork.org/scripts/566748)                               | e6nlaq         | MIT        |
| カレンダーへの登録           | 模倣 | [AtCoder-Google-Calender](https://greasyfork.org/scripts/390758)                       | penicillin0    | MIT        |
| バーチャル参加のタイマー     | 模倣 | [AtCoderVirtualTimer](https://github.com/ocha98/AtCoderVirtualTimer)                   | ocha98         | MIT        |
| 鉄則本の難易度表示           | 模倣 | [tessoku_display_difficulty](https://greasyfork.org/scripts/453352)                    | kuma807        | 記載なし   |

鉄則本の難易度の値は、書籍「競技プログラミングの鉄則」を出典とします。

### 成績

| 機能                                         | 区分 | スクリプト                                                           | 作者        | ライセンス |
|----------------------------------------------|------|----------------------------------------------------------------------|-------------|------------|
| ユーザーページのグラフへのパフォーマンス表示 | 派生 | [AtCoder Perf Graph](https://greasyfork.org/scripts/476103)          | nzm_ort     | MIT        |
|                                              | 参照 | [New AtCoder Perf Graph](https://greasyfork.org/scripts/586685)      | kirameku    | MIT        |
| 成績表の色付け                               | 模倣 | [AtCoderPerformanceColorizer](https://greasyfork.org/scripts/371693) | satanic0258 | MIT        |

### 実行環境

| 機能             | 区分 | スクリプト                                                                | 作者       | ライセンス |
|------------------|------|---------------------------------------------------------------------------|------------|------------|
| Easy Test        | 派生 | [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152)             | magurofly  | MIT        |
| Java の提出補助  | 移植 | Java Code Submitter                                                       | nsubaru    | MIT        |
|                  | 参照 | [AtCoder_submit_keyboard_shortcut](https://greasyfork.org/scripts/378760) | Osmium1008 | MIT        |
|                  | 参照 | [Atcoder Submission Shortcut](https://greasyfork.org/scripts/509606)      | Rac75116   | MIT        |
| Local Runner     | 独自 |                                                                           |            |            |
| paiza の言語選択 | 移植 | Paiza Language Selector                                                   | nsubaru    | MIT        |

Paiza Language Selector に類似する公開スクリプトは見つかりませんでした。

ここに挙げたスクリプトと CP Toolkit を同時に使うときの注意は、[COMPATIBILITY.md](./COMPATIBILITY.md) を参照してください。
