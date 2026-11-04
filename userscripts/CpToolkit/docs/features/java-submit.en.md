# Java submission helper

[Back to the feature list](../../README.en.md#4-feature-list) ・ [日本語](java-submit.md)

> Transforms pasted code for submission and adds submit shortcuts. Removing packages, renaming the class and disabling DEBUG work without Local Runner. Expanding lib.*, completing imports and adding the header need Local Runner.

## How it works

- Pasted Java code is transformed into a form that can be submitted
- Removing the package declaration, renaming the class to `Main` and turning off `DEBUG` work without [Local Runner](local-runner.en.md)
- Completing `import` statements needs Local Runner. Expanding `lib.*` (`setlib`) and adding a submission header (`setheader`) also need Local Runner settings
- If you paste code containing `import lib.` while Local Runner is unreachable or has no library set, a notification links to the setup steps. Submitting that code as it is causes a compile error
- Shortcuts submit the code: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> on AtCoder and Codeforces, <kbd>Ctrl</kbd>+<kbd>Enter</kbd> on AOJ and paiza, and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>Enter</kbd> on Library Checker
- Classes and comments are folded after pasting. <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> also folds them

## Detailed settings

Change these under "Detailed settings" of each feature in the settings.

| Setting | Default |
|---|---|
| Remove package declarations when Local Runner is unavailable | On |
| Rename the class to Main when Local Runner is unavailable | On |
| Set DEBUG to false when Local Runner is unavailable | On |
| Add the submission header | On |
| Header name (empty for the default) | (empty) |
| Fold classes and comments after pasting | On |

## Pages

- Task pages
- Submit page
- Custom test page
- Codeforces
- AOJ
- Library Checker
- paiza
