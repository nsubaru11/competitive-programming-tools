<div align="center">

# CP Toolkit

**A userscript that combines competitive programming helpers into one script**

It focuses on AtCoder and improves the statement, submission, contest and results pages. Every feature can be switched on and off individually.

[![Greasy Fork version](https://img.shields.io/greasyfork/v/603262?label=Greasy%20Fork&color=670000)](https://greasyfork.org/scripts/603262-cp-toolkit)
[![License](https://img.shields.io/greasyfork/l/603262)](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md)

[**Install**](https://greasyfork.org/scripts/603262-cp-toolkit) ・ [Using other scripts](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md) ・ [Bugs and requests](https://github.com/nsubaru11/competitive-programming-tools/issues) ・ [日本語](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.md)

</div>

## 1. Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. In Chrome and other Chromium-based browsers, turn on "Allow User Scripts" in the Tampermonkey extension details
3. Install the script from its [Greasy Fork page](https://greasyfork.org/scripts/603262-cp-toolkit)

## 2. Usage

Open the settings from "Open settings" in the Tampermonkey menu, or from "CP Toolkit" in the AtCoder header. Each feature can be switched on and off there. Some features can be adjusted further in their detailed settings.

The interface follows the language of the site and is available in Japanese and English.

## 3. Supported sites

| Site                 | Available features                               |
|----------------------|--------------------------------------------------|
| AtCoder              | Every feature except paiza language selection    |
| yukicoder            | Easy Test+                                       |
| Codeforces           | Easy Test+, Java submission helper               |
| AOJ, Library Checker | Java submission helper                           |
| paiza                | Java submission helper, paiza language selection |

## 4. Feature list

Everything is enabled from the start, except the features marked <sub>off by default</sub>. Features marked <sub>details</sub> are explained further in "5. Feature details".

### 4.1 Layout

| Feature                 | What it does                                                          |
|-------------------------|-----------------------------------------------------------------------|
| **Wider page**          | Widens the central column of the page and adds a border to the editor |
| **Open menus on hover** | Opens menus when the pointer moves over them                          |

### 4.2 Statement

| Feature                                                        | What it does                                                         |
|----------------------------------------------------------------|----------------------------------------------------------------------|
| **Statement highlighting**                                     | Highlights numbers, variables, and the time and memory limits        |
| **Highlight hovered variables and numbers** <sub>details</sub> | Hovering a variable or a number highlights every occurrence of it    |
| **Copy statement**                                             | Copies each section or the whole statement as Markdown or plain text |
| **Side-by-side samples** <sub>off by default</sub>             | Places the input and output formats and samples side by side         |

### 4.3 Submissions

| Feature                                          | What it does                                                                                                               |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| **Keep submission filters**                      | Keeps search filters when switching between All and My submissions                                                         |
| **AC submission buttons**                        | Opens the AC submissions for the task, sorted by time and by code size                                                     |
| **Language switch buttons**                      | Switches between your frequently used languages with buttons. Pick the languages from the gear below the language selector |
| **Header and footer** <sub>details</sub>         | Adds a header to the top and a footer to the bottom of pasted code                                                         |
| **Submission notifications** <sub>details</sub>  | Shows the verdict right after judging finishes, on any page                                                                |
| **Test case averages**                           | Shows average time and memory on the submission page                                                                       |
| **Delayed submission** <sub>off by default</sub> | Submits your code after the specified time                                                                                 |

### 4.4 Contest

| Feature                                            | What it does                                                                                     |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Clarification notifications** <sub>details</sub> | Notifies you when the organizers post an answer or a correction during a contest                 |
| **Task dropdown**                                  | Opens tasks from the Tasks tab and opens several tasks at once                                   |
| **Task status colors** <sub>details</sub>          | Colors the task list and the dropdown by all your submissions, including those after the contest |
| **All editorials**                                 | Shows the editorials of every task on one page                                                   |
| **Contest links on the top page**                  | Replaces the top page list with links to past contests by type                                   |
| **Next contests**                                  | Adds a header menu with the upcoming contests listed on the home page                            |
| **Add to calendar**                                | Adds a link to contest pages that registers the contest in Google Calendar                       |
| **Virtual contest timer**                          | Shows the time until the start and the time left in the corner clock                             |
| **Tessoku difficulty**                             | Shows the difficulty from the book on the Tessoku task list                                      |

### 4.5 Results

| Feature                                | What it does                                                                                           |
|----------------------------------------|--------------------------------------------------------------------------------------------------------|
| **Performance on the user page graph** | Overlays performance on the rating graph of user pages, with a recent range set by count or percentage |
| **Colored contest history**            | Colors performance and rating values in the contest history                                            |

### 4.6 Execution

| Feature                                           | What it does                                                                                       |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------|
| **Java submission helper** <sub>details</sub>     | Transforms pasted code for submission and adds submit shortcuts                                    |
| **Local Runner** <sub>details</sub>               | Connects to the local server used to transform and run Java code. It needs a separate installation |
| **Easy Test+** <sub>off by default, details</sub> | Runs samples from the task page and checks the results                                             |
| **paiza language selection**                      | Selects the specified language on paiza submission pages. It does nothing until you set a language |

## 5. Feature details

<details>
<summary><b>5.1 Highlight hovered variables and numbers</b></summary>

- Every occurrence of the hovered variable or number in the statement is highlighted. Moving away clears it
- Click to pin the highlight. Click again or press <kbd>Esc</kbd> to clear it
- "Highlight variables" and "Highlight numbers" in the detailed settings switch variables and numbers separately
- A number with an exponent, such as the "10" in "10<sup>5</sup>", counts as the same number as any other "10"

</details>

<details>
<summary><b>5.2 Header and footer</b></summary>

Open the input screen from the "Header and footer" button to the left of the editor on task and submission pages. The button changes color when it has content. The header goes to the top of the code and the footer to the bottom, and each is saved separately. They are useful for notes such as reference URLs.

- They are added when pasting replaces the whole code. Pasting part of the code adds nothing
- The content is saved when you leave the input field and is used for the next task too. Choose "This task only" to save it for that task alone
- Saved content can be loaded with "Restore from history", which keeps the latest 20 entries. Content saved with "Save with a name" stays until you delete it
- Changing the language also switches the comment syntax. Once you edit the inserted part, it is no longer rewritten
- Single-line comments are used by default. A multi-line comment can be chosen in the settings
- Without "Comment out when inserting", the text is inserted as written, so write the comment markers yourself
- `{url}`, `{task}` and `{contest}` become the task URL, the task ID and the contest ID
- For languages whose comment syntax is unknown, nothing is inserted and a notification tells you so

</details>

<details>
<summary><b>5.3 Submission and clarification notifications</b></summary>

- Notifications are checked by your open AtCoder tabs. Keep at least one AtCoder tab open. If all of them are closed, no notification arrives
- While you are not looking at AtCoder, a desktop notification is also shown, both while you view another tab and while you are away from the browser. Desktop notifications can be turned off in the detailed settings
- Clarifications are checked only during a contest

</details>

<details>
<summary><b>5.4 Task status colors</b></summary>

- Your submission list is read, so submissions both during and after the contest are reflected
- A task with at least one AC or scored submission is colored as accepted, and a task with submissions but none accepted as rejected. Submissions still being judged are not counted
- The colors can be changed in the detailed settings
- Nothing is fetched while you are logged out or in the first 5 minutes of a contest

</details>

<details>
<summary><b>5.5 Java submission helper and Local Runner</b></summary>

The Java submission helper works without [Local Runner](https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner).

| Requirement                     | What you can do                                                                     |
|---------------------------------|-------------------------------------------------------------------------------------|
| Works without Local Runner      | Removing the package declaration, renaming the class to `Main`, turning off `DEBUG` |
| Needs Local Runner              | Completing `import` statements                                                      |
| Needs Local Runner settings too | Expanding `lib.*` (`setlib`), adding a submission header (`setheader`)              |

If you paste code containing `import lib.` while Local Runner is unreachable or has no library set, a notification links to the setup steps. Submitting that code as it is causes a compile error.

</details>

<details>
<summary><b>5.6 Easy Test+</b></summary>

- Based on [AtCoder Easy Test v2](https://greasyfork.org/scripts/433152), with additional features
- From the task page, you can run samples (Run, Test All Samples) and test before submitting (Test & Submit). A submission can be canceled midway
- The execution environment can be AtCoder custom test, Python in the browser, PaizaIO or Wandbox. C++ on Wandbox can use AtCoder Library. Code is sent to PaizaIO or Wandbox only when you choose them
- Output can be compared with an allowable error. The code you ran is saved per task and can be restored with "Restore Last Code"
- AtCoder custom tests run one at a time, even across tabs
- The shortcuts <kbd>Ctrl</kbd>+<kbd>Enter</kbd>, <kbd>Alt</kbd>+<kbd>Enter</kbd> and <kbd>Alt</kbd>+<kbd>Esc</kbd> are available and can be turned off in the detailed settings
- **Java gets extra features**. [Local Runner](https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner) runs the code on your PC and compiles the code you are editing in advance, so results come back sooner. Memory is shown as the cumulative allocation
- Enable only one of this and AtCoder Easy Test v2, because using both duplicates the buttons

</details>

## 6. Using other scripts

Using scripts that duplicate a CP Toolkit feature is not recommended, because buttons and notifications can appear twice. Use only one of the two for each feature. If you keep the other script, turn off the matching feature in the CP Toolkit settings.

Scripts that do not overlap work alongside CP Toolkit as they are, for example ac-predictor, AtCoderStandingsAnalysis and atcoder-difficulty-display.

The full list is in [COMPATIBILITY.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md) (Japanese).

## 7. Network access

This script sends nothing to the author's servers. Besides the site you are viewing, it connects to other services only in these cases:

- **Your Local Runner** (`http://localhost:8080` by default): Your code is sent to your own PC to transform and run it
- **PaizaIO and Wandbox**: Your code and input are sent only when you choose them as the Easy Test+ environment. The script never switches to them automatically
- **jsDelivr**: KaTeX and Prettify for editorial math and code, Pyodide for running Python in the browser, and AtCoder Library for C++ on Wandbox are fetched only when needed

KaTeX, Prettify, Pyodide and AtCoder Library are loaded at pinned versions. "Add to calendar" only places a link; the contest details reach Google when you open it.

<details>
<summary><b>How often the script accesses AtCoder</b></summary>

- **Submission notifications**: Checks only while you have submissions being judged. The interval follows the site, at least 1 second, and checking stops after 30 minutes
- **Clarification notifications**: Checks once a minute during a contest, but not in the first 5 minutes
- **Task status colors**: Fetches every page of your submissions in order when you open the task list or open the dropdown for the first time, but not in the first 5 minutes of a contest
- **Task dropdown**: Fetches once per contest and remembers it for 10 days
- **All editorials**: Fetches only the editorials shown on screen, every 0.5 seconds
- **Next contests**: Fetches only when you open the menu and remembers it for 1 hour
- **Performance on the user page graph**: Fetches once when you open a user page
- **Easy Test+**: Accesses the site only when you run code. AtCoder custom tests run one at a time, even across tabs

When a request fails, the script waits longer before trying again.

</details>

## 8. Migrating from the old scripts

These scripts have been merged into CP Toolkit. Their final versions are available from the [Release](https://github.com/nsubaru11/competitive-programming-tools/releases/tag/legacy-userscripts-final).

AtCoder Custom Default Submissions, AtCoder Easy Test for Java, AtCoder Highlighter, AtCoder Listing Tasks, AtCoder Markdown Copier, AtCoder Performance Overlay, AtCoder Widen Container, Java Code Submitter, Paiza Language Selector

<details>
<summary><b>Migration steps</b></summary>

1. Update the old scripts to their final versions and install CP Toolkit
2. Open one site where an old script runs and reload it. Settings are carried over automatically, and items you have already set in CP Toolkit are not overwritten
3. After checking that the settings were carried over, delete the old scripts

While both are installed, the old scripts do not run their main code. Settings are shared across sites, so you do not need to repeat this on each site.

These settings are carried over:

- **AtCoder Easy Test for Java**: Settings such as precompiling the code being edited, and the Local Runner URL
- **AtCoder Highlighter**: Highlight colors
- **AtCoder Widen Container**: Page width
- **Paiza Language Selector**: The language to select automatically

</details>

<details>
<summary><b>Differences from the old scripts</b></summary>

- The default filter on the submissions tab has been dropped. Open AC submissions from the AC submission buttons on the task page
- Easy Test+ is off by default. It is turned on when you migrate from the old version
- Desktop notifications are shown not only while you view another tab but also while you are away from the browser
- Java Code Submitter settings and code saved in Easy Test+ are not carried over
- Color settings accept only the `#rrggbb` format
- "recent" on the rating graph shows the specified range. The default is the last 20 contests
- Shortcuts work only when the modifier keys match exactly
- The settings button on the bottom panel of Easy Test+ opens the CP Toolkit settings
- On Codeforces, the Easy Test+ buttons are shown without decoration

</details>

## 9. Source code and license

The distributed code is the TypeScript source bundled into one file, neither obfuscated nor minified. The source is on [GitHub](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit).

Claude Opus 5.5 was used in development. The design and specifications were decided by the author.

The bundle includes third-party code and turndown, so its license is `MIT AND Apache-2.0 AND 0BSD`. See [SOURCES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/SOURCES.md) for the origin of each feature and [THIRD_PARTY_NOTICES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md) for third-party licenses.

## 10. Bugs and requests

Please use [GitHub Issues](https://github.com/nsubaru11/competitive-programming-tools/issues) or the Greasy Fork feedback page.
