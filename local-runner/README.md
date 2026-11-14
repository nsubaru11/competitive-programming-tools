# Local Runner

競技プログラミングの解答を手元で実行、判定、提出するためのツールです。Java の解答は、JDK があればそのまま動きます。C++、C、Python、Go、Rust、Kotlin、C# は定義を用意してあり、処理系を自分で入れると使えます。設定を足せば、ほかの言語も動かせます。次の2つからなります。

- **CLI**: AtCoder のサンプルでのテスト、提出、提出用コードの作成を行う
- **サーバー**: 解答をコンパイルして実行する。Java を速く動かすために常駐する。[CP Toolkit](../userscripts/CpToolkit/README.md) からも接続できる

[CP Toolkit](../userscripts/CpToolkit/README.md) の Java の提出補助でライブラリの展開や `import` の補完を使うには、Local Runner と[ライブラリの設定](#ライブラリを使う)が必要です。

動作確認は Windows(WSL)で行っています。

## 必要なもの

### 必須

- Windows では WSL。サーバーは既定で WSL の中で動く。WSL を使わない動かし方は、[設定](./docs/SETTINGS.md#server)の `backend` を参照
- サーバーを動かす環境(Windows では WSL)の JDK 24 以降。Java 以外の言語だけを使うときも要る

### 任意

- Java 以外の言語を使うなら、その処理系。Local Runner には含まれないので、サーバーを動かす環境(Windows では WSL)に自分で入れる。入っていない言語は使えないだけで、ほかの言語は動く。[言語](#言語)を参照
- Java の解答から自分のライブラリを import して使うなら、そのソースのフォルダ。[Java のライブラリを使う](#ライブラリを使う)を参照
- `submit` で AtCoder に提出するなら、AtCoder のログイン情報。[提出の準備](#提出の準備)を参照

## 導入

[Release](https://github.com/nsubaru11/competitive-programming-tools/releases) から `local-runner-<版>.zip` を入手し、好きな場所に展開します。展開してできる `competitive-programming-tools` フォルダに、すべてが入っています。中身は、フォルダの中の `README.md` にあります。

これだけで、Java の解答の実行、判定、提出、提出用コードの作成が動きます。Java のライブラリを使うときは、[Java のライブラリを使う](#ライブラリを使う)を参照してください。ほかの言語は処理系の導入が要ります。[言語](#言語)を参照してください。

Windows では、次のコマンドで `bin` を PATH に登録すると、どのフォルダからでも `test` や `submit` を実行できます。

```powershell
.\local-runner\bin\install-path.cmd
```

`competitive-programming-tools` フォルダで実行します。登録のあと、新しいターミナルを開くと使えます。

Linux では、`bin` の `.cmd` の代わりに `bin/local-runner` を実行します。

```bash
/path/to/competitive-programming-tools/local-runner/bin/local-runner test abc448_d D.java
```

### 更新

新しい版の zip を、同じ場所へ上書きで展開します。設定ファイル(`local-runner.settings.json`)は zip に含まれないので、そのまま残ります。サーバーが動いていれば `stop` で止めておくと、次のコマンドで新しい版が起動します。

## CP Toolkit とつなぐ

1. `serve` でサーバーを起動する。`test` などのコマンドを実行すると自動でも起動する
2. CP Toolkit の設定で「Local Runner」が有効で、接続先の URL が `http://localhost:8080` であることを確かめる
3. 問題ページからも実行するなら、「Easy Test+」を有効にする

## 安全のために

サーバーは受け取ったコードを実行するので、次の点に注意してください。

- サーバーは `127.0.0.1` にだけ接続を許します。同じネットワークのほかの端末からは接続できません
- ブラウザからの要求は、対応するジャッジサイトからのものだけを受け付けます。設定の `server.extraOrigins` に書いたオリジンは、追加で受け付けます
- 同じ PC で動くプログラムからの要求は拒否できません
- 実行するコードはサンドボックスに入らず、起動したユーザーの権限で動きます。内容を確認していないコードは実行しないでください
- `REVEL_SESSION` は AtCoder のログイン情報です。他人に渡さないでください

## コマンド

| コマンド                                                       | 説明                                                                                               |
|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `test <taskScreenName> <sourceFile>`                           | AtCoder のサンプルで実行し、AC か WA かを判定する                                                  |
| `test <task>`                                                  | 短縮表記。フォルダからコンテストを推定する(例: `test d`)                                           |
| `submit [-f] <taskScreenName> <sourceFile>`                    | サンプルがすべて AC なら提出する。`-f` で強制的に提出する                                          |
| `submit [-f] <task>`                                           | 短縮表記(例: `submit d`)                                                                           |
| `localtest <sourceFile> [testDir]`                             | `.in` と `.out` を自動で探し、オフラインで実行して判定する                                         |
| `run <sourceFile> [inputFile]`                                 | 1回だけ実行して出力を表示する。`inputFile` を省くと標準入力は空になる                              |
| `crosscheck <actualSourceFile> <expectedSourceFile> [testDir]` | `.in` を入力に2つのコードを実行し、標準出力を比べる。`.out` は不要                                 |
| `tomain <sourceFile> [outFile]`                                | 提出用のソースを `Main.java` など言語ごとの名前で書き出す。`-f` で上書きする                       |
| `toclip <sourceFile>`、`toclip <task>`                         | 提出用のソースをクリップボードへコピーする(例: `toclip d`)                                         |
| `serve`                                                        | サーバーを起動し、準備が終わるまで待つ                                                             |
| `stop`                                                         | サーバーを停止する                                                                                 |
| `status`                                                       | サーバーの状態を表示する。稼働中なら終了コード 0、停止中なら 1                                     |
| `setlib <path>`                                                | Java のライブラリのフォルダを設定する。引数なしで現在の設定を表示し、`--clear` で解除する          |
| `setheader <language\|name> <file>`                            | 言語の既定のヘッダーか、名前付きのヘッダーを設定する。引数なしで一覧を表示し、`--clear` で解除する |
| `setsession`                                                   | `submit` に使う AtCoder のログイン情報を保存する                                                   |
| `settings`                                                     | 全部の設定と今の値を表示する。既定値と違う項目には `*` が付く                                      |
| `cacheclear -a`、`cacheclear -t <taskScreenName>`              | サンプルのキャッシュをすべて、または指定した問題の分だけ削除する                                   |

`taskScreenName` は URL の `/tasks/` より後ろの部分です(例: `abc448_d`)。`sourceFile` の拡張子は省けます(`D` で `D.java` や `D.cpp` を探す)。

ライブラリを編集したら、`stop` のあと `serve` で読み込み直してください。

### 短縮表記

`test`、`submit`、`toclip` に引数を1つだけ渡すと短縮表記になります。`abc463/src/java` のフォルダで `test d` を実行すると、`test abc463_d D.java` と同じです。

- `src` の親のフォルダ名をコンテスト名として使う
- 問題の記号は大文字と小文字を区別しない
- 末尾の数字はファイルの違いとして扱う。`test d1` は `D1.java` を問題 `d` のサンプルでテストする
- ソースは現在のフォルダから、[言語](#言語)の拡張子で探す(`D.java`、`D.cpp`、`D.py` など)。同じ名前のソースが複数あるときは、`--lang` で選ぶ
- `toclip` はコンテスト名を使わないので、どのフォルダでも使える

### オプション

オプションは引数の前後どちらに置いても構いません。

| オプション                    | 対象                                        | 説明                                                                                    |
|-------------------------------|---------------------------------------------|-----------------------------------------------------------------------------------------|
| `-f`, `--force`               | `submit`、`tomain`                          | `submit`: サンプルが AC でなくても提出する。`tomain`: 既存のファイルを上書きする        |
| `-d`, `--debug[=true\|false]` | `test`、`localtest`、`run`                  | デバッグの有効と無効を切り替える(既定は有効)                                            |
| `--lang=<name>`               | ソースを受け取るコマンド                    | 言語を設定での名前で選ぶ(既定は拡張子から)。`crosscheck` の比較相手は `--expected-lang` |
| `--no-header`                 | `submit`、`tomain`、`toclip`                | 提出物の先頭にヘッダーを付けない                                                        |
| `--header=<name>`             | `submit`、`tomain`、`toclip`                | `setheader` で `<name>` に設定したファイルをヘッダーに使う(既定は言語のヘッダー)        |
| `--full`                      | `test`、`localtest`、`submit`、`crosscheck` | WA の差分を折りたたまず、全行を表示する(`--max-lines` より優先)                         |
| `--wa-only`                   | `test`、`localtest`、`submit`、`crosscheck` | WA の差分のうち、一致しない行だけを表示する                                             |
| `--max-lines=N`               | `test`、`localtest`、`submit`、`crosscheck` | WA の差分を折りたたむ行数を変える(既定は 20)                                            |
| `--time-limit=N`              | `localtest`、`run`、`crosscheck`            | 実行時間の警告に使う制限(ms)。既定は 2000。表示だけで、実行は打ち切らない               |

### 実行例

```powershell
# AtCoder のサンプルでテストする
test abc448_d D.java

# 提出と同じ条件(DEBUG を無効)でテストする
test --debug=false abc448_d D.java

# 手元の .in と .out でテストする
localtest D.java

# 1回だけ実行する
run D.java sample-1.in

# WA の差分を全行表示する
localtest --full D.java

# 提出する
submit abc448_d D.java

# C++ の解答をテストする(GCC の導入が要る)
test abc448_d D.cpp

# Python の解答を PyPy でテストする(PyPy の導入が要る)
test --lang=pypy abc448_d D.py
```

## 言語

ソースの拡張子から言語を選びます。`--lang=<名前>` を付けると、その言語で実行します。

| 拡張子  | 名前      | 言語                                                    | 必要な処理系                 | 動作の確認 |
|---------|-----------|---------------------------------------------------------|------------------------------|------------|
| `.java` | `java`    | Java                                                    | JDK 24 以降                  | 済み       |
| `.cpp`  | `cpp`     | C++23(AtCoder に合わせたオプションの GCC)               | GCC 15(`g++`)                | 済み       |
| `.c`    | `c`       | C23                                                     | GCC 15(`gcc`)                | 済み       |
| `.py`   | `cpython` | Python(CPython)。`--lang=pypy`、`--lang=codon` でも動く | `python3`、`pypy3`、`codon`  | 済み       |
| `.go`   | `go`      | Go                                                      | `go`                         | 未検証     |
| `.rs`   | `rust`    | Rust。外部のクレートは使えない                          | `rustc`                      | 未検証     |
| `.kt`   | `kotlin`  | Kotlin(Kotlin/JVM)                                      | `kotlinc` と `java`          | 未検証     |
| `.cs`   | `csharp`  | C#                                                      | .NET 10 以降の SDK(`dotnet`) | 未検証     |

- Java 以外の言語は、定義を用意してあるだけです。処理系は Local Runner に含まれないので、サーバーを動かす環境(Windows では WSL)に自分で入れてください。入れたあと、`stop` と `serve` で起動し直すと使えます
- 処理系が PATH に無いときは、設定の `languages` に場所を書きます
- 使える言語と、処理系が見つからなかった言語は、`status` で確かめられます
- 「未検証」の言語は、定義を書いただけで、動作を確かめていません。動かないときは、設定の `compile` と `run` を直してください
- `.py` を PyPy で動かすのを既定にしたいときは、設定の `extensions` を変えます
- コンパイルと実行のコマンドを設定に書けば、ほかの言語も足せます

設定の書き方は [docs/SETTINGS.md](./docs/SETTINGS.md) の `languages` と `extensions` を参照してください。

サンプルの結果には、実行時間とメモリを表示します。Java 以外は `mem=`(プロセスが使ったメモリの最大値)、Java は `alloc=`(実行中に確保したメモリの合計)で、意味が違います。

`submit` は、言語に合わせて AtCoder の提出先の言語を選びます。設定の `submit` に合う言語がフォームに無いときは、近い言語で代用せずに、候補を表示して止まります。

<a id="ライブラリを使う"></a>

## Java のライブラリを使う

Java の解答では、自分のライブラリを import して使えます。実行や提出のときに、使ったクラスを解答と同じ1つのソースへ展開します。この機能があるのは Java だけです。ほかの言語では、設定の `bundle` に自分の変換コマンドを組み込めます。

ライブラリのソースを置いたフォルダを、`setlib` で設定します。

```bash
setlib C:\path\to\library\src
```

- フォルダの名前は自由です。指定したフォルダの中の `.java` を、下の階層も含めてすべてライブラリとして扱います
- パッケージは、各ファイルの `package` 宣言から決めます。型の名前は、ファイルの名前から決めます
- 一部だけを使いたいときは、そのフォルダを指定します。`src` の下に `lib` と `patterns` があって `lib` だけを展開したいなら、`src/lib` を指定します
- 指定したフォルダの `.java` は、すべてまとめてコンパイルします。テストのコードなど、単独でコンパイルできないものを含むフォルダは指定しないでください
- 名前が `.` で始まるフォルダの中は読みません
- 相対パスは、コマンドを実行したフォルダを基準にします。保存するのは絶対パスです
- 設定は `local-runner.settings.json` の `languages.java.library` に保存します。Windows で設定したパスは、WSL のサーバーでも使えます
- 設定したら `stop` のあと `serve` で読み込み直してください
- `setlib` だけで現在の設定を表示し、`setlib --clear` で解除します

設定していなくても、サーバーはライブラリなしで起動します。ライブラリを使うコードは、設定を促すエラーになります。

作者のライブラリは [competitive-programming-java-library](https://github.com/nsubaru11/competitive-programming-java-library) です。`src/lib` を指定して使います。以下の例は、このライブラリのものです。

解答では、`import lib.ds.unionfind.UnionFind;` のように、通常の Java のコードとしてライブラリを import できます。

`run`、`localtest`、`test`、`crosscheck`、`tomain`、`toclip`、`submit` が、実行の前にライブラリの import を検出し、必要なクラスと依存するクラスを1つのソースへ展開します。

- 展開したクラスは `Bundled library classes: ...` と表示する
- `import lib.io.*;` のようなワイルドカードでも、実際に使っている型だけを展開する
- 提出コードの元の import はコメントアウトして残す
- import を書かなくても、単純名がライブラリの中で一意なら補完する。標準 API と同名のときは標準 API を優先する
- ライブラリの `import static`、本文中の `lib.ds.unionfind.UnionFind` のような完全修飾の参照、展開すると単純名が衝突する型はエラーになる
- 入出力のように大きくて毎回同じクラスは、設定の `languages.java.libraryLast` にパッケージを書くと、提出物の末尾へ回せる

提出用の `Main` にするのは、`public static void main(String[])` を持つトップレベルの型です。複数あるときは `Main` という名前の型を選びます。それも無いときや候補が無いときはエラーで止まります。

## DEBUG の扱い

手元の実行(`test`、`localtest`、`run`)では既定でデバッグを有効にし、`--debug=false` で無効にできます。提出物(`submit`、`tomain`、`toclip`)では常に無効にします。

| 言語   | デバッグが有効なとき                   | 無効なとき、提出物           |
|--------|----------------------------------------|------------------------------|
| Java   | ソースの `DEBUG = true` のまま実行する | `DEBUG = false` に書き換える |
| C++、C | `-DLOCAL` を付けてコンパイルする       | `-DLOCAL` を付けない         |
| Python | ソースの `DEBUG = True` のまま実行する | `DEBUG = False` に書き換える |

Go、Rust、Kotlin、C# の定義には、デバッグの切り替えはありません。設定の `debugArgs` と `debugRewrite` で足せます。

デバッグ出力を標準エラー出力に出しておけば、判定に影響しません。

## 提出用ヘッダー

提出物の先頭に付けるコメントなどのファイルを、`setheader` で設定できます。言語の既定のヘッダーと、名前付きのヘッダーの2通りがあります。`submit`、`tomain`、`toclip` と CP Toolkit の Java の提出補助が使います。言語の名前には、設定での名前(`java`、`cpp`、`pypy` など)か、言語の種類(`python3` など)を書きます。

```bash
# java の既定のヘッダー。--header を付けなければこれを使う
setheader java C:\path\to\header.txt

# 名前付きのヘッダー。submit --header=short のように選ぶ
setheader short C:\path\to\short.txt
```

- 設定は `local-runner.settings.json` の `headers` に保存します。サーバーの再起動はいりません
- 相対パスは、コマンドを実行したフォルダを基準にします。保存するのは絶対パスです
- `setheader` だけで一覧を表示し、`setheader java --clear` で解除します
- 設定が無ければヘッダーは付けません。設定したファイルが見つからないときはエラーで止まります
- 名前付きのヘッダーは `--header=<name>` や CP Toolkit の「ヘッダーの名前」で選べます。設定が無い名前はエラーになります
- `--no-header` で、ヘッダーを付けずに出力します
- ソースがヘッダーの1行目で始まるときは、重ねて付けません
- `run`、`test`、`localtest`、`crosscheck` と Easy Test+ の実行には付けません。行番号が元のソースと揃います

## 実行時間の警告

実行時間は、制限の 80% を超えると黄色、制限以上で赤で表示します。

- `test`、`submit`: 問題ページの実行時間制限を使う
- `localtest`、`run`、`crosscheck`: 制限が分からないので 2000ms を使う。`--time-limit=3000` のように指定できる

どちらも表示だけで、実行は設定の `run.timeoutMs`(既定は10秒)まで続きます。手元の実行は本番より速く出やすいので、目安として見てください。

## 提出の準備

`submit` には AtCoder のログイン情報が必要です。ブラウザで AtCoder にログインし、Cookie の `REVEL_SESSION` の値をコピーします。次のコマンドを実行し、値を貼り付けて Enter を押します。

```bash
setsession
```

- 貼り付けた値は、画面に表示しません
- 保存先は、設定の `atcoder.sessionFile` です。既定では、ホームの `.atcoder/session.txt` です
- ログインが切れたら、同じコマンドで保存し直します

## 設定

ポート、タイムアウト、JDK の場所などは、`competitive-programming-tools` フォルダの `local-runner.settings.json` に書きます。変えたい項目だけを書けばよく、ファイルが無ければすべて既定値で動きます。Windows の CLI と WSL のサーバーが同じファイルを読みます。

項目の一覧とパスの書き方は [docs/SETTINGS.md](./docs/SETTINGS.md) を参照してください。今の値は `settings` で確かめられます。

環境変数 `NO_COLOR` を `1` にすると、色付きの表示を止めます。

## 開発

開発には Claude を使用しています。設計と仕様は作者が決めています。

内部の仕様と開発の手順は [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) にまとめています。
