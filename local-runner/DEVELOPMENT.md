# Local Runner の開発

Local Runner を変更する人向けの文書です。使い方は [README.md](./README.md) にあります。Java 側の構成は [java/README.md](./java/README.md)、通信の仕様は [java/src/PROTOCOL.md](./java/src/PROTOCOL.md) を参照してください。

## 構成

```text
local-runner/
├── package.json
├── src/
│   ├── cli/           # test、submit、短縮表記、AtCoder との通信、サンプルの判定
│   ├── daemon/        # server.ts(HTTP API)、dispatcher.ts(常駐 JVM との連携)、compiler.ts(javac のキャッシュ)、
│   │                  # commandEngine.ts(コマンドで動かす言語)、processRunner.ts(プロセスの起動と計測)
│   ├── settings/      # 設定ファイルの読み込みと検査、既定値(defaults.json)
│   ├── config.ts      # 設定から決めた値と定数
│   ├── utils/         # ログ、色、整形、ファイル操作
│   └── types/         # 型定義
├── settings.schema.json  # 設定ファイルの項目の定義
├── bin/               # test.cmd、submit.cmd、起動スクリプト
├── native/            # launcher.c(解答のプロセスを起動して計測するプログラム)
└── java/              # Dispatcher など常駐 JVM のクラス、PROTOCOL.md、WarmUp.java
```

`@atcoder-tools/shared` の URL 生成、Local Runner のリクエスト、Easy Test の判定を使っています。CLI のサンプルの判定は、CP Toolkit の Easy Test+ と同じ `evaluateEasyTestOutput` です。

## 提出前の処理

提出前の処理は TypeScript の正規表現ではなく、常駐 JVM の Java Compiler API(`JavacTask`、`Trees`、`SourcePositions`)で行います。型の解決、`Main` の対象、コンストラクタと自己参照、`DEBUG` のフィールド、package と import の範囲を javac の構文木とシンボルから決め、生成した単一のソースも再び解析します。

ライブラリの場所は推測せず、設定の `languages.java.library` から読みます。`setlib` はこの項目を書き込みます。

場所が設定されていないか見つからないときは、空の `lib` を渡して起動します。解答の変換は同じ経路を通り、`lib.*` の import はコンパイルエラーになります。このとき `server.ts` は診断の先頭に設定の案内を足し、応答の `libraryMissing` を立てます。CP Toolkit はこの値で案内を切り替えます。`WarmUp.java` は `lib.io` を使うので、ライブラリなしではウォームアップを行いません。

同名の候補があるときは、パッケージの階層が最短の標準 API を優先します。同順位が複数あれば、曖昧としてエラーで止めます。

## 言語

使える言語は、起動時に設定の `languages` から決めます(`daemon/languages.ts`)。要求の `compilerName` が言語の名前で、省略されていれば Java として扱います。

| 言語     | 経路                                                                               |
|----------|------------------------------------------------------------------------------------|
| `java`   | 常駐 JVM(`dispatcher.ts`、`compiler.ts`)。変換、コンパイル、実行を JVM の中で行う  |
| それ以外 | `commandEngine.ts`。設定のコマンドでコンパイルし、サンプルごとにプロセスを起動する |

`commandEngine.ts` は設定を直接読まず、言語の定義と上限を引数で受け取ります。テストは、PATH の `python3` と `cc` で言語を定義して動かします。

- コンパイルの結果は、言語、コンパイルの引数、ソースから決めた `programId` で使い回す。保存は `/dev/shm` の作業フォルダで、サーバーを起動し直すと消える
- 実行は1つずつ行う。同時に動かすと時間の測定がぶれる
- エラーのメッセージは、作業フォルダの場所を除いて返す。利用者には `Main.cpp:4:11` のように見える

### プロセスの計測

解答のプロセスは、`native/launcher.c` をビルドした起動プログラムを通して起動します(`processRunner.ts`)。

サーバー(Bun)から直接起動すると、子プロセスのメモリの最大値に Bun 自身の使用量(約 20MB)が混ざります。Linux は、`exec` の前のメモリの最大値をプロセスに引き継ぐためです。小さな起動プログラムが `fork` して `wait4` で値を受け取ることで、解答だけの値になります。

起動プログラムは、スタックの上限の設定、制限時間での強制終了、終了の理由と時間とメモリの報告も受け持ちます。解答は別のプロセスグループで動かし、解答が起動した子プロセスもまとめて止めます。

C コンパイラが無くて起動プログラムをビルドできないときは、`prlimit` と Bun の計測で代用します。この経路もテストしています。

### header unit

`daemon/headerUnit.ts` が、`builtin:gcc-header-unit` を実装します。コンパイルの引数からソース、出力先、リンクの指定を除いたものを鍵にして、`g++ -x c++-header` の結果を保存し、解答のコンパイルに `-fmodule-mapper` で渡します。

デバッグの有無で引数が変わるので、言語ごとに2つできます。起動時にデバッグありの方を先に作り、今の設定に無い鍵のものを消します。

## 提出用ヘッダー

ヘッダーはデーモンが付けます(`daemon/header.ts`)。CLI と CP Toolkit が同じ設定を使えるようにするためで、設定は要求ごとに読むので再起動はいりません。

要求の `header` は `true`(言語の設定)、文字列(設定した名前)、`false`(付けない)のいずれかです。名前は HTTP で受け取る値なので、`local-runner.settings.json` の `headers` を引くキーとしてだけ使い、パスとしては扱いません。言語の既定のヘッダーは、言語の名前、種類の順に `headers` を引きます。

## 起動とウォームアップ

`test`、`submit`、`localtest`、`run` は、サーバーが未起動なら WSL の中へ自動で起動します。

- 起動時にライブラリのソースを `/dev/shm` へ同期して一度だけ class にする。解答の解析はその classpath を使う
- 提出用の本文だけを同期済みのソースから取得するので、コンパイルと実行の環境を WSL に統一したまま NTFS をまたぐ負荷を避けられる
- 実行時はソースを一度だけ `prepare` して変換とコンパイルを行い、以降の各サンプルは `programId` と標準入力だけを送る
- `lib.io.FastScanner` と `lib.io.FastPrinter` は最小構成の `WarmUp.java` から通常どおり import する。起動時にこのファイルを提出用に変換してからコンパイルし、メモリ入力と破棄出力で `nextInt`、`nextLong`、`println(long)` を実行して、class の解決、依存の解析、インライン、javac、I/O の JIT の経路を温める

Easy Test+ は最後のエディタの変更から 180ms 後に `prepare` し、得られた `programId` を同じソースのテストで再利用します。貼り付けの直後にテストした場合も、進行中の `prepare` を全サンプルで共有します。旧クライアント向けの `precompile` 要求はすぐに `accepted` を返し、サーバー側の 150ms のデバウンスの後に同じ `prepare` の経路を使います。実行の要求が先に届いたら、待機中の同じ `precompile` を取り消します。

短縮表記では、コンテスト ID と問題 ID の接頭辞が異なる `jsc2025advance-final`、`jsc2026advance-final`、`tessoku-book` を、それぞれ `abc422`、`abc474`、`tessoku_book` に固定で対応させています。範囲のフォルダ(`451-500` など)はコンテスト名に使いません。

## 設定

利用者向けの説明は [SETTINGS.md](./SETTINGS.md) にあります。

設定は `local-runner.settings.json` の1ファイルで、Windows の CLI と WSL のサーバーの両方から読めるようリポジトリの中に置き、Git には入れません。利用者が書くのは変えたい項目だけで、`src/settings/settings.ts` が既定値(`src/settings/defaults.json`)に重ねます。

- 項目の名前、型、範囲は `settings.schema.json` だけに書く。`src/settings/schema.ts` がこのファイルで検査するので、エディターの補完と実行時の検査が食い違わない
- 項目を足すときは、`settings.schema.json`、`defaults.json`、`settings.ts` の `Settings` 型、`SETTINGS.md` を直す
- 利用者が足す言語に必要な項目は、既定値と重ねたあとで `settings.ts` が確かめる。既定の言語の上書きでは一部しか書かないので、スキーマでは必須にできない
- `family` に書ける値は、CP Toolkit の `data/languages.yaml` の ID と同じにする。食い違うとテストが失敗する
- パスは Windows と WSL のどちらの形でも書ける。使う側が `resolveConfiguredPath` で、自分の OS の形に直す
- サーバーが起動時に読む項目は、`serverSettingsDigest` の対象にする。`status` は、この値で起動後の変更を見つける
- `headers` は要求のたびに読み直す。それ以外は、プロセスの起動時に一度だけ読む

環境変数は設定に使いません。読むのは次の3つだけです。

| 変数                         | 用途                                                                     |
|------------------------------|--------------------------------------------------------------------------|
| `LOCAL_RUNNER_SETTINGS_FILE` | 設定ファイルの場所。テストが、利用者の設定を読まないようにするために使う |
| `LOCAL_RUNNER_PROJECT_ROOT`  | `tools` フォルダの場所。`bin/_runner.cmd` が、exe にした CLI へ渡す      |
| `NO_COLOR`                   | 色付きの表示を止める                                                     |

サーバーは、常駐 JVM へ設定の値を環境変数(`LOCAL_RUNNER_JAVAC_RELEASE`、`LOCAL_RUNNER_RUN_STACK_BYTES`、`LOCAL_RUNNER_CAPTURE_LIMIT_BYTES`)で渡します。これらは起動のたびにサーバーが決めるので、利用者が設定しても使われません。

起動した JDK が `languages.java.release` より新しいときは、javac の `--release` で提出先の API と構文に揃えます。バージョンが違うと起動時に警告します。

## ビルド

CLI のソースを変更したら `bun run build`(型チェックと CLI の exe 化)を実行します。`bin/_runner.cmd` はこの exe があれば使い、無ければ `bun src` で実行します。

```powershell
bun run --cwd local-runner build
```

サーバーは単一のバイナリにしません。通常は `bin/start-local-runner.sh` から WSL の `bun ./src/daemon/server.ts` を実行します。Java のコンパイルは外部の `javac` を都度起動せず、常駐する Dispatcher の中の javac で行います。`Dispatcher.class` はソースが変わらなければキャッシュを再利用します。

## 確認

リポジトリのルートで実行します。JDK 24 の `javac` が PATH に必要です。

```powershell
bun run typecheck:runner
bun run test:runner
```

## 関連する文書

- [../README.md](../README.md)
- [../shared/README.md](../shared/README.md)
- [../userscripts/README.md](../userscripts/README.md)
