---
title: Kestra Setup
description: Kestra deployment guide
---

# Kestra Setup

Guide to setting up Kestra orchestration.

## Prerequisites

- Docker and Docker Compose
- Backend API accessible

## Local Setup

```bash
cd kestra
docker-compose up -d
```

Kestra UI: http://localhost:8080

## Configuration

Set `ARENA_API_URL` in `docker-compose.yml`:

```yaml
environment:
  - ARENA_API_URL=http://your-backend-api:3001
```

## Import Flows

1. Open Kestra UI
2. Navigate to Flows
3. Import `kestra/flows/ai-arena/all-flows-combined.yml`

## Production Deployment

For production, use:
- Persistent volumes for storage
- Environment-specific configuration
- Secure API keys
- Monitoring and logging

## Next Steps

- [Kestra Integration](/integrations/kestra/) - Integration guide
