import java.io.*;
import java.nio.charset.*;
import java.util.*;

/**
 * Local Runner の起動時に、解答の変換、コンパイル、実行の経路を温めます。
 * ライブラリが無くても動くよう、標準の入出力だけを使います。
 */
public final class WarmUp {
	private static final int REPEAT = 20_000;

	private WarmUp() {}

	public static void main(final String[] args) throws IOException {
		final byte[] input = "123 -4567890123\n".repeat(REPEAT).getBytes(StandardCharsets.US_ASCII);
		final BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(input), StandardCharsets.US_ASCII));
		try (PrintWriter writer = new PrintWriter(new BufferedWriter(new OutputStreamWriter(OutputStream.nullOutputStream(), StandardCharsets.US_ASCII)))) {
			long checksum = 0;
			for (int i = 0; i < REPEAT; i++) {
				final StringTokenizer tokens = new StringTokenizer(reader.readLine());
				checksum += Integer.parseInt(tokens.nextToken());
				checksum ^= Long.parseLong(tokens.nextToken());
				writer.println(checksum);
			}
		}
	}
}
