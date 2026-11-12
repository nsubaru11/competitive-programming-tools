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

### languages.java

| 項目      | 既定値   | 反映   | 説明                                                                                                  |
|-----------|----------|--------|-------------------------------------------------------------------------------------------------------|
| `command` | `"java"` | 再起動 | `java` の命令。名前だけなら `java` と `javac` を PATH から探す。パスなら同じフォルダの `javac` を使う |
| `release` | `24`     | 再起動 | 提出先の Java のバージョン。JDK の方が新しいときは、javac の `--release` で揃える                     |
| `library` | なし     | 再起動 | `lib` フォルダを持つ、Java のライブラリの `src` フォルダ。`setlib` が書き込む                         |
| `stackMb` | `256`    | 再起動 | 解答を実行するスレッドのスタック(MB)                                                                  |

### headers

提出物の先頭に付けるファイルを、名前ごとに書きます。`setheader` が書き込みます。反映は「すぐ」です。

- 名前が言語(`java`)なら、その言語の既定のヘッダーになります
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
- `languages.java.command` と `languages.java.library`、`headers` はサーバーが読みます。`atcoder.sessionFile` は CLI が読みます
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

| 以前の環境変数                                  | 今の設定                                                                |
|-------------------------------------------------|-------------------------------------------------------------------------|
| `LOCAL_RUNNER_PORT`、`LOCAL_RUNNER_URL`         | `server.port`                                                           |
| `LOCAL_RUNNER_BACKEND`                          | `server.backend`                                                        |
| `ATCODER_RUNNER_AUTOSTART`                      | `server.autoStart`                                                      |
| `LOCAL_RUNNER_START_TIMEOUT_MS`                 | `server.startTimeoutMs`                                                 |
| `LOCAL_RUNNER_ALLOWED_ORIGINS`                  | `server.extraOrigins`。対応サイトに足す形になった                       |
| `LOCAL_RUNNER_CAPTURE_LIMIT_BYTES`              | `run.outputLimitMb`。単位が MB になった                                 |
| `JAVA_HOME`、`JAVA_HOME_24` など                | `languages.java.command`。PATH の `java` と違う JDK を使うときだけ書く  |
| `ATCODER_JAVA_VER`                              | `languages.java.release`                                                |
| `ATCODER_LIB_SRC`                               | `languages.java.library`                                                |
| `LOCAL_RUNNER_RUN_STACK_BYTES`                  | `languages.java.stackMb`。単位が MB になった                            |
| `ATCODER_SESSION_FILE`                          | `atcoder.sessionFile`                                                   |
| `ATCODER_NO_CACHE`                              | `atcoder.sampleCache`                                                   |
| `ATCODER_SUBMISSION_POLL_TIMEOUT_MS`            | `atcoder.resultWaitMs`                                                  |
| `ATCODER_SESSION`、`ATCODER_COOKIE`             | なし。`REVEL_SESSION` の値を `atcoder.sessionFile` のファイルに保存する |
| `LOCAL_RUNNER_HOST`                             | なし。`127.0.0.1` に固定した                                            |
| `LOCAL_RUNNER_BASE_DIR`、そのほかの開発用の変数 | なし                                                                    |
