---
title: Quick Start
description: Get the AI Arena up and running in minutes
---

# Quick Start

Get the AI Red vs Blue Arena running in 3 commands.

## Prerequisites

- Node.js 18+ and pnpm (or npm)
- Docker Desktop (for Kestra - optional)
- No API keys required! System works with mock providers
- Optional: Groq/OpenAI/Anthropic API keys for real LLM responses

## Fastest Start (3 Commands)

```powershell
# 1. Check dependencies
.\scripts\check-dependencies.ps1

# 2. Start everything
.\scripts\start-all.ps1

# 3. Test everything
.\scripts\test-e2e.ps1
```

Then open: **http://localhost:3000**

## Manual Setup

### Backend Setup

```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your API keys (optional - will use mock if not provided)
pnpm run dev
```

The backend will run on:
- API: http://localhost:3001
- WebSocket: ws://localhost:3002

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend will run on http://localhost:3000

### Seed Default Agents

```bash
cd backend
tsx src/scripts/seed.ts
```

This creates default Red, Blue, and Target agents with Groq models.

### Kestra Setup (Optional)

```bash
cd kestra
docker-compose up -d
```

Kestra UI will be available at: http://localhost:8080

Import flows from `kestra/flows/ai-arena/all-flows-combined.yml` via the Kestra UI.

## What's Next?

- [Installation Guide](/getting-started/installation/) - Detailed installation steps
- [Configuration](/getting-started/configuration/) - Configure API keys and settings
- [Creating Your First Match](/guides/running-matches/) - Run your first simulation
