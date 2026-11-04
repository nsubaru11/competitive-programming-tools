<div align="center">
<h1>CP Toolkit</h1>
<p><strong>A userscript that combines competitive programming helpers into one script</strong></p>
<p>It focuses on AtCoder and improves the statement, submission, contest and results pages. Every feature can be switched on and off individually.</p>
<p><a href="https://greasyfork.org/scripts/603262-cp-toolkit"><img src="https://img.shields.io/greasyfork/v/603262?label=Greasy%20Fork&color=670000" alt="Greasy Fork version"></a>
<a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md"><img src="https://img.shields.io/greasyfork/l/603262" alt="License"></a></p>
<p><a href="https://greasyfork.org/scripts/603262-cp-toolkit"><strong>Install</strong></a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/COMPATIBILITY.md">Using other scripts</a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/issues">Bugs and requests</a> ・ <a href="https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/README.md">日本語</a></p>
</div>

## 1. Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. In Chrome and other Chromium-based browsers, turn on "Allow User Scripts" in the Tampermonkey extension details
3. Install the script from its [Greasy Fork page](https://greasyfork.org/scripts/603262-cp-toolkit)

## 2. Usage

Open the settings from "Open settings" in the Tampermonkey menu, or from "CP Toolkit" in the AtCoder header. Each feature can be switched on and off there. Some features can be adjusted further in their detailed settings.

The interface follows the language of the site and is available in Japanese and English.

## 3. Supported sites

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Site</th>
<th style="border: 1px solid #888">Available features</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888">AtCoder</td>
<td style="border: 1px solid #888">Every feature except paiza language selection</td>
</tr>
<tr>
<td style="border: 1px solid #888">yukicoder</td>
<td style="border: 1px solid #888">Easy Test+</td>
</tr>
<tr>
<td style="border: 1px solid #888">Codeforces</td>
<td style="border: 1px solid #888">Easy Test+, Java submission helper</td>
</tr>
<tr>
<td style="border: 1px solid #888">AOJ, Library Checker</td>
<td style="border: 1px solid #888">Java submission helper</td>
</tr>
<tr>
<td style="border: 1px solid #888">paiza</td>
<td style="border: 1px solid #888">Java submission helper, paiza language selection</td>
</tr>
</tbody></table>

## 4. Feature list

All features are enabled from the start, except those marked <sub>off by default</sub>. Features marked <sub>details</sub> are explained further in "5. Feature details".

### 4.1 Layout

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Wider page</strong></td>
<td style="border: 1px solid #888">Widens the central column of the page and adds a border to the editor</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Open menus on hover</strong></td>
<td style="border: 1px solid #888">Opens menus when the pointer moves over them</td>
</tr>
</tbody></table>

### 4.2 Statement

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Statement highlighting</strong></td>
<td style="border: 1px solid #888">Highlights numbers, variables, and the time and memory limits</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Highlight hovered variables and numbers</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Hovering a variable or a number highlights every occurrence of it</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Copy statement</strong></td>
<td style="border: 1px solid #888">Copies each section or the whole statement as Markdown or plain text</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Side-by-side samples</strong> <sub>off by default</sub></td>
<td style="border: 1px solid #888">Places the input and output formats and samples side by side</td>
</tr>
</tbody></table>

### 4.3 Submissions

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Keep submission filters</strong></td>
<td style="border: 1px solid #888">Keeps search filters when switching between All and My submissions</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>AC submission buttons</strong></td>
<td style="border: 1px solid #888">Opens the AC submissions for the task, sorted by time and by code size</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Language switch buttons</strong></td>
<td style="border: 1px solid #888">Switches between your frequently used languages with buttons. Pick the languages from the gear below the language selector</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Header and footer</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Adds a header to the top and a footer to the bottom of pasted code</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Submission notifications</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Shows the verdict right after judging finishes, on any page</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Test case averages</strong></td>
<td style="border: 1px solid #888">Shows average time and memory on the submission page</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Delayed submission</strong> <sub>off by default</sub></td>
<td style="border: 1px solid #888">Submits your code after the specified time</td>
</tr>
</tbody></table>

### 4.4 Contest

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Clarification notifications</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Notifies you when the organizers post an answer or a correction during a contest</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Task dropdown</strong></td>
<td style="border: 1px solid #888">Opens tasks from the Tasks tab and opens several tasks at once</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Task status colors</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Colors the task list and the dropdown by all your submissions, including those after the contest</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>All editorials</strong></td>
<td style="border: 1px solid #888">Shows the editorials of every task on one page</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Contest links on the top page</strong></td>
<td style="border: 1px solid #888">Replaces the top page list with links to past contests by type</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Next contests</strong></td>
<td style="border: 1px solid #888">Adds a header menu with the upcoming contests listed on the home page</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Add to calendar</strong></td>
<td style="border: 1px solid #888">Adds a link to contest pages that registers the contest in Google Calendar</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Virtual contest timer</strong></td>
<td style="border: 1px solid #888">Shows the time until the start and the time left in the corner clock</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Tessoku difficulty</strong></td>
<td style="border: 1px solid #888">Shows the difficulty from the book on the Tessoku task list</td>
</tr>
</tbody></table>

### 4.5 Results

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Performance on the user page graph</strong></td>
<td style="border: 1px solid #888">Overlays performance on the rating graph of user pages, with a recent range set by count or percentage</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Colored contest history</strong></td>
<td style="border: 1px solid #888">Colors performance and rating values in the contest history</td>
</tr>
</tbody></table>

### 4.6 Execution

<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Feature</th>
<th style="border: 1px solid #888">What it does</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888"><strong>Java submission helper</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Transforms pasted code for submission and adds submit shortcuts</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Local Runner</strong> <sub>details</sub></td>
<td style="border: 1px solid #888">Connects to the local server used to transform and run Java code. It needs a separate installation</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>Easy Test+</strong> <sub>off by default, details</sub></td>
<td style="border: 1px solid #888">Runs samples from the task page and checks the results</td>
</tr>
<tr>
<td style="border: 1px solid #888"><strong>paiza language selection</strong></td>
<td style="border: 1px solid #888">Selects the specified language on paiza submission pages. It does nothing until you set a language</td>
</tr>
</tbody></table>

## 5. Feature details

<details>
<summary><b>5.1 Highlight hovered variables and numbers</b></summary>
<ul>
<li>Every occurrence of the hovered variable or number in the statement is highlighted. Moving away clears it</li>
<li>Click to pin the highlight. Click again or press <kbd>Esc</kbd> to clear it</li>
<li>&quot;Highlight variables&quot; and &quot;Highlight numbers&quot; in the detailed settings switch variables and numbers separately</li>
<li>A number with an exponent, such as the &quot;10&quot; in &quot;10<sup>5</sup>&quot;, counts as the same number as any other &quot;10&quot;</li>
</ul>
</details>

<details>
<summary><b>5.2 Header and footer</b></summary>
<p>Open the input screen from the &quot;Header and footer&quot; button to the left of the editor on task and submission pages. The button changes color when it has content. The header goes to the top of the code and the footer to the bottom, and each is saved separately. They are useful for notes such as reference URLs.</p>
<ul>
<li>They are added when pasting replaces the whole code. Pasting part of the code adds nothing</li>
<li>The content is saved when you leave the input field and is used for the next task too. Choose &quot;This task only&quot; to save it for that task alone</li>
<li>Saved content can be loaded with &quot;Restore from history&quot;, which keeps the latest 20 entries. Content saved with &quot;Save with a name&quot; stays until you delete it</li>
<li>Changing the language also switches the comment syntax. Once you edit the inserted part, it is no longer rewritten</li>
<li>Single-line comments are used by default. A multi-line comment can be chosen in the settings</li>
<li>Without &quot;Comment out when inserting&quot;, the text is inserted as written, so write the comment markers yourself</li>
<li><code>{url}</code>, <code>{task}</code> and <code>{contest}</code> become the task URL, the task ID and the contest ID</li>
<li>For languages whose comment syntax is unknown, nothing is inserted and a notification tells you so</li>
</ul>
</details>

<details>
<summary><b>5.3 Submission and clarification notifications</b></summary>
<ul>
<li>Notifications are checked by your open AtCoder tabs. Keep at least one AtCoder tab open. If all of them are closed, no notification arrives</li>
<li>While you are not looking at AtCoder, a desktop notification is also shown, both while you view another tab and while you are away from the browser. Desktop notifications can be turned off in the detailed settings</li>
<li>Clarifications are checked only during a contest</li>
</ul>
</details>

<details>
<summary><b>5.4 Task status colors</b></summary>
<ul>
<li>Your submission list is read, so submissions both during and after the contest are reflected</li>
<li>A task with at least one AC or scored submission is colored as accepted, and a task with submissions but none accepted as rejected. Submissions still being judged are not counted</li>
<li>The colors can be changed in the detailed settings</li>
<li>Nothing is fetched while you are logged out or in the first 5 minutes of a contest</li>
</ul>
</details>

<details>
<summary><b>5.5 Java submission helper and Local Runner</b></summary>
<p>The Java submission helper works without <a href="https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner">Local Runner</a>.</p>
<table style="border: 1px solid #888">
<thead>
<tr>
<th style="border: 1px solid #888">Requirement</th>
<th style="border: 1px solid #888">What you can do</th>
</tr>
</thead>
<tbody><tr>
<td style="border: 1px solid #888">Works without Local Runner</td>
<td style="border: 1px solid #888">Removing the package declaration, renaming the class to <code>Main</code>, turning off <code>DEBUG</code></td>
</tr>
<tr>
<td style="border: 1px solid #888">Needs Local Runner</td>
<td style="border: 1px solid #888">Completing <code>import</code> statements</td>
</tr>
<tr>
<td style="border: 1px solid #888">Needs Local Runner settings too</td>
<td style="border: 1px solid #888">Expanding <code>lib.*</code> (<code>setlib</code>), adding a submission header (<code>setheader</code>)</td>
</tr>
</tbody></table>
<p>If you paste code containing <code>import lib.</code> while Local Runner is unreachable or has no library set, a notification links to the setup steps. Submitting that code as it is causes a compile error.</p>
</details>

<details>
<summary><b>5.6 Easy Test+</b></summary>
<ul>
<li>Based on <a href="https://greasyfork.org/scripts/433152">AtCoder Easy Test v2</a>, with additional features</li>
<li>From the task page, you can run samples (Run, Test All Samples) and test before submitting (Test &amp; Submit). A submission can be canceled midway</li>
<li>The execution environment can be AtCoder custom test, Python in the browser, PaizaIO or Wandbox. C++ on Wandbox can use AtCoder Library. Code is sent to PaizaIO or Wandbox only when you choose them</li>
<li>Output can be compared with an allowable error. The code you ran is saved per task and can be restored with &quot;Restore Last Code&quot;</li>
<li>AtCoder custom tests run one at a time, even across tabs</li>
<li>The shortcuts <kbd>Ctrl</kbd>+<kbd>Enter</kbd>, <kbd>Alt</kbd>+<kbd>Enter</kbd> and <kbd>Alt</kbd>+<kbd>Esc</kbd> are available and can be turned off in the detailed settings</li>
<li><strong>Java gets extra features</strong>. <a href="https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner">Local Runner</a> runs the code on your PC and compiles the code you are editing in advance, so results come back sooner. Memory is shown as the cumulative allocation</li>
<li>Enable only one of this and AtCoder Easy Test v2, because using both duplicates the buttons</li>
</ul>
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
<ul>
<li><strong>Submission notifications</strong>: Checks only while you have submissions being judged. The interval follows the site, at least 1 second, and checking stops after 30 minutes</li>
<li><strong>Clarification notifications</strong>: Checks once a minute during a contest, but not in the first 5 minutes</li>
<li><strong>Task status colors</strong>: Fetches every page of your submissions in order when you open the task list or open the dropdown for the first time, but not in the first 5 minutes of a contest</li>
<li><strong>Task dropdown</strong>: Fetches once per contest and remembers it for 10 days</li>
<li><strong>All editorials</strong>: Fetches only the editorials shown on screen, every 0.5 seconds</li>
<li><strong>Next contests</strong>: Fetches only when you open the menu and remembers it for 1 hour</li>
<li><strong>Performance on the user page graph</strong>: Fetches once when you open a user page</li>
<li><strong>Easy Test+</strong>: Accesses the site only when you run code. AtCoder custom tests run one at a time, even across tabs</li>
</ul>
<p>When a request fails, the script waits longer before trying again.</p>
</details>

## 8. Migrating from the old scripts

These scripts have been merged into CP Toolkit. Their final versions are available from the [Release](https://github.com/nsubaru11/competitive-programming-tools/releases/tag/legacy-userscripts-final).

AtCoder Custom Default Submissions, AtCoder Easy Test for Java, AtCoder Highlighter, AtCoder Listing Tasks, AtCoder Markdown Copier, AtCoder Performance Overlay, AtCoder Widen Container, Java Code Submitter, Paiza Language Selector

<details>
<summary><b>Migration steps</b></summary>
<ol>
<li>Update the old scripts to their final versions and install CP Toolkit</li>
<li>Open one site where an old script runs and reload it. Settings are carried over automatically, and items you have already set in CP Toolkit are not overwritten</li>
<li>After checking that the settings were carried over, delete the old scripts</li>
</ol>
<p>While both are installed, the old scripts do not run their main code. Settings are shared across sites, so you do not need to repeat this on each site.</p>
<p>These settings are carried over:</p>
<ul>
<li><strong>AtCoder Easy Test for Java</strong>: Settings such as precompiling the code being edited, and the Local Runner URL</li>
<li><strong>AtCoder Highlighter</strong>: Highlight colors</li>
<li><strong>AtCoder Widen Container</strong>: Page width</li>
<li><strong>Paiza Language Selector</strong>: The language to select automatically</li>
</ul>
</details>

<details>
<summary><b>Differences from the old scripts</b></summary>
<ul>
<li>The default filter on the submissions tab has been dropped. Open AC submissions from the AC submission buttons on the task page</li>
<li>Easy Test+ is off by default. It is turned on when you migrate from the old version</li>
<li>Desktop notifications are shown not only while you view another tab but also while you are away from the browser</li>
<li>Java Code Submitter settings and code saved in Easy Test+ are not carried over</li>
<li>Color settings accept only the <code>#rrggbb</code> format</li>
<li>&quot;recent&quot; on the rating graph shows the specified range. The default is the last 20 contests</li>
<li>Shortcuts work only when the modifier keys match exactly</li>
<li>The settings button on the bottom panel of Easy Test+ opens the CP Toolkit settings</li>
<li>On Codeforces, the Easy Test+ buttons are shown without decoration</li>
</ul>
</details>

## 9. Source code and license

The distributed code is the TypeScript source bundled into one file, neither obfuscated nor minified. The source is on [GitHub](https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit).

Claude Opus 5.5 was used in development. The design and specifications were decided by the author.

The bundle includes third-party code and turndown, so its license is `MIT AND Apache-2.0 AND 0BSD`. See [SOURCES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/userscripts/CpToolkit/SOURCES.md) for the origin of each feature and [THIRD_PARTY_NOTICES.md](https://github.com/nsubaru11/competitive-programming-tools/blob/main/THIRD_PARTY_NOTICES.md) for third-party licenses.

## 10. Bugs and requests

Please use [GitHub Issues](https://github.com/nsubaru11/competitive-programming-tools/issues) or the Greasy Fork feedback page.
