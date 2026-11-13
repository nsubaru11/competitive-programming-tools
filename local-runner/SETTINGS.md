# Local Runner の設定

Local Runner の設定は、`tools` フォルダの `local-runner.settings.json` の1つにまとめています。Windows の CLI と WSL のサーバーが同じファイルを読みます。

- 書くのは変えたい項目だけです。書かなかった項目は既定値で動きます
- ファイルが無ければ、すべて既定値で動きます。`setlib` と `setheader` は、このファイルを作って書き込みます
- 環境ごとに違うので、Git には入れません
- 既定値の一覧は [src/settings/defaults.json](./src/settings/defaults.json) です。このファイルは書き換えず、同じ形で `local-runner.settings.json` に書きます

## 書き方

ライブラリとヘッダーを設定し、ポートを変える例です。

```json
{
	"$schema": "./local-runner/settings.schema.json",
	"server": {
		"port": 8081
	},
	"languages": {
		"java": {
			"library": "../library/java/src"
		}
	},
	"headers": {
		"java": "../templates/header/java.txt"
	}
}
```

`$schema` を書いておくと、VS Code や JetBrains の IDE が項目の補完と説明、既定値を表示します。

## 項目

「反映」の列は、変更が効く時期です。「再起動」は `stop` のあと `serve` が要る項目、「すぐ」は次のコマンドから効く項目です。

### server

| 項目             | 既定値  | 反映   | 説明                                                                                               |
|------------------|---------|--------|----------------------------------------------------------------------------------------------------|
| `port`           | `8080`  | 再起動 | サーバーのポート。CLI の接続先もここから決まる                                                     |
| `backend`        | `"wsl"` | すぐ   | Windows でサーバーを動かす場所。`"native"` にすると、WSL を使わずに Windows の Bun と JDK で動かす |
| `autoStart`      | `true`  | すぐ   | サーバーが動いていないとき、`test` などのコマンドが自動で起動する                                  |
| `startTimeoutMs` | `60000` | すぐ   | 自動で起動したサーバーの準備を待つ時間(ms)                                                         |
| `extraOrigins`   | `[]`    | 再起動 | 対応するジャッジサイトのほかに、ブラウザからの要求を許すオリジン                                   |

ポートを変えたら、CP Toolkit の設定にある Local Runner の URL も同じポートに変えてください。

`extraOrigins` に書いたオリジンのページは、この PC でコードを実行できるようになります。自分で用意したページだけを書いてください。

### run

| 項目               | 既定値  | 反映   | 説明                                                       |
|--------------------|---------|--------|------------------------------------------------------------|
| `timeoutMs`        | `10000` | 再起動 | 1回の実行を打ち切る時間(ms)                                |
| `compileTimeoutMs` | `30000` | 再起動 | コンパイルと提出用の変換を打ち切る時間(ms)                 |
| `outputLimitMb`    | `2`     | 再起動 | 標準出力と標準エラー出力のそれぞれで、取り込む量の上限(MB) |

### languages

言語ごとの実行環境です。名前(`java`、`cpp` など)ごとに項目を書きます。反映は「再起動」です。`submit` だけは CLI が読むので「すぐ」です。

既定では次の6つが入っています。処理系が見つからない言語は使わないだけで、サーバーは起動します。使える言語は `status` で確かめられます。

| 名前      | 種類      | 既定の `command` | 内容                                                                     |
|-----------|-----------|------------------|--------------------------------------------------------------------------|
| `java`    | `java`    | `java`           | 常駐する JVM で動かす。`lib.*` の展開と `Main` への変換を行う            |
| `cpp`     | `cpp`     | `g++`            | AtCoder の C++23(GCC 15)のオプション。header unit でコンパイルを速くする |
| `c`       | `c`       | `gcc`            | AtCoder の C23 のオプション                                              |
| `cpython` | `python3` | `python3`        | 実行の前に構文を検査する                                                 |
| `pypy`    | `python3` | `pypy3`          | 同上                                                                     |
| `codon`   | `python3` | `codon`          | `codon build --release` でコンパイルする                                 |

- 既定の言語は、変えたい項目だけを書けば残りは既定値のままです。処理系が PATH に無いときは、`command` にパスを書きます
- AtCoder と違うバージョンの処理系でも動きますが、オプションが合わないときは `compile` を書き換えます。たとえば GCC 14 以前は `-fmodules` を受け付けません
- Java 以外の言語は、サーバーが WSL か Linux で動いているときだけ使えます
- Codon は Python と書き方が違うところがあり、CPython 向けのコードがそのまま動くとは限りません

#### languages.java

| 項目      | 既定値   | 説明                                                                                                  |
|-----------|----------|-------------------------------------------------------------------------------------------------------|
| `command` | `"java"` | `java` の命令。名前だけなら `java` と `javac` を PATH から探す。パスなら同じフォルダの `javac` を使う |
| `release` | `24`     | 提出先の Java のバージョン。JDK の方が新しいときは、javac の `--release` で揃える                     |
| `library` | なし     | Java のライブラリの場所。`lib` フォルダを持つ `src` フォルダか、その親のフォルダ。`setlib` が書き込む |
| `stackMb` | `256`    | 解答を実行するスレッドのスタック(MB)                                                                  |

#### Java 以外の言語

コンパイルと実行をコマンドで行います。

| 項目           | 説明                                                                                                   |
|----------------|--------------------------------------------------------------------------------------------------------|
| `family`       | 言語の種類(`cpp`、`python3`、`rust` など)。CP Toolkit は、ページの言語と同じ種類の実行環境を候補にする |
| `name`         | 表示に使う名前                                                                                         |
| `match`        | ページの言語の表記にこの語が含まれていれば、同じ種類の中でこの実行環境を先頭にする(例: `["PyPy"]`)     |
| `submit`       | AtCoder の提出フォームの言語名に含まれる文字列(例: `"C++23 (GCC"`)。`submit` がこの言語で提出する      |
| `command`      | 処理系の命令。名前だけなら PATH から探す。パスなら、サーバーが動く側(WSL)のパスで書く                  |
| `sourceFile`   | 作業フォルダへ書き出すソースのファイル名(例: `Main.cpp`)                                               |
| `compile`      | コンパイルの引数の並び。書かなければコンパイルしない                                                   |
| `run`          | 実行の引数の並び                                                                                       |
| `debugArgs`    | デバッグが有効なとき、`compile` の末尾に足す引数(例: `["-DLOCAL"]`)                                    |
| `debugRewrite` | `true` にすると、ソースの `DEBUG = True` をデバッグの有無に合わせて書き換える。提出物では偽にする      |
| `stackMb`      | スタックの上限(MB)。既定値は `1024`                                                                    |
| `setup`        | `"builtin:gcc-header-unit"` と書くと、header unit でコンパイルを速くする(後述)                         |
| `bundle`       | コンパイルの前と提出物の作成で通す、変換のコマンド(後述)                                               |
| `enabled`      | `false` にすると、この言語を使わない                                                                   |

`compile`、`run`、`bundle` の引数では、次の名前が置き換わります。先頭が `~/` の引数は、ホームからのパスになります。

| 名前        | 置き換わる内容                     |
|-------------|------------------------------------|
| `{command}` | `command` の実体の場所             |
| `{source}`  | `sourceFile` の名前                |
| `{output}`  | コンパイルで作る実行ファイルの場所 |
| `{dir}`     | そのプログラムの作業フォルダ       |

コンパイルと実行は、作業フォルダをカレントにして行います。

#### 言語を足す

新しい名前で `family`、`name`、`command`、`sourceFile`、`run` を書くと、言語が増えます。名前は英小文字で始め、英小文字、数字、`-`、`_` を使います。Rust を足す例です。

```json
{
	"languages": {
		"rust": {
			"family": "rust",
			"name": "Rust",
			"command": "rustc",
			"sourceFile": "main.rs",
			"compile": ["{command}", "--edition", "2024", "-O", "{source}", "-o", "{output}"],
			"run": ["{output}"]
		}
	}
}
```

書き方の例は、既定の6言語の定義([src/settings/defaults.json](./src/settings/defaults.json))も参考にしてください。

`submit` で提出するには、`submit` の項目も書きます。AtCoder の提出フォームに並ぶ言語名の一部で、ほかの言語と区別できる長さにします(例: `"Rust (rustc"`)。合う言語がフォームに無いときは、候補を表示して止まります。

ソースの拡張子で選べるようにするには、`extensions` に足します。

#### header unit

`#include <bits/stdc++.h>` は標準ライブラリの全体で、コンパイルのたびに読むのに数秒かかります。`"setup": "builtin:gcc-header-unit"` を書くと、読み終えた結果を保存して使い回します。

- 保存先は `~/.cache/competitive-programming/local-runner/header-units` です。1つが約 30MB で、今の設定で使わなくなったものは起動時に消します
- 標準ライブラリの中身はマクロやオプションで変わるので、コンパイルの引数の組ごとに別のものを作ります。作るのは最初の1回で、5秒ほどかかります
- ソースの `#include` より前に書いた `#define` と `#pragma GCC optimize` は、標準ライブラリには効きません。効かせたいときは、マクロを `compile` に `-D` で書くか、`setup` を外します
- g++ と、`compile` の中の `-fmodules` が必要です。作れなかったときは、header unit なしでコンパイルします

#### bundle

`bundle` には、ソースを標準入力で受け取り、変換したソースを標準出力へ返すコマンドを書きます。自作のライブラリを1つのファイルへ展開するツールなどを組み込めます。

- 実行の前のコンパイルと、提出物の作成(`submit`、`tomain`、`toclip`)の両方で通します
- 終了コードが 0 以外なら、エラー出力をコンパイルエラーとして表示します

#### 時間とメモリ

Java 以外の言語は、サンプルごとにプロセスを起動して測ります。

- 時間は、プロセスの起動から終了までです。インタープリターの起動時間も含みます
- メモリは、プロセスが同時に使った物理メモリの最大値で、処理系の分を含みます。AtCoder の「メモリ」に近い値です
- Java の値は、実行中に確保したメモリの合計です。解放した分も足されるので、ほかの言語や AtCoder の値とは比べられません
- 正確に測るために、起動時に小さな C のプログラムをビルドします。C コンパイラ(`cc` か `gcc`)が無いと、約 20MB より小さい値が正しく出ません

### extensions

ソースの拡張子から言語を選ぶ対応です。値は `languages` の名前で、反映は「すぐ」です。

| 拡張子  | 既定値      |
|---------|-------------|
| `.java` | `"java"`    |
| `.cpp`  | `"cpp"`     |
| `.c`    | `"c"`       |
| `.py`   | `"cpython"` |

- `.py` を PyPy で動かすなら、`".py": "pypy"` と書きます。1回だけ変えるときは、コマンドに `--lang=pypy` を付けます
- 拡張子を省いた指定(`test d` や `test abc448_d D`)は、ここにある拡張子でソースを探します

### headers

提出物の先頭に付けるファイルを、名前ごとに書きます。`setheader` が書き込みます。反映は「すぐ」です。

- 名前が言語の名前(`java`、`pypy` など)か種類(`python3` など)なら、その言語の既定のヘッダーになります。両方あれば名前を優先します
- それ以外の名前は、`--header=<名前>` で選びます

### atcoder

| 項目           | 既定値                     | 反映 | 説明                                   |
|----------------|----------------------------|------|----------------------------------------|
| `sessionFile`  | `"~/.atcoder/session.txt"` | すぐ | `REVEL_SESSION` の値を保存したファイル |
| `sampleCache`  | `true`                     | すぐ | 取得したサンプルを保存して使い回す     |
| `resultWaitMs` | `300000`                   | すぐ | 提出の結果が確定するのを待つ時間(ms)   |

`REVEL_SESSION` の値そのものは、設定ファイルには書きません。

## パスの書き方

設定は Windows の CLI と WSL のサーバーの両方が読むので、パスは読む側に合わせて読み替えます。

| 書き方                 | 読まれ方                                                                              |
|------------------------|---------------------------------------------------------------------------------------|
| 相対パス               | 設定ファイルのあるフォルダ(`tools`)から。どちらが読んでも同じ場所を指す               |
| `C:/...`、`/mnt/c/...` | 読む側の形に自動で読み替える                                                          |
| `~/...`                | 読む側のホーム。WSL のサーバーなら WSL のホーム、Windows の CLI なら Windows のホーム |
| `/home/...`            | WSL だけにある場所。サーバーが読む項目にだけ書ける                                    |

- リポジトリの中のファイルは、相対パスで書くのを勧めます
- JSON では `\` を `\\` と書く必要があります。`C:/Users/...` のように `/` で書けます
- `languages` の `command` と `library`、`headers` はサーバーが読みます。`atcoder.sessionFile` は CLI が読みます
- `"server.backend": "native"` のときはサーバーも Windows で動くので、`languages.java.command` は Windows のパスで書きます

## 設定を確かめる

| コマンド   | 表示するもの                                                                   |
|------------|--------------------------------------------------------------------------------|
| `settings` | 全項目と今の値。既定値と違う項目には `*` が付く                                |
| `status`   | 設定ファイルの場所。サーバーの起動後に「再起動」の項目が変わっていれば知らせる |

設定ファイルに誤りがあると、コマンドは項目の名前と理由を表示して止まります。

- `unknown setting`: 項目の名前が違います
- `must be an integer` など: 値の型や範囲が違います
- `is not valid JSON`: かっこやカンマなど、JSON の書き方が違います

## 以前のバージョンからの移行

環境変数での設定はやめ、すべて設定ファイルに移しました。更新したら、次の順に行ってください。

1. `stop` のあと `serve` でサーバーを起動し直す。CLI を exe にビルドしていた場合は、`bun run --cwd local-runner build` でビルドし直す
2. 環境変数を設定していた場合は、下の表の項目へ書き写す。設定されたままの変数があると、コマンドの実行時に案内が出る

`setlib` と `setheader` で設定していた内容は、初回の実行で新しい形式へ自動で書き換わります。元のファイルは `local-runner.settings.json.bak` に残ります。

| 以前の環境変数                                       | 今の設定                                                                |
|------------------------------------------------------|-------------------------------------------------------------------------|
| `LOCAL_RUNNER_PORT`、`LOCAL_RUNNER_URL`              | `server.port`                                                           |
| `LOCAL_RUNNER_BACKEND`                               | `server.backend`                                                        |
| `ATCODER_RUNNER_AUTOSTART`                           | `server.autoStart`                                                      |
| `LOCAL_RUNNER_START_TIMEOUT_MS`                      | `server.startTimeoutMs`                                                 |
| `LOCAL_RUNNER_ALLOWED_ORIGINS`                       | `server.extraOrigins`。対応サイトに足す形になった                       |
| `JAVA_HOME`、`JAVA_HOME_24` など                     | `languages.java.command`。PATH の `java` と違う JDK を使うときだけ書く  |
| `ATCODER_JAVA_VER`                                   | `languages.java.release`                                                |
| `ATCODER_LIB_SRC`                                    | `languages.java.library`                                                |
| `LOCAL_RUNNER_RUN_STACK_BYTES`                       | `languages.java.stackMb`。単位が MB になった                            |
| `ATCODER_SESSION_FILE`                               | `atcoder.sessionFile`                                                   |
| `ATCODER_SESSION`、`ATCODER_COOKIE`                  | なし。`REVEL_SESSION` の値を `atcoder.sessionFile` のファイルに保存する |
| `LOCAL_RUNNER_HOST`                                  | なし。`127.0.0.1` に固定した                                            |
| `LOCAL_RUNNER_BUN`、`LOCAL_RUNNER_INPROCESS_COMPILE` | なし                                                                    |
