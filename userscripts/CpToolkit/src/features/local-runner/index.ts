import {isHttpUrl} from "@atcoder-tools/shared";
import {option} from "@domain/settings/option";
import {defineFeature} from "@application/feature/definition";

/** Java の変換と EasyTest が共用する接続先。ここを OFF にすると Local Runner を使わない。 */
export const localRunner = defineFeature({
	id: "local-runner",
	title: "localRunner.title",
	description: "localRunner.description",
	category: "category.execution",
	defaultEnabled: true,
	routes: ["atcoder:contest", "codeforces:page", "yukicoder:problem", "aoj:page", "libraryChecker:page", "paiza:page"],
	phase: "ready",
	options: {
		url: option.text("http://localhost:8080", "localRunner.url", {validate: isHttpUrl}),
	},
	live: true,
	start() {
		return () => undefined;
	},
});
