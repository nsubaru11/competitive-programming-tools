# Local Runner integration

[Back to the feature list](../../README.en.md#4-feature-list) ・ [日本語](local-runner.md)

> Set the server used by Easy Test+ and the submission helper.

## How it works

- [Easy Test+](easy-test.en.md) uses this connection to run code. The [submission helper](submission-helper.en.md) uses it to prepare submissions, and [Code header and footer](source-comments.en.md) uses it for the submission header.
- Set the URL of your own server. You can use [Local Runner](../../../../local-runner/README.md) or any server that implements the same API. Local Runner needs a separate installation.
- If you run Local Runner on your computer with its default settings, use `http://localhost:8080` as the server URL.

Easy Test+ works with Local Runner 1.x. Transforming submissions and fetching headers need Local Runner 2.0.0 or later.

## Detailed settings

Open this feature’s “Detailed settings” in CP Toolkit.

| Setting    | Default                 |
|------------|-------------------------|
| Server URL | `http://localhost:8080` |

## API required for your own server

- Requests are `POST`ed to the URL in the detailed settings with a JSON body. Respond with JSON and an HTTP status in the 200s.
- The `mode` of the request selects the operation. For Easy Test+ alone, `list`, `precompile` and `run` are enough.

| `mode`       | Used by                       | Request fields                                                                  | Response                                                                                                                                                                                                                                  |
|--------------|-------------------------------|---------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `list`       | Easy Test+                    | None                                                                            | An array of `{language, compilerName, label}`. `language` is a language name (e.g. `Java`, `C++`, `Python`), and entries of the same family as the submission language become candidate environments. `label` is the name shown on screen |
| `precompile` | Easy Test+                    | `sourceCode`, `compilerName`, `debug`                                           | `{status: "accepted"}`. Compiles the code being edited in advance. Respond at once, without waiting for the result                                                                                                                        |
| `run`        | Easy Test+                    | `sourceCode`, `stdin`, `compilerName`, `debug`                                  | `status`, `exitCode`, `stdout`, `stderr`, `time` (ms), `memory` (cumulative allocation in KB; 0 hides it), `peakMemory` (optional; peak usage in KB), `lineOffset` (optional; lines added by the transformation)                          |
| `transform`  | Submission helper             | `sourceCode`, `compilerName`, `header: false`, `debug: false`, `validate: true` | `status` (`success` or `compileError`), `sourceCode`, `diagnostics`, `diagnosticItems` and `inlinedClasses`. An import diagnostic can include `importName`.                                                                               |
| `status`     | Submission helper and headers | None                                                                            | `{status: "running", version: "2.0.0"}`, with the running server’s version.                                                                                                                                                               |
| `header`     | Code header and footer        | `compilerName`, `header`                                                        | `{status: "success", header}`. `header` is the text to put at the top of the submission, or `null` when none is set. A request `header` of `true` means the language default, and a string means the header with that name                |

- `compilerName` is the value returned by `list`. A server that handles several languages uses it to pick one.
- Each entry of `list` may also carry `family` and `match`.
    - `family` is the ID of the language family (`cpp`, `python3`, `java` and so on). When present, it is used instead of detecting the family from `language`.
    - `match` is an array of words. When several environments share a family, those whose words appear in the language name on the page come first, and the rest follow the order of `list`. For example, `["PyPy"]` on a PyPy environment makes it the first choice on PyPy pages.
- Memory is shown as usage when `peakMemory` is present, and as cumulative allocation when `memory` is present.
- When the sum of `header` and `transform` in `lineOffset` is not 0, the error field shows how many lines the error line numbers are shifted from the editor. Nothing is shown when `transform` is `null` (unknown because of a bundle command, or because the Java source could not be tokenized). Compile-error responses include it too.
- The `status` of `run` is one of `success`, `compileError`, `timeLimitExceeded`, `runtimeError`, `internalError` and `badRequest`.
- `run` waits for the code to finish compiling before running it. On a compile error, respond with `status` `compileError` and the errors in `stderr`.
- `precompile` is sent about 180 ms after editing pauses. Other CP Toolkit requests are held while it waits for the response, so respond without waiting for the compile. A later `run` of the same code can use the result.
- `run` also holds other requests while it waits for the compile. Sending the response headers before waiting avoids this.

The full types are in [local-runner.ts](https://github.com/nsubaru11/competitive-programming-tools/blob/main/shared/src/local-runner.ts).

## Pages

- Contest pages
- Codeforces
- yukicoder problem pages
- AOJ
- Library Checker
- paiza
