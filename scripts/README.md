# Setup Scripts

Scripts to help set up and verify the AI Arena system.

## Available Scripts

### `setup-complete.ps1`
Complete automated setup for the entire system.

**Usage:**
```powershell
.\scripts\setup-complete.ps1
```

**What it does:**
- Installs backend and frontend dependencies
- Seeds database with default agents
- Starts Kestra Docker container
- Deploys Kestra flows
- Configures environment variables

### `verify-setup.ps1`
Verifies that all components are properly configured and running.

**Usage:**
```powershell
.\scripts\verify-setup.ps1
```

**What it checks:**
- Backend API is running
- Frontend is accessible
- Kestra is running
- Database exists
- Agents are seeded
- Flows are deployed

### Kestra Flow Deployment

**Location:** `kestra/deploy-flows.ps1`

**Usage:**
```powershell
cd kestra
.\deploy-flows.ps1
```

**What it does:**
- Creates ai-arena namespace
- Deploys all flow files from `kestra/flows/`
- Reports deployment status

## Quick Start

1. Run complete setup:
   ```powershell
   .\scripts\setup-complete.ps1
   ```

2. Verify everything works:
   ```powershell
   .\scripts\verify-setup.ps1
   ```

3. Start services:
   ```powershell
   # Terminal 1: Backend
   cd backend
   pnpm run dev

   # Terminal 2: Frontend
   cd frontend
   pnpm run dev

   # Terminal 3: Kestra (if not already running)
   cd kestra
   docker-compose up -d
   ```

## Troubleshooting

If scripts fail:
- Ensure you're running PowerShell (not CMD)
- Check that Node.js and Docker are installed
- Verify you're in the project root directory
- Check individual component logs

