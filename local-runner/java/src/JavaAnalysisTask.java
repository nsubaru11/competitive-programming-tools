import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

import javax.tools.*;

import com.sun.source.util.*;

/**
 * 検証した Main.java と実行用ソースが一致すれば、同じ javac タスクをバイトコード生成まで進める。
 */
final class JavaAnalysisTask implements AutoCloseable {
	final String source;
	final JavaSourceTransformer.Analysis analysis;
	private final StandardJavaFileManager files;
	private final JavacTask task;
	private final DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
	private final StringWriter output = new StringWriter();

	JavaAnalysisTask(final JavaCompiler compiler, final String fileName, final String source, final Path classPath) throws IOException {
		this.source = source;
		files = compiler.getStandardFileManager(diagnostics, Locale.ROOT, StandardCharsets.UTF_8);
		try {
			files.setLocationFromPaths(StandardLocation.CLASS_PATH, classPath == null ? List.of() : List.of(classPath));
			final var options = new ArrayList<>(List.of("-encoding", "UTF-8", "-g:lines,source", "-proc:none", "-implicit:none"));
			options.addAll(JavaCompilerService.RELEASE_OPTIONS);
			final var unit = new JavaSourceTransformer.MemorySource(fileName, source);
			task = (JavacTask) compiler.getTask(output, files, diagnostics, options, null, List.of(unit));
			final var tree = task.parse().iterator().next();
			task.analyze();
			final var trees = Trees.instance(task);
			final var positions = trees.getSourcePositions();
			analysis = new JavaSourceTransformer.Analysis(tree, trees, positions, task.getElements(), task.getTypes(),
					JavaSourceTransformer.formatDiagnostics(diagnostics, output), hasErrors(),
					JavaSourceTransformer.diagnosticItems(diagnostics, tree, positions));
		} catch (final Throwable error) {
			files.close();
			throw error;
		}
	}

	CompileResult generate(final Path directory) throws IOException {
		Files.createDirectories(directory);
		files.setLocationFromPaths(StandardLocation.CLASS_OUTPUT, List.of(directory));
		task.generate();
		return JavaCompilerService.result(!hasErrors(), directory, diagnostics, output);
	}

	private boolean hasErrors() {
		return diagnostics.getDiagnostics().stream().anyMatch(item -> item.getKind() == Diagnostic.Kind.ERROR);
	}

	@Override
	public void close() throws IOException {files.close();}
}
