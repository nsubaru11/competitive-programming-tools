# Local Runner

[Back to the feature list](../../README.en.md#4-feature-list) ・ [日本語](local-runner.md)

> Connects to the local server used to transform and run code. Local Runner needs a separate installation. A server of your own with the same API also works.

## How it works

- Connects to a server running on your PC. It is used to run code in [Easy Test+](easy-test.en.md) and to transform code in the [Java submission helper](java-submit.en.md)
- The dedicated [Local Runner](https://github.com/nsubaru11/competitive-programming-tools/blob/main/local-runner/README.md) runs Java solutions. C++, C, Python and some other languages are predefined and work once you install their toolchains yourself. It needs a separate installation
- **Any server of your own that meets the API below can be connected instead of the dedicated Local Runner.** For example, a server that runs C++ or Python locally lets Easy Test+ run those languages on your PC
- The server URL can be changed in the detailed settings. Code is sent only to your own PC, not to any external service

## Detailed settings

Change these under "Detailed settings" of each feature in the settings.

| Setting    | Default                 |
|------------|-------------------------|
| Server URL | `http://localhost:8080` |

## API required for your own server

- Requests are `POST`ed to the URL in the detailed settings with a JSON body. Respond with JSON and an HTTP status in the 200s
- CP Toolkit is allowed to connect only to `localhost` and `127.0.0.1`. Run the server on your own PC
- The `mode` of the request selects the operation. For Easy Test+ alone, `list`, `precompile` and `run` are enough

| `mode`       | Used by                | Request fields                                 | Response                                                                                                                                                                                                                                  |
|--------------|------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `list`       | Easy Test+             | None                                           | An array of `{language, compilerName, label}`. `language` is a language name (e.g. `Java`, `C++`, `Python`), and entries of the same family as the submission language become candidate environments. `label` is the name shown on screen |
| `precompile` | Easy Test+             | `sourceCode`, `compilerName`, `debug`          | `{status: "accepted"}`. Compiles the code being edited in advance. Respond at once, without waiting for the result                                                                                                                        |
| `run`        | Easy Test+             | `sourceCode`, `stdin`, `compilerName`, `debug` | `status`, `exitCode`, `stdout`, `stderr`, `time` (ms), `memory` (cumulative allocation in KB; 0 hides it), `peakMemory` (optional; peak usage in KB)                                                                                      |
| `transform`  | Java submission helper | `sourceCode`, `header`                         | `status` (`success` or `compileError`), `sourceCode` (transformed code), `diagnostics`, `libraryMissing` (optional)                                                                                                                       |

- `compilerName` is the value returned by `list`. A server that handles several languages uses it to pick one
- Each entry of `list` may also carry `family` and `match`
    - `family` is the ID of the language family (`cpp`, `python3`, `java` and so on). When present, it is used instead of detecting the family from `language`
    - `match` is an array of words. When several environments share a family, those whose words appear in the language name on the page come first, and the rest follow the order of `list`. For example, `["PyPy"]` on a PyPy environment makes it the first choice on PyPy pages
- Memory is shown as usage when `peakMemory` is present, and as cumulative allocation when `memory` is present
- The `status` of `run` is one of `success`, `compileError`, `timeLimitExceeded`, `runtimeError`, `internalError` and `badRequest`
- `run` waits for the code to finish compiling before running it. On a compile error, respond with `status` `compileError` and the errors in `stderr`
- `precompile` arrives on every edit. Other CP Toolkit requests are held while it waits for the response, so respond without waiting for the compile. A later `run` of the same code can use the result
- `run` also holds other requests while it waits for the compile. Sending the response headers before waiting avoids this

The full types are in [local-runner.ts](https://github.com/nsubaru11/competitive-programming-tools/blob/main/shared/src/local-runner.ts).

## Pages

- Contest pages
- Codeforces
- yukicoder problem pages
- AOJ
- Library Checker
- paiza
