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

			final JavaSourceTransformer transformer = new JavaSourceTransformer();
			final String wildcardSource = """
					import java.util.*;
					import lib.ds.*;
					public final class A {
						private static final boolean DEBUG = true;
						public static void main(String[] args) { new UnionFind(3); }
					}
					""";
			final SourceTransformResult wildcard = transformer.transform(wildcardSource, root, false, true);
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

			final SourceTransformResult unrelatedWildcard = transformer.transform(wildcardSource.replace("import java.util.*;", "import java.util.concurrent.*;"), root, false, true);
			check(unrelatedWildcard.exitCode() == 0, unrelatedWildcard.diagnostics());
			check(unrelatedWildcard.sourceCode().contains("import java.util.Arrays;"), "unrelated wildcard incorrectly covered dependency import");

			final SourceTransformResult transitive = transformer.transform("""
					import lib.graph.Kruskal;
					public final class A {
						public static void main(String[] args) { Kruskal.create(); }
					}
					""", root, false, true);
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
			final SourceTransformResult ordered = transformer.transform(orderSource, root, false, true);
			check(ordered.exitCode() == 0, ordered.diagnostics());
			check(ordered.inlinedClasses().equals(expectedOrder), "dependencies should follow their user and lib.io should come last: " + ordered.inlinedClasses());
			check(ordered.sourceCode().indexOf("// ===== inlined: lib.math.Mint") < ordered.sourceCode().indexOf("// ===== inlined: lib.io.Input"), "source order does not match inlined classes");
			final SourceTransformResult reordered = transformer.transform(orderSource.replace("new UnionFind(1); Input.read(); Mint.one(); Kruskal.create();", "Kruskal.create(); Mint.one(); Input.read(); new UnionFind(1);"), root, false, true);
			check(reordered.exitCode() == 0, reordered.diagnostics());
			check(reordered.inlinedClasses().equals(expectedOrder), "inline order depends on reference order: " + reordered.inlinedClasses());

			final String implicitSource = wildcardSource.replace("import lib.ds.*;\n", "");
			final SourceTransformResult implicit = transformer.transform(implicitSource, root, false, true);
			check(implicit.exitCode() == 0, implicit.diagnostics());
			check(implicit.addedImports().equals(java.util.List.of("lib.ds.UnionFind")), implicit.addedImports().toString());
			check(implicit.sourceCode().contains("// import lib.ds.UnionFind;"), "inferred import was not retained");

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
			final SourceTransformResult renamed = transformer.transform(renameSource, root, false, true);
			check(renamed.exitCode() == 0, renamed.diagnostics());
			check(!renamed.sourceCode().contains("package example"), "package was not removed");
			check(renamed.sourceCode().contains("Main() {}"), "constructor was not renamed");
			check(renamed.sourceCode().contains("new Main()"), "class reference was not renamed");
			check(renamed.sourceCode().contains("String Solver ="), "unrelated identifier was renamed");

			final SourceTransformResult overloaded = transformer.transform("""
					final class Helper {
						public static int main(int[] values) { return values.length; }
					}
					public final class Solver {
						public static void main(String... args) {}
					}
					""", root, false, true);
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
					""", root, false, true);
			check(preferred.exitCode() == 0, preferred.diagnostics());
			check(preferred.sourceCode().contains("class Tool"), "Main was not preferred among main methods");

			final SourceTransformResult ambiguous = transformer.transform("""
					final class First {
						public static void main(String[] args) {}
					}
					final class Second {
						public static void main(String[] args) {}
					}
					""", root, false, true);
			check(ambiguous.exitCode() != 0, "ambiguous main unexpectedly succeeded");
			check(ambiguous.diagnostics().contains("First, Second"), ambiguous.diagnostics());

			final SourceTransformResult nested = transformer.transform("""
					public final class Outer {
						static final class Inner {
							public static void main(String[] args) {}
						}
					}
					""", root, false, true);
			check(nested.exitCode() != 0, "nested main unexpectedly succeeded");

			final SourceTransformResult noMain = transformer.transform("public final class Helper {}", root, false, true);
			check(noMain.exitCode() != 0, "source without main unexpectedly succeeded");
			check(noMain.diagnostics().contains("main(String[])"), noMain.diagnostics());

			final SourceTransformResult broken = transformer.transform("public class Broken { MissingType value; }", root, false, true);
			check(broken.exitCode() != 0, "broken source unexpectedly succeeded");
			check(!broken.diagnosticItems().isEmpty(), "structured diagnostics are empty");
			check(broken.diagnosticItems().getFirst().line() == 1, "diagnostic line is missing");
			System.out.println("java source transformer smoke test: OK");
		} finally {
			try (var files = Files.walk(root)) {
				for (final Path path : files.sorted(java.util.Comparator.reverseOrder()).toList())
					Files.deleteIfExists(path);
			}
		}
	}

	private static void check(final boolean condition, final String message) {
		if (!condition) throw new AssertionError(message);
	}
}
