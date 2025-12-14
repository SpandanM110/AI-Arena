---
title: Config API
description: Configuration management API
---

# Config API

API for managing system configuration.

## Base URL

```
http://localhost:3001/api/config
```

## Get Configuration

Get current system configuration.

### Request

```http
GET /api/config/config
```

### Response

```json
{
  "kestra": {
    "url": "http://localhost:8080",
    "enabled": true
  },
  "cline": {
    "enabled": true
  }
}
```

## Update API Keys

Update LLM provider API keys at runtime.

### Request

```http
POST /api/config/keys
Content-Type: application/json
```

```json
{
  "groq": "new_groq_key",
  "openai": "new_openai_key",
  "anthropic": "new_anthropic_key",
  "redTeamGroq": "red_team_key",
  "blueTeamGroq": "blue_team_key"
}
```

### Response

```json
{
  "success": true,
  "message": "API keys updated"
}
```

## Update Kestra Configuration

Update Kestra integration settings.

### Request

```http
POST /api/config/kestra
Content-Type: application/json
```

```json
{
  "url": "http://localhost:8080",
  "apiKey": "new_key"
}
```

## Clear API Keys

Clear all API keys from memory.

### Request

```http
DELETE /api/config/keys
```

### Response

```json
{
  "success": true,
  "message": "API keys cleared"
}
```

## Next Steps

- [Configuration Guide](/getting-started/configuration/) - Configuration details
