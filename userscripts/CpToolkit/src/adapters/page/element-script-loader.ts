import type {ExternalResource} from "@catalog/tables";
import type {ScriptLoader} from "@application/ports/services";

function waitForLoad(element: HTMLElement, url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		element.addEventListener("load", () => resolve(), {once: true});
		element.addEventListener("error", () => reject(new Error(`Failed to load ${url}`)), {once: true});
		document.head.append(element);
	});
}

/** 内容が integrity と一致しなければ、ブラウザが読み込みを止める。 */
export class ElementScriptLoader implements ScriptLoader {
	loadScript({url, integrity}: ExternalResource): Promise<void> {
		const script = Object.assign(document.createElement("script"), {src: url, integrity, crossOrigin: "anonymous"});
		return waitForLoad(script, url);
	}

	loadStylesheet({url, integrity}: ExternalResource): Promise<void> {
		const link = Object.assign(document.createElement("link"), {
			rel: "stylesheet",
			href: url,
			integrity,
			crossOrigin: "anonymous",
		});
		return waitForLoad(link, url);
	}
}
