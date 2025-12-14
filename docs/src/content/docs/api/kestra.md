---
title: Kestra API
description: Kestra integration API reference
---

# Kestra API

API endpoints for Kestra workflow integration.

## Base URL

```
http://localhost:3001/api/kestra
```

## Trigger Flow

Trigger a Kestra workflow.

### Request

```http
POST /api/kestra/trigger/:flowId
Content-Type: application/json
```

```json
{
  "inputs": {
    "matchId": "AR-2024-0142"
  }
}
```

### Response

```json
{
  "executionId": "exec-123",
  "status": "running"
}
```

## List Executions

Get list of Kestra workflow executions.

### Request

```http
GET /api/kestra/executions
```

### Query Parameters

- `limit` - Limit number of results
- `offset` - Offset for pagination

### Response

```json
[
  {
    "id": "exec-123",
    "flowId": "match-orchestration",
    "status": "success",
    "startedAt": "2024-12-14T10:00:00Z",
    "completedAt": "2024-12-14T10:05:00Z"
  }
]
```

## Get Execution

Get details for a specific execution.

### Request

```http
GET /api/kestra/executions/:id
```

### Response

```json
{
  "id": "exec-123",
  "flowId": "match-orchestration",
  "status": "success",
  "startedAt": "2024-12-14T10:00:00Z",
  "completedAt": "2024-12-14T10:05:00Z",
  "outputs": {
    "matchId": "AR-2024-0142",
    "score": {
      "red": 75,
      "blue": 85
    }
  }
}
```

## Next Steps

- [Kestra Integration](/integrations/kestra/) - Integration guide
