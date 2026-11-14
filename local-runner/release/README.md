# Local Runner

競技プログラミングの解答を手元で実行、判定、提出するツールです。Java の解答は、JDK があればそのまま動きます。C++、C、Python、Go、Rust、Kotlin、C# は定義を用意してあり、処理系を自分で入れると使えます。[CP Toolkit](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.md) の Easy Test+ から、問題ページの解答を手元で実行することもできます。

動作確認は Windows(WSL)で行っています。

## 中身

| ファイル                                 | 内容                                                |
|------------------------------------------|-----------------------------------------------------|
| `local-runner/bin/local-runner.exe`      | Windows で使う CLI                                  |
| `local-runner/bin/local-runner`          | WSL の中で動くサーバー。Linux では CLI としても使う |
| `local-runner/bin/*.cmd`                 | `test`、`submit` などのコマンド。Windows で使う     |
| `local-runner/bin/install-path.cmd`      | `bin` を PATH に登録するスクリプト                  |
| `local-runner/bin/start-local-runner.sh` | サーバーを起動するスクリプト。CLI が自動で使う      |
| `local-runner/settings.schema.json`      | 設定ファイルの項目の定義。エディターが補完に使う    |

設定ファイル(`local-runner.settings.json`)は、初めて設定したときにこのフォルダに作られます。

## 必要なもの

### 必須

- Windows では WSL。サーバーは WSL の中で動く
- サーバーを動かす環境(Windows では WSL)の JDK 24 以降。Java 以外の言語だけを使うときも要る

### 任意

- Java 以外の言語を使うなら、その処理系。このフォルダには含まれないので、サーバーを動かす環境(Windows では WSL)に自分で入れる。入っていない言語は使えないだけで、ほかの言語は動く
- Java の解答から自分のライブラリを import して使うなら、そのソースのフォルダ
- `submit` で AtCoder に提出するなら、AtCoder のログイン情報。`setsession` で保存する。手順は [提出の準備](https://github.com/nsubaru11/competitive-programming-tools/blob/main/local-runner/README.md#提出の準備)を参照

## 使い始める

1. このフォルダを好きな場所に置く
2. Windows では、このフォルダで `.\local-runner\bin\install-path.cmd` を実行し、`bin` を PATH に登録する。登録のあと、新しいターミナルを開く
3. 解答のあるフォルダで `test abc448_d D.java` のように実行する。サーバーは自動で起動する

Linux では、`.cmd` の代わりに `local-runner/bin/local-runner test abc448_d D.java` のように実行します。

## 更新

新しい版の zip を、同じ場所へ上書きで展開します。設定ファイルは zip に含まれないので、そのまま残ります。サーバーが動いていれば `stop` で止めておくと、次のコマンドで新しい版が起動します。

## 詳しい使い方

- [README](https://github.com/nsubaru11/competitive-programming-tools/blob/main/local-runner/README.md): コマンド、言語、ライブラリ、提出用ヘッダー、CP Toolkit とのつなぎ方
- [SETTINGS.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/local-runner/docs/SETTINGS.md): 設定ファイルの項目と、パスの書き方

## ライセンス

[0BSD](LICENSE)
