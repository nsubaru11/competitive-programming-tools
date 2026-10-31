import {describe, expect, test} from "bun:test";
import {normalizeOptions, option} from "@domain/settings/option";

describe("option", () => {
	test("boolean は真偽値だけを受け付ける", () => {
		const definition = option.boolean(false, "label");
		expect(definition.normalize(true)).toBe(true);
		expect(definition.normalize("true")).toBeUndefined();
	});

	test("text は前後の空白を除いて検証する", () => {
		const definition = option.text("x", "label", {validate: (value) => value.endsWith("px")});
		expect(definition.normalize(" 10px ")).toBe("10px");
		expect(definition.normalize("10")).toBeUndefined();
		expect(definition.normalize(10)).toBeUndefined();
	});

	test("color は短い形式を6桁に揃える", () => {
		const definition = option.color("#000000", "label");
		expect(definition.normalize("#03B")).toBe("#0033bb");
		expect(definition.normalize("#0033B3")).toBe("#0033b3");
		expect(definition.normalize("rgb(0,0,0)")).toBeUndefined();
	});

	test("number は範囲外と NaN を拒否する", () => {
		const definition = option.number(1, "label", {min: 0, max: 10});
		expect(definition.normalize(10)).toBe(10);
		expect(definition.normalize(11)).toBeUndefined();
		expect(definition.normalize(Number.NaN)).toBeUndefined();
	});

	test("select は選択肢にある値だけを受け付ける", () => {
		const definition = option.select("a", "label", [{value: "a", label: "A"}, {value: "b", label: "B"}]);
		expect(definition.normalize("b")).toBe("b");
		expect(definition.normalize("c")).toBeUndefined();
	});
});

describe("normalizeOptions", () => {
	const schema = {
		enabled: option.boolean(false, "label"),
		width: option.text("50%", "label"),
	};

	test("未保存の値は既定値になる", () => {
		expect(normalizeOptions(schema, undefined)).toEqual({enabled: false, width: "50%"});
	});

	test("不正な値は既定値に戻し、正しい値は保持する", () => {
		expect(normalizeOptions(schema, {enabled: "yes", width: "80%"})).toEqual({enabled: false, width: "80%"});
	});

	test("偽の値も既定値に置き換えない", () => {
		const values = normalizeOptions({flag: option.boolean(true, "label"), text: option.text("x", "label")}, {
			flag: false,
			text: "",
		});
		expect(values).toEqual({flag: false, text: ""});
	});

	test("未知のキーは捨てる", () => {
		expect(normalizeOptions(schema, {removed: 1})).toEqual({enabled: false, width: "50%"});
	});
});
