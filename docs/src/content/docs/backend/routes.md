---
title: Routes & API
description: Complete API route documentation
---

# Routes & API

Complete documentation for all API routes.

## Route Structure

All routes are prefixed with `/api`:

- `/api/agents` - Agent management
- `/api/matches` - Match operations
- `/api/events` - Event queries
- `/api/config` - Configuration
- `/api/kestra` - Kestra integration
- `/api/oumi` - Oumi integration

## Route Handlers

### Agents Routes

Located in `backend/src/routes/agents.ts`:

- `GET /api/agents` - List all agents
- `GET /api/agents/models` - Get available models
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Matches Routes

Located in `backend/src/routes/matches.ts`:

- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create and start match
- `GET /api/matches/:id/events` - Get match events
- `GET /api/matches/:id/transcript` - Get match transcript
- `POST /api/matches/:id/pause` - Pause match
- `POST /api/matches/:id/resume` - Resume match
- `POST /api/matches/:id/stop` - Stop match

### Events Routes

Located in `backend/src/routes/events.ts`:

- `GET /api/events` - List recent events
- `GET /api/events/:id` - Get event by ID

### Config Routes

Located in `backend/src/routes/config.ts`:

- `GET /api/config/config` - Get configuration
- `POST /api/config/keys` - Update API keys
- `POST /api/config/kestra` - Update Kestra config
- `DELETE /api/config/keys` - Clear API keys

### Kestra Routes

Located in `backend/src/routes/kestra.ts`:

- `POST /api/kestra/trigger/:flowId` - Trigger flow
- `GET /api/kestra/executions` - List executions
- `GET /api/kestra/executions/:id` - Get execution

### Oumi Routes

Located in `backend/src/routes/oumi.ts`:

- `POST /api/oumi/export-dataset` - Export dataset
- `POST /api/oumi/fine-tune` - Trigger fine-tuning
- `GET /api/oumi/fine-tune/:jobId` - Get job status

## Error Handling

All routes use consistent error handling:

```typescript
try {
  // Route logic
} catch (error) {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Validation

Routes validate input using Zod schemas:

```typescript
const createAgentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['red', 'blue', 'target']),
  model: z.string(),
  systemPrompt: z.string(),
  permissions: z.array(z.string()).optional()
});
```

## Authentication

Currently, the API has no authentication. For production:

1. Add authentication middleware
2. Protect sensitive routes
3. Implement API key or JWT tokens

## CORS

CORS is configured in `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
```

## Next Steps

- [Agents API](/api/agents/) - Complete agents API reference
- [Matches API](/api/matches/) - Complete matches API reference
- [Events API](/api/events/) - Complete events API reference
