import type {Translate} from "@catalog/messages";
import {adjustRange, defaultRange, rangeIndices, type TaskRange} from "@domain/contest/category";
import type {ContestTask} from "@application/contest/task-list";
import {createModal} from "@ui/dialog/modal";
import {h} from "@ui/element";
import css from "./open-tasks-modal.css" with {type: "text"};

export type OpenTasksParams = {
	readonly tasks: readonly ContestTask[];
	readonly maxTabs: number;
	readonly savedRange: TaskRange | null;
	readonly savedReverse: boolean;
	readonly translate: Translate;
	readonly onOpen: (range: TaskRange, reverse: boolean) => void;
};

function isValidRange(range: TaskRange | null, taskCount: number, maxTabs: number): range is TaskRange {
	if (!range) return false;
	return range.begin >= 0 && range.begin <= range.end && range.end < taskCount && range.end - range.begin < maxTabs;
}

function createTaskSelect(tasks: readonly ContestTask[]): HTMLSelectElement {
	return h("select", {}, ...tasks.map((task, index) => {
		return h("option", {value: String(index), textContent: `${task.label} - ${task.name}`});
	}));
}

/** 複数の問題をタブでまとめて開くダイアログを作る。 */
export function createOpenTasksModal(params: OpenTasksParams): {open(): void} {
	const {tasks, maxTabs, savedRange, savedReverse, translate, onOpen} = params;
	const canOpenAll = tasks.length <= maxTabs;
	const initial = isValidRange(savedRange, tasks.length, maxTabs) ? savedRange : defaultRange(tasks.length, maxTabs);
	let range = initial;

	const modal = createModal({
		title: translate("taskDropdown.openAtOnce"),
		closeLabel: translate("settings.close"),
		css,
	});
	const allRadio = h("input", {type: "radio", name: "open-type", disabled: !canOpenAll});
	const rangeRadio = h("input", {type: "radio", name: "open-type"});
	const beginSelect = createTaskSelect(tasks);
	const endSelect = createTaskSelect(tasks);
	const reverse = h("input", {type: "checkbox", checked: savedReverse});
	const info = h("p", {className: "open-tasks-info"});

	const isAll = (): boolean => allRadio.checked;
	const selectedRange = (): TaskRange => (isAll() ? {begin: 0, end: tasks.length - 1} : range);
	const refresh = (): void => {
		beginSelect.value = String(range.begin);
		endSelect.value = String(range.end);
		beginSelect.disabled = endSelect.disabled = isAll();
		const {begin, end} = selectedRange();
		info.textContent = translate("taskDropdown.tabCount").replace("{count}", String(end - begin + 1));
	};
	const changeRange = (changed: "begin" | "end"): void => {
		range = adjustRange({begin: Number(beginSelect.value), end: Number(endSelect.value)}, changed, maxTabs);
		refresh();
	};

	allRadio.checked = canOpenAll && initial.begin === 0 && initial.end === tasks.length - 1;
	rangeRadio.checked = !allRadio.checked;
	allRadio.addEventListener("change", refresh);
	rangeRadio.addEventListener("change", refresh);
	beginSelect.addEventListener("change", () => changeRange("begin"));
	endSelect.addEventListener("change", () => changeRange("end"));

	modal.body.append(
		h("div", {className: "open-tasks-row"}, h("label", {}, allRadio, ` ${translate("taskDropdown.all")}`), canOpenAll ? "" : h("span", {
			className: "open-tasks-caution",
			textContent: translate("taskDropdown.tabLimit").replace("{count}", String(maxTabs)),
		})),
		h("div", {className: "open-tasks-row"}, h("label", {}, rangeRadio, ` ${translate("taskDropdown.range")}`), beginSelect, "-", endSelect),
		h("div", {className: "open-tasks-row"}, h("label", {}, reverse, ` ${translate("taskDropdown.reverse")}`)),
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
				// ポップアップの判定を1回に抑えるため、空のタブを先に開いて最後に閉じる
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
