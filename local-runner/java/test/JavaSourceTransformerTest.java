import java.nio.charset.*;
import java.nio.file.*;

public final class JavaSourceTransformerTest {
	public static void main(final String[] args) throws Exception {
		final Path root = Files.createTempDirectory("java-source-transformer-test-");
		try {
			final Path ds = Files.createDirectories(root.resolve("lib/ds"));
			Files.writeString(ds.resolve("UnionFind.java"), """
					package lib.ds;
					import java.util.Arrays;
					public final class UnionFind {
						private final int[] root;
						public UnionFind(int n) { root = new int[n]; Arrays.setAll(root, i -> i); }
					}
					""", StandardCharsets.UTF_8);
			Files.writeString(ds.resolve("UnusedTree.java"), """
					package lib.ds;
					public final class UnusedTree {}
					""", StandardCharsets.UTF_8);
			final Path graph = Files.createDirectories(root.resolve("lib/graph"));
			Files.writeString(graph.resolve("Kruskal.java"), """
					package lib.graph;
					import lib.ds.UnionFind;
					public final class Kruskal {
						public static Object create() { return new UnionFind(1); }
					}
					""", StandardCharsets.UTF_8);

			final Path math = Files.createDirectories(root.resolve("lib/math"));
			Files.writeString(math.resolve("Mint.java"), """
					package lib.math;
					public final class Mint {
						public static int one() { return 1; }
					}
					""", StandardCharsets.UTF_8);
			final Path io = Files.createDirectories(root.resolve("lib/io"));
			Files.writeString(io.resolve("Input.java"), """
					package lib.io;
					public final class Input {
						public static int read() { return 0; }
					}
					""", StandardCharsets.UTF_8);

			final JavaSourceTransformer transformer = new JavaSourceTransformer(java.util.List.of("lib.io"));
			final String wildcardSource = """
					import java.util.*;
					import lib.ds.*;
					public final class A {
						private static final boolean DEBUG = true;
						public static void main(String[] args) { new UnionFind(3); }
					}
					""";
			final SourceTransformResult wildcard = transformer.transform(wildcardSource, root, false, "DEBUG", true);
			check(wildcard.exitCode() == 0, wildcard.diagnostics());
			check(wildcard.inlinedClasses().equals(java.util.List.of("lib.ds.UnionFind")), wildcard.inlinedClasses().toString());
			check(wildcard.sourceCode().contains("// import lib.ds.*;"), "wildcard import was not commented");
			check(wildcard.sourceCode().contains("import java.util.*;\n\n// import lib.ds.*;"), "library import comment was not separated from regular imports");
			check(!wildcard.sourceCode().contains("import java.util.Arrays;"), "explicit dependency import was not covered by solution wildcard import");
			check(!wildcard.sourceCode().contains("UnusedTree"), "unused type was inlined");
			check(wildcard.sourceCode().contains("\nfinal class UnionFind"), "public removal left leading whitespace");
			check(!wildcard.sourceCode().contains("\n final class UnionFind"), "library class has a leading space");
			check(wildcard.sourceCode().contains("class Main"), "main class was not renamed");
			check(wildcard.sourceCode().contains("DEBUG = false"), "DEBUG was not disabled");
			final SourceTransformResult withoutFlag = transformer.transform(wildcardSource, root, false, "", true);
			check(withoutFlag.sourceCode().contains("DEBUG = true"), "DEBUG was rewritten without a flag name");

			final SourceTransformResult unrelatedWildcard = transformer.transform(wildcardSource.replace("import java.util.*;", "import java.util.concurrent.*;"), root, false, "DEBUG", true);
			check(unrelatedWildcard.exitCode() == 0, unrelatedWildcard.diagnostics());
			check(unrelatedWildcard.sourceCode().contains("import java.util.Arrays;"), "unrelated wildcard incorrectly covered dependency import");
			// 変えたことの要約: 元のクラス名、DEBUG の値と行、足した import、展開したファイル
			final TransformSummary summary = unrelatedWildcard.summary();
			check(summary != null && summary.entryName().equals("A") && "DEBUG".equals(summary.debugFlag()) && !summary.debugValue()
					&& summary.debugLine() == 4 && !summary.packageRemoved(), String.valueOf(summary));
			check(summary.addedImports().equals(java.util.List.of("java.util.Arrays")) && summary.bundledFiles().equals(java.util.List.of("lib/ds/UnionFind.java")), String.valueOf(summary));
			check(wildcard.summary().addedImports().isEmpty(), String.valueOf(wildcard.summary()));

			Files.writeString(graph.resolve("Connectivity.java"), """
					package lib.graph;
					public class Connectivity {
						public record Result(int value) {}
						public static Result solve() { return new Result(7); }
					}
					""");
			final SourceTransformResult inferred = transformer.transform("""
					import lib.graph.Connectivity;
					class A {
						public static void main(String[] args) {
							var res = Connectivity.solve();
							java.util.List.of(res).forEach(r -> System.out.print(r.value()));
						}
					}
					""", root, false, "", true);
			check(inferred.exitCode() == 0, inferred.diagnostics());
			check(inferred.sourceCode().contains("var res") && execute(inferred.sourceCode()).equals("7"), inferred.sourceCode());

			final SourceTransformResult transitive = transformer.transform("""
					import lib.graph.Kruskal;
					public final class A {
						public static void main(String[] args) { Kruskal.create(); }
					}
					""", root, false, "DEBUG", true);
			check(transitive.exitCode() == 0, transitive.diagnostics());
			check(transitive.inlinedClasses().equals(java.util.List.of("lib.graph.Kruskal", "lib.ds.UnionFind")), "transitive classpath dependency was not collected: " + transitive.inlinedClasses());

			final java.util.List<String> expectedOrder = java.util.List.of("lib.graph.Kruskal", "lib.ds.UnionFind", "lib.math.Mint", "lib.io.Input");
			final String orderSource = """
					import lib.ds.*;
					import lib.graph.*;
					import lib.io.*;
					import lib.math.*;
					public final class A {
						public static void main(String[] args) { new UnionFind(1); Input.read(); Mint.one(); Kruskal.create(); }
					}
					""";
			final SourceTransformResult ordered = transformer.transform(orderSource, root, false, "DEBUG", true);
			check(ordered.exitCode() == 0, ordered.diagnostics());
			check(ordered.inlinedClasses().equals(expectedOrder), "dependencies should follow their user and lib.io should come last: " + ordered.inlinedClasses());
			check(ordered.sourceCode().indexOf("// ===== inlined: lib.math.Mint") < ordered.sourceCode().indexOf("// ===== inlined: lib.io.Input"), "source order does not match inlined classes");
			final SourceTransformResult reordered = transformer.transform(orderSource.replace("new UnionFind(1); Input.read(); Mint.one(); Kruskal.create();", "Kruskal.create(); Mint.one(); Input.read(); new UnionFind(1);"), root, false, "DEBUG", true);
			check(reordered.exitCode() == 0, reordered.diagnostics());
			check(reordered.inlinedClasses().equals(expectedOrder), "inline order depends on reference order: " + reordered.inlinedClasses());
			final SourceTransformResult withoutLast = new JavaSourceTransformer(java.util.List.of()).transform(orderSource, root, false, "DEBUG", true);
			check(withoutLast.exitCode() == 0, withoutLast.diagnostics());
			check(withoutLast.inlinedClasses().equals(java.util.List.of("lib.graph.Kruskal", "lib.ds.UnionFind", "lib.io.Input", "lib.math.Mint")), "no package should be moved to the end unless it is listed: " + withoutLast.inlinedClasses());

			final String implicitSource = wildcardSource.replace("import lib.ds.*;\n", "");
			final SourceTransformResult implicit = transformer.transform(implicitSource, root, false, "DEBUG", true);
			check(implicit.exitCode() != 0, "a library type without an import was resolved");
			check(implicit.diagnostics().contains("cant.resolve"), implicit.diagnostics());

			final String renameSource = """
					package example;
					public final class Solver {
						private static final boolean DEBUG = true;
						Solver() {}
						public static void main(String[] args) {
							String Solver = "local variable";
							new Solver();
							boolean local = DEBUG;
						}
					}
					""";
			final SourceTransformResult renamed = transformer.transform(renameSource, root, false, "DEBUG", true);
			check(renamed.exitCode() == 0, renamed.diagnostics());
			check(!renamed.sourceCode().contains("package example"), "package was not removed");
			check(renamed.sourceCode().contains("Main() {}"), "constructor was not renamed");
			check(renamed.sourceCode().contains("new Main()"), "class reference was not renamed");
			check(renamed.sourceCode().contains("String Solver ="), "unrelated identifier was renamed");

			final SourceTransformResult annotated = transformer.transform("""
					@SuppressWarnings({"unused", "rawtypes"})
					public final class Solver {
						@SuppressWarnings("Solver") Solver() {}
						public static void main(String[] args) { new Solver(); }
					}
					""", root, false, "DEBUG", true);
			check(annotated.exitCode() == 0, annotated.diagnostics());
			check(annotated.sourceCode().contains("@SuppressWarnings(\"Solver\") Main() {}"), "annotation text was renamed instead of the constructor");

			checkNameResolution(transformer, root);

			final SourceTransformResult overloaded = transformer.transform("""
					final class Helper {
						public static int main(int[] values) { return values.length; }
					}
					public final class Solver {
						public static void main(String... args) {}
					}
					""", root, false, "DEBUG", true);
			check(overloaded.exitCode() == 0, overloaded.diagnostics());
			check(overloaded.sourceCode().contains("class Helper"), "class without a real main was renamed");
			check(overloaded.sourceCode().contains("public final class Main"), "class with a real main was not renamed");

			final SourceTransformResult preferred = transformer.transform("""
					final class Tool {
						public static void main(String[] args) {}
					}
					public final class Main {
						public static void main(String[] args) {}
					}
					""", root, false, "DEBUG", true);
			check(preferred.exitCode() == 0, preferred.diagnostics());
			check(preferred.sourceCode().contains("class Tool"), "Main was not preferred among main methods");

			final SourceTransformResult ambiguous = transformer.transform("""
					final class First {
						public static void main(String[] args) {}
					}
					final class Second {
						public static void main(String[] args) {}
					}
					""", root, false, "DEBUG", true);
			check(ambiguous.exitCode() != 0, "ambiguous main unexpectedly succeeded");
			check(ambiguous.diagnostics().contains("First, Second"), ambiguous.diagnostics());

			final SourceTransformResult nested = transformer.transform("""
					public final class Outer {
						static final class Inner {
							public static void main(String[] args) {}
						}
					}
					""", root, false, "DEBUG", true);
			check(nested.exitCode() != 0, "nested main unexpectedly succeeded");

			final SourceTransformResult noMain = transformer.transform("public final class Helper {}", root, false, "DEBUG", true);
			check(noMain.exitCode() != 0, "source without main unexpectedly succeeded");
			check(noMain.diagnostics().contains("main(String[])"), noMain.diagnostics());

			final SourceTransformResult broken = transformer.transform("public class Broken { MissingType value; }", root, false, "DEBUG", true);
			check(broken.exitCode() != 0, "broken source unexpectedly succeeded");
			check(!broken.diagnosticItems().isEmpty(), "structured diagnostics are empty");
			check(broken.diagnosticItems().getFirst().line() == 1, "diagnostic line is missing");

			// フォルダの名前と階層は自由で、パッケージは package 宣言から決める
			final Path renamedRoot = Files.createDirectories(root.resolve("renamed/any-folder"));
			Files.writeString(renamedRoot.resolve("Counter.java"), """
					package mylib.util;
					public final class Counter {
						public static final int ZERO = 0;
						public static int next(int value) { return value + 1; }
					}
					""", StandardCharsets.UTF_8);
			final JavaSourceTransformer renamedLibrary = new JavaSourceTransformer(java.util.List.of());
			final SourceTransformResult renamedImport = renamedLibrary.transform("""
					import mylib.util.Counter;
					public final class A {
						public static void main(String[] args) { Counter.next(1); }
					}
					""", root.resolve("renamed"), false, "DEBUG", true);
			check(renamedImport.exitCode() == 0, renamedImport.diagnostics());
			check(renamedImport.inlinedClasses().equals(java.util.List.of("mylib.util.Counter")), renamedImport.inlinedClasses().toString());
			check(renamedImport.sourceCode().contains("// import mylib.util.Counter;"), "library import outside lib was not commented");
			final SourceTransformResult renamedStatic = renamedLibrary.transform("""
					import static mylib.util.Counter.ZERO;
					public final class A {
						public static void main(String[] args) { int value = ZERO; }
					}
					""", root.resolve("renamed"), false, "DEBUG", true);
			check(renamedStatic.exitCode() != 0, "static import of a library member unexpectedly succeeded");

			final Path emptyRoot = Files.createDirectories(root.resolve("empty"));
			final JavaSourceTransformer withoutLibrary = new JavaSourceTransformer();
			final SourceTransformResult plain = withoutLibrary.transform("public final class A { private static final boolean DEBUG = true; public static void main(String[] args) {} }", emptyRoot, false, "DEBUG", true);
			check(plain.exitCode() == 0, plain.diagnostics());
			check(plain.sourceCode().contains("class Main"), "class was not renamed without a library");
			check(plain.sourceCode().contains("DEBUG = false"), "DEBUG was not disabled without a library");
			final SourceTransformResult usesLibrary = withoutLibrary.transform("import lib.ds.UnionFind;\npublic final class A { public static void main(String[] args) { new UnionFind(1); } }", emptyRoot, false, "DEBUG", true);
			check(usesLibrary.exitCode() != 0, "library import unexpectedly succeeded without a library");
			System.out.println("java source transformer smoke test: OK");
		} finally {
			try (var files = Files.walk(root)) {
				for (final Path path : files.sorted(java.util.Comparator.reverseOrder()).toList())
					Files.deleteIfExists(path);
			}
		}
	}

	private static void checkNameResolution(final JavaSourceTransformer transformer, final Path root) throws Exception {
		final String source = """
				class Main1 {}
				class Main { int value() { return 7; } }
				record Other(int Main) { static <Main> int id(int Main) { return Main; } }
				public class /* Solver */ Solver extends Main {
					static int y = 3;
					Solver() {}
					static <Main extends Number> String pick(Solver x) { return choose(x); }
					static String choose(Object x) { return "ok"; }
					static String choose(Number x) { return "bad"; }
					public static void main(String[] args) { int Main = 1; System.out.print(pick(null) + new Solver().value() + Solver.y + Main); }
				}
				""";
		final SourceTransformResult result = transformer.transform(source, root, false, "", false);
		check(result.exitCode() == 0, result.diagnostics());
		check(result.sourceCode().contains("class /* Solver */ Main extends Main2"), result.sourceCode());
		check(result.sourceCode().contains("class Main2"), result.sourceCode());
		check(result.sourceCode().contains("<Main3 extends Number> String pick(Main x)"), result.sourceCode());
		check(result.sourceCode().contains("int Main4 = 1"), result.sourceCode());
		check(result.sourceCode().contains("record Other(int Main) { static <Main> int id(int Main) { return Main; } }"), result.sourceCode());
		check(execute(result.sourceCode()).equals("ok731"), "renaming changed execution");

		final String untouched = """
				import java.util.Date;
				class Other { record Main(int n) {} }
				class Solver {
					static <Main> int value(int Main) { return Main; }
					public static void main(String[] a) {
						Date epoch = new Date(0);
						var sql = new java.sql.Date(0);
						System.out.print(new Other.Main(value(3)) + "/" + (epoch.getTime() + sql.getTime()));
					}
				}
				""";
		final SourceTransformResult ordinary = transformer.transform(untouched, root, false, "", true);
		check(ordinary.exitCode() == 0, ordinary.diagnostics());
		check(ordinary.sourceCode().equals(untouched.replace("class Solver", "public class Main")), ordinary.sourceCode());
		check(execute(ordinary.sourceCode()).equals(execute(untouched, "Solver", false)), ordinary.sourceCode());

		final String qualifiedEntry = """
				package sol;
				class Main {
					static int value = 3;
					public static void main(String[] a) { int Main = 2; System.out.print(sol.Main.value + Main); }
				}
				""";
		final SourceTransformResult shortened = transformer.transform(qualifiedEntry, root, false, "", false);
		check(shortened.exitCode() == 0, shortened.diagnostics());
		check(execute(shortened.sourceCode()).equals(execute(qualifiedEntry, "sol.Main", false)), shortened.sourceCode());

		checkQualificationScopes(transformer, root);

		final SourceTransformResult compact = transformer.transform("record Solver$(int x) { Solver$ { } public static void main(String[] a) { new Solver$(1); } }", root, false, "", true);
		check(compact.exitCode() == 0 && compact.sourceCode().contains("Main { }"), compact.diagnostics());
		final SourceTransformResult helper = transformer.transform("public class Helper {} class Solver { public static void main(String[] args) {} }", root, false, "", true);
		check(helper.exitCode() == 0 && !helper.sourceCode().contains("public class Helper") && helper.sourceCode().contains("public class Main"), helper.diagnostics());
		final SourceTransformResult publics = transformer.transform("public class Main { public static void main(String[] args) {} } public class Other {}", root, false, "", false);
		check(publics.exitCode() == 0 && !publics.sourceCode().contains("public class Other"), publics.diagnostics());

		final String unused = "import lib.ds.UnusedTree; class Sol { public static void main(String[] a) {} }";
		final SourceTransformResult noDependency = transformer.transform(unused, root, false, "", false);
		check(noDependency.exitCode() == 0 && noDependency.inlinedClasses().isEmpty(), noDependency.diagnostics());
		final SourceTransformResult missing = transformer.transform("import java.util.List; import a.b.Missing; class Sol {}", root, false, "", false);
		check(missing.diagnosticItems().stream().anyMatch(item -> "a.b.Missing".equals(item.importName())), missing.diagnostics());

		final Path pkg = Files.createDirectories(root.resolve("extra"));
		Files.writeString(pkg.resolve("Main.java"), "package extra; import java.sql.Date; public class Main { public static String name() { return Date.class.getName(); } }");
		final String date = "import java.util.*; import extra.Main; public class Sol { public static void main(String[] a) { System.out.print(Date.class.getName() + Main.name()); } }";
		final SourceTransformResult bundled = transformer.transform(date, root, false, "", false);
		check(bundled.exitCode() == 0, bundled.diagnostics());
		check(bundled.inlinedClasses().equals(java.util.List.of("extra.Main")), bundled.inlinedClasses().toString());
		check(execute(bundled.sourceCode()).equals("java.util.Datejava.sql.Date"), "bundling changed a Date reference");

		Files.writeString(pkg.resolve("Palette.java"), "/*\npackage fake;\n*/\npackage /* paint */ extra; import java.awt.*; public class Palette { public Color red = Color.RED; }");
		final SourceTransformResult stars = transformer.transform("import java.util.*; class Solver { public static void main(String[] a) { System.out.print(List.of(new extra.Palette().red.getRed()).getFirst()); } }", root, false, "", true);
		check(stars.exitCode() == 0 && execute(stars.sourceCode()).equals("255"), stars.diagnostics());

		final SourceTransformResult typeUse = transformer.transform("import java.lang.annotation.*; @Target(ElementType.TYPE_USE) @interface Mark {} class Solver { public static void main(@Mark String... a) {} }", root, false, "", true);
		check(typeUse.exitCode() == 0, typeUse.diagnostics());
		// 無関係なスコープで同じ名前が使われても、record の表示名は元のまま。
		final SourceTransformResult separate = transformer.transform("""
				record Result(int n) {}
				class Other { static class Result {} }
				class Solver { public static void main(String[] a) { System.out.print(new Result(7)); } }
				""", root, false, "", true);
		check(separate.exitCode() == 0 && execute(separate.sourceCode()).equals("Result[n=7]"), separate.diagnostics());

		Files.writeString(pkg.resolve("Factory.java"), """
				package extra;
				public class Factory { public record Result(int n) {} public class Inner<T> {} }
				""");
		for (final String imported : java.util.List.of("extra.Factory.Result", "extra.Factory.*")) {
			final String code = "import " + imported + "; class Solver { public static void main(String[] a) { System.out.print(new Result(7)); } }";
			final SourceTransformResult member = transformer.transform(code, root, false, "", true);
			check(member.exitCode() == 0 && member.sourceCode().contains("new Factory.Result(7)") && execute(member.sourceCode()).equals("Result[n=7]"), member.diagnostics());
		}
		final SourceTransformResult inner = transformer.transform("""
				import extra.Factory;
				import extra.Factory.*;
				class Solver { public static void main(String[] a) {
					Factory f = new Factory();
					Inner<Result> value = f.new Inner<Result>();
					System.out.print(value.getClass().getSimpleName());
				} }
				""", root, false, "", true);
		check(inner.exitCode() == 0 && execute(inner.sourceCode()).equals("Inner"), inner.diagnostics());
		Files.writeString(pkg.resolve("UsesResult.java"), """
				package extra;
				import extra.Factory.Result;
				public class UsesResult { public static int n() { return new Result(3).n(); } }
				""");
		final SourceTransformResult inLibrary = transformer.transform("class Solver { public static void main(String[] a) { System.out.print(extra.UsesResult.n()); } }", root, false, "", true);
		check(inLibrary.exitCode() == 0 && execute(inLibrary.sourceCode()).equals("3"), inLibrary.diagnostics());

		final Path other = Files.createDirectories(root.resolve("other"));
		Files.writeString(pkg.resolve("Value.java"), "package extra; public class Value { public int number() { return 1; } }");
		Files.writeString(other.resolve("Value.java"), "package other; public class Value { public int number() { return 2; } }");
		final SourceTransformResult sameName = transformer.transform("import extra.Value; class Value1 {} class Solver { public static void main(String[] a) { System.out.print(new Value().number() + \"/\" + new other.Value().number()); } }", root, false, "", true);
		check(sameName.exitCode() == 0, sameName.diagnostics());
		check(sameName.sourceCode().contains("class Value2") && execute(sameName.sourceCode()).equals("1/2"), sameName.sourceCode());

		Files.writeString(pkg.resolve("Larger.java"), "package extra; import static java.lang.Integer.max; import static java.util.Map.*; public class Larger { public static int of(int a, int b) { Entry<String, Integer> e = entry(\"x\", 0); return max(a, b) + e.getValue(); } }");
		final SourceTransformResult staticImports = transformer.transform("import static java.lang.Math.max; import extra.Larger; class Solver { public static void main(String[] a) { System.out.print(max(4, 9) + Larger.of(1, 2)); } }", root, false, "", true);
		check(staticImports.exitCode() != 0 && staticImports.diagnostics().contains("max"), staticImports.diagnostics());
		final SourceTransformResult qualifiedMax = transformer.transform("import extra.Larger; class Solver { public static void main(String[] a) { System.out.print(Math.max(4, 9) + Larger.of(1, 2)); } }", root, false, "", true);
		check(qualifiedMax.exitCode() == 0 && execute(qualifiedMax.sourceCode()).equals("11"), qualifiedMax.diagnostics());

		Files.writeString(pkg.resolve("Unit.java"), "package extra; import static java.util.concurrent.TimeUnit.*; import java.util.concurrent.TimeUnit; public class Unit { public static String of(TimeUnit u) { switch (u) { case SECONDS: return \"s\"; default: return \"?\"; } } public static long ms() { return SECONDS.toMillis(1); } }");
		final SourceTransformResult enumCase = transformer.transform("import extra.Unit; class Solver { public static void main(String[] a) { System.out.print(Unit.of(java.util.concurrent.TimeUnit.SECONDS) + Unit.ms()); } }", root, false, "", true);
		check(enumCase.exitCode() == 0, enumCase.diagnostics());
		check(execute(enumCase.sourceCode()).equals("s1000"), enumCase.sourceCode());

		Files.writeString(pkg.resolve("Helper.java"), "package extra; import java.util.List; public class Helper { public static String tag() { return String.valueOf(List.of(2).getFirst()); } }");
		final String qualified = "// header\n\nclass Solver {\n\tpublic static void main(String[] a) {\n\t\tint Helper = 1;\n\t\tSystem.out.print(Helper + extra.\n\t\t\tHelper.tag());\n\t\tSystem.out.print(new int[0][-1]);\n\t}\n}\n";
		final SourceTransformResult shadowed = transformer.transform(qualified, root, false, "", true);
		check(shadowed.exitCode() == 0, shadowed.diagnostics());
		// ライブラリの import は先頭のコメントの後に入れ、同じ名前の変数がある型は別の名前にする
		check(shadowed.sourceCode().startsWith("// header\n\nimport java.util.List;\n"), shadowed.sourceCode());
		check(shadowed.sourceCode().contains("Helper + Helper1\n.tag()") && shadowed.sourceCode().contains("class Helper1"), shadowed.sourceCode());
		final String solution = shadowed.sourceCode().substring(0, shadowed.sourceCode().indexOf("// ===== inlined:"));
		final java.util.List<String> before = qualified.lines().toList();
		final java.util.List<String> after = solution.lines().toList();
		// 2行に分けた完全修飾名を短くしても、それより後の行はずれない(import の1行だけ下がる)
		final String line = "\t\tSystem.out.print(new int[0][-1]);";
		check(after.indexOf(line) - before.indexOf(line) == 1, solution);
		final String run = execute(shadowed.sourceCode(), true);
		check(run.startsWith("12") && run.contains("Main.java:9)"), run);

		// 型パラメーターや入れ子の型が同じ名前でも、展開したライブラリの型を指す
		final SourceTransformResult typeParameter = transformer.transform("class Solver { static <Helper> String f() { return extra.Helper.tag(); } static class Helper {} public static void main(String[] a) { System.out.print(f() + new Helper().getClass().getSimpleName()); } }", root, false, "", true);
		check(typeParameter.exitCode() == 0, typeParameter.diagnostics());
		check(typeParameter.sourceCode().contains("Helper1.tag()") && typeParameter.sourceCode().contains("class Helper1"), typeParameter.sourceCode());
		check(execute(typeParameter.sourceCode()).equals("2Helper"), typeParameter.sourceCode());

		// 継承して見える入れ子の型(Thread.State)も、同じ名前のライブラリの型を隠す
		Files.writeString(pkg.resolve("State.java"), "package extra; public class State { public static int tag() { return 3; } }");
		final SourceTransformResult inherited = transformer.transform("class Solver extends Thread { public static void main(String[] a) { System.out.print(extra.State.tag()); } }", root, false, "", true);
		check(inherited.exitCode() == 0, inherited.diagnostics());
		check(inherited.sourceCode().contains("State1.tag()") && execute(inherited.sourceCode()).equals("3"), inherited.sourceCode());

		final SourceTransformResult sameFile = transformer.transform("""
				package sol;
				public class Main {
					static class Util { static int n() { return 8; } }
					public static void main(String[] args) { System.out.print(sol.Util.n()); }
				}
				class Util { static int n() { return 1; } }
				""", root, false, "", false);
		check(sameFile.exitCode() == 0 && execute(sameFile.sourceCode()).equals("1"), sameFile.diagnostics());

		// Unicode エスケープで書いた起動クラスの名前も、javac と同じく読んで Main にする
		final SourceTransformResult escaped = transformer.transform("class Sol\\u0076er { public static void main(String[] a) { System.out.print(new Sol\\u0076er().getClass().getSimpleName()); } }", root, false, "", true);
		check(escaped.exitCode() == 0, escaped.diagnostics());
		check(execute(escaped.sourceCode()).equals("Main"), escaped.sourceCode());

		// 展開したファイルは、パッケージの階層と違う場所にあれば、実際の場所で表す
		Files.writeString(root.resolve("Mine.java"), "package mine; public class Mine { public static int tag() { return 4; } }");
		final SourceTransformResult misplaced = transformer.transform("import mine.Mine; import extra.State; class Solver { public static void main(String[] a) { System.out.print(Mine.tag() + State.tag()); } }", root, false, "", true);
		check(misplaced.exitCode() == 0, misplaced.diagnostics());
		check(misplaced.summary().bundledFiles().equals(java.util.List.of("Mine.java", "extra/State.java"))
				|| misplaced.summary().bundledFiles().equals(java.util.List.of("extra/State.java", "Mine.java")), String.valueOf(misplaced.summary()));
		Files.delete(root.resolve("Mine.java"));

		Files.writeString(pkg.resolve("Base.java"), "package extra; public class Base { void f() {} public void run() { f(); } }");
		final SourceTransformResult overridden = transformer.transform("import extra.Base; class Solver extends Base { void f() {} public static void main(String[] a) { new Solver().run(); } }", root, false, "", false);
		check(overridden.exitCode() != 0 && overridden.diagnostics().contains("overrides"), overridden.diagnostics());
		final SourceTransformResult access = transformer.transform("import extra.Base;\nclass Solver extends Base { private void f() {} public static void main(String[] a) {} }", root, false, "", false);
		check(access.exitCode() != 0 && access.diagnostics().contains("In transformed Main.java:"), access.diagnostics());
		check(access.sourceCode().lines().toList().get((int) access.diagnosticItems().getFirst().line() - 1).contains("private void f()"), access.sourceCode());
	}

	private static String execute(final String source) throws Exception {
		return execute(source, false);
	}

	private static void checkQualificationScopes(final JavaSourceTransformer transformer, final Path root) throws Exception {
		final String scopes = """
				class Base { int base = 1; }
				class Solver extends Base {
					static int n = 7;
					static { int Main = 1; System.out.println(Solver.n + Main); }
					static java.util.function.IntUnaryOperator field = Main -> Solver.n + Main;
					class Inner { int value(int Main) { return Solver.this.n + Solver.super.base + Main; } }
					public static void main(String[] a) {
						class Local { int value(int Main) { return Solver.n + Main; } }
						class Nested { int value() { java.util.function.IntUnaryOperator f = Main -> Solver.n + Main; return f.applyAsInt(2); } }
						System.out.println(new Local().value(3));
						System.out.println(new Object() { int value(int Main) { return Solver.n + Main; } }.value(4));
						System.out.println(new Nested().value());
						System.out.println(field.applyAsInt(5));
						System.out.println(new Solver().new Inner().value(6));
					}
				}
				""";
		final String bundled = checkEquivalent(transformer, root, scopes);
		check(bundled.contains("int value(int Main) { return Main.this.n + Main.super.base + Main; }"), bundled);

		final Path pkg = Files.createDirectories(root.resolve("names"));
		Files.writeString(pkg.resolve("List.java"), "package names; public class List { public static int n() { return 2; } }");
		for (final String imported : java.util.List.of("java.util.List", "java.util.*")) {
			checkEquivalent(transformer, root, "import " + imported + "; class Solver { public static void main(String[] a) { int java = 1; System.out.print(List.of(java).size() + names.List.n()); } }");
		}
		Files.writeString(pkg.resolve("Dates.java"), "package names; import java.sql.*; public class Dates { public static Date epoch() { return new Date(0); } }");
		checkEquivalent(transformer, root, """
				import java.util.*;
				class Solver { public static void main(String[] a) {
					int java = 1;
					System.out.print(Date.from(new Date(0).toInstant()).getTime() + names.Dates.epoch().getTime() + java);
				} }
				""");
		for (final String constructor : java.util.List.of("protected Solver {}", "@Deprecated protected Solver(int n) { this.n = n; }", "public Solver {}", "Solver {}")) {
			checkEquivalent(transformer, root, "record Solver(int n) { " + constructor + " public static void main(String[] a) { System.out.print(new Solver(4).n()); } }");
		}
	}

	private static String checkEquivalent(final JavaSourceTransformer transformer, final Path root, final String source) throws Exception {
		final String expected = execute(source, "Solver", false, root);
		final SourceTransformResult result = transformer.transform(source, root, false, "", true);
		check(result.exitCode() == 0, result.diagnostics());
		check(execute(result.sourceCode()).equals(expected), result.sourceCode());
		return result.sourceCode();
	}

	private static String execute(final String source, final boolean allowFailure) throws Exception {
		return execute(source, "Main", allowFailure);
	}

	private static String execute(final String source, final String entry, final boolean allowFailure) throws Exception {
		return execute(source, entry, allowFailure, null);
	}

	private static String execute(final String source, final String entry, final boolean allowFailure, final Path sourcePath) throws Exception {
		final Path folder = Files.createTempDirectory("bundle-execution-");
		try {
			final Path file = folder.resolve(entry.substring(entry.lastIndexOf('.') + 1) + ".java");
			Files.writeString(file, source);
			check(javax.tools.ToolProvider.getSystemJavaCompiler().run(null, null, null, "-sourcepath", (sourcePath == null ? folder : sourcePath).toString(),
					"-d", folder.toString(), file.toString()) == 0, source);
			final Process process = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(), "-cp", folder.toString(), entry).start();
			final String stdout = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
			final String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
			final int status = process.waitFor();
			if (!allowFailure) check(status == 0, stderr);
			return allowFailure ? stdout + stderr : stdout;
		} finally {
			try (var files = Files.walk(folder)) {
				for (final Path path : files.sorted(java.util.Comparator.reverseOrder()).toList())
					Files.deleteIfExists(path);
			}
		}
	}

	private static void check(final boolean condition, final String message) {
		if (!condition) throw new AssertionError(message);
	}
}
