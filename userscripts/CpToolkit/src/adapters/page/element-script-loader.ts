import type {ScriptLoader} from "@application/ports/services";

function waitForLoad(element: HTMLElement, url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		element.addEventListener("load", () => resolve(), {once: true});
		element.addEventListener("error", () => reject(new Error(`Failed to load ${url}`)), {once: true});
		document.head.append(element);
	});
}

export class ElementScriptLoader implements ScriptLoader {
	loadScript(url: string): Promise<void> {
		return waitForLoad(Object.assign(document.createElement("script"), {src: url}), url);
	}

	loadStylesheet(url: string): Promise<void> {
		return waitForLoad(Object.assign(document.createElement("link"), {rel: "stylesheet", href: url}), url);
	}
}
