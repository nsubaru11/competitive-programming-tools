import type {JudgeLanguage} from "@domain/execution/result";
import type {JudgeMounts, JudgeSite, SampleCase} from "@application/ports/judge-site";
import type {PageBridge} from "@application/ports/page-bridge";
import {languagesOf, selectedLanguageOf} from "./languages";

/** 言語の選択欄を持つサイトに共通の処理。 */
export abstract class JudgeSiteBase implements JudgeSite {
	abstract readonly id: string;
	abstract readonly mounts: JudgeMounts;

	protected constructor(protected readonly bridge: PageBridge) {
	}

	protected abstract get languageSelect(): HTMLSelectElement | null;

	abstract sourceCode(): string;

	abstract setSourceCode(code: string): void;

	abstract submit(): void;

	abstract samples(): Promise<readonly SampleCase[]>;

	taskUri(): string {
		return location.href;
	}

	languages(): readonly JudgeLanguage[] {
		return languagesOf(this.languageSelect);
	}

	language(): JudgeLanguage | null {
		return selectedLanguageOf(this.languageSelect);
	}

	onLanguageChange(listener: () => void): void {
		if (this.languageSelect) this.bridge.onChange(this.languageSelect, listener);
	}

	onSourceChange(_listener: () => void): void {
	}
}
