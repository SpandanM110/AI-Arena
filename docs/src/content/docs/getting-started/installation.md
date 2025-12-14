---
title: Installation
description: Detailed installation guide for the AI Arena
---

# Installation

Complete installation guide for the AI Red vs Blue Arena.

## System Requirements

- **Node.js**: 18.0.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Docker**: Optional, for Kestra orchestration
- **Operating System**: Windows, macOS, or Linux

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Agents Assemble"
```

## Step 2: Install Dependencies

### Backend

```bash
cd backend
pnpm install
```

### Frontend

```bash
cd frontend
pnpm install
```

## Step 3: Environment Configuration

### Backend Environment

Create `backend/.env`:

```env
PORT=3001
WS_PORT=3002
CORS_ORIGIN=http://localhost:3000
DATABASE_PATH=./data/arena.json

# LLM Provider API Keys (optional - uses mock if not provided)
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Per-team Groq keys (optional)
RED_TEAM_GROQ_API_KEY=your_red_team_key
BLUE_TEAM_GROQ_API_KEY=your_blue_team_key

# Kestra Integration (optional)
KESTRA_URL=http://localhost:8080
KESTRA_API_KEY=your_kestra_key_here

# Oumi Integration (optional)
OUMI_API_URL=https://api.oumi.ai
OUMI_API_KEY=your_oumi_api_key_here

# Cline Integration
USE_CLINE=true
```

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

## Step 4: Initialize Database

The database is automatically created on first run. To seed with default agents:

```bash
cd backend
pnpm run seed
```

## Step 5: Start Services

### Development Mode

**Backend:**
```bash
cd backend
pnpm run dev
```

**Frontend:**
```bash
cd frontend
pnpm run dev
```

### Using Automation Scripts

```powershell
# Start all services
.\scripts\start-all.ps1

# Stop all services
.\scripts\stop-all.ps1
```

## Step 6: Verify Installation

```powershell
# Run verification script
.\scripts\verify-setup.ps1

# Or test end-to-end
.\scripts\test-e2e.ps1
```

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 3002 are in use:

1. Change ports in `.env` files
2. Update `CORS_ORIGIN` in backend `.env`
3. Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Database Issues

If database errors occur:

1. Delete `backend/data/arena.json`
2. Restart backend (database will be recreated)
3. Run seed script: `pnpm run seed`

### API Key Issues

The system works without API keys using mock providers. To use real LLMs:

1. Get API keys from providers
2. Add to `backend/.env`
3. Restart backend

## Next Steps

- [Configuration Guide](/getting-started/configuration/) - Configure all settings
- [Quick Start](/getting-started/quick-start/) - Run your first match
