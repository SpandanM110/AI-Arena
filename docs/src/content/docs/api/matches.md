---
title: Matches API
description: Complete API reference for match management
---

# Matches API

Complete API reference for managing matches in the AI Arena.

## Base URL

```
http://localhost:3001/api/matches
```

## List All Matches

Get a list of all matches.

### Request

```http
GET /api/matches
```

### Query Parameters

- `status` - Filter by status (pending, running, completed, stopped, error)
- `limit` - Limit number of results (default: 50)
- `offset` - Offset for pagination (default: 0)

### Response

```json
[
  {
    "id": "AR-2024-0142",
    "redAgentId": "agent-uuid",
    "blueAgentId": "agent-uuid",
    "targetAgentId": "agent-uuid",
    "status": "completed",
    "mode": "standard",
    "score": {
      "red": 75,
      "blue": 85,
      "winner": "blue"
    },
    "currentRound": 10,
    "maxRounds": 10,
    "createdAt": "2024-12-14T10:00:00Z",
    "startedAt": "2024-12-14T10:01:00Z",
    "completedAt": "2024-12-14T10:15:00Z"
  }
]
```

## Get Match by ID

Get details for a specific match.

### Request

```http
GET /api/matches/:id
```

### Response

```json
{
  "id": "AR-2024-0142",
  "redAgentId": "agent-uuid",
  "blueAgentId": "agent-uuid",
  "targetAgentId": "agent-uuid",
  "redAgent": {
    "id": "agent-uuid",
    "name": "Red Team Alpha"
  },
  "blueAgent": {
    "id": "agent-uuid",
    "name": "Blue Team Defender"
  },
  "targetAgent": {
    "id": "agent-uuid",
    "name": "Target Agent"
  },
  "status": "completed",
  "mode": "standard",
  "score": {
    "red": 75,
    "blue": 85,
    "winner": "blue"
  },
  "currentRound": 10,
  "maxRounds": 10,
  "createdAt": "2024-12-14T10:00:00Z",
  "startedAt": "2024-12-14T10:01:00Z",
  "completedAt": "2024-12-14T10:15:00Z"
}
```

## Create and Start Match

Create a new match and start it immediately.

### Request

```http
POST /api/matches
Content-Type: application/json
```

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

### Match Modes

- `quick` - 5 rounds, 1 second delay
- `standard` - 10 rounds, 2 second delay
- `deep` - 20 rounds, 3 second delay
- `continuous` - Unlimited rounds, 5 second delay

### Response

```json
{
  "id": "AR-2024-0142",
  "redAgentId": "agent-uuid",
  "blueAgentId": "agent-uuid",
  "targetAgentId": "agent-uuid",
  "status": "running",
  "mode": "standard",
  "currentRound": 0,
  "maxRounds": 10,
  "createdAt": "2024-12-14T10:00:00Z",
  "startedAt": "2024-12-14T10:00:01Z"
}
```

## Get Match Events

Get all events for a match.

### Request

```http
GET /api/matches/:id/events
```

### Query Parameters

- `type` - Filter by event type (attack, defense, target_response)
- `round` - Filter by round number
- `limit` - Limit number of results
- `offset` - Offset for pagination

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
]
```

## Get Match Transcript

Get the full transcript for a match.

### Request

```http
GET /api/matches/:id/transcript
```

### Response

```json
{
  "matchId": "AR-2024-0142",
  "rounds": [
    {
      "roundNumber": 1,
      "attack": {
        "agent": "Red Team Alpha",
        "prompt": "Attack prompt...",
        "response": "Attack response..."
      },
      "target": {
        "agent": "Target Agent",
        "response": "Target response..."
      },
      "defense": {
        "agent": "Blue Team Defender",
        "response": "Defense response...",
        "patch": "Suggested patch..."
      },
      "score": {
        "red": 8,
        "blue": 9,
        "winner": "blue"
      }
    }
  ]
}
```

## Pause Match

Pause a running match.

### Request

```http
POST /api/matches/:id/pause
```

### Response

```json
{
  "success": true,
  "matchId": "AR-2024-0142",
  "status": "paused"
}
```

## Resume Match

Resume a paused match.

### Request

```http
POST /api/matches/:id/resume
```

### Response

```json
{
  "success": true,
  "matchId": "AR-2024-0142",
  "status": "running"
}
```

## Stop Match

Stop a running or paused match.

### Request

```http
POST /api/matches/:id/stop
```

### Response

```json
{
  "success": true,
  "matchId": "AR-2024-0142",
  "status": "stopped"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": {
    "field": "redAgentId",
    "message": "Agent not found"
  }
}
```

### 404 Not Found

```json
{
  "error": "Match not found",
  "id": "AR-2024-0142"
}
```

### 409 Conflict

```json
{
  "error": "Match already running",
  "matchId": "AR-2024-0142"
}
```

## Examples

### Create and Start Match

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

### Get Match Details

```bash
curl http://localhost:3001/api/matches/AR-2024-0142
```

### Get Match Events

```bash
curl http://localhost:3001/api/matches/AR-2024-0142/events
```

### Pause Match

```bash
curl -X POST http://localhost:3001/api/matches/AR-2024-0142/pause
```

## WebSocket Events

When subscribed to a match via WebSocket, you'll receive:

### Match Update

```json
{
  "type": "match_update",
  "matchId": "AR-2024-0142",
  "data": {
    "status": "running",
    "currentRound": 5,
    "score": {
      "red": 40,
      "blue": 45
    }
  }
}
```

### Event

```json
{
  "type": "event",
  "data": {
    "id": "evt-123",
    "matchId": "AR-2024-0142",
    "type": "attack",
    "agentName": "Red Team Alpha",
    "severity": "high",
    "timestamp": "2024-12-14T10:01:00Z"
  }
}
```

## Next Steps

- [WebSocket API](/api/websocket/) - Real-time event subscriptions
- [Running Matches Guide](/guides/running-matches/) - How to run matches effectively
