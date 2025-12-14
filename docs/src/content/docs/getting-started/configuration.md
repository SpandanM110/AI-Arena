---
title: Configuration
description: Complete configuration guide for the AI Arena
---

# Configuration

Complete guide to configuring the AI Red vs Blue Arena.

## Backend Configuration

### Environment Variables

All backend configuration is done via `backend/.env`:

#### Server Settings

```env
PORT=3001                    # API server port
WS_PORT=3002                  # WebSocket server port
CORS_ORIGIN=http://localhost:3000  # Allowed CORS origin
DATABASE_PATH=./data/arena.json    # Database file path
```

#### LLM Provider API Keys

```env
# General API keys (used by all agents)
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Per-team API keys (optional, overrides general keys)
RED_TEAM_GROQ_API_KEY=your_red_team_key
BLUE_TEAM_GROQ_API_KEY=your_blue_team_key
```

**Note**: If no API keys are provided, the system uses mock providers for testing.

#### Cline Integration

```env
USE_CLINE=true  # Enable/disable Cline tool execution (default: true)
```

When enabled, agents can execute tools in a sandboxed environment.

#### Kestra Integration

```env
KESTRA_URL=http://localhost:8080
KESTRA_API_KEY=your_kestra_key_here
```

Leave unset to disable Kestra integration.

#### Oumi Integration

```env
OUMI_API_URL=https://api.oumi.ai
OUMI_API_KEY=your_oumi_api_key_here
```

Leave unset to disable Oumi integration.

## Frontend Configuration

### Environment Variables

All frontend configuration is in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

## Kestra Configuration

### Docker Compose

The `kestra/docker-compose.yml` uses:

```yaml
environment:
  - ARENA_API_URL=http://host.docker.internal:3001
```

This allows Kestra (running in Docker) to access the backend API on the host.

### Override Arena API URL

```bash
# Set environment variable before starting
$env:ARENA_API_URL="http://your-backend-url:3001"
docker-compose up -d
```

## Agent Configuration

### Creating Agents

Agents are configured via the API or UI:

```json
{
  "name": "Red Team Alpha",
  "type": "red",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "You are a red team security researcher...",
  "permissions": [
    "http_request",
    "prompt_manipulation",
    "sql_injection_testing"
  ]
}
```

### Model Selection

See [Groq Models Reference](/integrations/groq/) for available models.

The system automatically handles:
- Model fallback on rate limits
- Tier-based fallback (powerful → balanced → fast)
- Mock provider fallback if all models fail

### Permissions

Available permissions:
- `http_request` - Make HTTP requests
- `prompt_manipulation` - Craft prompt injections
- `sql_injection_testing` - Test SQL injection
- `code_execution` - Execute code in sandbox
- `input_sanitization` - Sanitize inputs
- `context_monitoring` - Monitor context
- `instruction_enforcement` - Enforce instructions
- `file_operations` - File operations
- `network_access` - Network access
- `tool_execution` - General tool execution

## Match Configuration

### Match Modes

- **quick**: 5 rounds, 1 second delay
- **standard**: 10 rounds, 2 second delay
- **deep**: 20 rounds, 3 second delay
- **continuous**: Unlimited rounds, 5 second delay

### Match Options

```json
{
  "redAgentId": "agent-uuid",
  "blueAgentId": "agent-uuid",
  "targetAgentId": "agent-uuid",
  "mode": "standard",
  "maxRounds": 10,
  "roundDelay": 2000
}
```

## API Key Management (BYOK)

You can update API keys at runtime via the API:

```bash
POST /api/config/keys
{
  "groq": "new_key",
  "openai": "new_key"
}
```

Keys are stored in memory and lost on restart. For persistence, update `.env` file.

## Security Configuration

### Sandbox Settings

Cline runs in sandbox mode by default:
- External HTTP requests blocked
- File operations limited to sandbox directory
- Code execution in isolated environment
- All operations logged

### CORS Configuration

Configure allowed origins in `backend/.env`:

```env
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

## Best Practices

1. **Use per-team API keys** for better rate limit management
2. **Enable Cline** for realistic tool execution testing
3. **Configure Kestra** for automated workflows
4. **Set up Oumi** for fine-tuning pipeline
5. **Use environment-specific configs** (dev, staging, prod)

## Next Steps

- [API Reference](/api/agents/) - Learn about the API
- [Creating Agents](/guides/creating-agents/) - Create your first agent
