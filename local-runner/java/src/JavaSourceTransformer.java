import java.io.*;
import java.net.*;
import java.nio.charset.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

import javax.lang.model.element.*;
import javax.lang.model.type.*;
import javax.lang.model.util.*;
import javax.tools.*;

import com.sun.source.tree.*;
import com.sun.source.util.*;

/**
 * javac の構文木・シンボル解決を正典として提出用 Java ソースを生成します。
 */
final class JavaSourceTransformer {
	private static final Charset UTF_8 = StandardCharsets.UTF_8;
	private static final Pattern LEADING_BLANK_LINES = Pattern.compile("\\A(?:[\\t ]*\\n)+");
	private static final String LAST_PACKAGES_ENV = "LOCAL_RUNNER_LIBRARY_LAST";
	private final JavaCompiler compiler;
	private final List<String> lastPackages;
	private Path cachedRoot;
	private long cachedStamp = Long.MIN_VALUE;
	private JavaLibraryIndex cachedIndex;

	JavaSourceTransformer() {
		this(lastPackagesFromEnvironment());
	}

	/**
	 * @param lastPackages 展開するときに末尾へ回すパッケージ。入出力のように、大きくて毎回同じものを書く。
	 */
	JavaSourceTransformer(final List<String> lastPackages) {
		compiler = ToolProvider.getSystemJavaCompiler();
		if (compiler == null) throw new IllegalStateException("No system Java compiler is available (JDK required).");
		this.lastPackages = List.copyOf(lastPackages);
	}

	private static List<String> lastPackagesFromEnvironment() {
		final String raw = System.getenv(LAST_PACKAGES_ENV);
		if (raw == null || raw.isBlank()) return List.of();
		return Arrays.stream(raw.split(",")).map(String::strip).filter(name -> !name.isEmpty()).toList();
	}

	private static VariableTree findDebugFlag(final MainClass main, final String name) {
		if (name.isEmpty()) return null;
		for (final Tree member : main.tree().getMembers()) {
			if (member instanceof VariableTree variable && variable.getName().contentEquals(name)
					&& variable.getInitializer() instanceof LiteralTree literal && literal.getValue() instanceof Boolean)
				return variable;
		}
		return null;
	}

	static String formatDiagnostics(final DiagnosticCollector<JavaFileObject> diagnostics, final StringWriter output) {
		final StringBuilder builder = new StringBuilder();
		for (final Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
			builder.append(diagnostic.getKind()).append(' ').append(diagnostic.getLineNumber()).append(':').append(diagnostic.getColumnNumber()).append(' ').append(diagnostic.getCode()).append(' ').append(diagnostic.getMessage(Locale.ROOT)).append('\n');
		}
		if (!output.toString().isBlank()) builder.append(output);
		return builder.toString().stripTrailing();
	}

	static List<CompilerDiagnostic> diagnosticItems(final DiagnosticCollector<JavaFileObject> diagnostics,
													final CompilationUnitTree unit, final SourcePositions positions) {
		final List<CompilerDiagnostic> result = new ArrayList<>();
		for (final Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
			String importName = null;
			final String code = diagnostic.getCode();
			if (diagnostic.getKind() == Diagnostic.Kind.ERROR && (code.equals("compiler.err.doesnt.exist") || code.startsWith("compiler.err.cant.resolve"))
					&& diagnostic.getSource() != null && diagnostic.getSource().toUri().equals(unit.getSourceFile().toUri())) {
				for (final ImportTree imported : unit.getImports()) {
					final long position = diagnostic.getPosition();
					if (position >= positions.getStartPosition(unit, imported) && position < positions.getEndPosition(unit, imported)) {
						importName = imported.getQualifiedIdentifier().toString();
						break;
					}
				}
			}
			result.add(new CompilerDiagnostic(diagnostic.getKind().name(), diagnostic.getLineNumber(), diagnostic.getColumnNumber(),
					diagnostic.getCode(), diagnostic.getMessage(Locale.ROOT), importName));
		}
		return List.copyOf(result);
	}

	static String normalize(final String source) {
		return source.replace("\r\n", "\n").replace('\r', '\n');
	}

	SourceTransformResult transform(final String rawSource, final Path librarySourceRoot, final boolean debug, final String debugFlag, final boolean validate) {
		return transform(rawSource, librarySourceRoot, debug, debugFlag, validate, null);
	}

	SourceTransformResult transform(final String rawSource, final Path librarySourceRoot, final boolean debug, final String debugFlag,
									final boolean validate, final JavaCompilerService nextCompile) {
		try {
			final Path root = librarySourceRoot.toAbsolutePath().normalize();
			if (!Files.isDirectory(root)) {
				return failure(rawSource, "library folder was not found: " + root);
			}
			final JavaLibraryIndex index = libraryIndex(root);
			final String source = normalize(rawSource);
			final Analysis analysis = analyze(source, index.classPath);
			// 複数の public 型を貼った場合は、入口以外の public を展開時に外して Main.java として検証する。
			if (analysis.hasErrors() && analysis.diagnosticItems().stream().anyMatch(item -> item.kind().equals("ERROR")
					&& !item.code().equals("compiler.err.class.public.should.be.in.file")))
				return failure(source, analysis);
			final Map<Path, JavaBundleNames.Unit> libraries = new HashMap<>();
			final List<Path> dependencies = collectDependencies(analysis, index, libraries);
			final BundleOutput bundled = bundle(source, analysis, dependencies, libraries, index, debug, debugFlag);
			if (validate || bundled.names().requiresVerification()) {
				final var parsed = new JavaAnalysisTask(compiler, "Main.java", bundled.source(), null);
				boolean retained = false;
				try {
					final Analysis validation = parsed.analysis;
					if (validation.hasErrors())
						return new SourceTransformResult(1, bundled.source(), "In transformed Main.java:\n" + validation.diagnostics(), List.of(), validation.diagnosticItems());
					if (!findMainClass(validation).tree().getSimpleName().contentEquals("Main"))
						return failure(source, "The submission entry point is not Main.");
					bundled.names().verify(validation);
					if (nextCompile != null) {
						nextCompile.remember(parsed);
						retained = true;
					}
				} finally {
					if (!retained) parsed.close();
				}
			}
			return new SourceTransformResult(0, bundled.source(), "", bundled.inlined(), List.of(), bundled.summary());
		} catch (final Exception exception) {
			return failure(rawSource, exception.toString());
		}
	}

	private SourceTransformResult failure(final String source, final String diagnostics) {
		return new SourceTransformResult(1, source, diagnostics, List.of(), List.of());
	}

	private SourceTransformResult failure(final String source, final Analysis analysis) {
		return new SourceTransformResult(1, source, analysis.diagnostics(), List.of(), analysis.diagnosticItems());
	}

	/**
	 * ライブラリのフォルダにある型の索引を作ります。フォルダの名前や階層は問いません。
	 * 型とパッケージの名前は、ライブラリをコンパイルしたときの構文木から取得します。
	 */
	private JavaLibraryIndex libraryIndex(final Path root) throws IOException {
		final List<Path> sources = librarySources(root);
		long stamp = 1L;
		for (final Path path : sources) {
			stamp = 31L * stamp + root.relativize(path).toString().hashCode();
			stamp = 31L * stamp + Files.getLastModifiedTime(path).toMillis();
			stamp = 31L * stamp + Files.size(path);
		}
		if (root.equals(cachedRoot) && stamp == cachedStamp && cachedIndex != null) return cachedIndex;
		cachedIndex = null;
		final JavaLibraryIndex prepared = new JavaLibraryIndex(compiler, root, sources);
		cachedRoot = root;
		cachedStamp = stamp;
		cachedIndex = prepared;
		return cachedIndex;
	}

	/**
	 * ライブラリのフォルダにある Java のソースを、名前の順で返します。package-info と module-info は型ではないので除きます。
	 */
	private List<Path> librarySources(final Path root) throws IOException {
		final List<Path> sources = new ArrayList<>();
		final Path generated = root.resolve(JavaLibraryIndex.CLASS_DIRECTORY);
		Files.walkFileTree(root, new SimpleFileVisitor<>() {
			@Override
			public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attributes) {
				return dir.equals(generated) ? FileVisitResult.SKIP_SUBTREE : FileVisitResult.CONTINUE;
			}

			@Override
			public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) {
				final String name = file.getFileName().toString();
				if (name.endsWith(".java") && !name.equals("package-info.java") && !name.equals("module-info.java")) {
					sources.add(file.toAbsolutePath().normalize());
				}
				return FileVisitResult.CONTINUE;
			}
		});
		sources.sort(null);
		return sources;
	}

	/**
	 * 展開順を決めます。依存先は使う型の直後に置き、末尾へ回すと決めたパッケージの型は最後に並べます。
	 * ほかの型から使われない型を起点に名前順でたどるので、同じ型の組み合わせなら常に同じ順序になります。
	 */
	private List<Path> collectDependencies(final Analysis analysis, final JavaLibraryIndex index, final Map<Path, JavaBundleNames.Unit> libraries) {
		final TreeSet<Path> required = new TreeSet<>();
		final Set<Path> usedByLibrary = new HashSet<>();
		final ArrayDeque<Path> queue = new ArrayDeque<>(index.referencedLibrarySources(analysis.solution(), analysis.trees()));
		while (!queue.isEmpty()) {
			final Path path = queue.removeFirst();
			if (!required.add(path)) continue;
			libraries.put(path, index.newUnit(path));
			final Set<Path> dependencies = index.dependencies.get(path);
			usedByLibrary.addAll(dependencies);
			queue.addAll(dependencies);
		}

		final LinkedHashSet<Path> ordered = new LinkedHashSet<>();
		for (final Path path : required) {
			if (!usedByLibrary.contains(path)) visitDependency(path, index, ordered);
		}
		// 循環依存には起点がないので、残った型もたどる
		for (final Path path : required) visitDependency(path, index, ordered);
		return ordered.stream().sorted(Comparator.comparing(path -> isLastPackage(index.byPath.get(path).packageName()))).toList();
	}

	private boolean isLastPackage(final String packageName) {
		return lastPackages.stream().anyMatch(last -> packageName.equals(last) || packageName.startsWith(last + "."));
	}

	private void visitDependency(final Path path, final JavaLibraryIndex index, final Set<Path> ordered) {
		if (!ordered.add(path)) return;
		for (final Path dependency : new TreeSet<>(index.dependencies.get(path))) {
			visitDependency(dependency, index, ordered);
		}
	}

	private BundleOutput bundle(final String source, final Analysis analysis, final List<Path> dependencies, final Map<Path, JavaBundleNames.Unit> libraries, final JavaLibraryIndex index, final boolean debug, final String debugFlag) throws IOException {
		final MainClass main = findMainClass(analysis);
		final List<JavaBundleNames.Unit> units = new ArrayList<>();
		units.add(new JavaBundleNames.Unit(source, analysis));
		final List<String> inlined = new ArrayList<>();
		for (final Path dependency : dependencies) {
			units.add(libraries.get(dependency));
			inlined.add(index.byPath.get(dependency).fqcn());
		}
		final JavaBundleNames names = new JavaBundleNames(units, main.element(), index);
		final LinkedHashSet<String> hoisted = new LinkedHashSet<>();
		final List<String> parts = new ArrayList<>();
		for (int i = 1; i < units.size(); i++) {
			final JavaBundleNames.Unit unit = units.get(i);
			for (final ImportTree imported : unit.analysis.solution().getImports()) {
				final String name = imported.getQualifiedIdentifier().toString();
				if (!index.isLibraryImport(name) && !names.needsQualification(imported))
					hoisted.add("import " + (imported.isStatic() ? "static " : "") + name + ";");
			}
			final List<Edit> edits = names.edits(unit);
			for (final ImportTree imported : unit.analysis.solution().getImports()) {
				final Span span = treeSpan(unit.code, unit.analysis.solution(), imported, unit.analysis.positions());
				edits.add(new Edit(span.start(), span.end(), ""));
			}
			removePackage(unit.code, unit.analysis, edits);
			parts.add("// ===== inlined: " + inlined.get(i - 1) + " =====\n" + applyEdits(unit.code, edits).strip());
		}
		hoisted.removeIf(candidate -> isCoveredBySolutionImport(candidate, analysis.solution().getImports()));
		// 同名の型を複数のワイルドカードから取り込むときは、優先する型の単一型 import が要る。
		for (final String preferred : names.requiredImports()) {
			if (analysis.solution().getImports().stream().noneMatch(i -> !i.isStatic() && i.getQualifiedIdentifier().toString().equals(preferred)))
				hoisted.add("import " + preferred + ";");
		}
		final VariableTree flag = findDebugFlag(main, debugFlag);
		String transformedSolution = transformSolution(source, analysis, index, flag, debug, hoisted, names, units.getFirst());
		if (!parts.isEmpty())
			transformedSolution = transformedSolution.stripTrailing() + "\n\n" + String.join("\n\n", parts) + "\n";
		return new BundleOutput(transformedSolution, List.copyOf(inlined), names, summary(analysis, main, debug, flag, hoisted, dependencies, index));
	}

	private String transformSolution(final String source, final Analysis analysis, final JavaLibraryIndex index, final VariableTree flag, final boolean debug, final Set<String> hoisted, final JavaBundleNames names, final JavaBundleNames.Unit unit) {
		final List<Edit> edits = names.edits(unit);
		removePackage(source, analysis, edits);
		boolean firstLibraryImport = true;
		for (final ImportTree importTree : analysis.solution().getImports()) {
			final String name = importTree.getQualifiedIdentifier().toString();
			if (!index.isLibraryImport(name) && !names.needsQualification(importTree)) continue;
			final Span span = treeSpan(source, analysis.solution(), importTree, analysis.positions());
			final String original = source.substring(span.start(), span.end()).stripTrailing();
			String prefix = firstLibraryImport && !hoisted.isEmpty() ? String.join("\n", hoisted) + "\n\n" : "";
			if (firstLibraryImport && prefix.isEmpty() && span.start() > 0 && !source.substring(0, span.start()).endsWith("\n\n"))
				prefix = "\n";
			edits.add(new Edit(span.start(), span.end(), prefix + "// " + original.stripLeading().replace("\n", "\n// ") + "\n"));
			firstLibraryImport = false;
		}
		// ライブラリの import が無ければ、先頭のコメント(提出用ヘッダーなど)の後、最初の import か型の宣言の前に入れる
		if (firstLibraryImport && !hoisted.isEmpty()) {
			final int at = firstCodePosition(analysis);
			edits.add(new Edit(at, at, String.join("\n", hoisted) + "\n"));
		}
		if (flag != null && !Boolean.valueOf(debug).equals(((LiteralTree) flag.getInitializer()).getValue())) {
			final int start = unit.start(flag.getInitializer());
			final int end = unit.end(flag.getInitializer());
			edits.add(new Edit(start, end, Boolean.toString(debug)));
		}
		return LEADING_BLANK_LINES.matcher(applyEdits(source, edits)).replaceFirst("");
	}

	/**
	 * package を除く、最初の import か型の宣言の位置。どちらも無ければ 0。
	 */
	private int firstCodePosition(final Analysis analysis) {
		final CompilationUnitTree unit = analysis.solution();
		return Stream.concat(unit.getImports().stream(), unit.getTypeDecls().stream())
				.mapToInt(tree -> (int) analysis.positions().getStartPosition(unit, tree))
				.filter(position -> position >= 0)
				.min().orElse(0);
	}

	private boolean isCoveredBySolutionImport(final String candidate, final List<? extends ImportTree> solutionImports) {
		final boolean candidateStatic = candidate.startsWith("import static ");
		final int prefixLength = candidateStatic ? "import static ".length() : "import ".length();
		final String candidateName = candidate.substring(prefixLength, candidate.length() - 1);
		for (final ImportTree solutionImport : solutionImports) {
			if (solutionImport.isStatic() != candidateStatic) continue;
			final String solutionName = solutionImport.getQualifiedIdentifier().toString();
			if (solutionName.equals(candidateName)) return true;
			if (!solutionName.endsWith(".*")) continue;
			final int separator = candidateName.lastIndexOf('.');
			if (separator >= 0 && solutionName.substring(0, solutionName.length() - 1).equals(candidateName.substring(0, separator + 1)))
				return true;
		}
		return false;
	}

	private void removePackage(final String source, final Analysis analysis, final List<Edit> edits) {
		if (analysis.solution().getPackageName() != null) {
			final Span span = treeSpan(source, analysis.solution(), analysis.solution().getPackage(), analysis.positions());
			edits.add(new Edit(span.start(), span.end(), ""));
		}
	}

	/**
	 * 変換で変えたことの要約。DEBUG は、起動クラスの直下にある boolean の宣言を探す。
	 */
	private TransformSummary summary(final Analysis analysis, final MainClass main, final boolean debug, final VariableTree flag,
									 final Set<String> hoisted, final List<Path> dependencies, final JavaLibraryIndex index) {
		final long line = flag == null ? 0 : analysis.solution().getLineMap().getLineNumber(analysis.positions().getStartPosition(analysis.solution(), flag.getInitializer()));
		final List<String> added = hoisted.stream().map(text -> text.replaceFirst("^import (static )?", "").replaceFirst(";$", "")).toList();
		final List<String> files = dependencies.stream().map(path -> index.relativeName(path)).toList();
		return new TransformSummary(main.element().getSimpleName().toString(), flag == null ? null : flag.getName().toString(), debug, line,
				analysis.solution().getPackageName() != null, added, files);
	}

	/**
	 * 提出先が起動するクラスを決めます。候補が複数なら {@code Main} という名前のものを選び、決められなければ失敗します。
	 */
	private MainClass findMainClass(final Analysis analysis) {
		final List<MainClass> candidates = new ArrayList<>();
		for (final Tree declaration : analysis.solution().getTypeDecls()) {
			if (!(declaration instanceof ClassTree type)) continue;
			final TreePath path = TreePath.getPath(analysis.solution(), type);
			if (!(analysis.trees().getElement(path) instanceof TypeElement element)) continue;
			if (type.getMembers().stream().anyMatch(member -> isMainMethod(member, path, analysis.trees())))
				candidates.add(new MainClass(type, element));
		}
		if (candidates.isEmpty())
			throw new IllegalStateException("no top-level type declares public static void main(String[])");
		if (candidates.size() == 1) return candidates.getFirst();
		return candidates.stream().filter(candidate -> candidate.tree().getSimpleName().contentEquals("Main")).findFirst().orElseThrow(() -> new IllegalStateException("main method is ambiguous: " + candidates.stream().map(candidate -> candidate.tree().getSimpleName().toString()).collect(Collectors.joining(", "))));
	}

	private boolean isMainMethod(final Tree member, final TreePath classPath, final Trees trees) {
		if (!(member instanceof MethodTree method) || !method.getName().contentEquals("main")) return false;
		if (!(trees.getElement(new TreePath(classPath, method)) instanceof ExecutableElement element)) return false;
		final Set<Modifier> flags = element.getModifiers();
		if (!flags.contains(Modifier.PUBLIC) || !flags.contains(Modifier.STATIC)) return false;
		if (element.getReturnType().getKind() != TypeKind.VOID || element.getParameters().size() != 1) return false;
		return element.getParameters().getFirst().asType() instanceof ArrayType array
				&& array.getComponentType() instanceof DeclaredType component && component.asElement() instanceof TypeElement type
				&& type.getQualifiedName().contentEquals("java.lang.String");
	}

	private Analysis analyze(final String source, final Path classPath) throws IOException {
		try (var parsed = new JavaAnalysisTask(compiler, primaryTypeName(source) + ".java", source, classPath)) {
			return parsed.analysis;
		}
	}

	private CompilationUnitTree parse(final String source, final URI uri) throws IOException {
		final DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
		try (StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, Locale.ROOT, UTF_8)) {
			final MemorySource unit = new MemorySource(uri, source);
			final JavacTask task = (JavacTask) compiler.getTask(null, fileManager, diagnostics, List.of("-proc:none"), null, List.of(unit));
			return task.parse().iterator().next();
		}
	}

	private String primaryTypeName(final String source) {
		try {
			final CompilationUnitTree parsed = parse(source, URI.create("string:///Submission.java"));
			String first = null;
			for (final Tree declaration : parsed.getTypeDecls()) {
				if (!(declaration instanceof ClassTree type) || type.getSimpleName().isEmpty()) continue;
				// public な型はファイル名と一致している必要があるので、先頭の型より優先する
				if (type.getModifiers().getFlags().contains(Modifier.PUBLIC)) return type.getSimpleName().toString();
				if (first == null) first = type.getSimpleName().toString();
			}
			if (first != null) return first;
		} catch (final Exception ignored) {
		}
		return "Submission";
	}

	private Span treeSpan(final String source, final CompilationUnitTree unit, final Tree tree, final SourcePositions positions) {
		final int start = (int) positions.getStartPosition(unit, tree);
		final int end = (int) positions.getEndPosition(unit, tree);
		return new Span(start, extendNewline(source, end));
	}

	private int extendNewline(final String source, int end) {
		if (end < source.length() && source.charAt(end) == '\r') end++;
		if (end < source.length() && source.charAt(end) == '\n') end++;
		return end;
	}

	private String applyEdits(final String source, final List<Edit> edits) {
		final List<Edit> sorted = edits.stream().distinct().sorted(Comparator.comparingInt(Edit::start).thenComparingInt(Edit::end).reversed()).toList();
		String result = source;
		int previousStart = source.length() + 1;
		for (final Edit edit : sorted) {
			if (edit.start() < 0 || edit.end() < edit.start() || edit.end() > source.length() || edit.end() > previousStart)
				throw new IllegalStateException("Could not apply source edit at offset " + edit.start());
			// 置き換える範囲の改行を残し、それより後の行番号を変えない(2行に分けた mine. と Helper を Helper にするときなど)
			final long lost = result.substring(edit.start(), edit.end()).chars().filter(c -> c == '\n').count() - edit.text().chars().filter(c -> c == '\n').count();
			result = result.substring(0, edit.start()) + edit.text() + "\n".repeat((int) Math.max(0, lost)) + result.substring(edit.end());
			previousStart = edit.start();
		}
		return result;
	}

	private record BundleOutput(String source, List<String> inlined, JavaBundleNames names, TransformSummary summary) {}

	record Analysis(CompilationUnitTree solution, Trees trees,
					SourcePositions positions, Elements elements, Types types, String diagnostics, boolean hasErrors,
					List<CompilerDiagnostic> diagnosticItems) {}

	private record MainClass(ClassTree tree, TypeElement element) {}

	private record Span(int start, int end) {}

	record Edit(int start, int end, String text) {}

	static final class MemorySource extends SimpleJavaFileObject {
		private final String source;

		MemorySource(final String fileName, final String source) {
			this(URI.create("string:///" + fileName), source);
		}

		MemorySource(final URI uri, final String source) {
			super(uri, Kind.SOURCE);
			this.source = source;
		}

		@Override
		public CharSequence getCharContent(final boolean ignoreEncodingErrors) {return source;}
	}
}
