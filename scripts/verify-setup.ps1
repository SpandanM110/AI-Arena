# AI Arena Setup Verification Script
# Verifies that all components are properly configured and running

Write-Host "🔍 AI Arena Setup Verification" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

$allGood = $true

# 1. Check Backend
Write-Host "1. Checking Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend API is running (http://localhost:3001)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Backend API is not running" -ForegroundColor Red
    Write-Host "      Start with: cd backend && pnpm run dev" -ForegroundColor Yellow
    $allGood = $false
}

# 2. Check Frontend
Write-Host "2. Checking Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running (http://localhost:3000)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Frontend is not running (optional for API testing)" -ForegroundColor Yellow
    Write-Host "      Start with: cd frontend && pnpm run dev" -ForegroundColor Yellow
}

# 3. Check Kestra
Write-Host "3. Checking Kestra..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/configs" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Kestra is running (http://localhost:8080)" -ForegroundColor Green
        
        # Check if flows are deployed
        try {
            $flowsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/flows/ai-arena" -UseBasicParsing -ErrorAction Stop
            $flows = ($flowsResponse.Content | ConvertFrom-Json)
            if ($flows.Count -gt 0) {
                Write-Host "   ✅ Found $($flows.Count) flow(s) in ai-arena namespace" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  No flows deployed yet" -ForegroundColor Yellow
                Write-Host "      Deploy with: cd kestra && .\deploy-flows.ps1" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️  Could not check flows (namespace may not exist)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ❌ Kestra is not running" -ForegroundColor Red
    Write-Host "      Start with: cd kestra && docker-compose up -d" -ForegroundColor Yellow
    $allGood = $false
}

# 4. Check Database
Write-Host "4. Checking Database..." -ForegroundColor Yellow
$dbPath = Join-Path (Get-Location) "backend\data\arena.db"
if (Test-Path $dbPath) {
    Write-Host "   ✅ Database file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Database file not found (will be created on first run)" -ForegroundColor Yellow
}

# 5. Check Environment Variables
Write-Host "5. Checking Environment Configuration..." -ForegroundColor Yellow
$backendEnv = Join-Path (Get-Location) "backend\.env"
if (Test-Path $backendEnv) {
    Write-Host "   ✅ Backend .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content $backendEnv -Raw
    if ($envContent -match "KESTRA_URL") {
        Write-Host "   ✅ KESTRA_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  KESTRA_URL not found in .env (optional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Backend .env file not found" -ForegroundColor Yellow
    Write-Host "      Copy from: backend\.env.example" -ForegroundColor Yellow
}

# 6. Check Agents
Write-Host "6. Checking Agents..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/agents" -UseBasicParsing -ErrorAction Stop
    $agents = ($response.Content | ConvertFrom-Json)
    if ($agents.Count -gt 0) {
        Write-Host "   ✅ Found $($agents.Count) agent(s)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No agents found" -ForegroundColor Yellow
        Write-Host "      Create with: cd backend && pnpm run seed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check agents (backend may not be running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
if ($allGood) {
    Write-Host "✅ Setup verification complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy Kestra flows: cd kestra && .\deploy-flows.ps1" -ForegroundColor White
    Write-Host "2. Seed default agents: cd backend && pnpm run seed" -ForegroundColor White
    Write-Host "3. Access frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "4. Access Kestra UI: http://localhost:8080" -ForegroundColor White
} else {
    Write-Host "⚠️  Some components need attention" -ForegroundColor Yellow
    Write-Host "Please fix the issues above and run this script again" -ForegroundColor Yellow
}

