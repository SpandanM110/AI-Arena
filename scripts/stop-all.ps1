# Stop All Services Script

Write-Host "🛑 Stopping AI Arena Services" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host ""

# Stop Kestra
Write-Host "Stopping Kestra..." -ForegroundColor Cyan
$kestraDir = Join-Path (Split-Path -Parent $PSScriptRoot) "kestra"
if (Test-Path $kestraDir) {
    Set-Location $kestraDir
    docker-compose down 2>$null
    Write-Host "✅ Kestra stopped" -ForegroundColor Green
}

# Note: Backend and Frontend run in separate windows
# They need to be stopped manually or by closing the windows
Write-Host ""
Write-Host "⚠️  Backend and Frontend are running in separate windows." -ForegroundColor Yellow
Write-Host "   Please close those PowerShell windows to stop them." -ForegroundColor Yellow
Write-Host ""
Write-Host "Or press Ctrl+C in each window to stop the servers." -ForegroundColor Gray
Write-Host ""

