# Local Runner の開発

Local Runner を変更する人向けの文書です。使い方は [README.md](./README.md) にあります。Java 側の構成は [java/README.md](./java/README.md)、通信の仕様は [java/src/PROTOCOL.md](./java/src/PROTOCOL.md) を参照してください。

## 構成

```text
local-runner/
├── package.json
├── src/
│   ├── cli/           # test、submit、短縮表記、AtCoder との通信、サンプルの判定
│   ├── daemon/        # server.ts(HTTP API)、dispatcher.ts(常駐 JVM との連携)、compiler.ts(javac のキャッシュ)、
│   │                  # languages.ts(使える言語)、preparationQueue.ts(コンパイルの順番待ち)、
│   │                  # commandEngine.ts(コマンドで動かす言語)、processRunner.ts(プロセスの起動と計測)、
│   │                  # headerUnit.ts(C++ の header unit)
│   ├── settings/      # 設定ファイルの読み込みと検査、既定値(defaults.json)
│   ├── config.ts      # 設定から決めた値と定数
│   ├── utils/         # ログ、色、整形、ファイル操作
│   └── types/         # 型定義
├── settings.schema.json  # 設定ファイルの項目の定義
├── bin/               # test.cmd、submit.cmd、起動スクリプト
├── native/            # launcher.c(解答のプロセスを起動して計測するプログラム)
└── java/              # Dispatcher など常駐 JVM のクラス、PROTOCOL.md、WarmUp.java
```

`@atcoder-tools/shared` の URL 生成、Local Runner の要求と応答の型、結果の表記(`toEasyTestStatus`)を使っています。CLI のサンプルの判定は行ごとの比較(`cli/sampleJudge.ts`)で、CP Toolkit の Easy Test+ の判定(`evaluateEasyTestOutput`)とは別です。

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

- コンパイルの結果は、言語、コンパイルの引数、ソースから決めた `programId` で使い回す。保存は `/dev/shm` の作業フォルダで、サーバーを起動し直しても残っていれば使う(WSL を再起動すると消える)
- コンパイルの記録は、Java も含めて `[Compile] Lang=<言語> Status=<OK|NG|CACHED|CANCELED> Time=<時間> Id=<programId>` の形にそろえる。`CACHED` は、コンパイルせずに前の結果を使ったことを、`CANCELED` は新しいソースが届いて中断したことを表す。実行の記録は `[Run] Lang=<言語> Mode=<経路> Status=... Wait=... Exec=... Total=...` で残す。`Wait` はサーバーが実行の要求を受け取ってから実行が始まるまで(コンパイル待ちと、実行の順番待ちを含む)、`Exec` は実行そのもの、`Total` は結果が出るまでの時間
- 実行は1つずつ行う。同時に動かすと時間の測定がぶれる
- エラーのメッセージは、作業フォルダの場所を除いて返す。利用者には `Main.cpp:4:11` のように見える

### コンパイルの順番待ち

変換とコンパイルは、言語によらず `daemon/preparationQueue.ts` が1つずつ順番に行い、結果を覚えておきます。同時に動かすと、どのコンパイルも遅くなるためです。

| 要求                       | 動き                                                                                                 |
|----------------------------|------------------------------------------------------------------------------------------------------|
| `precompile`               | 順番待ちに入れて、結果を待たずに `accepted` を返す                                                   |
| `prepare`                  | 結果を待って返す。CLI が使う                                                                         |
| `run`(`sourceCode` を渡す) | そのソースのコンパイルが終わるのを待ってから実行する。コンパイルエラーは実行の応答の `stderr` で返す |
| `run`(`programId` を渡す)  | コンパイル済みのプログラムを実行する                                                                 |

- 誰も結果を待っていないうちに同じ言語の新しいソースが届いたら、古いソースのコンパイルを中断する。編集のたびに届く `precompile` のうち、最後のものだけをコンパイルするため
- 中断は、コンパイラをプロセスグループごと止める(`processRunner.ts`)。g++ が起動した cc1plus なども残さない。Java は常駐 JVM の中の処理を止められないので、変換とコンパイルの間で確かめる
- 実行の要求は、応答のヘッダーだけを先に返してから、コンパイルと実行を待つ。Tampermonkey は応答のヘッダーが届くまで次の要求を送らないので、待つ間に CP Toolkit のほかの要求(実行の候補の取得など)が止まらないようにする
- 覚えている結果は、言語ごとの実行環境のコンパイル結果と同じ数まで。実行しようとしたプログラムが追い出されていたら、コンパイルし直して1回だけやり直す

### CLI での言語の選択

CLI は、ソースの拡張子と `--lang` から言語を決めます(`cli/language.ts`)。サーバーへは、言語の名前を `compilerName` として送ります。

- サーバーがソースを書き出すときの名前(`Main.java`、`Main.cpp` など)は、エラーの表示で元のファイル名へ戻す。Java だけは、クラス名の `Main` も元に戻す
- コンパイル済みのプログラムがサーバーから消えていたら、同じ要求でコンパイルし直す。変換済みのソースを送り直すと、`bundle` を2回通してしまう
- 提出先の言語は、提出フォームの問題ごとの選択欄から読む(`parser.ts`)。Java は固定の ID を先に試し、ほかの言語は設定の `submit` を含む選択肢だけを使う

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

ソースを扱うコマンド(`run`、`localtest`、`test`、`crosscheck`、`tomain`、`toclip`、`submit`)と `serve` は、サーバーが未起動なら自動で起動します。起動先は `server.backend` で決まり、`server.autoStart` が `false` なら起動しません。

- 起動時にライブラリのソースを `/dev/shm` へ同期して一度だけ class にする。解答の解析はその classpath を使う
- 提出用の本文だけを同期済みのソースから取得するので、コンパイルと実行の環境を WSL に統一したまま NTFS をまたぐ負荷を避けられる
- CLI は実行の前にソースを一度だけ `prepare` して変換とコンパイルを行い、以降の各サンプルは `programId` と標準入力だけを送る
- `lib.io.FastScanner` と `lib.io.FastPrinter` は最小構成の `WarmUp.java` から通常どおり import する。起動時にこのファイルを提出用に変換してからコンパイルし、メモリ入力と破棄出力で `nextInt`、`nextLong`、`println(long)` を実行して、class の解決、依存の解析、インライン、javac、I/O の JIT の経路を温める

Easy Test+ は最後のエディタの変更から 180ms 後に `precompile` を送り、テストではサンプルごとにソースを `run` に渡します。サーバーは事前コンパイルの結果を使い、まだ終わっていなければ待ってから実行します。

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

環境変数は設定に使いません。Local Runner の動作を変える変数は次の3つだけです。ほかに、処理系を探すときに `PATH` を、`~` を展開するときに `HOME` と `USERPROFILE` を読みます。以前の版の文書に載せていた変数(`ATCODER_SESSION` など)が残っていると、起動時に警告します。

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

サーバーは単一のバイナリにしません。`bin/start-local-runner.sh` が WSL の Bun でサーバーを動かします。リポジトリでは `src/daemon/main.ts` を、Release の zip では1ファイルにまとめた `dist/server.js` を使います。Java のコンパイルは外部の `javac` を都度起動せず、常駐する Dispatcher の中の javac で行います。`Dispatcher.class` はソースが変わらなければキャッシュを再利用します。

## 配布

Release の zip は、`bun run package`(`scripts/package.ts`)が作る配布用のフォルダをまとめたものです。サーバーと CLI を Bun で1ファイルずつ(`dist/server.js`、`dist/cli.js`)にまとめ、Windows の CLI の exe、常駐 JVM のソース、`launcher.c`、`bin`、文書と一緒に、リポジトリと同じ形で `out/local-runner/competitive-programming-tools` に置きます。

- 形をリポジトリと同じにするのは、設定ファイルとソースの場所を決める処理(`config.ts` の `resolveProjectRoot`)をそのまま使うため
- `bin/_runner.cmd`、`bin/start-local-runner.sh`、`server.backend` が `native` のときの起動は、`dist` があればそれを使い、無ければ `src` を動かす。リポジトリの中には `dist` を作らない
- 文書から配布物の外へのリンクは、その版のタグのリポジトリの URL に書き換える
- `package.json` の `version` を上げてコミットし、`local-runner-v<版>` のタグを push すると、`.github/workflows/local-runner-release.yml` が検査のあとで zip を作り、Release に載せる。タグと `version` が違えば失敗する

## 確認

リポジトリのルートで実行します。JDK 24 の `javac` が PATH に必要です。

```powershell
bun run typecheck:runner
bun run test:runner
```

プロセスの起動と計測のテスト(`commandEngine.test.ts`)は Linux の機能を使うので、Windows では実行されません。この部分を変更したら、WSL でも実行します。PATH に `python3` と `cc` が必要です。

```bash
bun run --cwd local-runner test:unit
```

## 関連する文書

- [../README.md](../README.md)
- [../shared/README.md](../shared/README.md)
- [../userscripts/README.md](../userscripts/README.md)
