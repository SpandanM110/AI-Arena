---
title: WebSocket API
description: Real-time WebSocket API reference
---

# WebSocket API

Complete reference for the WebSocket API for real-time updates.

## Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:3002');
```

## Subscribe to Match

Subscribe to receive events for a specific match:

```json
{
  "type": "subscribe",
  "matchId": "AR-2024-0142"
}
```

## Unsubscribe

Unsubscribe from a match:

```json
{
  "type": "unsubscribe",
  "matchId": "AR-2024-0142"
}
```

## Event Messages

### Event

```json
{
  "type": "event",
  "data": {
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
      "blue": 45,
      "winner": "blue"
    }
  }
}
```

## Example Usage

```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = () => {
  // Subscribe to match
  ws.send(JSON.stringify({
    type: 'subscribe',
    matchId: 'AR-2024-0142'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'event') {
    console.log('New event:', data.data);
  } else if (data.type === 'match_update') {
    console.log('Match update:', data.data);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

## Next Steps

- [Matches API](/api/matches/) - Match operations
- [Events API](/api/events/) - Event queries
