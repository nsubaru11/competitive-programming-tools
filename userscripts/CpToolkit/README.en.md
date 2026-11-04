# CP Toolkit

A userscript that combines competitive programming helpers into one script. It focuses on AtCoder, and every feature can be switched on and off individually.

[日本語](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.md)

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. In Chrome and other Chromium-based browsers, turn on "Allow User Scripts" in the Tampermonkey extension details
3. Install the script from its [Greasy Fork page](https://greasyfork.org/scripts/603262-cp-toolkit)

## Usage

Open the settings from "Open settings" in the Tampermonkey menu, or from "CP Toolkit" in the AtCoder header. Each feature can be switched on and off there.

The interface follows the language of the site and is available in Japanese and English.

## Features

Everything is enabled from the start, except the features marked "off by default".

### Layout

- **Wider page**: Widens the central column of the page and adds a border to the editor
- **Open menus on hover**: Opens menus when the pointer moves over them

### Statement

- **Statement highlighting**: Highlights numbers, variables, and the time and memory limits
- **Variable highlighting**: Hovering a variable highlights every occurrence. Click to pin, Esc to clear
- **Copy statement**: Copies each section or the whole statement as Markdown or plain text
- **Side-by-side samples (off by default)**: Places the input and output formats and samples side by side

### Submissions

- **Keep search filters**: Keeps search filters when switching between All and My submissions
- **Shortcuts to AC submissions**: Opens AC submissions sorted by time and by code size
- **Language buttons**: Switches between your frequently used languages with buttons. Pick the languages from the gear below the language selector
- **Source comments**: Adds comments such as reference URLs to the top and bottom of pasted code
- **Submission notifications**: Shows the verdict right after judging finishes, on any page. A desktop notification is also shown while you are away from AtCoder
- **Average results**: Shows average time and memory on the submission page
- **Timed submission (off by default)**: Submits your code after the specified time

### Contest

- **Clarification notifications**: Notifies you when the organizers post an answer or a correction during a contest
- **Task dropdown**: Opens tasks from the Tasks tab and opens several tasks at once
- **Task status colors**: Colors the task list and the dropdown by all your submissions, including those after the contest
- **All editorials**: Shows the editorials of every task on one page
- **Contest links on the top page**: Replaces the top page list with links to past contests by type
- **Latest contests**: Adds a header menu with the upcoming contests listed on the home page
- **Add to calendar**: Adds a link to contest pages that registers the contest in Google Calendar
- **Virtual contest timer**: Shows the time until the start and the time left in the corner clock
- **Tessoku difficulty**: Shows the difficulty from the book on the Tessoku task list

### Results

- **Performance graph**: Overlays performance on the rating graph, with a recent range set by count or percentage
- **Colored contest history**: Colors performance and rating values in the contest history

### Execution

- **Java submission helper**: Transforms pasted code for submission and adds submit shortcuts
- **Local Runner**: Connects to the local server used to transform and run Java code. It needs a separate installation
- **Easy Test (for Java, off by default)**: Runs samples from the task page for Java solutions
- **paiza language selection**: Selects the specified language on paiza submission pages. It does nothing until you set a language

## Supported sites

The script focuses on AtCoder. Easy Test also works on yukicoder and Codeforces. The Java submission helper also works on Codeforces, AOJ, Library Checker and paiza.

## Using other scripts

Using scripts that duplicate a CP Toolkit feature is not recommended, because buttons and notifications can appear twice. Use only one of the two for each feature. If you keep the other script, turn off the matching feature in the CP Toolkit settings.

Scripts that do not overlap work alongside CP Toolkit as they are, for example ac-predictor, AtCoderStandingsAnalysis and atcoder-difficulty-display.

The full list is in [COMPATIBILITY.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md) (Japanese).

## Network access

This script sends nothing to the author's servers. Besides the site you are viewing, it connects to other services only in these cases:

- **Your Local Runner** (`http://localhost:8080` by default): Your code is sent to your own PC to transform and run it
- **PaizaIO and Wandbox**: Your code and input are sent only when you choose them as the Easy Test environment. The script never switches to them automatically
- **jsDelivr**: KaTeX and Prettify for editorial math and code, Pyodide for running Python in the browser, and AtCoder Library for C++ on Wandbox are fetched only when needed

KaTeX, Prettify, Pyodide and AtCoder Library are loaded at pinned versions. "Add to calendar" only places a link; the contest details reach Google when you open it.

## Receiving notifications

Submission and clarification notifications are checked by your open AtCoder tabs. Keep at least one AtCoder tab open. If all of them are closed, no notification arrives.

## Source code and license

The distributed code is the TypeScript source bundled into one file, neither obfuscated nor minified. The source is on [GitHub](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit).

Claude Opus 5.5 was used in development. The design and specifications were decided by the author.

The bundle includes third-party code and turndown, so its license is `MIT AND Apache-2.0 AND 0BSD`. See [SOURCES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/SOURCES.md) for the origin of each feature and [THIRD_PARTY_NOTICES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md) for third-party licenses.

## Bugs and requests

Please use [GitHub Issues](https://github.com/nsubaru11/competitive-programming-tools/issues) or the Greasy Fork feedback page.
