---
title: Kestra Integration
description: Kestra workflow orchestration integration
---

# Kestra Integration

Kestra provides workflow orchestration for automated match execution and monitoring.

## Overview

Kestra integration enables:
- Scheduled matches
- Continuous monitoring
- Batch evaluation
- Dataset generation
- Agent fine-tuning pipelines

## Setup

1. Start Kestra:
```bash
cd kestra
docker-compose up -d
```

2. Import flows from `kestra/flows/ai-arena/all-flows-combined.yml`

3. Configure backend:
```env
KESTRA_URL=http://localhost:8080
KESTRA_API_KEY=your_key
```

## Available Flows

- **Match Orchestration**: Automated match execution
- **Scheduled Matches**: Time-based match triggers
- **Batch Evaluation**: Multiple match evaluation
- **Dataset Generation**: Training dataset creation
- **Agent Fine-tuning**: Fine-tuning pipelines
- **Continuous Monitoring**: 24/7 monitoring

## API Integration

The backend provides Kestra API endpoints:
- `POST /api/kestra/trigger/:flowId` - Trigger flow
- `GET /api/kestra/executions` - List executions
- `GET /api/kestra/executions/:id` - Get execution

## Next Steps

- [Kestra API](/api/kestra/) - Complete API reference
- [Deployment](/deployment/kestra/) - Kestra deployment guide
