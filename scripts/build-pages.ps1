$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $repoRoot "dist"

if (Test-Path $distPath) {
    Remove-Item -Recurse -Force $distPath
}

New-Item -ItemType Directory -Path $distPath | Out-Null
Copy-Item -Path (Join-Path $repoRoot "public\*") -Destination $distPath -Recurse -Force
Copy-Item -Path (Join-Path $repoRoot "src") -Destination $distPath -Recurse -Force
Copy-Item -Path (Join-Path $repoRoot "assets") -Destination $distPath -Recurse -Force
New-Item -ItemType File -Path (Join-Path $distPath ".nojekyll") | Out-Null

Write-Host "GitHub Pages bundle created in $distPath"
