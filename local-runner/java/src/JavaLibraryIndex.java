import java.io.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

import javax.lang.model.element.*;
import javax.lang.model.util.Elements;
import javax.tools.*;

import com.sun.source.tree.*;
import com.sun.source.util.*;

/**
 * 同じライブラリ一式の解析結果と依存関係。提出ごとの改名は Unit に分けて扱う。
 */
final class JavaLibraryIndex {
	static final String CLASS_DIRECTORY = ".compiled-library";
	final Path root;
	final Path classPath;
	final Map<Path, LibraryType> byPath = new HashMap<>();
	final Map<Path, Set<Path>> dependencies = new HashMap<>();
	private final Map<String, LibraryType> byFqcn = new HashMap<>();
	private final Set<String> packages = new HashSet<>();
	private final Map<Path, Source> sources = new HashMap<>();
	private final Map<String, Set<String>> packageTypes = new HashMap<>();
	JavaLibraryIndex(final JavaCompiler compiler, final Path root, final List<Path> files) throws IOException {
		this.root = root;
		classPath = root.resolve(CLASS_DIRECTORY);
		if (Files.exists(classPath)) {
			try (var paths = Files.walk(classPath)) {
				for (final Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
			}
		}
		Files.createDirectories(classPath);
		if (files.isEmpty()) return;
		final var diagnostics = new DiagnosticCollector<JavaFileObject>();
		try (var fm = compiler.getStandardFileManager(diagnostics, null, StandardCharsets.UTF_8)) {
			final var options = new ArrayList<>(List.of("-encoding", "UTF-8", "-proc:none", "-implicit:none", "-d", classPath.toString()));
			options.addAll(JavaCompilerService.RELEASE_OPTIONS);
			final List<JavaFileObject> inputs = new ArrayList<>();
			for (final Path file : files) {
				final String code = JavaSourceTransformer.normalize(Files.readString(file));
				inputs.add(new JavaSourceTransformer.MemorySource(file.toUri(), code));
			}
			final var output = new StringWriter();
			// generate() は javac の構文木を変形するので、バイトコード生成と保持する解析木は別の一括タスクにする。
			if (!compiler.getTask(output, fm, diagnostics, options, null, inputs).call())
				throw new IOException("library classpath compilation failed:\n" + JavaSourceTransformer.formatDiagnostics(diagnostics, output));
			final JavacTask task = (JavacTask) compiler.getTask(output, fm, diagnostics, options, null, inputs);
			final var parsed = new ArrayList<CompilationUnitTree>();
			task.parse().forEach(parsed::add);
			task.analyze();
			if (diagnostics.getDiagnostics().stream().anyMatch(item -> item.getKind() == Diagnostic.Kind.ERROR))
				throw new IOException("library dependency analysis failed:\n" + JavaSourceTransformer.formatDiagnostics(diagnostics, output));
			final Trees trees = Trees.instance(task);
			for (final var unit : parsed) registerSource(unit, task, trees);
			for (final var entry : sources.entrySet()) {
				indexReferences(entry.getKey(), entry.getValue().analysis().solution(), trees, task.getElements());
			}
			cachePackage("java.lang", task.getElements());
		}
	}

	private void registerSource(final CompilationUnitTree unit, final JavacTask task, final Trees trees) throws IOException {
		final Path file = Path.of(unit.getSourceFile().toUri());
		final String pkg = unit.getPackageName() == null ? "" : unit.getPackageName().toString();
		final var analysis = new JavaSourceTransformer.Analysis(unit, trees, trees.getSourcePositions(), task.getElements(), task.getTypes(), "", false, List.of());
		sources.put(file, new Source(unit.getSourceFile().getCharContent(true).toString(), analysis));
		for (final Tree declaration : unit.getTypeDecls()) {
			if (!(declaration instanceof ClassTree type)) continue;
			final String name = type.getSimpleName().toString();
			final var info = new LibraryType(pkg, pkg.isEmpty() ? name : pkg + "." + name, file);
			byFqcn.put(info.fqcn(), info);
			if (file.getFileName().toString().equals(name + ".java")) byPath.put(file, info);
			else byPath.putIfAbsent(file, info);
			packages.add(pkg);
		}
	}

	private void indexReferences(final Path file, final CompilationUnitTree unit, final Trees trees, final Elements elements) {
		final var used = referencedLibrarySources(unit, trees);
		used.remove(file);
		dependencies.put(file, Set.copyOf(used));
		for (final ImportTree imported : unit.getImports()) {
			if (imported.getQualifiedIdentifier() instanceof MemberSelectTree select && select.getIdentifier().contentEquals("*"))
				cachePackage(select.getExpression().toString(), elements);
		}
	}

	JavaBundleNames.Unit newUnit(final Path file) {
		final Source source = sources.get(file);
		return new JavaBundleNames.Unit(source.code(), source.analysis());
	}

	/**
	 * パッケージ直下に存在する型名。入れ子型など、パッケージでない範囲は呼び出し側が解決する。
	 */
	Set<String> packageTypes(final String scope) {
		return packageTypes.get(scope);
	}

	private void cachePackage(final String scope, final Elements elements) {
		if (packageTypes.containsKey(scope)) return;
		final var pkg = elements.getPackageElement(scope);
		if (pkg == null || elements.getTypeElement(scope) != null) return;
		final Set<String> members = new HashSet<>();
		for (final Element member : pkg.getEnclosedElements())
			if (member instanceof TypeElement type) members.add(type.getSimpleName().toString());
		packageTypes.put(scope, Set.copyOf(members));
	}

	String relativeName(final Path path) {
		final LibraryType type = byPath.get(path);
		final String folder = type == null || type.packageName().isEmpty() ? "" : type.packageName().replace('.', '/') + "/";
		final String byPackage = folder + path.getFileName();
		return path.endsWith(byPackage) ? byPackage : root.relativize(path).toString().replace(java.io.File.separatorChar, '/');
	}

	Set<Path> referencedLibrarySources(final CompilationUnitTree unit, final Trees trees) {
		final LinkedHashSet<Path> result = new LinkedHashSet<>();
		new TreePathScanner<Void, Void>() {
			@Override
			public Void visitImport(final ImportTree node, final Void unused) {
				return null;
			}

			private void collect() {
				Element element = trees.getElement(getCurrentPath());
				TypeElement top = null;
				while (element != null && !(element instanceof PackageElement)) {
					if (element instanceof TypeElement type) top = type;
					element = element.getEnclosingElement();
				}
				if (top == null) return;
				final LibraryType type = byFqcn.get(top.getQualifiedName().toString());
				if (type != null) result.add(type.path());
			}

			@Override
			public Void visitIdentifier(final IdentifierTree node, final Void unused) {
				collect();
				return super.visitIdentifier(node, unused);
			}

			@Override
			public Void visitMemberSelect(final MemberSelectTree node, final Void unused) {
				collect();
				return super.visitMemberSelect(node, unused);
			}

			@Override
			public Void visitNewClass(final NewClassTree node, final Void unused) {
				collect();
				return super.visitNewClass(node, unused);
			}
		}.scan(unit, null);
		return result;
	}

	boolean isLibraryImport(final String name) {
		if (name.endsWith(".*") && packages.contains(name.substring(0, name.length() - 2))) return true;
		for (String prefix = name; ; prefix = prefix.substring(0, prefix.lastIndexOf('.'))) {
			if (byFqcn.containsKey(prefix)) return true;
			if (prefix.indexOf('.') < 0) return false;
		}
	}

	record LibraryType(String packageName, String fqcn, Path path) {}

	private record Source(String code, JavaSourceTransformer.Analysis analysis) {}
}
