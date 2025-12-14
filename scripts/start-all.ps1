# Start All Services Script
# Starts backend, frontend, and Kestra in the correct order

Write-Host "Starting AI Arena - All Services" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"
$kestraDir = Join-Path $rootDir "kestra"

# Check prerequisites
Write-Host "Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[FAIL] Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green

# Check pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "[WARN] pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "[OK] pnpm: $(pnpm --version)" -ForegroundColor Green

# Check Docker (for Kestra)
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[WARN] Docker not found. Kestra will be skipped." -ForegroundColor Yellow
    $skipKestra = $true
} else {
    Write-Host "[OK] Docker: Available" -ForegroundColor Green
    $skipKestra = $false
}

Write-Host ""

# Step 1: Start Kestra (if available)
if (-not $skipKestra) {
    Write-Host "Step 1: Starting Kestra..." -ForegroundColor Cyan
    Set-Location $kestraDir
    
    # Check if already running
    $kestraRunning = docker ps --filter "name=kestra" --format "{{.Names}}" | Select-String "kestra"
    if (-not $kestraRunning) {
        docker-compose up -d
        Write-Host "[OK] Kestra starting..." -ForegroundColor Green
        Start-Sleep -Seconds 5
    } else {
        Write-Host "[OK] Kestra already running" -ForegroundColor Green
    }
    Write-Host ""
}

# Step 2: Start Backend
Write-Host "Step 2: Starting Backend..." -ForegroundColor Cyan
Set-Location $backendDir

# Check if dependencies installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Ensure tsx is installed
Write-Host "Verifying tsx is installed..." -ForegroundColor Yellow
pnpm add -D tsx --force 2>$null | Out-Null

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARN] .env file not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[OK] Created .env file. Please configure it if needed." -ForegroundColor Green
    }
}

# Check if database seeded
$dbPath = Join-Path $backendDir "data\arena.db"
if (-not (Test-Path $dbPath)) {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    pnpm run seed
}

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; pnpm run dev" -WindowStyle Normal
Write-Host "[OK] Backend starting in new window" -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# Step 3: Start Frontend
Write-Host "Step 3: Starting Frontend..." -ForegroundColor Cyan
Set-Location $frontendDir

# Check if dependencies installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; pnpm run dev" -WindowStyle Normal
Write-Host "[OK] Frontend starting in new window" -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# Summary
Write-Host "====================================" -ForegroundColor Green
Write-Host "[OK] All Services Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
if (-not $skipKestra) {
    Write-Host "  Kestra:   http://localhost:8080" -ForegroundColor White
}
Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host "   (This may take 10-30 seconds)" -ForegroundColor Gray
Write-Host ""

# Wait and verify
Start-Sleep -Seconds 10

Write-Host "Verifying services..." -ForegroundColor Yellow

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [OK] Backend is running" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Backend not ready yet (may need more time)" -ForegroundColor Yellow
}

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [OK] Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Frontend not ready yet (may need more time)" -ForegroundColor Yellow
}

# Check Kestra
if (-not $skipKestra) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/configs" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  [OK] Kestra is running" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Kestra not ready yet (may need more time)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Verify backend: http://localhost:3001/health" -ForegroundColor White
if (-not $skipKestra) {
    Write-Host "3. Access Kestra: http://localhost:8080" -ForegroundColor White
}
Write-Host ""
Write-Host "To stop services, close the PowerShell windows or run:" -ForegroundColor Gray
Write-Host "  .\scripts\stop-all.ps1" -ForegroundColor Gray
Write-Host ""

Set-Location $rootDir
