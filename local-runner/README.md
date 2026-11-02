# Local Runner

Java の解答を手元で実行、判定、提出するためのツールです。次の2つからなります。

- **CLI**: AtCoder のサンプルでのテスト、提出、提出用コードの作成を行う
- **サーバー**: Java の実行を速くするために常駐する。[CP Toolkit](../userscripts/CpToolkit/README.md) からも接続できる

[CP Toolkit](../userscripts/CpToolkit/README.md) の Java の提出補助で `lib.*` の展開や `import` の補完を使うには、Local Runner が必要です。

動作確認は Windows(WSL)で行っています。

## 必要なもの

- [Bun](https://bun.sh/)
- JDK 24 以降
- Windows では WSL。サーバーは既定で WSL の中で動くので、WSL 側にも Bun と JDK を入れる

## セットアップ

```bash
git clone https://github.com/nsubaru11/competitive-programming-tools.git
cd competitive-programming-tools
bun install
```

これだけで、解答の実行、判定、提出、提出用コードの作成が動きます。`lib.*` を使うときは、[ライブラリを使う](#ライブラリを使う)を参照してください。

Windows では、次のコマンドで `bin` を PATH に登録すると、どのフォルダからでも `test` や `submit` を実行できます。

```powershell
powershell -File ".\local-runner\bin\install-path.ps1"
```

Windows 以外では、`bin` の `.cmd` の代わりに `bun run --cwd local-runner test abc448_d D.java` のように実行します。

## CP Toolkit とつなぐ

1. `serve` でサーバーを起動する。`test` などのコマンドを実行すると自動でも起動する
2. CP Toolkit の設定で「Local Runner」が有効で、接続先の URL が `http://localhost:8080` であることを確かめる
3. 問題ページからも実行するなら、「Easy Test」を有効にする

## 安全のために

サーバーは受け取ったコードを実行するので、次の点に注意してください。

- サーバーは既定で `127.0.0.1` にだけ接続を許します。`LOCAL_RUNNER_HOST` を変更すると同じネットワークの端末からコードを実行できるようになるので、変更しないでください
- ブラウザからの要求は、対応するジャッジサイトからのものだけを受け付けます。`LOCAL_RUNNER_ALLOWED_ORIGINS` で許可するオリジンを差し替えられます
- 同じ PC で動くプログラムからの要求は拒否できません
- 実行するコードはサンドボックスに入らず、起動したユーザーの権限で動きます。内容を確認していないコードは実行しないでください
- `REVEL_SESSION` は AtCoder のログイン情報です。他人に渡さないでください

## コマンド

| コマンド                                                       | 説明                                                                                         |
|----------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `test <taskScreenName> <sourceFile>`                           | AtCoder のサンプルで実行し、AC か WA かを判定する                                            |
| `test <task>`                                                  | 短縮表記。フォルダからコンテストを推定する(例: `test d`)                                     |
| `submit [-f] <taskScreenName> <sourceFile>`                    | サンプルがすべて AC なら提出する。`-f` で強制的に提出する                                    |
| `submit [-f] <task>`                                           | 短縮表記(例: `submit d`)                                                                     |
| `localtest <sourceFile> [testDir]`                             | `.in` と `.out` を自動で探し、オフラインで実行して判定する                                   |
| `run <sourceFile> [inputFile]`                                 | 1回だけ実行して出力を表示する。`inputFile` を省くと標準入力は空になる                        |
| `crosscheck <actualSourceFile> <expectedSourceFile> [testDir]` | `.in` を入力に2つのコードを実行し、標準出力を比べる。`.out` は不要                           |
| `tomain <sourceFile> [outFile]`                                | 提出用の `Main.java` を書き出す。`-f` で上書きする                                           |
| `toclip <sourceFile>`、`toclip <task>`                         | 提出用のソースをクリップボードへコピーする(例: `toclip d`)                                   |
| `serve`                                                        | サーバーを起動し、準備が終わるまで待つ                                                       |
| `stop`                                                         | サーバーを停止する                                                                           |
| `status`                                                       | サーバーの状態を表示する。稼働中なら終了コード 0、停止中なら 1                               |
| `setlib <path>`                                                | Java のライブラリのフォルダを設定する。引数なしで現在の設定を表示し、`--clear` で解除する    |
| `setheader <language\|name> <file>`                            | 言語の既定のヘッダーか、名前付きのヘッダーを設定する。引数なしで一覧を表示し、`--clear` で解除する |
| `cacheclear -a`、`cacheclear -t <taskScreenName>`              | サンプルのキャッシュをすべて、または指定した問題の分だけ削除する                             |

`taskScreenName` は URL の `/tasks/` より後ろの部分です(例: `abc448_d`)。

ライブラリを編集したら、`stop` のあと `serve` で読み込み直してください。

### 短縮表記

`test`、`submit`、`toclip` に引数を1つだけ渡すと短縮表記になります。`abc463/src/java` のフォルダで `test d` を実行すると、`test abc463_d D.java` と同じです。

- `src` の親のフォルダ名をコンテスト名として使う
- 問題の記号は大文字と小文字を区別しない
- 末尾の数字はファイルの違いとして扱う。`test d1` は `D1.java` を問題 `d` のサンプルでテストする
- ソースは現在のフォルダから探す
- `toclip` はコンテスト名を使わないので、どのフォルダでも使える

### オプション

オプションは引数の前後どちらに置いても構いません。

| オプション                    | 対象                                           | 説明                                                                                   |
|-------------------------------|------------------------------------------------|----------------------------------------------------------------------------------------|
| `-f`, `--force`               | `submit`、`tomain`                             | `submit`: サンプルが AC でなくても提出する。`tomain`: 既存のファイルを上書きする       |
| `-d`, `--debug[=true\|false]` | `test`、`localtest`、`run`                     | ソースの `DEBUG` の有効と無効を切り替える(既定は有効)                                  |
| `--no-header`                 | `submit`、`tomain`、`toclip`                   | 提出物の先頭にヘッダーを付けない                                                       |
| `--header=<name>`             | `submit`、`tomain`、`toclip`                   | `setheader` で `<name>` に設定したファイルをヘッダーに使う(既定は `java`)              |
| `--full`                      | `test`、`localtest`、`submit`、`crosscheck`    | WA の差分を折りたたまず、全行を表示する(`--max-lines` より優先)                        |
| `--wa-only`                   | `test`、`localtest`、`submit`、`crosscheck`    | WA の差分のうち、一致しない行だけを表示する                                            |
| `--max-lines=N`               | `test`、`localtest`、`submit`、`crosscheck`    | WA の差分を折りたたむ行数を変える(既定は 20)                                           |
| `--time-limit=N`              | `localtest`、`run`、`crosscheck`               | 実行時間の警告に使う制限(ms)。既定は 2000。表示だけで、実行は打ち切らない              |

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
```

## ライブラリを使う

`lib.*` を import するライブラリを使うときは、フォルダを `setlib` で設定します。作者のライブラリは [competitive-programming-java-library](https://github.com/nsubaru11/competitive-programming-java-library) です。`lib` フォルダを持つものなら、自分のライブラリも使えます。

```bash
setlib C:\path\to\competitive-programming-java-library
```

- ライブラリのルートと、`lib` の親の `src` のどちらを指定しても構いません
- 設定は `local-runner.settings.json` に保存します。Windows で設定したパスは、WSL のサーバーでも使えます
- 設定したら `stop` のあと `serve` で読み込み直してください
- `setlib` だけで現在の設定を表示し、`setlib --clear` で解除します

設定していなくても、サーバーはライブラリなしで起動します。`lib.*` を使うコードは、設定を促すエラーになります。

解答では、通常の Java のコードとしてライブラリを import できます。

```java
import lib.ds.unionfind.UnionFind;
import lib.io.FastPrinter;
import lib.io.FastScanner;
```

`run`、`localtest`、`test`、`crosscheck`、`tomain`、`toclip`、`submit` は、実行の前に `lib.*` の import を検出し、必要なクラスと依存するクラスを1つのソースへ展開します。

- 展開したクラスは `Bundled library classes: ...` と表示する
- `import lib.io.*;` のようなワイルドカードでも、実際に使っている型だけを展開する
- 提出コードの元の import はコメントアウトして残す
- import を書かなくても、単純名がライブラリの中で一意なら補完する。標準 API と同名のときは標準 API を優先する
- `import static lib...`、本文中の `lib.ds.unionfind.UnionFind` のような完全修飾の参照、展開すると単純名が衝突する型はエラーになる
- `patterns.*` は展開しない

提出用の `Main` にするのは、`public static void main(String[])` を持つトップレベルの型です。複数あるときは `Main` という名前の型を選びます。それも無いときや候補が無いときはエラーで止まります。

## DEBUG の扱い

ソースの `DEBUG = true` は、提出物(`submit`、`tomain`、`toclip`)では常に `false` にします。手元の実行(`test`、`localtest`、`run`)では既定で `true` のまま実行し、`--debug=false` で切り替えられます。

デバッグ出力を `System.err` に出しておけば、判定に影響しません。

## 提出用ヘッダー

提出物の先頭に付けるコメントなどのファイルを、`setheader` で設定できます。言語の既定のヘッダーと、名前付きのヘッダーの2通りがあります。`submit`、`tomain`、`toclip` と CP Toolkit の Java の提出補助が使います。今のところ変換に対応している言語は Java だけなので、使われるのは `java` の設定です。

```bash
# java の既定のヘッダー。--header を付けなければこれを使う
setheader java C:\path\to\header.txt

# 名前付きのヘッダー。submit --header=short のように選ぶ
setheader short C:\path\to\short.txt
```

- 設定は `local-runner.settings.json` に保存します。サーバーの再起動はいりません
- `setheader` だけで一覧を表示し、`setheader java --clear` で解除します
- 設定が無ければヘッダーは付けません。設定したファイルが見つからないときはエラーで止まります
- 名前付きのヘッダーは `--header=<name>` や CP Toolkit の「ヘッダーの名前」で選べます。設定が無い名前はエラーになります
- `--no-header` で、ヘッダーを付けずに出力します
- ソースがヘッダーの1行目で始まるときは、重ねて付けません
- `run`、`test`、`localtest`、`crosscheck` と Easy Test の実行には付けません。行番号が元のソースと揃います

## 実行時間の警告

実行時間は、制限の 80% を超えると黄色、制限以上で赤で表示します。

- `test`、`submit`: 問題ページの実行時間制限を使う
- `localtest`、`run`、`crosscheck`: 制限が分からないので 2000ms を使う。`--time-limit=3000` のように指定できる

どちらも表示だけで、実行は最大10秒まで続きます。手元の実行は本番より速く出やすいので、目安として見てください。

## 提出の準備

`submit` には AtCoder のログイン情報が必要です。ブラウザの Cookie の `REVEL_SESSION` の値をファイルへ保存します。

```powershell
New-Item -ItemType Directory -Force "$HOME\.atcoder" | Out-Null
Set-Content -Path "$HOME\.atcoder\session.txt" -Value "<REVEL_SESSIONの値>" -Encoding UTF8
```

## 環境変数

| 変数                       | 説明                                                                | 既定値                         |
|----------------------------|---------------------------------------------------------------------|--------------------------------|
| `LOCAL_RUNNER_URL`         | サーバーの URL                                                      | `http://localhost:8080`        |
| `LOCAL_RUNNER_PORT`        | サーバーのポート                                                    | `8080`                         |
| `LOCAL_RUNNER_BACKEND`     | Windows で `native` にすると、WSL を使わずに Windows の Bun と JDK で動かす | `wsl`                          |
| `ATCODER_RUNNER_AUTOSTART` | `0` でサーバーの自動起動を止める                                    | 有効                           |
| `ATCODER_JAVA_VER`         | 提出先の Java のバージョン                                          | `24`                           |
| `ATCODER_LIB_SRC`          | Java のライブラリの `src` フォルダ。`setlib` の設定より優先する     | なし                           |
| `ATCODER_SESSION_FILE`     | `REVEL_SESSION` を保存したファイル                                  | `~/.atcoder/session.txt`       |
| `ATCODER_SESSION`          | `REVEL_SESSION` の値                                                | なし                           |
| `ATCODER_COOKIE`           | 提出に使う Cookie 全体                                              | なし                           |
| `NO_COLOR`                 | `1` で色付きの表示を止める                                          | なし                           |

既定値の相対パスは `tools` からの位置です。

Windows から WSL のサーバーを起動するときは、Windows 側の環境変数が引き継がれません。サーバーが読む変数(`LOCAL_RUNNER_PORT`、`ATCODER_LIB_SRC`)は、WSL の `~/.profile` に設定してください。`setlib` と `setheader` の設定は引き継がれます。

## 開発

内部の仕様と開発の手順は [DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。
