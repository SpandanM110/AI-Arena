# Fix better-sqlite3 Build Script
# This script helps fix the better-sqlite3 native build issue

Write-Host "Fixing better-sqlite3..." -ForegroundColor Green
Write-Host ""

# Option 1: Try pnpm approve-builds (interactive)
Write-Host "Option 1: Approve build scripts in pnpm" -ForegroundColor Cyan
Write-Host "  Run this command and select better-sqlite3 when prompted:" -ForegroundColor Yellow
Write-Host "    pnpm approve-builds better-sqlite3" -ForegroundColor White
Write-Host ""

# Option 2: Use npm to rebuild
Write-Host "Option 2: Using npm to install and build" -ForegroundColor Cyan
Write-Host "  Installing better-sqlite3 with npm..." -ForegroundColor Yellow

# Remove pnpm version
Remove-Item -Recurse -Force "node_modules\.pnpm\better-sqlite3*" -ErrorAction SilentlyContinue

# Install with npm (this should build it)
npm install better-sqlite3 --build-from-source

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] better-sqlite3 installed with npm" -ForegroundColor Green
    
    # Try to copy the built binary to pnpm location if it exists
    $npmBinary = "node_modules\better-sqlite3\build\Release\better_sqlite3.node"
    $pnpmPath = "node_modules\.pnpm\better-sqlite3@9.6.0\node_modules\better-sqlite3\build\Release"
    
    if (Test-Path $npmBinary) {
        Write-Host "  Copying binary to pnpm location..." -ForegroundColor Yellow
        if (-not (Test-Path $pnpmPath)) {
            New-Item -ItemType Directory -Path $pnpmPath -Force | Out-Null
        }
        Copy-Item $npmBinary $pnpmPath -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Binary copied" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Testing installation..." -ForegroundColor Yellow
    pnpm run seed
    
} else {
    Write-Host "  [FAIL] npm install failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need Visual Studio C++ Build Tools to compile better-sqlite3." -ForegroundColor Yellow
    Write-Host "Download from: https://visualstudio.microsoft.com/downloads/" -ForegroundColor White
    Write-Host "Select: Desktop development with C++" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, run:" -ForegroundColor Cyan
    Write-Host "  pnpm rebuild better-sqlite3" -ForegroundColor White
}

