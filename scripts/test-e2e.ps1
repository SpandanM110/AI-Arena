# End-to-End Test Script
# Tests the complete application flow

Write-Host "🧪 AI Arena End-to-End Test" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$warnings = 0

# Test 1: Backend Health
Write-Host "Test 1: Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend is healthy" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ❌ Backend returned status $($response.StatusCode)" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ❌ Backend is not accessible" -ForegroundColor Red
    Write-Host "     Make sure backend is running: cd backend && pnpm run dev" -ForegroundColor Gray
    $testsFailed++
}

# Test 2: Get Agents
Write-Host "Test 2: Get Agents..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/agents" -UseBasicParsing -TimeoutSec 5
    $agents = ($response.Content | ConvertFrom-Json)
    if ($agents.Count -gt 0) {
        Write-Host "  ✅ Found $($agents.Count) agent(s)" -ForegroundColor Green
        $testsPassed++
        
        # Store agent IDs
        $redAgent = $agents | Where-Object { $_.type -eq "red" } | Select-Object -First 1
        $blueAgent = $agents | Where-Object { $_.type -eq "blue" } | Select-Object -First 1
        $targetAgent = $agents | Where-Object { $_.type -eq "target" } | Select-Object -First 1
        
        if (-not $redAgent -or -not $blueAgent -or -not $targetAgent) {
            Write-Host "  ⚠️  Missing required agents (red, blue, target)" -ForegroundColor Yellow
            Write-Host "     Run: cd backend && pnpm run seed" -ForegroundColor Gray
            $warnings++
        }
    } else {
        Write-Host "  ⚠️  No agents found" -ForegroundColor Yellow
        Write-Host "     Run: cd backend && pnpm run seed" -ForegroundColor Gray
        $warnings++
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
            -UseBasicParsing `
            -TimeoutSec 10
        
        $match = ($response.Content | ConvertFrom-Json)
        Write-Host "  ✅ Match created: $($match.id)" -ForegroundColor Green
        $testsPassed++
        $matchId = $match.id
        
        # Wait for match to process
        Write-Host "  ⏳ Waiting for match to process..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "  ❌ Failed to create match: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ⚠️  Skipped (missing agents)" -ForegroundColor Yellow
    $warnings++
}

# Test 4: Get Match Events
Write-Host "Test 4: Get Match Events..." -ForegroundColor Yellow
if ($matchId) {
    try {
        Start-Sleep -Seconds 3
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/matches/$matchId/events" -UseBasicParsing -TimeoutSec 5
        $events = ($response.Content | ConvertFrom-Json)
        if ($events.Count -gt 0) {
            Write-Host "  ✅ Found $($events.Count) event(s)" -ForegroundColor Green
            $testsPassed++
            
            # Check for tool calls (Cline integration)
            $eventsWithTools = $events | Where-Object { $_.toolCalls -and $_.toolCalls.Count -gt 0 }
            if ($eventsWithTools.Count -gt 0) {
                Write-Host "  ✅ Cline tool execution detected ($($eventsWithTools.Count) events with tools)" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "  ⚠️  No tool executions detected (Cline may not be active)" -ForegroundColor Yellow
                $warnings++
            }
        } else {
            Write-Host "  ⚠️  No events found (match may still be processing)" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "  ❌ Failed to get events" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  ⚠️  Skipped (no match created)" -ForegroundColor Yellow
    $warnings++
}

# Test 5: Frontend Accessibility
Write-Host "Test 5: Frontend Accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend is accessible" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ⚠️  Frontend returned status $($response.StatusCode)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ⚠️  Frontend not accessible (may not be running)" -ForegroundColor Yellow
    $warnings++
}

# Test 6: Kestra Integration
Write-Host "Test 6: Kestra Integration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/configs" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Kestra is accessible" -ForegroundColor Green
        $testsPassed++
        
        # Test Kestra API endpoint
        try {
            $kestraResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/kestra/executions" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($kestraResponse.StatusCode -eq 200) {
                Write-Host "  ✅ Kestra API integration working" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "  ⚠️  Kestra API endpoint returned $($kestraResponse.StatusCode)" -ForegroundColor Yellow
                $warnings++
            }
        } catch {
            Write-Host "  ⚠️  Kestra API endpoint not available (backend may not have KESTRA_URL configured)" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "  ⚠️  Kestra returned status $($response.StatusCode)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ⚠️  Kestra not running (optional)" -ForegroundColor Yellow
    $warnings++
}

# Test 7: WebSocket (basic check)
Write-Host "Test 7: WebSocket Server..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 3002 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✅ WebSocket port 3002 is open" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ⚠️  WebSocket port 3002 is not accessible" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ⚠️  Could not test WebSocket" -ForegroundColor Yellow
    $warnings++
}

# Test 8: Database
Write-Host "Test 8: Database..." -ForegroundColor Yellow
$dbPath = Join-Path (Split-Path -Parent $PSScriptRoot) "backend\data\arena.db"
if (Test-Path $dbPath) {
    $dbSize = (Get-Item $dbPath).Length
    Write-Host "  ✅ Database exists ($([math]::Round($dbSize/1KB, 2)) KB)" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ⚠️  Database not found (will be created on first run)" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "===========================" -ForegroundColor Green
Write-Host "Test Results:" -ForegroundColor Green
Write-Host "  ✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnings: $warnings" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($testsFailed -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 All tests passed! System is fully operational." -ForegroundColor Green
} elseif ($testsFailed -eq 0) {
    Write-Host "✅ Core functionality working! Some optional features may need attention." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the issues above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Kestra:   http://localhost:8080" -ForegroundColor White
Write-Host ""

