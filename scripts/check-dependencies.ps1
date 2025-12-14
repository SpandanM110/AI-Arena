# Dependency Check Script
# Verifies all required dependencies are installed

Write-Host "Checking Dependencies" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -ge 18) {
        Write-Host "  [OK] Node.js $nodeVersion (required: 18+)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Node.js $nodeVersion (required: 18+)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red
    Write-Host "     Install from: https://nodejs.org/" -ForegroundColor Gray
    $allGood = $false
}

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = pnpm --version
    Write-Host "  [OK] pnpm $pnpmVersion" -ForegroundColor Green
} else {
    Write-Host "  [WARN] pnpm not found" -ForegroundColor Yellow
    Write-Host "     Installing pnpm..." -ForegroundColor Gray
    npm install -g pnpm
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Host "  [OK] pnpm installed" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Failed to install pnpm" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Docker (optional for Kestra)
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host "  [OK] Docker available" -ForegroundColor Green
    
    # Check if Docker is running
    try {
        docker ps 2>$null | Out-Null
        Write-Host "  [OK] Docker daemon is running" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Docker daemon not running" -ForegroundColor Yellow
        Write-Host "     Start Docker Desktop" -ForegroundColor Gray
    }
} else {
    Write-Host "  [WARN] Docker not found (optional - needed for Kestra)" -ForegroundColor Yellow
    Write-Host "     Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
}

# Check Git (optional)
Write-Host "Checking Git..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "  [OK] Git available" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Git not found (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================" -ForegroundColor Green
if ($allGood) {
    Write-Host "[OK] All required dependencies are installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Run .\scripts\start-all.ps1 to start all services" -ForegroundColor Cyan
} else {
    Write-Host "[FAIL] Some required dependencies are missing" -ForegroundColor Red
    Write-Host "Please install the missing dependencies and run this script again" -ForegroundColor Yellow
}
Write-Host ""
