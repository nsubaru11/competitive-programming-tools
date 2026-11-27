// ==UserScript==
// @name           CP Toolkit
// @name:en        CP Toolkit
// @namespace      https://github.com/nsubaru11/atcoder-java-tools/tree/main/userscripts
// @version        3.1.0
// @description    入出力例の横並び、提出結果の通知、問題のドロップダウンなど、AtCoder を中心に使える全27機能をまとめた UserScript です。機能ごとに ON/OFF できます。
// @description:en 27 individually configurable features for competitive programming, primarily on AtCoder, including side-by-side samples, verdict notifications and a Tasks dropdown.
// @description:ja 入出力例の横並び、提出結果の通知、問題のドロップダウンなど、AtCoder を中心に使える全27機能をまとめた UserScript です。機能ごとに ON/OFF できます。
// @author         nsubaru
// @license        MIT AND Apache-2.0 AND 0BSD
// @homepageURL    https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit
// @supportURL     https://github.com/nsubaru11/competitive-programming-tools/issues
// @match          https://onlinejudge.u-aizu.ac.jp/*
// @match          https://atcoder.jp/*
// @match          https://codeforces.com/*
// @match          https://*.contest.codeforces.com/*
// @match          https://m1.codeforces.com/*
// @match          https://m2.codeforces.com/*
// @match          https://m3.codeforces.com/*
// @match          https://judge.yosupo.jp/problem/*
// @match          https://paiza.jp/*
// @match          https://yukicoder.me/problems/*
// @grant          unsafeWindow
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addValueChangeListener
// @grant          GM_removeValueChangeListener
// @grant          GM_registerMenuCommand
// @grant          GM_setClipboard
// @grant          GM_notification
// @grant          GM_openInTab
// @grant          GM_xmlhttpRequest
// @connect        localhost
// @connect        127.0.0.1
// @connect        api.paiza.io
// @connect        wandbox.org
// @connect        cdn.jsdelivr.net
// @connect        raw.githubusercontent.com
// @connect        update.greasyfork.org
// @run-at         document-start
// @icon           https://atcoder.jp/favicon.ico
// @noframes
// @updateURL      https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js
// @downloadURL    https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js
// ==/UserScript==

// @formatter:off
/*!
CP Toolkit includes code derived from the following projects.
The toolkit's own code is available under the 0BSD license.

AtCoder Custom Default Submissions by ktnyori (MIT)
https://greasyfork.org/scripts/393705-atcoder-custom-default-submissions

AtCoder Easy Test v2 by magurofly (MIT)
https://greasyfork.org/scripts/433152-atcoder-easy-test-v2

AtCoder Perf Graph by nzm_ort (MIT)
https://greasyfork.org/scripts/476103-atcoder-perf-graph

AtCoder Listing Tasks by luuguas (Apache-2.0), modified by nsubaru
https://github.com/luuguas/AtCoderListingTasks

turndown 7.2.4 by Dom Christie (MIT)
https://github.com/mixmark-io/turndown

turndown-plugin-gfm 1.0.2 by Dom Christie (MIT)
https://github.com/mixmark-io/turndown-plugin-gfm

Copyright (c) ktnyori
Copyright (c) magurofly
Copyright (c) nzm_ort
Copyright (c) 2017 Dom Christie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The Apache License 2.0 below applies to the parts derived from AtCoder Listing Tasks.

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

*/

(() => {
	// CpToolkit/src/domain/page/route.ts
	var PATH_AND_QUERY_PATTERN = /^[a-z]+:\/\/[^/?#]+([^#]*)/i;
	var CONTEST_PATH_PATTERN = /^\/contests\/([^/?#]+)/;

	function contestIdOf(pathname) {
		return CONTEST_PATH_PATTERN.exec(pathname)?.[1];
	}

	function matchPatternToRegExp(pattern) {
		const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
		return new RegExp(`^${escaped}$`);
	}

	function matchPage(judges, href) {
		const judge = judges.find(({matches}) => matches.some((pattern) => matchPatternToRegExp(pattern).test(href)));
		if (!judge) return null;
		const pathAndQuery = PATH_AND_QUERY_PATTERN.exec(href)?.[1] || "/";
		const routeIds = Object.entries(judge.routes)
			.filter(([, pattern]) => new RegExp(pattern).test(pathAndQuery))
			.map(([name]) => `${judge.id}:${name}`);
		return {judge, routeIds: new Set(routeIds)};
	}

	// CpToolkit/src/application/feature/runtime.ts
	class FeatureRuntime {
		entries;
		listeners = new Set();
		dependencies;

		constructor(dependencies) {
			this.dependencies = dependencies;
			this.entries = dependencies.features.map((feature) => ({
				feature,
				status: {state: "pending"},
				active: false,
				dispose: undefined,
				appliedKey: "",
				baseline: null,
				queue: Promise.resolve(),
			}));
		}

		start() {
			for (const entry of this.entries) {
				entry.appliedKey = this.settingsKey(entry.feature);
				this.enqueue(entry, () => this.applyInitial(entry));
			}
			this.dependencies.settings.subscribe(() => this.applyChanges());
		}

		async settled() {
			await Promise.all(this.entries.map((entry) => entry.queue));
		}

		statusOf(featureId) {
			return this.entries.find(({feature}) => feature.id === featureId)?.status ?? {state: "outOfScope"};
		}

		subscribe(listener) {
			this.listeners.add(listener);
		}

		settingsKey({id, defaultEnabled}) {
			const {settings} = this.dependencies;
			return JSON.stringify([settings.isEnabled(id, defaultEnabled), settings.storedOptions(id)]);
		}

		isEnabled({id, defaultEnabled}) {
			return this.dependencies.settings.isEnabled(id, defaultEnabled);
		}

		isInScope({routes}) {
			const routeIds = this.dependencies.page?.routeIds;
			return routeIds !== undefined && routes.some((route) => routeIds.has(route));
		}

		enqueue(entry, task) {
			entry.queue = entry.queue.then(task);
		}

		applyChanges() {
			for (const entry of this.entries) {
				const key = this.settingsKey(entry.feature);
				if (key === entry.appliedKey) continue;
				entry.appliedKey = key;
				this.enqueue(entry, () => this.applyChange(entry, key));
			}
		}

		async applyInitial(entry) {
			const {feature} = entry;
			if (!this.isInScope(feature)) {
				this.setStatus(entry, {state: "outOfScope"});
			} else if (this.isEnabled(feature)) {
				await this.activate(entry);
			} else {
				this.setStatus(entry, {state: "disabled"});
			}
			entry.baseline = {key: entry.appliedKey, status: entry.status};
		}

		async applyChange(entry, key) {
			const {feature} = entry;
			if (key !== entry.appliedKey || !this.isInScope(feature)) return;
			if (!feature.live) {
				this.setStatus(entry, this.statusBeforeReload(entry, key));
				return;
			}
			this.deactivate(entry);
			if (this.isEnabled(feature)) await this.activate(entry);
			else this.setStatus(entry, {state: "disabled"});
		}

		statusBeforeReload({feature, baseline}, key) {
			if (baseline?.key === key) return baseline.status;
			const remainsDisabled = baseline?.status.state === "disabled" && !this.isEnabled(feature);
			return remainsDisabled ? {state: "disabled"} : {state: "reloadRequired"};
		}

		async activate(entry) {
			const {feature} = entry;
			const {lifecycle, logger, services, settings} = this.dependencies;
			this.setStatus(entry, {state: "pending"});
			try {
				await lifecycle.reach(feature.phase);
				entry.dispose = await feature.run(settings.storedOptions(feature.id), services);
				entry.active = true;
				this.setStatus(entry, {state: "running"});
			} catch (error) {
				logger.error(`Failed to start ${feature.id}`, error);
				this.setStatus(entry, {state: "failed", message: String(error)});
			}
		}

		deactivate(entry) {
			if (!entry.active) return;
			try {
				entry.dispose?.();
			} catch (error) {
				this.dependencies.logger.error(`Failed to stop ${entry.feature.id}`, error);
			}
			entry.active = false;
			entry.dispose = undefined;
		}

		setStatus(entry, status) {
			entry.status = status;
			for (const listener of this.listeners) listener();
		}
	}

	// ../shared/src/async.ts
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// ../shared/src/atcoder-samples.ts
	function atCoderSampleHeading(text) {
		const match = /^(入力例|出力例|Sample Input|Sample Output)\s*(\d*)$/i.exec(text.trim());
		if (!match) return null;
		return {input: /^(入力例|Sample Input)$/i.test(match[1]), number: match[2] ? Number(match[2]) : undefined};
	}

	// ../shared/src/query.ts
	function buildQueryString(data) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(data)) {
			if (value == null) continue;
			params.set(key, String(value));
		}
		return params.toString();
	}

	// ../shared/src/atcoder-url.ts
	var ATCODER_TASK_URL_PATTERN = /^https:\/\/atcoder\.jp\/contests\/([^/?#]+)\/tasks\/([^/?#]+)/;

	function parseAtCoderTaskUrl(url) {
		const match = url.match(ATCODER_TASK_URL_PATTERN);
		if (!match) return null;
		return {
			contestId: match[1],
			taskId: match[2],
		};
	}

	function buildAtCoderClarificationsUrl(contestId) {
		return `https://atcoder.jp/contests/${contestId}/clarifications`;
	}

	function buildAtCoderClarificationCountUrl(contestId, sinceMs) {
		const since = `${new Date(sinceMs).toISOString().slice(0, 19).replace("T", " ")}+0000`;
		return `${buildAtCoderClarificationsUrl(contestId)}/count?t=${encodeURIComponent(since)}`;
	}

	function buildAtCoderSubmissionsQuery(filter) {
		const params = {};
		if (filter.language !== undefined) params["f.LanguageName"] = filter.language;
		if (filter.status !== undefined) params["f.Status"] = filter.status;
		if (filter.orderBy !== undefined) params["orderBy"] = filter.orderBy;
		if (filter.task) params["f.Task"] = filter.task;
		return buildQueryString(params);
	}

	function buildAtCoderSubmissionUrl(contestId, submissionId) {
		return `https://atcoder.jp/contests/${contestId}/submissions/${submissionId}`;
	}

	function buildAtCoderSubmissionStatusJsonUrl(contestId, submissionIds) {
		const base = `https://atcoder.jp/contests/${contestId}/submissions/me/status/json`;
		const params = new URLSearchParams();
		params.set("reload", "true");
		for (const sid of submissionIds) {
			params.append("sids[]", String(sid));
		}
		return `${base}?${params.toString()}`;
	}

	// ../shared/src/utils.ts
	function normalizeNewlines(text) {
		return text.replace(
			/\r\n?/g,
			`
`,
		);
	}

	var IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

	function isIdentifier(name) {
		return IDENTIFIER.test(name);
	}

	// ../shared/src/debug-flag.ts
	function lineEnd(source, from) {
		const match = /[\r\n]/g;
		match.lastIndex = from;
		return match.exec(source)?.index ?? source.length;
	}

	function afterNewline(source, index) {
		return (
			index +
			(source.startsWith(
				`\r
`,
				index,
			)
				? 2
				: 1)
		);
	}

	var lineComment =
		(marker, continued = false) =>
		(source, at) => {
			if (!source.startsWith(marker, at)) return null;
			let end = lineEnd(source, at);
			while (continued && end < source.length && source[end - 1] === "\\")
				end = lineEnd(source, afterNewline(source, end));
			return {end, literal: false};
		};
	var blockComment = (open, close) => (source, at) => {
		if (!source.startsWith(open, at)) return null;
		const end = source.indexOf(close, at + open.length);
		return {end: end < 0 ? source.length : end + close.length, literal: false};
	};
	var nestedBlockComment = (open, close) => (source, at) => {
		if (!source.startsWith(open, at)) return null;
		let depth = 0;
		for (let i = at; i < source.length;) {
			if (source.startsWith(open, i)) {
				depth++;
				i += open.length;
			} else if (source.startsWith(close, i)) {
				i += close.length;
				if (--depth === 0) return {end: i, literal: false};
			} else i++;
		}
		return {end: source.length, literal: false};
	};
	var quoted =
		(quote, {escapes = true, multiline = false} = {}) =>
		(source, at) => {
			if (!source.startsWith(quote, at)) return null;
			for (let i = at + quote.length; i < source.length; i++) {
				if (escapes && source[i] === "\\") i++;
				else if (
					!multiline &&
					(source[i] ===
						`
` ||
						source[i] === "\r")
				)
					return {end: i, literal: true};
				else if (source.startsWith(quote, i)) return {end: i + quote.length, literal: true};
			}
			return {end: source.length, literal: true};
		};
	var rawQuoted = (open, closeOf) => (source, at) => {
		const match = open.exec(source.slice(at, at + 40));
		if (!match || match.index !== 0) return null;
		const close = closeOf(match);
		const end = source.indexOf(close, at + match[0].length);
		return {end: end < 0 ? source.length : end + close.length, literal: true};
	};
	var numberLiteral = (source, at) => {
		if (!/[0-9]/.test(source[at] ?? "") || /[\w$]/.test(source[at - 1] ?? "")) return null;
		let end = at + 1;
		while (end < source.length && /[\w']/.test(source[end])) end++;
		return {end, literal: false};
	};
	var rustChar = (source, at) => {
		const match = /^'(?:\\(?:u\{[0-9a-fA-F]+\}|x[0-9a-fA-F]{2}|.)|[^'\\\r\n])'/u.exec(source.slice(at, at + 12));
		return match ? {end: at + match[0].length, literal: true} : null;
	};

	function pythonStringEnd(source, start) {
		const quote = source[start];
		const delimiter = source.startsWith(quote.repeat(3), start) ? quote.repeat(3) : quote;
		const formatted = /^(?:f|fr|rf)$/i.test(
			source.slice(Math.max(0, start - 2), start).match(/[a-z]+$/i)?.[0] ?? "",
		);
		let braces = 0;
		for (let i = start + delimiter.length; i < source.length; i++) {
			const ch = source[i];
			if (ch === "\\") {
				i += source.startsWith(
					`\r
`,
					i + 1,
				)
					? 2
					: 1;
			} else if (braces > 0) {
				if (ch === "'" || ch === '"') i = pythonStringEnd(source, i) - 1;
				else if (ch === "#") i = lineEnd(source, i) - 1;
				else if (ch === "{") braces++;
				else if (ch === "}") braces--;
			} else if (source.startsWith(delimiter, i)) {
				return i + delimiter.length;
			} else if (formatted && ch === "{") {
				if (source[i + 1] === "{") i++;
				else braces = 1;
			}
		}
		return source.length;
	}

	var pythonString = (source, at) => {
		return source[at] === "'" || source[at] === '"' ? {end: pythonStringEnd(source, at), literal: true} : null;
	};
	var C_FAMILY_DECLARATION = (flag) =>
		new RegExp(
			String.raw`^([ \t]*(?:(?:static|const|constexpr|constinit|inline|volatile|extern)[ \t]+)*(?:bool|_Bool|auto)[ \t]+${flag}[ \t]*=[ \t]*)(true|false)[ \t]*;`,
		);
	var C_SCANNERS = [numberLiteral, lineComment("//", true), blockComment("/*", "*/"), quoted('"'), quoted("'")];
	var DEBUG_FLAG_SYNTAXES = {
		python3: {
			scanners: [lineComment("#"), pythonString],
			declaration: (flag) =>
				new RegExp(String.raw`^(${flag}[ \t]*(?::[ \t]*bool[ \t]*)?=[ \t]*)(True|False)[ \t]*;?[ \t]*$`),
			literals: ["False", "True"],
			scope: "indent",
		},
		c: {
			scanners: C_SCANNERS,
			declaration: C_FAMILY_DECLARATION,
			literals: ["false", "true"],
			scope: "braces",
			preprocessor: true,
		},
		cpp: {
			scanners: [rawQuoted(/R"([^\s\\()]{0,16})\(/, (match) => `)${match[1]}"`), ...C_SCANNERS],
			declaration: C_FAMILY_DECLARATION,
			literals: ["false", "true"],
			scope: "braces",
			preprocessor: true,
		},
		go: {
			scanners: [
				lineComment("//"),
				blockComment("/*", "*/"),
				quoted('"'),
				quoted("'"),
				quoted("`", {escapes: false, multiline: true}),
			],
			declaration: (flag) =>
				new RegExp(
					String.raw`^([ \t]*(?:const|var)[ \t]+${flag}(?:[ \t]+bool)?[ \t]*=[ \t]*)(true|false)[ \t]*;?[ \t]*(?:$|//)`,
				),
			literals: ["false", "true"],
			scope: "braces",
		},
		rust: {
			scanners: [
				lineComment("//"),
				nestedBlockComment("/*", "*/"),
				rawQuoted(/b?r(#*)"/, (match) => `"${match[1]}`),
				quoted('"', {multiline: true}),
				rustChar,
			],
			declaration: (flag) =>
				new RegExp(
					String.raw`^([ \t]*(?:pub(?:\([^)]*\))?[ \t]+)?(?:const|static)[ \t]+${flag}[ \t]*:[ \t]*bool[ \t]*=[ \t]*)(true|false)[ \t]*;`,
				),
			literals: ["false", "true"],
			scope: "braces",
		},
	};
	var DEBUG_FLAG_FAMILIES = Object.keys(DEBUG_FLAG_SYNTAXES);

	function masked(source, scanners) {
		const parts = [];
		for (let i = 0; i < source.length;) {
			let token = null;
			for (const scanner of scanners) {
				token = scanner(source, i);
				if (token) break;
			}
			if (!token || token.end <= i) {
				parts.push(source[i++]);
				continue;
			}
			const text = source.slice(i, token.end);
			if (token.literal) {
				let mask = text.replace(/[^\r\n]/g, " ");
				mask = "@" + mask.slice(1);
				parts.push(mask);
			} else {
				parts.push(/^[0-9]/.test(text) ? text : text.replace(/[^\r\n]/g, " "));
			}
			i = token.end;
		}
		return parts.join("");
	}

	function findDebugFlag(source, flag, syntax) {
		const code = masked(source, syntax.scanners);
		const pattern = syntax.declaration(flag);
		let depth = 0;
		let continued = false;
		let found = null;
		for (let lineStart = 0; lineStart < code.length;) {
			const end = lineEnd(code, lineStart);
			const line = code.slice(lineStart, end);
			const preprocessor = syntax.preprocessor === true && line.trimStart().startsWith("#");
			if (!continued && !preprocessor && depth === 0) {
				const declaration = pattern.exec(line);
				if (declaration) {
					if (found) return "multiple";
					const start = lineStart + declaration[1].length;
					found = {start, end: start + declaration[2].length};
				}
			}
			if (!preprocessor && (syntax.scope === "indent" || !continued)) {
				for (const ch of line) {
					if ("([{".includes(ch)) depth++;
					else if (")]}".includes(ch)) depth--;
				}
			}
			continued = line.endsWith("\\");
			lineStart = end < code.length ? afterNewline(code, end) : end + 1;
		}
		return found;
	}

	function rewriteDebugFlag(source, flag, debug, family) {
		const syntax = DEBUG_FLAG_SYNTAXES[family];
		if (!syntax || !isIdentifier(flag)) return source;
		const found = findDebugFlag(source, flag, syntax);
		if (found === "multiple") return null;
		if (!found) return source;
		return source.slice(0, found.start) + syntax.literals[debug ? 1 : 0] + source.slice(found.end);
	}

	// ../shared/src/easy-test-judge.ts
	var NUMBER_PATTERN = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/;
	var SCALE = 2 ** -512;

	function withinAllowableError(x, y, allowableError) {
		if (!NUMBER_PATTERN.test(x) || !NUMBER_PATTERN.test(y) || !(x.includes(".") || y.includes("."))) return false;
		const a = Number(x);
		const b = Number(y);
		if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(allowableError)) return false;
		const difference = Math.abs(a - b);
		if (Number.isFinite(difference)) return difference <= Math.max(allowableError, Math.abs(b) * allowableError);
		const a2 = a * SCALE;
		const b2 = b * SCALE;
		return Math.abs(a2 - b2) <= Math.max(allowableError * SCALE, Math.abs(b2) * allowableError);
	}

	function evaluateEasyTestOutput(runResult, expectedOutput, options = {trim: true, split: true}) {
		const status = runResult.status;
		if (status !== "OK" || typeof expectedOutput !== "string") {
			return {status, output: runResult.output || "", expectedOutput};
		}
		let output = runResult.output || "";
		let expected = expectedOutput;
		if (options.trim) {
			expected = expected.trim();
			output = output.trim();
		}
		let equals = (x, y) => x === y;
		const allowableError = options.allowableError;
		if (allowableError) {
			equals = (x, y) => x === y || withinAllowableError(x, y, allowableError);
		}
		if (options.split) {
			const superEquals = equals;
			equals = (x, y) => {
				const xs = x.split(/\s+/);
				const ys = y.split(/\s+/);
				if (xs.length !== ys.length) return false;
				for (let i = 0; i < xs.length; i++) {
					if (!superEquals(xs[i], ys[i])) return false;
				}
				return true;
			};
		}
		const judgedStatus = equals(output, expected) ? "AC" : "WA";
		return {status: judgedStatus, output, expectedOutput: expected};
	}

	// ../shared/src/java-lex.ts
	var JAVA_LEXEME =
		/\s+|\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"""(?:\\[\s\S]|(?!""")[^\\])*?(?:"""|$)|"(?:\\[\s\S]|[^"\\\n])*(?:"|$)|'(?:\\[\s\S]|[^'\\\n])*(?:'|$)|[\p{ID_Start}\p{Sc}\p{Pc}$][\p{ID_Continue}\p{Sc}\p{Pc}$]*|\.\.\.|::|[^\s]/gu;
	var PAIRS = {")": "(", "]": "[", "}": "{"};
	var JAVA_IDENTIFIER = /^[\p{ID_Start}\p{Sc}\p{Pc}$][\p{ID_Continue}\p{Sc}\p{Pc}$]*$/u;

	function scanJava(source, decoded = false) {
		const tokens = [];
		const stack = [];
		let complete = decoded || !/\\u+[\da-fA-F]{4}/.test(source);
		for (const m of source.matchAll(JAVA_LEXEME)) {
			const text = m[0];
			if (text.startsWith("/*") && !text.endsWith("*/")) complete = false;
			if (/^\s/u.test(text) || text.startsWith("//") || text.startsWith("/*")) continue;
			const token = {text, start: m.index, end: m.index + text.length, pair: -1};
			if (text.startsWith('"') || text.startsWith("'")) {
				const delimiter = text.startsWith('"""') ? '"""' : text[0];
				if (text.length < 2 * delimiter.length || !text.endsWith(delimiter)) complete = false;
			} else if (text === "(" || text === "[" || text === "{") {
				stack.push(tokens.length);
			} else if (Object.hasOwn(PAIRS, text)) {
				const open = stack.pop();
				if (open === undefined || tokens[open].text !== PAIRS[text]) complete = false;
				else {
					token.pair = open;
					tokens[open].pair = tokens.length;
				}
			}
			tokens.push(token);
		}
		return {tokens, complete: complete && stack.length === 0};
	}

	function isJavaQualifiedName(name) {
		return name.split(".").every((part) => JAVA_IDENTIFIER.test(part));
	}

	function qualifiedName(tokens, start) {
		let index = start;
		if (!JAVA_IDENTIFIER.test(tokens[index]?.text ?? "")) return null;
		let name = tokens[index++].text;
		while (tokens[index]?.text === ".") {
			const part = tokens[index + 1]?.text ?? "";
			if (part !== "*" && !JAVA_IDENTIFIER.test(part)) return null;
			name += "." + part;
			index += 2;
			if (part === "*") break;
		}
		return tokens[index]?.text === ";" ? {name, end: index} : null;
	}

	var UNICODE_ESCAPE = /^\\u+([\da-fA-F]{4})/;

	function decodeUnicodeEscapes(source) {
		const chars = [];
		const offsets = [];
		let backslashes = 0;
		for (let i = 0; i < source.length;) {
			const escape =
				source[i] === "\\" && backslashes % 2 === 0 ? UNICODE_ESCAPE.exec(source.slice(i, i + 32)) : null;
			if (escape) {
				chars.push(String.fromCharCode(Number.parseInt(escape[1], 16)));
				offsets.push(i);
				i += escape[0].length;
				backslashes = 0;
				continue;
			}
			backslashes = source[i] === "\\" ? backslashes + 1 : 0;
			chars.push(source[i]);
			offsets.push(i);
			i++;
		}
		offsets.push(source.length);
		return {text: chars.join(""), offsets};
	}

	// ../shared/src/java-imports.ts
	function importRanges(source) {
		const {tokens} = scanJava(source);
		const result = [];
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (token.text === "{") break;
			if (token.pair > i) {
				i = token.pair;
				continue;
			}
			if (token.text !== "import") continue;
			const declaration = qualifiedName(tokens, i + (tokens[i + 1]?.text === "static" ? 2 : 1));
			if (declaration) {
				result.push({name: declaration.name, start: token.start, end: tokens[declaration.end].end});
				i = declaration.end;
			}
		}
		return result;
	}

	function importsPackage(code, packageName) {
		return importRanges(normalizeNewlines(code)).some(({name}) => name.startsWith(packageName + "."));
	}

	function diagnosticOffset(lineStarts, source, diagnostic) {
		const start = lineStarts[diagnostic.line - 1];
		if (start === undefined || diagnostic.column <= 0) return -1;
		let column = 1;
		for (
			let offset = start;
			offset < source.length &&
			source[offset] !==
				`
`;
			offset++
		) {
			if (column === diagnostic.column) return offset;
			column += source[offset] === "\t" ? 8 - ((column - 1) % 8) : 1;
			if (column > diagnostic.column) return -1;
		}
		return -1;
	}

	function unresolvedImports(code, diagnostics) {
		const source = normalizeNewlines(code);
		const imports = importRanges(source);
		const found = new Set();
		const starts = [0];
		for (let i = 0; i < source.length; i++)
			if (
				source[i] ===
				`
`
			)
				starts.push(i + 1);
		for (const item of diagnostics) {
			if (item.kind !== "ERROR" || !/^compiler\.err\.(?:doesnt\.exist$|cant\.resolve(?:\.|$))/.test(item.code))
				continue;
			if (item.importName) {
				found.add(item.importName);
				continue;
			}
			const offset = diagnosticOffset(starts, source, item);
			const range = imports.find(({start, end}) => start <= offset && offset < end);
			if (range) found.add(range.name);
		}
		const inSourceOrder = imports.map(({name}) => name).filter((name) => found.has(name));
		return [...new Set([...inSourceOrder, ...found])];
	}

	// ../shared/src/java-transform.ts
	var TYPE_KEYWORDS = new Set(["class", "interface", "record", "enum"]);
	var NOT_TYPE_WORDS = new Set([
		...TYPE_KEYWORDS,
		"new",
		"return",
		"throw",
		"case",
		"instanceof",
		"extends",
		"implements",
		"import",
		"package",
	]);
	var MODIFIERS = new Set([
		"public",
		"protected",
		"private",
		"static",
		"final",
		"abstract",
		"native",
		"synchronized",
		"strictfp",
	]);

	function declaresStringParameter(tokens, index) {
		let previous = index - 1;
		while (previous >= 0 && tokens[previous].text === ",") {
			previous -= 2;
		}
		if (tokens[previous]?.text !== "<") return false;
		const before = tokens[previous - 1]?.text;
		return (
			TYPE_KEYWORDS.has(tokens[previous - 2]?.text) || MODIFIERS.has(before) || ["{", ";", "}"].includes(before)
		);
	}

	function withoutAnnotations(tokens, start, end) {
		const words = [];
		for (let i = start; i < end; i++) {
			if (tokens[i].text !== "@") {
				words.push(tokens[i].text);
				continue;
			}
			i++;
			while (tokens[i + 1]?.text === ".") i += 2;
			if (tokens[i + 1]?.text === "(") i = tokens[i + 1].pair;
		}
		return words;
	}

	function topLevelTypes(tokens) {
		const types = [];
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (token.pair > i) {
				i = token.pair;
				continue;
			}
			if (
				!TYPE_KEYWORDS.has(token.text) ||
				tokens[i - 1]?.text === "." ||
				!JAVA_IDENTIFIER.test(tokens[i + 1]?.text ?? "")
			)
				continue;
			const nameIndex = i + 1;
			let open = nameIndex + 1;
			while (open < tokens.length && tokens[open].text !== "{") {
				open = Math.max(open, tokens[open].pair) + 1;
			}
			if (open === tokens.length) break;
			types.push({nameIndex, open, close: tokens[open].pair, kind: token.text});
			i = tokens[open].pair;
		}
		return types;
	}

	function isMainParameter(tokens, start, end, stringShadowed) {
		const words = withoutAnnotations(tokens, start, end).filter((word) => word !== "final");
		if (words.slice(0, 4).join("") === "java.lang.") words.splice(0, 4);
		else if (stringShadowed) return false;
		if (words.shift() !== "String") return false;
		if (words[0] === "...") return words.length === 2 && JAVA_IDENTIFIER.test(words[1]);
		if (words.length !== 3) return false;
		return (
			(words[0] === "[" && words[1] === "]" && JAVA_IDENTIFIER.test(words[2])) ||
			(JAVA_IDENTIFIER.test(words[0]) && words[1] === "[" && words[2] === "]")
		);
	}

	function declaresMain(tokens, type, stringShadowed) {
		let memberStart = type.open + 1;
		for (let i = memberStart; i < type.close; i++) {
			const token = tokens[i];
			if (token.text === "void" && tokens[i + 1]?.text === "main" && tokens[i + 2]?.text === "(") {
				const modifiers = withoutAnnotations(tokens, memberStart, i);
				if (
					modifiers.includes("static") &&
					(modifiers.includes("public") || (type.kind === "interface" && !modifiers.includes("private"))) &&
					isMainParameter(tokens, i + 3, tokens[i + 2].pair, stringShadowed)
				)
					return true;
			}
			if (token.pair > i) i = token.pair;
			if (token.text === "{" || token.text === ";") memberStart = i + 1;
		}
		return false;
	}

	function addRenameEdits(tokens, type, packageName, edits) {
		const name = tokens[type.nameIndex].text;
		if (name === "Main") return null;
		const declaredAsValue = tokens.some((token, i) => {
			if (token.text !== name || i === type.nameIndex) return false;
			const before = tokens[i - 1]?.text ?? "";
			const afterType =
				before === "]" || before === ">" || (JAVA_IDENTIFIER.test(before) && !NOT_TYPE_WORDS.has(before));
			return afterType && ["=", ";", ",", ")", ":"].includes(tokens[i + 1]?.text ?? "");
		});
		const members = memberLevel(tokens, type);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const prev = tokens[i - 1]?.text;
			if (token.text === "Main" && (prev !== "." || (insideImport(tokens, i) && tokens[i + 1]?.text === ";")))
				return "nameCollision";
			if (token.text !== name) continue;
			if (tokens[i + 1]?.text === "(" && i !== type.nameIndex && prev !== "new") {
				if (prev === ".") {
					if (tokens[qualifiedStart(tokens, i) - 1]?.text !== "new") continue;
				} else if (!members.has(i)) continue;
				else if (prev === ">") return "ambiguousReference";
				else if (
					prev !== undefined &&
					!MODIFIERS.has(prev) &&
					!["{", "}", ";", ")"].includes(prev) &&
					!afterAnnotationName(tokens, i)
				)
					continue;
			}
			if (prev === ".") {
				const owner = tokens[i - 2]?.text;
				const ownMember = owner === "this" || (owner === name && tokens[i - 3]?.text !== ".");
				if (ownMember) edits.push({start: token.start, end: token.end, text: "Main"});
				else if ((packageName && qualifiedPrefix(tokens, i) === packageName) || declaredAsValue)
					return "ambiguousReference";
				continue;
			}
			edits.push({start: token.start, end: token.end, text: "Main"});
		}
		return null;
	}

	function qualifiedStart(tokens, index) {
		let start = index;
		while (tokens[start - 1]?.text === "." && JAVA_IDENTIFIER.test(tokens[start - 2]?.text ?? "")) start -= 2;
		return start;
	}

	function afterAnnotationName(tokens, index) {
		const start = qualifiedStart(tokens, index - 1);
		return JAVA_IDENTIFIER.test(tokens[index - 1]?.text ?? "") && tokens[start - 1]?.text === "@";
	}

	function memberLevel(tokens, type) {
		const indexes = new Set();
		for (let i = type.open + 1; i < type.close; i++) {
			indexes.add(i);
			if (tokens[i].pair > i) i = tokens[i].pair;
		}
		return indexes;
	}

	function insideImport(tokens, index) {
		for (let i = index - 1; i >= 0 && ![";", "{", "}"].includes(tokens[i].text); i--) {
			if (tokens[i].text === "import") return true;
		}
		return false;
	}

	function qualifiedPrefix(tokens, index) {
		const parts = [];
		for (let i = index - 1; i >= 1 && tokens[i].text === "." && JAVA_IDENTIFIER.test(tokens[i - 1].text); i -= 2)
			parts.unshift(tokens[i - 1].text);
		return parts.join(".");
	}

	function addDebugEdit(tokens, type, flag, edits) {
		for (let i = type.open + 1; i < type.close; i++) {
			if (tokens[i].pair > i) {
				i = tokens[i].pair;
				continue;
			}
			if (
				tokens[i].text !== "boolean" ||
				!JAVA_IDENTIFIER.test(tokens[i + 1]?.text ?? "") ||
				tokens[i + 2]?.text === "("
			)
				continue;
			for (let j = i + 1; j < type.close; j++) {
				const token = tokens[j];
				if (token.text === ";" || token.text === "{") break;
				if (token.pair > j) {
					j = token.pair;
					continue;
				}
				if (
					(j === i + 1 || tokens[j - 1].text === ",") &&
					token.text === flag &&
					tokens[j + 1]?.text === "=" &&
					tokens[j + 2]?.text === "true" &&
					[",", ";"].includes(tokens[j + 3]?.text)
				) {
					edits.push({start: tokens[j + 2].start, end: tokens[j + 2].end, text: "false"});
					return;
				}
			}
		}
	}

	function transformJavaForSubmission(originalCode, options = {}) {
		const source = normalizeNewlines(originalCode);
		const {tokens, complete} = scanJava(source);
		const failure = (issue) => ({sourceCode: originalCode, issue});
		if (!complete) return failure("unsupportedSyntax");
		const edits = [];
		let packageName = "";
		let stringShadowed = false;
		for (let i = 0; i < tokens.length; i++) {
			const word = tokens[i].text;
			if (word === "package") {
				const declaration = qualifiedName(tokens, i + 1);
				if (!declaration || declaration.name.endsWith(".*")) return failure("unsupportedSyntax");
				packageName = declaration.name;
				const end = tokens[declaration.end].end;
				edits.push({
					start: tokens[i].start,
					end:
						source[end] ===
						`
`
							? end + 1
							: end,
					text: "",
				});
			}
			if (word === "import") {
				const declaration = qualifiedName(tokens, i + (tokens[i + 1]?.text === "static" ? 2 : 1));
				if (declaration?.name.endsWith(".String") && declaration.name !== "java.lang.String")
					stringShadowed = true;
			}
			if (word === "String" && (TYPE_KEYWORDS.has(tokens[i - 1]?.text) || declaresStringParameter(tokens, i)))
				stringShadowed = true;
		}
		const candidates = topLevelTypes(tokens).filter((type) => declaresMain(tokens, type, stringShadowed));
		const type =
			candidates.length === 1
				? candidates[0]
				: candidates.find(({nameIndex}) => tokens[nameIndex].text === "Main");
		if (!type) return failure(candidates.length === 0 ? "mainNotFound" : "ambiguousMain");
		const issue = addRenameEdits(tokens, type, packageName, edits);
		if (issue) return failure(issue);
		if (options.debugFlag) addDebugEdit(tokens, type, options.debugFlag, edits);
		const result = [];
		let cursor = 0;
		for (const edit of edits.sort((a, b) => a.start - b.start)) {
			if (edit.start < cursor) return failure("ambiguousReference");
			result.push(source.slice(cursor, edit.start), edit.text);
			cursor = edit.end;
		}
		result.push(source.slice(cursor));
		return {sourceCode: result.join(""), issue: null};
	}

	// ../shared/src/json.ts
	function safeJsonParse(text, fallback) {
		if (typeof text !== "string") return fallback;
		try {
			return JSON.parse(text);
		} catch {
			return fallback;
		}
	}

	function parseStoredObject(raw) {
		if (raw == null) return {};
		if (typeof raw === "string") {
			const parsed = safeJsonParse(raw, null);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				return parsed;
			}
			return {};
		}
		if (typeof raw === "object" && !Array.isArray(raw)) {
			return raw;
		}
		return {};
	}

	// ../shared/src/local-runner.ts
	function includesSubmissionHeader(code, header, offset = 0) {
		if (!header.trim()) return true;
		const end = offset + header.length;
		return (
			code.startsWith(header, offset) &&
			(end === code.length ||
				code[end] ===
					`
` ||
				code.startsWith(
					`\r
`,
					end,
				))
		);
	}

	function isHttpUrl(value) {
		return /^https?:\/\//.test(value);
	}

	function toEasyTestStatus(status, exitCode = 0, stdoutTruncated = false) {
		switch (status) {
			case "success":
				if (exitCode !== 0) return "RE";
				return stdoutTruncated ? "OLE" : "OK";
			case "runtimeError":
				return "RE";
			case "timeLimitExceeded":
				return "TLE";
			case "compileError":
				return "CE";
			case "internalError":
			case "badRequest":
			default:
				return "IE";
		}
	}

	// CpToolkit/src/domain/settings/migrations.ts
	var EASY_TEST_KEYS_OFF = {testAndSubmit: "", testAll: "", toggleEasyTest: ""};

	function migrateToVersion2(settings) {
		const easyTest = settings.features["easy-test"];
		if (!easyTest) return settings;
		const {keyboardShortcuts, ...easyTestOptions} = easyTest.options ?? {};
		const features = {...settings.features, "easy-test": {...easyTest, options: easyTestOptions}};
		if (keyboardShortcuts === false) {
			const shortcuts = settings.features["keyboard-shortcuts"];
			features["keyboard-shortcuts"] = {...shortcuts, options: {...EASY_TEST_KEYS_OFF, ...shortcuts?.options}};
		}
		return {...settings, features};
	}

	// CpToolkit/src/domain/settings/legacy.ts
	function defined(options) {
		return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined && value !== null));
	}

	function parseFlag(value) {
		return value === "true" ? true : value === "false" ? false : undefined;
	}

	var LEGACY_SCRIPTS = {
		AtCoderHighlighter: (stored) => [
			{
				featureId: "statement-highlight",
				options: defined({
					numberColor: stored.numColor,
					variableColor: stored.varColor,
					timeColor: stored.timeLimitColor,
					memoryColor: stored.memoryLimitColor,
				}),
			},
		],
		AtCoderWidenContainer: (stored) => [
			{
				featureId: "wide-layout",
				options: defined({width: stored.containerWidth}),
			},
		],
		PaizaLanguageSelector: (stored) => [
			{
				featureId: "paiza-language",
				options: defined({language: stored.paiza_target_language}),
			},
		],
		AtCoderEasyTestForJava: (stored) => {
			const config = parseStoredObject(stored.config);
			const keys =
				parseFlag(config["ui.useKeyboardShortcut"]) === false
					? [{featureId: "keyboard-shortcuts", options: EASY_TEST_KEYS_OFF}]
					: [];
			return [
				{featureId: "local-runner", options: defined({url: config["codeRunner.localRunnerURL"] || undefined})},
				{
					featureId: "easy-test",
					enable: true,
					options: defined({
						precompile: parseFlag(config["codeRunner.precompile.enable"]),
					}),
				},
				...keys,
			];
		},
	};

	// CpToolkit/src/application/settings/legacy-import.ts
	function importLegacySettings(inbox, settings) {
		for (const [scriptId, migrate] of Object.entries(LEGACY_SCRIPTS)) {
			const stored = inbox.take(scriptId);
			if (stored === undefined) continue;
			for (const {featureId, options, enable} of migrate(parseStoredObject(stored))) {
				if (enable && !settings.hasEnabledChoice(featureId)) settings.setEnabled(featureId, true);
				if (Object.keys(parseStoredObject(settings.storedOptions(featureId))).length > 0) continue;
				for (const [key, value] of Object.entries(options)) settings.setOption(featureId, key, value);
			}
		}
	}

	// CpToolkit/src/domain/settings/settings.ts
	var CURRENT_SETTINGS_VERSION = 2;
	var MIGRATIONS = {1: migrateToVersion2};

	function createDefaultSettings() {
		return {version: CURRENT_SETTINGS_VERSION, features: {}};
	}

	function parseSiteFeatureSettings(raw) {
		const {enabled, options} = parseStoredObject(raw);
		return {
			...(typeof enabled === "boolean" ? {enabled} : {}),
			options: parseStoredObject(options),
		};
	}

	function parseFeatureSettings(raw) {
		const sites = Object.entries(parseStoredObject(parseStoredObject(raw).sites));
		return {
			...parseSiteFeatureSettings(raw),
			...(sites.length > 0
				? {sites: Object.fromEntries(sites.map(([site, value]) => [site, parseSiteFeatureSettings(value)]))}
				: {}),
		};
	}

	function isPlainObject(value) {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	function isSiteFeatureSettings(value) {
		return (
			isPlainObject(value) &&
			(value.enabled === undefined || typeof value.enabled === "boolean") &&
			(value.options === undefined || isPlainObject(value.options))
		);
	}

	function isSettingsBackup(raw) {
		if (!isPlainObject(raw) || !isPlainObject(raw.features)) return false;
		const {version} = raw;
		if (
			typeof version !== "number" ||
			!Number.isSafeInteger(version) ||
			version < 1 ||
			version > CURRENT_SETTINGS_VERSION
		)
			return false;
		return Object.values(raw.features).every(
			(feature) =>
				isSiteFeatureSettings(feature) &&
				(!isPlainObject(feature) ||
					feature.sites === undefined ||
					(isPlainObject(feature.sites) && Object.values(feature.sites).every(isSiteFeatureSettings))),
		);
	}

	function parseSettings(raw) {
		if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return createDefaultSettings();
		const {version, features} = parseStoredObject(raw);
		const entries = Object.entries(parseStoredObject(features));
		let settings = {
			version: typeof version === "number" && Number.isSafeInteger(version) && version >= 0 ? version : 1,
			features: Object.fromEntries(entries.map(([id, value]) => [id, parseFeatureSettings(value)])),
		};
		while (settings.version < CURRENT_SETTINGS_VERSION) {
			const migrated = MIGRATIONS[settings.version]?.(settings) ?? settings;
			settings = {...migrated, version: settings.version + 1};
		}
		return settings;
	}

	function updateFeatureSettings(settings, featureId, patch) {
		const current = settings.features[featureId];
		const next = {...current, ...patch, options: {...current?.options, ...patch.options}};
		return {...settings, features: {...settings.features, [featureId]: next}};
	}

	function updateSiteFeatureSettings(settings, featureId, site, patch) {
		const current = settings.features[featureId];
		const currentSite = current?.sites?.[site];
		const nextSite = {...currentSite, ...patch, options: {...currentSite?.options, ...patch.options}};
		const next = {...current, sites: {...current?.sites, [site]: nextSite}};
		return {...settings, features: {...settings.features, [featureId]: next}};
	}

	function isFeatureEnabled(settings, featureId, site, defaultEnabled) {
		const feature = settings.features[featureId];
		const own = site === null ? undefined : feature?.sites?.[site]?.enabled;
		return own ?? feature?.enabled ?? defaultEnabled;
	}

	function featureOptions(settings, featureId, site) {
		const feature = settings.features[featureId];
		return {...feature?.options, ...(site === null ? undefined : feature?.sites?.[site]?.options)};
	}

	// CpToolkit/src/application/settings/settings-service.ts
	var STORAGE_KEY = "settings";

	class SettingsService {
		site = null;
		settings;
		listeners = new Set();
		store;

		constructor(store) {
			this.store = store;
			const stored = store.get(STORAGE_KEY);
			const raw = typeof stored === "string" ? safeJsonParse(stored, null) : stored;
			const fresh = raw === null || raw === undefined;
			this.settings = fresh ? createDefaultSettings() : parseSettings(raw);
			const storedVersion =
				raw && typeof raw === "object" && !Array.isArray(raw) && "version" in raw ? raw.version : undefined;
			if (storedVersion !== this.settings.version) store.set(STORAGE_KEY, this.settings);
			store.subscribeRemote(STORAGE_KEY, (value) => this.replace(parseSettings(value)));
		}

		forSite(site) {
			if (site === null) return this;
			return {
				site,
				isEnabled: (featureId, defaultEnabled) =>
					isFeatureEnabled(this.settings, featureId, site, defaultEnabled),
				storedOptions: (featureId) => featureOptions(this.settings, featureId, site),
				setEnabled: (featureId, enabled) =>
					this.commit(updateSiteFeatureSettings(this.settings, featureId, site, {enabled})),
				setOption: (featureId, key, value) => {
					this.commit(updateSiteFeatureSettings(this.settings, featureId, site, {options: {[key]: value}}));
				},
				setSharedOption: (featureId, key, value) => this.setOption(featureId, key, value),
				subscribe: (listener) => this.subscribe(listener),
			};
		}

		isEnabled(featureId, defaultEnabled) {
			return this.settings.features[featureId]?.enabled ?? defaultEnabled;
		}

		hasEnabledChoice(featureId) {
			return this.settings.features[featureId]?.enabled !== undefined;
		}

		storedOptions(featureId) {
			return this.settings.features[featureId]?.options;
		}

		setEnabled(featureId, enabled) {
			this.commit(updateFeatureSettings(this.settings, featureId, {enabled}));
		}

		setOption(featureId, key, value) {
			this.commit(updateFeatureSettings(this.settings, featureId, {options: {[key]: value}}));
		}

		setSharedOption(featureId, key, value) {
			this.setOption(featureId, key, value);
		}

		reset() {
			this.commit(createDefaultSettings());
		}

		exportJson() {
			return JSON.stringify(this.settings, null, "\t");
		}

		importJson(text) {
			let parsed;
			try {
				parsed = JSON.parse(text);
			} catch {
				return false;
			}
			if (!isSettingsBackup(parsed)) return false;
			this.commit(parseSettings(parsed));
			return true;
		}

		subscribe(listener) {
			this.listeners.add(listener);
		}

		commit(settings) {
			this.store.set(STORAGE_KEY, settings);
			this.replace(settings);
		}

		replace(settings) {
			this.settings = settings;
			for (const listener of this.listeners) listener();
		}
	}

	// CpToolkit/src/domain/update/version.ts
	function parseVersion(text) {
		return /^\d+(\.\d+)*$/.test(text) ? text.split(".").map(Number) : null;
	}

	function isNewerVersion(latest, current) {
		const left = parseVersion(latest);
		const right = parseVersion(current);
		if (left === null || right === null) return false;
		for (let index = 0; index < Math.max(left.length, right.length); index++) {
			const difference = (left[index] ?? 0) - (right[index] ?? 0);
			if (difference !== 0) return difference > 0;
		}
		return false;
	}

	function readMetadataValue(metadata, key) {
		for (const line of metadata.split(`
`)) {
			const match = /^\s*\/\/\s*@(\S+)\s+(.*?)\s*$/.exec(line);
			if (match && match[1] === key && match[2] !== "") return match[2];
		}
		return null;
	}

	function httpsHostOf(url) {
		return /^https:\/\/([^/:?#@]+)(?=[/:?#]|$)/i.exec(url)?.[1]?.toLowerCase() ?? null;
	}

	// CpToolkit/src/domain/validation/guards.ts
	var isBoolean = (value) => typeof value === "boolean";
	var isString = (value) => typeof value === "string";
	var isNumber = (value) => typeof value === "number";

	function isPlainObject2(value) {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	function isArrayOf(isItem) {
		return (value) => Array.isArray(value) && value.every(isItem);
	}

	function isRecordOf(isItem) {
		return (value) => isPlainObject2(value) && Object.values(value).every(isItem);
	}

	function isOptional(isItem) {
		return (value) => value === undefined || isItem(value);
	}

	function isObjectOf(fields) {
		const entries = Object.entries(fields);
		return (value) => isPlainObject2(value) && entries.every(([key, isField]) => isField(value[key]));
	}

	// CpToolkit/src/application/ports/key-value-store.ts
	function readStored(store, key, isValid, fallback) {
		const value = store.get(key);
		return isValid(value) ? value : fallback;
	}

	// CpToolkit/src/application/update/update-checker.ts
	var STATE_KEY = "update:state";
	var HOUR_MS = 60 * 60 * 1000;
	var REQUEST_TIMEOUT_MS = 1e4;
	var HEADER_RANGE = "bytes=0-8191";
	var isStored = isObjectOf({latest: isString, checkedAt: isNumber, notified: isString});
	var EMPTY = {latest: "", checkedAt: 0, notified: ""};

	class UpdateChecker {
		dependencies;

		constructor(dependencies) {
			this.dependencies = dependencies;
		}

		status() {
			const {host} = this.dependencies;
			const {latest} = this.stored();
			const newer = isNewerVersion(latest, host.version);
			return {
				current: host.version,
				latest: newer ? latest : null,
				downloadUrl: newer ? host.downloadUrl : null,
				supported: this.checkUrl() !== null,
			};
		}

		async check(now, force = false) {
			const url = this.checkUrl();
			const stored = this.stored();
			const due = now - stored.checkedAt >= this.dependencies.intervalHours * HOUR_MS;
			if (url === null || (!force && !due)) return this.status();
			this.save({...stored, checkedAt: now});
			try {
				const response = await this.dependencies.http.send({
					url,
					headers: {Range: HEADER_RANGE},
					timeoutMs: REQUEST_TIMEOUT_MS,
				});
				const version =
					response.status === 200 || response.status === 206
						? readMetadataValue(response.text, "version")
						: null;
				if (version !== null) this.save({...this.stored(), latest: version});
			} catch {
			}
			return this.status();
		}

		claimNotification() {
			const {latest} = this.status();
			const stored = this.stored();
			if (latest === null || stored.notified === latest) return false;
			this.save({...stored, notified: latest});
			return true;
		}

		checkUrl() {
			const {host, allowedHosts} = this.dependencies;
			const url = host.updateUrl ?? host.downloadUrl;
			if (url === null) return null;
			const urlHost = httpsHostOf(url);
			return urlHost !== null && allowedHosts.includes(urlHost) ? url : null;
		}

		stored() {
			return readStored(this.dependencies.state, STATE_KEY, isStored, EMPTY);
		}

		save(value) {
			this.dependencies.state.set(STATE_KEY, value);
		}
	}

	// CpToolkit/data/contest-links.yaml
	var contest_links_default = {
		lists: [
			[
				{
					title: "コンテスト情報",
					description: "過去(50件まで)、未来のコンテスト一覧",
					href: "https://atcoder.jp/contests",
				},
				{
					title: "ABC",
					subtitle: "AtCoder Beginner Contest",
					label: "初心者〜中級者向け",
					labelClass: "label-success",
					description: "初心者でも参加しやすい基礎コンテスト",
					href: "https://atcoder.jp/contests/archive?ratedType=1&category=0&keyword=",
				},
				{
					title: "ARC",
					subtitle: "AtCoder Regular Contest",
					label: "初級者〜上級者向け",
					labelClass: "label-primary",
					description: "より深い考察力を問うコンテスト",
					href: "https://atcoder.jp/contests/archive?ratedType=2&category=0&keyword=",
				},
				{
					title: "AGC",
					subtitle: "AtCoder Grand Contest",
					label: "世界ランカー向け",
					labelClass: "label-danger",
					description: "世界最高水準の問題をそろえたコンテスト",
					href: "https://atcoder.jp/contests/archive?ratedType=3&category=0&keyword=",
				},
			],
			[
				{
					title: "AHC",
					subtitle: "AtCoder Heuristic Contest",
					label: "最適化",
					labelClass: "label-warning",
					description: "最適解を求めることが困難な問題に対して、どれだけ良い解を求められるかを競うコンテスト",
					href: "https://atcoder.jp/contests/archive?ratedType=4&category=0&keyword=",
				},
			],
		],
	};
	// CpToolkit/data/contests.yaml
	var contests_default = {
		regularPrefixes: ["abc", "arc", "agc", "ahc", "past", "joi", "jag"],
		permanentPrefixes: ["practice", "APG4b", "abs", "practice2", "typical90", "math-and-algorithm", "tessoku-book"],
		maxTabsAtOnce: 20,
		taskCacheDays: 10,
		latest: {
			menuTargets: [
				"#navbar-collapse .navbar-nav:not(.navbar-right)",
				"#header .header-sub_page",
				"#header .header-page",
			],
			cacheMinutes: 60,
		},
	};
	// CpToolkit/data/languages.yaml
	var languages_default = {
		comments: {
			c: {
				line: "//",
				open: "/*",
				close: "*/",
			},
			slash: {
				line: "//",
			},
			hash: {
				line: "#",
			},
			dash: {
				line: "--",
			},
			semicolon: {
				line: ";",
			},
			percent: {
				line: "%",
			},
			ruby: {
				line: "#",
				open: "=begin",
				close: "=end",
			},
			haskell: {
				line: "--",
				open: "{-",
				close: "-}",
			},
			lua: {
				line: "--",
				open: "--[[",
				close: "]]",
			},
			nim: {
				line: "#",
				open: "#[",
				close: "]#",
			},
			julia: {
				line: "#",
				open: "#=",
				close: "=#",
			},
			ocaml: {
				open: "(*",
				close: "*)",
			},
			fsharp: {
				line: "//",
				open: "(*",
				close: "*)",
			},
			lisp: {
				line: ";",
				open: "#|",
				close: "|#",
			},
			pascal: {
				line: "//",
				open: "{",
				close: "}",
			},
			prolog: {
				line: "%",
				open: "/*",
				close: "*/",
			},
			fortran: {
				line: "!",
			},
			basic: {
				line: "'",
			},
			php: {
				line: "//",
				open: "/*",
				close: "*/",
				preamble: "^<\\?(php)?[^\\n]*\\n",
				trailer: "\\?>\\s*$",
			},
		},
		families: [
			{
				id: "cpp",
				name: "C++",
				match: ["^C\\+\\+", "G\\+\\+", "Clang\\+\\+", "Visual C\\+\\+", "^cLay"],
				comment: "c",
			},
			{
				id: "csharp",
				name: "C#",
				match: ["^C#"],
				comment: "c",
			},
			{
				id: "c",
				name: "C",
				match: ["^C\\d*(\\s|\\(|$)", "GCC C\\d"],
				comment: "c",
			},
			{
				id: "python2",
				name: "Python2",
				match: ["^Python ?2", "^PyPy ?2"],
				comment: "hash",
			},
			{
				id: "python3",
				name: "Python3",
				match: ["^Python", "^PyPy", "^CPython"],
				comment: "hash",
			},
			{
				id: "java",
				name: "Java",
				match: ["^Java(?!Script)"],
				comment: "c",
			},
			{
				id: "javascript",
				name: "JavaScript",
				match: ["^JavaScript", "^Node\\.js"],
				comment: "c",
			},
			{
				id: "typescript",
				name: "TypeScript",
				match: ["^TypeScript"],
				comment: "c",
			},
			{
				id: "kotlin",
				name: "Kotlin",
				match: ["^Kotlin"],
				comment: "c",
			},
			{
				id: "rust",
				name: "Rust",
				match: ["^Rust"],
				comment: "c",
			},
			{
				id: "go",
				name: "Go",
				match: ["^Go\\b"],
				comment: "c",
			},
			{
				id: "ruby",
				name: "Ruby",
				match: ["^Ruby"],
				comment: "ruby",
			},
			{
				id: "haskell",
				name: "Haskell",
				match: ["^Haskell"],
				comment: "haskell",
			},
			{
				id: "d",
				name: "D",
				match: ["^D(\\s|\\(|$)"],
				comment: "c",
			},
			{
				id: "scala",
				name: "Scala",
				match: ["^Scala"],
				comment: "c",
			},
			{
				id: "swift",
				name: "Swift",
				match: ["^Swift"],
				comment: "c",
			},
			{
				id: "php",
				name: "PHP",
				match: ["^PHP"],
				comment: "php",
			},
			{
				id: "perl",
				name: "Perl",
				match: ["^Perl"],
				comment: "hash",
			},
			{
				id: "bash",
				name: "Bash",
				match: ["^Bash"],
				comment: "hash",
			},
			{
				id: "lua",
				name: "Lua",
				match: ["^Lua"],
				comment: "lua",
			},
			{
				id: "nim",
				name: "Nim",
				match: ["^Nim"],
				comment: "nim",
			},
			{
				id: "ocaml",
				name: "OCaml",
				match: ["^OCaml"],
				comment: "ocaml",
			},
			{
				id: "crystal",
				name: "Crystal",
				match: ["^Crystal"],
				comment: "hash",
			},
			{
				id: "julia",
				name: "Julia",
				match: ["^Julia"],
				comment: "julia",
			},
			{
				id: "elixir",
				name: "Elixir",
				match: ["^Elixir"],
				comment: "hash",
			},
			{
				id: "erlang",
				name: "Erlang",
				match: ["^Erlang"],
				comment: "percent",
			},
			{
				id: "clojure",
				name: "Clojure",
				match: ["^Clojure"],
				comment: "semicolon",
			},
			{
				id: "fsharp",
				name: "F#",
				match: ["^F#"],
				comment: "fsharp",
			},
			{
				id: "scheme",
				name: "Scheme",
				match: ["^Scheme"],
				comment: "lisp",
			},
			{
				id: "lisp",
				name: "Lisp",
				match: ["Lisp"],
				comment: "lisp",
			},
			{
				id: "pascal",
				name: "Pascal",
				match: ["Pascal", "^Delphi"],
				comment: "pascal",
			},
			{
				id: "fortran",
				name: "Fortran",
				match: ["^Fortran", "^FORTRAN"],
				comment: "fortran",
			},
			{
				id: "cobol",
				name: "COBOL",
				match: ["^COBOL"],
			},
			{
				id: "objective-c",
				name: "Objective-C",
				match: ["^Objective-C"],
				comment: "c",
			},
			{
				id: "basic",
				name: "Visual Basic",
				match: ["^Visual Basic", "^Basic"],
				comment: "basic",
			},
			{
				id: "dart",
				name: "Dart",
				match: ["^Dart"],
				comment: "c",
			},
			{
				id: "zig",
				name: "Zig",
				match: ["^Zig"],
				comment: "slash",
			},
			{
				id: "r",
				name: "R",
				match: ["^R(\\s|\\(|$)"],
				comment: "hash",
			},
			{
				id: "awk",
				name: "Awk",
				match: ["^AWK", "^Awk", "Awk"],
				comment: "hash",
			},
			{
				id: "sed",
				name: "Sed",
				match: ["^Sed", "^sed"],
				comment: "hash",
			},
			{
				id: "fish",
				name: "Fish",
				match: ["^Fish", "^fish"],
				comment: "hash",
			},
			{
				id: "powershell",
				name: "PowerShell",
				match: ["^PowerShell"],
				comment: "hash",
			},
			{
				id: "raku",
				name: "Raku",
				match: ["^Raku"],
				comment: "hash",
			},
			{
				id: "sagemath",
				name: "SageMath",
				match: ["^Sage"],
				comment: "hash",
			},
			{
				id: "octave",
				name: "Octave",
				match: ["^Octave"],
				comment: "percent",
			},
			{
				id: "prolog",
				name: "Prolog",
				match: ["Prolog"],
				comment: "prolog",
			},
			{
				id: "ada",
				name: "Ada",
				match: ["^Ada"],
				comment: "dash",
			},
			{
				id: "lean",
				name: "Lean",
				match: ["^Lean"],
				comment: "dash",
			},
			{
				id: "text",
				name: "Text",
				match: ["^Text"],
			},
		],
	};
	// CpToolkit/data/libraries.yaml
	var libraries_default = {
		katexScript: {
			url: "https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.js",
			integrity: "sha384-a1WQdjRj162i159OYq041X6I4K8NenkrI09LlPmiHg0YOb7CR+wJOraXwK9abpnE",
		},
		katexAutoRender: {
			url: "https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/contrib/auto-render.min.js",
			integrity: "sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz",
		},
		katexStylesheet: {
			url: "https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.css",
			integrity: "sha384-WwGtaC6ywCHxA5cstpj/3+xIZvTez8dq2IcBQaXRkenHZ7FVVq1ZROtURwfbtTlG",
		},
		prettify: {
			url: "https://cdn.jsdelivr.net/gh/google/code-prettify@e006587b4a893f0281e9dc9a53001c7ed584d4e7/loader/prettify.js",
			integrity: "sha384-KlbExXRJYYILJYRAJR121vJXgBDx+puqf1yjznMcTt7C5njwQajOLFwk6pMafFnX",
		},
		prettifyStylesheet: {
			url: "https://cdn.jsdelivr.net/gh/google/code-prettify@e006587b4a893f0281e9dc9a53001c7ed584d4e7/loader/prettify.css",
			integrity: "sha384-tGeLopS7aWCwgeqg+ah7c+iI19JU3teQPshyaQVybvOMRravAVLscwoeT4HPsfoW",
		},
	};
	// CpToolkit/data/rating.yaml
	var rating_default = {
		tiers: [
			{
				min: 0,
				color: "#808080",
				alpha: 0.15,
				className: "user-gray",
			},
			{
				min: 400,
				color: "#804000",
				alpha: 0.15,
				className: "user-brown",
			},
			{
				min: 800,
				color: "#008000",
				alpha: 0.15,
				className: "user-green",
			},
			{
				min: 1200,
				color: "#00C0C0",
				alpha: 0.2,
				className: "user-cyan",
			},
			{
				min: 1600,
				color: "#0000FF",
				alpha: 0.1,
				className: "user-blue",
			},
			{
				min: 2000,
				color: "#C0C000",
				alpha: 0.25,
				className: "user-yellow",
			},
			{
				min: 2400,
				color: "#FF8000",
				alpha: 0.2,
				className: "user-orange",
			},
			{
				min: 2800,
				color: "#FF0000",
				alpha: 0.1,
				className: "user-red",
			},
		],
		crownMin: 3200,
	};
	// CpToolkit/data/runners.yaml
	var runners_default = {
		order: ["local", "judge", "browser", "paiza", "wandbox"],
		maxRetry: 3,
		external: ["paiza", "wandbox"],
		connect: ["localhost", "127.0.0.1", "api.paiza.io", "wandbox.org", "cdn.jsdelivr.net"],
		paiza: {
			apiBase: "https://api.paiza.io/runners",
			languages: [
				{
					family: "c",
					language: "c",
					label: "C (C17 / Clang)",
				},
				{
					family: "python3",
					language: "python3",
					label: "Python3",
				},
				{
					family: "bash",
					language: "bash",
					label: "Bash",
				},
				{
					family: "clojure",
					language: "clojure",
					label: "Clojure",
				},
				{
					family: "d",
					language: "d",
					label: "D (LDC)",
				},
				{
					family: "erlang",
					language: "erlang",
					label: "Erlang",
				},
				{
					family: "elixir",
					language: "elixir",
					label: "Elixir",
				},
				{
					family: "fsharp",
					language: "fsharp",
					label: "F# (Interactive)",
				},
				{
					family: "haskell",
					language: "haskell",
					label: "Haskell",
				},
				{
					family: "javascript",
					language: "javascript",
					label: "JavaScript",
				},
				{
					family: "kotlin",
					language: "kotlin",
					label: "Kotlin",
				},
				{
					family: "objective-c",
					language: "objective-c",
					label: "Objective-C",
				},
				{
					family: "perl",
					language: "perl",
					label: "Perl",
				},
				{
					family: "php",
					language: "php",
					label: "PHP",
				},
				{
					family: "ruby",
					language: "ruby",
					label: "Ruby",
				},
				{
					family: "rust",
					language: "rust",
					label: "Rust",
				},
				{
					family: "scala",
					language: "scala",
					label: "Scala",
				},
				{
					family: "scheme",
					language: "scheme",
					label: "Scheme",
				},
				{
					family: "swift",
					language: "swift",
					label: "Swift",
				},
				{
					family: "basic",
					language: "vb",
					label: "Visual Basic",
				},
				{
					family: "cobol",
					language: "cobol",
					label: "COBOL - Free",
				},
			],
		},
		wandbox: {
			listUrl: "https://wandbox.org/api/list.json",
			compileUrl: "https://wandbox.org/api/compile.json",
			cacheHours: 24,
			aclBaseUrl: "https://cdn.jsdelivr.net/gh/atcoder/ac-library@864245a00b00dd008d1abfdc239618fdb7d139da/",
		},
		pyodide: {
			baseUrl: "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/",
			integrity: "sha384-VR47TfKeAmT7vMej7bwOVg0tHTQLLGMSIpsXtFMCZG5OpKZSIXoSLtGY//qHcxc6",
		},
	};
	// CpToolkit/data/statement.yaml
	var statement_default = {
		targetHeadings: ["問題文", "Problem Statement", "制約", "Constraints"],
		sampleHeadings: ["入力例", "出力例", "Sample Input", "Sample Output"],
		timeLimitKeywords: ["Time Limit", "実行時間制限"],
		memoryLimitKeywords: ["Memory Limit", "メモリ制限"],
		commonTimeLimit: 2,
		commonMemoryLimit: 1024,
		skipTags: ["SCRIPT", "STYLE", "CODE", "PRE", "VAR", "KBD", "SAMP"],
	};
	// CpToolkit/data/tessoku.yaml
	var tessoku_default = {
		difficulties: {
			A01: 1,
			A02: 1,
			A03: 1,
			A04: 2,
			A05: 2,
			A06: 2,
			A07: 3,
			A08: 4,
			A09: 4,
			A10: 4,
			A11: 2,
			A12: 3,
			A13: 4,
			A14: 5,
			A15: 3,
			A16: 2,
			A17: 3,
			A18: 3,
			A19: 3,
			A20: 4,
			A21: 4,
			A22: 4,
			A23: 5,
			A24: 5,
			A25: 3,
			A26: 2,
			A27: 2,
			A28: 2,
			A29: 3,
			A30: 4,
			A31: 2,
			A32: 3,
			A33: 5,
			A34: 6,
			A35: 4,
			A36: 2,
			A37: 2,
			A38: 3,
			A39: 3,
			A40: 3,
			A41: 3,
			A42: 4,
			A43: 4,
			A44: 3,
			A45: 5,
			A46: 3,
			A49: 6,
			A50: 5,
			A51: 2,
			A52: 2,
			A53: 2,
			A54: 2,
			A55: 4,
			A56: 5,
			A57: 5,
			A58: 5,
			A59: 5,
			A60: 4,
			A61: 2,
			A62: 3,
			A63: 3,
			A64: 4,
			A65: 4,
			A66: 3,
			A67: 5,
			A68: 6,
			A69: 6,
			A70: 5,
			A71: 3,
			A72: 4,
			A73: 5,
			A74: 5,
			A75: 6,
			A76: 4,
			A77: 4,
			B01: 1,
			B02: 1,
			B03: 2,
			B04: 2,
			B06: 2,
			B07: 3,
			B08: 4,
			B09: 4,
			B11: 3,
			B12: 4,
			B13: 4,
			B14: 5,
			B16: 2,
			B17: 3,
			B18: 4,
			B19: 4,
			B20: 6,
			B21: 6,
			B22: 3,
			B23: 5,
			B24: 5,
			B26: 2,
			B27: 2,
			B28: 2,
			B29: 3,
			B30: 4,
			B31: 3,
			B32: 4,
			B33: 6,
			B34: 5,
			B36: 2,
			B37: 5,
			B38: 4,
			B39: 3,
			B40: 3,
			B41: 3,
			B42: 5,
			B43: 2,
			B44: 3,
			B45: 2,
			B51: 4,
			B52: 3,
			B53: 4,
			B54: 2,
			B55: 4,
			B56: 5,
			B57: 5,
			B58: 6,
			B59: 5,
			B61: 2,
			B62: 4,
			B63: 4,
			B64: 4,
			B65: 4,
			B66: 5,
			B67: 5,
			B68: 7,
			B69: 6,
			C01: 1,
			C02: 10,
			C03: 20,
			C04: 20,
			C05: 30,
			C06: 40,
			C07: 45,
			C08: 50,
			C09: 55,
			C10: 65,
			C11: 70,
			C12: 70,
			C13: 75,
			C14: 75,
			C15: 85,
			C16: 85,
			C17: 90,
			C18: 95,
			C19: 95,
			C20: 99,
		},
	};
	// CpToolkit/data/update.yaml
	var update_default = {
		checkIntervalHours: 24,
		connect: ["raw.githubusercontent.com", "update.greasyfork.org"],
	};

	// CpToolkit/src/catalog/tables.ts
	var languageCatalog = languages_default;
	var updateCatalog = update_default;
	var runnerCatalog = runners_default;
	var statementCatalog = statement_default;
	var contestCatalog = contests_default;
	var ratingScale = rating_default;
	var contestLinks = contest_links_default.lists;
	var tessokuDifficulties = tessoku_default.difficulties;
	var libraries = libraries_default;

	// CpToolkit/src/adapters/console-logger.ts
	class ConsoleLogger {
		prefix;

		constructor(prefix) {
			this.prefix = prefix;
		}

		error(message, cause) {
			console.error(`[${this.prefix}] ${message}`, cause);
		}
	}

	// CpToolkit/src/adapters/page/document-lifecycle.ts
	function waitForEvent(target, eventName) {
		return new Promise((resolve) => target.addEventListener(eventName, () => resolve(), {once: true}));
	}

	class DocumentLifecycle {
		async reach(phase) {
			if (phase === "ready" && document.readyState === "loading") {
				await waitForEvent(document, "DOMContentLoaded");
				await sleep(0);
			}
			if (phase === "load" && document.readyState !== "complete") {
				await waitForEvent(window, "load");
			}
		}
	}

	// CpToolkit/src/adapters/page/local-storage-legacy-inbox.ts
	var KEY_PREFIX = "cp-toolkit:legacy:";

	class LocalStorageLegacyInbox {
		take(scriptId) {
			const key = KEY_PREFIX + scriptId;
			const value = localStorage.getItem(key);
			if (value === null) return;
			localStorage.removeItem(key);
			return safeJsonParse(value, undefined);
		}
	}

	// CpToolkit/src/adapters/userscript/gm-key-value-store.ts
	class GmKeyValueStore {
		get(key) {
			return GM_getValue(key);
		}

		set(key, value) {
			GM_setValue(key, value);
		}

		subscribeRemote(key, listener) {
			const id = GM_addValueChangeListener(key, (_name, _oldValue, newValue, remote) => {
				if (remote) listener(newValue);
			});
			return () => GM_removeValueChangeListener(id);
		}
	}

	// CpToolkit/src/adapters/userscript/gm-script-host.ts
	function metadataUrl(direct, key) {
		return direct || readMetadataValue(GM_info.scriptMetaStr ?? "", key);
	}

	class GmScriptHost {
		name = GM_info.script.name;
		version = GM_info.script.version;
		updateUrl = metadataUrl(GM_info.script.updateURL, "updateURL");
		downloadUrl = metadataUrl(GM_info.script.downloadURL, "downloadURL");

		registerCommand(label, action) {
			GM_registerMenuCommand(label, action);
		}
	}

	// CpToolkit/src/adapters/userscript/gm-services.ts
	class GmClipboard {
		write(text) {
			GM_setClipboard(text);
		}
	}

	var NOTIFICATION_TIMEOUT_MS = 1e4;

	class GmNotifier {
		notify({title, text, url, tag}) {
			GM_notification({
				title,
				text,
				timeout: NOTIFICATION_TIMEOUT_MS,
				...(tag !== undefined && {tag}),
				...(url !== undefined && {onclick: () => GM_openInTab(url, {active: true})}),
			});
		}
	}

	class GmHttpClient {
		send({url, method = "GET", headers, body, timeoutMs}) {
			return new Promise((resolve, reject) => {
				GM_xmlhttpRequest({
					url,
					method,
					anonymous: true,
					...(headers && {headers: {...headers}}),
					...(body !== undefined && {data: body}),
					...(timeoutMs !== undefined && {timeout: timeoutMs}),
					onload: ({status, responseText}) => resolve({status, text: responseText}),
					onerror: () => reject(new Error(`Request failed: ${url}`)),
					ontimeout: () => reject(new Error(`Request timed out: ${url}`)),
				});
			});
		}
	}

	// CpToolkit/src/ui/element.ts
	function h(tagName, props, ...children) {
		const element = document.createElement(tagName);
		Object.assign(element, props);
		element.append(...children);
		return element;
	}

	function injectStyle(css) {
		const style = h("style", {textContent: css});
		(document.head ?? document.documentElement).append(style);
		return style;
	}

	// CpToolkit/src/ui/theme.css
	var theme_default = `:host {
	/* チェックボックスやスクロールバーなど、ブラウザが描く部品も明暗に合わせる */
	color-scheme: light dark;
	--cp-surface: #ffffff;
	--cp-surface-muted: #f6f8fa;
	--cp-text: #1f2328;
	--cp-text-muted: #59636e;
	--cp-border: #d0d7de;
	--cp-accent: #0969da;
	--cp-on-accent: #ffffff;
	--cp-success: #1a7f37;
	--cp-danger: #cf222e;
	--cp-notice-surface: #fff8c5;
	--cp-notice-text: #6c5400;
	font: 14px/1.5 system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Yu Gothic UI", sans-serif;
	color: var(--cp-text);
}

@media (prefers-color-scheme: dark) {
	:host {
		--cp-surface: #1c2128;
		--cp-surface-muted: #262c36;
		--cp-text: #e6edf3;
		--cp-text-muted: #9198a1;
		--cp-border: #3d444d;
		--cp-accent: #4493f8;
		--cp-on-accent: #0d1117;
		--cp-success: #3fb950;
		--cp-danger: #f85149;
		--cp-notice-surface: #3a2f0b;
		--cp-notice-text: #e3b341;
	}
}

*, *::before, *::after {
	box-sizing: border-box;
}

/* display を指定した要素でも hidden を優先する */
[hidden] {
	display: none !important;
}

button {
	padding: 4px 12px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface-muted);
	color: var(--cp-text);
	font: inherit;
	cursor: pointer;
}

button:hover {
	border-color: var(--cp-text-muted);
}

:focus-visible {
	outline: 2px solid var(--cp-accent);
	outline-offset: 1px;
}
`;

	// CpToolkit/src/ui/toast/toast.css
	var toast_default = `/* popover の既定の見た目(中央寄せ、枠、背景)を打ち消し、画面の左上に固定する */
:host {
	position: fixed;
	inset: 120px auto auto 20px;
	z-index: 2147483000;
	width: min(360px, calc(100vw - 40px));
	height: auto;
	margin: 0;
	padding: 0;
	border: 0;
	background: transparent;
	overflow: visible;
}

.toasts {
	display: grid;
	gap: 8px;
}

.toast {
	position: relative;
	padding: 8px 32px 8px 12px;
	border: 1px solid var(--cp-border);
	border-left-width: 4px;
	border-radius: 8px;
	background: var(--cp-surface);
	box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
	color: var(--cp-text);
	cursor: pointer;
	animation: toast-in 150ms ease-out;
}

.toast[data-tone="success"] {
	border-left-color: var(--cp-success);
}

.toast[data-tone="warning"] {
	border-left-color: var(--cp-danger);
}

.toast-title {
	font-weight: 600;
}

.toast-detail {
	color: var(--cp-text-muted);
	font-size: 13px;
	white-space: pre-line;
}

.toast-more {
	margin-top: 4px;
	font-size: 12px;
	cursor: auto;
}

.toast-more summary {
	color: var(--cp-accent);
	cursor: pointer;
}

.toast-more pre {
	max-height: 200px;
	margin: 4px 0 0;
	padding: 6px 8px;
	overflow: auto;
	border-radius: 4px;
	background: var(--cp-surface-muted);
	color: var(--cp-text);
	font-size: 12px;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}

.toast a {
	color: var(--cp-accent);
}

.toast-close {
	position: absolute;
	top: 4px;
	right: 4px;
	width: 24px;
	height: 24px;
	padding: 0;
	border: 0;
	border-radius: 4px;
	background: transparent;
	color: var(--cp-text-muted);
	font-size: 16px;
	line-height: 1;
	cursor: pointer;
}

.toast-close:hover,
.toast-close:focus-visible {
	background: var(--cp-surface-muted);
	color: var(--cp-text);
}

@keyframes toast-in {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
}

@media (prefers-reduced-motion: reduce) {
	.toast {
		animation: none;
	}
}
`;

	// CpToolkit/src/ui/toast/toast.ts
	function showActionWarning(warning) {
		showToast({...warning, tone: "warning", durationMs: 15000});
	}

	var labels = {region: "Notifications", close: () => "Close"};
	var host = null;
	var container = null;
	var blockers = new Set();
	var waiting = [];

	function configureToasts(next) {
		labels = next;
	}

	function ensureContainer() {
		if (container?.isConnected) return container;
		const list = h("div", {className: "toasts"});
		list.setAttribute("role", "region");
		const element = h("div");
		if (typeof element.showPopover === "function") element.setAttribute("popover", "manual");
		element.attachShadow({mode: "open"}).append(
			h("style", {
				textContent: `${theme_default}
${toast_default}`,
			}),
			list,
		);
		document.body.append(element);
		host = element;
		container = list;
		return list;
	}

	function syncVisibility() {
		if (!host || !container || !host.hasAttribute("popover")) return;
		const open = host.matches(":popover-open");
		const needed = container.childElementCount > 0;
		if (needed && !open) host.showPopover();
		if (!needed && open) host.hidePopover();
	}

	function moreElement({label, text}) {
		return h(
			"details",
			{className: "toast-more"},
			h("summary", {textContent: label}),
			h("pre", {textContent: text}),
		);
	}

	function present({title, detail, tone, href, durationMs, more}) {
		const heading = href ? h("a", {href, target: "_blank", rel: "noopener", textContent: title}) : title;
		const closeButton = h("button", {type: "button", className: "toast-close", textContent: "×"});
		closeButton.setAttribute("aria-label", labels.close());
		const toast = h(
			"div",
			{className: "toast"},
			h("div", {className: "toast-title"}, heading),
			h("div", {className: "toast-detail", textContent: detail}),
			...(more ? [moreElement(more)] : []),
			closeButton,
		);
		toast.dataset.tone = tone;
		toast.setAttribute("role", tone === "warning" ? "alert" : "status");
		let remainingMs = durationMs;
		let startedAt = 0;
		let timer;
		let holds = 0;
		const dismiss = () => {
			clearTimeout(timer);
			toast.remove();
			syncVisibility();
		};
		const start = () => {
			startedAt = Date.now();
			timer = setTimeout(dismiss, remainingMs);
		};
		const hold = () => {
			if (holds++ > 0) return;
			clearTimeout(timer);
			remainingMs = Math.max(0, remainingMs - (Date.now() - startedAt));
		};
		const release = () => {
			if (holds > 0 && --holds === 0) start();
		};
		toast.addEventListener("pointerenter", hold);
		toast.addEventListener("pointerleave", release);
		toast.addEventListener("focusin", hold);
		toast.addEventListener("focusout", release);
		toast.addEventListener("click", (event) => {
			if (!(event.target instanceof Element && event.target.closest(".toast-more"))) dismiss();
		});
		const list = ensureContainer();
		list.setAttribute("aria-label", labels.region);
		list.append(toast);
		syncVisibility();
		start();
	}

	function isHeld() {
		for (const isBlocking of blockers) {
			if (isBlocking()) return true;
			blockers.delete(isBlocking);
		}
		return false;
	}

	function flush() {
		if (isHeld()) return;
		for (const toast of waiting.splice(0)) present(toast);
	}

	function holdToastsWhile(isBlocking) {
		blockers.add(isBlocking);
		return () => {
			blockers.delete(isBlocking);
			flush();
		};
	}

	function showToast(toast) {
		waiting.push(toast);
		flush();
	}

	// CpToolkit/src/ui/dialog/modal.css
	var modal_default = `dialog {
	width: min(640px, calc(100vw - 32px));
	max-height: calc(100vh - 64px);
	padding: 0;
	border: 1px solid var(--cp-border);
	border-radius: 12px;
	background: var(--cp-surface);
	color: var(--cp-text);
	overflow: hidden;
}

dialog[open] {
	display: flex;
	flex-direction: column;
}

/* ダイアログの端までスクロールしても、背景のページを動かさない */
dialog:modal {
	overscroll-behavior: contain;
}

dialog::backdrop {
	background: rgb(0 0 0 / 45%);
	overflow: hidden;
	overscroll-behavior: contain;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 12px 16px;
	border-bottom: 1px solid var(--cp-border);
}

.modal-header h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.modal-body {
	flex: 1;
	min-height: 0;
	padding: 16px;
	overflow-y: auto;
}

.modal-footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid var(--cp-border);
}
`;

	// CpToolkit/src/ui/dialog/modal.ts
	var TITLE_ID = "modal-title";

	function createModal({title, closeLabel, css}) {
		const body = h("div", {className: "modal-body"});
		const footer = h("footer", {className: "modal-footer"});
		const closeButton = closeLabel === undefined ? null : h("button", {type: "button", textContent: closeLabel});
		const dialog = h(
			"dialog",
			{},
			h(
				"header",
				{className: "modal-header"},
				h("h2", {id: TITLE_ID, textContent: title}),
				...(closeButton ? [closeButton] : []),
			),
			body,
			footer,
		);
		dialog.setAttribute("aria-labelledby", TITLE_ID);
		closeButton?.addEventListener("click", () => dialog.close());
		if ("closedBy" in HTMLDialogElement.prototype) {
			dialog.setAttribute("closedby", "any");
		} else {
			let pressedOutside = false;
			dialog.addEventListener("pointerdown", (event) => {
				pressedOutside = event.target === dialog;
			});
			dialog.addEventListener("click", (event) => {
				if (pressedOutside && event.target === dialog) dialog.close();
				pressedOutside = false;
			});
		}
		let resumeToasts = null;
		dialog.addEventListener("close", () => {
			resumeToasts?.();
			resumeToasts = null;
		});
		const host = h("div");
		host.attachShadow({mode: "open"}).append(
			h("style", {
				textContent: `${theme_default}
${modal_default}
${css}`,
			}),
			dialog,
		);
		return {
			body,
			footer,
			open() {
				if (!host.isConnected) document.body.append(host);
				if (dialog.open) return;
				resumeToasts = holdToastsWhile(() => dialog.open && dialog.isConnected);
				dialog.showModal();
			},
			close: () => dialog.close(),
		};
	}

	// CpToolkit/src/ui/form/form.css
	var form_default = `.switch {
	position: relative;
	display: inline-flex;
	flex: none;
	width: 36px;
	height: 20px;
}

.switch input {
	position: absolute;
	inset: 0;
	margin: 0;
	opacity: 0;
	cursor: pointer;
}

.switch span {
	width: 100%;
	border-radius: 10px;
	background: var(--cp-border);
	transition: background 120ms;
}

.switch span::after {
	content: "";
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--cp-surface);
	transition: transform 120ms;
}

.switch input:checked + span {
	background: var(--cp-accent);
}

.switch input:checked + span::after {
	transform: translateX(16px);
}

.switch input:focus-visible + span {
	outline: 2px solid var(--cp-accent);
	outline-offset: 2px;
}

.field {
	display: grid;
	gap: 4px;
}

.field-label {
	color: var(--cp-text-muted);
	font-size: 13px;
}

.field input:not([type="checkbox"], [type="color"]),
.field select {
	width: 100%;
	padding: 4px 8px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: inherit;
}

.field input[aria-invalid="true"] {
	border-color: var(--cp-danger);
}

.field-error {
	color: var(--cp-danger);
	font-size: 12px;
}
`;

	// CpToolkit/src/domain/settings/shortcut.ts
	var MODIFIERS2 = ["Ctrl", "Shift", "Alt", "Cmd"];
	var MODIFIER_ALIASES = {
		ctrl: "Ctrl",
		shift: "Shift",
		alt: "Alt",
		option: "Alt",
		cmd: "Cmd",
		command: "Cmd",
	};
	var NAMED_KEYS = {
		enter: "Enter",
		escape: "Escape",
		esc: "Escape",
		space: " ",
		tab: "Tab",
		backspace: "Backspace",
		delete: "Delete",
		arrowleft: "ArrowLeft",
		left: "ArrowLeft",
		arrowright: "ArrowRight",
		right: "ArrowRight",
		arrowup: "ArrowUp",
		up: "ArrowUp",
		arrowdown: "ArrowDown",
		down: "ArrowDown",
	};
	var LEGACY_NO_SHORTCUT = "none";
	var SETTING_KEY_NAMES = {
		" ": "Space",
		ArrowLeft: "Left",
		ArrowRight: "Right",
		ArrowUp: "Up",
		ArrowDown: "Down",
	};

	function normalizeShortcut(text) {
		const parts = text.split("+");
		const last = parts.pop() ?? "";
		const key = last === " " ? "Space" : last.trim();
		const modifiers = readModifiers(parts.map((part) => part.trim()));
		if (!modifiers) return null;
		const named = NAMED_KEYS[key.toLowerCase()];
		const normalizedKey =
			named ??
			(/^\S$/u.test(key) ? key.toUpperCase() : /^F([1-9]|1[0-2])$/i.test(key) ? key.toUpperCase() : null);
		if (!normalizedKey) return null;
		return [...modifiers, normalizedKey].join("+");
	}

	function readModifiers(parts) {
		const modifiers = new Set();
		for (const part of parts) {
			const modifier = MODIFIER_ALIASES[part.toLowerCase()];
			if (!modifier) return null;
			modifiers.add(modifier);
		}
		return MODIFIERS2.filter((name) => modifiers.has(name));
	}

	function normalizeModifiers(text) {
		const modifiers = readModifiers(text.split("+").map((part) => part.trim()));
		return modifiers && modifiers.length > 0 ? modifiers.join("+") : null;
	}

	function readShortcutSetting(text) {
		if (isUnused(text)) return "";
		const combo = normalizeShortcut(text);
		if (combo === null) return;
		const parts = combo.split("+");
		const key = parts.pop() ?? "";
		return [...parts, SETTING_KEY_NAMES[key] ?? key].join("+");
	}

	function readModifierSetting(text) {
		return isUnused(text) ? "" : (normalizeModifiers(text) ?? undefined);
	}

	function isUnused(text) {
		return text === "" || text.toLowerCase() === LEGACY_NO_SHORTCUT;
	}

	function matchesShortcut(value, pressed, suffixes) {
		if (!suffixes) return value !== "" && normalizeShortcut(value) === pressed;
		const modifiers = normalizeModifiers(value);
		return (
			modifiers !== null &&
			(pressed === modifiers || suffixes.some((suffix) => pressed === `${modifiers}+${suffix}`))
		);
	}

	// CpToolkit/src/domain/settings/option.ts
	var SHORT_HEX_COLOR_PATTERN = /^#[0-9a-f]{3}$/;
	var HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;

	function normalizeColor(value) {
		if (typeof value !== "string") return;
		const color = value.trim().toLowerCase();
		if (HEX_COLOR_PATTERN.test(color)) return color;
		if (!SHORT_HEX_COLOR_PATTERN.test(color)) return;
		return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
	}

	var option = {
		boolean(defaultValue, label) {
			return {
				kind: "boolean",
				defaultValue,
				label,
				normalize: (value) => (typeof value === "boolean" ? value : undefined),
			};
		},
		text(defaultValue, label, {validate, invalidMessage} = {}) {
			return {
				kind: "text",
				defaultValue,
				label,
				...(invalidMessage !== undefined && {invalidMessage}),
				normalize(value) {
					if (typeof value !== "string") return;
					const text = value.trim();
					return !validate || validate(text) ? text : undefined;
				},
			};
		},
		shortcut(defaultValue, label, {group, suffixes}) {
			const read = suffixes ? readModifierSetting : readShortcutSetting;
			return {
				kind: "shortcut",
				defaultValue,
				label,
				group,
				...(suffixes !== undefined && {suffixes}),
				normalize: (value) => (typeof value === "string" ? read(value.trim()) : undefined),
			};
		},
		color(defaultValue, label) {
			return {kind: "color", defaultValue, label, normalize: normalizeColor};
		},
		number(defaultValue, label, {min = -Infinity, max = Infinity, integer = false} = {}) {
			return {
				kind: "number",
				defaultValue,
				label,
				min,
				max,
				integer,
				normalize: (value) =>
					typeof value === "number" && value >= min && value <= max && (!integer || Number.isInteger(value))
						? value
						: undefined,
			};
		},
		select(defaultValue, label, choices) {
			return {
				kind: "select",
				defaultValue,
				label,
				choices,
				normalize: (value) => choices.find((choice) => choice.value === value)?.value,
			};
		},
	};

	function onSites(definition, sites) {
		return {...definition, sites};
	}

	function sharedAcrossSites(definition) {
		return {...definition, shared: true};
	}

	function isOptionOnSite(definition, site) {
		return site === null || definition.sites === undefined || definition.sites.includes(site);
	}

	function normalizeOptions(schema, stored) {
		const source = parseStoredObject(stored);
		const entries = Object.entries(schema).map(([key, definition]) => {
			return [key, definition.normalize(source[key]) ?? definition.defaultValue];
		});
		return Object.fromEntries(entries);
	}

	// CpToolkit/src/ui/form/controls.ts
	function createSwitch(accessibleName, onChange) {
		const input = h("input", {type: "checkbox", ariaLabel: accessibleName});
		input.setAttribute("role", "switch");
		input.addEventListener("change", () => onChange(input.checked));
		return {
			element: h("label", {className: "switch"}, input, h("span")),
			setChecked(checked) {
				input.checked = checked;
			},
		};
	}

	function createField(label, control, errorMessage) {
		const error = h("span", {className: "field-error", textContent: errorMessage, hidden: true});
		return {
			element: h(
				"label",
				{className: "field"},
				h("span", {
					className: "field-label",
					textContent: label,
				}),
				control,
				error,
			),
			setInvalid(invalid) {
				control.setAttribute("aria-invalid", String(invalid));
				error.hidden = !invalid;
			},
		};
	}

	// CpToolkit/src/features/settings-panel/option-field.ts
	function createControl(definition, value, translate, {validate, commit}) {
		switch (definition.kind) {
			case "boolean": {
				const input = h("input", {type: "checkbox", checked: value === true});
				input.addEventListener("change", () => commit(input.checked));
				return input;
			}
			case "number": {
				const input = h("input", {type: "number", value: String(value)});
				if (definition.min !== undefined) input.min = String(definition.min);
				if (definition.max !== undefined) input.max = String(definition.max);
				if (definition.integer) input.step = "1";
				input.addEventListener("input", () => validate(input.valueAsNumber));
				input.addEventListener("change", () => commit(input.valueAsNumber));
				return input;
			}
			case "select": {
				const select = h(
					"select",
					{},
					...definition.choices.map((choice) => {
						return h("option", {value: choice.value, textContent: translate(choice.label)});
					}),
				);
				select.value = String(value);
				select.addEventListener("change", () => commit(select.value));
				return select;
			}
			case "color":
			case "text": {
				const input = h("input", {type: definition.kind, value: String(value)});
				input.addEventListener("input", () => validate(input.value));
				input.addEventListener("change", () => commit(input.value));
				return input;
			}
		}
	}

	function createOptionField({definition, value, translate, onChange}) {
		const check = (rawValue) => {
			const normalized = definition.normalize(rawValue);
			field.setInvalid(normalized === undefined);
			return normalized;
		};
		const control = createControl(definition, value, translate, {
			validate: check,
			commit(rawValue) {
				const normalized = check(rawValue);
				if (normalized !== undefined) onChange(normalized);
			},
		});
		const invalidMessage = translate(definition.invalidMessage ?? "settings.invalidValue");
		const field = createField(translate(definition.label), control, invalidMessage);
		return field.element;
	}

	// CpToolkit/src/features/settings-panel/shortcut-list.ts
	function createKeyCaps(value) {
		const keys = value === "" ? [] : value.split("+");
		return h("span", {className: "shortcut-keys"}, ...keys.map((key) => h("kbd", {textContent: key})));
	}

	function createRow({definition, value, onChange}, {translate, dialog}, refreshFilter) {
		let current = value;
		let keys = createKeyCaps(current);
		const label = translate(definition.label);
		const element = h("button", {type: "button", className: "shortcut-row"}, h("span", {textContent: label}), keys);
		const edit = (event) => {
			event.preventDefault();
			dialog.edit({
				action: label,
				value: current,
				modifiersOnly: definition.suffixes !== undefined,
				onCommit(next) {
					current = next;
					const updated = createKeyCaps(current);
					keys.replaceWith(updated);
					keys = updated;
					onChange(next);
					refreshFilter();
				},
			});
		};
		element.addEventListener("dblclick", edit);
		element.addEventListener("contextmenu", edit);
		element.addEventListener("keydown", (event) => {
			if (event.key === "Enter" && !event.repeat) edit(event);
		});
		return {element, matches: (combo) => matchesShortcut(current, combo, definition.suffixes)};
	}

	function createShortcutList(params) {
		const {entries, site, translate, dialog} = params;
		let pressed = null;
		const refreshFilter = () => {
			if (pressed) filter(pressed);
		};
		const groups = [...Map.groupBy(entries, ({definition}) => definition.group)].map(([group, members]) => {
			const rows = members.map((entry) => createRow(entry, params, refreshFilter));
			return {element: createGroup(group, rows, site, translate), rows};
		});
		const searching = h("span", {className: "shortcut-searching", hidden: true});
		const noMatch = h("p", {className: "empty", textContent: translate("settings.shortcutNoMatch"), hidden: true});
		const filter = (next) => {
			pressed = next;
			let found = false;
			for (const {element, rows} of groups) {
				let visible = false;
				for (const row of rows) {
					row.element.hidden = next !== null && !row.matches(next.combo);
					visible ||= !row.element.hidden;
				}
				element.hidden = !visible;
				if (next !== null && visible) element.open = true;
				found ||= visible;
			}
			noMatch.hidden = found;
			searching.hidden = next === null;
			searching.replaceChildren(
				h("span", {textContent: translate("settings.shortcutSearching")}),
				createKeyCaps(next?.value ?? ""),
				h("button", {
					type: "button",
					textContent: translate("settings.shortcutRemove"),
					onclick: () => filter(null),
				}),
			);
		};
		const search = h("button", {
			type: "button",
			className: "shortcut-search",
			textContent: translate("settings.shortcutSearch"),
			onclick: () => dialog.search({pressed, onSearch: filter}),
		});
		return h(
			"div",
			{className: "shortcut-list"},
			h("div", {className: "shortcut-toolbar"}, searching, search),
			...groups.map(({element}) => element),
			noMatch,
		);
	}

	function createGroup(group, rows, site, translate) {
		const showNote = group.note && (site === null || group.note.sites.includes(site));
		return h(
			"details",
			{className: "shortcut-group", open: true},
			h("summary", {textContent: translate(group.title)}),
			...(showNote && group.note
				? [h("p", {className: "shortcut-note", textContent: translate(group.note.message)})]
				: []),
			...rows.map((row) => row.element),
		);
	}

	// CpToolkit/src/features/settings-panel/feature-row.ts
	var STATUS_MESSAGES = {
		disabled: "status.disabled",
		outOfScope: "status.outOfScope",
		pending: "status.pending",
		running: "status.running",
		reloadRequired: "status.reloadRequired",
		failed: "status.failed",
	};

	function createOptionsSection({feature, settings, translate, shortcutDialog}) {
		const definitions = Object.entries(feature.options).filter(([, definition]) =>
			isOptionOnSite(definition, settings.site),
		);
		if (definitions.length === 0) return null;
		const values = normalizeOptions(feature.options, settings.storedOptions(feature.id));
		const fields = [];
		const shortcuts = [];
		for (const [key, definition] of definitions) {
			const onChange = (value) => {
				if (definition.shared) settings.setSharedOption(feature.id, key, value);
				else settings.setOption(feature.id, key, value);
			};
			if (definition.kind === "shortcut") shortcuts.push({definition, value: String(values[key]), onChange});
			else fields.push(createOptionField({definition, value: values[key], translate, onChange}));
		}
		if (shortcuts.length > 0) {
			fields.push(
				createShortcutList({entries: shortcuts, site: settings.site, translate, dialog: shortcutDialog}),
			);
		}
		return h(
			"details",
			{className: "feature-options"},
			h("summary", {textContent: translate("settings.options")}),
			h("div", {className: "feature-fields"}, ...fields),
		);
	}

	function createFeatureRow(params) {
		const {feature, settings, runtime, translate, showStatus} = params;
		const title = translate(feature.title);
		const toggle = createSwitch(title, (enabled) => settings.setEnabled(feature.id, enabled));
		const statusLabel = h("span", {className: "status", hidden: !showStatus});
		const summary = h(
			"div",
			{className: "feature-summary"},
			h(
				"div",
				{className: "feature-text"},
				h("div", {className: "feature-title", textContent: title}),
				h("div", {
					className: "feature-description",
					textContent: translate(feature.description),
				}),
			),
			statusLabel,
			toggle.element,
		);
		const optionsSection = createOptionsSection(params);
		const element = h("article", {className: "feature"}, summary);
		if (optionsSection) element.append(optionsSection);
		const status = () => runtime.statusOf(feature.id);
		return {
			element,
			status,
			refresh() {
				const current = status();
				statusLabel.textContent = translate(STATUS_MESSAGES[current.state]);
				statusLabel.dataset.state = current.state;
				statusLabel.title = current.state === "failed" ? current.message : "";
				toggle.setChecked(settings.isEnabled(feature.id, feature.defaultEnabled));
			},
		};
	}

	// CpToolkit/src/features/settings-panel/settings-panel.css
	var settings_panel_default = `.notice {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
	padding: 8px 12px;
	border-radius: 8px;
	background: var(--cp-notice-surface);
	color: var(--cp-notice-text);
}

.site-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-bottom: 16px;
	border-bottom: 1px solid var(--cp-border);
}

.site-tabs button {
	margin-bottom: -1px;
	padding: 6px 10px;
	font-size: 13px;
	border: 1px solid transparent;
	border-radius: 6px 6px 0 0;
	background: none;
	color: var(--cp-text-muted);
	font-family: inherit;
	cursor: pointer;
}

.site-tabs button[aria-selected="true"] {
	border-color: var(--cp-border);
	border-bottom-color: var(--cp-surface);
	background: var(--cp-surface);
	color: var(--cp-text);
	font-weight: 600;
}

.error {
	margin: 0 0 16px;
	color: var(--cp-danger);
}

.empty {
	margin: 0;
	color: var(--cp-text-muted);
}

.category + .category {
	margin-top: 20px;
}

.category h3 {
	margin: 0 0 8px;
	color: var(--cp-text-muted);
	font-size: 13px;
	font-weight: 600;
}

.feature {
	border: 1px solid var(--cp-border);
	border-radius: 8px;
}

.feature + .feature {
	margin-top: 8px;
}

.feature-summary {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 12px;
}

.feature-text {
	flex: 1;
	min-width: 0;
}

.feature-title {
	font-weight: 600;
}

.feature-description {
	color: var(--cp-text-muted);
	font-size: 13px;
}

.status {
	flex: none;
	color: var(--cp-text-muted);
	font-size: 12px;
}

.status[data-state="running"] {
	color: var(--cp-success);
}

.status[data-state="failed"] {
	color: var(--cp-danger);
}

.status[data-state="reloadRequired"] {
	color: var(--cp-notice-text);
}

.feature-options {
	padding: 0 12px 10px;
}

.feature-options summary {
	color: var(--cp-text-muted);
	font-size: 13px;
	cursor: pointer;
}

.feature-fields {
	display: grid;
	gap: 12px;
	margin-top: 8px;
}

.backup-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.footer-version {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-left: auto;
	color: var(--cp-text-muted);
	font-size: 12px;
}

.footer-version a {
	font-weight: bold;
}
`;

	// CpToolkit/src/ui/shortcuts.ts
	var EDITOR_ELEMENTS = ".ace_editor, .monaco-editor, #editor, #editor-div";
	var POSITIONAL_SYMBOLS = {Comma: ",", Period: "."};
	var SHIFTED_SYMBOLS = {"{": "[", "}": "]"};
	var IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent);
	var shortcuts = new Map();
	var listening = false;
	var suspensions = 0;

	function keyOf(event) {
		if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
		if (/^Digit[0-9]$/.test(event.code)) return event.code.slice(5);
		const symbol = POSITIONAL_SYMBOLS[event.code] ?? (event.shiftKey ? SHIFTED_SYMBOLS[event.key] : undefined);
		if (symbol) return symbol;
		return event.key.length === 1 ? event.key.toUpperCase() : event.key;
	}

	function modifiersOf(event) {
		return [
			event.ctrlKey && "Ctrl",
			event.shiftKey && "Shift",
			event.altKey && "Alt",
			event.metaKey && "Cmd",
		].filter((name) => name !== false);
	}

	function comboOf(event) {
		return [...modifiersOf(event), keyOf(event)].join("+");
	}

	function isAltGraphInput(event) {
		return !IS_MAC && event.ctrlKey && event.altKey && event.getModifierState("AltGraph");
	}

	function isTextField(target) {
		if (!(target instanceof HTMLElement)) return false;
		const isEditable = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
		return isEditable && target.closest(EDITOR_ELEMENTS) === null;
	}

	function onKeyDown(event) {
		if (suspensions > 0 || isAltGraphInput(event)) return;
		const shortcut = shortcuts.get(comboOf(event));
		if (!shortcut || (!shortcut.inTextFields && isTextField(event.target))) return;
		if (!shortcut.handler()) return;
		event.preventDefault();
		event.stopPropagation();
	}

	function registerShortcut(combo, handler, {inTextFields = false} = {}) {
		if (!listening) {
			document.addEventListener("keydown", onKeyDown, true);
			listening = true;
		}
		const shortcut = {handler, inTextFields};
		shortcuts.set(combo, shortcut);
		return () => {
			if (shortcuts.get(combo) === shortcut) shortcuts.delete(combo);
		};
	}

	function suspendShortcuts() {
		suspensions++;
		let resumed = false;
		return () => {
			if (resumed) return;
			resumed = true;
			suspensions = Math.max(0, suspensions - 1);
		};
	}

	// CpToolkit/src/features/settings-panel/shortcut-dialog.css
	var shortcut_dialog_default = `dialog {
	width: min(360px, calc(100vw - 32px));
}

.shortcut-action {
	margin: 0 0 8px;
}

.shortcut-input {
	width: 100%;
	padding: 6px 8px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: inherit;
}

.shortcut-prompt {
	margin: 8px 0 0;
	color: var(--cp-text-muted);
	font-size: 12px;
}

.modal-footer {
	justify-content: flex-end;
}
`;

	// CpToolkit/src/features/settings-panel/shortcut-dialog.ts
	function readModifiers2(event) {
		const value = readModifierSetting(modifiersOf(event).join("+"));
		return value ? {value, combo: value} : null;
	}

	function readCombo(event) {
		const combo = comboOf(event);
		const value = readShortcutSetting(combo);
		return value ? {value, combo} : null;
	}

	function createShortcutDialog(translate) {
		let modal = null;
		let session = null;
		let resume = null;
		const action = h("p", {className: "shortcut-action"});
		const field = h("input", {type: "text", readOnly: true, className: "shortcut-input"});
		const prompt = h("p", {className: "shortcut-prompt"});
		field.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				modal?.close();
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			if (!session || event.repeat || event.isComposing || isAltGraphInput(event)) return;
			const pressed = session.read(event);
			if (!pressed) return;
			field.value = pressed.value;
			session.onPress(pressed);
		});
		const create = () => {
			const created = createModal({title: translate("settings.shortcutTitle"), css: shortcut_dialog_default});
			field.setAttribute("aria-label", translate("settings.shortcutTitle"));
			created.body.append(action, field, prompt);
			const dialog = created.body.closest("dialog");
			dialog?.addEventListener("close", () => {
				if (dialog.open) return;
				resume?.();
				resume = null;
			});
			return created;
		};
		const open = (next) => {
			modal ??= create();
			session = next;
			action.textContent = next.action;
			action.hidden = next.action === "";
			prompt.textContent = translate(next.prompt);
			field.value = next.value;
			modal.footer.replaceChildren(
				...next.buttons.map(([label, run]) =>
					h("button", {
						type: "button",
						textContent: translate(label),
						onclick: () => {
							run();
							modal?.close();
						},
					}),
				),
			);
			resume?.();
			resume = suspendShortcuts();
			modal.open();
			field.focus();
		};
		return {
			edit({action: name, value, modifiersOnly, onCommit}) {
				open({
					prompt: modifiersOnly ? "settings.shortcutModifierPrompt" : "settings.shortcutPrompt",
					action: name,
					value,
					read: modifiersOnly ? readModifiers2 : readCombo,
					onPress: () => {
					},
					buttons: [
						["settings.shortcutRemove", () => onCommit("")],
						["settings.shortcutCancel", () => {
						}],
						["settings.shortcutOk", () => onCommit(field.value)],
					],
				});
			},
			search({pressed, onSearch}) {
				open({
					prompt: "settings.shortcutSearchPrompt",
					action: translate("settings.shortcutSearch"),
					value: pressed?.value ?? "",
					read: (event) => readCombo(event) ?? readModifiers2(event),
					onPress: onSearch,
					buttons: [
						["settings.shortcutRemove", () => onSearch(null)],
						["settings.shortcutOk", () => {
						}],
					],
				});
			},
		};
	}

	// CpToolkit/src/features/settings-panel/shortcut-list.css
	var shortcut_list_default = `.shortcut-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
}

.shortcut-searching {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	margin-right: auto;
	color: var(--cp-text-muted);
	font-size: 13px;
}

.shortcut-group {
	margin-top: 8px;
}

.shortcut-group summary {
	font-weight: 600;
	font-size: 13px;
	cursor: pointer;
}

.shortcut-note {
	margin: 4px 0;
	color: var(--cp-text-muted);
	font-size: 12px;
}

.shortcut-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 4px 12px;
	width: 100%;
	min-height: 30px;
	padding: 3px 8px 3px 16px;
	border: 1px solid transparent;
	background: none;
	text-align: left;
	/* ダブルクリックで文字が選択されないようにする */
	user-select: none;
	cursor: default;
}

.shortcut-row:hover {
	border-color: transparent;
	background: var(--cp-surface-muted);
}

.shortcut-keys {
	display: inline-flex;
	gap: 3px;
	margin-left: auto;
}

.shortcut-keys kbd {
	min-width: 24px;
	padding: 0 6px;
	border: 1px solid var(--cp-border);
	border-radius: 5px;
	color: var(--cp-text-muted);
	font: 12px/20px system-ui, -apple-system, "Segoe UI", sans-serif;
	text-align: center;
}
`;

	// CpToolkit/src/features/settings-panel/version-status.ts
	function createVersionStatus(updates, translate) {
		const element = h("span", {className: "footer-version"});
		const render = (status, checked) => {
			const parts = [`v${status.current}`];
			if (status.latest !== null && status.downloadUrl !== null) {
				parts.push(
					h("a", {
						href: status.downloadUrl,
						target: "_blank",
						rel: "noopener",
						textContent: `${translate("update.install")} v${status.latest}`,
					}),
				);
			} else if (checked) {
				parts.push(h("span", {textContent: translate("update.upToDate")}));
			}
			if (status.supported) {
				const button = h("button", {type: "button", textContent: translate("update.check")});
				button.addEventListener("click", () => {
					button.disabled = true;
					updates.check(Date.now(), true).then((latest) => render(latest, true));
				});
				parts.push(button);
			}
			element.replaceChildren(...parts);
		};
		render(updates.status(), false);
		return element;
	}

	// CpToolkit/src/features/settings-panel/index.ts
	function downloadText(fileName, text) {
		const url = URL.createObjectURL(new Blob([text], {type: "application/json"}));
		h("a", {href: url, download: fileName}).click();
		URL.revokeObjectURL(url);
	}

	function createSettingsPanel(dependencies) {
		let view = null;
		return {
			open() {
				view ??= createPanelView(dependencies);
				view.open();
			},
		};
	}

	function createPanelView(dependencies) {
		const {features, settings, runtime, translate, updates, sites = [], currentSite = null} = dependencies;
		const siteOf = (route) => route.slice(0, route.indexOf(":"));
		const tabSites = sites.filter(({id}) =>
			features.some(({routes}) => routes.some((route) => siteOf(route) === id)),
		);
		let selectedSite = tabSites.find(({id}) => id === currentSite)?.id ?? tabSites[0]?.id ?? null;
		const tabs = h("div", {className: "site-tabs", role: "tablist", hidden: tabSites.length === 0});
		tabs.setAttribute("aria-label", translate("settings.sites"));
		const notice = h(
			"div",
			{className: "notice", hidden: true},
			h("span", {textContent: translate("settings.reloadNotice")}),
			h("button", {type: "button", textContent: translate("settings.reload"), onclick: () => location.reload()}),
		);
		const importError = h("p", {className: "error", textContent: translate("settings.importFailed"), hidden: true});
		const content = h("div");
		let rows = [];
		let modal = null;
		const shortcutDialog = createShortcutDialog(translate);
		const refresh = () => {
			for (const row of rows) row.refresh();
			notice.hidden =
				selectedSite !== currentSite || !rows.some((row) => row.status().state === "reloadRequired");
		};
		const renderTabs = () => {
			tabs.replaceChildren(
				...tabSites.map(({id, name}) => {
					const tab = h("button", {
						type: "button",
						role: "tab",
						textContent: name,
						onclick: () => {
							selectedSite = id;
							render();
						},
					});
					tab.setAttribute("aria-selected", String(id === selectedSite));
					if (id === currentSite) tab.setAttribute("aria-current", "page");
					return tab;
				}),
			);
		};
		const render = () => {
			rows = [];
			renderTabs();
			const store = settings.forSite(selectedSite);
			const visible =
				selectedSite === null
					? features
					: features.filter(({routes}) => routes.some((route) => siteOf(route) === selectedSite));
			const showStatus = selectedSite === currentSite;
			const sections = [...Map.groupBy(visible, ({category}) => category)].map(([category, members]) => {
				const memberRows = members.map((feature) =>
					createFeatureRow({feature, settings: store, runtime, translate, showStatus, shortcutDialog}),
				);
				rows.push(...memberRows);
				return h(
					"section",
					{className: "category"},
					h("h3", {textContent: translate(category)}),
					...memberRows.map((row) => row.element),
				);
			});
			content.replaceChildren(...sections);
			if (visible.length === 0) {
				content.append(h("p", {className: "empty", textContent: translate("settings.empty")}));
			}
			content.append(backup);
			refresh();
		};
		const importFile = async (file) => {
			const imported = settings.importJson(await file.text());
			importError.hidden = imported;
			if (imported) render();
		};
		const createBackupSection = () => {
			const fileInput = h("input", {type: "file", accept: "application/json,.json", hidden: true});
			fileInput.addEventListener("change", () => {
				const file = fileInput.files?.[0];
				fileInput.value = "";
				if (file) importFile(file);
			});
			const button = (label, onclick) => {
				return h("button", {type: "button", textContent: translate(label), onclick});
			};
			return h(
				"section",
				{className: "category backup"},
				h("h3", {textContent: translate("settings.backup")}),
				importError,
				h(
					"div",
					{className: "backup-actions"},
					button("settings.export", () => downloadText("cp-toolkit-settings.json", settings.exportJson())),
					button("settings.import", () => fileInput.click()),
					button("settings.reset", () => {
						if (!window.confirm(translate("settings.resetConfirm"))) return;
						settings.reset();
						importError.hidden = true;
						render();
					}),
					fileInput,
				),
			);
		};
		const backup = createBackupSection();
		const createFooter = () => [
			h("button", {type: "button", textContent: translate("settings.reload"), onclick: () => location.reload()}),
			createVersionStatus(updates, translate),
		];
		const createPanelModal = () => {
			const created = createModal({
				title: translate("settings.title"),
				closeLabel: translate("settings.close"),
				css: `${form_default}
${settings_panel_default}
${shortcut_list_default}`,
			});
			created.body.append(tabs, notice, content);
			created.footer.append(...createFooter());
			settings.subscribe(refresh);
			runtime.subscribe(refresh);
			return created;
		};
		return {
			open() {
				modal ??= createPanelModal();
				render();
				modal.open();
			},
		};
	}

	// CpToolkit/src/features/settings-panel/navigation-entry.css
	var navigation_entry_default = `/* サイトのメニューに紛れないよう、黒と白のどちらのヘッダーでも目立つ色にする。
   ヘッダーの高さを変えないよう、文字の行の高さ(20px)に収める */
.cp-settings-entry {
	display: inline-block;
	padding: 0 8px;
	border-radius: 999px;
	background: #0969da;
	color: #fff !important;
	font-size: 12px;
	font-weight: 600;
	line-height: 20px;
	vertical-align: top;
	white-space: nowrap;
}

.cp-settings-entry::before {
	content: "\\2699\\FE0E";
	margin-right: 4px;
}

a:hover > .cp-settings-entry,
a:focus > .cp-settings-entry {
	background: #0550ae;
}

/* コンテストのページのヘッダーは、項目を足すと幅の狭い画面で2段になり、固定されたヘッダーが本文のメニューを隠す。
   1段に保つため、足りない幅はコンテスト名を省略して詰める */
@media (min-width: 768px) {
	#navbar-collapse.collapse {
		display: flex !important;
	}

	#navbar-collapse > .navbar-nav {
		display: flex;
		float: none;
		flex-shrink: 0;
	}

	#navbar-collapse > .navbar-nav:not(.navbar-right) {
		flex-shrink: 1;
		min-width: 0;
	}

	#navbar-collapse > .navbar-nav > li {
		float: none;
		flex-shrink: 0;
	}

	#navbar-collapse > .navbar-nav > li > a {
		white-space: nowrap;
	}

	#navbar-collapse > .navbar-nav > li:has(> .contest-title) {
		flex-shrink: 1;
		min-width: 0;
	}

	#navbar-collapse .contest-title {
		max-width: 100%;
	}

	#navbar-collapse > .navbar-right {
		margin-left: auto;
	}
}

/* トップページなどのヘッダーは、幅 1023px 以下で文字と項目の幅が画面幅に比例し、タブレットほどの幅では大きくなりすぎる。
   文字に上限を設け、項目の幅は中身に合わせて1行に収める */
@media (min-width: 640px) and (max-width: 1023px) {
	#header .header-sub_page li a {
		width: auto;
		padding-right: 10px;
		padding-left: 10px;
		font-size: min(3vw, 16px);
		white-space: nowrap;
	}
}
`;

	// CpToolkit/src/features/settings-panel/navigation-entry.ts
	function addNavigationEntry(listSelectors, label, onOpen) {
		const list = listSelectors
			.map((selector) => document.querySelector(selector))
			.find((element) => element !== null);
		if (!list) return;
		injectStyle(navigation_entry_default);
		const link = h("a", {href: "#"}, h("span", {className: "cp-settings-entry", textContent: label}));
		link.addEventListener("click", (event) => {
			event.preventDefault();
			onOpen();
		});
		list.append(h("li", {}, link));
	}

	// CpToolkit/src/features/settings-panel/update-notice.ts
	var NOTICE_DURATION_MS = 20000;

	function notifyUpdate(scriptName, status, translate) {
		if (status.latest === null || status.downloadUrl === null) return;
		showToast({
			title: `${scriptName} v${status.latest}`,
			detail: translate("update.notice"),
			tone: "success",
			href: status.downloadUrl,
			durationMs: NOTICE_DURATION_MS,
		});
	}

	// CpToolkit/data/judges/aoj.yaml
	var aoj_default = {
		id: "aoj",
		name: "AIZU ONLINE JUDGE",
		matches: ["https://onlinejudge.u-aizu.ac.jp/*"],
		routes: {
			page: "^/",
		},
		navigationLists: [],
		submission: {
			editor: "ace",
			editorElements: ["#editor", "#editor-div"],
			submitButtons: [".editorFooter .submitBtn", "#submit_button"],
		},
	};
	// CpToolkit/data/judges/atcoder.yaml
	var atcoder_default = {
		id: "atcoder",
		name: "AtCoder",
		matches: ["https://atcoder.jp/*"],
		routes: {
			page: "^/[^?]",
			home: "^/(\\?|$)",
			contest: "^/contests/(?!archive)[^/?#]+",
			tasks: "^/contests/[^/]+/tasks/?(\\?|$)",
			task: "^/contests/[^/]+/tasks/[^/?#]+",
			tasksPrint: "^/contests/[^/]+/tasks_print",
			tessokuTasks: "^/contests/tessoku-book/tasks/?(\\?|$)",
			submit: "^/contests/[^/]+/submit",
			customTest: "^/contests/[^/]+/custom_test",
			submissions: "^/contests/[^/]+/submissions(/me)?/?(\\?|$)",
			submissionDetail: "^/contests/[^/]+/submissions/\\d+",
			editorial: "^/contests/[^/]+/(tasks/[^/?#]+/)?editorial/?(\\?|$)",
			virtual: "^/contests/[^/]+/virtual/?(\\?|$)",
			user: "^/users/[^/?#]+/?(\\?(?!.*graph=(rank|dist)).*)?$",
		},
		navigationLists: ["#navbar-collapse .navbar-right", "#header .header-page"],
		submission: {
			editor: "ace",
			editorElements: ["#editor"],
			textarea: "#plain-textarea",
			commentMount: ".editor-buttons",
			taskSelect: "#select-task",
			submitButtons: ["#submit"],
		},
		samples: [
			{
				selector: "p+pre.literal-block",
				container: ".section",
			},
			{
				selector: "pre.source-code-for-copy",
				container: ".part",
			},
			{
				selector: ".div-btn-copy+pre",
				container: ".part",
			},
			{
				selector: ":scope>.part pre.linenums",
				container: ".part",
			},
			{
				selector: ":scope>.part section>pre",
				container: ".part",
			},
			{
				selector: ":scope>.part:not(.io-style)>h3+section>pre",
				container: ".part",
			},
			{
				selector: "pre",
				container: ".part",
			},
			{
				selector: ".div-btn-copy+pre",
				container: ".part",
				insideIoStyle: true,
			},
		],
	};
	// CpToolkit/data/judges/codeforces.yaml
	var codeforces_default = {
		id: "codeforces",
		name: "Codeforces",
		matches: [
			"https://codeforces.com/*",
			"https://*.contest.codeforces.com/*",
			"https://m1.codeforces.com/*",
			"https://m2.codeforces.com/*",
			"https://m3.codeforces.com/*",
		],
		routes: {
			page: "^/",
			problem:
				"^/(contest/[^/]+/problem|gym/[^/]+/problem|problemset/problem|group/[^/]+/contest/[^/]+/problem)/",
		},
		navigationLists: [],
		submission: {
			editor: "ace",
			editorElements: ["#editor"],
			textarea:
				'.submit-form textarea[name="source"], .submitForm textarea[name="source"], form._SubmitPage_submitForm textarea[name="source"], textarea[data-cp-easy-test-source]',
			taskSelect: '[name="submittedProblemIndex"], [name="problemIndex"]',
			submitButtons: [
				".submit-form .submit",
				".submitForm .submit",
				'input[type="submit"].submit',
				'form._SubmitPage_submitForm button[type="submit"]',
			],
		},
	};
	// CpToolkit/data/judges/library-checker.yaml
	var library_checker_default = {
		id: "libraryChecker",
		name: "Library Checker",
		matches: ["https://judge.yosupo.jp/problem/*"],
		routes: {
			page: "^/problem/",
		},
		navigationLists: [],
		submission: {
			editor: "monaco",
			editorElements: [],
			submitButtons: [],
			labeledSubmit: {
				selector: 'form button[type="submit"], form input[type="submit"]',
				labels: ["提出", "submit"],
			},
		},
	};
	// CpToolkit/data/judges/paiza.yaml
	var paiza_default = {
		id: "paiza",
		name: "paiza",
		matches: ["https://paiza.jp/*"],
		routes: {
			page: "^/",
		},
		navigationLists: [],
		submission: {
			editor: "ace",
			editorElements: ["#editor-div", "#editor"],
			submitButtons: ["#handin", '[onclick*="hand_in_code"]'],
			labeledSubmit: {
				selector: 'a, button, input[type="button"], input[type="submit"]',
				labels: ["コードを提出する", "提出する", "提出"],
			},
		},
		languageSelect: {
			selects: ["#language_id", 'select[name="language[id]"]'],
			hiddenFields: ["programming_language_id", "submit_programming_language_id"],
		},
	};
	// CpToolkit/data/judges/yukicoder.yaml
	var yukicoder_default = {
		id: "yukicoder",
		name: "yukicoder",
		matches: ["https://yukicoder.me/problems/*"],
		routes: {
			problem: "^/problems/",
		},
		navigationLists: [],
		submission: {
			editor: "codemirror",
			editorElements: [".cm-source-editor .cm-content"],
			textarea: "#source",
			commentMount: "#toggle_source_editor",
			submitButtons: ['#submit_form input[type="submit"]'],
		},
	};

	// CpToolkit/src/catalog/judges.ts
	var judges = [
		atcoder_default,
		codeforces_default,
		yukicoder_default,
		aoj_default,
		library_checker_default,
		paiza_default,
	];
	var atcoderSampleSelectors = atcoder_default.samples;
	var paizaLanguageSelect = paiza_default.languageSelect;

	// CpToolkit/data/i18n/en.yaml
	var en_default = {
		"settings.open": "Open settings",
		"settings.title": "CP Toolkit settings",
		"settings.close": "Close",
		"settings.empty": "No features are available.",
		"settings.options": "Options",
		"settings.sites": "Sites",
		"settings.invalidValue": "This value is not valid.",
		"settings.reloadNotice": "Reload the page to apply your changes.",
		"settings.reload": "Reload page",
		"settings.backup": "Backup",
		"settings.export": "Back up settings to a file",
		"settings.import": "Restore settings from a file",
		"settings.importFailed": "The settings file could not be read.",
		"settings.reset": "Reset to defaults",
		"settings.resetConfirm": "The settings of all sites will be reset to their defaults. Continue?",
		"settings.shortcutTitle": "Keyboard shortcut",
		"settings.shortcutPrompt": "Press the keys to assign. Esc closes this.",
		"settings.shortcutModifierPrompt": "Press modifier keys. Esc closes this.",
		"settings.shortcutSearch": "Find by shortcut",
		"settings.shortcutSearchPrompt": "Press the keys to look for. Esc closes this.",
		"settings.shortcutSearching": "Searching",
		"settings.shortcutNoMatch": "No action uses this shortcut.",
		"settings.shortcutRemove": "Remove",
		"settings.shortcutCancel": "Cancel",
		"settings.shortcutOk": "OK",
		"update.check": "Check for updates",
		"update.install": "Update to",
		"update.upToDate": "Up to date",
		"update.notice": "A new version is available. Click the link above to open the update page.",
		"status.disabled": "Off",
		"status.outOfScope": "Not on this page",
		"status.pending": "Waiting",
		"status.running": "Running",
		"status.reloadRequired": "Reload to apply",
		"status.failed": "Failed to start",
		"category.layout": "Layout",
		"category.statement": "Statement",
		"category.submission": "Submissions",
		"category.contest": "Contest",
		"category.rating": "Results",
		"category.execution": "Testing and submission tools",
		"wideLayout.title": "Wider page",
		"wideLayout.description": "Set the width of the main content column.",
		"wideLayout.width": "Content width (e.g. 75% or 1200px, blank for the default)",
		"hoverMenu.title": "Open dropdowns on hover",
		"hoverMenu.description":
			"Hover over your username, the language selector or the Results tab to open its dropdown.",
		"statementHighlight.title": "Statement highlighting",
		"statementHighlight.description":
			"Highlight numbers, variables, and the time and memory limits in a task statement.",
		"statementHighlight.numberColor": "Number color",
		"statementHighlight.variableColor": "Variable color",
		"statementHighlight.timeColor": "Time limit color",
		"statementHighlight.memoryColor": "Memory limit color",
		"statementHighlight.alwaysEmphasizeLimits": "Also emphasize limits of 2 sec and 1024 MiB",
		"statementCopy.title": "Copy statement",
		"statementCopy.description": "Copy sections such as the statement and constraints individually or together.",
		"statementCopy.format": "Copy format",
		"statementCopy.formatMarkdown": "Markdown",
		"statementCopy.formatPlain": "Plain text",
		"statementCopy.copy": "Copy",
		"statementCopy.copyAll": "Copy All",
		"statementCopy.copied": "Copied!",
		"statementCopy.defaultTitle": "Task",
		"efficientLayout.title": "Side-by-side samples",
		"efficientLayout.description":
			"Show samples side by side, with each pair's width fitted to its contents automatically.",
		"efficientLayout.widthMode": "How to size each sample pair",
		"efficientLayout.widthModeAuto": "Automatic (fit to content)",
		"efficientLayout.widthModeFixed": "Fixed",
		"efficientLayout.sampleWidth": "Fixed width (% of the window width)",
		"efficientLayout.maxSampleWidth": "Maximum width in auto mode (% of the window width)",
		"efficientLayout.samples": "Samples",
		"efficientLayout.ioFormat": "Input and output",
		"submissionQuery.title": "Keep submission filters",
		"submissionQuery.description": "Keep search filters when switching between All Submissions and My Submissions.",
		"submissionShortcuts.title": "AC submission buttons",
		"submissionShortcuts.description":
			"Open accepted submissions for a task sorted by runtime, code size, submission time or memory.",
		"submissionShortcuts.language": "Language (empty for all)",
		"submissionShortcuts.label": "AC submissions",
		"submissionShortcuts.time": "Runtime",
		"submissionShortcuts.length": "Code size",
		"submissionShortcuts.created": "Submission time",
		"submissionShortcuts.memory": "Memory",
		"submissionShortcuts.byTime": "Show the button sorted by runtime",
		"submissionShortcuts.byLength": "Show the button sorted by code size",
		"submissionShortcuts.byCreated": "Show the button sorted by submission time",
		"submissionShortcuts.byMemory": "Show the button sorted by memory",
		"resultNotifier.title": "Submission notifications",
		"resultNotifier.description": "Receive a notification when judging finishes.",
		"resultNotifier.desktop": "Use desktop notifications while you are away from AtCoder",
		"clarNotifier.title": "Clarification notifications",
		"clarNotifier.description": "Receive a notification when the organizers post a clarification during a contest.",
		"clarNotifier.desktop": "Use desktop notifications while you are away from AtCoder",
		"clarNotifier.arrived": "{count} new clarification(s)",
		"averageResult.title": "Test case averages",
		"averageResult.description":
			"Show average runtime and memory usage across test cases on the submission details page.",
		"averageResult.average": "Average",
		"submissionTimer.title": "Delayed submission",
		"submissionTimer.description": "Submit the code in the editor after a delay you specify.",
		"submissionTimer.minutes": "Minutes until submission",
		"submissionTimer.set": "Schedule",
		"submissionTimer.cancel": "Cancel",
		"submissionTimer.canceled": "The timer was canceled.",
		"submissionTimer.scheduled": "Your code will be submitted around {time}.",
		"languageButtons.title": "Language switch buttons",
		"languageButtons.description":
			"Pin frequently used submission languages and switch between them with one click.",
		"languageButtons.configure": "Choose languages for the buttons",
		"languageButtons.hint": "Buttons for the checked languages appear below the language selector.",
		"sourceComments.title": "Code header and footer",
		"sourceComments.description": "Add a saved header and footer when you paste a complete solution.",
		"sourceComments.style": "Default comment style",
		"sourceComments.styleLine": "Single-line comments",
		"sourceComments.styleBlock": "Multi-line comment",
		"sourceComments.runnerHeader": "Where to put the Local Runner header",
		"sourceComments.runnerHeaderAbove": "Above the task header",
		"sourceComments.runnerHeaderBelow": "Below the task header",
		"sourceComments.runnerHeaderNone": "Do not add it",
		"sourceComments.runnerHeaderName": "Local Runner header name (empty for the language default)",
		"sourceComments.runnerHeaderNameInvalid":
			"Use a name that starts with a letter or digit and contains only letters, digits, _ and - (the same rule as setheader in Local Runner).",
		"sourceComments.runnerHeaderFailed": "Could not read the Local Runner header",
		"sourceComments.panel": "Header and footer",
		"sourceComments.header": "Header (top of the code)",
		"sourceComments.footer": "Footer (bottom of the code)",
		"sourceComments.placeholder": "e.g. reference URLs",
		"sourceComments.taskOnly": "This task only",
		"sourceComments.commentOut": "Comment out when inserting",
		"sourceComments.multiline": "Use a multi-line comment",
		"sourceComments.restoreHistory": "Restore from history",
		"sourceComments.restorePreset": "Load a saved entry",
		"sourceComments.savePreset": "Save with a name",
		"sourceComments.removePreset": "Delete",
		"sourceComments.presetName": "Name to save as",
		"sourceComments.apply": "Apply to the code",
		"sourceComments.variables": "{url} becomes the task URL, {task} the task ID and {contest} the contest ID.",
		"sourceComments.notInserted": "Comments were not inserted",
		"sourceComments.unsupported": "Nothing was inserted because the comment syntax of this language is unknown.",
		"taskStatus.title": "Task status colors",
		"taskStatus.description":
			"Color tasks in the task list and the Tasks dropdown according to your submission results.",
		"taskStatus.acceptedColor": "Color for tasks with an AC or a positive score",
		"taskStatus.rejectedColor": "Color for attempted tasks with no AC or positive score",
		"taskDropdown.title": "Tasks dropdown",
		"taskDropdown.description": "Open a task from the Tasks tab, or open several tasks at once.",
		"taskDropdown.newTab": "Open in a new tab",
		"taskDropdown.taskTable": "Task table",
		"taskDropdown.openAtOnce": "Open multiple tasks",
		"taskDropdown.loadFailed": "(Failed to load)",
		"taskDropdown.all": "All",
		"taskDropdown.range": "Range",
		"taskDropdown.reverse": "Open in reverse order",
		"taskDropdown.cancel": "Cancel",
		"taskDropdown.tabCount": "{count} tabs will open. If pop-ups are blocked, please allow them.",
		"taskDropdown.tabLimit": "Note: up to {count} tabs can be opened at once.",
		"editorialList.title": "All editorials",
		"editorialList.description": "Read editorials directly below their links on the editorials page.",
		"variableHover.title": "Highlight hovered variables and numbers",
		"variableHover.description":
			"Hover over a variable or number in a formula to highlight matching occurrences in the same task.",
		"variableHover.variables": "Highlight variables",
		"variableHover.numbers": "Highlight numbers",
		"latestContests.title": "Next contests",
		"latestContests.description": "View upcoming contests from the header.",
		"latestContests.menu": "Next contests",
		"latestContests.loading": "Loading...",
		"latestContests.failed": "Could not load the list",
		"contestCalendar.title": "Add to calendar",
		"contestCalendar.description": "Open a Google Calendar event form with the contest name and times filled in.",
		"contestCalendar.add": "Add to calendar",
		"virtualTimer.title": "Virtual contest timer",
		"virtualTimer.description":
			"See the time until your virtual contest starts and the time remaining once it begins.",
		"virtualTimer.untilStart": "Starts in",
		"virtualTimer.remaining": "Time left",
		"topLinks.title": "Contest links on the top page",
		"topLinks.description": "Open the ABC, ARC, AGC and AHC contest archives from the home page.",
		"tessokuDifficulty.title": "Tessoku difficulty",
		"tessokuDifficulty.description": "Show the difficulty ratings from the book on the Tessoku task list.",
		"tessokuDifficulty.sortByDifficulty": "Sort by difficulty",
		"tessokuDifficulty.sortById": "Sort by task number",
		"ratingGraph.title": "Performance on the rating graph",
		"ratingGraph.description": "Overlay performance from rated contests on a user's rating graph.",
		"ratingGraph.recentByDefault": "Show only recent results at first",
		"ratingGraph.recentRange": "Recent range (e.g. 20 for the last 20 contests, 50% for the latest half)",
		"ratingGraph.recentRangeInvalid": "Enter a whole number of 1 or more, or a percentage from 1% to 100%.",
		"ratingGraph.togglePerformance": "Toggle performance",
		"ratingGraph.showAll": "all",
		"ratingGraph.showRecent": "recent",
		"localRunner.title": "Local Runner integration",
		"localRunner.description": "Set the server for Easy Test+, submission transforms and headers.",
		"localRunner.url": "Server URL",
		"submissionHelper.submitChanged": "Submission canceled because preparation could not finish.",
		"submissionHelper.fallbackFailed": "The browser could not safely transform this source.",
		"keyboardShortcuts.title": "Keyboard shortcuts",
		"keyboardShortcuts.description":
			"Submit, copy samples, switch tasks, open pages and more with keys you choose. Double-click or right-click an action in the options to change its key.",
		"keyboardShortcuts.openSettings": "Open the CP Toolkit settings",
		"keyboardShortcuts.submit": "Submit",
		"keyboardShortcuts.fold": "Fold the block at the cursor",
		"keyboardShortcuts.unfold": "Unfold the fold on the cursor line",
		"keyboardShortcuts.testAndSubmit": "Test with Easy Test+, then submit",
		"keyboardShortcuts.testAll": "Test all samples with Easy Test+",
		"keyboardShortcuts.toggleEasyTest": "Open or close the Easy Test+ panel",
		"keyboardShortcuts.copyInput": "Copy a sample input (these modifiers and a number from 1 to 9)",
		"keyboardShortcuts.copyOutput": "Copy a sample output (these modifiers and a number from 1 to 9)",
		"keyboardShortcuts.copyStatement": "Copy the whole statement",
		"keyboardShortcuts.previousTask": "Open the previous task",
		"keyboardShortcuts.nextTask": "Open the next task",
		"keyboardShortcuts.openTask":
			"Open a task (these modifiers and A to Z: A, B, C… from the top of the task list)",
		"keyboardShortcuts.openTasks": "Open the task list",
		"keyboardShortcuts.openMySubmissions": "Open my submissions",
		"keyboardShortcuts.openStandings": "Open the standings",
		"keyboardShortcuts.openEditorial": "Open the editorial",
		"keyboardShortcuts.openCustomTest": "Open the custom test",
		"keyboardShortcuts.acByTime": "Open AC submissions by execution time",
		"keyboardShortcuts.acByLength": "Open AC submissions by code length",
		"keyboardShortcuts.acByCreated": "Open AC submissions by submission time",
		"keyboardShortcuts.acByMemory": "Open AC submissions by memory",
		"keyboardShortcuts.share": "Open a post to X for the current page",
		"keyboardShortcuts.groupGlobal": "Global",
		"keyboardShortcuts.groupEditor": "Submission & Editor",
		"keyboardShortcuts.groupProblem": "Problem Page",
		"keyboardShortcuts.groupProblemNote": "Easy Test+ and sample copying also work on the AtCoder submit page.",
		"keyboardShortcuts.groupContest": "Contest Pages",
		"keyboardShortcuts.sampleInput": "Sample input {number}",
		"keyboardShortcuts.sampleOutput": "Sample output {number}",
		"keyboardShortcuts.sampleCopied": "Copied {sample}",
		"keyboardShortcuts.sampleMissing": "{sample} was not found",
		"submissionHelper.title": "Submission helper",
		"submissionHelper.description": "Prepare pasted code for submission.",
		"submissionHelper.localRunnerRequired": "Expanding {package}.* needs Local Runner",
		"submissionHelper.localRunnerGuide":
			"Could not connect to Local Runner, so only the basic transform was applied. Submitting this code will cause a compile error. See the link for setup instructions.",
		"submissionHelper.unresolvedImports": "Some imports could not be found",
		"submissionHelper.transformFailed": "Local Runner could not transform the code",
		"submissionHelper.diagnostics": "Full diagnostics",
		"submissionHelper.debugFlag":
			"Debug variable to set to false without Local Runner (e.g. DEBUG; leave empty to keep it)",
		"submissionHelper.debugFlagInvalid":
			"Use a name that starts with a letter or _ and contains only letters, digits and _ (for example, DEBUG).",
		"submissionHelper.libraryPackage":
			"Package of the Java library that Local Runner expands (e.g. lib; empty to skip the check)",
		"submissionHelper.libraryPackageInvalid": "Write a Java package name (for example, lib or lib.io).",
		"submissionHelper.foldOnPaste": "Fold the outermost blocks and comments after pasting",
		"easyTest.submitChanged":
			"Submission canceled because the source, task, language or runner changed. The test results are still available.",
		"easyTest.title": "Easy Test+",
		"easyTest.description": "Run sample tests from the task page and submit when they all pass.",
		"easyTest.precompile": "Precompile edited code with Local Runner",
		"easyTest.savedCodeLimit": "Number of tasks to keep code for",
		"easyTest.allowableError": "Allowed error",
		"easyTest.invalidAllowableError":
			"Write the allowed error as a positive number such as 1e-6 or 0.001. Forms such as 10^-6 are not accepted.",
		"easyTest.run": "Run",
		"easyTest.testAndSubmit": "Test & Submit",
		"easyTest.cancelSubmit": "Cancel Submission",
		"easyTest.testAll": "Test All Samples",
		"easyTest.restore": "Restore Last Code",
		"easyTest.autoRunner": "Automatic",
		"easyTest.environment": "Environment",
		"easyTest.noEnvironment": "No environment available",
		"easyTest.standardInput": "Standard input",
		"easyTest.standardOutput": "Standard output",
		"easyTest.standardError": "Standard error",
		"easyTest.expectedOutput": "Expected output",
		"easyTest.exitCode": "Exit code",
		"easyTest.execTime": "Time",
		"easyTest.memory": "Memory",
		"easyTest.allocated": "allocated in total",
		"easyTest.noSavedCode": "No saved code was found for this task.",
		"easyTest.noSamples": "No samples were found. Nothing was tested or submitted.",
		"easyTest.noSource": "The source code is empty, so nothing was run.",
		"easyTest.internalError":
			"The code could not be run because the environment failed. Choose another environment and try again.",
		"easyTest.lineOffset":
			"Local Runner transformed the code, so line numbers in errors are shifted by {lines} from the editor.",
		"easyTest.restoreConfirm": "Your current code will be replaced. Continue?",
		"paizaLanguage.title": "paiza language selection",
		"paizaLanguage.description": "Automatically select your preferred language on paiza submission pages.",
		"paizaLanguage.language": "Language (e.g. c++, java, python3)",
	};

	// CpToolkit/data/i18n/ja.yaml
	var ja_default = {
		"settings.open": "設定を開く",
		"settings.title": "CP Toolkit の設定",
		"settings.close": "閉じる",
		"settings.empty": "設定できる機能はありません。",
		"settings.options": "詳細設定",
		"settings.sites": "サイト",
		"settings.invalidValue": "値の形式が正しくありません。",
		"settings.reloadNotice": "変更を反映するには再読み込みしてください。",
		"settings.reload": "ページを再読み込み",
		"settings.backup": "設定のバックアップ",
		"settings.export": "設定をファイルにバックアップ",
		"settings.import": "ファイルから設定を復元",
		"settings.importFailed": "設定ファイルを読み込めませんでした。",
		"settings.reset": "初期設定に戻す",
		"settings.resetConfirm": "すべてのサイトの設定を初期設定に戻します。よろしいですか?",
		"settings.shortcutTitle": "ショートカットキー",
		"settings.shortcutPrompt": "割り当てるキーを押してください。Esc で閉じます。",
		"settings.shortcutModifierPrompt": "修飾キーを押してください。Esc で閉じます。",
		"settings.shortcutSearch": "キーで検索",
		"settings.shortcutSearchPrompt": "探すキーを押してください。Esc で閉じます。",
		"settings.shortcutSearching": "検索中",
		"settings.shortcutNoMatch": "このキーを割り当てた操作はありません。",
		"settings.shortcutRemove": "削除",
		"settings.shortcutCancel": "キャンセル",
		"settings.shortcutOk": "OK",
		"update.check": "更新を確認",
		"update.install": "更新する",
		"update.upToDate": "最新です",
		"update.notice": "新しいバージョンがあります。上のリンクを押すと、更新の画面が開きます。",
		"status.disabled": "無効",
		"status.outOfScope": "このページは対象外",
		"status.pending": "待機中",
		"status.running": "動作中",
		"status.reloadRequired": "再読み込みで反映",
		"status.failed": "起動に失敗",
		"category.layout": "表示",
		"category.statement": "問題文",
		"category.submission": "提出",
		"category.contest": "コンテスト",
		"category.rating": "成績",
		"category.execution": "実行・提出の補助",
		"wideLayout.title": "ページ幅の拡張",
		"wideLayout.description": "ページ本文の表示幅を指定できます。",
		"wideLayout.width": "表示幅（例：75%、1200px。空欄で標準の幅）",
		"hoverMenu.title": "ドロップダウンをホバーで開く",
		"hoverMenu.description": "ユーザー名や表示言語、「提出結果」にマウスカーソルを重ねると、選択肢が開きます。",
		"statementHighlight.title": "問題文の強調表示",
		"statementHighlight.description": "問題文の数値や変数、実行時間制限とメモリ制限を強調します。",
		"statementHighlight.numberColor": "数字の色",
		"statementHighlight.variableColor": "変数の色",
		"statementHighlight.timeColor": "実行時間制限の色",
		"statementHighlight.memoryColor": "メモリ制限の色",
		"statementHighlight.alwaysEmphasizeLimits": "2 秒と 1024 MiB の制限も強調する",
		"statementCopy.title": "問題文のコピー",
		"statementCopy.description": "問題文や制約などを項目ごとに、またはまとめてコピーできます。",
		"statementCopy.format": "コピーする形式",
		"statementCopy.formatMarkdown": "Markdown",
		"statementCopy.formatPlain": "プレーンテキスト",
		"statementCopy.copy": "Copy",
		"statementCopy.copyAll": "Copy All",
		"statementCopy.copied": "Copied!",
		"statementCopy.defaultTitle": "問題",
		"efficientLayout.title": "サンプルの横並び",
		"efficientLayout.description": "入出力例を横に並べ、幅は内容に合わせて自動で決めます。",
		"efficientLayout.widthMode": "サンプル1組の幅の決め方",
		"efficientLayout.widthModeAuto": "自動（内容に合わせる）",
		"efficientLayout.widthModeFixed": "固定",
		"efficientLayout.sampleWidth": "固定時の幅（画面幅に対する %）",
		"efficientLayout.maxSampleWidth": "自動のときの上限（画面幅に対する %）",
		"efficientLayout.samples": "入出力例",
		"efficientLayout.ioFormat": "入出力形式",
		"submissionQuery.title": "提出一覧の検索条件の保持",
		"submissionQuery.description": "「すべての提出」と「自分の提出」を切り替えても、検索条件を引き継ぎます。",
		"submissionShortcuts.title": "AC 提出へのボタン",
		"submissionShortcuts.description": "問題ページから、実行時間順やコード長順などで AC 提出の一覧を開けます。",
		"submissionShortcuts.language": "言語（空欄ならすべて）",
		"submissionShortcuts.label": "AC 提出",
		"submissionShortcuts.time": "実行時間",
		"submissionShortcuts.length": "コード長",
		"submissionShortcuts.created": "提出時間",
		"submissionShortcuts.memory": "メモリ",
		"submissionShortcuts.byTime": "実行時間順のボタンを出す",
		"submissionShortcuts.byLength": "コード長順のボタンを出す",
		"submissionShortcuts.byCreated": "提出時間順のボタンを出す",
		"submissionShortcuts.byMemory": "メモリ順のボタンを出す",
		"resultNotifier.title": "提出結果の通知",
		"resultNotifier.description": "判定が終わると、提出結果を通知します。",
		"resultNotifier.desktop": "AtCoder を操作していないときはデスクトップ通知も出す",
		"clarNotifier.title": "Clar の通知",
		"clarNotifier.description": "コンテスト中に運営からの回答や訂正が届くと通知します。",
		"clarNotifier.desktop": "AtCoder を操作していないときはデスクトップ通知も出す",
		"clarNotifier.arrived": "新しい Clar が {count} 件あります",
		"averageResult.title": "テストケースの平均",
		"averageResult.description": "提出の詳細に、テストケースの平均実行時間と平均メモリ使用量を表示します。",
		"averageResult.average": "平均",
		"submissionTimer.title": "提出の予約",
		"submissionTimer.description": "指定した時間後に、エディタにあるコードを提出します。",
		"submissionTimer.minutes": "何分後に提出するか",
		"submissionTimer.set": "予約する",
		"submissionTimer.cancel": "取り消す",
		"submissionTimer.canceled": "タイマーを取り消しました。",
		"submissionTimer.scheduled": "{time} ごろに提出します。",
		"languageButtons.title": "言語の切り替えボタン",
		"languageButtons.description": "よく使う提出言語を登録し、ボタンひとつで切り替えられます。",
		"languageButtons.configure": "ボタンにする言語を選ぶ",
		"languageButtons.hint": "チェックした言語のボタンを選択欄の下に表示します。",
		"sourceComments.title": "コードのヘッダーとフッター",
		"sourceComments.description": "コード全体を貼り付けると、登録した文を先頭と末尾に追加します。",
		"sourceComments.style": "既定のコメントの形式",
		"sourceComments.styleLine": "単一行コメントを並べる",
		"sourceComments.styleBlock": "複数行コメント",
		"sourceComments.runnerHeader": "Local Runner のヘッダーの置き場所",
		"sourceComments.runnerHeaderAbove": "問題ごとのヘッダーの上",
		"sourceComments.runnerHeaderBelow": "問題ごとのヘッダーの下",
		"sourceComments.runnerHeaderNone": "付けない",
		"sourceComments.runnerHeaderName": "Local Runner のヘッダーの名前（空欄なら言語の既定）",
		"sourceComments.runnerHeaderNameInvalid":
			"英数字で始まり、英数字、_、- だけを使う名前を書いてください（Local Runner の setheader と同じ規則）。",
		"sourceComments.runnerHeaderFailed": "Local Runner のヘッダーを読めませんでした",
		"sourceComments.panel": "ヘッダーとフッター",
		"sourceComments.header": "ヘッダー（コードの先頭）",
		"sourceComments.footer": "フッター（コードの末尾）",
		"sourceComments.placeholder": "参照元の URL など",
		"sourceComments.taskOnly": "この問題のみ",
		"sourceComments.commentOut": "挿入時にコメントアウトする",
		"sourceComments.multiline": "複数行コメントにする",
		"sourceComments.restoreHistory": "履歴から復元",
		"sourceComments.restorePreset": "保存した名前から呼び出す",
		"sourceComments.savePreset": "名前を付けて保存",
		"sourceComments.removePreset": "削除",
		"sourceComments.presetName": "保存する名前",
		"sourceComments.apply": "コードへ反映",
		"sourceComments.variables":
			"{url} は問題の URL、{task} は問題の ID、{contest} はコンテストの ID に置き換えます。",
		"sourceComments.notInserted": "コメントを挿入していません",
		"sourceComments.unsupported": "この言語はコメントの書き方が分からないので、挿入していません。",
		"taskStatus.title": "提出結果による問題の色分け",
		"taskStatus.description": "自分の提出結果に応じて、問題一覧と「問題」タブのドロップダウンを色分けします。",
		"taskStatus.acceptedColor": "AC または得点のある問題の色",
		"taskStatus.rejectedColor": "AC も得点もない提出済みの問題の色",
		"taskDropdown.title": "問題のドロップダウン",
		"taskDropdown.description": "「問題」タブから各問題へ移動したり、複数の問題をまとめて開いたりできます。",
		"taskDropdown.newTab": "新しいタブで開く",
		"taskDropdown.taskTable": "問題一覧",
		"taskDropdown.openAtOnce": "まとめて開く",
		"taskDropdown.loadFailed": "（読み込み失敗）",
		"taskDropdown.all": "すべて",
		"taskDropdown.range": "範囲を指定",
		"taskDropdown.reverse": "逆順で開く",
		"taskDropdown.cancel": "キャンセル",
		"taskDropdown.tabCount": "{count} 個のタブが開きます。ブロックされた場合はポップアップを許可してください。",
		"taskDropdown.tabLimit": "※一度に開けるタブは {count} 個までです。",
		"editorialList.title": "解説の一覧表示",
		"editorialList.description": "解説一覧で、各解説の本文をリンクの下に展開します。",
		"variableHover.title": "ホバーした変数と数値の強調",
		"variableHover.description":
			"数式の変数や数値にマウスカーソルを重ねると、同じ問題内の同じ変数・数値を強調します。",
		"variableHover.variables": "変数を強調する",
		"variableHover.numbers": "数値を強調する",
		"latestContests.title": "次のコンテスト",
		"latestContests.description": "ヘッダーから今後のコンテストを確認できます。",
		"latestContests.menu": "次のコンテスト",
		"latestContests.loading": "読み込み中...",
		"latestContests.failed": "取得できませんでした",
		"contestCalendar.title": "カレンダーへの登録",
		"contestCalendar.description": "コンテスト名と開催日時を入力した Google カレンダーの予定作成画面を開けます。",
		"contestCalendar.add": "カレンダーに追加",
		"virtualTimer.title": "バーチャル参加のタイマー",
		"virtualTimer.description": "バーチャル参加の開始までの時間と、競技中の残り時間を表示します。",
		"virtualTimer.untilStart": "開始まであと",
		"virtualTimer.remaining": "残り時間",
		"topLinks.title": "トップページのコンテスト一覧",
		"topLinks.description": "トップページから、ABC・ARC・AGC・AHC の過去のコンテスト一覧を開けます。",
		"tessokuDifficulty.title": "鉄則本の難易度表示",
		"tessokuDifficulty.description": "『競技プログラミングの鉄則』の問題一覧に、書籍の難易度を表示します。",
		"tessokuDifficulty.sortByDifficulty": "難易度順で並べ替え",
		"tessokuDifficulty.sortById": "問題番号順で並べ替え",
		"ratingGraph.title": "レーティンググラフにパフォーマンスを表示",
		"ratingGraph.description":
			"ユーザーページのレーティンググラフに、Rated 参加時のパフォーマンスを重ねて表示します。",
		"ratingGraph.recentByDefault": "最初は最近の結果だけを表示する",
		"ratingGraph.recentRange": "最近の結果の範囲（例：20 で直近20回、50% で直近の半分）",
		"ratingGraph.recentRangeInvalid": "1 以上の整数か、1% から 100% の割合を入力してください。",
		"ratingGraph.togglePerformance": "パフォーマンスの ON/OFF",
		"ratingGraph.showAll": "all",
		"ratingGraph.showRecent": "recent",
		"localRunner.title": "Local Runner との連携",
		"localRunner.description": "提出補助、ヘッダーの取得、Easy Test+ で使うサーバーの接続先を設定します。",
		"localRunner.url": "接続先の URL",
		"submissionHelper.submitChanged": "提出準備が完了しなかったため、提出を取り消しました。",
		"submissionHelper.fallbackFailed": "ブラウザで安全に変換できませんでした。",
		"keyboardShortcuts.title": "ショートカットキー",
		"keyboardShortcuts.description":
			"提出、入出力例のコピー、問題の切り替え、ページを開く操作などを、好きなキーで行えます。キーは詳細設定の操作をダブルクリックか右クリックして変更します。",
		"keyboardShortcuts.openSettings": "CP Toolkit の設定を開く",
		"keyboardShortcuts.submit": "提出する",
		"keyboardShortcuts.fold": "カーソルのあるブロックを折りたたむ",
		"keyboardShortcuts.unfold": "カーソルの行の折りたたみを開く",
		"keyboardShortcuts.testAndSubmit": "Easy Test+ でテストしてから提出する",
		"keyboardShortcuts.testAll": "Easy Test+ ですべての入出力例をテストする",
		"keyboardShortcuts.toggleEasyTest": "Easy Test+ の画面を開閉する",
		"keyboardShortcuts.copyInput": "入力例をコピーする（この修飾キーと番号の 1〜9）",
		"keyboardShortcuts.copyOutput": "出力例をコピーする（この修飾キーと番号の 1〜9）",
		"keyboardShortcuts.copyStatement": "問題文をすべてコピーする",
		"keyboardShortcuts.previousTask": "前の問題を開く",
		"keyboardShortcuts.nextTask": "次の問題を開く",
		"keyboardShortcuts.openTask": "問題を開く（この修飾キーと A〜Z。一覧の上から順に A、B、C…）",
		"keyboardShortcuts.openTasks": "問題の一覧を開く",
		"keyboardShortcuts.openMySubmissions": "自分の提出を開く",
		"keyboardShortcuts.openStandings": "順位表を開く",
		"keyboardShortcuts.openEditorial": "解説を開く",
		"keyboardShortcuts.openCustomTest": "コードテストを開く",
		"keyboardShortcuts.acByTime": "AC の提出を実行時間順に開く",
		"keyboardShortcuts.acByLength": "AC の提出をコード長順に開く",
		"keyboardShortcuts.acByCreated": "AC の提出を提出日時順に開く",
		"keyboardShortcuts.acByMemory": "AC の提出をメモリ順に開く",
		"keyboardShortcuts.share": "表示中のページを X に投稿する画面を開く",
		"keyboardShortcuts.groupGlobal": "全ページ共通",
		"keyboardShortcuts.groupEditor": "提出欄とエディタ",
		"keyboardShortcuts.groupProblem": "問題ページ",
		"keyboardShortcuts.groupProblemNote": "Easy Test+ と入出力例のコピーは、AtCoder の提出ページでも動きます。",
		"keyboardShortcuts.groupContest": "コンテストのページ",
		"keyboardShortcuts.sampleInput": "入力例 {number}",
		"keyboardShortcuts.sampleOutput": "出力例 {number}",
		"keyboardShortcuts.sampleCopied": "{sample} をコピーしました",
		"keyboardShortcuts.sampleMissing": "{sample} が見つかりません",
		"submissionHelper.title": "提出補助",
		"submissionHelper.description": "貼り付けたコードを提出用に変換します。",
		"submissionHelper.localRunnerRequired": "{package}.* の展開には Local Runner が必要です",
		"submissionHelper.localRunnerGuide":
			"Local Runner に接続できなかったので、簡易の変換だけを行いました。このまま提出するとコンパイルエラーになります。リンクから導入方法を確認できます。",
		"submissionHelper.unresolvedImports": "見つからない import があります",
		"submissionHelper.transformFailed": "Local Runner で変換できませんでした",
		"submissionHelper.diagnostics": "診断の全文",
		"submissionHelper.debugFlag":
			"Local Runner がないときに false にするデバッグ用の変数の名前（例：DEBUG。空欄なら変えない）",
		"submissionHelper.debugFlagInvalid":
			"英字か _ で始まり、英数字と _ だけを使う名前を書いてください（例：DEBUG）。",
		"submissionHelper.libraryPackage":
			"Local Runner で展開する Java のライブラリのパッケージ（例：lib。空欄なら確かめない）",
		"submissionHelper.libraryPackageInvalid": "Java のパッケージ名を書いてください（例：lib、lib.io）。",
		"submissionHelper.foldOnPaste": "貼り付け後に、いちばん外側のブロックとコメントを折りたたむ",
		"easyTest.submitChanged":
			"テスト中に提出内容または実行環境が変わったため、提出を取り消しました。結果はテスト欄で確認できます。",
		"easyTest.title": "Easy Test+",
		"easyTest.description": "問題ページでサンプルを実行し、すべて通ったらそのまま提出できます。",
		"easyTest.precompile": "Local Runner で編集中のコードを事前にコンパイルする",
		"easyTest.savedCodeLimit": "コードを保存する問題数",
		"easyTest.allowableError": "許容誤差",
		"easyTest.invalidAllowableError":
			"許容誤差は 1e-6 や 0.001 のような正の数で書いてください。10^-6 のような書き方は使えません。",
		"easyTest.run": "Run",
		"easyTest.testAndSubmit": "Test & Submit",
		"easyTest.cancelSubmit": "提出を中止",
		"easyTest.testAll": "Test All Samples",
		"easyTest.restore": "Restore Last Code",
		"easyTest.autoRunner": "自動",
		"easyTest.environment": "実行環境",
		"easyTest.noEnvironment": "実行環境がありません",
		"easyTest.standardInput": "標準入力",
		"easyTest.standardOutput": "標準出力",
		"easyTest.standardError": "標準エラー出力",
		"easyTest.expectedOutput": "期待する出力",
		"easyTest.exitCode": "終了コード",
		"easyTest.execTime": "実行時間",
		"easyTest.memory": "メモリ",
		"easyTest.allocated": "累積の割り当て",
		"easyTest.noSavedCode": "この問題の保存済みコードはありません。",
		"easyTest.noSamples": "サンプルが見つかりませんでした。テストと提出は行っていません。",
		"easyTest.noSource": "ソースコードが空なので、実行していません。",
		"easyTest.internalError":
			"実行環境でエラーが起きたので、コードを実行できませんでした。別の実行環境を選んでやり直してください。",
		"easyTest.lineOffset":
			"Local Runner がコードを変換したので、エラーの行番号はエディタより {lines} 行ずれています。",
		"easyTest.restoreConfirm": "現在のコードを置き換えます。よろしいですか?",
		"paizaLanguage.title": "paiza の言語選択",
		"paizaLanguage.description": "paiza の提出ページで、あらかじめ指定した言語を自動選択します。",
		"paizaLanguage.language": "言語（例：c++、java、python3）",
	};

	// CpToolkit/src/catalog/messages.ts
	var MESSAGES = {ja: ja_default, en: en_default};

	function createTranslator(getLocale) {
		return (key) => MESSAGES[getLocale()][key];
	}

	// CpToolkit/src/domain/contest/pages.ts
	var ATCODER_CONTEST = /^\/contests\/([^/?#]+)/;
	var ATCODER_TASK = /^\/contests\/[^/]+\/tasks\/([^/?#]+)/;
	var CODEFORCES_CONTEST = /^\/(?:group\/[^/]+\/)?(?:contest|gym)\/\d+/;
	var CODEFORCES_PROBLEMSET = /^\/problemset\/problem\/(\d+)\//;

	function contestPagesOf(judgeId, pathname) {
		if (judgeId === "atcoder") {
			const contest = ATCODER_CONTEST.exec(pathname)?.[1];
			if (!contest || contest === "archive") return null;
			const base = `/contests/${contest}`;
			const task = ATCODER_TASK.exec(pathname)?.[1];
			return {
				tasks: `${base}/tasks`,
				mySubmissions: `${base}/submissions/me`,
				standings: `${base}/standings`,
				editorial: task ? `${base}/tasks/${task}/editorial` : `${base}/editorial`,
				customTest: `${base}/custom_test`,
			};
		}
		if (judgeId === "codeforces") {
			const problemset = CODEFORCES_PROBLEMSET.exec(pathname)?.[1];
			const base = problemset ? `/contest/${problemset}` : CODEFORCES_CONTEST.exec(pathname)?.[0];
			if (!base) return null;
			return {
				tasks: base,
				mySubmissions: `${base}/my`,
				standings: `${base}/standings`,
				editorial: null,
				customTest: `${base}/customtest`,
			};
		}
		return null;
	}

	var TASK_PATHS = [
		/^\/contests\/([^/]+)\/tasks\/([^/?#]+)/,
		/^\/(?:group\/[^/]+\/)?(?:contest|gym)\/(\d+)\/problem\/([^/?#]+)/,
		/^\/problemset\/problem\/(\d+)\/([^/?#]+)/,
	];

	function taskKeyOf(pathname) {
		for (const pattern of TASK_PATHS) {
			const match = pattern.exec(pathname);
			if (match) return `${match[1]}/${match[2]?.toLowerCase()}`;
		}
		return null;
	}

	var ORIGIN = /^[a-z]+:\/\/[^/]+/i;

	function neighborTask(tasks, pathname, offset) {
		const current = taskKeyOf(pathname);
		if (current === null) return null;
		const index = tasks.findIndex((task) => taskKeyOf(task.url.replace(ORIGIN, "")) === current);
		if (index < 0) return null;
		return tasks[index + offset] ?? null;
	}

	// CpToolkit/src/application/contest/task-list.ts
	var isCacheEntry = isObjectOf({
		tasks: isArrayOf(isObjectOf({url: isString, label: isString, name: isString})),
		lastAccess: isNumber,
	});
	var CACHE_KEY = "task-dropdown:tasks";
	var DAY_MS = 24 * 60 * 60 * 1000;

	async function loadContestTasks(contestId, {site, state, parse, cacheDays}) {
		const cache = readStored(state, CACHE_KEY, isRecordOf(isCacheEntry), {});
		const now = Date.now();
		const fresh = Object.entries(cache).filter(([, entry]) => now - entry.lastAccess < cacheDays * DAY_MS);
		let tasks = cache[contestId]?.tasks ?? null;
		if (!tasks) {
			const response = await site.send({url: `/contests/${contestId}/tasks`});
			if (response.status !== 200) return null;
			tasks = parse(response.text);
		}
		const entries = tasks.length > 0 ? [...fresh, [contestId, {tasks, lastAccess: now}]] : fresh;
		state.set(CACHE_KEY, Object.fromEntries(entries));
		return tasks;
	}

	// CpToolkit/src/domain/execution/language.ts
	var compiledCatalogs = new WeakMap();

	function compile(catalog) {
		const cached = compiledCatalogs.get(catalog);
		if (cached) return cached;
		const compiled = catalog.families.map(({id, match}) => {
			return {id, patterns: match.map((pattern) => new RegExp(pattern))};
		});
		compiledCatalogs.set(catalog, compiled);
		return compiled;
	}

	function resolveFamily(catalog, label) {
		return compile(catalog).find(({patterns}) => patterns.some((pattern) => pattern.test(label)))?.id ?? null;
	}

	function commentSyntaxOf(catalog, familyId) {
		const comment = catalog.families.find(({id}) => id === familyId)?.comment;
		return comment === undefined ? null : (catalog.comments[comment] ?? null);
	}

	function labelDistance(a, b) {
		let previous = new Float64Array(b.length + 1);
		let current = new Float64Array(b.length + 1);
		for (let i = 0; i < a.length; i++) {
			current.fill(0);
			const code = a.charCodeAt(i);
			for (let j = 0; j < b.length; j++) {
				const cost = (code - b.charCodeAt(j)) ** 2;
				current[j + 1] = Math.min(
					(previous[j] ?? 0) + cost,
					(previous[j + 1] ?? 0) + cost * 0.25,
					(current[j] ?? 0) + cost * 0.25,
				);
			}
			[previous, current] = [current, previous];
		}
		return previous[b.length] ?? 0;
	}

	var JAVASCRIPT_PREFIX = "javascript";

	function isLanguageOption(optionLabel, target) {
		const label = optionLabel.trim().replace(/\s+/g, " ").toLowerCase();
		if (!label || (label.startsWith(JAVASCRIPT_PREFIX) && target !== JAVASCRIPT_PREFIX)) return false;
		return label === target || label.startsWith(`${target} `) || label.startsWith(`${target}(`);
	}

	// CpToolkit/src/application/execution/local-languages.ts
	function orderLocalCompilers(compilers, {family, label}) {
		const sameFamily = compilers.filter((compiler) => {
			return (compiler.family ?? resolveFamily(languageCatalog, compiler.language)) === family;
		});
		if (!sameFamily.some(({match}) => match !== undefined)) return sameFamily;
		const pageLabel = label.toLowerCase();
		const matches = ({match}) => {
			return (match ?? []).some((word) => pageLabel.includes(word.toLowerCase()));
		};
		return [...sameFamily.filter(matches), ...sameFamily.filter((compiler) => !matches(compiler))];
	}

	// CpToolkit/src/application/execution/local-runner.ts
	var METADATA_TIMEOUT_MS = 3000;
	var VERSION_CACHE_MS = 1e4;
	var TRANSFORM_TIMEOUT_MS = 30000;

	function object(value) {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	function strings(value) {
		return Array.isArray(value) && value.every((item) => typeof item === "string");
	}

	function compiler(value) {
		return (
			object(value) &&
			typeof value.language === "string" &&
			typeof value.compilerName === "string" &&
			typeof value.label === "string" &&
			(value.family === undefined || typeof value.family === "string") &&
			(value.match === undefined || strings(value.match))
		);
	}

	function diagnostic(value) {
		return (
			object(value) &&
			typeof value.kind === "string" &&
			typeof value.line === "number" &&
			typeof value.column === "number" &&
			typeof value.code === "string" &&
			typeof value.message === "string" &&
			(value.importName === undefined || typeof value.importName === "string")
		);
	}

	class LocalRunnerError extends Error {
		status;
		notify;

		constructor(message, status, notify = true) {
			super(message);
			this.status = status;
			this.notify = notify;
		}
	}

	class LocalRunnerClient {
		http;
		endpoint;
		compilers = null;
		version = null;
		warnedVersion = "";

		constructor(http, endpoint) {
			this.http = http;
			this.endpoint = endpoint;
		}

		isAvailable() {
			return this.endpoint() !== null;
		}

		list(refresh = false) {
			const url = this.endpoint();
			if (this.compilers?.url === url && (!refresh || !this.compilers.settled)) return this.compilers.list;
			const list = this.post({mode: "list"}, METADATA_TIMEOUT_MS).then((value) => {
				if (!Array.isArray(value) || !value.every(compiler))
					throw new LocalRunnerError("Invalid Local Runner compiler list.", 200);
				return value;
			});
			if (url !== null) {
				const cached = {url, list, settled: false};
				this.compilers = cached;
				list.then(
					() => {
						cached.settled = true;
					},
					() => {
						if (this.compilers === cached) this.compilers = null;
					},
				);
			}
			return list;
		}

		async requireSubmissionApi() {
			const url = this.endpoint();
			if (url === null) throw new LocalRunnerError("Local Runner is not configured.", 0);
			if (this.version?.url !== url || Date.now() >= this.version.expires) {
				const value = this.post({mode: "status"}, METADATA_TIMEOUT_MS).then((info) => {
					if (
						!object(info) ||
						info.status !== "running" ||
						typeof info.version !== "string" ||
						!/^\d+\.\d+\.\d+$/.test(info.version)
					) {
						throw new LocalRunnerError("Invalid Local Runner version response.", 200);
					}
					return info.version;
				});
				const cached = {url, expires: Date.now() + VERSION_CACHE_MS, value};
				this.version = cached;
				value.catch(() => {
					if (this.version === cached) this.version = null;
				});
			}
			const version = await this.version.value;
			if (url !== this.endpoint()) throw new LocalRunnerError("Local Runner endpoint changed.", -1);
			if (Number(version.split(".")[0]) < 2) {
				const key = url + "/" + version;
				const notify = this.warnedVersion !== key;
				this.warnedVersion = key;
				throw new LocalRunnerError(
					`Local Runner ${version}: update to 2.0.0 or later to prepare submissions and attach headers.`,
					400,
					notify,
				);
			}
			this.warnedVersion = "";
		}

		async compilerFor(language) {
			return orderLocalCompilers(await this.list(), language)[0]?.compilerName ?? null;
		}

		async transform(sourceCode, compilerName) {
			await this.requireSubmissionApi();
			const request = {
				mode: "transform",
				sourceCode,
				...(compilerName !== undefined && {compilerName}),
				debug: false,
				validate: true,
				header: false,
			};
			const response = await this.post(request, TRANSFORM_TIMEOUT_MS);
			if (
				!object(response) ||
				(response.status !== "success" && response.status !== "compileError") ||
				typeof response.sourceCode !== "string" ||
				typeof response.diagnostics !== "string" ||
				!Array.isArray(response.diagnosticItems) ||
				!response.diagnosticItems.every(diagnostic) ||
				!strings(response.inlinedClasses)
			)
				throw new LocalRunnerError("Invalid Local Runner transform response.", 200);
			return {
				status: response.status,
				sourceCode: response.sourceCode,
				diagnostics: response.diagnostics,
				diagnosticItems: response.diagnosticItems,
				inlinedClasses: response.inlinedClasses,
			};
		}

		async header(compilerName, header) {
			await this.requireSubmissionApi();
			const response = await this.post(
				{mode: "header", ...(compilerName !== undefined && {compilerName}), header},
				METADATA_TIMEOUT_MS,
			);
			if (
				!object(response) ||
				response.status !== "success" ||
				(response.header !== null && typeof response.header !== "string")
			) {
				throw new LocalRunnerError("Invalid Local Runner header response.", 200);
			}
			return response.header;
		}

		async precompile(sourceCode, compilerName) {
			await this.post({
				mode: "precompile",
				sourceCode,
				...(compilerName !== undefined && {compilerName}),
				debug: true,
			});
		}

		run(sourceCode, input, compilerName) {
			return this.post({
				mode: "run",
				sourceCode,
				...(compilerName !== undefined && {compilerName}),
				stdin: input,
				debug: true,
			});
		}

		async post(request, timeoutMs) {
			const url = this.endpoint();
			if (url === null) throw new LocalRunnerError("Local Runner is not configured.", 0);
			const lostConnection = request.mode === "transform" || request.mode === "header" ? -1 : 0;
			let response;
			try {
				response = await this.http.send({
					url,
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify(request),
					timeoutMs,
				});
			} catch (error) {
				if (this.compilers?.url === url) this.compilers = null;
				if (this.version?.url === url) this.version = null;
				throw new LocalRunnerError(error instanceof Error ? error.message : String(error), lostConnection);
			}
			if (response.status < 200 || response.status >= 300) {
				if (this.compilers?.url === url) this.compilers = null;
				if (this.version?.url === url) this.version = null;
				const reason = safeJsonParse(response.text, null)?.stderr;
				const detail =
					typeof reason === "string" && reason
						? `
${reason}`
						: "";
				throw new LocalRunnerError(
					`Local Runner returned ${response.status}.${detail}`,
					response.status || lostConnection,
				);
			}
			try {
				return JSON.parse(response.text);
			} catch {
				throw new LocalRunnerError("Invalid JSON from Local Runner.", response.status);
			}
		}
	}

	// CpToolkit/src/domain/execution/result.ts
	function parseAllowableError(text) {
		if (!/^\s*(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?\s*$/.test(text)) return null;
		const value = Number(text.trim());
		return Number.isFinite(value) && value > 0 ? value : null;
	}

	function judgeResult(result, expected, options) {
		if (expected === null) return result;
		if (result.status !== "OK") return {...result, expectedOutput: expected};
		const judged = evaluateEasyTestOutput({status: result.status, output: result.output ?? ""}, expected, options);
		return {...result, ...judged};
	}

	// CpToolkit/src/application/execution/runner-catalog.ts
	var ENVIRONMENT_SUFFIX = /\s*\[[^\]]*\]$/;

	class RunnerCatalogService {
		providers;
		order;
		maxRetry;
		external;

		constructor(providers, order, maxRetry, external = []) {
			this.providers = providers;
			this.order = order;
			this.maxRetry = maxRetry;
			this.external = external;
		}

		async candidates(language) {
			const results = await Promise.allSettled(this.providers().map((provider) => provider.runnersFor(language)));
			const ranked = results
				.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
				.map((runner) => ({
					runner,
					rank: this.order.indexOf(runner.kind),
					distance: labelDistance(runner.label.replace(ENVIRONMENT_SUFFIX, ""), language.label),
				}));
			return ranked
				.toSorted((a, b) => {
					return (
						a.rank - b.rank ||
						(a.runner.preference ?? 0) - (b.runner.preference ?? 0) ||
						a.distance - b.distance
					);
				})
				.map(({runner}) => runner);
		}

		async test(candidates, firstRunnerId, sourceCode, testCase, options) {
			const start = Math.max(
				0,
				candidates.findIndex(({id}) => id === firstRunnerId),
			);
			const [first, ...rest] = [...candidates.slice(start), ...candidates.slice(0, start)];
			const runners = first ? [first, ...rest.filter(({kind}) => !this.external.includes(kind))] : [];
			let result = {status: "IE", input: testCase.input};
			for (let retry = 0; retry < this.maxRetry; retry++) {
				const runner = runners[retry % runners.length];
				if (!runner) break;
				try {
					result = await runner.run(sourceCode, testCase.input, options);
				} catch (error) {
					result = {status: "IE", input: testCase.input, error: String(error)};
				}
				if (result.status !== "IE") return judgeResult(result, testCase.output, options);
			}
			return result;
		}
	}

	// CpToolkit/src/application/shortcuts/shortcut-actions.ts
	class ShortcutActions {
		actions = new Map();
		keys = new Map();

		register(id, action) {
			this.actions.set(id, action);
			return () => {
				if (this.actions.get(id) === action) this.actions.delete(id);
			};
		}

		run(id) {
			return this.actions.get(id)?.() ?? false;
		}

		assign(id, key) {
			if (key === null) this.keys.delete(id);
			else this.keys.set(id, key);
		}

		keyOf(id) {
			return this.keys.get(id) ?? null;
		}
	}

	var SHORTCUT_ACTIONS = {
		testAndSubmit: "easy-test.testAndSubmit",
		testAll: "easy-test.testAll",
		toggleEasyTest: "easy-test.togglePanel",
		acByTime: "submission-shortcuts.byTime",
		acByLength: "submission-shortcuts.byLength",
		acByCreated: "submission-shortcuts.byCreated",
		acByMemory: "submission-shortcuts.byMemory",
		copyStatement: "statement-copy.copyAll",
	};

	// CpToolkit/src/application/source/paste-pipeline.ts
	class PastePipeline {
		steps = [];
		watching = false;
		editors;
		generation = 0;
		pending = null;

		constructor(editors) {
			this.editors = editors;
		}

		get busy() {
			return this.pending !== null;
		}

		settled() {
			return this.pending ?? Promise.resolve(true);
		}

		add(target, lookup, step) {
			this.steps.push(step);
			this.steps.sort((a, b) => a.order - b.order);
			if (this.watching) return;
			this.watching = true;
			this.editors.locate(target, lookup).then((editor) => {
				if (editor) editor.onPaste((pasted, inserted) => void this.start(editor, pasted, this.steps, inserted));
				else this.watching = false;
			});
		}

		apply(editor, step) {
			return this.start(editor, editor.getValue(), [step]);
		}

		start(editor, pasted, steps, inserted) {
			const generation = ++this.generation;
			steps = [...steps];
			const model = editor.identity?.();
			const keys = steps.map((step) => step.contextKey?.(editor));
			const run = async () => {
				if (inserted) await inserted;
				const original = editor.getValue();
				const originalLF = normalizeNewlines(original);
				const isCurrent = () =>
					generation === this.generation &&
					normalizeNewlines(editor.getValue()) === originalLF &&
					editor.identity?.() === model &&
					steps.every((step, index) => step.contextKey?.(editor) === keys[index]);
				const committed = [];
				let code = original;
				for (const step of steps) {
					if (!isCurrent()) return false;
					const next = await step.transform(code, {
						editor,
						pasted,
						original,
						isCurrent,
						onCommit: (action) => committed.push(action),
					});
					if (next !== code && step.applied) committed.push(() => step.applied?.(editor));
					code = next;
				}
				if (!isCurrent()) return false;
				if (code !== original) editor.setValue(normalizeNewlines(code));
				for (const action of committed) action();
				return true;
			};
			const pending = run()
				.catch(() => false)
				.finally(() => {
					if (generation === this.generation) this.pending = null;
				});
			this.pending = pending;
			return pending;
		}
	}

	// CpToolkit/src/domain/rating/history.ts
	var RECENT_RANGE_PATTERN = /^(\d+)\s*(%?)$/;
	var MAX_PERCENT = 100;

	function parseRecentRange(text) {
		const [, digits, percent] = RECENT_RANGE_PATTERN.exec(text.normalize("NFKC").trim()) ?? [];
		const value = Number(digits);
		const unit = percent ? "percent" : "count";
		if (!Number.isSafeInteger(value) || value < 1 || (unit === "percent" && value > MAX_PERCENT)) return null;
		return {unit, value};
	}

	function recentCount({unit, value}, total) {
		const count = unit === "percent" ? Math.ceil((total * value) / MAX_PERCENT) : value;
		return Math.min(count, total);
	}

	function ratedPerformances(history) {
		return history.filter((entry) => entry.IsRated).map((entry) => Math.max(0, entry.Performance ?? 0));
	}

	// CpToolkit/src/domain/rating/scale.ts
	var UNRATED_TIER = {
		min: -1,
		color: "#000000",
		alpha: 0.1,
		className: "user-unrated",
	};

	function tierOf(scale, value) {
		return scale.tiers.findLast((tier) => value >= tier.min) ?? UNRATED_TIER;
	}

	function tierProgress(scale, value) {
		const step = scale.tiers[1]?.min ?? 400;
		const current = tierOf(scale, value);
		if (current.min < 0) return 0;
		const next = scale.tiers.find((tier) => tier.min > current.min)?.min ?? current.min + step;
		return (value - current.min) / (next - current.min);
	}

	// CpToolkit/src/adapters/page/globals.ts
	function pageGlobals() {
		return unsafeWindow;
	}

	// CpToolkit/src/adapters/atcoder/rating-graph.ts
	var MARGIN_X = 86400 * 30;
	var MARGIN_Y_LOW = 100;
	var MARGIN_Y_HIGH = 300;
	var OFFSET_X = 50;
	var OFFSET_Y = 5;
	var DEFAULT_WIDTH = 640;
	var HIGHEST_WIDTH = 115;
	var HIGHEST_HEIGHT = 20;
	var LABEL_FONT = "12px Lato";
	var START_YEAR = 2010;
	var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var YEAR_SECONDS = 86400 * 365;
	var STEP_SIZE = 400;
	var VERTEX_STROKE_WIDTH = 0.5;
	var PARTICLE_MIN = 3;
	var PARTICLE_MAX = 20;
	var PARTICLE_LIFE = 30;
	var READY_TIMEOUT_MS = 1e4;
	var READY_INTERVAL_MS = 50;
	var ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];
	var ratio = (value, low, high) => (value - low) / (high - low);

	function ordinal(value) {
		const tail = value % 100;
		return `${value}${ORDINAL_SUFFIXES[(tail - 20) % 10] ?? ORDINAL_SUFFIXES[tail] ?? ORDINAL_SUFFIXES[0]}`;
	}

	function signed(value) {
		return `${value === 0 ? "±" : value < 0 ? "-" : "+"}${Math.abs(value)}`;
	}

	function findDependencies() {
		const {createjs: cj, rating_history: history} = pageGlobals();
		const hasCanvases = document.getElementById("ratingGraph") && document.getElementById("ratingStatus");
		return cj && Array.isArray(history) && hasCanvases ? {cj, history} : null;
	}

	function replaceCanvas(id) {
		const canvas = document.getElementById(id);
		if (!(canvas instanceof HTMLCanvasElement)) return null;
		const clone = canvas.cloneNode(false);
		canvas.replaceWith(clone);
		return clone;
	}

	function scaleStage(stage, canvas) {
		const rect = canvas.getBoundingClientRect();
		const width = Math.round(rect.width || canvas.clientWidth || canvas.width || DEFAULT_WIDTH);
		const height = Math.round(rect.height || canvas.clientHeight || canvas.height);
		const pixelRatio = window.devicePixelRatio || 1;
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		stage.scaleX = stage.scaleY = pixelRatio;
		Object.assign(canvas.style, {
			width: `${width}px`,
			height: `${height}px`,
			maxWidth: `${width}px`,
			maxHeight: `${height}px`,
		});
		return {width, height};
	}

	class CreateJsRatingGraph {
		prepared = null;

		async prepare(performances) {
			const deadline = Date.now() + READY_TIMEOUT_MS;
			let dependencies = findDependencies();
			while (!dependencies) {
				if (Date.now() > deadline) return false;
				await sleep(READY_INTERVAL_MS);
				dependencies = findDependencies();
			}
			const {cj, history} = dependencies;
			cj.Ticker.removeAllEventListeners("tick");
			const graphCanvas = replaceCanvas("ratingGraph");
			const statusCanvas = replaceCanvas("ratingStatus");
			if (!graphCanvas || !statusCanvas) return false;
			const stageGraph = new cj.Stage(graphCanvas);
			const stageStatus = new cj.Stage(statusCanvas);
			stageGraph.enableMouseOver();
			stageStatus.enableMouseOver();
			this.prepared = {cj, history, performances, graphCanvas, statusCanvas, stageGraph, stageStatus};
			return history.length > 0;
		}

		draw({showPerformance, recent}) {
			if (!this.prepared) return;
			const {cj, graphCanvas, statusCanvas, stageGraph, stageStatus} = this.prepared;
			const total = this.prepared.history.length;
			const shown = recent ? recentCount(recent, total) : total;
			const history = this.prepared.history.slice(-shown);
			const performances = this.prepared.performances.slice(-shown);
			const count = history.length;
			if (count === 0) return;
			stageGraph.removeAllChildren();
			stageStatus.removeAllChildren();
			const graphSize = scaleStage(stageGraph, graphCanvas);
			const statusSize = scaleStage(stageStatus, statusCanvas);
			const panelWidth = graphSize.width - OFFSET_X - 10;
			const panelHeight = graphSize.height - OFFSET_Y - 30;
			const statusWidth = statusSize.width - OFFSET_X - 10;
			const statusHeight = statusSize.height - OFFSET_Y - 5;
			const times = history.map((entry) => entry.EndTime);
			const xMin = Math.min(...times) - MARGIN_X;
			const xMax = Math.max(...times) + MARGIN_X;
			const shownValues = [...history.map((entry) => entry.NewRating), ...(showPerformance ? performances : [])];
			const yMin = Math.min(1500, Math.max(0, Math.min(...shownValues) - MARGIN_Y_LOW));
			const yMax = Math.max(...shownValues) + MARGIN_Y_HIGH;
			const pointX = (time) => OFFSET_X + panelWidth * ratio(time, xMin, xMax);
			const pointY = (value) => OFFSET_Y + (panelHeight - panelHeight * ratio(value, yMin, yMax));
			const newShape = (parent) => {
				const shape = new cj.Shape();
				parent.addChild(shape);
				return shape;
			};
			const newText = (parent, x, y, font) => {
				const text = new cj.Text("", font, "#000");
				Object.assign(text, {x, y, textAlign: "center", textBaseline: "middle"});
				parent.addChild(text);
				return text;
			};
			const drawBackground = () => {
				const panel = newShape(stageGraph);
				Object.assign(panel, {x: OFFSET_X, y: OFFSET_Y, alpha: 0.3});
				const border = newShape(stageGraph);
				Object.assign(border, {x: OFFSET_X, y: OFFSET_Y});
				const addLabel = (text, x, y, align) => {
					const label = new cj.Text(text, LABEL_FONT, "#000");
					Object.assign(label, {x, y, ...align});
					stageGraph.addChild(label);
				};
				let top = 0;
				for (const tier of ratingScale.tiers.toReversed()) {
					const bottom = panelHeight - panelHeight * ratio(tier.min, yMin, yMax);
					if (bottom > 0 && top < panelHeight) {
						top = Math.max(top, 0);
						panel.graphics
							.beginFill(tier.color)
							.rect(0, top, panelWidth, Math.min(bottom, panelHeight) - top);
					}
					top = bottom;
				}
				for (let value = 0; value <= yMax; value += STEP_SIZE) {
					if (value < yMin) continue;
					const y = panelHeight - panelHeight * ratio(value, yMin, yMax);
					addLabel(String(value), OFFSET_X - 10, OFFSET_Y + y, {textAlign: "right", textBaseline: "middle"});
					border.graphics.beginStroke(value === 2000 ? "#000" : "#FFF").setStrokeStyle(0.5);
					border.graphics.moveTo(0, y).lineTo(panelWidth, y);
				}
				border.graphics.beginStroke("#FFF").setStrokeStyle(0.5);
				let monthStep = 6;
				for (let years = 3; years >= 1; years--) {
					if (xMax - xMin <= YEAR_SECONDS * years + MARGIN_X * 2) monthStep = years;
				}
				const axisLabel = {textAlign: "center", textBaseline: "top"};
				let isFirst = true;
				for (let year = START_YEAR; year < 3000; year++) {
					let finished = false;
					for (let month = 0; month < 12; month += monthStep) {
						const paddedMonth = String(month + 1).padStart(2, "0");
						const unix = Date.parse(`${year}-${paddedMonth}-01T00:00:00`) / 1000;
						if (xMin < unix && unix < xMax) {
							const x = panelWidth * ratio(unix, xMin, xMax);
							addLabel(MONTH_NAMES[month] ?? "", OFFSET_X + x, OFFSET_Y + panelHeight + 2, axisLabel);
							if (month === 0 || isFirst) {
								addLabel(String(year), OFFSET_X + x, OFFSET_Y + panelHeight + 15, axisLabel);
								isFirst = false;
							}
							border.graphics.mt(x, 0).lt(x, panelHeight);
						}
						if (unix > xMax) {
							finished = true;
							break;
						}
					}
					if (finished) break;
				}
				border.graphics.s("#888").ss(1.5).rr(0, 0, panelWidth, panelHeight, 2);
			};
			const middle = OFFSET_Y + statusHeight / 2;
			const border = newShape(stageStatus);
			const ratingText = newText(stageStatus, OFFSET_X + 75, middle, "48px 'Squada One'");
			const performanceText = newText(stageStatus, OFFSET_X + 75, middle + 25, "16px 'Squada One'");
			const placeText = newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 2.7, "16px Lato");
			const diffText = newText(stageStatus, OFFSET_X + 160, OFFSET_Y + statusHeight / 1.5, "11px Lato");
			const dateText = newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 4, "14px Lato");
			const contestText = newText(stageStatus, OFFSET_X + 200, OFFSET_Y + statusHeight / 1.6, "20px Lato");
			const contestWidth = statusWidth - 200 - 10;
			let standingsUrl = "";
			diffText.color = "#888";
			dateText.textAlign = contestText.textAlign = "left";
			contestText.maxWidth = contestWidth;
			const contestHitArea = new cj.Shape();
			contestHitArea.graphics.f("#000").r(0, -12, contestWidth, 24);
			contestText.hitArea = contestHitArea;
			contestText.cursor = "pointer";
			contestText.addEventListener("click", () => {
				location.href = standingsUrl;
			});
			const particles = Array.from({length: PARTICLE_MAX}, () => {
				const text = newText(stageStatus, 0, 0, "64px Lato");
				text.visible = false;
				return {text, vx: 0, vy: 0, rotationSpeed: 0, life: 0};
			});
			const burstParticles = (rating, color, alpha) => {
				const progress = tierProgress(ratingScale, rating);
				const active = Math.floor(progress ** 2 * (PARTICLE_MAX - PARTICLE_MIN) + PARTICLE_MIN);
				particles.forEach((particle, index) => {
					const isActive = index < active;
					particle.text.visible = isActive;
					particle.life = isActive ? PARTICLE_LIFE : 0;
					if (!isActive) return;
					const angle = Math.random() * Math.PI * 2;
					const speed = Math.random() * 4 + 4;
					particle.vx = Math.cos(angle) * speed;
					particle.vy = Math.sin(angle) * speed;
					particle.rotationSpeed = Math.random() * 20 + 10;
					Object.assign(particle.text, {
						x: ratingText.x,
						y: ratingText.y,
						color,
						text: rating >= ratingScale.crownMin ? "★" : "@",
						alpha,
					});
				});
			};
			const updateStatus = (index, withParticles) => {
				const entry = history[index];
				if (!entry) return;
				const {color, alpha} = tierOf(ratingScale, entry.NewRating);
				border.graphics.c().s(color).ss(1).rr(OFFSET_X, OFFSET_Y, statusWidth, statusHeight, 2);
				ratingText.text = entry.NewRating;
				ratingText.color = color;
				performanceText.text = showPerformance ? `perf: ${performances[index] ?? "-"}` : "";
				placeText.text = ordinal(entry.Place);
				diffText.text = signed(entry.NewRating - entry.OldRating);
				dateText.text = new Date(entry.EndTime * 1000).toLocaleDateString();
				contestText.text = entry.ContestName;
				standingsUrl = entry.StandingsUrl;
				if (withParticles) burstParticles(entry.NewRating, color, alpha);
				stageGraph.update();
			};
			const drawSeries = (values, style) => {
				const {lineColor, highestLabel, radius, highestVertex} = style;
				const container = new cj.Container();
				stageGraph.addChild(container);
				container.shadow = new cj.Shadow("rgba(0,0,0,0.3)", 1, 2, 3);
				const line = newShape(container);
				const highestShape = newShape(container);
				const highestIndex = values.indexOf(Math.max(...values));
				const emphasizeOnHover = (target, vertex, index) => {
					target.addEventListener("mouseover", () => {
						vertex.scaleX = vertex.scaleY = 1.2;
						stageGraph.update();
						updateStatus(index, true);
					});
					target.addEventListener("mouseout", () => {
						vertex.scaleX = vertex.scaleY = 1;
						stageGraph.update();
					});
				};
				const vertices = values.map((value, index) => {
					const isHighest = index === highestIndex;
					const vertex = newShape(container);
					vertex.graphics.beginStroke(isHighest ? "#000" : "#FFF");
					vertex.graphics.setStrokeStyle((isHighest && highestVertex?.strokeWidth) || VERTEX_STROKE_WIDTH);
					vertex.graphics.beginFill(tierOf(ratingScale, value).color);
					vertex.graphics.dc(0, 0, (isHighest && highestVertex?.radius) || radius);
					vertex.x = pointX(history[index]?.EndTime ?? 0);
					vertex.y = pointY(value);
					const hitArea = new cj.Shape();
					hitArea.graphics.f("#000").dc(1.5, 1.5, 6);
					vertex.hitArea = hitArea;
					emphasizeOnHover(vertex, vertex, index);
					return vertex;
				});
				const highest = vertices[highestIndex];
				const first = vertices[0];
				if (!highest || !first) return;
				const x = highest.x + ((xMin + xMax) / 2 < (history[highestIndex]?.EndTime ?? 0) ? -80 : 80);
				const y = highest.y - 16;
				highestShape.graphics.s("#FFF").mt(highest.x, highest.y).lt(x, y);
				const [boxX, boxY] = [x - HIGHEST_WIDTH / 2, y - HIGHEST_HEIGHT / 2];
				highestShape.graphics.s("#888").f("#FFF").rr(boxX, boxY, HIGHEST_WIDTH, HIGHEST_HEIGHT, 2);
				newText(stageGraph, x, y, LABEL_FONT).text = `${highestLabel}: ${values[highestIndex]}`;
				emphasizeOnHover(highestShape, highest, highestIndex);
				line.graphics.s("#AAA").ss(2).mt(first.x, first.y);
				for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
				line.graphics.s(lineColor).ss(0.5).mt(first.x, first.y);
				for (const vertex of vertices) line.graphics.lt(vertex.x, vertex.y);
			};
			const onTick = () => {
				for (const particle of particles) {
					const {text} = particle;
					if (particle.life <= 0) {
						text.visible = false;
						continue;
					}
					text.x += particle.vx;
					particle.vx *= 0.9;
					text.y += particle.vy;
					particle.vy *= 0.9;
					particle.life--;
					text.scaleX = text.scaleY = particle.life / PARTICLE_LIFE;
					text.rotation += particle.rotationSpeed;
				}
				stageStatus.update();
			};
			drawBackground();
			drawSeries(
				history.map((entry) => entry.NewRating),
				{
					lineColor: "#000",
					highestLabel: "Highest(Rate)",
					radius: 3.5,
				},
			);
			if (showPerformance && performances.length > 0) {
				drawSeries(performances, {
					lineColor: "#F00",
					highestLabel: "Highest(Perf)",
					radius: 2.8,
					highestVertex: {radius: 2.5, strokeWidth: 1},
				});
			}
			updateStatus(count - 1, false);
			stageGraph.update();
			stageStatus.update();
			cj.Ticker.removeAllEventListeners("tick");
			cj.Ticker.setFPS(60);
			cj.Ticker.addEventListener("tick", onTick);
		}
	}

	// CpToolkit/src/adapters/judges/languages.ts
	function toLanguage({value, text}) {
		const label = text.trim();
		return {id: value, label, family: resolveFamily(languageCatalog, label)};
	}

	function languagesOf(select) {
		return [...(select?.options ?? [])].filter(({value}) => value !== "").map(toLanguage);
	}

	function selectedLanguageOf(select) {
		const option = select?.selectedOptions[0];
		return option?.value ? toLanguage(option) : null;
	}

	// CpToolkit/src/adapters/judges/site-base.ts
	class JudgeSiteBase {
		bridge;

		constructor(bridge) {
			this.bridge = bridge;
		}

		taskUri() {
			return location.href;
		}

		languages() {
			return languagesOf(this.languageSelect);
		}

		language() {
			return selectedLanguageOf(this.languageSelect);
		}

		selectLanguage(id) {
			const select = this.languageSelect;
			if (!select) return;
			select.value = id;
			this.bridge.triggerChange(select);
		}

		onLanguageChange(listener) {
			if (this.languageSelect) this.bridge.onChange(this.languageSelect, listener);
		}

		onSourceChange(_listener) {
		}
	}

	// CpToolkit/src/adapters/judges/atcoder.ts
	function sample(index, input, output, anchor) {
		return {
			title: `Sample ${index + 1}`,
			input: input.textContent ?? "",
			output: output.textContent ?? "",
			anchors: [anchor],
		};
	}

	function parseSamplesIn(root) {
		const samples = [];
		const nodes = [...root.querySelectorAll("h1,h2,h3,h4,h5,h6,pre")];
		let input;
		for (const [index, node] of nodes.entries()) {
			if (node.tagName === "PRE") continue;
			const title = node.cloneNode(true);
			for (const control of title.querySelectorAll("button,.btn-copy,.cp-title-control")) control.remove();
			const heading = atCoderSampleHeading(title.textContent ?? "");
			if (!heading) continue;
			const pre = nodes[index + 1];
			if (pre?.tagName !== "PRE") return null;
			if (heading.input) {
				if (input) return null;
				input = {
					pre,
					anchor: node.closest(".part, .section")?.querySelector(".btn-copy") ?? node,
					number: heading.number,
				};
			} else {
				if (!input || input.number !== heading.number) return null;
				samples.push(sample(samples.length, input.pre, pre, input.anchor));
				input = undefined;
			}
		}
		if (input) return null;
		if (samples.length) return samples;
		for (const {selector, container, insideIoStyle} of atcoderSampleSelectors) {
			const elements = [...root.querySelectorAll(selector)].filter((element) => {
				if (insideIoStyle) return element.childElementCount === 0;
				return !element.closest(".io-style") && !element.querySelector("var");
			});
			if (elements.length === 0) continue;
			if (elements.length % 2 !== 0) return null;
			for (let i = 0; i < elements.length; i += 2) {
				const pre = elements[i];
				const parent = pre.closest(container) ?? pre.parentElement;
				samples.push(
					sample(
						samples.length,
						pre,
						elements[i + 1],
						parent?.querySelector(".btn-copy") ?? parent?.querySelector("h1,h2,h3,h4,h5,h6") ?? pre,
					),
				);
			}
			break;
		}
		return samples;
	}

	function parseSamples(page) {
		const statement = page.getElementById("task-statement");
		if (!statement) return [];
		const languages = [...statement.querySelectorAll(".lang > .lang-ja, .lang > .lang-en")];
		const translations = [];
		for (const root of languages.length ? languages : [statement]) {
			const samples = parseSamplesIn(root);
			if (!samples) return [];
			translations.push(samples);
		}
		const [first = [], ...others] = translations.sort((a, b) => b.length - a.length);
		return first.map((sample, index) => ({
			...sample,
			anchors: [
				...sample.anchors,
				...others.flatMap((samples) => {
					const other = samples[index];
					return other?.input === sample.input && other.output === sample.output ? other.anchors : [];
				}),
			],
		}));
	}

	class AtCoderSite extends JudgeSiteBase {
		id = "atcoder";
		samplesByTask = new Map();
		site;

		constructor(bridge, site) {
			super(bridge);
			this.site = site;
		}

		get mounts() {
			return {
				testButtons: document.querySelector("#submit")?.parentElement ?? null,
				sideButtons: document.querySelector(".editor-buttons"),
				results: document.querySelector(".form-code-submit"),
			};
		}

		get languageSelect() {
			return document.querySelector("#select-lang select.current");
		}

		get taskSelect() {
			return document.querySelector("#select-task");
		}

		taskUri() {
			const task = this.taskSelect?.value;
			if (!task) return `${location.origin}${location.pathname}`;
			return `${location.origin}/contests/${pageGlobals().contestScreenName}/tasks/${task}`;
		}

		onLanguageChange(listener) {
			for (const select of document.querySelectorAll("#select-lang select"))
				this.bridge.onChange(select, listener);
		}

		onSourceChange(listener) {
			const element = document.querySelector("#editor");
			const ace = pageGlobals().ace;
			if (ace && element) ace.edit(element).getSession().on("change", listener);
		}

		sourceCode() {
			const page = pageGlobals();
			const element = document.querySelector("#editor");
			if (!page.ace || !element) return page.getSourceCode?.() ?? "";
			const isPlainText = document.querySelector(".btn-toggle-editor")?.classList.contains("active");
			if (isPlainText) return document.querySelector("#plain-textarea")?.value ?? "";
			return page.ace.edit(element).getValue();
		}

		setSourceCode(code) {
			const element = document.querySelector("#editor");
			if (element) pageGlobals().ace?.edit(element).setValue(code, -1);
			const textarea = document.querySelector("#plain-textarea");
			if (textarea) textarea.value = code;
		}

		submit() {
			document.querySelector("#submit")?.click();
		}

		samples() {
			const taskUri = this.taskUri();
			const cached = this.samplesByTask.get(taskUri);
			if (cached) return cached;
			const isTaskPage = /^\/contests\/[^/]+\/tasks\//.test(location.pathname);
			const samples = isTaskPage ? Promise.resolve(parseSamples(document)) : this.fetchSamples(taskUri);
			this.samplesByTask.set(taskUri, samples);
			const forget = () => this.samplesByTask.delete(taskUri);
			samples.then((result) => {
				if (!result.length) forget();
			}, forget);
			return samples;
		}

		async fetchSamples(taskUri) {
			const response = await this.site.send({url: taskUri});
			if (response.status !== 200) throw new Error(`Failed to fetch ${taskUri}: ${response.status}`);
			const samples = parseSamples(new DOMParser().parseFromString(response.text, "text/html"));
			return samples.map((sample) => ({...sample, anchors: []}));
		}
	}

	// CpToolkit/src/adapters/judges/codeforces.ts
	var CODEFORCES_LANGUAGE_SELECT = "select[name='programTypeId']";

	function readSampleBlock(pre) {
		const lines = pre.querySelectorAll(".test-example-line");
		if (lines.length > 0)
			return [...lines].map((line) => line.textContent ?? "").join(`
`);
		return [...pre.childNodes]
			.map((node) => {
				const isLineBreak = node instanceof HTMLElement && (node.tagName === "DIV" || node.tagName === "BR");
				return (
					(node.textContent ?? "") +
					(isLineBreak
						? `
`
						: "")
				);
			})
			.join("");
	}

	function readCodeforcesSamples(root = document, mobile = false) {
		const pre = mobile ? "pre.content" : "pre";
		const samples = [];
		for (const block of root.querySelectorAll(".sample-test")) {
			const inputs = block.querySelectorAll(".input");
			const outputs = block.querySelectorAll(".output");
			if (!inputs.length || inputs.length !== outputs.length) return [];
			for (const [index, section] of inputs.entries()) {
				const input = section.querySelector(pre);
				const output = outputs[index]?.querySelector(pre);
				if (!input || !output) return [];
				const anchor = mobile
					? (section.querySelector(".title") ?? block)
					: section.querySelector(".title .input-output-copier");
				samples.push({
					title: `Sample ${samples.length + 1}`,
					input: mobile ? (input.textContent ?? "") : readSampleBlock(input),
					output: mobile ? (output.textContent ?? "") : readSampleBlock(output),
					anchors: anchor ? [anchor] : [],
				});
			}
		}
		return samples;
	}

	class CodeforcesSite extends JudgeSiteBase {
		id = "codeforces";
		buttons = document.createElement("span");
		textarea = document.createElement("textarea");

		constructor(bridge) {
			super(bridge);
			this.textarea.dataset.cpEasyTestSource = "";
			Object.assign(this.textarea.style, {fontFamily: "monospace", width: "100%", minHeight: "5em"});
			document.querySelector(".submitForm")?.append(this.buttons);
			if (!this.fastSubmitEditor) document.getElementById("pageContent")?.append(this.textarea);
			const input = this.fileInput;
			if (input) {
				this.textarea.addEventListener("input", () => this.attachFile(this.textarea.value, input));
				input.addEventListener("change", () => {
					const file = input.files?.[0];
					this.textarea.value = "";
					if (file)
						file.text()
							.then((text) => {
								if (input.files?.[0] === file) this.textarea.value = text;
							})
							.catch(() => {
								return;
							});
				});
			}
		}

		get mounts() {
			return {
				testButtons: this.buttons,
				sideButtons: this.buttons,
				results: document.getElementById("pageContent"),
			};
		}

		get languageSelect() {
			return document.querySelector(CODEFORCES_LANGUAGE_SELECT);
		}

		get fileInput() {
			return document.querySelector('.submitForm input[name="sourceFile"]');
		}

		get fastSubmitEditor() {
			const element = document.getElementById("editor");
			return element ? pageGlobals().ace?.edit(element) : undefined;
		}

		sourceCode() {
			return this.fastSubmitEditor?.getValue() ?? this.textarea.value;
		}

		setSourceCode(code) {
			this.textarea.value = code;
			this.fastSubmitEditor?.setValue(code);
			const input = this.fileInput;
			if (input) this.attachFile(code, input);
		}

		attachFile(code, input) {
			const files = new DataTransfer();
			if (code) files.items.add(new File([code], "prog.txt", {type: "text/plain"}));
			input.files = files.files;
		}

		submit() {
			this.setSourceCode(this.sourceCode());
			document.querySelector(".submitForm .submit")?.click();
		}

		async samples() {
			return readCodeforcesSamples();
		}
	}

	class CodeforcesMobileSite extends JudgeSiteBase {
		id = "codeforces";
		main;
		form;

		constructor(bridge, main, form) {
			super(bridge);
			this.main = main;
			this.form = form;
		}

		get mounts() {
			return {testButtons: this.main, sideButtons: this.main, results: this.main};
		}

		get languageSelect() {
			return this.form.elements.namedItem("programTypeId");
		}

		get source() {
			return this.form.elements.namedItem("source");
		}

		static async create(bridge) {
			const main = document.querySelector("main");
			const url = /\/contest\/(\d+)\/problem\/([^/]+)/.exec(location.pathname);
			if (!main || !url) return null;
			const frame = document.createElement("iframe");
			frame.src = `/contest/${url[1]}/submit`;
			frame.style.display = "none";
			const loaded = await new Promise((resolve) => {
				const timer = setTimeout(() => resolve(false), 1e4);
				frame.addEventListener(
					"load",
					() => {
						clearTimeout(timer);
						resolve(true);
					},
					{once: true},
				);
				frame.addEventListener(
					"error",
					() => {
						clearTimeout(timer);
						resolve(false);
					},
					{once: true},
				);
				document.body.append(frame);
			});
			const form = loaded && frame.contentDocument?.querySelector("._SubmitPage_submitForm");
			if (!form) {
				frame.remove();
				return null;
			}
			const problem = form.elements.namedItem("problemIndex");
			if (problem) {
				problem.value = url[2] ?? "";
				problem.readOnly = true;
			}
			main.append(form);
			return new CodeforcesMobileSite(bridge, main, form);
		}

		sourceCode() {
			return this.source?.value ?? "";
		}

		setSourceCode(code) {
			if (this.source) this.source.value = code;
		}

		submit() {
			this.form.requestSubmit();
		}

		async samples() {
			return readCodeforcesSamples(document, true);
		}
	}

	// CpToolkit/src/adapters/judges/yukicoder.ts
	var EDITOR_CONTENT = ".cm-source-editor .cm-content";

	class YukicoderSite extends JudgeSiteBase {
		id = "yukicoder";

		constructor(bridge) {
			super(bridge);
		}

		get mounts() {
			return {
				testButtons: document.querySelector("#submit_form"),
				sideButtons: document.querySelector("#toggle_source_editor")?.parentElement ?? null,
				results: document.querySelector("#content"),
			};
		}

		get languageSelect() {
			return document.querySelector("#lang");
		}

		get textarea() {
			return document.querySelector("#source");
		}

		get editor() {
			const content = pageGlobals().document?.querySelector(EDITOR_CONTENT);
			return content?.cmTile?.view ?? null;
		}

		onSourceChange(listener) {
			const watch = () => {
				const content = document.querySelector(EDITOR_CONTENT);
				if (!content) return false;
				new MutationObserver(listener).observe(content, {childList: true, subtree: true, characterData: true});
				return true;
			};
			const host = document.querySelector("#rich_source")?.parentElement;
			if (watch() || !host) return;
			const waiting = new MutationObserver(() => {
				if (watch()) waiting.disconnect();
			});
			waiting.observe(host, {childList: true, subtree: true});
		}

		sourceCode() {
			const textarea = this.textarea;
			if (textarea && textarea.offsetParent !== null) return textarea.value;
			return this.editor?.state.doc.toString() ?? "";
		}

		setSourceCode(code) {
			if (this.textarea) this.textarea.value = code;
			const editor = this.editor;
			editor?.dispatch({changes: {from: 0, to: editor.state.doc.length, insert: code}});
		}

		submit() {
			document.querySelector('#submit_form input[type="submit"]')?.click();
		}

		async samples() {
			const samples = [];
			for (const sample of document.querySelectorAll(".sample")) {
				const [input, output] = sample.querySelectorAll("pre");
				if (!input || !output) return [];
				samples.push({
					title: `Sample ${samples.length + 1}`,
					input: input.textContent ?? "",
					output: output.textContent ?? "",
					anchors: [sample.querySelector(".copy-sample-input") ?? sample],
				});
			}
			return samples;
		}
	}

	// CpToolkit/src/adapters/judges/index.ts
	var CODEFORCES_MOBILE_HOST = /^m[1-3]\.codeforces\.com$/;

	async function createJudgeSite(judgeId, bridge, site) {
		switch (judgeId) {
			case "atcoder":
				return new AtCoderSite(bridge, site);
			case "yukicoder":
				return new YukicoderSite(bridge);
			case "codeforces":
				if (CODEFORCES_MOBILE_HOST.test(location.host)) return CodeforcesMobileSite.create(bridge);
				return new CodeforcesSite(bridge);
			default:
				return null;
		}
	}

	async function readPageSamples(judgeId, judgeSite) {
		if (judgeId === "codeforces") {
			return readCodeforcesSamples(document, CODEFORCES_MOBILE_HOST.test(location.host));
		}
		const site = await judgeSite();
		return site ? await site.samples() : [];
	}

	// CpToolkit/src/adapters/page/contest-tasks.ts
	function parseAtCoderTaskPage(html) {
		const page = new DOMParser().parseFromString(html, "text/html");
		return [...page.querySelectorAll("#contest-nav-tabs + .col-sm-12 tbody tr")].flatMap((row) => {
			const [labelCell, nameCell] = row.querySelectorAll("td");
			const link = labelCell?.querySelector("a");
			const url = link?.getAttribute("href");
			if (!link || !url) return [];
			return [{url, label: link.textContent ?? "", name: nameCell?.textContent?.trim() ?? ""}];
		});
	}

	function parseCodeforcesContestPage(html) {
		const page = new DOMParser().parseFromString(html, "text/html");
		return [...page.querySelectorAll("table.problems tr")].flatMap((row) => {
			const link = row.querySelector("td.id a");
			const url = link?.getAttribute("href");
			if (!link || !url) return [];
			const name = row.querySelectorAll("td")[1]?.querySelector("a")?.textContent?.trim() ?? "";
			return [{url, label: link.textContent?.trim() ?? "", name}];
		});
	}

	// CpToolkit/src/adapters/page/code-editors.ts
	var EDITOR_FAMILIES = {
		python: "python3",
		csharp: "csharp",
		sh: "bash",
		shell: "bash",
		golang: "go",
		kotlin: "kotlin",
		java: "java",
		cpp: "cpp",
		c: "c",
		javascript: "javascript",
		typescript: "typescript",
		rust: "rust",
		ruby: "ruby",
		php: "php",
		swift: "swift",
		scala: "scala",
		haskell: "haskell",
		ocaml: "ocaml",
	};
	var DEFAULT_TIMEOUT_MS = 30000;
	var MIN_PASTED_LENGTH = 30;

	class AceCodeEditor {
		editor;

		constructor(editor) {
			this.editor = editor;
		}

		getValue() {
			return this.editor.getValue();
		}

		setValue(value) {
			this.editor.getSession().setValue(value);
		}

		isJava() {
			return this.languageFamily() === "java";
		}

		languageFamily() {
			const mode = this.editor.getSession().getMode().$id?.split("/").at(-1) ?? "";
			return EDITOR_FAMILIES[mode] ?? null;
		}

		commentFamily() {
			return this.editor.getSession().getMode().$id === "ace/mode/c_cpp" ? "cpp" : this.languageFamily();
		}

		identity() {
			return this.editor.getSession();
		}

		onLanguageChange(listener) {
			this.editor.getSession().on("changeMode", listener);
		}

		isReadOnly() {
			return this.editor.getReadOnly();
		}

		setWritable() {
			this.editor.setReadOnly(false);
		}

		onPaste(listener) {
			this.editor.on("paste", ({text}) => listener(text, sleep(0)));
		}

		onChange(listener) {
			this.editor.getSession().on("change", listener);
		}

		foldTopLevel() {
			const session = this.editor.getSession();
			const rows = session.getLength();
			for (let row = 0; row < rows; row++) {
				if (session.getFoldWidget(row) !== "start") continue;
				const range = session.getFoldWidgetRange(row);
				if (!range || range.end.row <= row) continue;
				try {
					session.addFold("...", range);
				} catch {
				}
				row = range.end.row;
			}
		}

		foldAtCursor() {
			const session = this.editor.getSession();
			const row = this.editor.getCursorPosition().row;
			const folded = new Set(session.getAllFolds().map((fold) => fold.start.row));
			for (let start = row; start >= 0; start--) {
				if (folded.has(start) || session.getFoldWidget(start) !== "start") continue;
				const range = session.getFoldWidgetRange(start);
				if (!range || range.end.row < row) continue;
				try {
					session.addFold("...", range);
					break;
				} catch {
				}
			}
			return true;
		}

		unfoldAtCursor() {
			const session = this.editor.getSession();
			const row = this.editor.getCursorPosition().row;
			const folds = session.getAllFolds().filter((fold) => fold.start.row <= row && row <= fold.end.row);
			const innermost = folds.reduce(
				(inner, fold) => (!inner || fold.start.row > inner.start.row ? fold : inner),
				null,
			);
			if (innermost) session.expandFold(innermost);
			return true;
		}
	}

	class MonacoCodeEditor {
		editor;

		constructor(editor) {
			this.editor = editor;
		}

		get model() {
			const model = this.editor.getModel();
			if (!model) throw new Error("Monaco model is not available.");
			return model;
		}

		getValue() {
			return this.model.getValue();
		}

		setValue(value) {
			this.model.setValue(value);
		}

		isJava() {
			return this.model.getLanguageId() === "java";
		}

		languageFamily() {
			return EDITOR_FAMILIES[this.model.getLanguageId()] ?? null;
		}

		isReadOnly() {
			return this.editor.getRawOptions?.().readOnly ?? false;
		}

		identity() {
			return this.editor.getModel();
		}

		onLanguageChange(listener) {
			this.editor.onDidChangeModelLanguage?.(listener);
		}

		setWritable() {
		}

		onPaste(listener) {
			try {
				this.editor.onDidPaste(({range}) => listener(this.model.getValueInRange(range)));
			} catch {
				this.model.onDidChangeContent(({isFlush, changes}) => {
					const text = changes[0]?.text ?? "";
					if (!isFlush && changes.length === 1 && text.length >= MIN_PASTED_LENGTH) listener(text);
				});
			}
		}

		onChange(listener) {
			this.model.onDidChangeContent(listener);
		}

		foldTopLevel() {
			this.runAction("editor.foldLevel1");
		}

		foldAtCursor() {
			return this.runAction("editor.fold");
		}

		unfoldAtCursor() {
			return this.runAction("editor.unfold");
		}

		runAction(id) {
			const action = this.editor.getAction(id);
			if (!action) return false;
			action.run().catch(() => {
				return;
			});
			return true;
		}
	}

	function richEditor(target) {
		const page = pageGlobals();
		if (target.editor === "monaco") {
			const writable = (page.monaco?.editor.getEditors() ?? []).filter(
				(editor) => editor.getModel() && !editor.getRawOptions?.().readOnly,
			);
			const editor =
				writable.find((candidate) => candidate.getDomNode?.()?.closest("form")) ??
				(writable.length === 1 ? writable[0] : null);
			return editor?.getModel() ? new MonacoCodeEditor(editor) : null;
		}
		const element = target.editorElements
			.map((selector) => document.querySelector(selector))
			.find((found) => found);
		if (target.editor === "codemirror") {
			const content = page.document?.querySelector(target.editorElements.join(","));
			const view = content?.cmTile?.view;
			return view ? new NativeSourceEditor(content, view) : null;
		}
		if (!page.ace || !element) return null;
		try {
			return new AceCodeEditor(page.ace.edit(element));
		} catch {
			return null;
		}
	}

	class NativeSourceEditor {
		constructor(element, view) {
			this.element = element;
			this.view = view;
		}

		element;
		view;

		getValue() {
			return this.view?.state.doc.toString() ?? this.element.value;
		}

		setValue(value) {
			if (this.view) this.view.dispatch({changes: {from: 0, to: this.view.state.doc.length, insert: value}});
			else {
				this.element.value = value;
				this.element.dispatchEvent(new Event("input", {bubbles: true}));
			}
		}

		isJava() {
			return false;
		}

		identity() {
			return this.view ?? this.element;
		}

		isReadOnly() {
			return this.element instanceof HTMLTextAreaElement && (this.element.readOnly || this.element.disabled);
		}

		setWritable() {
			if (this.element instanceof HTMLTextAreaElement) this.element.readOnly = false;
		}

		foldTopLevel() {
		}

		onChange(listener) {
			this.element.addEventListener("input", listener);
		}

		onPaste(listener) {
			this.element.addEventListener("paste", (event) => {
				if (event instanceof ClipboardEvent && event.clipboardData)
					listener(event.clipboardData.getData("text/plain"), sleep(0));
			});
		}
	}

	function findEditor(target) {
		if (!target.textarea) return richEditor(target);
		const textareaSelector = target.textarea;
		const selector = [...target.editorElements, textareaSelector].join(",");
		const current = () => {
			const plain = document.querySelector(textareaSelector);
			if (
				plain &&
				(plain === document.activeElement ||
					plain.offsetParent !== null ||
					document.querySelector(".btn-toggle-editor.active"))
			)
				return new NativeSourceEditor(plain);
			return richEditor(target) ?? (plain && new NativeSourceEditor(plain));
		};
		if (!current()) return null;
		return {
			getValue: () => current()?.getValue() ?? "",
			setValue: (value) => current()?.setValue(value),
			isJava: () => current()?.isJava() ?? false,
			languageFamily: () => current()?.languageFamily?.() ?? null,
			commentFamily: () => current()?.commentFamily?.() ?? null,
			identity: () => current()?.identity?.() ?? null,
			onLanguageChange: (listener) => richEditor(target)?.onLanguageChange?.(listener),
			isReadOnly: () => current()?.isReadOnly() ?? true,
			setWritable: () => current()?.setWritable(),
			foldTopLevel: () => current()?.foldTopLevel(),
			foldAtCursor: () => current()?.foldAtCursor?.() ?? false,
			unfoldAtCursor: () => current()?.unfoldAtCursor?.() ?? false,
			onChange: (listener) => current()?.onChange(listener),
			onPaste(listener) {
				document.addEventListener(
					"paste",
					(event) => {
						if (event.target instanceof Element && event.target.closest(selector) && event.clipboardData) {
							listener(event.clipboardData.getData("text/plain"), sleep(0));
						}
					},
					true,
				);
			},
		};
	}

	class PageCodeEditorLocator {
		lookups = new Map();

		locate(target, {timeoutMs = DEFAULT_TIMEOUT_MS, delayMs = 0} = {}) {
			const key = JSON.stringify([target, timeoutMs, delayMs]);
			const shared = this.lookups.get(key);
			if (shared) return shared;
			const pending = this.search(target, timeoutMs, delayMs);
			this.lookups.set(key, pending);
			pending.then((editor) => {
				if (!editor) this.lookups.delete(key);
			});
			return pending;
		}

		async search(target, timeoutMs, delayMs) {
			if (delayMs > 0) await sleep(delayMs);
			const editor = findEditor(target);
			if (editor) return editor;
			const {promise, resolve} = Promise.withResolvers();
			const observer = new MutationObserver(() => {
				const found = findEditor(target);
				if (found) resolve(found);
			});
			observer.observe(document.body, {childList: true, subtree: true});
			const timer = setTimeout(() => resolve(null), timeoutMs);
			const found = await promise;
			observer.disconnect();
			clearTimeout(timer);
			return found;
		}
	}

	// CpToolkit/src/adapters/page/submission-form.ts
	function findSubmitButton({submitButtons, labeledSubmit}) {
		for (const selector of submitButtons) {
			const button = document.querySelector(selector);
			if (button) return button;
		}
		if (!labeledSubmit) return null;
		const candidates = [...document.querySelectorAll(labeledSubmit.selector)];
		for (const label of labeledSubmit.labels) {
			const button = candidates.find((candidate) => {
				const text = candidate instanceof HTMLInputElement ? candidate.value : candidate.textContent;
				return text?.trim().toLowerCase().includes(label);
			});
			if (button) return button;
		}
		return null;
	}

	function codeforcesTaskUri(selected) {
		if (!/^[a-z]\d*$/i.test(selected)) return null;
		const contest = /^(.*\/(?:contest|gym)\/\d+)\/submit\/?$/.exec(location.pathname);
		return contest ? `${location.origin}${contest[1]}/problem/${selected}` : null;
	}

	async function createSubmissionForm(target, {judgeId, bridge, judgeSite}) {
		const site = judgeId === "atcoder" || judgeId === "yukicoder" ? await judgeSite() : null;
		const codeforcesLanguage = () => {
			return judgeId === "codeforces" ? document.querySelector(CODEFORCES_LANGUAGE_SELECT) : null;
		};
		const taskControl = () => (target.taskSelect ? document.querySelector(target.taskSelect) : null);
		const task = () => {
			if (site) return site.taskUri();
			const selected = taskControl()?.value;
			if (!selected) return location.href;
			return (
				(judgeId === "codeforces" ? codeforcesTaskUri(selected) : null) ??
				`${location.href.split("#")[0]}#${encodeURIComponent(selected)}`
			);
		};
		const language = (editor) => {
			if (site) return site.language();
			const select = codeforcesLanguage();
			if (select) return selectedLanguageOf(select);
			const family = editor.languageFamily?.() ?? (editor.isJava() ? "java" : null);
			return family ? {id: family, label: family, family} : null;
		};
		let changes = 0;
		const listeners = new Set();
		const observed = new WeakSet();
		const changed = () => {
			changes++;
			for (const listener of listeners) listener();
		};
		window.addEventListener("popstate", changed);
		window.addEventListener("hashchange", changed);
		site?.onLanguageChange(changed);
		for (const element of [
			codeforcesLanguage(),
			...(target.taskSelect ? document.querySelectorAll(target.taskSelect) : []),
		]) {
			if (element) bridge.onChange(element, changed);
		}
		let holding = false;
		return {
			task,
			language,
			contextKey(editor) {
				const selected = language(editor);
				return JSON.stringify([changes, task(), selected?.id, selected?.family]);
			},
			observe(editor, listener) {
				if (listener) listeners.add(listener);
				if (!site && !codeforcesLanguage() && !observed.has(editor)) {
					observed.add(editor);
					editor.onLanguageChange?.(changed);
				}
			},
			submitButton: () => findSubmitButton(target),
			holdSubmitWhile(work, onCanceled) {
				if (holding) return;
				holding = true;
				let waiting = false;
				const defer = (event, resume) => {
					event.preventDefault();
					event.stopImmediatePropagation();
					if (waiting) return;
					waiting = true;
					work.settled().then((success) => {
						waiting = false;
						if (success) resume();
						else onCanceled();
					});
				};
				document.addEventListener(
					"click",
					(event) => {
						if (!work.busy || !(event.target instanceof Element)) return;
						const button = findSubmitButton(target);
						if (button?.contains(event.target))
							defer(event, () => {
								if (button.isConnected) button.click();
							});
					},
					true,
				);
				document.addEventListener(
					"submit",
					(event) => {
						if (!work.busy || !(event.target instanceof HTMLFormElement)) return;
						const form = event.target;
						if (findSubmitButton(target)?.closest("form") !== form) return;
						const submitter = event.submitter;
						defer(event, () => {
							if (form.isConnected && (!submitter || submitter.isConnected))
								form.requestSubmit(submitter);
						});
					},
					true,
				);
			},
		};
	}

	// CpToolkit/src/adapters/page/element-script-loader.ts
	function waitForLoad(element, url) {
		return new Promise((resolve, reject) => {
			element.addEventListener("load", () => resolve(), {once: true});
			element.addEventListener("error", () => reject(new Error(`Failed to load ${url}`)), {once: true});
			document.head.append(element);
		});
	}

	class ElementScriptLoader {
		loadScript({url, integrity}) {
			const script = Object.assign(document.createElement("script"), {
				src: url,
				integrity,
				crossOrigin: "anonymous",
			});
			return waitForLoad(script, url);
		}

		loadStylesheet({url, integrity}) {
			const link = Object.assign(document.createElement("link"), {
				rel: "stylesheet",
				href: url,
				integrity,
				crossOrigin: "anonymous",
			});
			return waitForLoad(link, url);
		}
	}

	// CpToolkit/src/adapters/page/locale.ts
	function detectLocale() {
		const meta = document.querySelector('meta[http-equiv="Content-Language"]');
		return (meta?.content || navigator.language).startsWith("ja") ? "ja" : "en";
	}

	// CpToolkit/src/adapters/page/page-bridge.ts
	var MATH_OPTIONS = {
		delimiters: [
			{left: "$$", right: "$$", display: true},
			{left: "$", right: "$", display: false},
			{left: "\\(", right: "\\)", display: false},
			{left: "\\[", right: "\\]", display: true},
		],
		ignoredTags: ["script", "noscript", "style", "textarea", "code", "option"],
		ignoredClasses: ["prettyprint", "source-code-for-copy"],
		throwOnError: false,
	};

	function toElement(target) {
		if (target instanceof Element) return target;
		throw new TypeError("A page element is required.");
	}

	class UnsafeWindowPageBridge {
		onChange(element, listener) {
			const jQuery = pageGlobals().jQuery;
			if (jQuery) jQuery(element).on("change", listener);
			else toElement(element).addEventListener("change", listener);
		}

		triggerChange(element) {
			const target = toElement(element);
			target.dispatchEvent(new Event("input", {bubbles: true}));
			target.dispatchEvent(new Event("change", {bubbles: true}));
			pageGlobals().jQuery?.(element).trigger("change");
		}

		renderMath(target) {
			pageGlobals().renderMathInElement?.(toElement(target), MATH_OPTIONS);
		}

		highlightCode() {
			pageGlobals().PR?.prettyPrint();
		}

		contestPeriod() {
			const {startTime, endTime} = pageGlobals();
			return startTime && endTime ? {startMs: startTime.valueOf(), endMs: endTime.valueOf()} : null;
		}

		serverNow() {
			return pageGlobals().getServerTime?.().valueOf() ?? Date.now();
		}

		isLoggedIn() {
			return Boolean(pageGlobals().userScreenName);
		}
	}

	// CpToolkit/src/adapters/page/same-origin-http-client.ts
	class SameOriginHttpClient {
		async send({url, method = "GET", headers, body}) {
			if (new URL(url, location.href).origin !== location.origin) throw new Error(`Cross-origin request: ${url}`);
			const response = await fetch(url, {
				method,
				credentials: "include",
				...(headers && {headers: {...headers}}),
				...(body !== undefined && {body}),
			});
			return {status: response.status, text: await response.text()};
		}
	}

	// CpToolkit/src/adapters/page/worker-ticker.ts
	var WORKER_SOURCE = "onmessage = ({data}) => setInterval(() => postMessage(0), data);";

	function tickOnPage(intervalMs, listener) {
		const timer = setInterval(listener, intervalMs);
		return () => clearInterval(timer);
	}

	class WorkerTicker {
		start(intervalMs, listener) {
			let stop;
			const fallBack = () => {
				stop();
				stop = tickOnPage(intervalMs, listener);
			};
			try {
				const url = URL.createObjectURL(new Blob([WORKER_SOURCE], {type: "text/javascript"}));
				const worker = new Worker(url);
				stop = () => {
					worker.terminate();
					URL.revokeObjectURL(url);
				};
				worker.onmessage = () => listener();
				worker.onerror = fallBack;
				worker.postMessage(intervalMs);
			} catch {
				stop = tickOnPage(intervalMs, listener);
			}
			return () => stop();
		}
	}

	// CpToolkit/src/adapters/runners/serial-queue.ts
	class SerialQueue {
		last = Promise.resolve();

		run(task) {
			const result = this.last.then(task);
			this.last = result.catch(() => {
				return;
			});
			return result;
		}
	}

	class CrossTabQueue {
		queue = new SerialQueue();
		lockName;

		constructor(lockName) {
			this.lockName = lockName;
		}

		run(task) {
			if (!navigator.locks) return this.queue.run(task);
			return navigator.locks.request(this.lockName, task);
		}
	}

	// CpToolkit/src/adapters/runners/atcoder-custom-test.ts
	var LOCK_NAME = "cp-toolkit:atcoder-custom-test";
	var MAX_POLLS = 300;
	var MAX_SUBMITS = 3;
	var POLL_INTERVAL_MS = 1000;

	class CustomTestQueue {
		queue = new CrossTabQueue(LOCK_NAME);
		failedGroups = new Set();
		site;

		constructor(site) {
			this.site = site;
		}

		get baseUrl() {
			return location.href.replace(/\/(tasks\/.+|submit.*)$/, "/custom_test");
		}

		run(languageId, sourceCode, input, groupId) {
			return this.queue.run(() => this.execute(languageId, sourceCode, input, groupId));
		}

		async execute(languageId, sourceCode, input, groupId) {
			if (groupId && this.failedGroups.has(groupId)) return {status: "CE", input};
			await this.submit(languageId, sourceCode, input);
			for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
				await sleep(POLL_INTERVAL_MS / 10);
				const data = await this.fetchStatus();
				const {Result: result} = data;
				if (!result || data.Interval !== undefined) {
					await sleep(data.Interval ?? POLL_INTERVAL_MS);
					continue;
				}
				const compileFailed = String(result.TimeConsumption).startsWith("-");
				const status = result.ExitCode === 0 ? "OK" : compileFailed ? "CE" : "RE";
				if (status === "CE" && groupId) this.failedGroups.add(groupId);
				return {
					status,
					exitCode: result.ExitCode,
					execTime: Number.parseInt(String(result.TimeConsumption), 10),
					memory: Number.parseInt(String(result.MemoryConsumption), 10),
					input,
					output: data.Stdout ?? "",
					error: data.Stderr ?? "",
				};
			}
			return {status: "TLE", input, error: "Test timed out"};
		}

		async submit(languageId, sourceCode, input) {
			const body = buildQueryString({
				"data.LanguageId": languageId,
				sourceCode,
				input,
				csrf_token: pageGlobals().csrfToken,
			});
			let rejection = "";
			for (let attempt = 0; attempt < MAX_SUBMITS; attempt++) {
				const {text} = await this.site.send({
					url: `${this.baseUrl}/submit/json`,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					body,
				});
				if (!text) return;
				rejection = text;
				await this.waitUntilFinished();
			}
			throw new Error(rejection);
		}

		async waitUntilFinished() {
			for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
				const {Interval: interval} = await this.fetchStatus();
				if (interval === undefined) return;
				await sleep(interval);
			}
		}

		async fetchStatus() {
			const response = await this.site.send({url: `${this.baseUrl}/json?reload=true`});
			return JSON.parse(response.text);
		}
	}

	class AtCoderRunner {
		kind = "judge";
		id;
		label;
		queue;
		language;

		constructor(queue, language) {
			this.queue = queue;
			this.language = language;
			this.id = `atcoder:${language.id}`;
			this.label = `${language.label} [AtCoder]`;
		}

		run(sourceCode, input, options) {
			return this.queue.run(this.language.id, sourceCode, input, options.runGroupId);
		}
	}

	class AtCoderRunnerProvider {
		queue;
		judge;

		constructor(site, judge) {
			this.judge = judge;
			this.queue = new CustomTestQueue(site);
		}

		async runnersFor(language) {
			const judge = await this.judge();
			if (judge?.id !== "atcoder") return [];
			const sameFamily = judge.languages().filter(({id, family}) => {
				return id === language.id || (family !== null && family === language.family);
			});
			return sameFamily.map((candidate) => new AtCoderRunner(this.queue, candidate));
		}
	}

	// CpToolkit/src/adapters/runners/pyodide.ts
	var SETUP_CODE = `
import contextlib, io, platform, sys

@contextlib.contextmanager
def __redirect_stdin(text):
  previous = sys.stdin
  sys.stdin = io.TextIOWrapper(io.BytesIO(text.encode()), encoding="utf-8")
  try:
    yield sys.stdin
  finally:
    sys.stdin = previous

# 提出のソースは書き換えずにコンパイルし、実行ごとに新しいモジュールの名前空間で動かす。
# 関数の本体へ埋め込むと、from __future__ や複数行の文字列の中身が変わってしまう。
# __code は Python 側で初期化する。JS の null は Pyodide 0.28 から None ではなく jsnull になる
def __run(source):
  global __stdout, __stderr, __code
  __code = None
  namespace = {"__name__": "__main__", "__builtins__": __builtins__}
  with __redirect_stdin(__stdin):
    with contextlib.redirect_stdout(io.StringIO()) as __stdout:
      with contextlib.redirect_stderr(io.StringIO()) as __stderr:
        try:
          exec(compile(source, "Main.py", "exec", dont_inherit=True), namespace)
        except SystemExit as e:
          __code = e.code
`;

	class PyodideRunner {
		kind = "browser";
		id = "browser:pyodide";
		label = "Python3 Pyodide [Browser]";
		pyodide = null;
		queue = new SerialQueue();
		scripts;

		constructor(scripts) {
			this.scripts = scripts;
		}

		run(sourceCode, input) {
			return this.queue.run(() => this.execute(sourceCode, input));
		}

		async load() {
			const {baseUrl, integrity} = runnerCatalog.pyodide;
			await this.scripts.loadScript({url: `${baseUrl}pyodide.js`, integrity});
			const pyodide = await pageGlobals().loadPyodide?.({indexURL: baseUrl});
			if (!pyodide) throw new Error("Pyodide was not loaded.");
			await pyodide.runPythonAsync(SETUP_CODE);
			return pyodide;
		}

		async execute(sourceCode, input) {
			const loading = (this.pyodide ??= this.load().catch((error) => {
				if (this.pyodide === loading) this.pyodide = null;
				throw error;
			}));
			const pyodide = await loading;
			pyodide.globals.set("__stdin", input);
			pyodide.globals.set("__source", sourceCode);
			const startedAt = Date.now();
			try {
				await pyodide.loadPackagesFromImports(sourceCode);
				pyodide.runPython("__run(__source)");
			} catch (error) {
				return {
					status: "RE",
					exitCode: "-1",
					input,
					error: error instanceof Error ? error.message : String(error),
				};
			}
			const exitCode = pyodide.globals.get("__code");
			return {
				status: typeof exitCode === "number" && exitCode !== 0 ? "RE" : "OK",
				exitCode: String(exitCode ?? 0),
				execTime: Date.now() - startedAt,
				input,
				output: pyodide.globals.get("__stdout").getvalue(),
				error: pyodide.globals.get("__stderr").getvalue(),
			};
		}
	}

	class PyodideRunnerProvider {
		runner;

		constructor(scripts) {
			this.runner = new PyodideRunner(scripts);
		}

		async runnersFor({family}) {
			return family === "python3" ? [this.runner] : [];
		}
	}

	// CpToolkit/src/adapters/runners/simple-runners.ts
	var PAIZA_STATUS_INTERVAL_MS = 1000;
	var PAIZA_MAX_STATUS_CHECKS = 60;

	class PaizaRunner {
		kind = "paiza";
		id;
		label;
		http;
		language;

		constructor(http, language, label) {
			this.http = http;
			this.language = language;
			this.id = `paiza:${language}`;
			this.label = `${label} [PaizaIO]`;
		}

		async run(sourceCode, input) {
			let {id, status} = await this.request(
				"create",
				{
					source_code: sourceCode,
					language: this.language,
					input,
					longpoll: "true",
					longpoll_timeout: "10",
				},
				"POST",
			);
			for (let check = 0; status === "running"; check++) {
				if (check === PAIZA_MAX_STATUS_CHECKS) throw new Error("PaizaIO timed out.");
				await sleep(PAIZA_STATUS_INTERVAL_MS);
				({status} = await this.request("get_status", {id}));
			}
			const details = await this.request("get_details", {id});
			const measured = {execTime: Number(details.time) * 1000, memory: Number(details.memory) / 1000, input};
			if (details.build_result === "failure") {
				return {
					...measured,
					status: "CE",
					exitCode: details.build_exit_code,
					output: details.build_stdout,
					error: details.build_stderr,
				};
			}
			const statusByResult = {timeout: "TLE", failure: "RE"};
			return {
				...measured,
				status: statusByResult[details.result] ?? "OK",
				exitCode: details.exit_code,
				output: details.stdout,
				error: details.stderr,
			};
		}

		async request(path, query, method = "GET") {
			const url = `${runnerCatalog.paiza.apiBase}/${path}?${buildQueryString({...query, api_key: "guest"})}`;
			const response = await this.http.send({url, method});
			return JSON.parse(response.text);
		}
	}

	class PaizaRunnerProvider {
		http;

		constructor(http) {
			this.http = http;
		}

		async runnersFor({family}) {
			return runnerCatalog.paiza.languages
				.filter((entry) => entry.family === family)
				.map(({language, label}) => new PaizaRunner(this.http, language, label));
		}
	}

	function lineOffsetOf({lineOffset}) {
		if (!lineOffset || lineOffset.transform === null) return {};
		const lines = lineOffset.header + lineOffset.transform;
		return lines === 0 ? {} : {lineOffset: lines};
	}

	class LocalCodeRunner {
		kind = "local";
		id;
		label;
		preference;
		client;
		compilerName;

		constructor(client, compilerName, label, preference) {
			this.client = client;
			this.compilerName = compilerName;
			this.id = `local:${compilerName}`;
			this.label = `${label} [Local]`;
			if (preference !== undefined) this.preference = preference;
		}

		prepare(sourceCode) {
			return this.client.precompile(sourceCode, this.compilerName);
		}

		async run(sourceCode, input) {
			const response = await this.client.run(sourceCode, input, this.compilerName);
			if (response.status === "compileError") {
				return {
					status: "CE",
					input,
					error: response.stderr || "Local Runner could not compile the code.",
					...lineOffsetOf(response),
				};
			}
			return {
				status: toEasyTestStatus(response.status, response.exitCode, response.stdoutTruncated),
				exitCode: String(response.exitCode),
				execTime: Number(response.time),
				...(response.memory > 0 ? {allocatedMemory: Number(response.memory)} : {}),
				...(response.peakMemory !== undefined && response.peakMemory > 0
					? {memory: Number(response.peakMemory)}
					: {}),
				input,
				output: response.stdout ?? "",
				error: response.stderr ?? "",
				...lineOffsetOf(response),
			};
		}
	}

	class LocalRunnerProvider {
		client;

		constructor(client) {
			this.client = client;
		}

		async runnersFor(language) {
			if (!this.client.isAvailable()) return [];
			const ordered = orderLocalCompilers(await this.client.list(true), language);
			const ranked = ordered.some(({match}) => match !== undefined);
			return ordered.map(
				({compilerName, label}, index) =>
					new LocalCodeRunner(this.client, compilerName, label, ranked ? index : undefined),
			);
		}
	}

	class TextRunner {
		kind = "browser";
		id = "browser:text";
		label = "Text [Browser]";

		async run(sourceCode, input, _options) {
			return {status: "OK", exitCode: "0", input, output: sourceCode};
		}
	}

	class TextRunnerProvider {
		async runnersFor({family}) {
			return family === "text" ? [new TextRunner()] : [];
		}
	}

	// CpToolkit/src/domain/source/java-public.ts
	var TYPE_KEYWORDS2 = new Set(["class", "interface", "enum", "record"]);
	var TYPE_MODIFIERS = new Set(["abstract", "final", "sealed", "non", "-", "strictfp", "static"]);

	function typeKeywordAfter(tokens, index) {
		let i = index + 1;
		for (let token = tokens[i]; token; token = tokens[i]) {
			const {text} = token;
			if (TYPE_MODIFIERS.has(text)) {
				i++;
			} else if (text === "@" && tokens[i + 1]?.text !== "interface") {
				i += 2;
				while (tokens[i]?.text === "." && tokens[i + 1]) i += 2;
				const open = tokens[i];
				if (open?.text === "(" && open.pair > i) i = open.pair + 1;
			} else break;
		}
		if (TYPE_KEYWORDS2.has(tokens[i]?.text ?? "")) return i;
		return tokens[i]?.text === "@" && tokens[i + 1]?.text === "interface" ? i + 1 : -1;
	}

	function withoutPublicTypes(source) {
		const {text, offsets} = decodeUnicodeEscapes(source);
		const {tokens, complete} = scanJava(text, true);
		if (!complete) return source;
		const parts = [];
		let cursor = 0;
		let skipTo = 0;
		for (const [i, token] of tokens.entries()) {
			if (i < skipTo) continue;
			if (token.text === "public" && typeKeywordAfter(tokens, i) >= 0) {
				const start = offsets[token.start];
				let end = offsets[token.end];
				while (source[end] === " " || source[end] === "\t") end++;
				parts.push(source.slice(cursor, start));
				cursor = end;
			}
			if (token.pair > i) skipTo = token.pair;
		}
		parts.push(source.slice(cursor));
		return parts.join("");
	}

	// CpToolkit/src/adapters/runners/wandbox.ts
	var isSwitches = (value) => Array.isArray(value);
	var isCompilerCache = isObjectOf({
		compilers: isArrayOf(
			isObjectOf({
				name: isString,
				language: isString,
				version: isString,
				switches: isSwitches,
			}),
		),
		fetchedAt: isNumber,
	});
	var CACHE_KEY2 = "easy-test:wandbox-compilers";
	var HOUR_MS2 = 60 * 60 * 1000;
	var ACL_INCLUDE_PATTERN = /^#\s*include\s*[<"]atcoder\/([^>"]+)[>"]/gm;

	class WandboxRunner {
		kind = "wandbox";
		id;
		label;
		optimization;
		http;
		compiler;

		constructor(http, compiler) {
			this.http = http;
			this.compiler = compiler;
			const usesAcl = compiler.language === "C++";
			this.id = `wandbox:${compiler.name}`;
			this.label = `${compiler.language} ${compiler.name}${usesAcl ? " + ACL" : ""} [Wandbox]`;
			this.optimization = compiler.switches.find((item) => item["display-name"] === "Optimization")?.name;
		}

		async run(sourceCode, input, _options) {
			const usesAcl = this.compiler.language === "C++";
			const files = usesAcl ? await this.collectAclFiles(sourceCode) : new Map();
			const code = this.compiler.language === "Java" ? withoutPublicTypes(sourceCode) : sourceCode;
			const startedAt = Date.now();
			const response = await this.http.send({
				url: runnerCatalog.wandbox.compileUrl,
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					compiler: this.compiler.name,
					code,
					stdin: input,
					options: this.optimization,
					...(usesAcl
						? {
								"compiler-option-raw": "-I.",
								codes: [...files].map(([file, code]) => ({file, code})),
							}
						: {}),
				}),
			});
			const execTime = Date.now() - startedAt;
			const body = JSON.parse(response.text);
			const output = body.program_output ?? "";
			const error = body.program_error ?? "";
			if (String(body.status) === "0") return {status: "OK", exitCode: "0", execTime, input, output, error};
			return {
				status: body.compiler_output || body.compiler_error ? "CE" : "RE",
				exitCode: `${body.status}${body.signal ? ` (${body.signal})` : ""}`,
				execTime,
				input,
				output: (body.compiler_output ?? "") + output,
				error: (body.compiler_error ?? "") + error,
			};
		}

		async collectAclFiles(source, files = new Map()) {
			const paths = [...source.matchAll(ACL_INCLUDE_PATTERN)].map((match) => `atcoder/${match[1]}`);
			const missing = paths.filter((path) => !files.has(path));
			const loaded = await Promise.all(
				missing.map(async (path) => {
					const response = await this.http.send({url: runnerCatalog.wandbox.aclBaseUrl + path});
					return [path, response.text];
				}),
			);
			for (const [path, code] of loaded) files.set(path, code);
			for (const [, code] of loaded) await this.collectAclFiles(code, files);
			return files;
		}
	}

	class WandboxRunnerProvider {
		http;
		state;

		constructor(http, state) {
			this.http = http;
			this.state = state;
		}

		async runnersFor({family}) {
			const compilers = await this.compilers();
			return compilers
				.filter(({language, version}) => resolveFamily(languageCatalog, `${language} ${version}`) === family)
				.map((compiler) => new WandboxRunner(this.http, compiler));
		}

		async compilers() {
			const cached = readStored(this.state, CACHE_KEY2, isCompilerCache, null);
			if (cached && Date.now() - cached.fetchedAt < runnerCatalog.wandbox.cacheHours * HOUR_MS2)
				return cached.compilers;
			const response = await this.http.send({url: runnerCatalog.wandbox.listUrl});
			const compilers = JSON.parse(response.text);
			this.state.set(CACHE_KEY2, {compilers, fetchedAt: Date.now()});
			return compilers;
		}
	}

	// ../node_modules/.bun/turndown@7.2.4/node_modules/turndown/lib/turndown.browser.es.js
	function extend(destination) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
			}
		}
		return destination;
	}

	function repeat(character, count) {
		return Array(count + 1).join(character);
	}

	function trimLeadingNewlines(string) {
		return string.replace(/^\n*/, "");
	}

	function trimTrailingNewlines(string) {
		var indexEnd = string.length;
		while (
			indexEnd > 0 &&
			string[indexEnd - 1] ===
				`
`
		)
			indexEnd--;
		return string.substring(0, indexEnd);
	}

	function trimNewlines(string) {
		return trimTrailingNewlines(trimLeadingNewlines(string));
	}

	var blockElements = [
		"ADDRESS",
		"ARTICLE",
		"ASIDE",
		"AUDIO",
		"BLOCKQUOTE",
		"BODY",
		"CANVAS",
		"CENTER",
		"DD",
		"DIR",
		"DIV",
		"DL",
		"DT",
		"FIELDSET",
		"FIGCAPTION",
		"FIGURE",
		"FOOTER",
		"FORM",
		"FRAMESET",
		"H1",
		"H2",
		"H3",
		"H4",
		"H5",
		"H6",
		"HEADER",
		"HGROUP",
		"HR",
		"HTML",
		"ISINDEX",
		"LI",
		"MAIN",
		"MENU",
		"NAV",
		"NOFRAMES",
		"NOSCRIPT",
		"OL",
		"OUTPUT",
		"P",
		"PRE",
		"SECTION",
		"TABLE",
		"TBODY",
		"TD",
		"TFOOT",
		"TH",
		"THEAD",
		"TR",
		"UL",
	];

	function isBlock(node) {
		return is(node, blockElements);
	}

	var voidElements = [
		"AREA",
		"BASE",
		"BR",
		"COL",
		"COMMAND",
		"EMBED",
		"HR",
		"IMG",
		"INPUT",
		"KEYGEN",
		"LINK",
		"META",
		"PARAM",
		"SOURCE",
		"TRACK",
		"WBR",
	];

	function isVoid(node) {
		return is(node, voidElements);
	}

	function hasVoid(node) {
		return has(node, voidElements);
	}

	var meaningfulWhenBlankElements = [
		"A",
		"TABLE",
		"THEAD",
		"TBODY",
		"TFOOT",
		"TH",
		"TD",
		"IFRAME",
		"SCRIPT",
		"AUDIO",
		"VIDEO",
	];

	function isMeaningfulWhenBlank(node) {
		return is(node, meaningfulWhenBlankElements);
	}

	function hasMeaningfulWhenBlank(node) {
		return has(node, meaningfulWhenBlankElements);
	}

	function is(node, tagNames) {
		return tagNames.indexOf(node.nodeName) >= 0;
	}

	function has(node, tagNames) {
		return (
			node.getElementsByTagName &&
			tagNames.some(function (tagName) {
				return node.getElementsByTagName(tagName).length;
			})
		);
	}

	var markdownEscapes = [
		[/\\/g, "\\\\"],
		[/\*/g, "\\*"],
		[/^-/g, "\\-"],
		[/^\+ /g, "\\+ "],
		[/^(=+)/g, "\\$1"],
		[/^(#{1,6}) /g, "\\$1 "],
		[/`/g, "\\`"],
		[/^~~~/g, "\\~~~"],
		[/\[/g, "\\["],
		[/\]/g, "\\]"],
		[/^>/g, "\\>"],
		[/_/g, "\\_"],
		[/^(\d+)\. /g, "$1\\. "],
	];

	function escapeMarkdown(string) {
		return markdownEscapes.reduce(function (accumulator, escape) {
			return accumulator.replace(escape[0], escape[1]);
		}, string);
	}

	var rules = {};
	rules.paragraph = {
		filter: "p",
		replacement: function (content) {
			return (
				`

` +
				content +
				`

`
			);
		},
	};
	rules.lineBreak = {
		filter: "br",
		replacement: function (content, node, options) {
			return (
				options.br +
				`
`
			);
		},
	};
	rules.heading = {
		filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
		replacement: function (content, node, options) {
			var hLevel = Number(node.nodeName.charAt(1));
			if (options.headingStyle === "setext" && hLevel < 3) {
				var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
				return (
					`

` +
					content +
					`
` +
					underline +
					`

`
				);
			} else {
				return (
					`

` +
					repeat("#", hLevel) +
					" " +
					content +
					`

`
				);
			}
		},
	};
	rules.blockquote = {
		filter: "blockquote",
		replacement: function (content) {
			content = trimNewlines(content).replace(/^/gm, "> ");
			return (
				`

` +
				content +
				`

`
			);
		},
	};
	rules.list = {
		filter: ["ul", "ol"],
		replacement: function (content, node) {
			var parent = node.parentNode;
			if (parent.nodeName === "LI" && parent.lastElementChild === node) {
				return (
					`
` + content
				);
			} else {
				return (
					`

` +
					content +
					`

`
				);
			}
		},
	};
	rules.listItem = {
		filter: "li",
		replacement: function (content, node, options) {
			var prefix = options.bulletListMarker + "   ";
			var parent = node.parentNode;
			if (parent.nodeName === "OL") {
				var start = parent.getAttribute("start");
				var index = Array.prototype.indexOf.call(parent.children, node);
				prefix = (start ? Number(start) + index : index + 1) + ".  ";
			}
			var isParagraph = /\n$/.test(content);
			content =
				trimNewlines(content) +
				(isParagraph
					? `
`
					: "");
			content = content.replace(
				/\n/gm,
				`
` + " ".repeat(prefix.length),
			);
			return (
				prefix +
				content +
				(node.nextSibling
					? `
`
					: "")
			);
		},
	};
	rules.indentedCodeBlock = {
		filter: function (node, options) {
			return (
				options.codeBlockStyle === "indented" &&
				node.nodeName === "PRE" &&
				node.firstChild &&
				node.firstChild.nodeName === "CODE"
			);
		},
		replacement: function (content, node, options) {
			return (
				`

    ` +
				node.firstChild.textContent.replace(
					/\n/g,
					`
    `,
				) +
				`

`
			);
		},
	};
	rules.fencedCodeBlock = {
		filter: function (node, options) {
			return (
				options.codeBlockStyle === "fenced" &&
				node.nodeName === "PRE" &&
				node.firstChild &&
				node.firstChild.nodeName === "CODE"
			);
		},
		replacement: function (content, node, options) {
			var className = node.firstChild.getAttribute("class") || "";
			var language = (className.match(/language-(\S+)/) || [null, ""])[1];
			var code = node.firstChild.textContent;
			var fenceChar = options.fence.charAt(0);
			var fenceSize = 3;
			var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
			var match;
			while ((match = fenceInCodeRegex.exec(code))) {
				if (match[0].length >= fenceSize) {
					fenceSize = match[0].length + 1;
				}
			}
			var fence = repeat(fenceChar, fenceSize);
			return (
				`

` +
				fence +
				language +
				`
` +
				code.replace(/\n$/, "") +
				`
` +
				fence +
				`

`
			);
		},
	};
	rules.horizontalRule = {
		filter: "hr",
		replacement: function (content, node, options) {
			return (
				`

` +
				options.hr +
				`

`
			);
		},
	};
	rules.inlineLink = {
		filter: function (node, options) {
			return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
		},
		replacement: function (content, node) {
			var href = escapeLinkDestination(node.getAttribute("href"));
			var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
			var titlePart = title ? ' "' + title + '"' : "";
			return "[" + content + "](" + href + titlePart + ")";
		},
	};
	rules.referenceLink = {
		filter: function (node, options) {
			return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
		},
		replacement: function (content, node, options) {
			var href = escapeLinkDestination(node.getAttribute("href"));
			var title = cleanAttribute(node.getAttribute("title"));
			if (title) title = ' "' + escapeLinkTitle(title) + '"';
			var replacement;
			var reference;
			switch (options.linkReferenceStyle) {
				case "collapsed":
					replacement = "[" + content + "][]";
					reference = "[" + content + "]: " + href + title;
					break;
				case "shortcut":
					replacement = "[" + content + "]";
					reference = "[" + content + "]: " + href + title;
					break;
				default:
					var id = this.references.length + 1;
					replacement = "[" + content + "][" + id + "]";
					reference = "[" + id + "]: " + href + title;
			}
			this.references.push(reference);
			return replacement;
		},
		references: [],
		append: function (options) {
			var references = "";
			if (this.references.length) {
				references =
					`

` +
					this.references.join(`
`) +
					`

`;
				this.references = [];
			}
			return references;
		},
	};
	rules.emphasis = {
		filter: ["em", "i"],
		replacement: function (content, node, options) {
			if (!content.trim()) return "";
			return options.emDelimiter + content + options.emDelimiter;
		},
	};
	rules.strong = {
		filter: ["strong", "b"],
		replacement: function (content, node, options) {
			if (!content.trim()) return "";
			return options.strongDelimiter + content + options.strongDelimiter;
		},
	};
	rules.code = {
		filter: function (node) {
			var hasSiblings = node.previousSibling || node.nextSibling;
			var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
			return node.nodeName === "CODE" && !isCodeBlock;
		},
		replacement: function (content) {
			if (!content) return "";
			content = content.replace(/\r?\n|\r/g, " ");
			var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
			var delimiter = "`";
			var matches = content.match(/`+/gm) || [];
			while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
			return delimiter + extraSpace + content + extraSpace + delimiter;
		},
	};
	rules.image = {
		filter: "img",
		replacement: function (content, node) {
			var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
			var src = escapeLinkDestination(node.getAttribute("src") || "");
			var title = cleanAttribute(node.getAttribute("title"));
			var titlePart = title ? ' "' + escapeLinkTitle(title) + '"' : "";
			return src ? "![" + alt + "]" + "(" + src + titlePart + ")" : "";
		},
	};

	function cleanAttribute(attribute) {
		return attribute
			? attribute.replace(
					/(\n+\s*)+/g,
					`
`,
				)
			: "";
	}

	function escapeLinkDestination(destination) {
		var escaped = destination.replace(/([<>()])/g, "\\$1");
		return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
	}

	function escapeLinkTitle(title) {
		return title.replace(/"/g, '\\"');
	}

	function Rules(options) {
		this.options = options;
		this._keep = [];
		this._remove = [];
		this.blankRule = {
			replacement: options.blankReplacement,
		};
		this.keepReplacement = options.keepReplacement;
		this.defaultRule = {
			replacement: options.defaultReplacement,
		};
		this.array = [];
		for (var key in options.rules) this.array.push(options.rules[key]);
	}

	Rules.prototype = {
		add: function (key, rule) {
			this.array.unshift(rule);
		},
		keep: function (filter) {
			this._keep.unshift({
				filter,
				replacement: this.keepReplacement,
			});
		},
		remove: function (filter) {
			this._remove.unshift({
				filter,
				replacement: function () {
					return "";
				},
			});
		},
		forNode: function (node) {
			if (node.isBlank) return this.blankRule;
			var rule;
			if ((rule = findRule(this.array, node, this.options))) return rule;
			if ((rule = findRule(this._keep, node, this.options))) return rule;
			if ((rule = findRule(this._remove, node, this.options))) return rule;
			return this.defaultRule;
		},
		forEach: function (fn) {
			for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
		},
	};

	function findRule(rules, node, options) {
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			if (filterValue(rule, node, options)) return rule;
		}
		return;
	}

	function filterValue(rule, node, options) {
		var filter = rule.filter;
		if (typeof filter === "string") {
			if (filter === node.nodeName.toLowerCase()) return true;
		} else if (Array.isArray(filter)) {
			if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
		} else if (typeof filter === "function") {
			if (filter.call(rule, node, options)) return true;
		} else {
			throw new TypeError("`filter` needs to be a string, array, or function");
		}
	}

	function collapseWhitespace(options) {
		var element = options.element;
		var isBlock = options.isBlock;
		var isVoid = options.isVoid;
		var isPre =
			options.isPre ||
			function (node) {
				return node.nodeName === "PRE";
			};
		if (!element.firstChild || isPre(element)) return;
		var prevText = null;
		var keepLeadingWs = false;
		var prev = null;
		var node = next(prev, element, isPre);
		while (node !== element) {
			if (node.nodeType === 3 || node.nodeType === 4) {
				var text = node.data.replace(/[ \r\n\t]+/g, " ");
				if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") {
					text = text.substr(1);
				}
				if (!text) {
					node = remove(node);
					continue;
				}
				node.data = text;
				prevText = node;
			} else if (node.nodeType === 1) {
				if (isBlock(node) || node.nodeName === "BR") {
					if (prevText) {
						prevText.data = prevText.data.replace(/ $/, "");
					}
					prevText = null;
					keepLeadingWs = false;
				} else if (isVoid(node) || isPre(node)) {
					prevText = null;
					keepLeadingWs = true;
				} else if (prevText) {
					keepLeadingWs = false;
				}
			} else {
				node = remove(node);
				continue;
			}
			var nextNode = next(prev, node, isPre);
			prev = node;
			node = nextNode;
		}
		if (prevText) {
			prevText.data = prevText.data.replace(/ $/, "");
			if (!prevText.data) {
				remove(prevText);
			}
		}
	}

	function remove(node) {
		var next = node.nextSibling || node.parentNode;
		node.parentNode.removeChild(node);
		return next;
	}

	function next(prev, current, isPre) {
		if ((prev && prev.parentNode === current) || isPre(current)) {
			return current.nextSibling || current.parentNode;
		}
		return current.firstChild || current.nextSibling || current.parentNode;
	}

	var root = typeof window !== "undefined" ? window : {};

	function canParseHTMLNatively() {
		var Parser = root.DOMParser;
		var canParse = false;
		try {
			if (new Parser().parseFromString("", "text/html")) {
				canParse = true;
			}
		} catch (e) {
		}
		return canParse;
	}

	function createHTMLParser() {
		var Parser = function () {
		};
		{
			if (shouldUseActiveX()) {
				Parser.prototype.parseFromString = function (string) {
					var doc = new window.ActiveXObject("htmlfile");
					doc.designMode = "on";
					doc.open();
					doc.write(string);
					doc.close();
					return doc;
				};
			} else {
				Parser.prototype.parseFromString = function (string) {
					var doc = document.implementation.createHTMLDocument("");
					doc.open();
					doc.write(string);
					doc.close();
					return doc;
				};
			}
		}
		return Parser;
	}

	function shouldUseActiveX() {
		var useActiveX = false;
		try {
			document.implementation.createHTMLDocument("").open();
		} catch (e) {
			if (root.ActiveXObject) useActiveX = true;
		}
		return useActiveX;
	}

	var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();

	function RootNode(input, options) {
		var root;
		if (typeof input === "string") {
			var doc = htmlParser().parseFromString(
				'<x-turndown id="turndown-root">' + input + "</x-turndown>",
				"text/html",
			);
			root = doc.getElementById("turndown-root");
		} else {
			root = input.cloneNode(true);
		}
		collapseWhitespace({
			element: root,
			isBlock,
			isVoid,
			isPre: options.preformattedCode ? isPreOrCode : null,
		});
		return root;
	}

	var _htmlParser;

	function htmlParser() {
		_htmlParser = _htmlParser || new HTMLParser();
		return _htmlParser;
	}

	function isPreOrCode(node) {
		return node.nodeName === "PRE" || node.nodeName === "CODE";
	}

	function Node2(node, options) {
		node.isBlock = isBlock(node);
		node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
		node.isBlank = isBlank(node);
		node.flankingWhitespace = flankingWhitespace(node, options);
		return node;
	}

	function isBlank(node) {
		return (
			!isVoid(node) &&
			!isMeaningfulWhenBlank(node) &&
			/^\s*$/i.test(node.textContent) &&
			!hasVoid(node) &&
			!hasMeaningfulWhenBlank(node)
		);
	}

	function flankingWhitespace(node, options) {
		if (node.isBlock || (options.preformattedCode && node.isCode)) {
			return {
				leading: "",
				trailing: "",
			};
		}
		var edges = edgeWhitespace(node.textContent);
		if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
			edges.leading = edges.leadingNonAscii;
		}
		if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
			edges.trailing = edges.trailingNonAscii;
		}
		return {
			leading: edges.leading,
			trailing: edges.trailing,
		};
	}

	function edgeWhitespace(string) {
		var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
		return {
			leading: m[1],
			leadingAscii: m[2],
			leadingNonAscii: m[3],
			trailing: m[4],
			trailingNonAscii: m[5],
			trailingAscii: m[6],
		};
	}

	function isFlankedByWhitespace(side, node, options) {
		var sibling;
		var regExp;
		var isFlanked;
		if (side === "left") {
			sibling = node.previousSibling;
			regExp = / $/;
		} else {
			sibling = node.nextSibling;
			regExp = /^ /;
		}
		if (sibling) {
			if (sibling.nodeType === 3) {
				isFlanked = regExp.test(sibling.nodeValue);
			} else if (options.preformattedCode && sibling.nodeName === "CODE") {
				isFlanked = false;
			} else if (sibling.nodeType === 1 && !isBlock(sibling)) {
				isFlanked = regExp.test(sibling.textContent);
			}
		}
		return isFlanked;
	}

	var reduce = Array.prototype.reduce;

	function TurndownService(options) {
		if (!(this instanceof TurndownService)) return new TurndownService(options);
		var defaults = {
			rules,
			headingStyle: "setext",
			hr: "* * *",
			bulletListMarker: "*",
			codeBlockStyle: "indented",
			fence: "```",
			emDelimiter: "_",
			strongDelimiter: "**",
			linkStyle: "inlined",
			linkReferenceStyle: "full",
			br: "  ",
			preformattedCode: false,
			blankReplacement: function (content, node) {
				return node.isBlock
					? `

`
					: "";
			},
			keepReplacement: function (content, node) {
				return node.isBlock
					? `

` +
							node.outerHTML +
							`

`
					: node.outerHTML;
			},
			defaultReplacement: function (content, node) {
				return node.isBlock
					? `

` +
							content +
							`

`
					: content;
			},
		};
		this.options = extend({}, defaults, options);
		this.rules = new Rules(this.options);
	}

	TurndownService.prototype = {
		turndown: function (input) {
			if (!canConvert(input)) {
				throw new TypeError(input + " is not a string, or an element/document/fragment node.");
			}
			if (input === "") return "";
			var output = process.call(this, new RootNode(input, this.options));
			return postProcess.call(this, output);
		},
		use: function (plugin) {
			if (Array.isArray(plugin)) {
				for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
			} else if (typeof plugin === "function") {
				plugin(this);
			} else {
				throw new TypeError("plugin must be a Function or an Array of Functions");
			}
			return this;
		},
		addRule: function (key, rule) {
			this.rules.add(key, rule);
			return this;
		},
		keep: function (filter) {
			this.rules.keep(filter);
			return this;
		},
		remove: function (filter) {
			this.rules.remove(filter);
			return this;
		},
		escape: function (string) {
			return escapeMarkdown(string);
		},
	};

	function process(parentNode) {
		var self = this;
		return reduce.call(
			parentNode.childNodes,
			function (output, node) {
				node = new Node2(node, self.options);
				var replacement = "";
				if (node.nodeType === 3) {
					replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
				} else if (node.nodeType === 1) {
					replacement = replacementForNode.call(self, node);
				}
				return join(output, replacement);
			},
			"",
		);
	}

	function postProcess(output) {
		var self = this;
		this.rules.forEach(function (rule) {
			if (typeof rule.append === "function") {
				output = join(output, rule.append(self.options));
			}
		});
		return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
	}

	function replacementForNode(node) {
		var rule = this.rules.forNode(node);
		var content = process.call(this, node);
		var whitespace = node.flankingWhitespace;
		if (whitespace.leading || whitespace.trailing) content = content.trim();
		return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
	}

	function join(output, replacement) {
		var s1 = trimTrailingNewlines(output);
		var s2 = trimLeadingNewlines(replacement);
		var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
		var separator = `

`.substring(0, nls);
		return s1 + separator + s2;
	}

	function canConvert(input) {
		return (
			input != null &&
			(typeof input === "string" ||
				(input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11)))
		);
	}

	// ../node_modules/.bun/turndown-plugin-gfm@1.0.2/node_modules/turndown-plugin-gfm/lib/turndown-plugin-gfm.es.js
	var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;

	function highlightedCodeBlock(turndownService) {
		turndownService.addRule("highlightedCodeBlock", {
			filter: function (node) {
				var firstChild = node.firstChild;
				return (
					node.nodeName === "DIV" &&
					highlightRegExp.test(node.className) &&
					firstChild &&
					firstChild.nodeName === "PRE"
				);
			},
			replacement: function (content, node, options) {
				var className = node.className || "";
				var language = (className.match(highlightRegExp) || [null, ""])[1];
				return (
					`

` +
					options.fence +
					language +
					`
` +
					node.firstChild.textContent +
					`
` +
					options.fence +
					`

`
				);
			},
		});
	}

	function strikethrough(turndownService) {
		turndownService.addRule("strikethrough", {
			filter: ["del", "s", "strike"],
			replacement: function (content) {
				return "~" + content + "~";
			},
		});
	}

	var indexOf = Array.prototype.indexOf;
	var every = Array.prototype.every;
	var rules2 = {};
	rules2.tableCell = {
		filter: ["th", "td"],
		replacement: function (content, node) {
			return cell(content, node);
		},
	};
	rules2.tableRow = {
		filter: "tr",
		replacement: function (content, node) {
			var borderCells = "";
			var alignMap = {left: ":--", right: "--:", center: ":-:"};
			if (isHeadingRow(node)) {
				for (var i = 0; i < node.childNodes.length; i++) {
					var border = "---";
					var align = (node.childNodes[i].getAttribute("align") || "").toLowerCase();
					if (align) border = alignMap[align] || border;
					borderCells += cell(border, node.childNodes[i]);
				}
			}
			return (
				`
` +
				content +
				(borderCells
					? `
` + borderCells
					: "")
			);
		},
	};
	rules2.table = {
		filter: function (node) {
			return node.nodeName === "TABLE" && isHeadingRow(node.rows[0]);
		},
		replacement: function (content) {
			content = content.replace(
				`

`,
				`
`,
			);
			return (
				`

` +
				content +
				`

`
			);
		},
	};
	rules2.tableSection = {
		filter: ["thead", "tbody", "tfoot"],
		replacement: function (content) {
			return content;
		},
	};

	function isHeadingRow(tr) {
		var parentNode = tr.parentNode;
		return (
			parentNode.nodeName === "THEAD" ||
			(parentNode.firstChild === tr &&
				(parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) &&
				every.call(tr.childNodes, function (n) {
					return n.nodeName === "TH";
				}))
		);
	}

	function isFirstTbody(element) {
		var previousSibling = element.previousSibling;
		return (
			element.nodeName === "TBODY" &&
			(!previousSibling || (previousSibling.nodeName === "THEAD" && /^\s*$/i.test(previousSibling.textContent)))
		);
	}

	function cell(content, node) {
		var index = indexOf.call(node.parentNode.childNodes, node);
		var prefix = " ";
		if (index === 0) prefix = "| ";
		return prefix + content + " |";
	}

	function tables(turndownService) {
		turndownService.keep(function (node) {
			return node.nodeName === "TABLE" && !isHeadingRow(node.rows[0]);
		});
		for (var key in rules2) turndownService.addRule(key, rules2[key]);
	}

	function taskListItems(turndownService) {
		turndownService.addRule("taskListItems", {
			filter: function (node) {
				return node.type === "checkbox" && node.parentNode.nodeName === "LI";
			},
			replacement: function (content, node) {
				return (node.checked ? "[x]" : "[ ]") + " ";
			},
		});
	}

	function gfm(turndownService) {
		turndownService.use([highlightedCodeBlock, strikethrough, tables, taskListItems]);
	}

	// CpToolkit/src/adapters/statement/statement-converter.ts
	var isElement = (node) => node.nodeType === Node.ELEMENT_NODE;

	function texOf(element, fallback) {
		const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
		const attribute = element.getAttribute("data-tex") ?? element.getAttribute("aria-label");
		return (annotation?.textContent ?? attribute ?? fallback).trim();
	}

	function inlineMath(element, fallback) {
		return `$${texOf(element, fallback)}$`;
	}

	function displayMath(element) {
		return `$$
${texOf(element, "")}
$$`;
	}

	function hasClass(node, className) {
		return isElement(node) && node.classList.contains(className);
	}

	function createTurndown() {
		const service = new TurndownService({headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-"});
		service.use(gfm);
		service.addRule("math", {
			filter: (node) => node.nodeName === "VAR" || hasClass(node, "katex"),
			replacement: (content, node) => (isElement(node) ? inlineMath(node, content) : content),
		});
		service.addRule("displayMath", {
			filter: (node) => hasClass(node, "katex-display"),
			replacement: (content, node) =>
				isElement(node)
					? `

${displayMath(node)}

`
					: content,
		});
		service.addRule("pre", {
			filter: "pre",
			replacement: (content) => `
\`\`\`text
${content.trim()}
\`\`\`
`,
		});
		service.addRule("listItem", {
			filter: "li",
			replacement(content, node, options) {
				const body = content
					.replace(/^\n+/, "")
					.replace(
						/\n+$/,
						`
`,
					)
					.replace(
						/\n/gm,
						`
  `,
					);
				const parent = node.parentElement;
				let prefix = `${options.bulletListMarker} `;
				if (parent?.nodeName === "OL" && isElement(node)) {
					const start = Number(parent.getAttribute("start") ?? 1);
					prefix = `${start + [...parent.children].indexOf(node)}. `;
				}
				return (
					prefix +
					body +
					(node.nextSibling &&
					!body.endsWith(`
`)
						? `
`
						: "")
				);
			},
		});
		return service;
	}

	var BLOCK_TAGS = new Set(["P", "DIV", "UL", "OL", "SECTION"]);
	var IGNORED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);

	function plainTextOf(node) {
		if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
		if (!isElement(node)) return "";
		const tag = node.tagName;
		if (IGNORED_TAGS.has(tag)) return "";
		if (tag === "BR")
			return `
`;
		if (hasClass(node, "katex-display"))
			return `
${displayMath(node)}
`;
		if (tag === "VAR" || hasClass(node, "katex")) return inlineMath(node, node.textContent ?? "");
		if (tag === "CODE") return `\`${node.textContent ?? ""}\``;
		if (tag === "PRE")
			return `
${(node.textContent ?? "").trim()}
`;
		const inner = [...node.childNodes].map(plainTextOf).join("");
		if (tag === "H3")
			return `【${inner.trim()}】
`;
		if (tag === "LI")
			return `
- ${inner.trim()}
`;
		return BLOCK_TAGS.has(tag)
			? `
${inner}
`
			: inner;
	}

	function toHtmlElement(target) {
		if (target instanceof HTMLElement) return target;
		throw new TypeError("A page element is required.");
	}

	class TurndownStatementConverter {
		turndown = createTurndown();

		toMarkdown(element) {
			return this.turndown.turndown(toHtmlElement(element));
		}

		toPlainText(element) {
			return [...toHtmlElement(element).childNodes]
				.map(plainTextOf)
				.join("")
				.replace(
					/\n{3,}/g,
					`

`,
				)
				.trim();
		}
	}

	// CpToolkit/src/application/feature/definition.ts
	function defineFeature(definition) {
		return {
			id: definition.id,
			title: definition.title,
			description: definition.description,
			category: definition.category,
			defaultEnabled: definition.defaultEnabled,
			routes: definition.routes,
			phase: definition.phase,
			options: definition.options,
			live: definition.live === true,
			async run(storedOptions, services) {
				const options = normalizeOptions(definition.options, storedOptions);
				const context = Object.assign(Object.create(services), {options});
				return (await definition.start(context)) ?? undefined;
			},
		};
	}

	// CpToolkit/src/features/local-runner/index.ts
	var localRunner = defineFeature({
		id: "local-runner",
		title: "localRunner.title",
		description: "localRunner.description",
		category: "category.execution",
		defaultEnabled: true,
		routes: [
			"atcoder:contest",
			"codeforces:page",
			"yukicoder:problem",
			"aoj:page",
			"libraryChecker:page",
			"paiza:page",
		],
		phase: "ready",
		options: {
			url: sharedAcrossSites(option.text("http://localhost:8080", "localRunner.url", {validate: isHttpUrl})),
		},
		live: true,
		start() {
			return () => {
				return;
			};
		},
	});

	// CpToolkit/src/app/container.ts
	function createTranslate() {
		return createTranslator(detectLocale);
	}

	function createServices(page, settings, openSettings) {
		const state = new GmKeyValueStore();
		const http = new GmHttpClient();
		const site = new SameOriginHttpClient();
		const scripts = new ElementScriptLoader();
		const bridge = new UnsafeWindowPageBridge();
		const editors = new PageCodeEditorLocator();
		const localRunnerEndpoint = () => {
			const {id, defaultEnabled, options} = localRunner;
			if (!settings.isEnabled(id, defaultEnabled)) return null;
			return String(normalizeOptions(options, settings.storedOptions(id)).url);
		};
		const localRunner2 = new LocalRunnerClient(http, localRunnerEndpoint);
		let judgeSite = null;
		const getJudgeSite = () => {
			judgeSite ??= createJudgeSite(page?.judge.id, bridge, site);
			return judgeSite;
		};
		const forms = new Map();
		const getSubmissionForm = (target) => {
			let form = forms.get(target);
			if (!form) {
				form = createSubmissionForm(target, {judgeId: page?.judge.id, bridge, judgeSite: getJudgeSite});
				forms.set(target, form);
			}
			return form;
		};
		let contestTasks = null;
		const loadTasks = async () => {
			const judgeId = page?.judge.id;
			const contestId = contestIdOf(location.pathname);
			if (judgeId === "atcoder" && contestId) {
				return loadContestTasks(contestId, {
					site,
					state,
					parse: parseAtCoderTaskPage,
					cacheDays: contestCatalog.taskCacheDays,
				});
			}
			const contestPage = contestPagesOf(judgeId, location.pathname)?.tasks;
			if (judgeId !== "codeforces" || !contestPage) return null;
			const response = await site.send({url: contestPage});
			return response.status === 200 ? parseCodeforcesContestPage(response.text) : null;
		};
		const getContestTasks = () => {
			contestTasks ??= loadTasks().catch(() => null);
			contestTasks.then((tasks) => {
				if (tasks === null) contestTasks = null;
			});
			return contestTasks;
		};
		let providers = null;
		const getProviders = () => {
			providers ??= [
				new LocalRunnerProvider(localRunner2),
				new AtCoderRunnerProvider(site, getJudgeSite),
				new TextRunnerProvider(),
				new PyodideRunnerProvider(scripts),
				new PaizaRunnerProvider(http),
				new WandboxRunnerProvider(http, state),
			];
			return providers;
		};
		let converter = null;
		let graph = null;
		return {
			translate: createTranslate(),
			isOnRoute: (route) => page?.routeIds.has(route) ?? false,
			judge: page?.judge ?? null,
			state,
			clipboard: new GmClipboard(),
			notifier: new GmNotifier(),
			ticker: new WorkerTicker(),
			http,
			site,
			scripts,
			page: bridge,
			editors,
			paste: new PastePipeline(editors),
			localRunner: localRunner2,
			runners: new RunnerCatalogService(
				getProviders,
				runnerCatalog.order,
				runnerCatalog.maxRetry,
				runnerCatalog.external,
			),
			judgeSite: getJudgeSite,
			submissionForm: getSubmissionForm,
			shortcuts: new ShortcutActions(),
			samples: () => readPageSamples(page?.judge.id, getJudgeSite).catch(() => []),
			contestTasks: getContestTasks,
			openSettings,
			get statementConverter() {
				converter ??= new TurndownStatementConverter();
				return converter;
			},
			get ratingGraph() {
				graph ??= new CreateJsRatingGraph();
				return graph;
			},
		};
	}

	// CpToolkit/src/domain/submission/status.ts
	var JUDGING_PROGRESS_PATTERN = /^\d+\s*\/\s*\d+/;

	function isJudging(status) {
		return status === "" || status === "WJ" || status === "WR" || JUDGING_PROGRESS_PATTERN.test(status);
	}

	function summarizeJudgeCases(cases) {
		const total = cases.length;
		const sum = (select) => {
			return cases.reduce((value, item) => value + select(item), 0);
		};
		return {
			accepted: cases.filter(({status}) => status === "AC").length,
			total,
			averageTimeMs: Math.round((sum(({timeMs}) => timeMs) / total) * 10) / 10,
			averageMemoryKb: Math.round(sum(({memoryKb}) => memoryKb) / total),
			timeIsLowerBound: cases.some(({status}) => status === "TLE"),
		};
	}

	// CpToolkit/src/features/average-result/index.ts
	var COLUMN_COUNT = 4;
	var MIN_TABLES_WITH_CASES = 5;
	var MIN_CASES = 2;

	function readCase(row) {
		const [, status, time, memory] = row.querySelectorAll("td");
		return {
			status: status?.textContent?.trim() ?? "",
			timeMs: Number.parseInt(time?.textContent ?? "", 10) || 0,
			memoryKb: Number.parseInt(memory?.textContent ?? "", 10) || 0,
		};
	}

	var averageResult = defineFeature({
		id: "average-result",
		title: "averageResult.title",
		description: "averageResult.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:submissionDetail"],
		phase: "ready",
		options: {},
		live: true,
		start({translate}) {
			const tables = [...document.querySelectorAll("table")];
			const body = tables.at(-1)?.querySelector("tbody");
			const rows = [...(body?.querySelectorAll("tr") ?? [])];
			const isCaseTable = rows.every((row) => row.querySelectorAll("td").length === COLUMN_COUNT);
			const hasCases = tables.length >= MIN_TABLES_WITH_CASES && rows.length >= MIN_CASES && isCaseTable;
			if (!body || !hasCases)
				return () => {
					return;
				};
			const {accepted, total, averageTimeMs, averageMemoryKb, timeIsLowerBound} = summarizeJudgeCases(
				rows.map(readCase),
			);
			const allAccepted = accepted === total;
			const row = h(
				"tr",
				{},
				h("td", {className: "text-center"}, h("b", {textContent: translate("averageResult.average")})),
				h(
					"td",
					{className: "text-center"},
					h("span", {
						className: `label ${allAccepted ? "label-success" : "label-warning"}`,
						textContent: `${accepted}/${total}`,
					}),
				),
				h("td", {className: "text-right", textContent: `${averageTimeMs}${timeIsLowerBound ? "+" : ""} ms`}),
				h("td", {className: "text-right", textContent: `${averageMemoryKb} KiB`}),
			);
			body.prepend(row);
			return () => row.remove();
		},
	});

	// CpToolkit/src/application/contest/clarification-counter.ts
	var SEEN_KEY = "clar-notifier:seen";
	var LAST_POLL_KEY = "clar-notifier:lastPoll";
	var isSeenCounts = isRecordOf(isNumber);

	class ClarificationCounter {
		state;

		constructor(state) {
			this.state = state;
		}

		claimPoll(now, intervalMs) {
			if (now - readStored(this.state, LAST_POLL_KEY, isNumber, 0) < intervalMs) return false;
			this.state.set(LAST_POLL_KEY, now);
			return true;
		}

		update(contestId, count) {
			const seen = readStored(this.state, SEEN_KEY, isSeenCounts, {});
			const previous = seen[contestId] ?? 0;
			if (count !== previous) this.state.set(SEEN_KEY, {...seen, [contestId]: count});
			return Math.max(count - previous, 0);
		}
	}

	// CpToolkit/src/features/clar-notifier/index.ts
	var POLL_INTERVAL_MS2 = 60 * 1000;
	var TICK_INTERVAL_MS = 5000;
	var START_DELAY_MS = 5 * 60 * 1000;
	var START_SPREAD_MS = 60 * 1000;
	var MAX_CONTEST_MS = 30 * 24 * 60 * 60 * 1000;
	var TOAST_DURATION_MS = 30 * 1000;
	var clarNotifier = defineFeature({
		id: "clar-notifier",
		title: "clarNotifier.title",
		description: "clarNotifier.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:contest"],
		phase: "ready",
		options: {
			desktop: option.boolean(true, "clarNotifier.desktop"),
		},
		live: true,
		start({options, notifier, page, site, state, ticker, translate}) {
			const contestId = contestIdOf(location.pathname);
			const period = page.contestPeriod();
			const hasBadge = document.querySelector("#clar-badge") !== null;
			const ended = !period || page.serverNow() >= period.endMs;
			if (!contestId || ended || !hasBadge || period.endMs - period.startMs > MAX_CONTEST_MS) {
				return () => {
					return;
				};
			}
			const counter = new ClarificationCounter(state);
			const beginAt = period.startMs + START_DELAY_MS + Math.random() * START_SPREAD_MS;
			const check = async () => {
				const response = await site.send({url: buildAtCoderClarificationCountUrl(contestId, period.startMs)});
				const count = safeJsonParse(response.text, null);
				if (response.status !== 200 || typeof count !== "number") return;
				const added = counter.update(contestId, count);
				if (added === 0) return;
				const url = buildAtCoderClarificationsUrl(contestId);
				const title = translate("clarNotifier.arrived").replace("{count}", String(added));
				const text = document.querySelector(".contest-title")?.textContent?.trim() ?? contestId;
				showToast({title, detail: text, tone: "warning", href: url, durationMs: TOAST_DURATION_MS});
				if (options.desktop && !document.hasFocus())
					notifier.notify({title, text, url, tag: `clar-notifier:${contestId}:${count}`});
			};
			const stop = ticker.start(TICK_INTERVAL_MS, () => {
				const now = page.serverNow();
				if (now >= period.endMs) stop();
				else if (now >= beginAt && counter.claimPoll(now, POLL_INTERVAL_MS2))
					check().catch(() => {
						return;
					});
			});
			return stop;
		},
	});

	// CpToolkit/src/domain/contest/calendar.ts
	var GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/render";

	function toCalendarTime(timeMs) {
		return new Date(timeMs).toISOString().replace(/[-:]|\.\d{3}/g, "");
	}

	function buildCalendarUrl({title, startMs, endMs, location: location2}) {
		const query = buildQueryString({
			action: "TEMPLATE",
			text: title,
			dates: `${toCalendarTime(startMs)}/${toCalendarTime(endMs)}`,
			location: location2,
		});
		return `${GOOGLE_CALENDAR_URL}?${query}`;
	}

	// CpToolkit/src/features/contest-calendar/contest-calendar.css
	var contest_calendar_default = `.cp-calendar-link {
	margin-left: 8px;
}
`;

	// CpToolkit/src/features/contest-calendar/index.ts
	var contestCalendar = defineFeature({
		id: "contest-calendar",
		title: "contestCalendar.title",
		description: "contestCalendar.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:contest"],
		phase: "ready",
		options: {},
		live: true,
		start({page, translate}) {
			const period = page.contestPeriod();
			const duration = document.querySelector("small.contest-duration");
			const contestLink = document.querySelector("a.contest-title");
			if (!period || !duration || !contestLink || page.serverNow() >= period.endMs)
				return () => {
					return;
				};
			const title = contestLink.textContent?.trim() ?? "";
			const icon = h("span", {className: "glyphicon glyphicon-calendar", ariaHidden: "true"});
			const link = h(
				"a",
				{
					className: "btn btn-default btn-xs cp-calendar-link",
					href: buildCalendarUrl({title, ...period, location: contestLink.href}),
					target: "_blank",
					rel: "noopener noreferrer",
				},
				icon,
				` ${translate("contestCalendar.add")}`,
			);
			const style = injectStyle(contest_calendar_default);
			duration.append(link);
			return () => {
				link.remove();
				style.remove();
			};
		},
	});

	// CpToolkit/src/application/execution/runner-selection.ts
	var RUNNER_SELECTION_KEY = "easy-test:runner-selection";

	class RunnerSelection {
		language;
		runners;
		state;
		current = [];

		get explicit() {
			const language = this.language();
			return language ? this.selections()[language.id] : undefined;
		}

		refreshing = Promise.resolve();

		constructor(language, runners, state) {
			this.language = language;
			this.runners = runners;
			this.state = state;
		}

		get candidates() {
			return this.current;
		}

		local() {
			return this.current.find(({kind}) => kind === "local");
		}

		settled() {
			return this.refreshing;
		}

		refresh(view) {
			this.refreshing = this.refreshing.then(() => this.load(view));
			return this.refreshing;
		}

		remember(runnerId) {
			const language = this.language();
			if (!language) return;
			const next = {...this.selections()};
			if (runnerId) next[language.id] = runnerId;
			else delete next[language.id];
			this.state.set(RUNNER_SELECTION_KEY, next);
		}

		selections() {
			return readStored(this.state, RUNNER_SELECTION_KEY, isRecordOf(isString), {});
		}

		async load(view) {
			const language = this.language();
			const candidates = language ? await this.runners.candidates(language) : [];
			if (this.language()?.id !== language?.id) return;
			this.current = candidates;
			const preferred = candidates.find(({kind}) => kind === "local") ?? candidates[0];
			view.show(candidates, this.explicit ?? preferred?.id);
		}
	}

	// CpToolkit/src/application/execution/test-session.ts
	class TestSession {
		runners;
		selection;
		listener;
		pendingSubmit = null;
		count = 0;
		active = 0;

		constructor(runners, selection, listener) {
			this.runners = runners;
			this.selection = selection;
			this.listener = listener;
		}

		get busy() {
			return this.active > 0;
		}

		get submitPending() {
			return this.pendingSubmit !== null;
		}

		nextNumber() {
			return ++this.count;
		}

		start(testCase, code, runnerId, allowableError, extra) {
			this.active++;
			this.listener.onBusyChange();
			const options = {
				trim: true,
				split: true,
				...(allowableError === undefined ? {} : {allowableError}),
				...extra,
			};
			const candidates = this.selection.explicit
				? this.selection.candidates.filter(({id}) => id === runnerId)
				: this.selection.candidates;
			return this.runners.test(candidates, runnerId, code, testCase, options).finally(() => {
				if (--this.active === 0) this.listener.onBusyChange();
			});
		}

		cancelSubmit() {
			this.setPendingSubmit(null);
		}

		async testAndSubmit(runSamples, submit) {
			if (this.pendingSubmit) return;
			const pending = {};
			const cancel = () => {
				if (this.pendingSubmit === pending) this.setPendingSubmit(null);
			};
			this.setPendingSubmit(pending);
			try {
				const passed = await runSamples(cancel);
				if (passed && this.pendingSubmit === pending) submit();
			} finally {
				cancel();
			}
		}

		setPendingSubmit(pending) {
			this.pendingSubmit = pending;
			this.listener.onSubmitChange();
		}
	}

	// CpToolkit/src/ui/dock/dock.css
	var dock_default = `.dock {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 2147482000;
	display: flex;
	flex-direction: column;
	align-items: center;
	pointer-events: none;
}

.dock-toggle {
	padding: 10px 3em;
	border: 0;
	border-radius: 5px 5px 0 0;
	background: #000;
	color: #fff;
	line-height: 1;
	opacity: 0.5;
	pointer-events: auto;
}

.dock-toggle::before {
	content: "\\25B2";
}

.dock-toggle[data-open="true"]::before {
	content: "\\25BC";
}

@media (max-width: 767px) {
	.dock-toggle {
		opacity: 0.25;
	}
}

.dock-panel {
	width: 100%;
	background: rgb(0 0 0 / 80%);
	color: #fff;
	pointer-events: auto;
}

.dock-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 2px;
	padding: 3px 0 0 10px;
	border-bottom: 1px solid #ddd;
	cursor: n-resize;
}

.dock-tab {
	display: inline-flex;
	align-items: center;
	margin-bottom: -1px;
	padding: 10px 15px;
	border: 1px solid #ccc;
	border-radius: 4px 4px 0 0;
	background: rgb(150 150 150 / 50%);
	color: #000;
	line-height: 1.43;
	cursor: pointer;
	filter: brightness(0.75);
}

.dock-tab:hover {
	color: #111;
	filter: brightness(0.9);
}

.dock-tab[data-tone="success"] {
	background: #dff0d8;
}

.dock-tab[data-tone="warning"] {
	background: #fcf8e3;
}

.dock-tab[data-active="true"] {
	border-bottom-color: transparent;
	color: #333;
	filter: none;
}

.dock-tab[data-active="true"]:not([data-tone]) {
	background: #eee;
}

.dock-tab-close {
	margin-right: -6px;
	padding: 0 0 0 6px;
	border: 0;
	background: none;
	color: #333;
	font-size: 8pt;
	line-height: 1;
}

.dock-content {
	max-height: 50vh;
	padding: 5px 15px;
	overflow-y: auto;
}
`;

	// CpToolkit/src/ui/dock/dock.ts
	function createDock({css, toggleLabel, closeLabel}) {
		const tabs = h("div", {className: "dock-tabs"});
		const content = h("div", {className: "dock-content"});
		const panel = h("div", {className: "dock-panel", hidden: true}, tabs, content);
		const setOpen = (open) => {
			panel.hidden = !open;
			toggleButton.dataset.open = String(open);
		};
		const toggle = () => setOpen(panel.hidden !== false);
		const toggleButton = h("button", {
			type: "button",
			className: "dock-toggle",
			title: toggleLabel,
			ariaLabel: toggleLabel,
			onclick: toggle,
		});
		const dock = h("div", {className: "dock"}, toggleButton, panel);
		const host = h("div");
		host.attachShadow({mode: "open"}).append(
			h("style", {
				textContent: `${theme_default}
${dock_default}
${css}`,
			}),
			dock,
		);
		document.body.append(host);
		tabs.addEventListener("pointerdown", (event) => {
			if (event.target !== tabs) return;
			const startY = event.clientY;
			const startHeight = content.getBoundingClientRect().height;
			const onMove = ({clientY}) => {
				content.style.height = `${startHeight - (clientY - startY)}px`;
			};
			tabs.setPointerCapture(event.pointerId);
			tabs.addEventListener("pointermove", onMove);
			tabs.addEventListener("pointerup", () => tabs.removeEventListener("pointermove", onMove), {once: true});
		});
		const entries = new Set();
		let active;
		const activate = (next) => {
			active = next;
			for (const entry of entries) {
				entry.tab.dataset.active = String(entry === next);
				entry.pane.hidden = entry !== next;
			}
		};
		return {
			addTab(label, pane, {closable = false} = {}) {
				const tab = h("div", {className: "dock-tab", textContent: label});
				const entry = {tab, pane};
				const select = () => activate(entry);
				const show = () => {
					setOpen(true);
					select();
				};
				const close = () => {
					entries.delete(entry);
					tab.remove();
					pane.remove();
					if (active === entry) activate(entries.values().next().value);
				};
				tab.addEventListener("click", show);
				if (closable) {
					tab.append(
						h("button", {
							type: "button",
							className: "dock-tab-close",
							textContent: "×",
							ariaLabel: closeLabel,
							onclick(event) {
								event.stopPropagation();
								close();
							},
						}),
					);
				}
				entries.add(entry);
				pane.hidden = active !== undefined;
				tabs.append(tab);
				content.append(pane);
				if (!active) select();
				return {
					select,
					show,
					close,
					setTone(tone) {
						tab.dataset.tone = tone;
					},
				};
			},
			toggle,
			remove: () => host.remove(),
		};
	}

	// CpToolkit/src/ui/tooltip/tooltip.css
	var tooltip_default = `.tooltip {
	position: fixed;
	z-index: 2147483000;
	padding: 3px 8px;
	border: 1px solid var(--cp-border);
	border-radius: 4px;
	background: var(--cp-text);
	box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
	color: var(--cp-surface);
	font-size: 12px;
	white-space: nowrap;
	pointer-events: none;
	transform: translateX(-50%);
}
`;

	// CpToolkit/src/ui/tooltip/tooltip.ts
	var GAP_PX = 6;
	var tooltips = [];
	var bubble = null;
	var listening2 = false;
	var hovered = null;

	function ensureBubble() {
		if (bubble?.isConnected) return bubble;
		const element = h("div", {className: "tooltip", hidden: true});
		const host = h("div");
		host.attachShadow({mode: "open"}).append(
			h("style", {
				textContent: `${theme_default}
${tooltip_default}`,
			}),
			element,
		);
		document.body.append(host);
		bubble = element;
		return element;
	}

	function place(element, anchor) {
		const {left, top, bottom, width} = anchor.getBoundingClientRect();
		const above = top - element.offsetHeight - GAP_PX;
		element.style.left = `${left + width / 2}px`;
		element.style.top = `${above >= 0 ? above : bottom + GAP_PX}px`;
	}

	function refresh() {
		for (const {anchor, text} of tooltips) {
			const element = anchor();
			const label = element?.contains(hovered) ? text() : null;
			if (!element || label === null) continue;
			const target = ensureBubble();
			target.textContent = label;
			target.hidden = false;
			place(target, element);
			return;
		}
		if (bubble) bubble.hidden = true;
	}

	function onPointerMove({target}) {
		hovered = target instanceof Node ? target : null;
		refresh();
	}

	function addTooltip(anchor, text) {
		if (!listening2) {
			document.addEventListener("mouseover", onPointerMove);
			document.addEventListener("click", refresh);
			listening2 = true;
		}
		tooltips.push({anchor, text});
	}

	// CpToolkit/src/features/easy-test/easy-test.css
	var easy_test_default = `select,
textarea,
input[type="text"] {
	display: block;
	width: 100%;
	padding: 6px 12px;
	border: 1px solid #ccc;
	border-radius: 4px;
	background: #fff;
	color: #555;
	font: inherit;
}

input:disabled {
	background: #eee;
}

input[aria-invalid="true"] {
	border-color: var(--cp-danger, #cf222e);
}

.test-form {
	display: grid;
	grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
	gap: 0 30px;
	padding-top: 10px;
}

@media (max-width: 1199px) {
	.test-form {
		grid-template-columns: minmax(0, 1fr);
	}
}

.form-row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 5fr);
	gap: 0 15px;
	margin-bottom: 15px;
}

.form-row-label {
	padding-top: 7px;
	font-weight: 700;
	text-align: right;
}

.environment {
	border: 0;
	background: transparent;
	color: #fff;
}

.environment option {
	color: #333;
}

.input-group {
	display: flex;
}

.input-group-addon {
	display: flex;
	align-items: center;
	padding: 6px 12px;
	border: 1px solid #ccc;
	border-right: 0;
	border-radius: 4px 0 0 4px;
	background: #eee;
}

.input-group input[type="text"] {
	border-radius: 0 4px 4px 0;
}

summary {
	margin-bottom: 15px;
	padding-top: 7px;
	cursor: pointer;
}

.test-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15px;
}

.run-button {
	padding: 6px 12px;
	border: 1px solid #2e6da4;
	border-radius: 4px;
	background: #337ab7;
	color: #fff;
}

.run-button:hover {
	border-color: #204d74;
	background: #286090;
}

.run-button:disabled {
	opacity: 0.65;
	cursor: not-allowed;
}

.settings-button {
	padding: 1px 5px;
	border: 1px solid #ccc;
	border-radius: 3px;
	background: #fff;
	color: #333;
	font-size: 12px;
}

.result {
	max-width: 1170px;
	margin: 0 auto;
	padding-top: 10px;
}

.result textarea {
	background: #eee;
	font-family: monospace;
	font-weight: normal;
}

.result textarea[data-tone="success"] {
	background: #dff0d8;
}

.result textarea[data-tone="warning"] {
	background: #fcf8e3;
}

.result-field {
	display: block;
	margin-bottom: 15px;
	font-weight: 700;
}

.result-inputs,
.result-outputs {
	display: flex;
	gap: 0 30px;
}

.result-inputs {
	flex-direction: row-reverse;
}

.result-inputs > *,
.result-outputs > * {
	flex: 1 1 0;
	min-width: 0;
}

@media (max-width: 767px) {
	.result-inputs {
		flex-direction: column;
	}
}

@media (max-width: 991px) {
	.result-outputs {
		flex-direction: column;
	}
}

.result-stats {
	width: 50%;
	margin: 0 auto 20px;
	overflow: hidden;
	border: 1px solid #ddd;
	border-radius: 4px;
	border-spacing: 0;
	background: #fff;
	color: #333;
	text-align: center;
}

.result-stats th,
.result-stats td {
	padding: 5px;
	border-top: 1px solid #ddd;
}

.result-stats td[data-tone="success"] {
	background: #dff0d8;
}

.result-stats td[data-tone="danger"] {
	background: #f2dede;
}
`;

	// CpToolkit/src/features/easy-test/result-row.css
	var result_row_default = `/* サイトの Bootstrap の有無に左右されないよう、提出欄の下の行は専用のクラスで表示する */
.cp-et-row {
	position: relative;
	margin-bottom: 20px;
	padding: 15px 35px 15px 15px;
	border: 1px solid transparent;
	border-radius: 4px;
	color: #333;
}

.cp-et-row[data-tone="success"] {
	border-color: #d6e9c6;
	background: #dff0d8;
	color: #3c763d;
}

.cp-et-row[data-tone="warning"] {
	border-color: #faebcc;
	background: #fcf8e3;
	color: #8a6d3b;
}

.cp-et-close {
	position: absolute;
	top: 13px;
	right: 14px;
	padding: 0;
	border: 0;
	background: transparent;
	color: inherit;
	font-size: 21px;
	font-weight: 700;
	line-height: 1;
	opacity: 0.2;
	cursor: pointer;
}

.cp-et-close:hover {
	opacity: 0.5;
}

.cp-et-progress {
	height: 20px;
	margin-bottom: 20px;
	overflow: hidden;
	border-radius: 4px;
	background: #f5f5f5;
}

.cp-et-progress-bar {
	width: 0;
	height: 100%;
	background: #337ab7;
	color: #fff;
	font-size: 12px;
	line-height: 20px;
	text-align: center;
	transition: width 0.6s ease;
}

.cp-et-time {
	position: absolute;
	right: 1em;
	font-family: monospace;
	text-align: right;
}

.cp-et-label {
	display: inline-block;
	margin: 3px;
	padding: 0.2em 0.6em 0.3em;
	border-radius: 0.25em;
	background: #777;
	color: #fff;
	font-size: 75%;
	font-weight: 700;
	line-height: 1;
	cursor: pointer;
}

.cp-et-label[data-tone="success"] {
	background: #5cb85c;
}

.cp-et-label[data-tone="warning"] {
	background: #f0ad4e;
}

.cp-et-label[data-tone="danger"] {
	background: #d9534f;
}
`;

	// CpToolkit/src/features/easy-test/saved-code.ts
	var SAVED_CODE_KEY = "easy-test:saved-code";
	var isSavedCodes = isArrayOf(isObjectOf({path: isString, code: isString}));

	class SavedCodes {
		state;
		limit;

		constructor(state, limit) {
			this.state = state;
			this.limit = limit;
		}

		save(path, code) {
			const others = this.list().filter((saved) => saved.path !== path);
			this.state.set(SAVED_CODE_KEY, this.limit > 0 ? [...others, {path, code}].slice(-this.limit) : []);
		}

		find(path) {
			return this.list().find((saved) => saved.path === path)?.code ?? null;
		}

		list() {
			return readStored(this.state, SAVED_CODE_KEY, isSavedCodes, []);
		}
	}

	// CpToolkit/src/features/easy-test/views.ts
	function toneOf(status) {
		if (status === "AC") return "success";
		return status === "OK" ? null : "warning";
	}

	function resultField(label, rows) {
		const textarea = h("textarea", {rows, readOnly: true});
		return {textarea, element: h("label", {className: "result-field"}, label, textarea)};
	}

	function createResultView(translate) {
		const input = resultField(translate("easyTest.standardInput"), 3);
		const expected = resultField(translate("easyTest.expectedOutput"), 3);
		const output = resultField(translate("easyTest.standardOutput"), 5);
		const error = resultField(translate("easyTest.standardError"), 5);
		expected.element.hidden = true;
		error.element.hidden = true;
		const exitCode = h("td");
		const execTime = h("td");
		const memory = h("td");
		const element = h(
			"div",
			{className: "result"},
			h("div", {className: "result-inputs"}, input.element, expected.element),
			h(
				"table",
				{className: "result-stats"},
				h(
					"tbody",
					{},
					h(
						"tr",
						{},
						h("th", {textContent: translate("easyTest.exitCode")}),
						h("th", {textContent: translate("easyTest.execTime")}),
						h("th", {textContent: translate("easyTest.memory")}),
					),
					h("tr", {}, exitCode, execTime, memory),
				),
			),
			h("div", {className: "result-outputs"}, output.element, error.element),
		);
		return {
			element,
			show(result) {
				const tone = toneOf(result.status);
				if (tone) output.textarea.dataset.tone = tone;
				input.textarea.value = result.input;
				output.textarea.value = result.output ?? "";
				if (result.expectedOutput !== undefined) {
					expected.textarea.value = result.expectedOutput;
					expected.element.hidden = false;
				}
				const internalError = result.status === "IE" ? translate("easyTest.internalError") : "";
				const lineOffset =
					result.error && result.lineOffset
						? translate("easyTest.lineOffset").replace(
								"{lines}",
								result.lineOffset > 0 ? `+${result.lineOffset}` : String(result.lineOffset),
							)
						: "";
				const errorText = [internalError, lineOffset, result.error].filter(Boolean).join(`
`);
				if (errorText) {
					error.textarea.value = errorText;
					error.element.hidden = false;
				}
				exitCode.textContent = String(result.exitCode ?? "");
				exitCode.dataset.tone = String(result.exitCode) === "0" ? "success" : "danger";
				execTime.textContent = result.execTime === undefined ? "" : `${result.execTime} ms`;
				if (result.allocatedMemory !== undefined) {
					memory.textContent = `${result.allocatedMemory} KB (${translate("easyTest.allocated")})`;
				} else {
					memory.textContent = result.memory === undefined ? "" : `${result.memory} KB`;
				}
			},
		};
	}

	function createResultRow(total, closeLabel, onClose) {
		const bar = h("div", {className: "cp-et-progress-bar", textContent: `0 / ${total}`});
		const element = h(
			"div",
			{className: "cp-et-row"},
			h("button", {
				type: "button",
				className: "cp-et-close",
				textContent: "×",
				ariaLabel: closeLabel,
				onclick() {
					element.remove();
					onClose();
				},
			}),
			h("div", {className: "cp-et-progress"}, bar),
			h("div", {className: "cp-et-time", textContent: new Date().toTimeString().slice(0, 8)}),
		);
		let finished = 0;
		let accepted = 0;
		return {
			element,
			track(result, onShow) {
				const label = h("div", {className: "cp-et-label", textContent: "WJ", onclick: onShow});
				element.append(label);
				result.then(({status}) => {
					label.textContent = status;
					const tone = status === "IE" ? "danger" : toneOf(status);
					if (tone) label.dataset.tone = tone;
					finished++;
					if (status === "AC") accepted++;
					bar.textContent = `${finished} / ${total}`;
					bar.style.width = `${(100 * finished) / total}%`;
					if (finished === total) element.dataset.tone = accepted === total ? "success" : "warning";
				});
			},
		};
	}

	function formRow(label, control) {
		return h("div", {className: "form-row"}, h("span", {className: "form-row-label", textContent: label}), control);
	}

	function createTestPanel(translate, allowableError, {onRun, onOpenSettings}) {
		const environment = h("select", {className: "environment"});
		const input = h("textarea", {rows: 3});
		const expected = h("textarea", {rows: 3});
		const allowable = h("input", {type: "text", value: allowableError});
		const markAllowable = () => {
			const invalid = useAllowable.checked && parseAllowableError(allowable.value) === null;
			allowable.setAttribute("aria-invalid", String(invalid));
			allowable.title = invalid ? translate("easyTest.invalidAllowableError") : "";
		};
		allowable.addEventListener("input", markAllowable);
		const useAllowable = h("input", {
			type: "checkbox",
			checked: true,
			onchange() {
				allowable.disabled = !useAllowable.checked;
				markAllowable();
			},
		});
		markAllowable();
		const runButton = h("button", {
			type: "button",
			className: "run-button",
			textContent: translate("easyTest.run"),
			onclick: onRun,
		});
		const element = h(
			"div",
			{},
			h(
				"div",
				{className: "test-form"},
				h(
					"div",
					{},
					formRow(translate("easyTest.environment"), environment),
					formRow(translate("easyTest.standardInput"), input),
				),
				h(
					"details",
					{},
					h("summary", {textContent: translate("easyTest.expectedOutput")}),
					formRow(
						translate("easyTest.allowableError"),
						h(
							"div",
							{className: "input-group"},
							h("span", {className: "input-group-addon"}, useAllowable),
							allowable,
						),
					),
					formRow(translate("easyTest.expectedOutput"), expected),
				),
			),
			h(
				"div",
				{className: "test-actions"},
				runButton,
				h("button", {
					type: "button",
					className: "settings-button",
					textContent: translate("settings.open"),
					onclick: onOpenSettings,
				}),
			),
		);
		return {
			element,
			environment,
			input,
			expected,
			allowableError() {
				return useAllowable.checked ? parseAllowableError(allowable.value) : undefined;
			},
			setAllowableErrorLocked(locked) {
				useAllowable.disabled = locked;
				allowable.disabled = locked || !useAllowable.checked;
			},
			setRunnable(runnable) {
				runButton.disabled = !runnable;
			},
		};
	}

	// CpToolkit/src/features/easy-test/index.ts
	var PRECOMPILE_DELAY_MS = 180;
	var featureOptions2 = {
		precompile: option.boolean(true, "easyTest.precompile"),
		savedCodeLimit: option.number(10, "easyTest.savedCodeLimit", {min: 0, integer: true}),
		allowableError: option.text("1e-6", "easyTest.allowableError", {
			validate: (value) => parseAllowableError(value) !== null,
			invalidMessage: "easyTest.invalidAllowableError",
		}),
	};

	class EasyTest {
		dock;
		panel;
		savedCodes;
		buttons = [];
		resultList = h("div", {className: "row"});
		selection;
		session;
		environmentView = {
			show: (candidates, selected) => this.showEnvironment(candidates, selected),
		};
		submitButton;
		activeRuns = 0;
		runnable = false;
		currentRunner = "";
		site;
		context;

		constructor(site, context) {
			this.site = site;
			this.context = context;
			const {options, state, translate, openSettings, runners} = context;
			this.selection = new RunnerSelection(() => site.language(), runners, state);
			this.session = new TestSession(runners, this.selection, {
				onBusyChange: () => this.updateRunnable(),
				onSubmitChange: () => this.showSubmitState(),
			});
			this.savedCodes = new SavedCodes(state, options.savedCodeLimit);
			this.dock = createDock({
				css: easy_test_default,
				toggleLabel: "Easy Test+",
				closeLabel: translate("settings.close"),
			});
			this.panel = createTestPanel(translate, options.allowableError, {
				onRun: () => void this.runPanel(),
				onOpenSettings: openSettings,
			});
			this.dock.addTab("Easy Test+", this.panel.element);
		}

		start() {
			injectStyle(result_row_default);
			this.panel.environment.addEventListener("change", () => {
				this.selection.remember(this.panel.environment.value);
				this.refreshEnvironment();
			});
			this.site.onLanguageChange(() => void this.refreshEnvironment());
			this.refreshEnvironment();
			this.placeButtons();
			this.placeSampleButtons();
			if (this.context.options.precompile) this.watchSource();
			this.registerShortcuts();
		}

		createButton(label, className, onClick) {
			const button = h("button", {
				type: "button",
				className: `btn ${className}`,
				textContent: label,
				onclick: onClick,
			});
			button.classList.toggle("disabled", !this.runnable);
			this.buttons.push(button);
			return button;
		}

		createTestButton(label, className, shortcut, onClick) {
			const button = this.createButton(this.context.translate(label), className, onClick);
			addTooltip(() => button, shortcut);
			button.style.marginLeft = "1rem";
			return button;
		}

		placeButtons() {
			const {translate} = this.context;
			const {testButtons, sideButtons, results} = this.site.mounts;
			if (testButtons instanceof Element) {
				const {shortcuts} = this.context;
				const submitKey = () =>
					this.session.submitPending ? null : shortcuts.keyOf(SHORTCUT_ACTIONS.testAndSubmit);
				this.submitButton = this.createTestButton("easyTest.testAndSubmit", "btn-info", submitKey, () => {
					if (this.session.submitPending) this.session.cancelSubmit();
					else this.testAndSubmit();
				});
				testButtons.append(
					this.submitButton,
					this.createTestButton(
						"easyTest.testAll",
						"btn-default btn-sm",
						() => shortcuts.keyOf(SHORTCUT_ACTIONS.testAll),
						() => void this.testAll(),
					),
				);
			}
			if (sideButtons instanceof Element) {
				sideButtons.append(
					h("a", {
						className: "btn btn-danger btn-sm",
						textContent: translate("easyTest.restore"),
						onclick: () => this.restore(),
					}),
				);
			}
			if (results instanceof Element) results.append(this.resultList);
		}

		placeSampleButtons() {
			this.readSamples().then((samples) => {
				const label = this.context.translate("easyTest.run");
				for (const sample of samples) {
					for (const anchor of sample.anchors) {
						if (!(anchor instanceof Element)) continue;
						const button = this.createButton(
							label,
							"btn-primary btn-sm",
							() => void this.runSample(sample),
						);
						button.style.verticalAlign = "top";
						button.style.marginLeft = "0.5em";
						anchor.after(button);
					}
				}
			});
		}

		watchSource() {
			let timer;
			const prepare = () => {
				const code = this.site.sourceCode();
				const runner = this.selection.local();
				if (code)
					runner?.prepare?.(code)?.catch(() => {
						return;
					});
			};
			const schedule = () => {
				clearTimeout(timer);
				timer = setTimeout(() => void this.selection.settled().then(prepare), PRECOMPILE_DELAY_MS);
			};
			this.site.onSourceChange(schedule);
			schedule();
		}

		registerShortcuts() {
			const {shortcuts} = this.context;
			const handled = (action) => () => {
				action();
				return true;
			};
			shortcuts.register(
				SHORTCUT_ACTIONS.testAndSubmit,
				handled(() => void this.testAndSubmit()),
			);
			shortcuts.register(
				SHORTCUT_ACTIONS.testAll,
				handled(() => void this.testAll()),
			);
			shortcuts.register(
				SHORTCUT_ACTIONS.toggleEasyTest,
				handled(() => this.dock.toggle()),
			);
		}

		refreshEnvironment() {
			return this.selection.refresh(this.environmentView);
		}

		showEnvironment(candidates, selected) {
			const {environment} = this.panel;
			const explicit = this.selection.explicit;
			const automatic = candidates.find(({kind}) => kind === "local") ?? candidates[0];
			const options = candidates.map(({id, label}) => h("option", {value: id, textContent: label}));
			if (automatic)
				options.unshift(
					h("option", {
						value: "",
						textContent: this.context.translate("easyTest.autoRunner") + " — " + automatic.label,
					}),
				);
			else options.push(h("option", {value: "", textContent: this.context.translate("easyTest.noEnvironment")}));
			if (explicit && !candidates.some(({id}) => id === explicit)) {
				options.push(
					h("option", {
						value: explicit,
						textContent: explicit + " — " + this.context.translate("easyTest.noEnvironment"),
					}),
				);
			}
			environment.replaceChildren(...options);
			environment.value = explicit ?? "";
			this.currentRunner = selected ?? "";
			this.updateRunnable();
		}

		updateRunnable() {
			this.runnable = this.site.language() !== null && !this.session.busy;
			this.panel.setRunnable(this.runnable);
			for (const button of this.buttons) button.classList.toggle("disabled", !this.runnable);
			this.showSubmitState();
		}

		showSubmitState() {
			const button = this.submitButton;
			if (!button) return;
			const pending = this.session.submitPending;
			button.textContent = this.context.translate(pending ? "easyTest.cancelSubmit" : "easyTest.testAndSubmit");
			button.classList.toggle("btn-info", !pending);
			button.classList.toggle("btn-warning", pending);
			button.classList.toggle("disabled", !pending && !this.runnable);
		}

		snapshot(allowableError) {
			const explicit = this.selection.explicit;
			return {
				source: this.site.sourceCode(),
				task: this.site.taskUri(),
				language: this.site.language()?.id,
				runner: explicit ?? this.currentRunner,
				explicit,
				allowableError,
			};
		}

		matches(snapshot, checkRunner = true) {
			const current = this.snapshot();
			return (
				current.source === snapshot.source &&
				current.task === snapshot.task &&
				current.language === snapshot.language &&
				current.explicit === snapshot.explicit &&
				(!checkRunner || current.runner === snapshot.runner)
			);
		}

		changed() {
			showActionWarning({
				title: this.context.translate("easyTest.title"),
				detail: this.context.translate("easyTest.submitChanged"),
			});
		}

		async withPreparedRun(run) {
			this.activeRuns++;
			this.panel.setAllowableErrorLocked(true);
			try {
				const allowableError = this.panel.allowableError();
				if (allowableError === null) {
					window.alert(this.context.translate("easyTest.invalidAllowableError"));
					return false;
				}
				if (!(await this.context.paste.settled()) || !this.hasSource()) return false;
				const before = this.snapshot();
				await this.refreshEnvironment();
				if (!this.matches(before, false)) {
					this.changed();
					return false;
				}
				if (!this.selection.candidates.some(({id}) => id === this.currentRunner)) {
					window.alert(this.context.translate("easyTest.noEnvironment"));
					return false;
				}
				return await run(this.snapshot(allowableError));
			} finally {
				if (--this.activeRuns === 0) this.panel.setAllowableErrorLocked(false);
			}
		}

		execute(testCase, options, snapshot) {
			this.savedCodes.save(snapshot.task, snapshot.source);
			const view = createResultView(this.context.translate);
			const tab = this.dock.addTab(`#${this.session.nextNumber()} ${testCase.title}`, view.element, {
				closable: true,
			});
			const result = this.session.start(
				testCase,
				snapshot.source,
				snapshot.runner,
				snapshot.allowableError,
				options,
			);
			result.then((value) => {
				view.show(value);
				const tone = toneOf(value.status);
				if (tone) tab.setTone(tone);
			});
			return {result, tab};
		}

		hasSource() {
			if (this.site.sourceCode()) return true;
			window.alert(this.context.translate("easyTest.noSource"));
			return false;
		}

		runPanel() {
			return this.withPreparedRun((snapshot) => {
				const {input, expected} = this.panel;
				return this.execute({title: "Run", input: input.value, output: expected.value || null}, {}, snapshot)
					.result;
			});
		}

		runSample(sample) {
			return this.withPreparedRun(async (snapshot) => {
				const {result, tab} = this.execute(sample, {}, snapshot);
				await result;
				tab.show();
			});
		}

		readSamples() {
			return this.site.samples().catch(() => []);
		}

		async runSamples(snapshot, onClose) {
			const samples = await this.readSamples();
			if (samples.length === 0) {
				window.alert(this.context.translate("easyTest.noSamples"));
				return false;
			}
			if (!this.matches(snapshot)) {
				this.changed();
				return false;
			}
			const runGroupId = crypto.randomUUID();
			const executions = samples.map((sample) => this.execute(sample, {runGroupId}, snapshot));
			executions[0]?.tab.select();
			const row = createResultRow(samples.length, this.context.translate("settings.close"), () => {
				for (const {tab} of executions) tab.close();
				onClose?.();
			});
			this.resultList.prepend(row.element);
			for (const {result, tab} of executions) row.track(result, () => tab.show());
			const results = await Promise.all(executions.map(({result}) => result));
			return results.every(({status}) => status === "AC");
		}

		testAll() {
			return this.withPreparedRun((snapshot) => this.runSamples(snapshot));
		}

		async testAndSubmit() {
			let tested = null;
			await this.session.testAndSubmit(
				(cancel) =>
					this.withPreparedRun(async (snapshot) => {
						tested = snapshot;
						return (await this.runSamples(snapshot, cancel)) && (await this.context.paste.settled());
					}),
				() => {
					if (tested && this.matches(tested)) this.site.submit();
					else this.changed();
				},
			);
		}

		restore() {
			const {translate} = this.context;
			const code = this.savedCodes.find(this.site.taskUri());
			if (code === null) {
				window.alert(translate("easyTest.noSavedCode"));
			} else if (!this.site.sourceCode() || window.confirm(translate("easyTest.restoreConfirm"))) {
				this.site.setSourceCode(code);
			}
		}
	}

	var easyTest = defineFeature({
		id: "easy-test",
		title: "easyTest.title",
		description: "easyTest.description",
		category: "category.execution",
		defaultEnabled: false,
		routes: ["atcoder:task", "atcoder:submit", "yukicoder:problem", "codeforces:problem"],
		phase: "ready",
		options: featureOptions2,
		async start(context) {
			const site = await context.judgeSite();
			if (site) new EasyTest(site, context).start();
		},
	});

	// CpToolkit/src/features/editorial-list/index.ts
	var EDITORIAL_LINK_PATTERN = /\/contests\/[^/]+\/editorial\/\d+$/;
	var EDITORIAL_BODY = "#main-container > div.row > div:nth-child(2)";
	var LOAD_INTERVAL_MS = 500;
	var css = `.cp-editorial {margin-top: 0.3em; font-size: smaller;}
${EDITORIAL_BODY} > ul > li {font-size: larger;}
pre code {tab-size: 4;}`;

	async function loadLibraries({scripts}) {
		await Promise.all([
			scripts.loadStylesheet(libraries.katexStylesheet),
			scripts.loadStylesheet(libraries.prettifyStylesheet),
		]);
		await scripts.loadScript(libraries.katexScript);
		await Promise.all([scripts.loadScript(libraries.katexAutoRender), scripts.loadScript(libraries.prettify)]);
	}

	async function loadEditorial(link, {site, page}) {
		const response = await site.send({url: link.href});
		if (response.status !== 200) throw new Error(`Failed to load ${link.href}`);
		const parsed = new DOMParser().parseFromString(response.text, "text/html");
		const content = parsed.querySelector(`${EDITORIAL_BODY} > div:nth-of-type(1)`);
		if (!content) throw new Error(`Editorial was not found in ${link.href}`);
		const history = parsed.querySelector(`${EDITORIAL_BODY} > div:nth-of-type(2)`);
		const container = h("div", {className: "cp-editorial"}, content);
		if (history) container.append(history);
		link.parentElement?.append(container);
		page.renderMath(container);
		page.highlightCode();
	}

	var editorialList = defineFeature({
		id: "editorial-list",
		title: "editorialList.title",
		description: "editorialList.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:editorial"],
		phase: "ready",
		options: {},
		async start(context) {
			const links = [...document.querySelectorAll("a")].filter((link) => {
				const isOwnEditorial = link.origin === location.origin && EDITORIAL_LINK_PATTERN.test(link.pathname);
				return isOwnEditorial && !link.classList.contains("spoiler");
			});
			if (links.length === 0) return;
			injectStyle(css);
			await loadLibraries(context);
			const queue = new Set();
			let timer;
			const loadNext = () => {
				const [link] = queue;
				if (!link) {
					clearInterval(timer);
					timer = undefined;
					return;
				}
				queue.delete(link);
				observer.unobserve(link);
				loadEditorial(link, context).catch((error) => console.warn(error));
			};
			const observer = new IntersectionObserver((entries) => {
				for (const {target, isIntersecting} of entries) {
					if (!(target instanceof HTMLAnchorElement)) continue;
					if (isIntersecting) queue.add(target);
					else queue.delete(target);
				}
				timer ??= setInterval(loadNext, LOAD_INTERVAL_MS);
			});
			for (const link of links) observer.observe(link);
		},
	});

	// CpToolkit/src/domain/statement/sample.ts
	function isSampleTitle(sampleHeadings, title) {
		return sampleHeadings.some((heading) => title.includes(heading));
	}

	// CpToolkit/src/features/efficient-layout/efficient-layout.css
	var efficient_layout_default = `.io-style {
	display: flex;
	justify-content: space-between;
}

.io-style > * {
	width: 100%;
}

/* KaTeX の非表示の MathML は absolute なので、基準を置かないと枠で切られずページごと横に広がる */
.cp-samples-container {
	position: relative;
	width: 100%;
	overflow-x: auto;
	container-type: inline-size;
}

.cp-samples-row {
	display: flex;
}

.cp-samples-row > * {
	margin: 0 1em;
}

.cp-samples-row[data-width="fixed"] > * {
	width: var(--cp-sample-width);
}

/* 中身の最長行に合わせ、下限と上限の間に収める。画面に収まるときは余白を分け合う。
   組が少ないときに上限で折り返さないように、画面を組数で割った幅までは上限を超えて広げる */
.cp-samples-row[data-width="auto"] {
	width: max-content;
	min-width: 100%;
}

.cp-samples-row[data-width="auto"] > * {
	flex: 1 0 auto;
	width: max-content;
	min-width: 15vw;
	max-width: max(var(--cp-sample-max-width), calc(100cqw / var(--cp-sample-count) - 2em));
}

/* 上限を超える長い行は、その例の中で横にスクロールする */
.cp-samples-row[data-width="auto"] pre {
	overflow-x: auto;
}
`;

	// CpToolkit/src/features/efficient-layout/index.ts
	function createDetails(summary) {
		return h("details", {open: true}, h("summary", {textContent: summary}));
	}

	function createSampleRow(parent, translate) {
		const existing = parent.querySelector(".cp-samples-row");
		if (existing) return existing;
		const container = createDetails(translate("efficientLayout.samples"));
		container.className = "cp-samples-container";
		const row = h("div", {className: "cp-samples-row"});
		container.append(row);
		parent.append(container);
		return row;
	}

	function isSamplePart(element) {
		if (!element.classList.contains("part")) return false;
		return isSampleTitle(statementCatalog.sampleHeadings, element.querySelector("h3")?.textContent ?? "");
	}

	function arrangeSamples(ioStyle, translate) {
		const parent = ioStyle.parentElement;
		if (!parent) return;
		const siblings = [...parent.children];
		const following = siblings.slice(siblings.indexOf(ioStyle) + 1);
		for (const element of following) {
			if (element.tagName === "HR") element.remove();
		}
		const samples = following.filter(isSamplePart);
		const groupSize = samples.length % 2 === 0 ? 2 : 1;
		for (let index = 0; index < samples.length; index += groupSize) {
			const group = samples.slice(index, index + groupSize);
			createSampleRow(parent, translate).append(...(groupSize === 2 ? [h("div", {}, ...group)] : group));
		}
	}

	var efficientLayout = defineFeature({
		id: "efficient-layout",
		title: "efficientLayout.title",
		description: "efficientLayout.description",
		category: "category.statement",
		defaultEnabled: false,
		routes: ["atcoder:task", "atcoder:tasksPrint"],
		phase: "ready",
		options: {
			widthMode: option.select("auto", "efficientLayout.widthMode", [
				{value: "auto", label: "efficientLayout.widthModeAuto"},
				{value: "fixed", label: "efficientLayout.widthModeFixed"},
			]),
			sampleWidth: option.number(23, "efficientLayout.sampleWidth", {min: 10, max: 100}),
			maxSampleWidth: option.number(40, "efficientLayout.maxSampleWidth", {min: 10, max: 100}),
		},
		start({options, translate}) {
			for (const ioStyle of document.querySelectorAll(".io-style")) {
				arrangeSamples(ioStyle, translate);
				const details = createDetails(translate("efficientLayout.ioFormat"));
				ioStyle.before(details);
				details.append(ioStyle);
			}
			injectStyle(`:root {--cp-sample-width: ${options.sampleWidth}vw; --cp-sample-max-width: ${options.maxSampleWidth}vw;}
${efficient_layout_default}`);
			for (const row of document.querySelectorAll(".cp-samples-row")) {
				row.dataset.width = options.widthMode;
				if (options.widthMode === "fixed")
					row.style.width = `calc(var(--cp-sample-width) * ${row.children.length})`;
				else row.style.setProperty("--cp-sample-count", String(row.children.length));
			}
		},
	});

	// CpToolkit/src/features/hover-menu/index.ts
	var OPEN_CLASS = "open";
	var ACTIVE_CLASS = "active";
	var hoverMenu = defineFeature({
		id: "hover-menu",
		title: "hoverMenu.title",
		description: "hoverMenu.description",
		category: "category.layout",
		defaultEnabled: true,
		routes: ["atcoder:page"],
		phase: "ready",
		options: {},
		live: true,
		start() {
			const controller = new AbortController();
			const {signal} = controller;
			for (const item of document.querySelectorAll(".nav > li:not(.pull-right)")) {
				item.addEventListener("mouseenter", () => item.classList.add(OPEN_CLASS), {signal});
				item.addEventListener("mouseleave", () => item.classList.remove(OPEN_CLASS), {signal});
			}
			for (const wrapper of document.querySelectorAll(".j-dropdown_mypage")) {
				const button = wrapper.querySelector(".header-mypage_btn");
				if (!button) continue;
				wrapper.addEventListener(
					"mouseenter",
					() => {
						if (!button.classList.contains(ACTIVE_CLASS)) button.click();
					},
					{signal},
				);
				wrapper.addEventListener(
					"mouseleave",
					() => {
						if (button.classList.contains(ACTIVE_CLASS)) button.click();
					},
					{signal},
				);
			}
			return () => controller.abort();
		},
	});

	// CpToolkit/src/application/ports/code-editor.ts
	var EDITOR_SETUP_DELAY_MS = 500;

	// CpToolkit/src/features/keyboard-shortcuts/index.ts
	var SHARE_URL = "https://x.com/intent/post";
	var NOTICE_DURATION_MS2 = 2000;
	var SAMPLE_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
	var TASK_LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
	var SAMPLE_ROUTES = ["atcoder:task", "atcoder:submit", "codeforces:problem", "yukicoder:problem"];
	var GLOBAL = {title: "keyboardShortcuts.groupGlobal"};
	var EDITOR = {title: "keyboardShortcuts.groupEditor"};
	var PROBLEM = {
		title: "keyboardShortcuts.groupProblem",
		note: {message: "keyboardShortcuts.groupProblemNote", sites: ["atcoder"]},
	};
	var CONTEST = {title: "keyboardShortcuts.groupContest"};
	var shortcutOption = (defaultValue, label, group) => {
		return option.shortcut(defaultValue, label, {group});
	};
	var modifierOption = (defaultValue, label, group, suffixes) => {
		return option.shortcut(defaultValue, label, {group, suffixes});
	};
	var PAGE_KEYS = {
		openTasks: "tasks",
		openMySubmissions: "mySubmissions",
		openStandings: "standings",
		openEditorial: "editorial",
		openCustomTest: "customTest",
	};
	var NOT_YUKICODER = ["atcoder", "codeforces", "aoj", "libraryChecker", "paiza"];
	var EASY_TEST_SITES = ["atcoder", "codeforces", "yukicoder"];
	var ATCODER = ["atcoder"];
	var CONTEST_SITES = ["atcoder", "codeforces"];
	var featureOptions3 = {
		openSettings: shortcutOption("Ctrl+I", "keyboardShortcuts.openSettings", GLOBAL),
		submit: shortcutOption("Ctrl+Shift+Enter", "keyboardShortcuts.submit", EDITOR),
		fold: onSites(shortcutOption("Ctrl+Shift+[", "keyboardShortcuts.fold", EDITOR), NOT_YUKICODER),
		unfold: onSites(shortcutOption("Ctrl+Shift+]", "keyboardShortcuts.unfold", EDITOR), NOT_YUKICODER),
		testAndSubmit: onSites(
			shortcutOption("Ctrl+Enter", "keyboardShortcuts.testAndSubmit", PROBLEM),
			EASY_TEST_SITES,
		),
		testAll: onSites(shortcutOption("Alt+Enter", "keyboardShortcuts.testAll", PROBLEM), EASY_TEST_SITES),
		toggleEasyTest: onSites(
			shortcutOption("Ctrl+Shift+Alt+D", "keyboardShortcuts.toggleEasyTest", PROBLEM),
			EASY_TEST_SITES,
		),
		copyInput: onSites(
			modifierOption("Ctrl+Alt", "keyboardShortcuts.copyInput", PROBLEM, SAMPLE_NUMBERS),
			EASY_TEST_SITES,
		),
		copyOutput: onSites(
			modifierOption("Ctrl+Shift+Alt", "keyboardShortcuts.copyOutput", PROBLEM, SAMPLE_NUMBERS),
			EASY_TEST_SITES,
		),
		copyStatement: onSites(shortcutOption("Ctrl+Shift+Alt+P", "keyboardShortcuts.copyStatement", PROBLEM), ATCODER),
		previousTask: onSites(
			shortcutOption("Ctrl+Shift+Alt+Left", "keyboardShortcuts.previousTask", PROBLEM),
			CONTEST_SITES,
		),
		nextTask: onSites(shortcutOption("Ctrl+Shift+Alt+Right", "keyboardShortcuts.nextTask", PROBLEM), CONTEST_SITES),
		openTask: onSites(
			modifierOption("Ctrl+Alt", "keyboardShortcuts.openTask", CONTEST, TASK_LETTERS),
			CONTEST_SITES,
		),
		openTasks: onSites(shortcutOption("Ctrl+Shift+Alt+T", "keyboardShortcuts.openTasks", CONTEST), CONTEST_SITES),
		openMySubmissions: onSites(
			shortcutOption("Ctrl+Shift+Alt+S", "keyboardShortcuts.openMySubmissions", CONTEST),
			CONTEST_SITES,
		),
		openStandings: onSites(
			shortcutOption("Ctrl+Shift+Alt+R", "keyboardShortcuts.openStandings", CONTEST),
			CONTEST_SITES,
		),
		openEditorial: onSites(shortcutOption("Ctrl+Shift+Alt+E", "keyboardShortcuts.openEditorial", CONTEST), ATCODER),
		openCustomTest: onSites(
			shortcutOption("Ctrl+Shift+Alt+C", "keyboardShortcuts.openCustomTest", CONTEST),
			CONTEST_SITES,
		),
		acByTime: onSites(shortcutOption("Ctrl+Shift+Alt+F", "keyboardShortcuts.acByTime", PROBLEM), ATCODER),
		acByLength: onSites(shortcutOption("Ctrl+Shift+Alt+L", "keyboardShortcuts.acByLength", PROBLEM), ATCODER),
		acByCreated: onSites(shortcutOption("Ctrl+Shift+Alt+N", "keyboardShortcuts.acByCreated", PROBLEM), ATCODER),
		acByMemory: onSites(shortcutOption("Ctrl+Shift+Alt+M", "keyboardShortcuts.acByMemory", PROBLEM), ATCODER),
		share: shortcutOption("Ctrl+Shift+Alt+X", "keyboardShortcuts.share", GLOBAL),
	};
	var keyboardShortcuts = defineFeature({
		id: "keyboard-shortcuts",
		title: "keyboardShortcuts.title",
		description: "keyboardShortcuts.description",
		category: "category.execution",
		defaultEnabled: true,
		routes: [
			"atcoder:page",
			"atcoder:home",
			"codeforces:page",
			"aoj:page",
			"libraryChecker:page",
			"paiza:page",
			"yukicoder:problem",
		],
		phase: "ready",
		options: featureOptions3,
		start(services) {
			const {options, judge, openSettings, shortcuts, isOnRoute, translate} = services;
			const notice = (title, tone) => {
				showToast({title, detail: "", tone, durationMs: NOTICE_DURATION_MS2});
			};
			const handlers = {};
			const prefixHandlers = {};
			const hasSamples = SAMPLE_ROUTES.some((route) => isOnRoute(route));
			const copySample = (number, part) => {
				if (!hasSamples) return false;
				services.samples().then((samples) => {
					const sample = samples[Number(number) - 1];
					const text = part === "input" ? sample?.input : sample?.output;
					const label = translate(
						part === "input" ? "keyboardShortcuts.sampleInput" : "keyboardShortcuts.sampleOutput",
					).replace("{number}", number);
					if (text === undefined || text === null) {
						notice(translate("keyboardShortcuts.sampleMissing").replace("{sample}", label), "warning");
						return;
					}
					services.clipboard.write(text);
					notice(translate("keyboardShortcuts.sampleCopied").replace("{sample}", label), "success");
				});
				return true;
			};
			prefixHandlers.copyInput = {keys: SAMPLE_NUMBERS, handler: (number) => copySample(number, "input")};
			prefixHandlers.copyOutput = {keys: SAMPLE_NUMBERS, handler: (number) => copySample(number, "output")};
			const pages = contestPagesOf(judge?.id, location.pathname);
			const goToTask = (pick) => {
				if (!pages) return false;
				services.contestTasks().then((tasks) => {
					const task = tasks ? pick(tasks) : null;
					if (task) location.assign(task.url);
				});
				return true;
			};
			prefixHandlers.openTask = {
				keys: TASK_LETTERS,
				handler: (letter) => goToTask((tasks) => tasks[TASK_LETTERS.indexOf(letter)]),
			};
			handlers.previousTask = () => goToTask((tasks) => neighborTask(tasks, location.pathname, -1));
			handlers.nextTask = () => goToTask((tasks) => neighborTask(tasks, location.pathname, 1));
			for (const [name, page] of Object.entries(PAGE_KEYS)) {
				handlers[name] = () => {
					const url = pages?.[page];
					if (!url) return false;
					window.open(url, "_blank", "noopener");
					return true;
				};
			}
			for (const [name, id] of Object.entries(SHORTCUT_ACTIONS)) {
				shortcuts.assign(id, normalizeShortcut(options[name]));
				handlers[name] = () => shortcuts.run(id);
			}
			handlers.openSettings = () => {
				openSettings();
				return true;
			};
			handlers.share = () => {
				const url = `${SHARE_URL}?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(location.href)}`;
				window.open(url, "_blank", "noopener");
				return true;
			};
			const target = judge?.submission;
			if (target) {
				let form = null;
				let editor = null;
				services.submissionForm(target).then((ready) => {
					form = ready;
				});
				const submitKey = normalizeShortcut(options.submit);
				if (submitKey)
					addTooltip(
						() => form?.submitButton() ?? null,
						() => submitKey,
					);
				handlers.submit = () => {
					const button = form?.submitButton() ?? null;
					button?.click();
					return button !== null;
				};
				if (normalizeShortcut(options.fold) || normalizeShortcut(options.unfold)) {
					services.editors.locate(target, {delayMs: EDITOR_SETUP_DELAY_MS}).then((located) => {
						editor = located;
					});
				}
				handlers.fold = () => editor?.foldAtCursor?.() ?? false;
				handlers.unfold = () => editor?.unfoldAtCursor?.() ?? false;
			}
			const byKey = new Map();
			const bind = (key, handler) => {
				byKey.set(key, [handler, ...(byKey.get(key) ?? [])]);
			};
			for (const name of Object.keys(featureOptions3)) {
				if (name === "copyInput" || name === "copyOutput" || name === "openTask") {
					const modifiers = normalizeModifiers(options[name]);
					const prefix = prefixHandlers[name];
					if (modifiers && prefix)
						for (const key of prefix.keys) bind(`${modifiers}+${key}`, () => prefix.handler(key));
					continue;
				}
				const key = normalizeShortcut(options[name]);
				const handler = handlers[name];
				if (key && handler) bind(key, handler);
			}
			for (const [key, list] of byKey)
				registerShortcut(key, () => list.some((handler) => handler()), {inTextFields: true});
		},
	});

	// CpToolkit/src/domain/source/comment.ts
	var SHEBANG_PATTERN = /^#![^\n]*\n/;
	var VARIABLE_PATTERN = /\{(\w+)\}/g;

	function fillVariables(text, values) {
		return text.replace(VARIABLE_PATTERN, (match, name) =>
			Object.hasOwn(values, name) ? (values[name] ?? match) : match,
		);
	}

	function toComment(text, {line, open, close}, style) {
		const lines = text.split(`
`);
		const canUseBlock = open !== undefined && close !== undefined && !text.includes(close);
		if (canUseBlock && style === "block")
			return [open, ...lines, close].join(`
`);
		if (line !== undefined)
			return lines.map((item) => (item ? `${line} ${item}` : line)).join(`
`);
		return canUseBlock
			? lines.map((item) => `${open} ${item} ${close}`).join(`
`)
			: null;
	}

	function isWholeCode(code, pasted) {
		return normalizeNewlines(code).trim() === normalizeNewlines(pasted).trim();
	}

	function headerOffset(code, {preamble}) {
		const head = SHEBANG_PATTERN.exec(code) ?? (preamble === undefined ? null : new RegExp(preamble).exec(code));
		return head?.[0].length ?? 0;
	}

	function insertHeader(code, block, syntax) {
		const offset = headerOffset(code, syntax);
		return `${code.slice(0, offset)}${block}${code.slice(offset)}`;
	}

	function footerOffset(code, {trailer}) {
		return (trailer === undefined ? null : new RegExp(trailer).exec(code))?.index ?? code.length;
	}

	function insertFooter(code, block, syntax) {
		const end = footerOffset(code, syntax);
		const body = code.slice(0, end).trimEnd();
		return `${body}${
			body
				? `
`
				: ""
		}${block}${code.slice(end)}`;
	}

	function replaceBlock(code, current, next, fromEnd, syntax = {}) {
		const index = fromEnd ? footerOffset(code, syntax) - current.length : headerOffset(code, syntax);
		if (
			index < 0 ||
			!current ||
			!code.startsWith(current, index) ||
			(index > 0 &&
				code[index - 1] !==
					`
`)
		)
			return null;
		return `${code.slice(0, index)}${next}${code.slice(index + current.length)}`;
	}

	// CpToolkit/src/application/source/submission-transform.ts
	var debugFlagSupport = (family) => ({
		fallback(code, {debugFlag}) {
			if (debugFlag === "") return {sourceCode: code, issue: null};
			const sourceCode = rewriteDebugFlag(code, debugFlag, false, family);
			return sourceCode === null ? {sourceCode: code, issue: "ambiguousDebugFlag"} : {sourceCode, issue: null};
		},
	});
	var LANGUAGE_SUPPORT = {
		...Object.fromEntries(DEBUG_FLAG_FAMILIES.map((family) => [family, debugFlagSupport(family)])),
		java: {
			fallback: (code, {debugFlag}) => transformJavaForSubmission(code, {debugFlag}),
			needsLocalRunner: (code, {libraryPackage}) => libraryPackage !== "" && importsPackage(code, libraryPackage),
			unresolvedImports,
		},
	};

	function languageSupport(family) {
		return LANGUAGE_SUPPORT[family] ?? {};
	}

	async function transformSubmission(code, language, localRunner, options) {
		if (localRunner.isAvailable()) {
			try {
				const compilerName = await localRunner.compilerFor(language);
				if (compilerName !== null) {
					const transformed = await localRunner.transform(code, compilerName);
					if (transformed.status === "success")
						return {sourceCode: transformed.sourceCode, via: "localRunner", failure: null};
					return {
						sourceCode: code,
						via: "localRunner",
						failure: {
							diagnostics: transformed.diagnostics,
							items: transformed.diagnosticItems,
							diagnosticSource: transformed.sourceCode,
						},
					};
				}
			} catch (error) {
				if (!(error instanceof LocalRunnerError && error.status === 0)) {
					return {
						sourceCode: code,
						via: "localRunner",
						failure: {
							diagnostics: error instanceof Error ? error.message : String(error),
							items: [],
							notify: !(error instanceof LocalRunnerError) || error.notify,
						},
					};
				}
			}
		}
		const fallback = languageSupport(language.family).fallback;
		if (!fallback) return {sourceCode: code, via: "none", failure: null};
		const {sourceCode, issue} = fallback(code, options);
		const reasons = {
			ambiguousDebugFlag: "More than one declaration of the debug flag was found outside blocks.",
			mainNotFound: "No supported Java main method was found.",
			ambiguousMain: "More than one Java entry point was found.",
			nameCollision: "Renaming the entry class would cause a name collision.",
			ambiguousReference: "The browser cannot reliably resolve references to the entry class.",
			unsupportedSyntax: "This Java syntax requires Local Runner for a safe transform.",
		};
		return {sourceCode, via: "fallback", failure: issue ? {diagnostics: reasons[issue], items: []} : null};
	}

	// CpToolkit/src/features/submission-helper/index.ts
	var FOLD_DELAY_MS = 100;
	var PASTE_ORDER = 10;
	var LOCAL_RUNNER_GUIDE_URL = "https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner";

	function notifyTransformProblem(code, {family}, {failure, via}, options, translate) {
		const support = languageSupport(family);
		if (failure) {
			if (failure.notify === false) return;
			const imports = support.unresolvedImports?.(failure.diagnosticSource ?? code, failure.items) ?? [];
			const firstError = failure.items.find((item) => item.kind === "ERROR");
			showActionWarning({
				title: translate(
					via === "fallback"
						? "submissionHelper.fallbackFailed"
						: imports.length > 0
							? "submissionHelper.unresolvedImports"
							: "submissionHelper.transformFailed",
				),
				detail:
					imports.length > 0
						? imports.join(`
`)
						: (firstError?.message ??
							failure.diagnostics.split(
								`
`,
								1,
							)[0] ??
							""),
				...(failure.diagnostics && {
					more: {label: translate("submissionHelper.diagnostics"), text: failure.diagnostics},
				}),
			});
		} else if (via !== "localRunner" && support.needsLocalRunner?.(code, options)) {
			showActionWarning({
				title: translate("submissionHelper.localRunnerRequired").replace("{package}", options.libraryPackage),
				detail: translate("submissionHelper.localRunnerGuide"),
				href: LOCAL_RUNNER_GUIDE_URL,
			});
		}
	}

	var submissionHelper = defineFeature({
		id: "submission-helper",
		title: "submissionHelper.title",
		description: "submissionHelper.description",
		category: "category.execution",
		defaultEnabled: false,
		routes: [
			"atcoder:task",
			"atcoder:submit",
			"atcoder:customTest",
			"codeforces:page",
			"aoj:page",
			"libraryChecker:page",
			"paiza:page",
			"yukicoder:problem",
		],
		phase: "ready",
		options: {
			debugFlag: sharedAcrossSites(
				option.text("", "submissionHelper.debugFlag", {
					validate: (value) => value === "" || isIdentifier(value),
					invalidMessage: "submissionHelper.debugFlagInvalid",
				}),
			),
			libraryPackage: sharedAcrossSites(
				option.text("", "submissionHelper.libraryPackage", {
					validate: (value) => value === "" || isJavaQualifiedName(value),
					invalidMessage: "submissionHelper.libraryPackageInvalid",
				}),
			),
			foldOnPaste: option.boolean(false, "submissionHelper.foldOnPaste"),
		},
		async start(services) {
			const {options, judge, editors, localRunner, paste, translate, submissionForm} = services;
			const target = judge?.submission;
			if (!target) return;
			const form = await submissionForm(target);
			form.holdSubmitWhile(paste, () =>
				showActionWarning({title: translate("submissionHelper.submitChanged"), detail: ""}),
			);
			const languageOf = (editor) => {
				const language = form.language(editor);
				return language?.family ? {...language, family: language.family} : null;
			};
			const fallbackOptions = {
				debugFlag: options.debugFlag.trim(),
				libraryPackage: options.libraryPackage.trim(),
			};
			const lookup = {delayMs: EDITOR_SETUP_DELAY_MS};
			editors.locate(target, lookup).then((editor) => {
				if (editor) form.observe(editor);
			});
			paste.add(target, lookup, {
				order: PASTE_ORDER,
				contextKey: form.contextKey,
				async transform(code, {editor, pasted, original, isCurrent}) {
					if (!isWholeCode(original, pasted)) return code;
					const language = languageOf(editor);
					if (!language) return code;
					const result = await transformSubmission(code, language, localRunner, fallbackOptions);
					if (!isCurrent()) return code;
					notifyTransformProblem(code, language, result, fallbackOptions, translate);
					if (result.failure) throw new Error(result.failure.diagnostics);
					return result.sourceCode;
				},
				applied(editor) {
					if (!options.foldOnPaste) return;
					const key = form.contextKey(editor);
					const code = editor.getValue();
					setTimeout(() => {
						if (key === form.contextKey(editor) && editor.getValue() === code) editor.foldTopLevel();
					}, FOLD_DELAY_MS);
				},
			});
		},
	});

	// CpToolkit/src/application/execution/pinned-languages.ts
	var PINNED_KEY = "language-buttons:pinned";
	var isPinned = isArrayOf(isString);

	class PinnedLanguages {
		state;

		constructor(state) {
			this.state = state;
		}

		ids() {
			return new Set(readStored(this.state, PINNED_KEY, isPinned, []));
		}

		set(id, pinned) {
			const ids = new Set(this.ids());
			if (pinned) ids.add(id);
			else ids.delete(id);
			this.state.set(PINNED_KEY, [...ids]);
		}
	}

	// CpToolkit/src/features/language-buttons/language-bar.css
	var language_bar_default = `/* サイトは選択欄の幅を作成時のピクセルで固定するので、画面の大きさを変えても列に合わせる */
#select-lang .select2-container {
	width: 100% !important;
}

.cp-language-bar {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 4px;
}
`;

	// CpToolkit/src/features/language-buttons/language-buttons.css
	var language_buttons_default = `.language-hint {
	margin: 0 0 12px;
	color: var(--cp-text-muted);
	font-size: 13px;
}

.language-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 4px 16px;
}

.language-option {
	display: flex;
	align-items: center;
	gap: 8px;
}

.modal-footer:empty {
	display: none;
}
`;

	// CpToolkit/src/features/language-buttons/index.ts
	function fitToRow(bar, column) {
		const row = column.closest(".form-group") ?? column.parentElement;
		if (!row) return;
		new ResizeObserver(() => {
			const right = row.getBoundingClientRect().right - (parseFloat(getComputedStyle(column).paddingRight) || 0);
			const width = Math.floor(right - bar.getBoundingClientRect().left);
			bar.style.width = width > 0 ? `${width}px` : "";
		}).observe(row);
	}

	var languageButtons = defineFeature({
		id: "language-buttons",
		title: "languageButtons.title",
		description: "languageButtons.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:task", "atcoder:submit", "atcoder:customTest"],
		phase: "ready",
		options: {},
		async start({judgeSite, state, translate}) {
			const container = document.querySelector("#select-lang");
			const site = await judgeSite();
			if (!container || !site) return;
			const pinned = new PinnedLanguages(state);
			const bar = h("span", {className: "cp-language-bar"});
			injectStyle(language_bar_default);
			const render = () => {
				const pinnedIds = pinned.ids();
				const currentId = site.language()?.id;
				bar.replaceChildren(
					...site
						.languages()
						.filter(({id}) => pinnedIds.has(id))
						.map(({id, label}) =>
							h("button", {
								type: "button",
								className: `btn btn-sm ${id === currentId ? "btn-success" : "btn-default"}`,
								textContent: label,
								onclick: () => site.selectLanguage(id),
							}),
						),
					configButton,
				);
			};
			const modal = createModal({
				title: translate("languageButtons.title"),
				closeLabel: translate("settings.close"),
				css: language_buttons_default,
			});
			const openConfig = () => {
				const pinnedIds = pinned.ids();
				const options = site.languages().map(({id, label}) => {
					const checkbox = h("input", {type: "checkbox", checked: pinnedIds.has(id)});
					checkbox.addEventListener("change", () => {
						pinned.set(id, checkbox.checked);
						render();
					});
					return h("label", {className: "language-option"}, checkbox, label);
				});
				modal.body.replaceChildren(
					h("p", {className: "language-hint", textContent: translate("languageButtons.hint")}),
					h("div", {className: "language-list"}, ...options),
				);
				modal.open();
			};
			const configButton = h(
				"button",
				{
					type: "button",
					className: "btn btn-default btn-sm",
					title: translate("languageButtons.configure"),
					ariaLabel: translate("languageButtons.configure"),
					onclick: openConfig,
				},
				h("span", {className: "glyphicon glyphicon-cog"}),
			);
			container.append(bar);
			fitToRow(bar, container);
			render();
			site.onLanguageChange(render);
		},
	});

	// CpToolkit/src/application/contest/latest-contests.ts
	var CACHE_KEY3 = "latest-contests:cache";
	var HOME_URL = "/home";
	var MINUTE_MS = 60 * 1000;
	var isCache = isObjectOf({
		fetchedAt: isNumber,
		contests: isArrayOf(
			isObjectOf({
				id: isString,
				name: isString,
				marks: isArrayOf(isObjectOf({text: isString, className: isString, title: isString})),
			}),
		),
	});

	async function loadLatestContests(cacheMinutes, {site, state, parse, now}) {
		const cache = readStored(state, CACHE_KEY3, isCache, null);
		if (cache && now - cache.fetchedAt < cacheMinutes * MINUTE_MS) return cache.contests;
		const response = await site.send({url: HOME_URL});
		if (response.status !== 200) throw new Error(`Failed to load ${HOME_URL}`);
		const contests = parse(response.text);
		if (contests.length > 0) state.set(CACHE_KEY3, {fetchedAt: now, contests});
		return contests;
	}

	// CpToolkit/src/features/latest-contests/latest-contests.css
	var latest_contests_default = `.cp-latest {
	position: relative;
}

/* トップページなどのヘッダーは、項目を1つ足すと幅 1024px 前後で2段に折り返すので、項目の間隔を画面幅に合わせて詰める */
@media (min-width: 1024px) {
	#header .header-sub_page:has(> .cp-latest) > li {
		padding-right: min(22px, 1.4vw);
		padding-left: min(22px, 1.4vw);
	}
}

.cp-latest-menu {
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 1000;
	min-width: 120px;
	max-width: min(480px, 90vw);
	width: max-content;
	margin: 0;
	padding: 5px 0;
	border: 1px solid rgba(0, 0, 0, .15);
	border-radius: 4px;
	background: #fff;
	box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
	list-style: none;
}

.cp-latest:hover > .cp-latest-menu,
.cp-latest:focus-within > .cp-latest-menu {
	display: block;
}

/* ヘッダーのメニューの指定を打ち消す */
.cp-latest-menu > li {
	display: block !important;
	float: none !important;
	margin: 0 !important;
	padding: 0 !important;
	border: 0 !important;
}

#header .cp-latest-menu > li > a,
.cp-latest-menu > li > a {
	display: block !important;
	padding: 3px 20px !important;
	border: 0 !important;
	overflow: hidden;
	color: #333 !important;
	font-size: 14px !important;
	line-height: 1.6 !important;
	white-space: nowrap;
	text-overflow: ellipsis;
}

#header .cp-latest-menu > li > a:hover,
.cp-latest-menu > li > a:hover {
	background: #f5f5f5;
	color: #262626 !important;
	text-decoration: none;
}

.cp-latest-name {
	color: #337ab7;
}

.cp-latest-menu a:hover .cp-latest-name {
	color: #23527c;
}

.cp-latest-menu .label {
	margin-right: 4px;
}

.cp-latest-message {
	padding: 3px 20px !important;
	color: #777;
	font-size: 14px;
	white-space: nowrap;
}
`;

	// CpToolkit/src/features/latest-contests/index.ts
	var CONTEST_LIST_PATH = "/contests/";

	function marksBefore(link) {
		const marks = [];
		for (let mark = link.previousElementSibling; mark?.tagName === "SPAN"; mark = mark.previousElementSibling) {
			marks.unshift({
				text: mark.textContent ?? "",
				className: mark.className,
				title: mark.getAttribute("title") ?? "",
			});
		}
		return marks;
	}

	function parseNextContests(html) {
		const page = new DOMParser().parseFromString(html, "text/html");
		return [...page.querySelectorAll("tbody tr")].flatMap((row) => {
			const heading = row.firstElementChild;
			if (heading?.tagName !== "TH") return [];
			return [...row.querySelectorAll('a[href^="/contests/"]')].flatMap((link) => {
				const id = link.getAttribute("href")?.split("/")[2];
				return id ? [{id, name: link.textContent?.trim() ?? id, marks: marksBefore(link)}] : [];
			});
		});
	}

	function createContestItem({id, name, marks}) {
		return h(
			"li",
			{},
			h(
				"a",
				{href: `${CONTEST_LIST_PATH}${id}`},
				...marks.map(({text, className, title}) => h("span", {textContent: text, className, title})),
				" ",
				h("span", {className: "cp-latest-name", textContent: name}),
			),
		);
	}

	function createMessage(text) {
		return h("li", {className: "cp-latest-message", textContent: text});
	}

	var latestContests = defineFeature({
		id: "latest-contests",
		title: "latestContests.title",
		description: "latestContests.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:page", "atcoder:home"],
		phase: "ready",
		options: {},
		live: true,
		start({site, state, translate}) {
			const {menuTargets, cacheMinutes} = contestCatalog.latest;
			const target = menuTargets.map((selector) => document.querySelector(selector)).find(Boolean);
			if (!target)
				return () => {
					return;
				};
			const style = injectStyle(latest_contests_default);
			const toggle = h(
				"a",
				{href: CONTEST_LIST_PATH},
				h("span", {textContent: translate("latestContests.menu")}),
			);
			const menu = h("ul", {className: "cp-latest-menu"}, createMessage(translate("latestContests.loading")));
			const item = h("li", {className: "cp-latest"}, toggle, menu);
			target.append(item);
			const resolve = async () => {
				const contests = await loadLatestContests(cacheMinutes, {
					site,
					state,
					parse: parseNextContests,
					now: Date.now(),
				}).catch(() => []);
				if (contests.length > 0) menu.replaceChildren(...contests.map(createContestItem));
				else menu.replaceChildren(createMessage(translate("latestContests.failed")));
			};
			item.addEventListener("mouseenter", () => void resolve(), {once: true});
			return () => {
				item.remove();
				style.remove();
			};
		},
	});

	// CpToolkit/src/features/paiza-language/index.ts
	var RETRY_COUNT = 30;
	var RETRY_INTERVAL_MS = 150;
	var AFTER_SELECTION_DELAY_MS = 600;
	var EDITOR_TIMEOUT_MS = 8000;
	var UNLOCK_DURATION_MS = 4000;
	var UNLOCK_INTERVAL_MS = 120;
	var OBSERVE_DURATION_MS = 5000;

	function findLanguageSelect() {
		for (const selector of paizaLanguageSelect.selects) {
			const select = document.querySelector(selector);
			if (select) return select;
		}
		return null;
	}

	function applyOption(select, value, page) {
		select.value = value;
		page.triggerChange(select);
		for (const id of paizaLanguageSelect.hiddenFields) {
			const field = document.getElementById(id);
			if (!(field instanceof HTMLInputElement)) continue;
			field.value = value;
			field.dispatchEvent(new Event("change", {bubbles: true}));
		}
	}

	function selectLanguage(target, page) {
		const select = findLanguageSelect();
		if (!select || select.disabled) return false;
		const option2 = [...select.options].find(({text}) => isLanguageOption(text, target));
		if (!option2) return false;
		const placeholder = [...select.options].find(({value}) => value === "");
		if (placeholder) applyOption(select, placeholder.value, page);
		applyOption(select, option2.value, page);
		return select.value === option2.value;
	}

	function unlockTextInputs() {
		for (const input of document.querySelectorAll(".ace_text-input")) {
			input.removeAttribute("readonly");
			input.disabled = false;
			if (input.tabIndex < 0) input.tabIndex = 0;
		}
	}

	async function unlockEditor({editors, judge}) {
		const target = judge?.submission;
		const editor = target ? await editors.locate(target, {timeoutMs: EDITOR_TIMEOUT_MS}) : null;
		const deadline = Date.now() + UNLOCK_DURATION_MS;
		while (editor?.isReadOnly() && Date.now() < deadline) {
			editor.setWritable();
			unlockTextInputs();
			await sleep(UNLOCK_INTERVAL_MS);
		}
	}

	var paizaLanguage = defineFeature({
		id: "paiza-language",
		title: "paizaLanguage.title",
		description: "paizaLanguage.description",
		category: "category.execution",
		defaultEnabled: true,
		routes: ["paiza:page"],
		phase: "ready",
		options: {
			language: option.text("", "paizaLanguage.language"),
		},
		async start(context) {
			const target = context.options.language.trim().toLowerCase();
			if (!target) return;
			for (let attempt = 0; attempt < RETRY_COUNT; attempt++) {
				if (selectLanguage(target, context.page)) break;
				await sleep(RETRY_INTERVAL_MS);
			}
			await sleep(AFTER_SELECTION_DELAY_MS);
			await unlockEditor(context);
			const observer = new MutationObserver(() => {
				if (!selectLanguage(target, context.page)) return;
				observer.disconnect();
				sleep(AFTER_SELECTION_DELAY_MS).then(() => unlockEditor(context));
			});
			observer.observe(document.body, {childList: true, subtree: true});
			setTimeout(() => observer.disconnect(), OBSERVE_DURATION_MS);
		},
	});

	// CpToolkit/src/features/rating-graph/index.ts
	function createGraphButton(marginLeft, onClick) {
		const button = h("button", {className: "btn btn-default", type: "button", onclick: onClick});
		Object.assign(button.style, {
			marginLeft,
			padding: "5px 10px",
			border: "1px solid #ccc",
			borderRadius: "4px",
			backgroundColor: "#fff",
			color: "#0275d8",
			fontSize: "14px",
		});
		return button;
	}

	var ratingGraph = defineFeature({
		id: "rating-graph",
		title: "ratingGraph.title",
		description: "ratingGraph.description",
		category: "category.rating",
		defaultEnabled: true,
		routes: ["atcoder:user"],
		phase: "load",
		options: {
			recentByDefault: option.boolean(true, "ratingGraph.recentByDefault"),
			recentRange: option.text("20", "ratingGraph.recentRange", {
				validate: (value) => parseRecentRange(value) !== null,
				invalidMessage: "ratingGraph.recentRangeInvalid",
			}),
		},
		async start({options, ratingGraph: graph, site, translate}) {
			const userName = /^\/users\/([^/?#]+)/.exec(location.pathname)?.[1];
			const buttonGroup = [...document.querySelectorAll(".btn-text-group")].at(-1);
			if (!userName || !buttonGroup) return;
			const heuristic = new URLSearchParams(location.search).get("contestType") === "heuristic";
			const url = `/users/${userName}/history/json${heuristic ? "?contestType=heuristic" : ""}`;
			const response = await site.send({url});
			const history = safeJsonParse(response.text, []);
			if (!(await graph.prepare(ratedPerformances(history)))) return;
			const recentRange = parseRecentRange(options.recentRange);
			const view = {showPerformance: true, recentOnly: options.recentByDefault};
			const redraw = () => {
				periodButton.textContent = translate(
					view.recentOnly ? "ratingGraph.showAll" : "ratingGraph.showRecent",
				);
				graph.draw({showPerformance: view.showPerformance, recent: view.recentOnly ? recentRange : null});
			};
			const periodButton = createGraphButton("10px", () => {
				view.recentOnly = !view.recentOnly;
				redraw();
			});
			const performanceButton = createGraphButton("100px", () => {
				view.showPerformance = !view.showPerformance;
				redraw();
			});
			performanceButton.textContent = translate("ratingGraph.togglePerformance");
			buttonGroup.append(performanceButton, periodButton);
			redraw();
		},
	});

	// CpToolkit/src/application/submission/pending-submissions.ts
	var isPendingList = isArrayOf(
		isObjectOf({
			id: isString,
			contestId: isString,
			taskName: isString,
			addedAt: isNumber,
		}),
	);
	var PENDING_KEY = "result-notifier:pending";
	var NEXT_POLL_KEY = "result-notifier:nextPoll";
	var LAST_FOCUS_KEY = "result-notifier:lastFocus";
	var PENDING_LIFETIME_MS = 30 * 60 * 1000;
	var FOCUS_REFRESH_MS = 1000;
	var FOCUS_TIMEOUT_MS = 3000;

	class PendingSubmissions {
		state;

		constructor(state) {
			this.state = state;
		}

		list(now) {
			const pending = readStored(this.state, PENDING_KEY, isPendingList, []);
			return pending.filter(({addedAt}) => now - addedAt < PENDING_LIFETIME_MS);
		}

		add(submissions, now) {
			const current = this.list(now);
			const known = new Set(current.map(({id}) => id));
			this.state.set(PENDING_KEY, [...current, ...submissions.filter(({id}) => !known.has(id))]);
		}

		remove(ids, now) {
			const removed = new Set(ids);
			this.state.set(
				PENDING_KEY,
				this.list(now).filter(({id}) => !removed.has(id)),
			);
		}

		subscribe(listener) {
			return this.state.subscribeRemote(PENDING_KEY, listener);
		}

		markFocused(now) {
			if (now - this.lastFocus() >= FOCUS_REFRESH_MS) this.state.set(LAST_FOCUS_KEY, now);
		}

		clearFocus() {
			this.state.set(LAST_FOCUS_KEY, 0);
		}

		isFocusedElsewhere(now) {
			return now - this.lastFocus() < FOCUS_TIMEOUT_MS;
		}

		claimPoll(now, intervalMs) {
			if (now < this.nextPoll()) return false;
			this.state.set(NEXT_POLL_KEY, now + intervalMs);
			return true;
		}

		postponePoll(until) {
			if (until > this.nextPoll()) this.state.set(NEXT_POLL_KEY, until);
		}

		lastFocus() {
			return readStored(this.state, LAST_FOCUS_KEY, isNumber, 0);
		}

		nextPoll() {
			return readStored(this.state, NEXT_POLL_KEY, isNumber, 0);
		}
	}

	// CpToolkit/src/features/result-notifier/index.ts
	var MIN_POLL_INTERVAL_MS = 1000;
	var TICK_INTERVAL_MS2 = 100;
	var FIRST_BACKOFF_MS = 5000;
	var MAX_BACKOFF_MS = 60000;
	var TOAST_DURATION_MS2 = 1e4;
	var SUBMISSION_ID_PATTERN = /\/submissions\/(\d+)/;

	function parseResult(html) {
		const page = new DOMParser().parseFromString(`<table><tr>${html}</tr></table>`, "text/html");
		const status = page.querySelector(".label")?.textContent?.trim() ?? "";
		const detail = [...page.querySelectorAll("td")]
			.slice(1)
			.map((cell) => cell.textContent?.trim())
			.join("  ");
		return {status, detail};
	}

	function collectPending(contestId, now) {
		return [...document.querySelectorAll(".table-responsive > table > tbody > tr")].flatMap((row) => {
			const status = row.querySelector(".label")?.textContent?.trim() ?? "";
			const id = [...row.querySelectorAll("a")]
				.map((link) => SUBMISSION_ID_PATTERN.exec(link.href)?.[1])
				.find(Boolean);
			if (!id || !isJudging(status)) return [];
			return [{id, contestId, taskName: row.querySelectorAll("td")[1]?.textContent?.trim() ?? "", addedAt: now}];
		});
	}

	var resultNotifier = defineFeature({
		id: "result-notifier",
		title: "resultNotifier.title",
		description: "resultNotifier.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:page", "atcoder:home"],
		phase: "ready",
		options: {
			desktop: option.boolean(true, "resultNotifier.desktop"),
		},
		live: true,
		start({options, isOnRoute, notifier, site, state, ticker}) {
			const pending = new PendingSubmissions(state);
			const contestId = contestIdOf(location.pathname);
			if (contestId && isOnRoute("atcoder:submissions") && location.pathname.includes("/submissions/me")) {
				pending.add(collectPending(contestId, Date.now()), Date.now());
			}
			const notify = (submission, {status, detail}) => {
				const url = buildAtCoderSubmissionUrl(submission.contestId, submission.id);
				const title = `${status}: ${submission.taskName}`;
				showToast({
					title,
					detail,
					tone: status === "AC" ? "success" : "warning",
					href: url,
					durationMs: TOAST_DURATION_MS2,
				});
				if (options.desktop && !document.hasFocus())
					notifier.notify({title, text: detail, url, tag: `result-notifier:${submission.id}`});
			};
			const checkContest = async (id, submissions) => {
				const url = buildAtCoderSubmissionStatusJsonUrl(
					id,
					submissions.map((submission) => submission.id),
				);
				const response = await site.send({url});
				const {Result: results, Interval: interval} = safeJsonParse(response.text, {});
				if (response.status !== 200 || !results) return false;
				const now = Date.now();
				const waiting = new Set(pending.list(now).map((submission) => submission.id));
				const finished = submissions.flatMap((submission) => {
					const html = results[submission.id]?.Html;
					const result = html === undefined ? null : parseResult(html);
					if (!result || isJudging(result.status) || !waiting.has(submission.id)) return [];
					notify(submission, result);
					return [submission.id];
				});
				pending.remove(finished, now);
				if (typeof interval === "number") pending.postponePoll(now + interval);
				return submissions.every((submission) => results[submission.id] !== undefined);
			};
			let checking = false;
			let failures = 0;
			let stopTicker = null;
			const poll = () => {
				const now = Date.now();
				const submissions = pending.list(now);
				if (submissions.length === 0) {
					stopTicker?.();
					stopTicker = null;
					return;
				}
				if (document.hasFocus()) pending.markFocused(now);
				else if (pending.isFocusedElsewhere(now)) return;
				if (checking || !pending.claimPoll(now, MIN_POLL_INTERVAL_MS)) return;
				checking = true;
				const groups = Map.groupBy(submissions, (submission) => submission.contestId);
				const checks = [...groups].map(([id, contestSubmissions]) => checkContest(id, contestSubmissions));
				Promise.allSettled(checks).then((results) => {
					checking = false;
					const succeeded = results.every((result) => result.status === "fulfilled" && result.value);
					failures = succeeded ? 0 : failures + 1;
					if (succeeded) return;
					const backoff = Math.min(FIRST_BACKOFF_MS * 2 ** (failures - 1), MAX_BACKOFF_MS);
					pending.postponePoll(Date.now() + backoff);
				});
			};
			const watch = () => {
				stopTicker ??= ticker.start(TICK_INTERVAL_MS2, poll);
				poll();
			};
			const controller = new AbortController();
			window.addEventListener("blur", () => pending.clearFocus(), {signal: controller.signal});
			const unsubscribe = pending.subscribe(watch);
			if (pending.list(Date.now()).length > 0) watch();
			return () => {
				controller.abort();
				unsubscribe();
				stopTicker?.();
				stopTicker = null;
			};
		},
	});

	// CpToolkit/src/application/source/source-comments.ts
	var HISTORY_LIMIT = 20;
	var EMPTY_ENTRY = {text: "", commentOut: true};
	var isEntry = isObjectOf({
		text: isString,
		commentOut: isBoolean,
		multiline: isOptional(isBoolean),
	});
	var isNamed = isObjectOf({
		name: isString,
		text: isString,
		commentOut: isBoolean,
		multiline: isOptional(isBoolean),
	});

	class SourceComments {
		state;

		constructor(state) {
			this.state = state;
		}

		content(slot, task) {
			const taskEntry = this.taskEntries(slot)[task];
			if (taskEntry) return {...taskEntry, taskOnly: true};
			return {...readStored(this.state, this.key(slot, "last"), isEntry, EMPTY_ENTRY), taskOnly: false};
		}

		save(slot, task, {text, commentOut, multiline, taskOnly}) {
			const entry = {text, commentOut, ...(multiline !== undefined && {multiline})};
			const {[task]: _replaced, ...others} = this.taskEntries(slot);
			this.state.set(this.key(slot, "tasks"), taskOnly ? {...others, [task]: entry} : others);
			if (!taskOnly) this.state.set(this.key(slot, "last"), entry);
			if (text.trim()) this.remember(slot, entry);
		}

		history(slot) {
			return readStored(this.state, this.key(slot, "history"), isArrayOf(isEntry), []);
		}

		presets(slot) {
			return readStored(this.state, this.key(slot, "presets"), isArrayOf(isNamed), []);
		}

		savePreset(slot, preset) {
			const others = this.presets(slot).filter(({name}) => name !== preset.name);
			const presets = [...others, preset].toSorted((a, b) => a.name.localeCompare(b.name));
			this.state.set(this.key(slot, "presets"), presets);
		}

		removePreset(slot, name) {
			this.state.set(
				this.key(slot, "presets"),
				this.presets(slot).filter((preset) => preset.name !== name),
			);
		}

		remember(slot, entry) {
			const others = this.history(slot).filter(({text, commentOut, multiline}) => {
				return text !== entry.text || commentOut !== entry.commentOut || multiline !== entry.multiline;
			});
			this.state.set(this.key(slot, "history"), [entry, ...others].slice(0, HISTORY_LIMIT));
		}

		taskEntries(slot) {
			return readStored(this.state, this.key(slot, "tasks"), isRecordOf(isEntry), {});
		}

		key(slot, name) {
			return `source-comments:${slot}:${name}`;
		}
	}

	// CpToolkit/src/features/source-comments/source-comments.css
	var source_comments_default = `dialog {
	width: min(960px, calc(100vw - 32px));
}

.comment-slots {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 20px;
}

.comment-slot {
	display: grid;
	align-content: start;
	gap: 8px;
	min-width: 0;
}

.comment-slot h3 {
	margin: 0;
	font-size: 14px;
	font-weight: 600;
}

.comment-slot textarea {
	width: 100%;
	min-height: 160px;
	padding: 8px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: 13px/1.5 Consolas, Monaco, "Courier New", monospace;
	resize: vertical;
}

.comment-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px 16px;
}

.comment-row label {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.comment-row select {
	flex: 1 1 160px;
	min-width: 0;
	padding: 4px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: inherit;
}

.comment-help {
	margin: 16px 0 0;
	color: var(--cp-text-muted);
	font-size: 13px;
}

.comment-warning {
	color: var(--cp-danger);
	font-size: 13px;
}

.comment-spacer {
	margin-left: auto;
}
`;

	// CpToolkit/src/features/source-comments/panel.ts
	var SLOT_LABELS = {
		header: "sourceComments.header",
		footer: "sourceComments.footer",
	};
	var LABEL_LENGTH = 40;
	var TOAST_DURATION_MS3 = 1e4;

	function summarize({text}) {
		const line =
			text.trim().split(`
`)[0] ?? "";
		return line.length > LABEL_LENGTH ? `${line.slice(0, LABEL_LENGTH)}...` : line;
	}

	function createCheckbox(label, onChange) {
		const input = h("input", {type: "checkbox", onchange: onChange});
		return {element: h("label", {}, input, label), input};
	}

	function createSlot(slot, {comments, translate, task, defaultMultiline, onChange}) {
		const textarea = h("textarea", {spellcheck: false, placeholder: translate("sourceComments.placeholder")});
		const content = () => ({
			text: textarea.value,
			commentOut: commentOut.input.checked,
			multiline: multiline.input.checked,
			taskOnly: taskOnly.input.checked,
		});
		const save = () => {
			comments.save(slot, task(), content());
			refreshLists();
			onChange();
		};
		const taskOnly = createCheckbox(translate("sourceComments.taskOnly"), save);
		const commentOut = createCheckbox(translate("sourceComments.commentOut"), save);
		const multiline = createCheckbox(translate("sourceComments.multiline"), save);
		const history = h("select");
		const presets = h("select");
		const saveButton = h("button", {type: "button", textContent: translate("sourceComments.savePreset")});
		const removeButton = h("button", {type: "button", textContent: translate("sourceComments.removePreset")});
		const fill = (entry) => {
			textarea.value = entry.text;
			commentOut.input.checked = entry.commentOut;
			multiline.input.checked = entry.multiline ?? defaultMultiline;
			save();
		};
		const refreshLists = () => {
			const selected = presets.value;
			history.replaceChildren(
				h("option", {value: "", textContent: translate("sourceComments.restoreHistory")}),
				...comments.history(slot).map((entry, index) =>
					h("option", {
						value: String(index),
						textContent: summarize(entry),
					}),
				),
			);
			presets.replaceChildren(
				h("option", {value: "", textContent: translate("sourceComments.restorePreset")}),
				...comments.presets(slot).map(({name}) => h("option", {value: name, textContent: name})),
			);
			presets.value = selected;
			if (presets.selectedIndex < 0) presets.value = "";
		};
		textarea.addEventListener("change", save);
		history.addEventListener("change", () => {
			const entry = comments.history(slot)[Number(history.value)];
			if (history.value && entry) fill(entry);
		});
		presets.addEventListener("change", () => {
			const preset = comments.presets(slot).find(({name}) => name === presets.value);
			if (preset) fill(preset);
		});
		saveButton.addEventListener("click", () => {
			const name = window.prompt(translate("sourceComments.presetName"), presets.value)?.trim();
			if (!name) return;
			comments.savePreset(slot, {
				name,
				text: textarea.value,
				commentOut: commentOut.input.checked,
				multiline: multiline.input.checked,
			});
			refreshLists();
			presets.value = name;
		});
		removeButton.addEventListener("click", () => {
			if (!presets.value) return;
			comments.removePreset(slot, presets.value);
			presets.value = "";
			refreshLists();
		});
		return {
			element: h(
				"section",
				{className: "comment-slot"},
				h("h3", {textContent: translate(SLOT_LABELS[slot])}),
				textarea,
				h("div", {className: "comment-row"}, taskOnly.element, commentOut.element, multiline.element),
				h("div", {className: "comment-row"}, history, presets, saveButton, removeButton),
			),
			hasText: () => textarea.value.trim() !== "",
			reload() {
				const stored = comments.content(slot, task());
				textarea.value = stored.text;
				commentOut.input.checked = stored.commentOut;
				multiline.input.checked = stored.multiline ?? defaultMultiline;
				taskOnly.input.checked = stored.taskOnly;
				refreshLists();
			},
		};
	}

	function createCommentPanel(options) {
		const {translate, onApply} = options;
		const modal = createModal({
			title: translate("sourceComments.panel"),
			closeLabel: translate("settings.close"),
			css: source_comments_default,
		});
		const button = h("button", {
			type: "button",
			className: "btn btn-default btn-sm",
			textContent: translate("sourceComments.panel"),
			onclick: () => modal.open(),
		});
		const updateButton = () => {
			const filled = slots.some((slot) => slot.hasText());
			button.classList.toggle("btn-info", filled);
			button.classList.toggle("btn-default", !filled);
		};
		const slotOptions = {
			...options,
			onChange() {
				updateButton();
				options.onChange();
			},
		};
		const slots = [createSlot("header", slotOptions), createSlot("footer", slotOptions)];
		const warning = h("span", {
			className: "comment-warning",
			textContent: translate("sourceComments.unsupported"),
			hidden: true,
		});
		modal.body.append(
			h("div", {className: "comment-slots"}, ...slots.map((slot) => slot.element)),
			h("p", {className: "comment-help", textContent: translate("sourceComments.variables")}),
		);
		modal.footer.append(
			warning,
			h("span", {className: "comment-spacer"}),
			h("button", {
				type: "button",
				className: "primary",
				textContent: translate("sourceComments.apply"),
				onclick() {
					onApply();
					modal.close();
				},
			}),
		);
		const reload = () => {
			for (const slot of slots) slot.reload();
			updateButton();
		};
		reload();
		return {
			button,
			reload,
			setUnsupported(unsupported) {
				if (unsupported && warning.hidden) {
					showToast({
						title: translate("sourceComments.notInserted"),
						detail: translate("sourceComments.unsupported"),
						tone: "warning",
						durationMs: TOAST_DURATION_MS3,
					});
				}
				warning.hidden = !unsupported;
			},
		};
	}

	// CpToolkit/src/features/source-comments/index.ts
	var sourceComments = defineFeature({
		id: "source-comments",
		title: "sourceComments.title",
		description: "sourceComments.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: [
			"atcoder:task",
			"atcoder:submit",
			"atcoder:customTest",
			"codeforces:page",
			"aoj:page",
			"libraryChecker:page",
			"paiza:page",
			"yukicoder:problem",
		],
		phase: "ready",
		options: {
			style: option.select("line", "sourceComments.style", [
				{value: "line", label: "sourceComments.styleLine"},
				{value: "block", label: "sourceComments.styleBlock"},
			]),
			runnerHeader: option.select("above", "sourceComments.runnerHeader", [
				{value: "above", label: "sourceComments.runnerHeaderAbove"},
				{value: "below", label: "sourceComments.runnerHeaderBelow"},
				{value: "none", label: "sourceComments.runnerHeaderNone"},
			]),
			runnerHeaderName: sharedAcrossSites(
				option.text("", "sourceComments.runnerHeaderName", {
					validate: (value) => value === "" || /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value),
					invalidMessage: "sourceComments.runnerHeaderNameInvalid",
				}),
			),
		},
		async start(services) {
			const {options, judge, localRunner, editors, paste, state, translate, submissionForm} = services;
			const target = judge?.submission;
			if (!target) return;
			const form = await submissionForm(target);
			const lookup = {delayMs: EDITOR_SETUP_DELAY_MS};
			const editor = await editors.locate(target, lookup);
			if (!editor || editor.isReadOnly()) return;
			const mount = document.querySelector(target.commentMount ?? ".editor-buttons");
			const button = form.submitButton();
			if (!mount && !button) return;
			form.holdSubmitWhile(paste, () =>
				showActionWarning({title: translate("submissionHelper.submitChanged"), detail: ""}),
			);
			const comments = new SourceComments(state);
			const defaultMultiline = options.style === "block";
			const order =
				options.runnerHeader === "above" ? ["runner", "header", "footer"] : ["header", "runner", "footer"];
			let inserted = {};
			let previousSyntax = {};
			let contentRevision = 0;
			let applied = false;
			const syntaxOf = () => {
				const family = form.language(editor)?.family ?? editor.commentFamily?.();
				return family ? commentSyntaxOf(languageCatalog, family) : null;
			};
			const render = (slot) => {
				const url = form.task();
				const {text, commentOut, multiline} = comments.content(slot, url);
				const page = new URL(url, location.href);
				const task = (page.hash.slice(1) || page.pathname).split("/").filter(Boolean).at(-1) ?? "";
				const contest =
					contestIdOf(page.pathname) ??
					(judge?.id === "codeforces"
						? /\/(?:contest|gym|problemset\/problem)\/(\d+)(?:\/|$)/.exec(page.pathname)?.[1]
						: undefined);
				const filled = fillVariables(text.trimEnd(), {url, task, contest: contest ?? ""});
				if (!filled) return "";
				if (!commentOut)
					return `${filled}
`;
				const syntax = syntaxOf();
				const comment = syntax && toComment(filled, syntax, (multiline ?? defaultMultiline) ? "block" : "line");
				return comment === null
					? null
					: `${comment}
`;
			};
			const compose = (source, runner, refresh) => {
				const syntax = syntaxOf() ?? {};
				const active = new Set();
				const original = normalizeNewlines(source);
				if (refresh && !original.trim()) return {code: source, commit() {
				}};
				let body = original;
				const lost = {};
				for (const slot of order) {
					const old = inserted[slot];
					if (!refresh || !old) continue;
					const rest = replaceBlock(body, old, "", slot === "footer", previousSyntax);
					if (rest !== null) {
						active.add(slot);
						body = rest;
					} else lost[slot] = old;
				}
				const blocks = {};
				let unsupported = false;
				for (const slot of order) {
					if (refresh && !active.has(slot) && !(slot === "runner" && !inserted.runner && applied)) continue;
					let block = slot === "runner" ? runner : render(slot);
					if (block === null) {
						unsupported = true;
						block = refresh ? (inserted[slot] ?? "") : "";
					}
					if (!block) continue;
					blocks[slot] = block;
				}
				for (const slot of refresh ? [] : order) {
					const block = blocks[slot];
					if (!block) continue;
					const rest = replaceBlock(body, block, "", slot === "footer", syntax);
					if (rest !== null) body = rest;
					else if (slot === "runner") {
						const offset = headerOffset(body, syntax);
						const header = block.trimEnd();
						if (includesSubmissionHeader(body, header, offset)) {
							const end = offset + header.length;
							body =
								body.slice(0, offset) +
								body.slice(
									end +
										(body[end] ===
										`
`
											? 1
											: 0),
								);
						}
					}
				}
				const head = order
					.filter((slot) => slot !== "footer")
					.map((slot) => blocks[slot] ?? "")
					.join("");
				if (head) body = insertHeader(body, head, syntax);
				if (blocks.footer) body = insertFooter(body, blocks.footer, syntax);
				const code = body === original ? source : body;
				return {
					code,
					commit() {
						inserted = {...lost, ...blocks};
						previousSyntax = syntax;
						panel.setUnsupported(unsupported);
					},
				};
			};
			const runnerHeader = async () => {
				const language = form.language(editor);
				if (options.runnerHeader === "none" || !language?.family || !localRunner.isAvailable()) return "";
				const compiler = await localRunner.compilerFor(language);
				if (!compiler) return "";
				const header = (await localRunner.header(compiler, options.runnerHeaderName.trim() || true))?.trimEnd();
				return header
					? `${normalizeNewlines(header)}

`
					: "";
			};
			const process = async (code, context, refresh) => {
				let runner = "";
				try {
					runner = await runnerHeader();
				} catch (error) {
					if (error instanceof LocalRunnerError && error.status !== 0) {
						if (context.isCurrent() && error.notify !== false)
							showActionWarning({
								title: translate("sourceComments.runnerHeaderFailed"),
								detail: error.message,
							});
						throw error;
					}
					if (!(error instanceof LocalRunnerError)) throw error;
				}
				if (!context.isCurrent()) return code;
				const result = compose(code, runner, refresh);
				context.onCommit(() => {
					applied = true;
					result.commit();
				});
				return result.code;
			};
			const key = () => JSON.stringify([form.contextKey(editor), contentRevision]);
			const manual = {order: 20, contextKey: key, transform: (code, ctx) => process(code, ctx, false)};
			const refresh = () => {
				contentRevision++;
				const result = compose(editor.getValue(), inserted.runner ?? "", true);
				if (result.code !== editor.getValue()) editor.setValue(result.code);
				result.commit();
			};
			const panel = createCommentPanel({
				comments,
				translate,
				task: form.task,
				defaultMultiline,
				onChange: refresh,
				onApply: () => {
					paste.apply(editor, manual);
				},
			});
			if (mount && !mount.matches("button, input, a, select, textarea, label")) mount.append(panel.button);
			else (mount ?? button)?.after(panel.button);
			form.observe(editor, () => {
				panel.reload();
				if (!editor.getValue().trim()) return;
				if (applied && options.runnerHeader !== "none") {
					paste.apply(editor, {...manual, transform: (code, ctx) => process(code, ctx, true)});
				} else refresh();
			});
			paste.add(target, lookup, {
				...manual,
				transform: (code, ctx) => (isWholeCode(ctx.original, ctx.pasted) ? process(code, ctx, false) : code),
			});
		},
	});

	// CpToolkit/src/features/statement-copy/index.ts
	var COPIED_LABEL_MS = 1500;
	var EXCLUDED_FROM_COPY = ".btn, .btn-copy, .btn-pre, .div-btn-copy, .pull-right, .cp-title-control";

	function isSampleHeading(section) {
		return isSampleTitle(statementCatalog.sampleHeadings, section.querySelector("h3")?.textContent ?? "");
	}

	function withoutControls(element) {
		const clone = element.cloneNode(true);
		for (const control of clone.querySelectorAll(EXCLUDED_FROM_COPY)) control.remove();
		return clone;
	}

	function findVisibleStatement(container) {
		const languages = [...container.querySelectorAll(".lang-ja, .lang-en")];
		return languages.find((element) => getComputedStyle(element).display !== "none") ?? container;
	}

	var statementCopy = defineFeature({
		id: "statement-copy",
		title: "statementCopy.title",
		description: "statementCopy.description",
		category: "category.statement",
		defaultEnabled: true,
		routes: ["atcoder:task"],
		phase: "ready",
		options: {
			format: option.select("markdown", "statementCopy.format", [
				{value: "markdown", label: "statementCopy.formatMarkdown"},
				{value: "plain", label: "statementCopy.formatPlain"},
			]),
		},
		live: true,
		start({options, clipboard, statementConverter, translate, shortcuts}) {
			const added = [];
			const disposers = [];
			const container = document.getElementById("task-statement");
			if (!container)
				return () => {
					return;
				};
			const convert = (element) => {
				const statement = withoutControls(element);
				return options.format === "plain"
					? statementConverter.toPlainText(statement)
					: statementConverter.toMarkdown(statement);
			};
			const createButton = (label, getText) => {
				const button = h("button", {type: "button", className: "btn btn-default btn-sm", textContent: label});
				button.style.marginLeft = "10px";
				button.addEventListener("click", (event) => {
					event.preventDefault();
					clipboard.write(getText());
					button.textContent = translate("statementCopy.copied");
					setTimeout(() => {
						button.textContent = label;
					}, COPIED_LABEL_MS);
				});
				added.push(button);
				return button;
			};
			for (const section of container.querySelectorAll(".part section")) {
				if (isSampleHeading(section)) continue;
				section
					.querySelector("h3")
					?.append(createButton(translate("statementCopy.copy"), () => convert(section)));
			}
			const title = document.querySelector(".h2") ?? document.querySelector("h2");
			if (title) {
				const copyAll = () => {
					const sections = [...findVisibleStatement(container).querySelectorAll(".part section")];
					const heading =
						withoutControls(title).textContent?.trim() || translate("statementCopy.defaultTitle");
					const firstSample = sections.findIndex(isSampleHeading);
					const body = (firstSample < 0 ? sections : sections.slice(0, firstSample)).map(convert).join(`

`);
					const prefix = options.format === "plain" ? heading : `# ${heading}`;
					return `${prefix}

URL: ${location.href}

${body}`.trim();
				};
				const copyAllButton = createButton(translate("statementCopy.copyAll"), copyAll);
				const wrapper = h("span", {className: "pull-right"}, copyAllButton);
				wrapper.style.fontSize = "14px";
				title.append(wrapper);
				added.push(wrapper);
				addTooltip(
					() => copyAllButton,
					() => shortcuts.keyOf(SHORTCUT_ACTIONS.copyStatement),
				);
				const unregister = shortcuts.register(SHORTCUT_ACTIONS.copyStatement, () => {
					copyAllButton.click();
					return true;
				});
				disposers.push(unregister);
			}
			return () => {
				for (const element of added) element.remove();
				for (const dispose of disposers) dispose();
			};
		},
	});

	// CpToolkit/src/domain/statement/tokens.ts
	var NUMBER_PATTERN2 = /(^|\W)([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?)/gi;
	var PURE_NUMBER_PATTERN = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?$/i;

	function isPureNumber(text) {
		return PURE_NUMBER_PATTERN.test(text.trim());
	}

	function splitNumbers(text) {
		const segments = [];
		let position = 0;
		for (const match of text.matchAll(NUMBER_PATTERN2)) {
			const prefix = match[1] ?? "";
			const value = match[2] ?? "";
			const start = match.index + prefix.length;
			if (start > position) segments.push({text: text.slice(position, start), emphasized: false});
			segments.push({text: value, emphasized: true});
			position = start + value.length;
		}
		if (position < text.length) segments.push({text: text.slice(position), emphasized: false});
		return segments;
	}

	function splitLimitValue(text, keyword, ignoredValue) {
		const pattern = new RegExp(`${keyword}\\s*[:：]\\s*([0-9][0-9,]*(?:\\.[0-9]+)?)`, "g");
		const segments = [];
		let position = 0;
		for (const match of text.matchAll(pattern)) {
			const value = match[1] ?? "";
			if (Number(value.replaceAll(",", "")) === ignoredValue) continue;
			const valueStart = match.index + match[0].length - value.length;
			segments.push({text: text.slice(position, valueStart), emphasized: false});
			segments.push({text: value, emphasized: true});
			position = valueStart + value.length;
		}
		if (position === 0) return null;
		if (position < text.length) segments.push({text: text.slice(position), emphasized: false});
		return segments;
	}

	// CpToolkit/src/features/statement-highlight/statement-highlight.css
	var statement_highlight_default = `.cp-statement-target .katex .mathnormal,
.cp-statement-target .cp-number {
	font-weight: 800 !important;
}

.cp-statement-target .katex .mathnormal {
	color: var(--cp-variable-color) !important;
}

.cp-statement-target .cp-number {
	color: var(--cp-number-color) !important;
}

.cp-time-limit {
	color: var(--cp-time-color);
	font-size: 2em;
}

.cp-memory-limit {
	color: var(--cp-memory-color);
	font-size: 2em;
}
`;

	// CpToolkit/src/features/statement-highlight/index.ts
	var NUMBER_CLASS = "cp-number";
	var TARGET_CLASS = "cp-statement-target";
	var TIME_CLASS = "cp-time-limit";
	var MEMORY_CLASS = "cp-memory-limit";
	var SKIPPED_ANCESTORS = `.katex, var, .${NUMBER_CLASS}, .${TIME_CLASS}, .${MEMORY_CLASS}`;
	var HIGHLIGHT_DELAY_MS = 100;
	var SKIPPED_TAGS = new Set(statementCatalog.skipTags);

	function collectTextNodes(root, accepts) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const nodes = [];
		while (walker.nextNode()) {
			const node = walker.currentNode;
			if (!(node instanceof Text) || !accepts(node.data)) continue;
			const parent = node.parentElement;
			if (!parent || SKIPPED_TAGS.has(parent.tagName) || parent.closest(SKIPPED_ANCESTORS)) continue;
			nodes.push(node);
		}
		return nodes;
	}

	function replaceWithSegments(node, segments, className) {
		node.replaceWith(
			...segments.map(({text, emphasized}) =>
				emphasized
					? h("span", {
							className,
							textContent: text,
						})
					: text,
			),
		);
	}

	function markTargetSections() {
		for (const section of document.querySelectorAll("#task-statement section")) {
			const title = section.querySelector("h3")?.textContent ?? "";
			const isTarget = statementCatalog.targetHeadings.some((heading) => title.includes(heading));
			if (isTarget) section.classList.add(TARGET_CLASS);
		}
	}

	function highlightNumbers() {
		for (const scope of document.querySelectorAll(`.${TARGET_CLASS}`)) {
			for (const element of scope.querySelectorAll(".katex .mord, .katex .text")) {
				if (!element.classList.contains("mathnormal") && isPureNumber(element.textContent ?? "")) {
					element.classList.add(NUMBER_CLASS);
				}
			}
			for (const node of collectTextNodes(scope, (text) => /\d/.test(text))) {
				replaceWithSegments(node, splitNumbers(node.data), NUMBER_CLASS);
			}
		}
	}

	function emphasizeLimit(root, keywords, className, ignoredValue) {
		for (const keyword of keywords) {
			for (const node of collectTextNodes(root, (text) => text.includes(keyword))) {
				const segments = splitLimitValue(node.data, keyword, ignoredValue);
				if (segments) replaceWithSegments(node, segments, className);
			}
		}
	}

	function emphasizeLimits(always) {
		const root = document.getElementById("main-container");
		if (!root) return;
		const {timeLimitKeywords, memoryLimitKeywords, commonTimeLimit, commonMemoryLimit} = statementCatalog;
		emphasizeLimit(root, timeLimitKeywords, TIME_CLASS, always ? undefined : commonTimeLimit);
		emphasizeLimit(root, memoryLimitKeywords, MEMORY_CLASS, always ? undefined : commonMemoryLimit);
	}

	var statementHighlight = defineFeature({
		id: "statement-highlight",
		title: "statementHighlight.title",
		description: "statementHighlight.description",
		category: "category.statement",
		defaultEnabled: true,
		routes: ["atcoder:task"],
		phase: "ready",
		options: {
			numberColor: option.color("#0033b3", "statementHighlight.numberColor"),
			variableColor: option.color("#9e2927", "statementHighlight.variableColor"),
			timeColor: option.color("#b3542a", "statementHighlight.timeColor"),
			memoryColor: option.color("#1d643b", "statementHighlight.memoryColor"),
			alwaysEmphasizeLimits: option.boolean(false, "statementHighlight.alwaysEmphasizeLimits"),
		},
		live: true,
		start({options}) {
			const style = injectStyle(`:root {
	--cp-number-color: ${options.numberColor};
	--cp-variable-color: ${options.variableColor};
	--cp-time-color: ${options.timeColor};
	--cp-memory-color: ${options.memoryColor};
}
${statement_highlight_default}`);
			let timer;
			const schedule = () => {
				if (timer !== undefined) return;
				timer = setTimeout(() => {
					timer = undefined;
					markTargetSections();
					highlightNumbers();
					emphasizeLimits(options.alwaysEmphasizeLimits);
					observer.takeRecords();
				}, HIGHLIGHT_DELAY_MS);
			};
			schedule();
			const observer = new MutationObserver(schedule);
			observer.observe(document.getElementById("task-statement") ?? document.body, {
				childList: true,
				subtree: true,
				characterData: true,
			});
			return () => {
				observer.disconnect();
				clearTimeout(timer);
				style.remove();
			};
		},
	});

	// CpToolkit/src/features/submission-query/index.ts
	var SUBMISSION_PAGE_TABS = "#main-container > div.row > div:nth-child(2) > ul > li > a";
	var LANGUAGE_SELECT = 'select[name="f.LanguageName"]';

	function selectQueriedLanguage(page) {
		const language = new URLSearchParams(location.search).get("f.LanguageName");
		const select = document.querySelector(LANGUAGE_SELECT);
		if (!language || !select || select.value) return;
		const option = [...select.options].find(({value}) => value.toLowerCase() === language.toLowerCase());
		if (!option) return;
		select.value = option.value;
		page().triggerChange(select);
	}

	var submissionQuery = defineFeature({
		id: "submission-query",
		title: "submissionQuery.title",
		description: "submissionQuery.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:submissions"],
		phase: "ready",
		options: {},
		start(services) {
			for (const tab of [...document.querySelectorAll(SUBMISSION_PAGE_TABS)].slice(0, 2)) {
				const url = new URL(tab.getAttribute("href") ?? "", location.origin);
				url.search = location.search;
				tab.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
			}
			selectQueriedLanguage(() => services.page);
		},
	});

	// CpToolkit/src/features/submission-shortcuts/index.ts
	var ORDERS = [
		{
			option: "byTime",
			orderBy: "time_consumption",
			label: "submissionShortcuts.time",
			action: SHORTCUT_ACTIONS.acByTime,
		},
		{
			option: "byLength",
			orderBy: "source_length",
			label: "submissionShortcuts.length",
			action: SHORTCUT_ACTIONS.acByLength,
		},
		{
			option: "byCreated",
			orderBy: "created",
			label: "submissionShortcuts.created",
			action: SHORTCUT_ACTIONS.acByCreated,
		},
		{
			option: "byMemory",
			orderBy: "memory_consumption",
			label: "submissionShortcuts.memory",
			action: SHORTCUT_ACTIONS.acByMemory,
		},
	];
	var submissionShortcuts = defineFeature({
		id: "submission-shortcuts",
		title: "submissionShortcuts.title",
		description: "submissionShortcuts.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:task"],
		phase: "ready",
		options: {
			language: option.text("", "submissionShortcuts.language"),
			byTime: option.boolean(true, "submissionShortcuts.byTime"),
			byLength: option.boolean(true, "submissionShortcuts.byLength"),
			byCreated: option.boolean(true, "submissionShortcuts.byCreated"),
			byMemory: option.boolean(true, "submissionShortcuts.byMemory"),
		},
		live: true,
		start({options, page, translate, shortcuts}) {
			const task = parseAtCoderTaskUrl(location.href);
			const title = document.querySelector(".h2");
			const period = page.contestPeriod();
			if (period && page.serverNow() < period.endMs)
				return () => {
					return;
				};
			if (!task)
				return () => {
					return;
				};
			const urlOf = (orderBy) => {
				const query = buildAtCoderSubmissionsQuery({
					language: options.language || undefined,
					status: "AC",
					orderBy,
					task: task.taskId,
				});
				return `/contests/${task.contestId}/submissions?${query}`;
			};
			const unregister = ORDERS.map(({orderBy, action}) =>
				shortcuts.register(action, () => {
					window.open(urlOf(orderBy), "_blank", "noopener");
					return true;
				}),
			);
			const dispose = () => {
				for (const remove of unregister) remove();
			};
			const orders = ORDERS.filter((order) => options[order.option]);
			if (!title || orders.length === 0) return dispose;
			const createLink = (label, orderBy, action) => {
				const link = h("a", {className: "btn btn-default btn-sm", href: urlOf(orderBy), textContent: label});
				addTooltip(
					() => link,
					() => shortcuts.keyOf(action),
				);
				return link;
			};
			const label = h("span", {textContent: `${translate("submissionShortcuts.label")}:`});
			label.style.marginRight = "6px";
			const wrapper = h(
				"span",
				{className: "cp-title-control"},
				label,
				h(
					"span",
					{className: "btn-group"},
					...orders.map(({orderBy, label, action}) => createLink(translate(label), orderBy, action)),
				),
			);
			Object.assign(wrapper.style, {
				marginLeft: "16px",
				fontSize: "14px",
				fontWeight: "normal",
				verticalAlign: "middle",
				whiteSpace: "nowrap",
			});
			title.append(wrapper);
			return () => {
				wrapper.remove();
				dispose();
			};
		},
	});

	// CpToolkit/src/features/submission-timer/index.ts
	var MINUTE_MS2 = 60000;
	var MAX_TIMEOUT_MS = 24 * 60 * MINUTE_MS2;
	var submissionTimer = defineFeature({
		id: "submission-timer",
		title: "submissionTimer.title",
		description: "submissionTimer.description",
		category: "category.submission",
		defaultEnabled: false,
		routes: ["atcoder:task"],
		phase: "ready",
		options: {},
		start({translate}) {
			const submitButton = document.querySelector("#submit");
			if (!submitButton) return;
			let timer;
			const modal = createModal({
				title: translate("submissionTimer.title"),
				closeLabel: translate("settings.close"),
				css: form_default,
			});
			const minutes = h("input", {type: "number", min: "1"});
			const info = h("p");
			const cancel = () => {
				clearTimeout(timer);
				timer = undefined;
				info.textContent = translate("submissionTimer.canceled");
			};
			const waitUntil = (dueAt) => {
				const remaining = dueAt - Date.now();
				timer =
					remaining > 0 ? setTimeout(() => waitUntil(dueAt), Math.min(remaining, MAX_TIMEOUT_MS)) : undefined;
				if (remaining <= 0) submitButton.click();
			};
			const schedule = () => {
				const value = minutes.valueAsNumber;
				clearTimeout(timer);
				const dueAt = Date.now() + value * MINUTE_MS2;
				const due = new Date(dueAt);
				if (!(value > 0) || Number.isNaN(due.getTime())) {
					cancel();
					return;
				}
				waitUntil(dueAt);
				const at =
					due.toDateString() === new Date().toDateString() ? due.toLocaleTimeString() : due.toLocaleString();
				info.textContent = translate("submissionTimer.scheduled").replace("{time}", at);
			};
			modal.body.append(
				h(
					"label",
					{className: "field"},
					h("span", {
						className: "field-label",
						textContent: translate("submissionTimer.minutes"),
					}),
					minutes,
				),
				info,
			);
			modal.footer.append(
				h("button", {type: "button", textContent: translate("submissionTimer.set"), onclick: schedule}),
				h("button", {type: "button", textContent: translate("submissionTimer.cancel"), onclick: cancel}),
			);
			const openButton = h("button", {
				type: "button",
				className: "btn btn-default",
				textContent: translate("submissionTimer.title"),
				onclick: () => modal.open(),
			});
			openButton.style.marginLeft = "5px";
			submitButton.after(openButton);
		},
	});

	// CpToolkit/src/domain/contest/category.ts
	var isTaskRange = isObjectOf({begin: isNumber, end: isNumber});

	function contestCategory(catalog, contestId, taskCount) {
		const regular = catalog.regularPrefixes.find((prefix) => contestId.startsWith(prefix));
		if (regular) return `${regular}-${taskCount}`;
		return catalog.permanentPrefixes.find((prefix) => contestId.startsWith(prefix)) ?? "other";
	}

	function defaultRange(taskCount, maxTabs) {
		return {begin: 0, end: Math.min(maxTabs, taskCount) - 1};
	}

	function adjustRange(range, changed, maxTabs) {
		const {begin, end} = range;
		if (changed === "begin") {
			if (end < begin) return {begin, end: begin};
			return {begin, end: Math.min(end, begin + maxTabs - 1)};
		}
		if (begin > end) return {begin: end, end};
		return {begin: Math.max(begin, end - maxTabs + 1), end};
	}

	function rangeIndices({begin, end}, reverse) {
		const indices = Array.from({length: end - begin + 1}, (_, index) => begin + index);
		return reverse ? indices.toReversed() : indices;
	}

	// CpToolkit/src/features/task-dropdown/open-tasks-modal.css
	var open_tasks_modal_default = `.open-tasks-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;
}

.open-tasks-row select {
	min-width: 120px;
	padding: 4px;
	border: 1px solid var(--cp-border);
	border-radius: 6px;
	background: var(--cp-surface);
	color: var(--cp-text);
	font: inherit;
}

.open-tasks-caution {
	color: var(--cp-danger);
	font-size: 13px;
}

.open-tasks-info {
	margin: 0;
	color: var(--cp-text-muted);
}

.open-tasks-spacer {
	margin-left: auto;
}

button.primary {
	border-color: var(--cp-accent);
	background: var(--cp-accent);
	color: var(--cp-on-accent);
}
`;

	// CpToolkit/src/features/task-dropdown/open-tasks-modal.ts
	function isValidRange(range, taskCount, maxTabs) {
		if (!range) return false;
		return (
			range.begin >= 0 && range.begin <= range.end && range.end < taskCount && range.end - range.begin < maxTabs
		);
	}

	function createTaskSelect(tasks) {
		return h(
			"select",
			{},
			...tasks.map((task, index) => {
				return h("option", {value: String(index), textContent: `${task.label} - ${task.name}`});
			}),
		);
	}

	function createOpenTasksModal(params) {
		const {tasks, maxTabs, savedRange, savedReverse, translate, onOpen} = params;
		const canOpenAll = tasks.length <= maxTabs;
		const initial = isValidRange(savedRange, tasks.length, maxTabs)
			? savedRange
			: defaultRange(tasks.length, maxTabs);
		let range = initial;
		const modal = createModal({
			title: translate("taskDropdown.openAtOnce"),
			closeLabel: translate("settings.close"),
			css: open_tasks_modal_default,
		});
		const allRadio = h("input", {type: "radio", name: "open-type", disabled: !canOpenAll});
		const rangeRadio = h("input", {type: "radio", name: "open-type"});
		const beginSelect = createTaskSelect(tasks);
		const endSelect = createTaskSelect(tasks);
		const reverse = h("input", {type: "checkbox", checked: savedReverse});
		const info = h("p", {className: "open-tasks-info"});
		const isAll = () => allRadio.checked;
		const selectedRange = () => (isAll() ? {begin: 0, end: tasks.length - 1} : range);
		const refresh = () => {
			beginSelect.value = String(range.begin);
			endSelect.value = String(range.end);
			beginSelect.disabled = endSelect.disabled = isAll();
			const {begin, end} = selectedRange();
			info.textContent = translate("taskDropdown.tabCount").replace("{count}", String(end - begin + 1));
		};
		const changeRange = (changed) => {
			range = adjustRange({begin: Number(beginSelect.value), end: Number(endSelect.value)}, changed, maxTabs);
			refresh();
		};
		allRadio.checked = canOpenAll && initial.begin === 0 && initial.end === tasks.length - 1;
		rangeRadio.checked = !allRadio.checked;
		allRadio.addEventListener("change", refresh);
		rangeRadio.addEventListener("change", refresh);
		beginSelect.addEventListener("change", () => changeRange("begin"));
		endSelect.addEventListener("change", () => changeRange("end"));
		const row = (...children) => h("div", {className: "open-tasks-row"}, ...children);
		modal.body.append(
			row(
				h("label", {}, allRadio, ` ${translate("taskDropdown.all")}`),
				canOpenAll
					? ""
					: h("span", {
							className: "open-tasks-caution",
							textContent: translate("taskDropdown.tabLimit").replace("{count}", String(maxTabs)),
						}),
			),
			row(h("label", {}, rangeRadio, ` ${translate("taskDropdown.range")}`), beginSelect, "-", endSelect),
			row(h("label", {}, reverse, ` ${translate("taskDropdown.reverse")}`)),
			info,
		);
		modal.footer.append(
			h("span", {className: "open-tasks-spacer"}),
			h("button", {type: "button", textContent: translate("taskDropdown.cancel"), onclick: () => modal.close()}),
			h("button", {
				type: "button",
				className: "primary",
				textContent: translate("taskDropdown.openAtOnce"),
				onclick() {
					onOpen(selectedRange(), reverse.checked);
					const placeholder = window.open("about:blank");
					for (const index of rangeIndices(selectedRange(), reverse.checked)) {
						const task = tasks[index];
						if (task) window.open(task.url, "_blank", "noopener,noreferrer");
					}
					placeholder?.close();
					modal.close();
				},
			}),
		);
		return {
			open() {
				refresh();
				modal.open();
			},
		};
	}

	// CpToolkit/src/features/task-dropdown/task-dropdown.css
	var task_dropdown_default = `.cp-task-menu {
	max-height: 70vh;
	overflow: visible auto;
}

.cp-task-menu label {
	width: 100%;
	margin: 0;
	padding: 3px 20px;
	font-weight: normal;
	white-space: nowrap;
	cursor: pointer;
}

.cp-task-menu label:hover {
	background-color: #f5f5f5;
}

.cp-task-menu input {
	margin: 0 4px 0 0;
	vertical-align: middle;
}
`;

	// CpToolkit/src/features/task-dropdown/index.ts
	var NEW_TAB_KEY = "task-dropdown:newTab";
	var REVERSE_KEY = "task-dropdown:reverse";
	var RANGES_KEY = "task-dropdown:ranges";

	function turnIntoDropdown(tab) {
		tab.className = "dropdown-toggle";
		tab.href = "#";
		tab.setAttribute("data-toggle", "dropdown");
		tab.setAttribute("role", "button");
		tab.setAttribute("aria-haspopup", "true");
		tab.setAttribute("aria-expanded", "false");
		tab.append(h("span", {className: "caret"}));
		const menu = h("ul", {className: "dropdown-menu cp-task-menu"});
		const item = tab.parentElement;
		item?.classList.add("dropdown");
		item?.append(menu);
		item?.addEventListener("mouseenter", () => item.classList.add("open"));
		item?.addEventListener("mouseleave", () => item.classList.remove("open"));
		return menu;
	}

	function createNewTabToggle(state, translate) {
		const checkbox = h("input", {type: "checkbox", checked: state.get(NEW_TAB_KEY) === true});
		checkbox.addEventListener("change", () => state.set(NEW_TAB_KEY, checkbox.checked));
		const label = h("label", {}, checkbox, translate("taskDropdown.newTab"));
		label.addEventListener("click", (event) => event.stopPropagation());
		return h("li", {}, label);
	}

	function withIcon(link, icon) {
		link.prepend(h("span", {className: `glyphicon ${icon}`, ariaHidden: "true"}), " ");
		return link;
	}

	function createTaskLink(href, text, state, icon) {
		const link = h("a", {href, textContent: text});
		if (icon) withIcon(link, icon);
		link.addEventListener("click", () => {
			const newTab = state.get(NEW_TAB_KEY) === true;
			link.target = newTab ? "_blank" : "_self";
			link.rel = newTab ? "noopener noreferrer" : "";
		});
		return h("li", {}, link);
	}

	var taskDropdown = defineFeature({
		id: "task-dropdown",
		title: "taskDropdown.title",
		description: "taskDropdown.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:contest"],
		phase: "ready",
		options: {},
		async start({contestTasks, state, translate}) {
			const tab = document.querySelector('#contest-nav-tabs a[href$="tasks"]');
			const contestId = contestIdOf(location.pathname);
			if (!tab || !contestId) return;
			injectStyle(task_dropdown_default);
			const taskTableUrl = tab.href;
			const menu = turnIntoDropdown(tab);
			menu.append(
				createNewTabToggle(state, translate),
				createTaskLink(taskTableUrl, translate("taskDropdown.taskTable"), state, "glyphicon-list"),
			);
			const tasks = await contestTasks();
			if (!tasks) {
				const failure = h("a", {textContent: translate("taskDropdown.loadFailed")});
				menu.append(h("li", {className: "divider"}), h("li", {}, failure));
				return;
			}
			const category = contestCategory(contestCatalog, contestId, tasks.length);
			const ranges = readStored(state, RANGES_KEY, isRecordOf(isTaskRange), {});
			const modal = createOpenTasksModal({
				tasks,
				maxTabs: contestCatalog.maxTabsAtOnce,
				savedRange: ranges[category] ?? null,
				savedReverse: state.get(REVERSE_KEY) === true,
				translate,
				onOpen(range, reverse) {
					state.set(REVERSE_KEY, reverse);
					if (category !== "other") state.set(RANGES_KEY, {...ranges, [category]: range});
				},
			});
			const openAtOnce = withIcon(
				h("a", {
					href: "#",
					textContent: `${translate("taskDropdown.openAtOnce")}...`,
				}),
				"glyphicon-sort-by-attributes-alt",
			);
			openAtOnce.addEventListener("click", (event) => {
				event.preventDefault();
				modal.open();
			});
			menu.append(h("li", {}, openAtOnce), h("li", {className: "divider"}));
			menu.append(...tasks.map((task) => createTaskLink(task.url, `${task.label} - ${task.name}`, state)));
		},
	});

	// CpToolkit/src/features/task-status/task-status.css
	var task_status_default = `tr.cp-task-accepted > td,
li.cp-task-accepted > a {
	background-color: var(--cp-task-accepted) !important;
}

tr.cp-task-rejected > td,
li.cp-task-rejected > a {
	background-color: var(--cp-task-rejected) !important;
}

li.cp-task-accepted > a:is(:hover, :focus) {
	background-color: color-mix(in srgb, var(--cp-task-accepted) 80%, #000) !important;
}

li.cp-task-rejected > a:is(:hover, :focus) {
	background-color: color-mix(in srgb, var(--cp-task-rejected) 80%, #000) !important;
}
`;

	// CpToolkit/src/features/task-status/index.ts
	var TASK_TABLE_LINKS = '#main-container tbody a[href*="/tasks/"]';
	var TASK_MENU_LINKS = '.cp-task-menu a[href*="/tasks/"]';
	var ACCEPTED_CLASS = "cp-task-accepted";
	var REJECTED_CLASS = "cp-task-rejected";
	var PAGE_PATTERN = /[?&]page=(\d+)/;
	var START_QUIET_MS = 5 * 60 * 1000;

	function taskIdOf(link) {
		return link?.getAttribute("href")?.split("/").at(-1);
	}

	function parseSubmissionPage(html) {
		const page = new DOMParser().parseFromString(html, "text/html");
		const results = [...page.querySelectorAll(".table-responsive > table > tbody > tr")].flatMap((row) => {
			const id = taskIdOf(row.querySelector('a[href*="/tasks/"]'));
			const status = row.querySelector(".label")?.textContent?.trim() ?? "";
			if (!id || isJudging(status)) return [];
			return [[id, status === "AC" || Number(row.querySelector(".submission-score")?.textContent) > 0]];
		});
		const pages = [...page.querySelectorAll(".pagination a, .pager a")].map((link) =>
			Number(PAGE_PATTERN.exec(link.getAttribute("href") ?? "")?.[1] ?? 1),
		);
		return {results, lastPage: Math.max(1, ...pages)};
	}

	async function loadStatuses(site, contestId) {
		const accepted = new Map();
		let lastPage = 1;
		let complete = true;
		for (let page = 1; page <= lastPage; page++) {
			const response = await site.send({url: `/contests/${contestId}/submissions/me?page=${page}`});
			if (response.status !== 200) {
				complete = false;
				break;
			}
			const parsed = parseSubmissionPage(response.text);
			for (const [id, ok] of parsed.results) accepted.set(id, (accepted.get(id) ?? false) || ok);
			lastPage = parsed.lastPage;
		}
		const known = [...accepted].filter(([, ok]) => ok || complete);
		return new Map(known.map(([id, ok]) => [id, ok ? ACCEPTED_CLASS : REJECTED_CLASS]));
	}

	function paint(statuses, links) {
		for (const link of document.querySelectorAll(links)) {
			const status = statuses.get(taskIdOf(link) ?? "");
			if (status) link.closest("tr, li")?.classList.add(status);
		}
	}

	var taskStatus = defineFeature({
		id: "task-status",
		title: "taskStatus.title",
		description: "taskStatus.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:contest"],
		phase: "ready",
		options: {
			acceptedColor: option.color("#c3e6cb", "taskStatus.acceptedColor"),
			rejectedColor: option.color("#f5c6cb", "taskStatus.rejectedColor"),
		},
		start({options, isOnRoute, page, site}) {
			const contestId = contestIdOf(location.pathname);
			if (!contestId || !page.isLoggedIn()) return;
			const period = page.contestPeriod();
			const sinceStart = period ? page.serverNow() - period.startMs : -1;
			if (sinceStart >= 0 && sinceStart < START_QUIET_MS) return;
			injectStyle(task_status_default);
			document.documentElement.style.setProperty("--cp-task-accepted", options.acceptedColor);
			document.documentElement.style.setProperty("--cp-task-rejected", options.rejectedColor);
			const links = isOnRoute("atcoder:tasks") ? `${TASK_TABLE_LINKS}, ${TASK_MENU_LINKS}` : TASK_MENU_LINKS;
			let statuses = null;
			const paintAll = () => {
				statuses ??= loadStatuses(site, contestId).catch(() => new Map());
				statuses.then((loaded) => paint(loaded, links));
			};
			if (isOnRoute("atcoder:tasks")) paintAll();
			document.querySelector("#contest-nav-tabs")?.addEventListener("mouseover", (event) => {
				if (
					event.target instanceof Element &&
					event.target.closest(".dropdown")?.querySelector(".cp-task-menu")
				) {
					paintAll();
				}
			});
		},
	});

	// CpToolkit/src/features/tessoku-difficulty/index.ts
	var TASK_LIST = "#main-container > div.row > div:nth-child(2)";
	var tessokuDifficulty = defineFeature({
		id: "tessoku-difficulty",
		title: "tessokuDifficulty.title",
		description: "tessokuDifficulty.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:tessokuTasks"],
		phase: "ready",
		options: {},
		start({translate}) {
			const body = document.querySelector(`${TASK_LIST} > div > table > tbody`);
			const heading = document.querySelector(`${TASK_LIST} > h2`);
			if (!body || !heading) return;
			const tasks = [...body.querySelectorAll("tr")].map((row) => {
				const id = row.querySelector("td")?.textContent?.trim() ?? "";
				return {row, id, difficulty: tessokuDifficulties[id]};
			});
			for (const {row, difficulty} of tasks) {
				const link = row.querySelector("td:nth-child(2) a");
				if (difficulty !== undefined && link) link.prepend(`【☆${difficulty}】 `);
			}
			let sortedByDifficulty = false;
			const button = h("button", {
				type: "button",
				className: "btn btn-default",
				textContent: translate("tessokuDifficulty.sortByDifficulty"),
				onclick() {
					sortedByDifficulty = !sortedByDifficulty;
					const sorted = tasks.toSorted((a, b) => {
						if (!sortedByDifficulty) return a.id.localeCompare(b.id);
						return (a.difficulty ?? Number.POSITIVE_INFINITY) - (b.difficulty ?? Number.POSITIVE_INFINITY);
					});
					body.append(...sorted.map(({row}) => row));
					const nextOrder = sortedByDifficulty
						? "tessokuDifficulty.sortById"
						: "tessokuDifficulty.sortByDifficulty";
					button.textContent = translate(nextOrder);
				},
			});
			heading.after(button);
		},
	});

	// CpToolkit/src/features/top-links/index.ts
	function createLink({title, subtitle, label, labelClass, description, href}) {
		const heading = h("h4", {className: "list-group-item-heading clearfix"}, h("b", {textContent: title}));
		if (subtitle) heading.append(" ", h("small", {className: "no-break", textContent: `(${subtitle})`}));
		if (label) heading.append(h("span", {className: `label ${labelClass ?? ""} pull-right`, textContent: label}));
		return h(
			"a",
			{href, className: "list-group-item"},
			heading,
			h("p", {className: "list-group-item-text text-muted", textContent: description}),
		);
	}

	var topLinks = defineFeature({
		id: "top-links",
		title: "topLinks.title",
		description: "topLinks.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:home"],
		phase: "ready",
		options: {},
		start() {
			const lists = document.querySelectorAll(".list-group.contest-list");
			lists.forEach((list, index) => {
				const links = contestLinks[index];
				if (links) list.replaceChildren(...links.map(createLink));
			});
		},
	});

	// CpToolkit/src/features/variable-hover/variable-hover.css
	var variable_hover_default = `#task-statement .cp-variable {
	border-radius: 2px;
	background-color: rgba(255, 213, 79, .5);
	box-shadow: 0 0 0 1px rgba(255, 213, 79, .5);
}

#task-statement .cp-variable-pinned {
	background-color: rgba(255, 183, 77, .75);
	box-shadow: 0 0 0 1px rgba(255, 152, 0, .8);
}
`;

	// CpToolkit/src/features/variable-hover/index.ts
	var VARIABLES = ".katex-html .mathnormal";
	var LEAVES = ".katex-html .mord";
	var NUMBER_PATTERN3 = /^\d+(\.\d+)?$/;
	var HIGHLIGHT_CLASS = "cp-variable";
	var PINNED_CLASS = "cp-variable-pinned";

	function isPlainLeaf(element) {
		return (
			element !== null &&
			element.classList.contains("mord") &&
			element.childElementCount === 0 &&
			!element.classList.contains("mathnormal")
		);
	}

	function isNumberLeaf(element) {
		return isPlainLeaf(element) && NUMBER_PATTERN3.test(element.textContent ?? "");
	}

	function containerOf(leaf) {
		const parent = leaf.parentElement;
		const wrapped =
			parent?.classList.contains("mord") &&
			parent.firstElementChild === leaf &&
			leaf.nextElementSibling?.classList.contains("msupsub");
		return wrapped && parent ? parent : leaf;
	}

	function numberLeafAt(element) {
		if (!element || isNumberLeaf(element)) return element;
		const first = element.firstElementChild;
		return first && isNumberLeaf(first) && containerOf(first) === element ? first : null;
	}

	function collectNumbers(statement) {
		const tokens = [];
		const consumed = new Set();
		for (const leaf of statement.querySelectorAll(LEAVES)) {
			if (consumed.has(leaf) || !isNumberLeaf(leaf)) continue;
			const elements = [leaf];
			let text = leaf.textContent ?? "";
			let unit = containerOf(leaf);
			while (unit === elements.at(-1)) {
				let next = unit.nextElementSibling;
				const point = isPlainLeaf(next) && next.textContent === "." ? next : null;
				if (point) next = point.nextElementSibling;
				const following = numberLeafAt(next);
				if (!following) break;
				if (point) {
					elements.push(point);
					text += ".";
				}
				elements.push(following);
				consumed.add(following);
				text += following.textContent ?? "";
				unit = containerOf(following);
			}
			const scripts = unit === elements.at(-1) ? null : unit.querySelector(":scope > .msupsub");
			if (scripts) {
				for (const inner of scripts.querySelectorAll(LEAVES)) consumed.add(inner);
				text += `^${(scripts.textContent ?? "").replace(/[\s​]/g, "")}`;
				elements[elements.length - 1] = unit;
			}
			tokens.push({key: `number:${text}`, elements});
		}
		return tokens;
	}

	function collectTokens(statement, targets) {
		const tokens = [];
		if (targets.variables) {
			for (const element of statement.querySelectorAll(VARIABLES)) {
				tokens.push({key: `variable:${element.textContent}`, elements: [element]});
			}
		}
		if (targets.numbers) tokens.push(...collectNumbers(statement));
		return tokens;
	}

	function watchStatement(statement, targets, signal) {
		let pinned = null;
		let highlighted = [];
		const keyAt = (target) => {
			if (!(target instanceof Element) || !target.closest(LEAVES)) return null;
			return (
				collectTokens(statement, targets).find(({elements}) =>
					elements.some((element) => element.contains(target)),
				)?.key ?? null
			);
		};
		const highlight = (key) => {
			for (const element of highlighted) element.classList.remove(HIGHLIGHT_CLASS, PINNED_CLASS);
			highlighted =
				key === null
					? []
					: collectTokens(statement, targets)
							.filter((token) => token.key === key)
							.flatMap(({elements}) => elements);
			const names = pinned === null ? [HIGHLIGHT_CLASS] : [HIGHLIGHT_CLASS, PINNED_CLASS];
			for (const element of highlighted) element.classList.add(...names);
		};
		statement.addEventListener(
			"mouseover",
			(event) => {
				const key = keyAt(event.target);
				if (key !== null && pinned === null) highlight(key);
			},
			{signal},
		);
		statement.addEventListener(
			"mouseout",
			(event) => {
				if (keyAt(event.target) !== null && pinned === null) highlight(null);
			},
			{signal},
		);
		statement.addEventListener(
			"click",
			(event) => {
				const key = keyAt(event.target);
				if (key === null) return;
				pinned = key === pinned ? null : key;
				highlight(key);
			},
			{signal},
		);
		return () => {
			pinned = null;
			highlight(null);
		};
	}

	var variableHover = defineFeature({
		id: "variable-hover",
		title: "variableHover.title",
		description: "variableHover.description",
		category: "category.statement",
		defaultEnabled: true,
		routes: ["atcoder:task", "atcoder:tasksPrint"],
		phase: "ready",
		options: {
			variables: option.boolean(true, "variableHover.variables"),
			numbers: option.boolean(true, "variableHover.numbers"),
		},
		live: true,
		start({options}) {
			const statements = [...document.querySelectorAll("#task-statement")];
			if (statements.length === 0 || (!options.variables && !options.numbers))
				return () => {
					return;
				};
			const style = injectStyle(variable_hover_default);
			const controller = new AbortController();
			const {signal} = controller;
			const clearers = statements.map((statement) => watchStatement(statement, options, signal));
			const clearAll = () => {
				for (const clear of clearers) clear();
			};
			document.addEventListener(
				"keydown",
				(event) => {
					if (event.key === "Escape") clearAll();
				},
				{signal},
			);
			return () => {
				controller.abort();
				clearAll();
				style.remove();
			};
		},
	});

	// CpToolkit/src/domain/contest/virtual.ts
	function virtualClock(now, startMs, durationMs) {
		if (now < startMs) return {phase: "before", remainingMs: startMs - now};
		const remainingMs = startMs + durationMs - now;
		return remainingMs > 0 ? {phase: "running", remainingMs} : {phase: "finished"};
	}

	function formatClock(remainingMs) {
		const seconds = Math.ceil(remainingMs / 1000);
		return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
			.map((value) => String(value).padStart(2, "0"))
			.join(":");
	}

	// CpToolkit/src/application/contest/virtual-participation.ts
	var STARTS_KEY = "virtual-timer:starts";
	var isStarts = isRecordOf(isNumber);

	class VirtualParticipations {
		state;

		constructor(state) {
			this.state = state;
		}

		startOf(contestId) {
			return this.starts()[contestId] ?? null;
		}

		record(contestId, startMs) {
			this.state.set(STARTS_KEY, {...this.starts(), [contestId]: startMs});
		}

		forget(contestId) {
			const {[contestId]: _forgotten, ...rest} = this.starts();
			this.state.set(STARTS_KEY, rest);
		}

		starts() {
			return readStored(this.state, STARTS_KEY, isStarts, {});
		}
	}

	// CpToolkit/src/features/virtual-timer/virtual-timer.css
	var virtual_timer_default = `.cp-virtual-timer {
	position: fixed;
	right: 10px;
	bottom: 0;
	z-index: 50;
	width: 160px;
	height: 80px;
	margin: 0;
	padding: 20px 0;
	background-image: url("//img.atcoder.jp/assets/contest/digitalclock.png");
	font-size: 15px;
	line-height: 20px;
	text-align: center;
	cursor: pointer;
	user-select: none;
}

.cp-virtual-timer[hidden] {
	display: none;
}
`;

	// CpToolkit/src/features/virtual-timer/index.ts
	var UPDATE_INTERVAL_MS = 200;
	var PHASE_LABELS = {
		before: "virtualTimer.untilStart",
		running: "virtualTimer.remaining",
	};

	function readVirtualStart() {
		const startMs = Date.parse(document.querySelector("#main-container time.fixtime-second")?.textContent ?? "");
		return Number.isNaN(startMs) ? null : startMs;
	}

	var virtualTimer = defineFeature({
		id: "virtual-timer",
		title: "virtualTimer.title",
		description: "virtualTimer.description",
		category: "category.contest",
		defaultEnabled: true,
		routes: ["atcoder:contest"],
		phase: "ready",
		options: {},
		live: true,
		start({isOnRoute, page, state, translate}) {
			const contestId = contestIdOf(location.pathname);
			const period = page.contestPeriod();
			const siteTimer = document.querySelector("#fixed-server-timer");
			if (!contestId || !period || !siteTimer)
				return () => {
					return;
				};
			const participations = new VirtualParticipations(state);
			if (isOnRoute("atcoder:virtual")) {
				const recorded = readVirtualStart();
				if (recorded === null) participations.forget(contestId);
				else participations.record(contestId, recorded);
			}
			const startMs = participations.startOf(contestId);
			if (startMs === null)
				return () => {
					return;
				};
			const style = injectStyle(virtual_timer_default);
			const controller = new AbortController();
			const {signal} = controller;
			const label = h("span");
			const clock = h("span");
			const timer = h("p", {className: "contest-timer cp-virtual-timer"}, label, h("br"), clock);
			document.body.append(timer);
			const show = (virtual) => {
				timer.hidden = !virtual;
				siteTimer.style.display = virtual ? "none" : "";
			};
			timer.addEventListener("click", () => show(false), {signal});
			siteTimer.addEventListener("click", () => show(true), {signal});
			show(true);
			const update = () => {
				const clockState = virtualClock(page.serverNow(), startMs, period.endMs - period.startMs);
				if (clockState.phase === "finished") {
					participations.forget(contestId);
					stop();
					return;
				}
				label.textContent = translate(PHASE_LABELS[clockState.phase]);
				clock.textContent = formatClock(clockState.remainingMs);
			};
			const interval = setInterval(update, UPDATE_INTERVAL_MS);
			const stop = () => {
				clearInterval(interval);
				controller.abort();
				show(false);
				timer.remove();
				style.remove();
			};
			update();
			return stop;
		},
	});

	// CpToolkit/src/features/wide-layout/wide-layout.css
	var wide_layout_default = `#main-container {
	width: var(--cp-main-width) !important;
	max-width: 100% !important;
	transition: none !important;
}
`;

	// CpToolkit/src/features/wide-layout/index.ts
	var wideLayout = defineFeature({
		id: "wide-layout",
		title: "wideLayout.title",
		description: "wideLayout.description",
		category: "category.layout",
		defaultEnabled: true,
		routes: ["atcoder:page"],
		phase: "start",
		options: {
			width: option.text("", "wideLayout.width", {
				validate: (value) => value === "" || CSS.supports("width", value),
			}),
		},
		live: true,
		start({options}) {
			if (options.width === "") return () => {
			};
			const style = injectStyle(`:root {--cp-main-width: ${options.width};}
${wide_layout_default}`);
			return () => style.remove();
		},
	});

	// CpToolkit/src/app/registry.ts
	var features = [
		wideLayout,
		hoverMenu,
		statementHighlight,
		variableHover,
		statementCopy,
		efficientLayout,
		submissionQuery,
		submissionShortcuts,
		languageButtons,
		sourceComments,
		resultNotifier,
		clarNotifier,
		averageResult,
		submissionTimer,
		taskDropdown,
		taskStatus,
		editorialList,
		topLinks,
		latestContests,
		contestCalendar,
		virtualTimer,
		tessokuDifficulty,
		ratingGraph,
		localRunner,
		keyboardShortcuts,
		submissionHelper,
		easyTest,
		paizaLanguage,
	];

	// CpToolkit/src/app/bootstrap.ts
	function bootstrap() {
		const host = new GmScriptHost();
		document.documentElement.dataset.cpToolkit = host.version;
		const lifecycle = new DocumentLifecycle();
		const store = new GmKeyValueStore();
		const updates = new UpdateChecker({
			host,
			http: new GmHttpClient(),
			state: store,
			allowedHosts: updateCatalog.connect,
			intervalHours: updateCatalog.checkIntervalHours,
		});
		const settings = new SettingsService(store);
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		const page = matchPage(judges, location.href);
		const siteSettings = settings.forSite(page?.judge.id ?? null);
		let panel = null;
		const services = createServices(page, siteSettings, () => panel?.open());
		configureToasts({region: host.name, close: () => services.translate("settings.close")});
		const runtime = new FeatureRuntime({
			features,
			page,
			lifecycle,
			settings: siteSettings,
			services,
			logger: new ConsoleLogger(host.name),
		});
		runtime.start();
		const {translate} = services;
		panel = createSettingsPanel({
			features,
			settings,
			sites: judges,
			currentSite: page?.judge.id ?? null,
			runtime,
			translate,
			updates,
		});
		lifecycle.reach("ready").then(() => {
			host.registerCommand(translate("settings.open"), () => panel?.open());
			if (page) addNavigationEntry(page.judge.navigationLists, host.name, () => panel?.open());
			updates.check(Date.now()).then((status) => {
				if (updates.claimNotification()) notifyUpdate(host.name, status, translate);
			});
		});
	}

	// CpToolkit/src/main.ts
	bootstrap();
})();
