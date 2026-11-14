# competitive-programming-tools

競技プログラミング向けの補助ツールです。

| ツール                                          | 内容                                                                             | 使い始める                                                                       |
|-------------------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [CP Toolkit](./userscripts/CpToolkit/README.md) | AtCoder などのページに補助機能を足す UserScript。機能ごとに ON/OFF できる        | [Greasy Fork からインストール](https://greasyfork.org/scripts/603262-cp-toolkit) |
| [Local Runner](./local-runner/README.md)        | 解答を手元で実行、判定、提出する CLI とサーバー。Java のほかは処理系の導入が要る | [導入方法](./local-runner/README.md#導入)                                        |

CP Toolkit だけなら、インストールするだけで使えます。Local Runner は Java のライブラリの展開や、問題ページからの手元での実行に使います。

不具合や要望は [Issue](https://github.com/nsubaru11/competitive-programming-tools/issues) へお寄せください。

## 開発

開発には Claude を使用しています。設計と仕様は作者が決めています。

開発の情報は [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) にまとめています。

## ライセンス

本リポジトリの内容は、[0BSD(Zero-Clause BSD)](./LICENSE)で提供します。第三者のスクリプトを改変した UserScript は元のライセンスに従います。対象と条件は [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) を参照してください。
