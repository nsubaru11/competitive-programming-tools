// 更新を終了したスクリプトの先頭に埋め込む処理。build.ts がスクリプト名と設定キーを置き換える。
const cpToolkitRetirement = (() => {
	const scriptId = "__SCRIPT_ID__";
	const settingKeys = __SETTING_KEYS__;
	const installUrl = "https://raw.githubusercontent.com/nsubaru11/competitive-programming-tools/main/userscripts/CpToolkit/dist/CpToolkit.user.js";
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
		notice.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483000;max-width:360px;padding:12px;"
			+ "border:1px solid #999;border-radius:8px;background:#fff;color:#222;font-size:14px;";
		const link = document.createElement("a");
		link.href = installUrl;
		link.target = "_blank";
		link.rel = "noopener";
		link.textContent = "CP Toolkit";
		const close = document.createElement("button");
		close.type = "button";
		close.textContent = "×";
		close.style.cssText = "float:right;border:0;background:none;cursor:pointer;";
		close.addEventListener("click", () => notice.remove());
		notice.append(close, `${scriptId} の更新は終了しました。機能は `, link, " に統合されています。");
		document.body.append(notice);
	};
	if (document.readyState === "complete") showNotice();
	else window.addEventListener("load", showNotice, {once: true});

	return {replaced: Boolean(document.documentElement.dataset.cpToolkit)};
})();
