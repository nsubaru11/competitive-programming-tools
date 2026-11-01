import {describe, expect, test} from "bun:test";
import {modifyJavaCode} from "@atcoder-tools/shared";

const rename = (code: string) => modifyJavaCode(code, {renameClass: true}).modified;
const withMain = (signature: string) => `class Helper {}\nclass Solver {\n\t${signature} {}\n}\n`;

describe("modifyJavaCode の Main への改名", () => {
	test.each([
		"public static void main(String[] args)",
		"static public void main(String[] args)",
		"public static void main(String... args)",
		"public static void main(final String[] args)",
		"public static void main(String args[])",
		"public static void main(String []args)",
		"public final static void main(String[] args)",
		"public static synchronized void main(String[] args)",
		"@Deprecated public static void main(String[] args)",
		"public static void main(@SuppressWarnings(\"unused\") String[] args)",
		"public static void main(final @SuppressWarnings(\"unused\") String[] args)",
		"public static void main(\n\t\tString[] args\n\t)",
	])("%s を持つ型を選ぶ", (signature) => {
		const result = rename(withMain(signature));
		expect(result).toContain("class Helper {}");
		expect(result).toContain("class Main {");
	});

	test.each([
		"public static int main(String[] args)",
		"public void main(String[] args)",
		"static void main(String[] args)",
		"public static void main(int[] args)",
		"public static void main(String args)",
	])("%s は main として扱わない", (signature) => {
		const result = rename(`class First {\n\t${signature} {}\n}\nclass Second {\n\tpublic static void main(String[] args) {}\n}\n`);
		expect(result).toContain("class First {");
		expect(result).toContain("class Main {");
	});

	test("main を持つ型が複数あれば Main を残す", () => {
		const code = "class Tool {\n\tpublic static void main(String[] args) {}\n}\npublic class Main {\n\tpublic static void main(String[] args) {}\n}\n";
		expect(modifyJavaCode(code, {renameClass: true}).classReplaced).toBe(false);
	});

	test("コメントと文字列の中の main は無視する", () => {
		const code = "class First {\n\t// public static void main(String[] args)\n\tString s = \"public static void main(String[] args)\";\n}\nclass Second {\n\tpublic static void main(String[] args) {}\n}\n";
		const result = rename(code);
		expect(result).toContain("class First {");
		expect(result).toContain("class Main {");
	});

	test("入れ子の型の main では外側の型を選ぶ", () => {
		const result = rename("class Helper {}\nclass Outer {\n\tstatic class Inner {\n\t\tpublic static void main(String[] args) {}\n\t}\n}\n");
		expect(result).toContain("class Helper {}");
		expect(result).toContain("class Main {");
		expect(result).toContain("static class Inner");
	});

	test("main が無ければ public な型を選ぶ", () => {
		const result = rename("class Helper {}\npublic class Solver {}\n");
		expect(result).toContain("class Helper {}");
		expect(result).toContain("public class Main {}");
	});
});
