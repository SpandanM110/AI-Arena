---
title: API Client
description: Frontend API integration
---

# API Client

The frontend uses a custom API client for backend communication.

## API Client (`lib/api.ts`)

Provides methods for:
- Agent CRUD operations
- Match management
- Event queries
- WebSocket connections

## Usage

```typescript
import { api } from '@/lib/api';

// Get all agents
const agents = await api.getAgents();

// Create agent
const agent = await api.createAgent({
  name: 'Red Team Alpha',
  type: 'red',
  model: 'llama-3.3-70b-versatile',
  systemPrompt: '...'
});

// Create match
const match = await api.createMatch({
  redAgentId: '...',
  blueAgentId: '...',
  targetAgentId: '...',
  mode: 'standard'
});
```

## WebSocket Integration

The API client also handles WebSocket connections for real-time updates.

## Next Steps

- [Pages](/frontend/pages/) - Page components
- [Components](/frontend/components/) - React components
