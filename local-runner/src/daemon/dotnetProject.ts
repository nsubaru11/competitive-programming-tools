import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {runCompiler} from "./processRunner";

// restore の入力は一定。解答とコンパイルの中間・最終出力は build の引数でプログラムごとに渡す。
const project = `<Project Sdk="Microsoft.NET.Sdk">
	<PropertyGroup>
		<OutputType>Exe</OutputType>
		<TargetFramework>net9.0</TargetFramework>
		<LangVersion>13.0</LangVersion>
		<ImplicitUsings>enable</ImplicitUsings>
		<AllowUnsafeBlocks>true</AllowUnsafeBlocks>
		<EnableDefaultCompileItems>false</EnableDefaultCompileItems>
		<UseAppHost>false</UseAppHost>
		<NuGetAudit>false</NuGetAudit>
	</PropertyGroup>
	<ItemGroup>
		<Compile Include="$(SolutionSource)" Condition="'$(SolutionSource)' != ''" />
	</ItemGroup>
</Project>
`;

export const dotnetProjectVersion = crypto.createHash("sha256").update(project).digest("hex");

export class DotnetProjects {
	private readonly ready = new Map<string, Promise<string>>();

	ensure(command: string, root: string, timeoutMs: number, outputLimitBytes: number): Promise<string> {
		const key = crypto.createHash("sha256").update(JSON.stringify([command, dotnetProjectVersion])).digest("hex");
		const dir = path.join(root, key);
		const known = this.ready.get(dir);
		if (known) return known;
		const pending = this.restore(command, dir, timeoutMs, outputLimitBytes).catch(error => {
			this.ready.delete(dir);
			throw error;
		});
		this.ready.set(dir, pending);
		return pending;
	}

	private async restore(command: string, dir: string, timeoutMs: number, outputLimitBytes: number): Promise<string> {
		fs.mkdirSync(dir, {recursive: true});
		const file = path.join(dir, "Main.csproj");
		fs.writeFileSync(file, project);
		const result = await runCompiler([command, "restore", file, "--nologo", "-v", "q"], {cwd: dir, timeoutMs, outputLimitBytes});
		if (result.timedOut || result.exitCode !== 0) throw new Error(result.stderr || result.stdout || "dotnet restore failed.");
		return file;
	}
}
