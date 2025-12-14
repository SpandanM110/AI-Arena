---
title: Events API
description: Complete API reference for event queries
---

# Events API

Complete API reference for querying match events.

## Base URL

```
http://localhost:3001/api/events
```

## List Recent Events

Get recent events across all matches.

### Request

```http
GET /api/events
```

### Query Parameters

- `limit` - Limit number of results (default: 50)
- `offset` - Offset for pagination (default: 0)
- `type` - Filter by event type (attack, defense, target_response)
- `severity` - Filter by severity (low, medium, high, critical)

### Response

```json
[
  {
    "id": "evt-123",
    "matchId": "AR-2024-0142",
    "roundNumber": 1,
    "type": "attack",
    "agentId": "agent-uuid",
    "agentName": "Red Team Alpha",
    "severity": "high",
    "prompt": "Attack prompt...",
    "outcome": "success",
    "timestamp": "2024-12-14T10:01:00Z"
  }
]
```

## Get Event by ID

Get details for a specific event.

### Request

```http
GET /api/events/:id
```

### Response

```json
{
  "id": "evt-123",
  "matchId": "AR-2024-0142",
  "roundNumber": 1,
  "type": "attack",
  "agentId": "agent-uuid",
  "agentName": "Red Team Alpha",
  "severity": "high",
  "prompt": "Attack prompt...",
  "outcome": "success",
  "toolCalls": [
    {
      "tool": "sql_injection",
      "params": "...",
      "result": {
        "success": true,
        "output": "..."
      }
    }
  ],
  "timestamp": "2024-12-14T10:01:00Z"
}
```

## Next Steps

- [Matches API](/api/matches/) - Match operations
- [WebSocket API](/api/websocket/) - Real-time events
