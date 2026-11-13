// ==UserScript==
// @name           CP Toolkit
// @name:en        CP Toolkit
// @namespace      https://github.com/nsubaru11/atcoder-java-tools/tree/main/userscripts
// @version        2.0.0
// @description    競技プログラミングの補助機能をまとめ、機能ごとに ON/OFF できるようにします。
// @description:en A toolkit of competitive programming helpers that can be switched on and off individually.
// @description:ja 競技プログラミングの補助機能をまとめ、機能ごとに ON/OFF できるようにします。
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

	// ../shared/src/easy-test-judge.ts
	var FLOAT_PATTERN = /^[-+]?[0-9]*\.[0-9]+([eE][-+]?[0-9]+)?$/;

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
			const superEquals = equals;
			equals = (x, y) => {
				if (FLOAT_PATTERN.test(x) || FLOAT_PATTERN.test(y)) {
					const a = Number.parseFloat(x);
					const b = Number.parseFloat(y);
					return Math.abs(a - b) <= Math.max(allowableError, Math.abs(b) * allowableError);
				}
				return superEquals(x, y);
			};
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

	// ../shared/src/utils.ts
	function normalizeNewlines(text) {
		return text.replace(
			/\r\n?/g,
			`
`,
		);
	}

	// ../shared/src/java-transform.ts
	var State = {Normal: 0, LineComment: 1, BlockComment: 2, String: 3, Char: 4};

	function createMaskedCode(text) {
		const out = [];
		let state = State.Normal;
		let isEscape = false;
		const mask = (c) =>
			c ===
			`
`
				? `
`
				: " ";
		for (let i = 0, len = text.length; i < len; i++) {
			const c = text[i],
				n = i + 1 < len ? text[i + 1] : "";
			if (state === State.LineComment) {
				out.push(mask(c));
				if (
					c ===
					`
`
				)
					state = State.Normal;
			} else if (state === State.BlockComment) {
				if (c === "*" && n === "/") {
					out.push(" ", " ");
					i++;
					state = State.Normal;
				} else {
					out.push(mask(c));
				}
			} else if (state === State.String || state === State.Char) {
				const closeChar = state === State.String ? '"' : "'";
				if (isEscape) {
					isEscape = false;
					out.push(" ");
				} else if (c === "\\") {
					isEscape = true;
					out.push(" ");
				} else if (c === closeChar) {
					state = State.Normal;
					out.push(" ");
				} else {
					out.push(mask(c));
				}
			} else {
				if (c === "/" && n === "/") {
					out.push(" ", " ");
					i++;
					state = State.LineComment;
				} else if (c === "/" && n === "*") {
					out.push(" ", " ");
					i++;
					state = State.BlockComment;
				} else if (c === '"') {
					state = State.String;
					out.push(" ");
				} else if (c === "'") {
					state = State.Char;
					out.push(" ");
				} else {
					out.push(c);
				}
			}
		}
		return out.join("");
	}

	var LIBRARY_IMPORT_PATTERN = /^\s*import\s+(?:static\s+)?lib\./m;

	function usesJavaLibrary(code) {
		return LIBRARY_IMPORT_PATTERN.test(createMaskedCode(code));
	}

	function findMatchingBrace(maskedText, openBraceIdx) {
		let depth = 1;
		for (let i = openBraceIdx + 1; i < maskedText.length; i++) {
			if (maskedText[i] === "{") depth++;
			else if (maskedText[i] === "}" && --depth === 0) return i;
		}
		return -1;
	}

	function isPublicClass(maskedText, classKeywordIndex) {
		const lineStart =
			maskedText.lastIndexOf(
				`
`,
				classKeywordIndex,
			) + 1;
		return /\bpublic\b/.test(maskedText.slice(lineStart, classKeywordIndex));
	}

	function buildClassInfo(maskedText, m) {
		const name = m[1];
		const classStart = m.index;
		const nameStart = classStart + m[0].length - name.length;
		const nameEnd = nameStart + name.length;
		const openBraceIdx = maskedText.indexOf("{", nameEnd);
		if (openBraceIdx === -1) return null;
		return {
			name,
			nameStart,
			nameEnd,
			classStart,
			closeBraceIdx: findMatchingBrace(maskedText, openBraceIdx),
			isPublic: isPublicClass(maskedText, classStart),
		};
	}

	var ANNOTATION = String.raw`@[\w.]+(?:\s*\([^)]*\))?`;
	var MAIN_METHOD_REGEX = new RegExp(
		String.raw`((?:(?:public|static|final|synchronized|strictfp|${ANNOTATION})\s+)+)void\s+main\s*\(\s*` +
			String.raw`(?:(?:final|${ANNOTATION})\s+)*String\s*(?:\[\s*]|\.\.\.|\s+[A-Za-z_$][\w$]*\s*\[\s*])`,
		"g",
	);

	function findMainMethodIndices(maskedText) {
		return [...maskedText.matchAll(MAIN_METHOD_REGEX)]
			.filter((m) => /\bpublic\b/.test(m[1]) && /\bstatic\b/.test(m[1]))
			.map((m) => m.index);
	}

	function findMainClassInfo(maskedText) {
		const mainIndices = findMainMethodIndices(maskedText);
		const classRegex = /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/g;
		const candidates = [];
		let m;
		while ((m = classRegex.exec(maskedText)) !== null) {
			const info = buildClassInfo(maskedText, m);
			if (info) candidates.push(info);
		}
		const declaring = candidates.filter(
			(c) =>
				c.closeBraceIdx !== -1 && mainIndices.some((index) => index > c.classStart && index < c.closeBraceIdx),
		);
		return (
			declaring.find((c) => c.name === "Main") ??
			declaring[0] ??
			candidates.find((c) => c.isPublic) ??
			candidates[0] ??
			null
		);
	}

	function removePackageDeclaration(maskedCode, currentCode) {
		const m = /\bpackage\s+[A-Za-z_][A-Za-z0-9_.]*\s*;/.exec(maskedCode);
		if (!m) return {code: currentCode, modified: false};
		let end = m.index + m[0].length;
		if (
			currentCode[end] ===
			`
`
		)
			end++;
		return {
			code: currentCode.slice(0, m.index) + currentCode.slice(end),
			modified: true,
		};
	}

	function renameClassToMain(maskedCode, currentCode) {
		const info = findMainClassInfo(maskedCode);
		if (!info || info.name === "Main") return {code: currentCode, modified: false};
		const escapedName = info.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const refRegex = new RegExp(`\\b${escapedName}\\b`, "g");
		const replacements = [];
		let rm;
		while ((rm = refRegex.exec(maskedCode)) !== null) {
			replacements.push({start: rm.index, end: rm.index + info.name.length});
		}
		replacements.sort((a, b) => b.start - a.start);
		let code = currentCode;
		for (const {start, end} of replacements) {
			code = code.slice(0, start) + "Main" + code.slice(end);
		}
		return {code, modified: true};
	}

	function disableDebugStatements(maskedCode, currentCode) {
		const debugRegex = /\bDEBUG\b\s*=\s*true\b/g;
		const replacements = [];
		let dm;
		while ((dm = debugRegex.exec(maskedCode)) !== null) {
			const trueIdx = dm.index + dm[0].lastIndexOf("true");
			replacements.push({start: trueIdx, end: trueIdx + 4});
		}
		if (!replacements.length) return {code: currentCode, modified: false};
		replacements.sort((a, b) => b.start - a.start);
		let code = currentCode;
		for (const {start, end} of replacements) {
			code = code.slice(0, start) + "false" + code.slice(end);
		}
		return {code, modified: true};
	}

	function modifyJavaCode(originalCode, options) {
		let currentCode = normalizeNewlines(originalCode);
		let packageRemoved = false;
		let classReplaced = false;
		let debugReplaced = false;
		if (options.removePackage) {
			const result = removePackageDeclaration(createMaskedCode(currentCode), currentCode);
			currentCode = result.code;
			packageRemoved = result.modified;
		}
		if (options.renameClass) {
			const result = renameClassToMain(createMaskedCode(currentCode), currentCode);
			currentCode = result.code;
			classReplaced = result.modified;
		}
		if (options.fixDebug) {
			const result = disableDebugStatements(createMaskedCode(currentCode), currentCode);
			currentCode = result.code;
			debugReplaced = result.modified;
		}
		currentCode = currentCode.replace(/^(?:[\t ]*\n)+/, "");
		return {modified: currentCode, packageRemoved, classReplaced, debugReplaced};
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
	function isHttpUrl(value) {
		return /^https?:\/\//.test(value);
	}

	function toEasyTestStatus(status, exitCode = 0) {
		switch (status) {
			case "success":
				return exitCode === 0 ? "OK" : "RE";
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
			return [
				{featureId: "local-runner", options: defined({url: config["codeRunner.localRunnerURL"] || undefined})},
				{
					featureId: "easy-test",
					enable: true,
					options: defined({
						precompile: parseFlag(config["codeRunner.precompile.enable"]),
						keyboardShortcuts: parseFlag(config["ui.useKeyboardShortcut"]),
					}),
				},
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
	var CURRENT_SETTINGS_VERSION = 1;
	var MIGRATIONS = {};

	function createDefaultSettings() {
		return {version: CURRENT_SETTINGS_VERSION, features: {}};
	}

	function parseFeatureSettings(raw) {
		const {enabled, options} = parseStoredObject(raw);
		return {
			...(typeof enabled === "boolean" ? {enabled} : {}),
			options: parseStoredObject(options),
		};
	}

	function parseSettings(raw) {
		const {version, features} = parseStoredObject(raw);
		const entries = Object.entries(parseStoredObject(features));
		let settings = {
			version: typeof version === "number" ? version : CURRENT_SETTINGS_VERSION,
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

	// CpToolkit/src/application/settings/settings-service.ts
	var STORAGE_KEY = "settings";

	class SettingsService {
		settings;
		listeners = new Set();
		store;

		constructor(store) {
			this.store = store;
			this.settings = parseSettings(store.get(STORAGE_KEY));
			store.subscribeRemote(STORAGE_KEY, (value) => this.replace(parseSettings(value)));
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
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return false;
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
	class GmScriptHost {
		name = GM_info.script.name;
		version = GM_info.script.version;

		registerCommand(label, action) {
			GM_registerMenuCommand(label, action);
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

dialog::backdrop {
	background: rgb(0 0 0 / 45%);
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
	function createModal({title, closeLabel, css}) {
		const body = h("div", {className: "modal-body"});
		const footer = h("footer", {className: "modal-footer"});
		const closeButton = h("button", {type: "button", textContent: closeLabel});
		const dialog = h(
			"dialog",
			{},
			h("header", {className: "modal-header"}, h("h2", {textContent: title}), closeButton),
			body,
			footer,
		);
		closeButton.addEventListener("click", () => dialog.close());
		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) dialog.close();
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
				if (!dialog.open) dialog.showModal();
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
		color(defaultValue, label) {
			return {kind: "color", defaultValue, label, normalize: normalizeColor};
		},
		number(defaultValue, label, {min = -Infinity, max = Infinity} = {}) {
			return {
				kind: "number",
				defaultValue,
				label,
				min,
				max,
				normalize: (value) => (typeof value === "number" && value >= min && value <= max ? value : undefined),
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

	// CpToolkit/src/features/settings-panel/feature-row.ts
	var STATUS_MESSAGES = {
		disabled: "status.disabled",
		outOfScope: "status.outOfScope",
		pending: "status.pending",
		running: "status.running",
		reloadRequired: "status.reloadRequired",
		failed: "status.failed",
	};

	function createOptionsSection({feature, settings, translate}) {
		const definitions = Object.entries(feature.options);
		if (definitions.length === 0) return null;
		const values = normalizeOptions(feature.options, settings.storedOptions(feature.id));
		const fields = definitions.map(([key, definition]) =>
			createOptionField({
				definition,
				value: values[key],
				translate,
				onChange: (value) => settings.setOption(feature.id, key, value),
			}),
		);
		return h(
			"details",
			{className: "feature-options"},
			h("summary", {textContent: translate("settings.options")}),
			h("div", {className: "feature-fields"}, ...fields),
		);
	}

	function createFeatureRow(params) {
		const {feature, settings, runtime, translate} = params;
		const title = translate(feature.title);
		const toggle = createSwitch(title, (enabled) => settings.setEnabled(feature.id, enabled));
		const statusLabel = h("span", {className: "status"});
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

.footer-version {
	margin-left: auto;
	color: var(--cp-text-muted);
	font-size: 12px;
}
`;

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
		const {features, settings, runtime, translate, version} = dependencies;
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
		const refresh = () => {
			for (const row of rows) row.refresh();
			notice.hidden = !rows.some((row) => row.status().state === "reloadRequired");
		};
		const render = () => {
			rows = [];
			const sections = [...Map.groupBy(features, ({category}) => category)].map(([category, members]) => {
				const memberRows = members.map((feature) => createFeatureRow({feature, settings, runtime, translate}));
				rows.push(...memberRows);
				return h(
					"section",
					{className: "category"},
					h("h3", {textContent: translate(category)}),
					...memberRows.map((row) => row.element),
				);
			});
			content.replaceChildren(...sections);
			if (features.length === 0) {
				content.append(h("p", {className: "empty", textContent: translate("settings.empty")}));
			}
			refresh();
		};
		const importFile = async (file) => {
			const imported = settings.importJson(await file.text());
			importError.hidden = imported;
			if (imported) render();
		};
		const createFooter = () => {
			const fileInput = h("input", {type: "file", accept: "application/json,.json", hidden: true});
			fileInput.addEventListener("change", () => {
				const file = fileInput.files?.[0];
				fileInput.value = "";
				if (file) importFile(file);
			});
			const button = (label, onclick) => {
				return h("button", {type: "button", textContent: translate(label), onclick});
			};
			return [
				button("settings.export", () => downloadText("cp-toolkit-settings.json", settings.exportJson())),
				button("settings.import", () => fileInput.click()),
				button("settings.reset", () => {
					if (!window.confirm(translate("settings.resetConfirm"))) return;
					settings.reset();
					importError.hidden = true;
					render();
				}),
				fileInput,
				h("span", {className: "footer-version", textContent: `v${version}`}),
			];
		};
		const createPanelModal = () => {
			const created = createModal({
				title: translate("settings.title"),
				closeLabel: translate("settings.close"),
				css: `${form_default}
${settings_panel_default}`,
			});
			created.body.append(notice, importError, content);
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
			shortcut: "Ctrl+Enter",
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
			shortcut: "Ctrl+Shift+Enter",
			submitButtons: ["#submit"],
		},
		samples: [
			{
				selector: "#task-statement p+pre.literal-block",
				container: ".section",
			},
			{
				selector: "#task-statement pre.source-code-for-copy",
				container: ".part",
			},
			{
				selector: "#task-statement .lang>*:nth-child(1) .div-btn-copy+pre",
				container: ".part",
			},
			{
				selector: "#task-statement .div-btn-copy+pre",
				container: ".part",
			},
			{
				selector: "#task-statement>.part pre.linenums",
				container: ".part",
			},
			{
				selector: "#task-statement>.part section>pre",
				container: ".part",
			},
			{
				selector: "#task-statement>.part:not(.io-style)>h3+section>pre",
				container: ".part",
			},
			{
				selector: "#task-statement pre",
				container: ".part",
			},
			{
				selector: "#task-statement .div-btn-copy+pre",
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
			shortcut: "Ctrl+Shift+Enter",
			submitButtons: [".submit-form .submit", ".submitForm .submit", 'input[type="submit"].submit'],
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
			shortcut: "Ctrl+Shift+Alt+Enter",
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
			shortcut: "Ctrl+Enter",
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
		"settings.invalidValue": "This value is not valid.",
		"settings.reloadNotice": "Reload the page to apply your changes.",
		"settings.reload": "Reload",
		"settings.export": "Export settings",
		"settings.import": "Import settings",
		"settings.importFailed": "The settings file could not be read.",
		"settings.reset": "Reset to defaults",
		"settings.resetConfirm": "All settings will be reset to their defaults. Continue?",
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
		"category.execution": "Execution",
		"wideLayout.title": "Wider page",
		"wideLayout.description": "Widens the central column of the page to the specified width.",
		"wideLayout.width": "Width (e.g. 75%, 1200px; empty for the original width; 75% recommended)",
		"hoverMenu.title": "Open menus on hover",
		"hoverMenu.description": "Opens menus when the pointer moves over them.",
		"statementHighlight.title": "Statement highlighting",
		"statementHighlight.description": "Highlights numbers, variables, and the time and memory limits.",
		"statementHighlight.numberColor": "Number color",
		"statementHighlight.variableColor": "Variable color",
		"statementHighlight.timeColor": "Time limit color",
		"statementHighlight.memoryColor": "Memory limit color",
		"statementHighlight.alwaysEmphasizeLimits": "Also emphasize limits of 2 sec and 1024 MiB",
		"statementCopy.title": "Copy statement",
		"statementCopy.description": "Adds buttons that copy each section or the whole statement.",
		"statementCopy.format": "Copy format",
		"statementCopy.formatMarkdown": "Markdown",
		"statementCopy.formatPlain": "Plain text",
		"statementCopy.copy": "Copy",
		"statementCopy.copyAll": "Copy All",
		"statementCopy.copied": "Copied!",
		"statementCopy.defaultTitle": "Task",
		"efficientLayout.title": "Side-by-side samples",
		"efficientLayout.description": "Places the input and output formats and samples side by side.",
		"efficientLayout.widthMode": "How to size each sample pair",
		"efficientLayout.widthModeAuto": "Auto (fit the content)",
		"efficientLayout.widthModeFixed": "Fixed",
		"efficientLayout.sampleWidth": "Fixed width (% of the screen; 20 to 30 recommended)",
		"efficientLayout.maxSampleWidth": "Maximum width in auto mode (% of the screen)",
		"efficientLayout.samples": "Samples",
		"efficientLayout.ioFormat": "Input and output",
		"submissionQuery.title": "Keep submission filters",
		"submissionQuery.description": "Keeps search filters when switching between All and My submissions.",
		"submissionShortcuts.title": "AC submission buttons",
		"submissionShortcuts.description":
			"Adds buttons that open the AC submissions for the task, sorted by time, code size, submission time or memory. Choose the buttons to show in the detailed settings. They are hidden during a contest.",
		"submissionShortcuts.language": "Language (empty for all)",
		"submissionShortcuts.label": "AC submissions",
		"submissionShortcuts.time": "Time",
		"submissionShortcuts.length": "Size",
		"submissionShortcuts.created": "Submitted",
		"submissionShortcuts.memory": "Memory",
		"submissionShortcuts.byTime": "Show the button sorted by time",
		"submissionShortcuts.byLength": "Show the button sorted by code size",
		"submissionShortcuts.byCreated": "Show the button sorted by submission time",
		"submissionShortcuts.byMemory": "Show the button sorted by memory",
		"resultNotifier.title": "Submission notifications",
		"resultNotifier.description":
			"Shows the verdict right after judging finishes, on any page. Keep at least one AtCoder tab open.",
		"resultNotifier.desktop": "Use desktop notifications while you are away from AtCoder",
		"clarNotifier.title": "Clarification notifications",
		"clarNotifier.description": "Notifies you when the organizers post an answer or a correction during a contest.",
		"clarNotifier.desktop": "Use desktop notifications while you are away from AtCoder",
		"clarNotifier.arrived": "{count} new clarification(s)",
		"averageResult.title": "Test case averages",
		"averageResult.description": "Shows average time and memory on the submission page.",
		"averageResult.average": "Average",
		"submissionTimer.title": "Delayed submission",
		"submissionTimer.description": "Submits your code after the specified time.",
		"submissionTimer.minutes": "Minutes until submission",
		"submissionTimer.set": "Set",
		"submissionTimer.cancel": "Cancel",
		"submissionTimer.canceled": "The timer was canceled.",
		"submissionTimer.scheduled": "Your code will be submitted around {time}.",
		"languageButtons.title": "Language switch buttons",
		"languageButtons.description":
			"Saves your frequently used languages as a row of buttons, so you can switch to one in a single click. Pick the languages from the gear below the language selector.",
		"languageButtons.configure": "Choose languages for the buttons",
		"languageButtons.hint": "Buttons for the checked languages appear below the language selector.",
		"sourceComments.title": "Header and footer",
		"sourceComments.description":
			"Adds a header to the top and a footer to the bottom of pasted code as comments, for example to attach reference URLs, and rewrites them when the language changes.",
		"sourceComments.style": "Default comment style",
		"sourceComments.styleLine": "Single-line comments",
		"sourceComments.styleBlock": "Multi-line comment",
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
			"Colors the task list and the dropdown by all your submissions, including those after the contest. A task with an AC or a score counts as accepted.",
		"taskStatus.acceptedColor": "Color of accepted tasks",
		"taskStatus.rejectedColor": "Color of tasks not accepted",
		"taskDropdown.title": "Task dropdown",
		"taskDropdown.description": "Opens tasks from the Tasks tab and opens several tasks at once.",
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
		"editorialList.description": "Shows the editorials of every task on the editorial page.",
		"variableHover.title": "Highlight hovered variables and numbers",
		"variableHover.description":
			"Hovering a variable or a number in the statement highlights every occurrence. Click to pin, Esc to clear.",
		"variableHover.variables": "Highlight variables",
		"variableHover.numbers": "Highlight numbers",
		"latestContests.title": "Next contests",
		"latestContests.description": "Adds a header menu with the upcoming contests listed on the home page.",
		"latestContests.menu": "Next contests",
		"latestContests.loading": "Loading...",
		"latestContests.failed": "Could not load the list",
		"contestCalendar.title": "Add to calendar",
		"contestCalendar.description": "Adds a link to contest pages that registers the contest in Google Calendar.",
		"contestCalendar.add": "Add to calendar",
		"virtualTimer.title": "Virtual contest timer",
		"virtualTimer.description":
			"Shows the time until the start and the time left of a virtual participation in the corner clock. Open the virtual page once to record the start time.",
		"virtualTimer.untilStart": "Starts in",
		"virtualTimer.remaining": "Time left",
		"topLinks.title": "Contest links on the top page",
		"topLinks.description": "Replaces the top page list with links to past contests by type.",
		"tessokuDifficulty.title": "Tessoku difficulty",
		"tessokuDifficulty.description": "Shows the difficulty from the book on the Tessoku task list.",
		"tessokuDifficulty.sortByDifficulty": "Sort by difficulty",
		"tessokuDifficulty.sortById": "Sort by task number",
		"ratingGraph.title": "Performance on the user page graph",
		"ratingGraph.description":
			"Overlays performance on the rating graph of user pages (profiles), including other users' pages.",
		"ratingGraph.recentByDefault": "Show only recent results at first",
		"ratingGraph.recentRange": "Recent range (e.g. 20 for the last 20 contests, 50% for the latest half)",
		"ratingGraph.recentRangeInvalid": "Enter a whole number of 1 or more, or a percentage from 1% to 100%.",
		"ratingGraph.togglePerformance": "Toggle performance",
		"ratingGraph.showAll": "all",
		"ratingGraph.showRecent": "recent",
		"localRunner.title": "Local Runner",
		"localRunner.description":
			"Connects to the local server used to transform and run code. Local Runner needs a separate installation. A server of your own with the same API also works.",
		"localRunner.url": "Server URL",
		"javaSubmit.title": "Java submission helper",
		"javaSubmit.description":
			"Transforms pasted code for submission and adds submit shortcuts. Removing packages, renaming the class and disabling DEBUG work without Local Runner. Expanding lib.*, completing imports and adding the header need Local Runner.",
		"javaSubmit.localRunnerRequired": "Expanding lib.* needs Local Runner",
		"javaSubmit.localRunnerGuide":
			"Could not connect to Local Runner, so only the basic transform was applied. Submitting this code will cause a compile error. See the link for setup instructions.",
		"javaSubmit.libraryRequired": "Expanding lib.* needs the library to be set",
		"javaSubmit.libraryGuide":
			"The library folder is not set in Local Runner, so only the basic transform was applied. Submitting this code will cause a compile error. See the link for setup instructions.",
		"javaSubmit.removePackage": "Remove package declarations when Local Runner is unavailable",
		"javaSubmit.renameClass": "Rename the class to Main when Local Runner is unavailable",
		"javaSubmit.fixDebug": "Set DEBUG to false when Local Runner is unavailable",
		"javaSubmit.addHeader": "Add the submission header",
		"javaSubmit.headerName": "Header name (empty for the default)",
		"javaSubmit.foldOnPaste": "Fold classes and comments after pasting",
		"easyTest.title": "Easy Test+",
		"easyTest.description":
			"Based on AtCoder Easy Test v2, with additional features. Runs samples from the task page and checks the results. With Local Runner, code runs on your PC and the code you are editing is compiled in advance. Enable only one of this and AtCoder Easy Test v2, because using both duplicates the buttons.",
		"easyTest.precompile": "Precompile edited code with Local Runner",
		"easyTest.keyboardShortcuts": "Use shortcuts (Ctrl+Enter, Alt+Enter, Alt+Esc)",
		"easyTest.savedCodeLimit": "Number of saved solutions",
		"easyTest.allowableError": "Allowed error",
		"easyTest.run": "Run",
		"easyTest.testAndSubmit": "Test & Submit",
		"easyTest.cancelSubmit": "Cancel Submission",
		"easyTest.testAll": "Test All Samples",
		"easyTest.restore": "Restore Last Code",
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
		"easyTest.restoreConfirm": "Your current code will be replaced. Continue?",
		"paizaLanguage.title": "paiza language selection",
		"paizaLanguage.description":
			"Selects the specified language on paiza submission pages. It does nothing until you set a language.",
		"paizaLanguage.language": "Language (e.g. c++, java, python3)",
	};

	// CpToolkit/data/i18n/ja.yaml
	var ja_default = {
		"settings.open": "設定を開く",
		"settings.title": "CP Toolkit の設定",
		"settings.close": "閉じる",
		"settings.empty": "設定できる機能はありません。",
		"settings.options": "詳細設定",
		"settings.invalidValue": "値の形式が正しくありません。",
		"settings.reloadNotice": "変更を反映するには再読み込みしてください。",
		"settings.reload": "再読み込み",
		"settings.export": "設定を書き出す",
		"settings.import": "設定を読み込む",
		"settings.importFailed": "設定ファイルを読み込めませんでした。",
		"settings.reset": "初期状態に戻す",
		"settings.resetConfirm": "すべての設定を初期状態に戻します。よろしいですか?",
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
		"category.execution": "実行環境",
		"wideLayout.title": "ページ幅の拡張",
		"wideLayout.description": "ページ中央の幅を、指定した幅に広げます。",
		"wideLayout.width": "幅(例: 75%, 1200px。空欄なら元の幅。おすすめは 75%)",
		"hoverMenu.title": "メニューのホバー表示",
		"hoverMenu.description": "マウスを重ねるだけでメニューを開きます。",
		"statementHighlight.title": "問題文の強調表示",
		"statementHighlight.description": "問題文中の数字と変数、実行時間とメモリの制限を強調します。",
		"statementHighlight.numberColor": "数字の色",
		"statementHighlight.variableColor": "変数の色",
		"statementHighlight.timeColor": "実行時間制限の色",
		"statementHighlight.memoryColor": "メモリ制限の色",
		"statementHighlight.alwaysEmphasizeLimits": "2 秒と 1024 MiB の制限も強調する",
		"statementCopy.title": "問題文のコピー",
		"statementCopy.description": "問題文の各項目と全体をコピーするボタンを追加します。",
		"statementCopy.format": "コピーする形式",
		"statementCopy.formatMarkdown": "Markdown",
		"statementCopy.formatPlain": "プレーンテキスト",
		"statementCopy.copy": "Copy",
		"statementCopy.copyAll": "Copy All",
		"statementCopy.copied": "Copied!",
		"statementCopy.defaultTitle": "問題",
		"efficientLayout.title": "サンプルの横並び",
		"efficientLayout.description": "入出力の形式とサンプルを横に並べて表示します。",
		"efficientLayout.widthMode": "サンプル1組の幅の決め方",
		"efficientLayout.widthModeAuto": "自動(中身の長さに合わせる)",
		"efficientLayout.widthModeFixed": "固定",
		"efficientLayout.sampleWidth": "固定のときの幅(画面幅に対する %。おすすめは 20〜30)",
		"efficientLayout.maxSampleWidth": "自動のときの上限(画面幅に対する %)",
		"efficientLayout.samples": "入出力例",
		"efficientLayout.ioFormat": "入出力形式",
		"submissionQuery.title": "提出一覧の検索条件の保持",
		"submissionQuery.description": "提出一覧の「すべての提出」と「自分の提出」を切り替えても、検索条件を保ちます。",
		"submissionShortcuts.title": "AC 提出へのボタン",
		"submissionShortcuts.description":
			"問題ページに、この問題の AC 提出を実行時間、コード長、提出時間、メモリの順で開くボタンを追加します。出すボタンは詳細設定で選べます。コンテスト中は表示しません。",
		"submissionShortcuts.language": "言語(空欄ならすべて)",
		"submissionShortcuts.label": "AC提出",
		"submissionShortcuts.time": "実行時間",
		"submissionShortcuts.length": "コード長",
		"submissionShortcuts.created": "提出時間",
		"submissionShortcuts.memory": "メモリ",
		"submissionShortcuts.byTime": "実行時間順のボタンを出す",
		"submissionShortcuts.byLength": "コード長順のボタンを出す",
		"submissionShortcuts.byCreated": "提出時間順のボタンを出す",
		"submissionShortcuts.byMemory": "メモリ順のボタンを出す",
		"resultNotifier.title": "提出結果の通知",
		"resultNotifier.description":
			"判定が終わると、どのページにいても結果をすぐに通知します。AtCoder のタブを1つは開いたままにしてください。",
		"resultNotifier.desktop": "AtCoder を操作していないときはデスクトップ通知も出す",
		"clarNotifier.title": "Clar の通知",
		"clarNotifier.description": "コンテスト中に運営からの回答や訂正(Clar)が届くと通知します。",
		"clarNotifier.desktop": "AtCoder を操作していないときはデスクトップ通知も出す",
		"clarNotifier.arrived": "新しい Clar が {count} 件あります",
		"averageResult.title": "テストケースの平均",
		"averageResult.description": "提出の詳細に、実行時間とメモリの平均を表示します。",
		"averageResult.average": "平均",
		"submissionTimer.title": "提出の予約",
		"submissionTimer.description": "指定した時間が経ったらコードを提出します。",
		"submissionTimer.minutes": "何分後に提出するか",
		"submissionTimer.set": "セットする",
		"submissionTimer.cancel": "取り消す",
		"submissionTimer.canceled": "タイマーを取り消しました。",
		"submissionTimer.scheduled": "{time} ごろに提出します。",
		"languageButtons.title": "言語の切り替えボタン",
		"languageButtons.description":
			"よく使う言語をボタンとして並べて保存しておき、1回の操作で切り替えられるようにします。並べる言語は選択欄の下の歯車から選びます。",
		"languageButtons.configure": "ボタンにする言語を選ぶ",
		"languageButtons.hint": "チェックした言語のボタンを選択欄の下に表示します。",
		"sourceComments.title": "ヘッダーとフッター",
		"sourceComments.description":
			"貼り付けたコードの先頭にヘッダー、末尾にフッターをコメントとして追記します。参照元の URL の添付などに使えます。言語を変えるとコメントの書き方も切り替えます。",
		"sourceComments.style": "既定のコメントの形式",
		"sourceComments.styleLine": "単一行コメントを並べる",
		"sourceComments.styleBlock": "複数行コメント",
		"sourceComments.panel": "ヘッダーとフッター",
		"sourceComments.header": "ヘッダー(コードの先頭)",
		"sourceComments.footer": "フッター(コードの末尾)",
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
		"taskStatus.title": "問題の正誤の色分け",
		"taskStatus.description":
			"問題一覧とドロップダウンを、コンテスト後を含む自分の提出に合わせて色分けします。AC か得点があれば正解として扱います。",
		"taskStatus.acceptedColor": "正解した問題の色",
		"taskStatus.rejectedColor": "正解していない問題の色",
		"taskDropdown.title": "問題のドロップダウン",
		"taskDropdown.description": "「問題」タブから各問題へ移動でき、複数の問題をまとめて開けます。",
		"taskDropdown.newTab": "新しいタブで開く",
		"taskDropdown.taskTable": "問題一覧",
		"taskDropdown.openAtOnce": "まとめて開く",
		"taskDropdown.loadFailed": "(読み込み失敗)",
		"taskDropdown.all": "すべて",
		"taskDropdown.range": "範囲を指定",
		"taskDropdown.reverse": "逆順で開く",
		"taskDropdown.cancel": "キャンセル",
		"taskDropdown.tabCount": "{count} 個のタブが開きます。ブロックされた場合はポップアップを許可してください。",
		"taskDropdown.tabLimit": "※一度に開けるタブは {count} 個までです。",
		"editorialList.title": "解説の一覧表示",
		"editorialList.description": "解説ページで、すべての問題の解説をまとめて表示します。",
		"variableHover.title": "ホバーした変数と数値の強調",
		"variableHover.description":
			"問題文の変数や数値に重ねると、同じ変数や数値をすべて強調します。クリックで固定し、Esc で解除します。",
		"variableHover.variables": "変数を強調する",
		"variableHover.numbers": "数値を強調する",
		"latestContests.title": "次のコンテスト",
		"latestContests.description": "ホームの「次のコンテスト」の一覧を、ヘッダーのメニューから開けるようにします。",
		"latestContests.menu": "次のコンテスト",
		"latestContests.loading": "読み込み中...",
		"latestContests.failed": "取得できませんでした",
		"contestCalendar.title": "カレンダーへの登録",
		"contestCalendar.description": "コンテストのページに、Google カレンダーへ登録するリンクを追加します。",
		"contestCalendar.add": "カレンダーに追加",
		"virtualTimer.title": "バーチャル参加のタイマー",
		"virtualTimer.description":
			"バーチャル参加の開始までの時間と残り時間を、画面右下の時計に表示します。参加のページを開くと開始時刻を記憶します。",
		"virtualTimer.untilStart": "開始まであと",
		"virtualTimer.remaining": "残り時間",
		"topLinks.title": "トップページのコンテスト一覧",
		"topLinks.description": "トップページの一覧を、種類ごとの過去問へのリンクに置き換えます。",
		"tessokuDifficulty.title": "鉄則本の難易度表示",
		"tessokuDifficulty.description": "「競技プログラミングの鉄則」の問題一覧に、書籍の難易度を表示します。",
		"tessokuDifficulty.sortByDifficulty": "難易度順で並べ替え",
		"tessokuDifficulty.sortById": "問題番号順で並べ替え",
		"ratingGraph.title": "ユーザーページのグラフへのパフォーマンス表示",
		"ratingGraph.description":
			"ユーザーページ(プロフィール)のレーティンググラフに、パフォーマンスを重ねて表示します。自分以外のユーザーのページでも表示します。",
		"ratingGraph.recentByDefault": "最初は最近の結果だけを表示する",
		"ratingGraph.recentRange": "最近の結果の範囲(例: 20 で直近20回、50% で直近の半分)",
		"ratingGraph.recentRangeInvalid": "1 以上の整数か、1% から 100% の割合を入力してください。",
		"ratingGraph.togglePerformance": "パフォーマンスの ON/OFF",
		"ratingGraph.showAll": "all",
		"ratingGraph.showRecent": "recent",
		"localRunner.title": "Local Runner",
		"localRunner.description":
			"コードの変換と実行に使う、手元のサーバーへ接続します。別途、Local Runner の導入が必要です。同じ API を持つ自作のサーバーにも接続できます。",
		"localRunner.url": "接続先の URL",
		"javaSubmit.title": "Java の提出補助",
		"javaSubmit.description":
			"貼り付けたコードを提出用に変換し、ショートカットで提出できるようにします。パッケージ宣言の削除、クラス名の変更、DEBUG の無効化は Local Runner がなくても動きます。lib.* の展開、import の補完、ヘッダーの付与には Local Runner が必要です。",
		"javaSubmit.localRunnerRequired": "lib.* の展開には Local Runner が必要です",
		"javaSubmit.localRunnerGuide":
			"Local Runner に接続できなかったので、簡易の変換だけを行いました。このまま提出するとコンパイルエラーになります。リンクから導入方法を確認できます。",
		"javaSubmit.libraryRequired": "lib.* の展開にはライブラリの設定が必要です",
		"javaSubmit.libraryGuide":
			"Local Runner にライブラリのフォルダが設定されていないので、簡易の変換だけを行いました。このまま提出するとコンパイルエラーになります。リンクから設定方法を確認できます。",
		"javaSubmit.removePackage": "Local Runner がないときにパッケージ宣言を削除する",
		"javaSubmit.renameClass": "Local Runner がないときにクラス名を Main にする",
		"javaSubmit.fixDebug": "Local Runner がないときに DEBUG を false にする",
		"javaSubmit.addHeader": "提出用のヘッダーを付ける",
		"javaSubmit.headerName": "ヘッダーの名前(空欄なら既定)",
		"javaSubmit.foldOnPaste": "貼り付け後にクラスとコメントを折りたたむ",
		"easyTest.title": "Easy Test+",
		"easyTest.description":
			"AtCoder Easy Test v2 をもとに、機能を加えたものです。問題ページからサンプルを実行して結果を確認します。Local Runner に接続すると手元の PC で実行でき、編集中のコードを事前にコンパイルします。AtCoder Easy Test v2 と同時に有効にするとボタンが重なるので、どちらか片方にしてください。",
		"easyTest.precompile": "Local Runner で編集中のコードを事前にコンパイルする",
		"easyTest.keyboardShortcuts": "ショートカットを使う(Ctrl+Enter、Alt+Enter、Alt+Esc)",
		"easyTest.savedCodeLimit": "保存するコードの数",
		"easyTest.allowableError": "許容誤差",
		"easyTest.run": "Run",
		"easyTest.testAndSubmit": "Test & Submit",
		"easyTest.cancelSubmit": "提出を中止",
		"easyTest.testAll": "Test All Samples",
		"easyTest.restore": "Restore Last Code",
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
		"easyTest.restoreConfirm": "現在のコードを置き換えます。よろしいですか?",
		"paizaLanguage.title": "paiza の言語選択",
		"paizaLanguage.description":
			"paiza の提出ページで、指定した言語を自動で選びます。言語を設定するまでは動きません。",
		"paizaLanguage.language": "言語(例: c++, java, python3)",
	};

	// CpToolkit/src/catalog/messages.ts
	var MESSAGES = {ja: ja_default, en: en_default};

	function createTranslator(getLocale) {
		return (key) => MESSAGES[getLocale()][key];
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

	// CpToolkit/src/catalog/tables.ts
	var languageCatalog = languages_default;
	var runnerCatalog = runners_default;
	var statementCatalog = statement_default;
	var contestCatalog = contests_default;
	var ratingScale = rating_default;
	var contestLinks = contest_links_default.lists;
	var tessokuDifficulties = tessoku_default.difficulties;
	var libraries = libraries_default;

	// CpToolkit/src/application/execution/local-runner.ts
	var TRANSFORM_TIMEOUT_MS = 30000;

	class LocalRunnerError extends Error {
		status;

		constructor(message, status) {
			super(message);
			this.status = status;
		}
	}

	class LocalRunnerClient {
		http;
		endpoint;

		constructor(http, endpoint) {
			this.http = http;
			this.endpoint = endpoint;
		}

		isAvailable() {
			return this.endpoint() !== null;
		}

		list() {
			return this.post({mode: "list"});
		}

		transform(sourceCode, header) {
			const request = {
				mode: "transform",
				sourceCode,
				debug: false,
				autoImport: true,
				validate: false,
				header,
			};
			return this.post(request, TRANSFORM_TIMEOUT_MS);
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
			const response = await this.http.send({
				url,
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(request),
				timeoutMs,
			});
			if (response.status < 200 || response.status >= 300) {
				throw new LocalRunnerError(`Local Runner returned ${response.status}.`, response.status);
			}
			return JSON.parse(response.text);
		}
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

	// CpToolkit/src/domain/execution/result.ts
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

	// CpToolkit/src/application/source/paste-pipeline.ts
	class PastePipeline {
		steps = [];
		watching = false;
		editors;

		constructor(editors) {
			this.editors = editors;
		}

		add(target, lookup, step) {
			this.steps.push(step);
			this.steps.sort((a, b) => a.order - b.order);
			if (this.watching) return;
			this.watching = true;
			this.editors.locate(target, lookup).then((editor) => {
				editor?.onPaste(
					(pasted) =>
						void this.run(editor, pasted).catch(() => {
							return;
						}),
				);
			});
		}

		async run(editor, pasted) {
			const original = editor.getValue();
			const changedBy = [];
			let code = original;
			for (const step of this.steps) {
				const next = await step.transform(code, {editor, pasted, original});
				if (next !== code) changedBy.push(step);
				code = next;
			}
			if (code === original || editor.getValue() !== original) return;
			editor.setValue(code);
			for (const step of changedBy) step.applied?.(editor);
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
	function pairs(items) {
		return items.flatMap((item, index) => {
			const next = items[index + 1];
			return index % 2 === 0 && next !== undefined ? [[item, next]] : [];
		});
	}

	function parseSamples(page) {
		for (const {selector, container, insideIoStyle} of atcoderSampleSelectors) {
			const elements = [...page.querySelectorAll(selector)].filter((element) => {
				if (insideIoStyle) return element.childElementCount === 0;
				return !element.closest(".io-style") && !element.querySelector("var");
			});
			if (elements.length === 0) continue;
			return pairs(elements).map(([input, output], index) => {
				const parent = input.closest(container) ?? input.parentElement;
				return {
					title: `Sample ${index + 1}`,
					input: input.textContent ?? "",
					output: output.textContent ?? "",
					anchor: parent?.querySelector(".btn-copy") ?? parent?.querySelector("h1,h2,h3,h4,h5,h6") ?? input,
				};
			});
		}
		return [];
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
			samples.catch(() => this.samplesByTask.delete(taskUri));
			return samples;
		}

		async fetchSamples(taskUri) {
			const response = await this.site.send({url: taskUri});
			if (response.status !== 200) throw new Error(`Failed to fetch ${taskUri}: ${response.status}`);
			const samples = parseSamples(new DOMParser().parseFromString(response.text, "text/html"));
			return samples.map((sample) => ({...sample, anchor: null}));
		}
	}

	// CpToolkit/src/adapters/judges/codeforces.ts
	var LANGUAGE_SELECT = "select[name='programTypeId']";

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

	class CodeforcesSite extends JudgeSiteBase {
		id = "codeforces";
		buttons = document.createElement("span");
		textarea = document.createElement("textarea");

		constructor(bridge) {
			super(bridge);
			Object.assign(this.textarea.style, {fontFamily: "monospace", width: "100%", minHeight: "5em"});
			document.querySelector(".submitForm")?.append(this.buttons);
			document.getElementById("pageContent")?.append(this.textarea);
			this.fileInput?.addEventListener("change", () => {
				this.fileInput?.files?.[0]?.text().then((text) => {
					this.textarea.value = text;
				});
			});
		}

		get mounts() {
			return {
				testButtons: this.buttons,
				sideButtons: this.buttons,
				results: document.getElementById("pageContent"),
			};
		}

		get languageSelect() {
			return document.querySelector(LANGUAGE_SELECT);
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
			const files = new DataTransfer();
			files.items.add(new File([code], "prog.txt", {type: "text/plain"}));
			if (this.fileInput) this.fileInput.files = files.files;
		}

		submit() {
			this.setSourceCode(this.sourceCode());
			document.querySelector(".submitForm .submit")?.click();
		}

		async samples() {
			const samples = [];
			for (const block of document.querySelectorAll(".sample-test")) {
				const inputs = block.querySelectorAll(".input pre");
				const outputs = block.querySelectorAll(".output pre");
				const anchors = block.querySelectorAll(".input .title .input-output-copier");
				inputs.forEach((input, index) => {
					const output = outputs[index];
					const anchor = anchors[index];
					if (!output || !anchor) return;
					samples.push({
						title: `Sample ${samples.length + 1}`,
						input: readSampleBlock(input),
						output: readSampleBlock(output),
						anchor,
					});
				});
			}
			return samples;
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
			document.body.append(frame);
			await new Promise((resolve) => frame.addEventListener("load", resolve, {once: true}));
			const form = frame.contentDocument?.querySelector("._SubmitPage_submitForm");
			if (!form) return null;
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
			this.form.submit();
		}

		async samples() {
			return [...document.querySelectorAll(".sample-test")].map((block, index) => ({
				title: `Sample ${index + 1}`,
				input: block.querySelector(".input pre.content")?.textContent ?? "",
				output: block.querySelector(".output pre.content")?.textContent ?? "",
				anchor: block.querySelector(".input .title") ?? block,
			}));
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
			return [...document.querySelectorAll(".sample")].flatMap((sample, index) => {
				const [input, output] = sample.querySelectorAll("pre");
				if (!input || !output) return [];
				return [
					{
						title: `Sample ${index + 1}`,
						input: input.textContent ?? "",
						output: output.textContent ?? "",
						anchor: sample.querySelector(".copy-sample-input") ?? sample,
					},
				];
			});
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

	// CpToolkit/src/adapters/page/code-editors.ts
	var JAVA_MODE_PATTERN = /(^|\/)java$/i;
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
			const mode = this.editor.getSession().getMode().$id ?? "";
			return mode === "" || JAVA_MODE_PATTERN.test(mode);
		}

		isReadOnly() {
			return this.editor.getReadOnly();
		}

		setWritable() {
			this.editor.setReadOnly(false);
		}

		onPaste(listener) {
			this.editor.on("paste", ({text}) => setTimeout(() => listener(text)));
		}

		onChange(listener) {
			this.editor.getSession().on("change", listener);
		}

		foldLines(lines) {
			const session = this.editor.getSession();
			const folded = new Set(session.getAllFolds().map((fold) => fold.start.row));
			for (const line of lines) {
				if (folded.has(line)) continue;
				try {
					const range = session.getFoldWidget(line) ? session.getFoldWidgetRange(line) : null;
					if (range) session.addFold("...", range);
				} catch {
				}
			}
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

		isReadOnly() {
			return false;
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

		foldLines(lines) {
			const action = this.editor.getAction("editor.fold");
			if (!action) return;
			const position = this.editor.getPosition();
			(async () => {
				try {
					for (const line of lines) {
						this.editor.setPosition({lineNumber: line + 1, column: 1});
						await action.run();
					}
				} finally {
					this.editor.setPosition(position);
				}
			})().catch(() => {
				return;
			});
		}
	}

	function findEditor(target) {
		const page = pageGlobals();
		if (target.editor === "monaco") {
			const [editor] = page.monaco?.editor.getEditors() ?? [];
			return editor?.getModel() ? new MonacoCodeEditor(editor) : null;
		}
		const element = target.editorElements
			.map((selector) => document.querySelector(selector))
			.find((found) => found);
		if (!page.ace || !element) return null;
		try {
			return new AceCodeEditor(page.ace.edit(element));
		} catch {
			return null;
		}
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
`;

	function wrapSource(sourceCode) {
		const body = sourceCode
			.split(
				`
`,
			)
			.map((line) => `     ${line}`).join(`
`);
		return `
def __run():
 global __stdout, __stderr, __stdin, __code
 __code = None
 with __redirect_stdin(__stdin):
  with contextlib.redirect_stdout(io.StringIO()) as __stdout:
   with contextlib.redirect_stderr(io.StringIO()) as __stderr:
    try:
     pass
${body}
    except SystemExit as e:
     __code = e.code
`;
	}

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
			this.pyodide ??= this.load();
			const pyodide = await this.pyodide;
			const code = wrapSource(sourceCode);
			pyodide.globals.set("__stdin", input);
			const startedAt = Date.now();
			try {
				await pyodide.loadPackagesFromImports(code);
				await pyodide.runPythonAsync(code);
				pyodide.runPython("__run()");
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
				return {status: "CE", input, error: response.stderr || "Local Runner could not compile the code."};
			}
			return {
				status: toEasyTestStatus(response.status, response.exitCode),
				exitCode: String(response.exitCode),
				execTime: Number(response.time),
				...(response.memory > 0 ? {allocatedMemory: Number(response.memory)} : {}),
				...(response.peakMemory !== undefined && response.peakMemory > 0
					? {memory: Number(response.peakMemory)}
					: {}),
				input,
				output: response.stdout ?? "",
				error: response.stderr ?? "",
			};
		}
	}

	class LocalRunnerProvider {
		client;

		constructor(client) {
			this.client = client;
		}

		async runnersFor({family, label}) {
			if (!this.client.isAvailable()) return [];
			const compilers = await this.client.list();
			const sameFamily = compilers.filter((compiler) => {
				return (compiler.family ?? resolveFamily(languageCatalog, compiler.language)) === family;
			});
			if (!sameFamily.some(({match}) => match !== undefined)) {
				return sameFamily.map(
					({compilerName, label: name}) => new LocalCodeRunner(this.client, compilerName, name),
				);
			}
			const pageLabel = label.toLowerCase();
			const matches = ({match}) => {
				return (match ?? []).some((word) => pageLabel.includes(word.toLowerCase()));
			};
			return [...sameFamily.filter(matches), ...sameFamily.filter((compiler) => !matches(compiler))].map(
				({compilerName, label: name}, index) => new LocalCodeRunner(this.client, compilerName, name, index),
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
	var PUBLIC_TYPE_PATTERN =
		/^((?:(?:abstract|final|sealed|non-sealed|strictfp)[ \t]+)*)public[ \t]+(?=(?:(?:abstract|final|sealed|non-sealed|strictfp)[ \t]+)*(?:class|interface|enum|record|@interface)\b)/gm;

	function withoutPublicTypes(source) {
		return source.replace(PUBLIC_TYPE_PATTERN, "$1");
	}

	// CpToolkit/src/domain/validation/guards.ts
	var isBoolean = (value) => typeof value === "boolean";
	var isString = (value) => typeof value === "string";
	var isNumber = (value) => typeof value === "number";

	function isPlainObject(value) {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	function isArrayOf(isItem) {
		return (value) => Array.isArray(value) && value.every(isItem);
	}

	function isRecordOf(isItem) {
		return (value) => isPlainObject(value) && Object.values(value).every(isItem);
	}

	function isOptional(isItem) {
		return (value) => value === undefined || isItem(value);
	}

	function isObjectOf(fields) {
		const entries = Object.entries(fields);
		return (value) => isPlainObject(value) && entries.every(([key, isField]) => isField(value[key]));
	}

	// CpToolkit/src/application/ports/key-value-store.ts
	function readStored(store, key, isValid, fallback) {
		const value = store.get(key);
		return isValid(value) ? value : fallback;
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
	var CACHE_KEY = "easy-test:wandbox-compilers";
	var HOUR_MS = 60 * 60 * 1000;
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
			const cached = readStored(this.state, CACHE_KEY, isCompilerCache, null);
			if (cached && Date.now() - cached.fetchedAt < runnerCatalog.wandbox.cacheHours * HOUR_MS)
				return cached.compilers;
			const response = await this.http.send({url: runnerCatalog.wandbox.listUrl});
			const compilers = JSON.parse(response.text);
			this.state.set(CACHE_KEY, {compilers, fetchedAt: Date.now()});
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

	// CpToolkit/src/adapters/userscript/gm-services.ts
	class GmClipboard {
		write(text) {
			GM_setClipboard(text);
		}
	}

	class GmNotifier {
		notify({title, text, url}) {
			GM_notification({
				title,
				text,
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
			url: option.text("http://localhost:8080", "localRunner.url", {validate: isHttpUrl}),
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

	// CpToolkit/src/ui/toast/toast.css
	var toast_default = `.toasts {
	position: fixed;
	top: 120px;
	left: 20px;
	z-index: 2147483000;
	display: grid;
	gap: 8px;
	width: min(360px, calc(100vw - 40px));
}

.toast {
	padding: 8px 12px;
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
}

.toast a {
	color: var(--cp-accent);
}

@keyframes toast-in {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
}
`;

	// CpToolkit/src/ui/toast/toast.ts
	var container = null;

	function ensureContainer() {
		if (container?.isConnected) return container;
		const list = h("div", {className: "toasts"});
		const host = h("div");
		host.attachShadow({mode: "open"}).append(
			h("style", {
				textContent: `${theme_default}
${toast_default}`,
			}),
			list,
		);
		document.body.append(host);
		container = list;
		return list;
	}

	function showToast({title, detail, tone, href, durationMs}) {
		const heading = href ? h("a", {href, target: "_blank", rel: "noopener", textContent: title}) : title;
		const toast = h(
			"div",
			{className: "toast"},
			h("div", {className: "toast-title"}, heading),
			h("div", {className: "toast-detail", textContent: detail}),
		);
		toast.dataset.tone = tone;
		toast.addEventListener("click", () => toast.remove());
		setTimeout(() => toast.remove(), durationMs);
		ensureContainer().append(toast);
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
				if (options.desktop && !document.hasFocus()) notifier.notify({title, text, url});
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

	// CpToolkit/src/ui/shortcuts.ts
	var EDITOR_ELEMENTS = ".ace_editor, .monaco-editor, #editor, #editor-div";
	var shortcuts = new Map();
	var listening = false;

	function comboOf(event) {
		const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
		return [event.ctrlKey && "Ctrl", event.shiftKey && "Shift", event.altKey && "Alt", key]
			.filter(Boolean)
			.join("+");
	}

	function isTextField(target) {
		if (!(target instanceof HTMLElement)) return false;
		const isEditable = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
		return isEditable && target.closest(EDITOR_ELEMENTS) === null;
	}

	function onKeyDown(event) {
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
		shortcuts.set(combo, {handler, inTextFields});
		return () => shortcuts.delete(combo);
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
				const errorText = [internalError, result.error].filter(Boolean).join(`
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
		const useAllowable = h("input", {
			type: "checkbox",
			checked: true,
			onchange() {
				allowable.disabled = !useAllowable.checked;
			},
		});
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
				const value = Number.parseFloat(allowable.value);
				return useAllowable.checked && value > 0 ? value : undefined;
			},
			setRunnable(runnable) {
				runButton.disabled = !runnable;
			},
		};
	}

	// CpToolkit/src/features/easy-test/index.ts
	var RUNNER_SELECTION_KEY = "easy-test:runner-selection";
	var PRECOMPILE_DELAY_MS = 180;
	var TEST_AND_SUBMIT_KEY = "Ctrl+Enter";
	var TEST_ALL_KEY = "Alt+Enter";
	var featureOptions = {
		precompile: option.boolean(true, "easyTest.precompile"),
		keyboardShortcuts: option.boolean(true, "easyTest.keyboardShortcuts"),
		savedCodeLimit: option.number(10, "easyTest.savedCodeLimit", {min: 0}),
		allowableError: option.text("1e-6", "easyTest.allowableError"),
	};

	class EasyTest {
		dock;
		panel;
		savedCodes;
		buttons = [];
		resultList = h("div", {className: "row"});
		submitButton;
		pendingSubmit = null;
		candidates = [];
		languageId;
		refreshing = Promise.resolve();
		runnable = false;
		runCount = 0;
		running = 0;
		site;
		context;

		constructor(site, context) {
			this.site = site;
			this.context = context;
			const {options, state, translate, openSettings} = context;
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
			this.panel.environment.addEventListener("change", () => this.rememberRunner());
			this.site.onLanguageChange(() => void this.refreshEnvironment());
			this.refreshEnvironment();
			this.placeButtons();
			this.placeSampleButtons();
			if (this.context.options.precompile) this.watchSource();
			if (this.context.options.keyboardShortcuts) this.registerShortcuts();
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
			if (this.context.options.keyboardShortcuts) addTooltip(() => button, shortcut);
			button.style.marginLeft = "1rem";
			return button;
		}

		placeButtons() {
			const {translate} = this.context;
			const {testButtons, sideButtons, results} = this.site.mounts;
			if (testButtons instanceof Element) {
				const submitKey = () => (this.pendingSubmit ? null : TEST_AND_SUBMIT_KEY);
				this.submitButton = this.createTestButton("easyTest.testAndSubmit", "btn-info", submitKey, () => {
					if (this.pendingSubmit) this.setPendingSubmit(null);
					else this.testAndSubmit();
				});
				testButtons.append(
					this.submitButton,
					this.createTestButton(
						"easyTest.testAll",
						"btn-default btn-sm",
						() => TEST_ALL_KEY,
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
					if (!(sample.anchor instanceof Element)) continue;
					const button = this.createButton(label, "btn-primary btn-sm", () => void this.runSample(sample));
					button.style.verticalAlign = "top";
					button.style.marginLeft = "0.5em";
					sample.anchor.after(button);
				}
			});
		}

		watchSource() {
			let timer;
			const prepare = () => {
				const code = this.site.sourceCode();
				const runner = this.candidates.find(({kind}) => kind === "local");
				if (code)
					runner?.prepare?.(code)?.catch(() => {
						return;
					});
			};
			const schedule = () => {
				clearTimeout(timer);
				timer = setTimeout(() => void this.refreshing.then(prepare), PRECOMPILE_DELAY_MS);
			};
			this.site.onSourceChange(schedule);
			schedule();
		}

		registerShortcuts() {
			const handled = (action) => () => {
				action();
				return true;
			};
			registerShortcut(
				TEST_AND_SUBMIT_KEY,
				handled(() => void this.testAndSubmit()),
				{inTextFields: true},
			);
			registerShortcut(
				TEST_ALL_KEY,
				handled(() => void this.testAll()),
				{inTextFields: true},
			);
			registerShortcut(
				"Alt+Escape",
				handled(() => this.dock.toggle()),
				{inTextFields: true},
			);
		}

		selections() {
			return readStored(this.context.state, RUNNER_SELECTION_KEY, isRecordOf(isString), {});
		}

		rememberRunner() {
			const language = this.site.language();
			if (!language) return;
			this.context.state.set(RUNNER_SELECTION_KEY, {
				...this.selections(),
				[language.id]: this.panel.environment.value,
			});
		}

		refreshEnvironment() {
			this.refreshing = this.refreshing.then(() => this.loadEnvironment());
			return this.refreshing;
		}

		async loadEnvironment() {
			const {runners, translate} = this.context;
			const {environment} = this.panel;
			const language = this.site.language();
			const candidates = language ? await runners.candidates(language) : [];
			const previous = environment.value;
			this.candidates = candidates;
			const signature = candidates.map(
				({id, label}) => `${id}
${label}`,
			).join(`
`);
			if (environment.dataset.signature !== signature || candidates.length === 0) {
				environment.dataset.signature = signature;
				environment.replaceChildren(
					...candidates.map(({id, label}) =>
						h("option", {
							value: id,
							textContent: label,
						}),
					),
				);
				if (candidates.length === 0)
					environment.append(h("option", {textContent: translate("easyTest.noEnvironment")}));
			}
			const isCandidate = (id) => candidates.some((candidate) => candidate.id === id);
			const local = candidates.find(({kind}) => kind === "local")?.id;
			const saved = language ? this.selections()[language.id] : undefined;
			const kept = language?.id === this.languageId && isCandidate(previous) ? previous : undefined;
			this.languageId = language?.id;
			const next = local ?? kept ?? (isCandidate(saved) ? saved : candidates[0]?.id);
			if (next !== undefined) environment.value = next;
			this.setRunnable(candidates.length > 0 && this.running === 0);
		}

		setRunnable(runnable) {
			this.runnable = runnable;
			this.panel.setRunnable(runnable);
			for (const button of this.buttons) button.classList.toggle("disabled", !runnable);
			this.showSubmitState();
		}

		setPendingSubmit(pending) {
			this.pendingSubmit = pending;
			this.showSubmitState();
		}

		showSubmitState() {
			const button = this.submitButton;
			if (!button) return;
			const pending = this.pendingSubmit !== null;
			button.textContent = this.context.translate(pending ? "easyTest.cancelSubmit" : "easyTest.testAndSubmit");
			button.classList.toggle("btn-info", !pending);
			button.classList.toggle("btn-warning", pending);
			button.classList.toggle("disabled", !pending && !this.runnable);
		}

		runOptions(extra) {
			const allowableError = this.panel.allowableError();
			return {trim: true, split: true, ...(allowableError === undefined ? {} : {allowableError}), ...extra};
		}

		execute(testCase, options) {
			const {runners, translate} = this.context;
			const code = this.site.sourceCode();
			if (code) this.savedCodes.save(this.site.taskUri(), code);
			const view = createResultView(translate);
			const tab = this.dock.addTab(`#${++this.runCount} ${testCase.title}`, view.element, {closable: true});
			this.running++;
			this.setRunnable(false);
			const firstRunnerId = this.panel.environment.value;
			const result = runners.test(this.candidates, firstRunnerId, code, testCase, this.runOptions(options));
			result
				.then((value) => {
					view.show(value);
					const tone = toneOf(value.status);
					if (tone) tab.setTone(tone);
				})
				.finally(() => {
					if (--this.running === 0) this.setRunnable(this.candidates.length > 0);
				});
			return {result, tab};
		}

		hasSource() {
			if (this.site.sourceCode()) return true;
			window.alert(this.context.translate("easyTest.noSource"));
			return false;
		}

		async runPanel() {
			if (!this.hasSource()) return;
			await this.refreshEnvironment();
			const {input, expected} = this.panel;
			this.execute({title: "Run", input: input.value, output: expected.value || null}, {});
		}

		async runSample(sample) {
			if (!this.hasSource()) return;
			await this.refreshEnvironment();
			const {result, tab} = this.execute(sample, {});
			await result;
			tab.show();
		}

		readSamples() {
			return this.site.samples().catch(() => []);
		}

		async runSamples(onClose) {
			if (!this.hasSource()) return false;
			const samples = await this.readSamples();
			if (samples.length === 0) {
				window.alert(this.context.translate("easyTest.noSamples"));
				return false;
			}
			await this.refreshEnvironment();
			const runGroupId = crypto.randomUUID();
			const executions = samples.map((sample) => this.execute(sample, {runGroupId}));
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

		async testAll() {
			await this.runSamples();
		}

		async testAndSubmit() {
			if (this.pendingSubmit) return;
			const pending = {};
			const cancel = () => {
				if (this.pendingSubmit === pending) this.setPendingSubmit(null);
			};
			this.setPendingSubmit(pending);
			try {
				const passed = await this.runSamples(cancel);
				if (passed && this.pendingSubmit === pending) this.site.submit();
			} finally {
				cancel();
			}
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
		options: featureOptions,
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
			return () => controller.abort();
		},
	});

	// CpToolkit/src/domain/source/fold-lines.ts
	var FOLDABLE_TYPE_PATTERN =
		/^\s*(?:(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp)\s+)*(?:class|interface|enum|record|@interface)\b/;
	var BLOCK_COMMENT_PATTERN = /^\s*\/\*/;

	function findFoldStartLines(source) {
		return source
			.split(
				`
`,
			)
			.flatMap((line, index) => {
				return FOLDABLE_TYPE_PATTERN.test(line) || BLOCK_COMMENT_PATTERN.test(line) ? [index] : [];
			});
	}

	// CpToolkit/src/application/ports/code-editor.ts
	var EDITOR_SETUP_DELAY_MS = 500;

	// CpToolkit/src/application/source/transform-java.ts
	async function transformJava(code, localRunner, options) {
		let connected = false;
		let libraryMissing = false;
		if (localRunner.isAvailable()) {
			try {
				const transformed = await localRunner.transform(code, options.header);
				connected = true;
				if (transformed.status === "success")
					return {
						sourceCode: transformed.sourceCode,
						connected,
						libraryMissing,
					};
				libraryMissing = transformed.libraryMissing === true;
			} catch {
			}
		}
		return {sourceCode: modifyJavaCode(code, options).modified, connected, libraryMissing};
	}

	// CpToolkit/src/features/java-submit/index.ts
	var FOLD_SHORTCUT = "Ctrl+Shift+M";
	var MIN_SOURCE_LENGTH = 30;
	var FOLD_DELAY_MS = 100;
	var PASTE_ORDER = 10;
	var LOCAL_RUNNER_GUIDE_URL = "https://github.com/nsubaru11/competitive-programming-tools/tree/main/local-runner";
	var LIBRARY_GUIDE_URL = `${LOCAL_RUNNER_GUIDE_URL}#ライブラリを使う`;
	var GUIDE_DURATION_MS = 15000;

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

	var javaSubmit = defineFeature({
		id: "java-submit",
		title: "javaSubmit.title",
		description: "javaSubmit.description",
		category: "category.execution",
		defaultEnabled: true,
		routes: [
			"atcoder:task",
			"atcoder:submit",
			"atcoder:customTest",
			"codeforces:page",
			"aoj:page",
			"libraryChecker:page",
			"paiza:page",
		],
		phase: "ready",
		options: {
			removePackage: option.boolean(true, "javaSubmit.removePackage"),
			renameClass: option.boolean(true, "javaSubmit.renameClass"),
			fixDebug: option.boolean(true, "javaSubmit.fixDebug"),
			addHeader: option.boolean(true, "javaSubmit.addHeader"),
			headerName: option.text("", "javaSubmit.headerName"),
			foldOnPaste: option.boolean(true, "javaSubmit.foldOnPaste"),
		},
		start({options, judge, editors, localRunner, paste, translate}) {
			const target = judge?.submission;
			if (!target) return;
			registerShortcut(target.shortcut, () => {
				const button = findSubmitButton(target);
				button?.click();
				return button !== null;
			});
			addTooltip(
				() => findSubmitButton(target),
				() => target.shortcut,
			);
			const header = options.addHeader ? options.headerName || true : false;
			const lookup = {delayMs: EDITOR_SETUP_DELAY_MS};
			const fold = (editor) => editor.foldLines(findFoldStartLines(editor.getValue()));
			editors.locate(target, lookup).then((editor) => {
				if (!editor) return;
				registerShortcut(FOLD_SHORTCUT, () => {
					fold(editor);
					return true;
				});
			});
			paste.add(target, lookup, {
				order: PASTE_ORDER,
				async transform(code, {editor}) {
					if (!editor.isJava() || code.length < MIN_SOURCE_LENGTH) return code;
					const {sourceCode, connected, libraryMissing} = await transformJava(code, localRunner, {
						...options,
						header,
					});
					if (libraryMissing) {
						showToast({
							title: translate("javaSubmit.libraryRequired"),
							detail: translate("javaSubmit.libraryGuide"),
							tone: "warning",
							href: LIBRARY_GUIDE_URL,
							durationMs: GUIDE_DURATION_MS,
						});
					} else if (!connected && usesJavaLibrary(code)) {
						showToast({
							title: translate("javaSubmit.localRunnerRequired"),
							detail: translate("javaSubmit.localRunnerGuide"),
							tone: "warning",
							href: LOCAL_RUNNER_GUIDE_URL,
							durationMs: GUIDE_DURATION_MS,
						});
					}
					return sourceCode;
				},
				applied(editor) {
					if (options.foldOnPaste) setTimeout(() => fold(editor), FOLD_DELAY_MS);
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
	var CACHE_KEY2 = "latest-contests:cache";
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
		const cache = readStored(state, CACHE_KEY2, isCache, null);
		if (cache && now - cache.fetchedAt < cacheMinutes * MINUTE_MS) return cache.contests;
		const response = await site.send({url: HOME_URL});
		if (response.status !== 200) throw new Error(`Failed to load ${HOME_URL}`);
		const contests = parse(response.text);
		if (contests.length > 0) state.set(CACHE_KEY2, {fetchedAt: now, contests});
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
				if (options.desktop && !document.hasFocus()) notifier.notify({title, text: detail, url});
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

	// CpToolkit/src/domain/source/comment.ts
	var SHEBANG_PATTERN = /^#![^\n]*\n/;
	var VARIABLE_PATTERN = /\{(\w+)\}/g;
	var LINE_BREAK_PATTERN = /\r\n?/g;

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
		return (
			code.trim() ===
			pasted
				.replace(
					LINE_BREAK_PATTERN,
					`
`,
				)
				.trim()
		);
	}

	function insertHeader(code, block, {preamble}) {
		const head = SHEBANG_PATTERN.exec(code) ?? (preamble === undefined ? null : new RegExp(preamble).exec(code));
		const offset = head?.[0].length ?? 0;
		return `${code.slice(0, offset)}${block}${code.slice(offset)}`;
	}

	function insertFooter(code, block, {trailer}) {
		const end = (trailer === undefined ? null : new RegExp(trailer).exec(code))?.index ?? code.length;
		const body = code.slice(0, end).trimEnd();
		return `${body}${
			body
				? `
`
				: ""
		}${block}${code.slice(end)}`;
	}

	function replaceBlock(code, current, next, fromEnd) {
		const index = fromEnd ? code.lastIndexOf(current) : code.indexOf(current);
		return index < 0 ? null : `${code.slice(0, index)}${next}${code.slice(index + current.length)}`;
	}

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
	var PASTE_ORDER2 = 20;
	var SLOTS = ["header", "footer"];
	var sourceComments = defineFeature({
		id: "source-comments",
		title: "sourceComments.title",
		description: "sourceComments.description",
		category: "category.submission",
		defaultEnabled: true,
		routes: ["atcoder:task", "atcoder:submit"],
		phase: "ready",
		options: {
			style: option.select("line", "sourceComments.style", [
				{value: "line", label: "sourceComments.styleLine"},
				{value: "block", label: "sourceComments.styleBlock"},
			]),
		},
		async start({options, judge, judgeSite, page, paste, state, translate}) {
			const target = judge?.submission;
			const site = await judgeSite();
			const editorButtons = document.querySelector(".editor-buttons");
			if (!target || !site || !editorButtons) return;
			const comments = new SourceComments(state);
			const defaultMultiline = options.style === "block";
			const inserted = new Map();
			const syntaxOf = () => {
				const family = site.language()?.family;
				return family ? commentSyntaxOf(languageCatalog, family) : null;
			};
			const variables = () => {
				const url = site.taskUri();
				return {url, task: url.split("/").at(-1) ?? "", contest: contestIdOf(location.pathname) ?? ""};
			};
			const render = (slot) => {
				const {text, commentOut, multiline} = comments.content(slot, site.taskUri());
				const filled = fillVariables(text.trimEnd(), variables());
				if (!filled) return "";
				if (!commentOut)
					return `${filled}
`;
				const syntax = syntaxOf();
				const style = (multiline ?? defaultMultiline) ? "block" : "line";
				const comment = syntax && toComment(filled, syntax, style);
				return comment === null
					? null
					: `${comment}
`;
			};
			const insertAll = (code) => {
				const syntax = syntaxOf() ?? {};
				let result = code;
				let writable = true;
				for (const slot of SLOTS) {
					const block = render(slot);
					if (block === null) writable = false;
					if (!block) continue;
					if (!result.includes(block)) {
						result =
							slot === "header"
								? insertHeader(result, block, syntax)
								: insertFooter(result, block, syntax);
					}
					inserted.set(slot, block);
				}
				panel.setUnsupported(!writable);
				return result;
			};
			const refresh = () => {
				const original = site.sourceCode();
				let code = original;
				let writable = true;
				for (const [slot, current] of inserted) {
					const next = render(slot);
					if (next === null) {
						writable = false;
						continue;
					}
					const replaced = replaceBlock(code, current, next, slot === "footer");
					if (replaced === null || !next) inserted.delete(slot);
					else inserted.set(slot, next);
					code = replaced ?? code;
				}
				panel.setUnsupported(!writable);
				if (code !== original) site.setSourceCode(code);
			};
			const panel = createCommentPanel({
				comments,
				translate,
				task: () => site.taskUri(),
				defaultMultiline,
				onChange: refresh,
				onApply() {
					refresh();
					const code = site.sourceCode();
					const next = insertAll(code);
					if (next !== code) site.setSourceCode(next);
				},
			});
			editorButtons.append(panel.button);
			site.onLanguageChange(refresh);
			const taskSelect = document.querySelector("#select-task");
			if (taskSelect) {
				page.onChange(taskSelect, () => {
					panel.reload();
					refresh();
				});
			}
			paste.add(
				target,
				{delayMs: EDITOR_SETUP_DELAY_MS},
				{
					order: PASTE_ORDER2,
					transform(code, {pasted, original}) {
						if (!isWholeCode(original, pasted)) return code;
						inserted.clear();
						return insertAll(code);
					},
				},
			);
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
		start({options, clipboard, statementConverter, translate}) {
			const added = [];
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
				const wrapper = h(
					"span",
					{className: "pull-right"},
					createButton(translate("statementCopy.copyAll"), copyAll),
				);
				wrapper.style.fontSize = "14px";
				title.append(wrapper);
				added.push(wrapper);
			}
			return () => {
				for (const element of added) element.remove();
			};
		},
	});

	// CpToolkit/src/domain/statement/tokens.ts
	var NUMBER_PATTERN = /(^|\W)([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?)/gi;
	var PURE_NUMBER_PATTERN = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?$/i;

	function isPureNumber(text) {
		return PURE_NUMBER_PATTERN.test(text.trim());
	}

	function splitNumbers(text) {
		const segments = [];
		let position = 0;
		for (const match of text.matchAll(NUMBER_PATTERN)) {
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
	var LANGUAGE_SELECT2 = 'select[name="f.LanguageName"]';

	function selectQueriedLanguage(page) {
		const language = new URLSearchParams(location.search).get("f.LanguageName");
		const select = document.querySelector(LANGUAGE_SELECT2);
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
		{option: "byTime", orderBy: "time_consumption", label: "submissionShortcuts.time"},
		{option: "byLength", orderBy: "source_length", label: "submissionShortcuts.length"},
		{option: "byCreated", orderBy: "created", label: "submissionShortcuts.created"},
		{option: "byMemory", orderBy: "memory_consumption", label: "submissionShortcuts.memory"},
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
		start({options, page, translate}) {
			const task = parseAtCoderTaskUrl(location.href);
			const title = document.querySelector(".h2");
			const period = page.contestPeriod();
			if (period && page.serverNow() < period.endMs)
				return () => {
					return;
				};
			const orders = ORDERS.filter((order) => options[order.option]);
			if (!task || !title || orders.length === 0)
				return () => {
					return;
				};
			const createLink = (label, orderBy) => {
				const query = buildAtCoderSubmissionsQuery({
					language: options.language || undefined,
					status: "AC",
					orderBy,
					task: task.taskId,
				});
				return h("a", {
					className: "btn btn-default btn-sm",
					href: `/contests/${task.contestId}/submissions?${query}`,
					textContent: label,
				});
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
					...orders.map(({orderBy, label}) => createLink(translate(label), orderBy)),
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
			return () => wrapper.remove();
		},
	});

	// CpToolkit/src/features/submission-timer/index.ts
	var MINUTE_MS2 = 60000;
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
			const schedule = () => {
				const value = minutes.valueAsNumber;
				clearTimeout(timer);
				if (!(value > 0)) {
					cancel();
					return;
				}
				timer = setTimeout(() => submitButton.click(), value * MINUTE_MS2);
				const at = new Date(Date.now() + value * MINUTE_MS2).toLocaleTimeString();
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

	// CpToolkit/src/application/contest/task-list.ts
	var isCacheEntry = isObjectOf({
		tasks: isArrayOf(isObjectOf({url: isString, label: isString, name: isString})),
		lastAccess: isNumber,
	});
	var CACHE_KEY3 = "task-dropdown:tasks";
	var DAY_MS = 24 * 60 * 60 * 1000;

	async function loadContestTasks(contestId, {site, state, parse, cacheDays}) {
		const cache = readStored(state, CACHE_KEY3, isRecordOf(isCacheEntry), {});
		const now = Date.now();
		const fresh = Object.entries(cache).filter(([, entry]) => now - entry.lastAccess < cacheDays * DAY_MS);
		let tasks = cache[contestId]?.tasks ?? null;
		if (!tasks) {
			const response = await site.send({url: `/contests/${contestId}/tasks`});
			if (response.status !== 200) return null;
			tasks = parse(response.text);
		}
		const entries = tasks.length > 0 ? [...fresh, [contestId, {tasks, lastAccess: now}]] : fresh;
		state.set(CACHE_KEY3, Object.fromEntries(entries));
		return tasks;
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

	function parseTaskPage(html) {
		const page = new DOMParser().parseFromString(html, "text/html");
		return [...page.querySelectorAll("#contest-nav-tabs + .col-sm-12 tbody tr")].flatMap((row) => {
			const [labelCell, nameCell] = row.querySelectorAll("td");
			const link = labelCell?.querySelector("a");
			const url = link?.getAttribute("href");
			if (!link || !url) return [];
			return [{url, label: link.textContent ?? "", name: nameCell?.textContent?.trim() ?? ""}];
		});
	}

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
		async start({site, state, translate}) {
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
			const tasks = await loadContestTasks(contestId, {
				site,
				state,
				parse: parseTaskPage,
				cacheDays: contestCatalog.taskCacheDays,
			}).catch(() => null);
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
	var NUMBER_PATTERN2 = /^\d+(\.\d+)?$/;
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
		return isPlainLeaf(element) && NUMBER_PATTERN2.test(element.textContent ?? "");
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
		javaSubmit,
		easyTest,
		paizaLanguage,
	];

	// CpToolkit/src/app/bootstrap.ts
	function bootstrap() {
		const host = new GmScriptHost();
		document.documentElement.dataset.cpToolkit = host.version;
		const lifecycle = new DocumentLifecycle();
		const settings = new SettingsService(new GmKeyValueStore());
		importLegacySettings(new LocalStorageLegacyInbox(), settings);
		const page = matchPage(judges, location.href);
		let panel = null;
		const services = createServices(page, settings, () => panel?.open());
		const runtime = new FeatureRuntime({
			features,
			page,
			lifecycle,
			settings,
			services,
			logger: new ConsoleLogger(host.name),
		});
		runtime.start();
		const {translate} = services;
		panel = createSettingsPanel({features, settings, runtime, translate, version: host.version});
		lifecycle.reach("ready").then(() => {
			host.registerCommand(translate("settings.open"), () => panel?.open());
			if (page) addNavigationEntry(page.judge.navigationLists, host.name, () => panel?.open());
		});
	}

	// CpToolkit/src/main.ts
	bootstrap();
})();
