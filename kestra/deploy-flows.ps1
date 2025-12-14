# Kestra Flow Deployment Script
# This script deploys all flows to Kestra

$KESTRA_URL = "http://localhost:8080"
$FLOWS_DIR = Join-Path $PSScriptRoot "flows\ai-arena"
$NAMESPACE = "aiarena"

Write-Host "🚀 Deploying Kestra flows..." -ForegroundColor Green
Write-Host "Kestra URL: $KESTRA_URL" -ForegroundColor Cyan
Write-Host "Flows Directory: $FLOWS_DIR" -ForegroundColor Cyan
Write-Host ""

# Check if Kestra is accessible
Write-Host "Checking Kestra connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$KESTRA_URL/api/v1/configs" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Kestra is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Kestra at $KESTRA_URL" -ForegroundColor Red
    Write-Host "Make sure Kestra is running: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Create namespace if it doesn't exist
Write-Host "Creating namespace '$NAMESPACE'..." -ForegroundColor Yellow
try {
    $namespaceBody = @{
        id = $NAMESPACE
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "$KESTRA_URL/api/v1/namespaces" `
        -Method POST `
        -ContentType "application/json" `
        -Body $namespaceBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue | Out-Null
    Write-Host "✅ Namespace ready" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Namespace may already exist (this is OK)" -ForegroundColor Yellow
}

# Deploy each flow
$flowFiles = Get-ChildItem -Path $FLOWS_DIR -Filter "*.yml"
$deployed = 0
$failed = 0

foreach ($flowFile in $flowFiles) {
    $flowName = $flowFile.BaseName
    Write-Host "Deploying flow: $flowName..." -ForegroundColor Cyan
    
    try {
        $flowContent = Get-Content -Path $flowFile.FullName -Raw
        
        # Read and parse YAML (basic approach - for production, use a YAML parser)
        # For now, we'll use the Kestra API to create/update flows
        
        # Use PUT endpoint: /api/v1/flows/{namespace}/{id}
        # According to Kestra API docs: https://kestra.io/docs/how-to-guides/api
        $flowBody = @{
            namespace = $NAMESPACE
            id = $flowName
            flow = $flowContent
        } | ConvertTo-Json -Depth 10
        
        # Try to create/update the flow using PUT
        try {
            $response = Invoke-WebRequest -Uri "$KESTRA_URL/api/v1/flows/$NAMESPACE/$flowName" `
                -Method PUT `
                -ContentType "application/json" `
                -Body $flowBody `
                -UseBasicParsing `
                -ErrorAction Stop
            
            Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
            $deployed++
        } catch {
            # If PUT fails, try POST
            try {
                $response = Invoke-WebRequest -Uri "$KESTRA_URL/api/v1/flows" `
                    -Method POST `
                    -ContentType "application/json" `
                    -Body $flowBody `
                    -UseBasicParsing `
                    -ErrorAction Stop
                
                Write-Host "  ✅ Created successfully" -ForegroundColor Green
                $deployed++
            } catch {
                Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
                $failed++
            }
        }
    } catch {
        Write-Host "  ❌ Error reading file: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Green
Write-Host "  ✅ Deployed: $deployed" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "🌐 Access Kestra UI: $KESTRA_URL" -ForegroundColor Cyan
Write-Host "📚 View flows at: $KESTRA_URL/ui/flows" -ForegroundColor Cyan

