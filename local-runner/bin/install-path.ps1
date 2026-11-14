$ErrorActionPreference = "Stop"

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($null -eq $userPath) { $userPath = "" }
$pathList = $userPath.Split(';', [System.StringSplitOptions]::RemoveEmptyEntries)

if ($PSScriptRoot -in $pathList) {
	Write-Host "Path already contains: $PSScriptRoot" -ForegroundColor Cyan
} else {
	[Environment]::SetEnvironmentVariable("Path", ($pathList + $PSScriptRoot) -join ";", "User")
	Write-Host "Added to user PATH: $PSScriptRoot" -ForegroundColor Green
}

Write-Host "Open a new terminal, then run: test <task> <file> or submit <task> <file>" -ForegroundColor Magenta
