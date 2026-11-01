// ==UserScript==
// @name           AtCoder Widen Container
// @name:en        AtCoder Widen Container
// @namespace      https://github.com/nsubaru11/atcoder-java-tools/tree/main/userscripts
// @version        1.0.6
// @description    【更新終了】CP Toolkit へ統合しました。AtCoderのページ幅を広げるユーザースクリプト
// @description:en [Discontinued] Merged into CP Toolkit. Widens the container width on AtCoder pages.
// @description:ja 【更新終了】CP Toolkit へ統合しました。AtCoderのページ幅を広げるユーザースクリプト
// @author         nsubaru
// @license        0BSD
// @homepageURL    https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit
// @supportURL     https://github.com/nsubaru11/competitive-programming-tools/issues
// @match          https://atcoder.jp/*
// @exclude        https://atcoder.jp/
// @exclude        https://atcoder.jp/?*
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_registerMenuCommand
// @run-at         document-start
// @icon           https://atcoder.jp/favicon.ico
// @updateURL      https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/AtCoderWidenContainer/dist/AtCoderWidenContainer.user.js
// @downloadURL    https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/AtCoderWidenContainer/dist/AtCoderWidenContainer.user.js
// ==/UserScript==

// @formatter:off
// 更新を終了したスクリプトの先頭に埋め込む処理。build.ts がスクリプト名と設定キーを置き換える。
const cpToolkitRetirement = (() => {
	const scriptId = "AtCoderWidenContainer";
	const settingKeys = ["containerWidth"];
	const installUrl =
		"https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js";
	const migrationUrl =
		"https://github.com/nsubaru11/competitive-programming-tools/tree/main/userscripts/CpToolkit#旧スクリプトからの移行";
	const noticeKey = `cp-toolkit:retired-notice:${scriptId}`;

	// スクリプトごとの保存領域は新版から読めないので、サイトの localStorage を経由して渡す
	if (settingKeys.length > 0 && typeof GM_getValue === "function") {
		const settings = Object.fromEntries(settingKeys.map((key) => [key, GM_getValue(key)]));
		localStorage.setItem(`cp-toolkit:legacy:${scriptId}`, JSON.stringify(settings));
	}

	const showNotice = () => {
		if (document.documentElement.dataset.cpToolkit || localStorage.getItem(noticeKey)) return;
		localStorage.setItem(noticeKey, "1");
		const notice = document.createElement("div");
		notice.style.cssText =
			"position:fixed;right:16px;bottom:16px;z-index:2147483000;max-width:360px;padding:12px;" +
			"border:1px solid #999;border-radius:8px;background:#fff;color:#222;font-size:14px;";
		const createLink = (href, text) => {
			const link = document.createElement("a");
			link.href = href;
			link.target = "_blank";
			link.rel = "noopener";
			link.textContent = text;
			return link;
		};
		const close = document.createElement("button");
		close.type = "button";
		close.textContent = "×";
		close.style.cssText = "float:right;border:0;background:none;cursor:pointer;";
		close.addEventListener("click", () => notice.remove());
		notice.append(
			close,
			`${scriptId} の更新は終了しました。機能は `,
			createLink(installUrl, "CP Toolkit"),
			" に統合されています。",
			createLink(migrationUrl, "移行の手順"),
		);
		document.body.append(notice);
	};
	if (document.readyState === "complete") showNotice();
	else window.addEventListener("load", showNotice, {once: true});

	return {replaced: Boolean(document.documentElement.dataset.cpToolkit)};
})();

if (!cpToolkitRetirement.replaced) {
	("use strict");
	(() => {
		// AtCoderWidenContainer/src/main.ts
		var STORAGE_KEY = "containerWidth";
		var DEFAULT_WIDTH = "50%";

		function isValidWidth(value) {
			if (typeof value !== "string") return false;
			const trimmed = value.trim();
			return trimmed !== "" && CSS.supports("width", trimmed);
		}

		function readWidth() {
			const storedWidth = GM_getValue(STORAGE_KEY, DEFAULT_WIDTH);
			return isValidWidth(storedWidth) ? storedWidth.trim() : DEFAULT_WIDTH;
		}

		var currentWidth = readWidth();
		var hideStyle = document.createElement("style");
		hideStyle.textContent = `html { display: none !important; }`;
		document.documentElement.appendChild(hideStyle);
		var style = document.createElement("style");
		style.textContent = `
	#main-container {
		width: ${currentWidth} !important;
		max-width: 100% !important;
		transition: none !important;
	}
`;
		document.documentElement.appendChild(style);
		window.addEventListener("DOMContentLoaded", () => {
			if (document.documentElement.contains(hideStyle)) hideStyle.remove();
		});
		setTimeout(() => {
			if (document.documentElement.contains(hideStyle)) hideStyle.remove();
		}, 500);
		GM_registerMenuCommand("最大幅設定の変更", () => {
			const inputWidth = window.prompt("新しい幅設定を入力してください（例: 50%, 1200px）", currentWidth);
			if (inputWidth === null) return;
			const nextWidth = inputWidth.trim();
			if (!isValidWidth(nextWidth)) {
				window.alert("幅の形式が正しくありません。例: 50%, 1200px");
				return;
			}
			GM_setValue(STORAGE_KEY, nextWidth);
			window.location.reload();
		});
	})();
}
