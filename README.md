# AI Red vs Blue Arena

A self-contained adversarial simulation platform where AI agents attack and defend each other to test robustness, security, alignment, and reasoning integrity.

## Overview

The AI Red vs Blue Arena creates a continuous loop of:
1. **Attack Generation (Red)** - AI agents attempt to exploit vulnerabilities
2. **Defense + Hardening (Blue)** - AI agents defend and patch vulnerabilities
3. **Evaluation & Scoring** - Automated scoring and analysis
4. **Retraining & Improvement** - Integration with Oumi for model fine-tuning
5. **Continuous Simulation + Monitoring** - Real-time dashboards and alerts

## Architecture

- **Frontend**: Next.js dashboard with real-time visualization
- **Backend**: Express.js API server with WebSocket support
- **Database**: lowdb (JSON-based) for persistence
- **LLM Integration**: Groq (recommended), OpenAI, and Anthropic (with mock fallback)
- **Tool Execution**: Cline for agent tool execution and sandboxing
- **Orchestration**: Kestra workflows + custom match runner
- **Training**: Oumi integration stubs for fine-tuning

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- Docker Desktop (for Kestra - optional)
- No API keys required! System works with mock providers
- Optional: Groq/OpenAI/Anthropic API keys for real LLM responses

### Fastest Start (3 Commands)

```powershell
# 1. Check dependencies
.\scripts\check-dependencies.ps1

# 2. Start everything
.\scripts\start-all.ps1

# 3. Test everything
.\scripts\test-e2e.ps1
```

Then open: http://localhost:3000

### Manual Setup

#### Backend Setup

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

#### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend will run on http://localhost:3000

#### Seed Default Agents

```bash
cd backend
tsx src/scripts/seed.ts
```

This creates default Red, Blue, and Target agents with Groq models.

#### Kestra Setup (Optional)

```bash
cd kestra
docker-compose up -d
```

Kestra UI will be available at: http://localhost:8080

Import flows from `kestra/flows/ai-arena/all-flows-combined.yml` via the Kestra UI.

## Project Structure

```
.
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utilities and API client
├── backend/              # Express.js backend
│   ├── src/
│   │   ├── agents/       # Agent execution and LLM providers
│   │   ├── cline/        # Cline tool execution layer
│   │   ├── database/     # Database schema and models
│   │   ├── kestra/       # Kestra client integration
│   │   ├── orchestration/ # Match runner
│   │   ├── routes/       # API routes
│   │   ├── scoring/      # Evaluation system
│   │   └── websocket/    # WebSocket server
│   └── data/             # Database files (created on first run)
├── kestra/               # Kestra orchestration
│   ├── docker-compose.yml
│   └── flows/            # Kestra workflow definitions
├── scripts/              # Automation scripts
└── Plan.md               # Detailed project documentation
```

## Configuration

### Backend Environment Variables

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
# Oumi API URL if using Oumi cloud service
OUMI_API_URL=https://api.oumi.ai
OUMI_API_KEY=your_oumi_api_key_here

# Cline Integration
USE_CLINE=true
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

### Kestra Environment Variables

The `kestra/docker-compose.yml` uses:
- `ARENA_API_URL`: Backend API URL (default: http://host.docker.internal:3001)
- Uses `host.docker.internal` to access host services from Docker container
- Can be overridden by setting `ARENA_API_URL` environment variable before running `docker-compose up`

## Features

### Agent Management

- Create Red, Blue, and Target agents with custom system prompts
- Support for multiple LLM providers (Groq, OpenAI, Anthropic)
- Model selection with 13+ Groq models available
- Automatic model fallback on rate limits
- Per-agent API key configuration

### Match Execution

- Multiple match modes: quick, standard, deep, continuous
- Real-time event streaming via WebSocket
- Automated scoring and winner determination
- Round-by-round attack/defense cycles
- Match transcripts and event logs

### LLM Integration

**Groq (Recommended)**
- 13+ models available (Llama, Mixtral, Gemma, Qwen, DeepSeek)
- Fast inference with high throughput
- Automatic model rotation on rate limits
- See `GROQ_MODELS_REFERENCE.md` for complete model list

**OpenAI & Anthropic**
- Full support for GPT-4, Claude models
- Automatic fallback to mock provider if keys not configured

**Mock Provider**
- Works without API keys for testing
- Simulates LLM responses for development

### Cline Tool Execution

- Sandboxed tool execution for agents
- Permission-based access control
- Tool call logging and audit trail
- Support for HTTP requests, SQL injection testing, prompt manipulation, and more
- See `CLINE_INTEGRATION.md` for details

### Kestra Orchestration

- Match orchestration workflows
- Scheduled and continuous monitoring
- Dataset generation for training
- Agent fine-tuning pipelines
- Batch evaluation workflows
- See `KESTRA_INTEGRATION.md` for details

### Oumi Integration

- Training dataset export in Oumi-compatible format (SFT chat format)
- Fine-tuning job submission via Oumi API or CLI
- Support for LoRA, QLoRA, and full fine-tuning
- Integration with Oumi's distributed training (local, Kubernetes, cloud)
- See [Oumi Documentation](https://oumi.ai/docs/en/latest/index.html) for details
- Configure `OUMI_API_URL` and `OUMI_API_KEY` in backend `.env` for API integration

## API Documentation

### Agents

- `GET /api/agents` - List all agents
- `GET /api/agents/models` - Get available models
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Matches

- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create and start new match
- `GET /api/matches/:id/events` - Get match events
- `GET /api/matches/:id/transcript` - Get full transcript
- `POST /api/matches/:id/pause` - Pause match
- `POST /api/matches/:id/resume` - Resume match

### Events

- `GET /api/events` - Get recent events
- `GET /api/events/:id` - Get event details

### Configuration

- `GET /api/config/config` - Get current configuration
- `POST /api/config/keys` - Update API keys (BYOK)
- `POST /api/config/kestra` - Update Kestra configuration
- `DELETE /api/config/keys` - Clear API keys

### Kestra

- `POST /api/kestra/trigger/:flowId` - Trigger Kestra flow
- `GET /api/kestra/executions` - List executions
- `GET /api/kestra/executions/:id` - Get execution details

### Oumi

- `POST /api/oumi/export-dataset` - Export training dataset
- `POST /api/oumi/fine-tune` - Trigger fine-tuning (stub)
- `GET /api/oumi/fine-tune/:jobId` - Get fine-tuning job status

## WebSocket API

Connect to `ws://localhost:3002` for real-time updates.

### Subscribe to Match

```json
{
  "type": "subscribe",
  "matchId": "AR-2024-0142"
}
```

### Unsubscribe

```json
{
  "type": "unsubscribe",
  "matchId": "AR-2024-0142"
}
```

### Receive Events

```json
{
  "type": "event",
  "data": {
    "id": "evt-123",
    "matchId": "AR-2024-0142",
    "type": "attack",
    "agentId": "agent-uuid",
    "agentName": "Red Team Alpha",
    "severity": "high",
    "prompt": "...",
    "outcome": "success",
    "timestamp": "2024-12-14T10:00:00Z"
  }
}
```

### Match Updates

```json
{
  "type": "match_update",
  "matchId": "AR-2024-0142",
  "data": {
    "status": "running",
    "currentRound": 5,
    "score": {
      "attacks": 5,
      "defenses": 4,
      "severity": 7.5
    }
  }
}
```

## Usage

### 1. Create Agents

Via UI:
- Navigate to Agents page
- Click "Create Agent"
- Select agent type (Red/Blue/Target)
- Choose model from dropdown (shows all available models with IDs)
- Enter system prompt
- Save

Via API:
```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Team Alpha",
    "type": "red",
    "model": "llama-3.3-70b-versatile",
    "systemPrompt": "You are a red team security researcher...",
    "permissions": ["http_request", "prompt_manipulation"]
  }'
```

### 2. Start Match

Via UI:
- Navigate to Matches page
- Click "Create Match"
- Select Red, Blue, and Target agents
- Choose match mode
- Start match

Via API:
```bash
curl -X POST http://localhost:3001/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "redAgentId": "agent-uuid",
    "blueAgentId": "agent-uuid",
    "targetAgentId": "agent-uuid",
    "mode": "standard"
  }'
```

### 3. Monitor Real-Time

- Dashboard shows live events
- WebSocket provides real-time updates
- Match status updates automatically
- Event timeline with severity indicators

### 4. Analyze Results

- View match transcript
- Review event details
- Check scoring breakdown
- Export dataset for training

### 5. Fine-Tune Agents

- Use Oumi integration to export training datasets
- Submit fine-tuning jobs
- Deploy improved models
- Test new agent configurations

## Available Models

The system supports 13+ Groq models across three tiers:

**Powerful Tier:**
- `llama-3.3-70b-versatile` - Most capable Llama 3.3 model
- `llama-3.1-405b-reasoning` - Ultra-powerful reasoning
- `mixtral-8x22b-instruct` - Large Mixtral model
- `qwen-2.5-72b-instruct` - Large Qwen model

**Balanced Tier:**
- `mixtral-8x7b-32768` - High-quality mixture of experts
- `qwen-2.5-32b-instruct` - Medium Qwen model
- `qwen-2.5-14b-instruct` - Small Qwen model
- `gemma2-9b-it` - Gemma 2 9B model
- `deepseek-r1-distill-llama-8b` - DeepSeek reasoning
- `deepseek-chat` - DeepSeek chat model

**Fast Tier:**
- `llama-3.1-8b-instant` - Fast 8B model
- `qwen-2.5-7b-instruct` - Compact Qwen model
- `gemma-7b-it` - Fast Gemma model

See `GROQ_MODELS_REFERENCE.md` for complete details.

## Model Fallback System

The system automatically handles rate limits and decommissioned models:

1. Try primary model
2. If rate limited, try same-tier models
3. If still rate limited, try lower-tier models
4. If all models fail, fall back to mock provider

This ensures matches continue even when rate limits are hit.

## Security

- All agent interactions are sandboxed
- No external network access beyond configured APIs
- Rate limiting on agent actions
- Input validation and sanitization
- Permission-based tool access control
- Audit logging for all tool executions

## Development

### Backend Development

```bash
cd backend
pnpm install
pnpm run dev  # Development with hot reload
pnpm run build  # Build for production
pnpm run seed  # Seed default agents
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm run dev  # Development server
pnpm run build  # Build for production
pnpm run start  # Production server
```

### Testing

```bash
# End-to-end test
.\scripts\test-e2e.ps1

# Integration test
.\scripts\test-integration.ps1

# Verify setup
.\scripts\verify-setup.ps1
```

## Troubleshooting

### Backend Not Starting

- Check if port 3001 is available
- Verify database directory exists
- Check environment variables
- Review error logs

### Frontend Not Connecting

- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors
- Verify CORS settings

### WebSocket Not Working

- Check if port 3002 is available
- Verify WebSocket server started
- Check browser WebSocket connection
- Review WebSocket server logs

### Kestra Flows Not Executing

- Verify Kestra is running: `curl http://localhost:8080/api/v1/configs`
- Check `ARENA_API_URL` in docker-compose.yml
- Verify flows are imported in Kestra UI
- Check execution logs in Kestra UI

### Model Rate Limits

- System automatically tries fallback models
- Wait for rate limit reset (usually daily)
- Upgrade Groq plan for higher limits
- Use different API keys for different teams

## Scripts Reference

All automation scripts are in the `scripts/` directory:

- `check-dependencies.ps1` - Verify all dependencies are installed
- `start-all.ps1` - Start backend, frontend, and Kestra
- `stop-all.ps1` - Stop all services
- `test-e2e.ps1` - End-to-end testing
- `test-integration.ps1` - Integration testing
- `verify-setup.ps1` - Verify complete setup
- `setup-complete.ps1` - Complete setup automation

## Documentation

- **Plan.md**: Comprehensive technical and product documentation
- **GROQ_MODELS_REFERENCE.md**: Complete list of available Groq models
- **CLINE_INTEGRATION.md**: Cline tool execution layer guide
- **KESTRA_INTEGRATION.md**: Complete Kestra integration guide
- **backend/README.md**: Backend API documentation
- **kestra/README.md**: Kestra flows documentation

## Contributing

This is a prototype implementation. Contributions welcome!

## License

MIT

## Roadmap

- [x] Full Kestra integration
- [x] Groq model integration with fallback
- [x] Cline tool execution layer
- [x] Model selector in frontend
- [x] Automatic model rotation
- [ ] Complete Oumi fine-tuning pipeline
- [ ] Advanced scoring algorithms
- [ ] Multi-agent scenarios
- [ ] Custom attack/defense strategies
- [ ] Export/import agent configurations
- [ ] Performance optimizations
- [ ] Comprehensive test suite
