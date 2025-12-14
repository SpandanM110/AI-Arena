---
title: Agents API
description: Complete API reference for agent management
---

# Agents API

Complete API reference for managing agents in the AI Arena.

## Base URL

```
http://localhost:3001/api/agents
```

## List All Agents

Get a list of all agents.

### Request

```http
GET /api/agents
```

### Response

```json
[
  {
    "id": "agent-uuid",
    "name": "Red Team Alpha",
    "type": "red",
    "model": "llama-3.3-70b-versatile",
    "systemPrompt": "You are a red team security researcher...",
    "permissions": ["prompt_manipulation", "sql_injection_testing"],
    "createdAt": "2024-12-14T10:00:00Z",
    "updatedAt": "2024-12-14T10:00:00Z"
  }
]
```

## Get Agent by ID

Get details for a specific agent.

### Request

```http
GET /api/agents/:id
```

### Response

```json
{
  "id": "agent-uuid",
  "name": "Red Team Alpha",
  "type": "red",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "You are a red team security researcher...",
  "permissions": ["prompt_manipulation", "sql_injection_testing"],
  "createdAt": "2024-12-14T10:00:00Z",
  "updatedAt": "2024-12-14T10:00:00Z"
}
```

## Get Available Models

Get a list of all available LLM models.

### Request

```http
GET /api/agents/models
```

### Response

```json
{
  "groq": [
    {
      "id": "llama-3.3-70b-versatile",
      "name": "Llama 3.3 70B Versatile",
      "tier": "powerful",
      "contextWindow": 131072
    }
  ],
  "openai": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "tier": "powerful"
    }
  ],
  "anthropic": [
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "tier": "powerful"
    }
  ]
}
```

## Create Agent

Create a new agent.

### Request

```http
POST /api/agents
Content-Type: application/json
```

```json
{
  "name": "Red Team Alpha",
  "type": "red",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "You are a red team security researcher...",
  "permissions": [
    "prompt_manipulation",
    "sql_injection_testing",
    "http_request"
  ]
}
```

### Agent Types

- `red` - Attack agent
- `blue` - Defense agent
- `target` - Target agent under test

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

### Response

```json
{
  "id": "agent-uuid",
  "name": "Red Team Alpha",
  "type": "red",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "You are a red team security researcher...",
  "permissions": ["prompt_manipulation", "sql_injection_testing"],
  "createdAt": "2024-12-14T10:00:00Z",
  "updatedAt": "2024-12-14T10:00:00Z"
}
```

## Update Agent

Update an existing agent.

### Request

```http
PATCH /api/agents/:id
Content-Type: application/json
```

```json
{
  "name": "Updated Name",
  "systemPrompt": "Updated system prompt...",
  "permissions": ["new_permission"]
}
```

### Response

```json
{
  "id": "agent-uuid",
  "name": "Updated Name",
  "type": "red",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "Updated system prompt...",
  "permissions": ["new_permission"],
  "createdAt": "2024-12-14T10:00:00Z",
  "updatedAt": "2024-12-14T10:30:00Z"
}
```

## Delete Agent

Delete an agent.

### Request

```http
DELETE /api/agents/:id
```

### Response

```json
{
  "success": true,
  "message": "Agent deleted"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": {
    "field": "model",
    "message": "Invalid model ID"
  }
}
```

### 404 Not Found

```json
{
  "error": "Agent not found",
  "id": "agent-uuid"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## Examples

### Create Red Agent

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Team Alpha",
    "type": "red",
    "model": "llama-3.3-70b-versatile",
    "systemPrompt": "You are a red team security researcher...",
    "permissions": ["prompt_manipulation", "sql_injection_testing"]
  }'
```

### Create Blue Agent

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blue Team Defender",
    "type": "blue",
    "model": "mixtral-8x7b-32768",
    "systemPrompt": "You are a blue team defender...",
    "permissions": ["input_sanitization", "context_monitoring"]
  }'
```

### List All Agents

```bash
curl http://localhost:3001/api/agents
```

### Get Available Models

```bash
curl http://localhost:3001/api/agents/models
```

## Next Steps

- [Matches API](/api/matches/) - Create and manage matches
- [Creating Agents Guide](/guides/creating-agents/) - Best practices for creating agents
