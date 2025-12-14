---
title: WebSocket Server
description: Real-time event broadcasting via WebSocket
---

# WebSocket Server

The WebSocket server provides real-time event broadcasting for match updates.

## Architecture

The WebSocket server runs on a separate port (default: 3002) and broadcasts events to subscribed clients.

## Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:3002');
```

## Subscribing to Matches

Subscribe to receive events for a specific match:

```json
{
  "type": "subscribe",
  "matchId": "AR-2024-0142"
}
```

## Unsubscribing

Unsubscribe from a match:

```json
{
  "type": "unsubscribe",
  "matchId": "AR-2024-0142"
}
```

## Event Types

### Event Message

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

## Implementation

The WebSocket server uses the `ws` library and integrates with the Match Runner's subscription system.

## Next Steps

- [WebSocket API](/api/websocket/) - Complete API reference
- [Running Matches](/guides/running-matches/) - Using WebSocket in matches
