# Easy Test+

[Back to the feature list](../../README.en.md#4-feature-list) ・ [日本語](easy-test.md)

> Based on AtCoder Easy Test v2, with additional features. Runs samples from the task page and checks the results. For Java, Local Runner runs the code on your PC and compiles the code you are editing in advance. Enable only one of this and AtCoder Easy Test v2, because using both duplicates the buttons.

**This feature is off by default. Turn it on in the settings.**

![Easy Test+](../images/easy-test.png)

## How it works

- Based on [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152), with additional features
- From the task page, you can run samples (Run, Test All Samples) and test before submitting (Test & Submit). A submission can be canceled midway
- The execution environment can be AtCoder custom test, Python in the browser, PaizaIO or Wandbox. C++ on Wandbox can use AtCoder Library. Code is sent to PaizaIO or Wandbox only when you choose them
- Output can be compared with an allowable error. The code you ran is saved per task and can be restored with "Restore Last Code"
- AtCoder custom tests run one at a time, even across tabs
- <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs Test & Submit, <kbd>Alt</kbd>+<kbd>Enter</kbd> runs Test All Samples, and <kbd>Alt</kbd>+<kbd>Esc</kbd> opens or closes the bottom panel
- **Java gets extra features**. [Local Runner](local-runner.en.md) runs the code on your PC and compiles the code you are editing in advance, so results come back sooner. Memory is shown as the cumulative allocation
- Enable only one of this and AtCoder Easy Test v2, because using both duplicates the buttons

## Detailed settings

Change these under "Detailed settings" of each feature in the settings.

| Setting | Default |
|---|---|
| Precompile edited code with Local Runner | On |
| Use shortcuts (Ctrl+Enter, Alt+Enter, Alt+Esc) | On |
| Number of saved solutions | `10` |
| Allowed error | `1e-6` |

## Pages

- Task pages
- Submit page
- yukicoder problem pages
- Codeforces problem pages
