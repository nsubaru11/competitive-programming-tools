# Local Runner の開発

Local Runner を変更する人向けの文書です。使い方は [README.md](../README.md) にあります。Java 側の構成は [java/README.md](../java/README.md)、通信の仕様は [java/src/PROTOCOL.md](../java/src/PROTOCOL.md) を参照してください。

## 構成

```text
local-runner/
├── package.json
├── src/
│   ├── cli/           # test、submit、ファイル名からの問題推定、AtCoder との通信、サンプルの判定
│   ├── daemon/        # main.ts(ソースから動かすときの入口)、lifecycle.ts(起動と終了)、server.ts(HTTP API)、
│   │                  # execution.ts(言語ごとの経路の振り分け)、runResponse.ts(実行の応答の組み立て)、
│   │                  # javaEngine.ts(Java の変換、コンパイル、実行)、dispatcher.ts(常駐 JVM との連携)、
│   │                  # compiler.ts(javac のキャッシュ)、embedded.ts(実行ファイルに埋め込んだファイル)、
│   │                  # languages.ts(使える言語)、preparationQueue.ts(コンパイルの順番待ち)、
│   │                  # commandEngine.ts(コマンドで動かす言語)、processRunner.ts(プロセスの起動と計測)、
│   │                  # programCache.ts(コンパイルしたプログラムの記憶)、headerUnit.ts(C++ の header unit)
│   ├── settings/      # 設定ファイルの読み込みと検査(settings.ts)、パスの読み替え(settingPath.ts)、既定値(defaults.json)
│   ├── javaLibrary/   # Java のライブラリのフォルダの検査(folder.ts)と、作業フォルダへの用意(prepare.ts)
│   ├── migration/     # 以前のバージョンからの後始末: 古い環境変数、設定ファイルの形式、ファイル
│   ├── update/        # 更新: Release の選択(release.ts)、zip の読み取り(zip.ts)、入れ替え(installer.ts)、
│   │                  # 起動時の確認(check.ts)
│   ├── version.ts     # バージョン(package.json から)
│   ├── config.ts      # 設定から決めた値と定数
│   ├── utils/         # ログ、色、整形、ファイル操作
│   └── types/         # 型定義
├── settings.schema.json  # 設定ファイルの項目の定義
├── bin/               # test.cmd、submit.cmd、起動スクリプト
├── scripts/           # package.ts(配布物を作る)
├── release/           # README.md(配布物の README)
├── docs/              # SETTINGS.md(設定の説明)、DEVELOPMENT.md(この文書)
├── native/            # launcher.c(解答のプロセスを起動して計測するプログラム)
└── java/              # Dispatcher など常駐 JVM のクラス、PROTOCOL.md、WarmUp.java
```

`@atcoder-tools/shared` の URL 生成、Local Runner の要求と応答の型、結果の表記(`toEasyTestStatus`)を使っています。CLI のサンプルの判定は行ごとの比較(`cli/sampleJudge.ts`)で、CP Toolkit の Easy Test+ の判定(`evaluateEasyTestOutput`)とは別です。

CLI の AtCoder タスク ID の復元は `cli/taskScreenName.ts` が行い、旧コンテスト・共有問題・教材などの例外は `data/` の JSON に置きます。[AtCoder の URL 復元](./ATCODER_TASK_URLS.md)に照合範囲と更新手順をまとめています。

## 提出前の処理

Java の提出用ソースは、常駐 JVM の Java Compiler API(`JavacTask`、`Trees`、`SourcePositions`)で変換します。型の参照先、`Main` に改名する型とそのコンストラクタ、設定したデバッグ用フィールド、package と import の範囲を javac の構文木とシンボルから決めます。

`setlib` で設定した `languages.java.library` から[対象のソース](SETTINGS.md#languagesjava)を読み、javac が認識したトップレベルの型と宣言ファイルを索引に登録します。ライブラリを指す import の判定にはこの索引を使います。

場所が設定されていないか見つからないときは、空のフォルダを渡して起動します。解答の変換は同じ経路を通り、ライブラリの import はコンパイルエラーになります。CP Toolkit は、解決できない import の名前をサーバーの診断の `importName` から取得します。名前がない診断では、行と列が import 宣言の範囲に入っているかを調べます。

ライブラリの通常の import で見えていた入れ子の型には、展開後の所有型の名前を付けます。トップレベルの型どうしが同名のときや、パッケージを外す参照位置で別の宣言が型名を隠すときは、完全修飾名や連番を使います。`var` やラムダの引数に対して `javac` が補った型は推論に任せ、ソースに書かれた名前だけを編集します。展開で名前解決が変わり得る場合は、`Main.java` を再解析して参照先を照合します。

展開の不具合を検証するときは、元の解答と登録ライブラリを元のパッケージ構成でコンパイルし、同じ JDK・入力・デバッグ設定で提出用ソースの出力と比較します。[対応範囲](../README.md#解答とライブラリの書き方)に含まれるコードでは、元の宣言への参照を保ちます。クラス名を含む文字列など、実行時に決まる参照は静的な照合の対象外です。

## 言語

使える言語は、起動時に設定の `languages` から決めます(`daemon/languages.ts`)。要求の `compilerName` が言語の名前で、省略されていれば Java として扱います。

| 言語     | 経路                                                                                                |
|----------|-----------------------------------------------------------------------------------------------------|
| `java`   | `javaEngine.ts`。常駐 JVM(`dispatcher.ts`、`compiler.ts`)の中で、変換、コンパイル、実行を行います。 |
| それ以外 | `commandEngine.ts`。設定のコマンドでコンパイルし、サンプルごとにプロセスを起動します。              |

振り分けは `execution.ts` が行います。`server.ts` は要求を確かめて `mode` ごとに `execution.ts` を呼ぶだけで、言語ごとの処理を持ちません。

`commandEngine.ts` は設定を直接読まず、言語の定義と上限を引数で受け取ります。テストは、PATH の `python3` と `cc` で言語を定義して動かします。

コマンドで動かす言語のデバッグ用の変数(`debugFlag`)は、共通のコードの `shared/src/debug-flag.ts` が書き換えます。CP Toolkit も、Local Runner がないときの変換で同じものを使います。言語ごとの違いはコメントと文字列の書き方と宣言の形だけで、`DEBUG_FLAG_SYNTAXES` に登録すると言語を足せます。足したら、[設定](SETTINGS.md)の対応する言語の表と、CP Toolkit の提出補助の文書も直します。

- コンパイルの結果は、言語、コンパイルの引数、ソースから決めた `programId` で使い回します。キャッシュには未使用の結果を直近の10件まで残します。コンパイル中・実行待ち・実行中の結果は、その処理が終わってから削除の候補になります。保存は `/dev/shm` の作業フォルダで、サーバーを起動し直しても残っていれば使います(WSL を再起動すると消える)。
- コンパイルの記録は、Java も含めて `[Compile] Lang=<言語> Status=<OK|NG|CACHED|CANCELED> Time=<時間> Id=<programId>` の形にそろえます。`CACHED` は、コンパイルせずに前の結果を使ったことを、`CANCELED` は新しいソースが届いて中断したことを表します。実行の記録は `[Run] Lang=<言語> Mode=<経路> Status=... Wait=... Exec=... Total=...` で残します。`Wait` はサーバーが実行の要求を受け取ってから実行が始まるまで(コンパイル待ちと、実行の順番待ちを含む)、`Exec` は実行そのもの、`Total` は結果が出るまでの時間です。
- 実行は1つずつ行います。同時に動かすと時間の測定がぶれます。
- エラーのメッセージは、作業フォルダの場所を除いて返します。利用者には `Main.cpp:4:11` のように見えます。

### コンパイルの順番待ち

変換とコンパイルは、言語によらず `daemon/preparationQueue.ts` が1つずつ順番に行い、結果を覚えておきます。同時に動かすと、どのコンパイルも遅くなるためです。

| 要求                       | 動き                                                                                                         |
|----------------------------|--------------------------------------------------------------------------------------------------------------|
| `precompile`               | 順番待ちに入れて、結果を待たずに `accepted` を返します。                                                     |
| `prepare`                  | 結果を待って返します。CLI が使います。                                                                       |
| `run`(`sourceCode` を渡す) | そのソースのコンパイルが終わるのを待ってから実行します。コンパイルエラーは実行の応答の `stderr` で返します。 |
| `run`(`programId` を渡す)  | コンパイル済みのプログラムを実行します。                                                                     |

- 誰も結果を待っていないうちに同じ言語の新しいソースが届いたら、古いソースのコンパイルを中断します。編集のたびに届く `precompile` のうち、最後のものだけをコンパイルするためです。
- 中断は、コンパイラをプロセスグループごと止めます(`processRunner.ts`)。g++ が起動した cc1plus なども残しません。Java は常駐 JVM の中の処理を止められないので、変換とコンパイルの間で確かめます。
- 実行の要求は、応答のヘッダーだけを先に返してから、コンパイルと実行を待ちます。Tampermonkey は応答のヘッダーが届くまで次の要求を送らないので、待つ間に CP Toolkit のほかの要求(実行の候補の取得など)が止まらないようにします。
- 覚えている結果は、言語ごとの実行環境のコンパイル結果と同じ数まで。どちらも使ったものを追い出す順番の最後に回します。実行しようとしたプログラムが追い出されていたら、コンパイルし直して1回だけやり直します。`prepare` も、覚えていた結果のプログラムが消えていれば作り直します。

### CLI での言語の選択

CLI は、ソースの拡張子と `--lang` から言語を決めます(`cli/language.ts`)。サーバーへは、言語の名前を `compilerName` として送ります。

- サーバーがソースを書き出すときの名前(`Main.java`、`Main.cpp` など)は、エラーの表示で元のファイル名へ戻します。Java だけは、クラス名の `Main` も元に戻します。
- コンパイル済みのプログラムがサーバーから消えていたら、同じ要求でコンパイルし直します。変換済みのソースを送り直すと、`bundle` を2回通してしまいます。作り直したソースが最初と違えば(ヘッダーやライブラリのファイルが変わったなど)、試したプログラムと提出物が食い違うので止めます。
- `prepare` と `transform` は、指定されたヘッダーを読めなければ警告を返し、ヘッダーを付けずに処理を続けます(`header.ts`)。
- Java の変換は、置き換えた範囲の改行を残し、追加の import は、最初にコメント化する import の位置に入れます。コメント化するものがなければ、最初の import または型宣言の前に入れます。最初の型の宣言より後の行は同じだけずれるので、`lineOffset` はその宣言の行の差で数えます。
- 提出先の言語は、提出フォームの問題ごとの選択欄から読みます(`parser.ts`)。Java は固定の ID がフォームの Java の選択肢にあれば先に試し(JavaScript とは区別する)、ほかの言語は設定の `submit` を含む選択肢だけを使います。
- 次の言語の候補で送り直すのは、提出ページへ戻されて拒否が分かったときだけです。それ以外は、提出一覧の行のうち、その問題で提出前の ID より新しいものを今回の提出とします(`atcoder.ts`)。決められなければ送り直さず、一覧の URL を返します。
- `prepare` は、ライブラリの展開(変換)、ヘッダーの付与、コンパイルの順に行います。ヘッダーは要求ごとに一度だけ読み(`header.ts`)、コンパイルの順番待ちの鍵にも含めます。エンジンは変換のあと、コンパイルの前に `finish` でヘッダーを付けます(`execution.ts`)。CLI のコマンドは既定でヘッダーを付け、CP Toolkit の Easy Test+ はエディタのコードをそのまま送ります(ヘッダーがあればすでに入っている)。javac とコマンドの言語のコンパイルの結果は、コンパイルしたソースで使い回すので、最終のソースが同じなら CLI とブラウザで共有されます。

### プロセスの計測

解答のプロセスは、`native/launcher.c` をビルドした起動プログラムを通して起動します(`processRunner.ts`)。

サーバー(Bun)から直接起動すると、子プロセスのメモリの最大値に Bun 自身の使用量(約 20MB)が混ざります。Linux は、`exec` の前のメモリの最大値をプロセスに引き継ぐためです。小さな起動プログラムが `fork` して `wait4` で値を受け取ることで、解答だけの値になります。

起動プログラムは、スタックの上限の設定、制限時間での強制終了、終了の理由と時間とメモリの報告も受け持ちます。解答は別のプロセスグループで動かし、解答が起動した子プロセスもまとめて止めます。

C コンパイラが無くて起動プログラムをビルドできないときは、`prlimit` と Bun の計測で代用します。この経路もテストしています。

### header unit

`daemon/headerUnit.ts` が、`builtin:gcc-header-unit` を実装します。コンパイルの引数からソース、出力先、リンクの指定を除いたものを鍵にして、`g++ -x c++-header` の結果を保存し、解答のコンパイルに `-fmodule-mapper` で渡します。

デバッグの有無で引数が変わるので、言語ごとに2つできます。起動時にデバッグありの方を Java の準備と並行して作り、結果を `[Setup]` に記録してからサーバーが `ready` を表示します。作成に失敗した場合もサーバーは起動します。CLI の `server.startTimeoutMs` はこの準備時間も含みます。今の設定にない鍵のものは削除します。

## 提出用ヘッダー

ヘッダーはデーモンが付けます(`daemon/header.ts`)。CLI と CP Toolkit が同じ設定を使えるようにするためで、設定は要求ごとに読むので再起動はいりません。

要求の `header` は `true`(言語の設定)、文字列(設定した名前)、`false`(付けない)のいずれかです。名前は HTTP で受け取る値なので、`local-runner.settings.json` の `headers` を引くキーとしてだけ使い、パスとしては扱いません。言語の既定のヘッダーは、言語の名前、種類の順に `headers` を引きます。

## 起動とウォームアップ

`serve` は `server.backend` のサーバーを起動します。ソースを扱うコマンドも、`server.autoStart` が有効なら自動で起動します。待ち受けポートを先に確保し、取得したプロセスだけがライブラリやコンパイラを準備します。準備中は `shutdown` を受け付け、それ以外の有効な要求には HTTP 503 と `status: "starting"` を返します。CLI はこの応答を受けると同じサーバーの準備完了を待ちます。

- 起動時にライブラリの `.java` を作業フォルダ(Linux では `/dev/shm`)へ写して一度だけ class にします。解答の解析はその classpath を使います。class は写した先に作るので、利用者のフォルダには何も書きません。
- 提出用の本文だけを同期済みのソースから取得するので、コンパイルと実行の環境を WSL に統一したまま NTFS をまたぐ負荷を避けられます。
- CLI は実行の前にソースを一度だけ `prepare` して変換とコンパイルを行い、以降の各サンプルは `programId` と標準入力だけを送ります。
- 起動時に `WarmUp.java` を提出用に変換してからコンパイルし、メモリ入力と破棄出力で実行して、class の解決、依存の解析、インライン、javac、I/O の JIT の経路を温めます。`WarmUp.java` は標準の入出力だけを使い、ライブラリが無くても動きます。

Easy Test+ は最後のエディタの変更から 180ms 後に `precompile` を送り、テストではサンプルごとにソースを `run` に渡します。サーバーは事前コンパイルの結果を使い、まだ終わっていなければ待ってから実行します。

フォルダとファイル名から問題を決める処理は `cli/localTask.ts`、ファイル名から問題記号を取り出す処理と対応表の参照は `cli/taskScreenName.ts` にあります。拡張子と最後の `_` 以降を除いたものを問題記号とします。ソースの選択は `cli/language.ts` の `resolveSourceFile` が、大文字と小文字を区別せず拡張子を補って行います。コンテスト名とタスク ID の違いは JSON の対応表で解決します。範囲フォルダ(`451-500` など)はコンテスト名に使いません。

## 設定

利用者向けの説明は [SETTINGS.md](./SETTINGS.md) にあります。

設定は `local-runner.settings.json` の1ファイルで、Windows の CLI と WSL のサーバーの両方から読めるよう、`local-runner` フォルダの親のフォルダ(配布物では `competitive-programming-tools`、リポジトリではルート)に置き、Git には入れません。利用者が書くのは変えたい項目だけで、`src/settings/settings.ts` が既定値(`src/settings/defaults.json`)に重ねます。

- 項目の名前、型、範囲は `settings.schema.json` だけに書きます。`src/settings/schema.ts` がこのファイルで検査するので、エディターの補完と実行時の検査が食い違いません。
- 項目を足すときは、`settings.schema.json`、`defaults.json`、`settings.ts` の `Settings` 型、`docs/SETTINGS.md` を直します。
- 利用者が足す言語に必要な項目は、既定値と重ねたあとで `settings.ts` が確かめます。既定の言語の上書きでは一部しか書かないので、スキーマでは必須にできません。
- `family` に書ける値は、CP Toolkit の `data/languages.yaml` の ID と同じにします。食い違うとテストが失敗します。
- パスは Windows と WSL のどちらの形でも書けます。使う側が `resolveConfiguredPath` で、自分の OS の形に直します。
- サーバーが起動時に読む項目は、`serverSettingsDigest` の対象にします。`status` は、この値で起動後の変更を見つけます。
- `headers` は要求のたびに読み直します。それ以外は、プロセスの起動時に一度だけ読みます。

環境変数は設定に使いません。Local Runner の動作を変える変数は次の4つだけです。ほかに、処理系を探すときに `PATH` を、`~` を展開するときに `HOME` と `USERPROFILE` を読みます。以前の版の文書に載せていた変数(`ATCODER_SESSION` など)が残っていると、起動時に警告します。

保存形式の移行が必要な更新ではメジャーバージョンを上げ、`src/migration/settingsFile.ts` に移行元の形式番号に応じた処理を追加します。形式番号が無く、1.x にしか無い項目(`librarySourceRoot`、`headerFiles`、`debugRewrite`)を持つファイルを形式 1 として読みます。利用者は変えたい項目だけを手で書き、形式番号を書かないことがあるためです。変換した設定を一時ファイルで検証し、旧形式のバックアップを保存してから置き換えます。

以前のバージョンからの後始末は `src/migration/` にまとめます。古い環境変数の警告(`environment.ts`)、以前の形式の設定ファイルの書き換え(`settingsFile.ts`)、以前のバージョンが作ったファイルの削除(`files.ts`)です。名前や置き場所を変えたときは、古いものをここに足し、本体には互換の分岐を残しません。

- 警告と削除は `migration/index.ts` の `migrateFromEarlierVersions` が行います。CLI(`daemon` 以外)とサーバーの起動時に呼びます。旧ファイルは Windows と WSL の両方にあるためです。
- 消すものが無ければ何も出さず、消したときだけ1行出します。消せなければ、次の起動でまた試します。
- 設定ファイルの書き換えは、設定を読む前に要るので、`config.ts` が設定を読む直前に呼びます。

| 変数                         | 用途                                                                                           |
|------------------------------|------------------------------------------------------------------------------------------------|
| `LOCAL_RUNNER_SETTINGS_FILE` | 設定ファイルの場所。テストが、利用者の設定を読まないようにするために使います。                 |
| `LOCAL_RUNNER_PROJECT_ROOT`  | `local-runner` フォルダの親のフォルダの場所。`bin/_runner.cmd` が、exe にした CLI へ渡します。 |
| `NO_COLOR`                   | 色付きの表示を止めます。                                                                       |
| `FORCE_COLOR`                | `1` でCLIの色付き表示を強制します。`0` は無効。`NO_COLOR` を優先します。                       |

サーバーは、常駐 JVM へ設定の値を環境変数(`LOCAL_RUNNER_JAVAC_RELEASE`、`LOCAL_RUNNER_RUN_STACK_BYTES`、`LOCAL_RUNNER_CAPTURE_LIMIT_BYTES`、`LOCAL_RUNNER_LIBRARY_LAST`)で渡します。これらは起動のたびにサーバーが決めるので、利用者が設定しても使われません。

起動した JDK が `languages.java.release` より新しいときは、javac の `--release` で提出先の API と構文に揃えます。バージョンが違うと起動時に警告します。

## ビルド

CLI のソースを変更したら `bun run build`(型チェックと CLI の exe 化)を実行します。`bin/_runner.cmd` はこの exe があれば使い、無ければ `bun src` で実行します。

```powershell
bun run --cwd local-runner build
```

サーバーは CLI に含まれ、使い方に載せない内部用の `daemon` コマンドで動きます。`bin/start-local-runner.sh` は `bin/local-runner` があればそれを、無ければ WSL の Bun で `src/daemon/main.ts` を動かします。Java のコンパイルは外部の `javac` を都度起動せず、常駐する Dispatcher の中の javac で行います。`Dispatcher.class` はソースが変わらなければキャッシュを再利用します。

## 更新

`update` は、設定の `update.repository` の Release から配布物を取得して入れ替えます(`src/update/`)。サーバーも起動のあとに同じ方法で最新のバージョンを確かめ、`status` の応答の `latestVersion` に入れます。

- 同じリポジトリにほかの Release があるので、「最新の Release」ではなく、公開済みでタグが `local-runner-v` で始まるものから、バージョンの最も大きいものを選びます。
- 配布物は `local-runner-<バージョン>.zip` という名前で探し、GitHub の API が返す `digest`(SHA-256)と照合します。`digest` が無い配布物は入れません。
- zip の展開は自前で持ちます(`zip.ts`)。`unzip`、`tar`、PowerShell の有無に左右されないようにするため。無圧縮と deflate だけを扱います。
- zip は最上位にフォルダを1つ持ちます。その名前は見ず、中身を `local-runner` フォルダの親のフォルダへ入れます。導入先の外へ出るパスがあれば中止します。
- 全部を隣のフォルダへ取り出してから、1つずつ名前を変えて置き換えます。失敗したら元に戻します。パッケージに無いファイル(設定ファイル)には触れません。
- Windows は実行中の実行ファイルを上書きも削除もできないので、`.old` へ名前を変えてから新しいものを置きます。残った `.old` は、次の起動で消します(`cli/index.ts`)。
- `bin/update.cmd` は実行ファイルを直接呼ぶ1行だけにします。入れ替えのあと、`cmd` は同じ位置から新しいファイルを読み続けるので、行を足すと古い位置から実行されます。
- リポジトリのソースから動いているとき(`local-runner/package.json` がある)は、入れ替えません。リポジトリのファイルを配布物で上書きしないためです。
- テストは、通信の代役と、手で組み立てた zip(`testZip.ts`)で行います。本物の Release には触れません。

## 配布

Release の zip は、`scripts/package.ts` が作る配布用のフォルダをまとめたものです。WSL で `bun run --cwd local-runner package` を実行すると、`out/local-runner/competitive-programming-tools` にできます。起動プログラムを静的リンクするので Linux で実行し、`javac`、`jar`、`cc` が PATH に要ります。

- CLI(サーバーを含む)を、Windows 用の `bin/local-runner.exe` と Linux 用の `bin/local-runner` の実行ファイルにします。
- 常駐 JVM の jar(`javac --release 24`)、静的リンクした起動プログラム、`WarmUp.java` を実行ファイルに埋め込みます。サーバーは起動時にこれらを作業フォルダへ書き出して使い、埋め込みが無ければ(ソースから動かすとき)ソースからコンパイルします(`daemon/embedded.ts`)。
- 配布物には、実行ファイル、`bin` のスクリプト、`settings.schema.json`、`release/README.md`、ライセンスを入れます。配布物とリポジトリは、どちらも `local-runner/settings.schema.json` を持つことで見分けます(`config.ts` の `resolveProjectRoot`)。
- `server.backend` が `native` のときは、Windows の実行ファイルが自分を `daemon` で起動します。
- `package.json` の `version` を上げてコミットし、`local-runner-v<版>` のタグを push すると、`.github/workflows/local-runner-release.yml` が検査のあとで zip を作り、Release の下書きに載せます。タグと `version` が違えば失敗します。
- 下書きは利用者に見えません。zip で[リリース前の確認](#リリース前の確認)を済ませてから、GitHub の Release の画面で公開します。

### リリース前の確認

下書きの zip を、設定ファイルの無い新しいフォルダへ展開して確かめます。リポジトリの中で動かすと、手元の設定や開発用の道具に助けられて、配布物だけでは動かない箇所を見落とします。

- `README.md` と `release/README.md` の手順を、書いてあるコマンドのとおりに上から実行します。Windows PowerShell(`powershell`)と PowerShell 7(`pwsh`)の両方で試します。
- 設定ファイルが無い状態で、Java の解答を `test` と `run` で動かします。
- `setlib` に `lib` 以外の名前のフォルダを指定し、import したクラスが展開されることを確かめます。
- `setsession` で値を保存し、`submit` がログインできることを確かめます。
- `status` に、処理系を入れた言語と、見つからなかった言語が正しく出ることを確かめます。
- 文書に書いた「対応」「使える」が、何も追加で入れていない環境でそのとおりかを読み直します。追加の導入が要るものは、要ると書きます。
- 作者の環境に固有の名前やパスが残っていないかを検索します(`lib.`、submodule として置いたときのフォルダ名、ユーザー名、リポジトリのパスなど)。
- エラーの案内に出てくるコマンドやパスが、配布物に実在するかを確かめます。
- `update --check` が、今のバージョンを最新と表示することを確かめます。公開したあとは、1つ前のバージョンの配布物から `update` で入れ替わることを確かめます。

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

- [tools の開発の方針](../../docs/DEVELOPMENT.md)
- [shared/README.md](../../shared/README.md)
- [userscripts/README.md](../../userscripts/README.md)
