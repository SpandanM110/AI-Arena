# Complete Setup Script for AI Arena
# This script sets up the entire system

Write-Host "🚀 AI Arena Complete Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

# Step 1: Backend Setup
Write-Host "📦 Step 1: Setting up Backend..." -ForegroundColor Cyan
Set-Location (Join-Path $rootDir "backend")

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
    } else {
        Write-Host "❌ Neither pnpm nor npm found. Please install Node.js and pnpm." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please edit it with your API keys if needed." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Step 2: Seed Database
Write-Host ""
Write-Host "🌱 Step 2: Seeding Database..." -ForegroundColor Cyan
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm run seed
} else {
    npm run seed
}
Write-Host "✅ Database seeded" -ForegroundColor Green

# Step 3: Frontend Setup
Write-Host ""
Write-Host "🎨 Step 3: Setting up Frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $rootDir "frontend")

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
    } else {
        npm install
    }
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

# Step 4: Kestra Setup
Write-Host ""
Write-Host "⚙️  Step 4: Setting up Kestra..." -ForegroundColor Cyan
Set-Location (Join-Path $rootDir "kestra")

# Check if Docker is running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker not found. Please install Docker Desktop." -ForegroundColor Yellow
} else {
    # Check if Kestra container is running
    $kestraRunning = docker ps --filter "name=kestra" --format "{{.Names}}" | Select-String "kestra"
    
    if (-not $kestraRunning) {
        Write-Host "Starting Kestra..." -ForegroundColor Yellow
        docker-compose up -d
        Start-Sleep -Seconds 10
    } else {
        Write-Host "✅ Kestra is already running" -ForegroundColor Green
    }
    
    # Wait for Kestra to be ready
    Write-Host "Waiting for Kestra to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $kestraReady = $false
    
    while ($attempt -lt $maxAttempts -and -not $kestraReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/configs" -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $kestraReady = $true
                Write-Host "✅ Kestra is ready" -ForegroundColor Green
            }
        } catch {
            $attempt++
            Start-Sleep -Seconds 2
        }
    }
    
    if ($kestraReady) {
        # Deploy flows
        Write-Host "Deploying Kestra flows..." -ForegroundColor Yellow
        if (Test-Path "deploy-flows.ps1") {
            .\deploy-flows.ps1
        } else {
            Write-Host "⚠️  deploy-flows.ps1 not found. Please deploy flows manually via Kestra UI." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Kestra did not become ready. Please check logs: docker logs kestra" -ForegroundColor Yellow
    }
}

# Step 5: Update Backend .env with Kestra URL
Write-Host ""
Write-Host "🔧 Step 5: Configuring Backend..." -ForegroundColor Cyan
Set-Location (Join-Path $rootDir "backend")

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch "KESTRA_URL") {
        Write-Host "Adding KESTRA_URL to .env..." -ForegroundColor Yellow
        Add-Content ".env" "`nKESTRA_URL=http://localhost:8080"
        Write-Host "✅ Added KESTRA_URL configuration" -ForegroundColor Green
    } else {
        Write-Host "✅ KESTRA_URL already configured" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "============================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   pnpm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend (in a new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   pnpm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor Gray
Write-Host "   Kestra UI: http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify setup:" -ForegroundColor White
Write-Host "   .\scripts\verify-setup.ps1" -ForegroundColor Gray
Write-Host ""

Set-Location $rootDir

