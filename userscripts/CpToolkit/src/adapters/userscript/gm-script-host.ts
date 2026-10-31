import type {ScriptHost} from "@application/ports/script-host";

export class GmScriptHost implements ScriptHost {
	readonly name = GM_info.script.name;
	readonly version = GM_info.script.version;

	registerCommand(label: string, action: () => void): void {
		GM_registerMenuCommand(label, action);
	}
}
