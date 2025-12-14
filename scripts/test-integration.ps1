# Integration Test Script
# Tests the end-to-end integration between components

Write-Host "🧪 AI Arena Integration Test" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend is healthy" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ Backend returned status $($response.StatusCode)" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ Backend is not accessible" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Get Agents
Write-Host "Test 2: Get Agents..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/agents" -UseBasicParsing
    $agents = ($response.Content | ConvertFrom-Json)
    if ($agents.Count -gt 0) {
        Write-Host "  ✅ Found $($agents.Count) agent(s)" -ForegroundColor Green
        $testsPassed++
        
        # Store agent IDs for later tests
        $redAgent = $agents | Where-Object { $_.type -eq "red" } | Select-Object -First 1
        $blueAgent = $agents | Where-Object { $_.type -eq "blue" } | Select-Object -First 1
        $targetAgent = $agents | Where-Object { $_.type -eq "target" } | Select-Object -First 1
    } else {
        Write-Host "  ⚠️  No agents found (run: cd backend && pnpm run seed)" -ForegroundColor Yellow
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ Failed to get agents" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Create Match
Write-Host "Test 3: Create Match..." -ForegroundColor Yellow
if ($redAgent -and $blueAgent -and $targetAgent) {
    try {
        $matchBody = @{
            redAgentId = $redAgent.id
            blueAgentId = $blueAgent.id
            targetAgentId = $targetAgent.id
            mode = "quick"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/matches" `
            -Method POST `
            -ContentType "application/json" `
            -Body $matchBody `
            -UseBasicParsing
        
        $match = ($response.Content | ConvertFrom-Json)
        Write-Host "  ✅ Match created: $($match.id)" -ForegroundColor Green
        $testsPassed++
        
        # Store match ID for later tests
        $matchId = $match.id
        
        # Wait a bit for match to start
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  ❌ Failed to create match: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ⚠️  Skipped (no agents available)" -ForegroundColor Yellow
}

# Test 4: Get Match Events
Write-Host "Test 4: Get Match Events..." -ForegroundColor Yellow
if ($matchId) {
    try {
        Start-Sleep -Seconds 3  # Wait for some events to be generated
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/matches/$matchId/events" -UseBasicParsing
        $events = ($response.Content | ConvertFrom-Json)
        Write-Host "  ✅ Found $($events.Count) event(s)" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  ❌ Failed to get events" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ⚠️  Skipped (no match created)" -ForegroundColor Yellow
}

# Test 5: Kestra Integration
Write-Host "Test 5: Kestra Integration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/configs" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Kestra is accessible" -ForegroundColor Green
        
        # Test Kestra API endpoint
        try {
            $kestraResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/kestra/executions" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($kestraResponse.StatusCode -eq 200) {
                Write-Host "  ✅ Kestra API endpoint is working" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "  ⚠️  Kestra API endpoint returned $($kestraResponse.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ⚠️  Kestra API endpoint not available (backend may not have KESTRA_URL configured)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Kestra returned status $($response.StatusCode)" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ⚠️  Kestra is not running (optional)" -ForegroundColor Yellow
}

# Test 6: WebSocket (basic check)
Write-Host "Test 6: WebSocket Server..." -ForegroundColor Yellow
try {
    # Basic check - WebSocket server should be running
    $wsPort = 3002
    $connection = Test-NetConnection -ComputerName localhost -Port $wsPort -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✅ WebSocket port $wsPort is open" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ⚠️  WebSocket port $wsPort is not accessible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not test WebSocket" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "============================" -ForegroundColor Green
Write-Host "Test Results:" -ForegroundColor Green
Write-Host "  ✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 All tests passed! System is ready." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the issues above." -ForegroundColor Yellow
}

