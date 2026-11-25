# Local Runner

競技プログラミングの解答を手元で実行、判定、提出するためのツールです。Java の解答は、JDK があればそのまま動きます。C++、C、Python、Go、Rust、Kotlin、C# は定義を用意してあり、処理系を自分で入れると使えます。設定を足せば、ほかの言語も動かせます。次の2つからなります。

- **CLI**: AtCoder のサンプルでのテスト、提出、提出用コードの作成を行います。
- **サーバー**: 解答をコンパイルして実行します。Java を速く動かすために常駐します。[CP Toolkit](../userscripts/CpToolkit/README.md) からも接続できます。

[CP Toolkit](../userscripts/CpToolkit/README.md) の提出補助でライブラリを展開するには、Local Runner と[ライブラリの設定](#ライブラリを使う)が必要です。

Windows（WSL）で動作を確認しています。

<a id="必須"></a>

## 必要なもの

解答に使う言語にかかわらず、サーバーの実行には JDK 24 以降が必要です。

Windows では、既定の設定でサーバーが WSL 内で動作します。JDK は WSL 内にインストールしてください。Java の解答だけを実行する場合は、[サーバー設定の `backend`](./docs/SETTINGS.md#server) を変更して Windows の JDK を使うこともできます。

<a id="任意"></a>

### 使う機能に応じた準備

- **Java 以外の言語**を使う場合は、その言語の[処理系](#言語)をサーバーと同じ環境にインストールします。
- **自分の Java ライブラリ**を使う場合は、[ソースフォルダを登録します](#ライブラリを使う)。
- **AtCoder に提出**する場合は、`setsession` で[ログイン情報を保存します](#提出の準備)。

## 導入

[Release](https://github.com/nsubaru11/competitive-programming-tools/releases) から `local-runner-<版>.zip` を入手し、好きな場所に展開します。展開してできる `competitive-programming-tools` フォルダに、すべてが入っています。中身は、フォルダの中の `README.md` にあります。

コマンドで最新のバージョンを入手するなら、次のようにします。

Windows(PowerShell)

```powershell
$url = (Invoke-RestMethod https://api.github.com/repos/nsubaru11/competitive-programming-tools/releases).assets | Where-Object name -like 'local-runner-*.zip' | Select-Object -First 1 -ExpandProperty browser_download_url
curl.exe -LO $url
Expand-Archive .\local-runner-*.zip .
```

Linux、WSL

```bash
curl -s https://api.github.com/repos/nsubaru11/competitive-programming-tools/releases | grep -o 'https://[^"]*/local-runner-[0-9.]*\.zip' | head -1 | xargs curl -LO
unzip local-runner-*.zip
```

[GitHub CLI](https://cli.github.com/)(`gh`)を使うなら、どちらの環境でも次のコマンドで入手できます。展開は、上のコマンドと同じです。

```bash
gh release download --repo nsubaru11/competitive-programming-tools --pattern 'local-runner-*.zip'
```

これだけで、Java の解答の実行、判定、提出、提出用コードの作成が動きます。Java のライブラリを使うときは、[Java のライブラリを使う](#ライブラリを使う)を参照してください。ほかの言語は処理系の導入が要ります。[言語](#言語)を参照してください。

Windows では、次のコマンドで `bin` を PATH に登録すると、どのフォルダからでも `test` や `submit` を実行できます。

```powershell
.\local-runner\bin\install-path.cmd
```

`competitive-programming-tools` フォルダで実行します。登録のあと、新しいターミナルを開くと使えます。

Linux では、`.cmd` の代わりに `local-runner <コマンド>` を実行します。`bin` を PATH に加えると、解答のあるフォルダから実行できます。

```bash
export PATH="$PATH:/path/to/competitive-programming-tools/local-runner/bin"
local-runner test abc448_d D.java
```

### 更新

次のコマンドで、最新のバージョンへ入れ替えます。

```bash
update
```

- [Release](https://github.com/nsubaru11/competitive-programming-tools/releases) から配布物をダウンロードし、配布元が示す SHA-256 と照合してから入れ替えます。合わなければ、何も変えずに止まります。
- 配布物に設定ファイルは含めません。設定ファイルの形式が変わったときは、新しいバージョンの初回起動時に書き換えます。
- サーバーが動いていれば止めます。次のコマンドで、新しいバージョンのサーバーが起動します。
- **同じ導入先の更新は一度に1つだけ実行してください。**
- `update --check` は、新しいバージョンがあるかだけを表示します。

サーバーは起動のたびに、新しいバージョンがあるかを GitHub へ1回だけ問い合わせます。あれば、起動のログと `status` に表示します。送るのは問い合わせだけで、コードや設定は送りません。設定の `update.check` を `false` にすると、問い合わせません。

1.x の設定を移行すると、ライブラリとヘッダーの設定を引き継ぎ、元の設定ファイルを `.bak` として残します。言語ごとに `debugRewrite: true` を指定していた場合は、`debugFlag` が未設定なら `"DEBUG"` を引き継ぎます。デバッグ用変数の書き換えを新たに有効にするには、言語ごとに `debugFlag` を指定してください（[設定の移行](docs/SETTINGS.md#設定の移行)）。

手動で更新するときは、新しいバージョンの zip を同じ場所へ上書きで展開します。

## CP Toolkit とつなぐ

1. `serve` でサーバーを起動します。`test` などのコマンドを実行すると自動でも起動します。
2. CP Toolkit の設定で「Local Runner との連携」が有効で、接続先の URL が `http://localhost:8080` であることを確かめます。
3. 問題ページからも実行するなら、「Easy Test+」を有効にします。

## 安全のために

サーバーは受け取ったコードを実行するので、次の点に注意してください。

- サーバーは `127.0.0.1` にだけ接続を許します。同じネットワークのほかの端末からは接続できません。
- ブラウザからの要求は、対応するジャッジサイトからのものだけを受け付けます。設定の `server.extraOrigins` に書いたオリジンは、追加で受け付けます。
- 同じ PC で動くプログラムからの要求は拒否できません。
- Local Runner 自身が外部と通信するのは、AtCoder(`test`、`submit`)と、更新の確認とダウンロードのための GitHub だけです。実行する解答が行う通信は制限しません。
- 実行するコードはサンドボックスに入らず、起動したユーザーの権限で動きます。内容を確認していないコードは実行しないでください。
- `REVEL_SESSION` は AtCoder のログイン情報です。他人に渡さないでください。

## コマンド

| コマンド                                                       | 説明                                                                                                     |
|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `test <taskScreenName> <sourceFile>`                           | AtCoder のサンプルで実行し、AC か WA かを判定します。                                                    |
| `test <sourceFile>`                                            | フォルダとファイル名から問題を推定します（例：`test C_deque.java`）。                                    |
| `submit [-f] <taskScreenName> <sourceFile>`                    | サンプルがすべて AC なら提出します。`-f` で強制的に提出します。                                          |
| `submit [-f] <sourceFile>`                                     | フォルダとファイル名から問題を推定します（例：`submit A_2.java`）。                                      |
| `localtest <sourceFile> [testDir]`                             | `.in` と `.out` を自動で探し、オフラインで実行して判定します。                                           |
| `run <sourceFile> [inputFile]`                                 | 1回だけ実行して出力を表示します。`inputFile` を省くと標準入力は空になります。                            |
| `crosscheck <actualSourceFile> <expectedSourceFile> [testDir]` | `.in` を入力に2つのコードを実行し、標準出力を比べます。`.out` は不要です。                               |
| `tomain <sourceFile> [outFile]`                                | 提出用のソースを `Main.java` など言語ごとの名前で書き出します。`-f` で上書きします。                     |
| `toclip <sourceFile>`                                          | 提出用のソースをクリップボードへコピーします。拡張子は省略できます。                                     |
| `serve`                                                        | サーバーを起動し、準備が終わるまで待ちます。                                                             |
| `stop`                                                         | サーバーを停止します。                                                                                   |
| `status`                                                       | サーバーの状態を表示します。起動中・稼働中は終了コード 0、停止中は 1 を返します。                                |
| `setlib <path>`                                                | Java のライブラリのフォルダを設定します。引数なしで現在の設定を表示し、`--clear` で解除します。          |
| `setheader <language\|name> <file>`                            | 言語の既定のヘッダーか、名前付きのヘッダーを設定します。引数なしで一覧を表示し、`--clear` で解除します。 |
| `setsession`                                                   | `submit` に使う AtCoder のログイン情報を保存します。                                                     |
| `settings`                                                     | すべての設定項目と現在値を表示します。既定値と違う項目には `*` が付きます。                              |
| `update`、`update --check`                                     | 最新のバージョンへ更新します。`--check` は、新しいバージョンがあるかだけを表示します。                   |
| `cacheclear -a`、`cacheclear -t <taskScreenName>`              | サンプルのキャッシュをすべて、または指定した問題の分だけ削除します。                                     |

**同じ実行環境では1台のサーバーを共用してください。** 実行・変換コマンドと `serve` は、同じポートで起動中のサーバーの準備完了を待ちます。`status` は準備中に `starting`、実行できるようになると `running` と表示します。

`taskScreenName` は URL の `/tasks/` より後ろの部分です(例: `abc448_d`)。`sourceFile` の拡張子は省けます(`D` で `D.java` や `D.cpp` を探す)。

完全指定では正式な `taskScreenName` とソースファイル名を渡します。たとえば典型90問の 001 は `test typical90_a Q001.java`、鉄則本の A01 は `test tessoku_book_a A01.java` です。コンテスト名とタスク ID が異なる場合は [JSON の対応表](./data/atcoder-task-exceptions.json)から URL を復元します。照合範囲と更新方法は [AtCoder の URL 復元](./docs/ATCODER_TASK_URLS.md)を参照してください。

ライブラリを編集したら、`stop` のあと `serve` で読み込み直してください。

### ファイル名からの問題推定

`test`・`submit` にソースファイルを1つ渡すと、フォルダからコンテスト、ファイル名から問題を推定します。`abc351/src/java` で `test C_deque.java` を実行すると、C 問題のサンプルで `C_deque.java` を実行します。

- `src` の親のフォルダ名をコンテスト名として使います。
- ファイル名から拡張子と最後の `_` 以降を取り除き、小文字にしたものを問題記号とします。たとえば `C_deque.java` は `c`、`A_2.java` は `a`、`A15_1.java` は `a15` になります。
- 旧コンテスト・ABC/ARC 同時開催回では、画面に表示される問題記号から実際のタスク ID を復元します。ABC001 の `test a` は `abc001_1`、ABC042 と ARC058 の `test c` はどちらも `arc058_a` に対応します。
- ARC058〜103 の完全指定は正式なタスク ID として扱います。たとえば `test arc058_c E.java` は E 問題、ARC058 のフォルダで `test c` は C 問題を指します。
- 別実装は `D_1.java` のように `_` で区切ります。`D1.java`・`d1` の問題記号は `d1` になります。
- 拡張子は省略できます。`test c_deque` では、現在のフォルダから大小を区別せずに `C_deque.java`・`C_deque.cpp` などを探します。候補が複数あれば拡張子か `--lang` で選びます。
- `toclip` も同じソース選択を使います。問題の推定は行わず、どのフォルダでも `toclip C_deque.java`・`toclip c_deque` の形で使えます。

### オプション

オプションは引数の前後どちらに置いても構いません。

| オプション                    | 対象                                        | 説明                                                                                        |
|-------------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------|
| `-f`, `--force`               | `submit`、`tomain`                          | `submit`: サンプルが AC でなくても提出します。`tomain`: 既存のファイルを上書きします。      |
| `-d`, `--debug[=true\|false]` | `test`、`localtest`、`run`                  | デバッグの有効と無効を切り替えます(既定は有効)。                                            |
| `--lang=<name>`               | ソースを受け取るコマンド                    | 言語を設定での名前で選びます(既定は拡張子から)。`crosscheck` の比較相手は `--expected-lang` |
| `--no-header`                 | ソースを受け取るコマンド                    | 先頭にヘッダーを付けません。                                                                |
| `--header=<name>`             | ソースを受け取るコマンド                    | `setheader` で `<name>` に設定したファイルをヘッダーに使います(既定は言語のヘッダー)。      |
| `--full`                      | `test`、`localtest`、`submit`、`crosscheck` | WA の差分を折りたたまず、全行を表示します(`--max-lines` より優先)。                         |
| `--wa-only`                   | `test`、`localtest`、`submit`、`crosscheck` | WA の差分のうち、一致しない行だけを表示します。                                             |
| `--max-lines=N`               | `test`、`localtest`、`submit`、`crosscheck` | WA の差分を折りたたむ行数を変えます(既定は 20)。                                            |
| `--time-limit=N`              | `localtest`、`run`、`crosscheck`            | 実行時間の警告に使う制限(ms)。既定は 2000。表示だけで、実行は打ち切りません。               |

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

| 拡張子  | 名前      | 言語                                                          | 必要な処理系                 | 動作の確認 |
|---------|-----------|---------------------------------------------------------------|------------------------------|------------|
| `.java` | `java`    | Java                                                          | JDK 24 以降                  | 済み       |
| `.cpp`  | `cpp`     | C++23(AtCoder に合わせたオプションの GCC)                     | GCC 15(`g++`)                | 済み       |
| `.c`    | `c`       | C23                                                           | GCC 15(`gcc`)                | 済み       |
| `.py`   | `cpython` | Python(CPython)。`--lang=pypy`、`--lang=codon` でも動きます。 | `python3`、`pypy3`、`codon`  | 済み       |
| `.go`   | `go`      | Go                                                            | `go`                         | 未検証     |
| `.rs`   | `rust`    | Rust。外部のクレートは使えません。                            | `rustc`                      | 未検証     |
| `.kt`   | `kotlin`  | Kotlin(Kotlin/JVM)                                            | `kotlinc` と `java`          | 未検証     |
| `.cs`   | `csharp`  | C#                                                            | .NET 10 以降の SDK(`dotnet`) | 未検証     |

Java 以外の処理系は、サーバーと同じ環境（Windows の既定は WSL）にインストールしてください。PATH にない処理系は `languages` にパスを指定します。`stop`、`serve` の順に実行して再起動すると、`status` で使用可能な言語と、処理系が見つからなかった言語を確認できます。

「未検証」の言語には定義を用意していますが、動作は未確認です。実行できない場合は `compile` と `run` を環境に合わせてください。ほかの言語も、コンパイルと実行のコマンドを定義すれば追加できます。

`.py` の既定の実行環境を PyPy にするなど、拡張子と言語の対応は `extensions` で変更できます。言語の追加や切り替えの書き方は[設定リファレンス](./docs/SETTINGS.md)を参照してください。

サンプルの結果には、実行時間とメモリを表示します。Java 以外は `mem=`(プロセスが使ったメモリの最大値)、Java は `alloc=`(実行中に確保したメモリの合計)で、意味が違います。

`submit` は、言語に合わせて AtCoder の提出先の言語を選びます。設定の `submit` に合う言語がフォームに無いときは、近い言語で代用せずに、候補を表示して止まります。

提出のあとは、その問題の自分の提出のうち、提出前より新しいものを結果として表示します。提出が受け付けられたか確かめられないときは、送り直さずに提出一覧の URL を表示して終わります。一覧で結果を確かめてください。

<a id="ライブラリを使う"></a>

## Java のライブラリを使う

実行や提出の際に、解答が使う登録済みの型とその依存先を `Main.java` にまとめます。**対象は解答1ファイルと、`setlib` で登録した Java ライブラリです。** 解答と同じフォルダにある別のソースは自動で取り込みません。

```bash
setlib C:\path\to\library\src
```

**登録先には、まとめてコンパイルできるソースを置いてください。** サブフォルダの `.java` も読みます。名前が `.` で始まるフォルダは除外します。たとえば [競技プログラミング用 Java ライブラリ](https://github.com/nsubaru11/competitive-programming-java-library) の `lib` だけを使う場合は、`src/lib` を登録します。

`setlib` で現在の登録先を確認し、`setlib --clear` で解除できます。登録先やライブラリのソースを変更したら、`stop`、`serve` の順に実行して読み込み直してください。ライブラリを使わない解答は登録不要です。

### 解答とライブラリの書き方

- **型には通常の `import` または完全修飾名を使ってください。** `import lib.graph.*;`、`import lib.graph.Connectivity.Result;` のどちらも使えます。展開後も `var` の型は Java が推論します。
- **登録ライブラリのメンバーを取り込む `import static` はサポート対象外です。** `Connectivity.lowLink(graph)` のように型名を付けてください。解答にある JDK の `import static` は元の位置に残し、展開するライブラリの分で不足するものだけを解答の import 欄に追加します。**同じ名前が衝突する場合は、`Math.max(a, b)` のように呼び、該当する static import を外してください。**
- **`Main` は提出時の起動クラス名として予約しています。** `public static void main` を宣言したトップレベルの型を使います。引数には `String[]` と `String...` が使えます。候補が複数のときは `Main` を選び、それでも決まらなければ変換を止めます。改名後の起動クラスを参照する場所では、**`Main` を `record` の要素名や列挙定数名に使わないでください。**
- **展開する型に型注釈を付ける場合は、トップレベルの型を import してください。** `pkg.Factory` を import すると、トップレベルの型は `@Mark Factory`、入れ子の型は `Factory.@Mark Inner` と書けます。
- **空白や改行などの区切り文字は、Unicode エスケープを使わずに書いてください。**

展開で型名が衝突するときは、元の参照先を保つために完全修飾名や `Main1` のような連番を使います。たとえば変数 `java` がある場所で `List.of(...)` を呼ぶ場合は、JDK の `List` を import し、登録ライブラリ側の同名型を改名します。**別々の JDK 型がどちらも同じ単純名でしか参照できない場合**は、パッケージ名を隠す変数などを改名してください。

コマンドの `Bundled` で取り込んだファイルを確認できます。展開順の指定は[言語設定](docs/SETTINGS.md#languagesjava)の `libraryLast` を参照してください。

**パッケージ境界を前提にした継承はサポート対象外です。** 通常の継承は使えます。ただし、別パッケージの親子が同名のメソッドを持ち、親側がパッケージプライベートの場合、展開後は新たにオーバーライドが成立することがあります。こうした参照先やオーバーライドの変化を検出すると、変換を止めます。

**実行時に観測できる元のクラス名やパッケージ名は保証しません。** たとえば起動クラス `p.Solver` の `Solver.class.getName()` は提出時に `Main` を返します。`Class.forName("p.Solver")` のように文字列で型を指定するコードも、提出用の名前に書き換えません。元の名前が出力に必要なら、出力したい文字列を解答に明示してください。

## DEBUG の扱い

手元の実行(`test`、`localtest`、`run`)では既定でデバッグを有効にし、`--debug=false` で無効にできます。提出物(`submit`、`tomain`、`toclip`)と `crosscheck` で比較する両方の解答では、常に無効にします。

| 言語   | デバッグが有効なとき                                      | 無効なとき、提出物            |
|--------|-----------------------------------------------------------|-------------------------------|
| Java   | 設定の `debugFlag` に書いた名前の変数を `true` にします。 | その変数を `false` にします。 |
| C++、C | `-DLOCAL` を付けてコンパイルします。                      | `-DLOCAL` を付けません。      |
| Python | 設定の `debugFlag` に書いた名前の変数を `True` にします。 | その変数を `False` にします。 |

`debugFlag` を書かなければ、デバッグ用変数の値は書き換えません。`languages.java` や `languages.cpython` などの `debugFlag` に変数の名前(例: `"DEBUG"`)を書くと、デバッグの有無に合わせて値を書き換えます。Go と Rust も同じです。Kotlin と C# はソースを書き換えられないので、`debugArgs` でコンパイル時に切り替えてください。対応する言語と書き換える宣言は[設定](docs/SETTINGS.md)にあります。

デバッグ出力を標準エラー出力に出しておけば、判定に影響しません。

## 提出用ヘッダー

提出物の先頭に付けるコメントなどのファイルを、`setheader` で設定できます。言語の既定のヘッダーと、名前付きのヘッダーの2通りがあります。ソースを受け取るコマンド(`run`、`test`、`localtest`、`crosscheck`、`submit`、`tomain`、`toclip`)と CP Toolkit の「コードのヘッダーとフッター」が使います。言語の名前には、設定での名前(`java`、`cpp`、`pypy` など)か、言語の種類(`python3` など)を書きます。

```bash
# java の既定のヘッダー。--header を付けなければこれを使う
setheader java C:\path\to\header.txt

# 名前付きのヘッダー。submit --header=short のように選ぶ
setheader short C:\path\to\short.txt
```

- 設定は `local-runner.settings.json` の `headers` に保存します。サーバーの再起動はいりません。
- 相対パスは、コマンドを実行したフォルダを基準にします。保存するのは絶対パスです。
- `setheader` だけで一覧を表示し、`setheader java --clear` で解除します。
- 設定が無ければヘッダーは付けません。設定したファイルが見つからないときや、`--header=<name>` の名前に設定が無いときは、警告を出し、ヘッダーを付けずに続けます。
- 名前付きのヘッダーは `--header=<name>` や CP Toolkit の「ヘッダーの名前」で選べます。CP Toolkit では、設定が無い名前はエラーとして知らせます。
- `--no-header` で、ヘッダーを付けずに出力します。
- 変換後のソースがヘッダーの全文で始まるとき(`toclip` の出力をそのまま使ったときなど)は、重ねて付けません。
- どのコマンドも、ライブラリの展開(変換)、ヘッダーの付与、コンパイルの順に行い、提出するソースそのものを1回だけ実行します。`submit` は、サンプルを実行したソースをそのまま提出します。
- ソースを受け取るコマンドは、変換の結果を次のように表示します。分からない項目と、変えていない項目は出しません。

  ```text
  Transform: A -> Main, DEBUG = false (line 12), package removed
  Header: java (7 lines)
  Added imports: java.lang.invoke.*, java.nio.*
  Bundled: lib.io.FastPrinter (lib/io/FastPrinter.java), lib.io.FastScanner (lib/io/FastScanner.java)
  Source: A.java 120 lines -> 380 lines, 23.4 KiB
  Line offset: header +7, imports +4.
  ```

  `Transform` は元のソースから変えたこと(起動クラスの改名、DEBUG の値と行、package の削除、bundle のコマンド)、`Header` は使ったヘッダーの設定の名前と付けた行数(後ろの空行を含む)です。`Source` は元と最終のソースの行数と大きさで、AtCoder の上限(512 KiB)を超えると警告します。
- エラーの行番号が元のソースとずれるときは、ずれた行数を `Line offset: header +2, imports +4.` のように表示します。エラーの行番号からこの行数を引くと、元のソースの行になります。`imports` は、Java でライブラリが使う import を足した分などです。Java の変換で見つかったコンパイルエラー(名前の誤りなど)は元のソースの行のままなので、表示しません。変換でずれる行数が分からないときは、Java は `imports (unknown)`、`bundle` を設定した言語は `bundle (unknown)` と表示します。

## 実行時間の警告

実行時間は、制限の 80% を超えると黄色、制限以上で赤で表示します。

- `test`、`submit`: 問題ページの実行時間制限を使います。
- `localtest`、`run`、`crosscheck`: 制限が分からないので 2000ms を使います。`--time-limit=3000` のように指定できます。

どちらも表示だけで、実行は設定の `run.timeoutMs`(既定は10秒)まで続きます。手元の実行は本番より速く出やすいので、目安として見てください。

## 提出の準備

`submit` には AtCoder のログイン情報が必要です。ブラウザで AtCoder にログインし、Cookie の `REVEL_SESSION` の値をコピーします。次のコマンドを実行し、値を貼り付けて Enter を押します。

```bash
setsession
```

入力した値は画面に表示されません。保存先は設定項目 `atcoder.sessionFile` で指定できます。既定の保存先はホームディレクトリの `.atcoder/session.txt` です。ログインの有効期限が切れたら、もう一度 `setsession` で保存してください。

## 設定

ポート、タイムアウト、JDK の場所などは、`competitive-programming-tools` フォルダの `local-runner.settings.json` に書きます。変えたい項目だけを書けばよく、ファイルが無ければすべて既定値で動きます。Windows の CLI と WSL のサーバーが同じファイルを読みます。

項目の一覧とパスの書き方は [docs/SETTINGS.md](./docs/SETTINGS.md) を参照してください。今の値は `settings` で確かめられます。

環境変数 `NO_COLOR` を `1` にすると、色付きの表示を止めます。

## 開発

開発には Claude を使用しています。設計と仕様は作者が決めています。

内部の仕様と開発の手順は [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) にまとめています。
