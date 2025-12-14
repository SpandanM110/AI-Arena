# Kestra Integration Guide

Complete guide for integrating Kestra workflow orchestration with the AI Red vs Blue Arena.

## Overview

Kestra provides advanced orchestration capabilities for:
- Automated match execution and monitoring
- Scheduled and continuous evaluation
- Dataset generation for training
- Agent fine-tuning pipelines
- Batch evaluation workflows

## Quick Start

### 1. Start Kestra

Using Docker Compose:
```bash
cd kestra
docker-compose up -d
```

Kestra UI will be available at: http://localhost:8080

### 2. Configure Backend

Add to `backend/.env`:
```env
KESTRA_URL=http://localhost:8080
KESTRA_API_KEY=your_api_key_here  # Optional
```

### 3. Deploy Flows

Copy flow files to Kestra:
```bash
# Option 1: Copy to Kestra flows directory
cp kestra/flows/*.yml /path/to/kestra/flows/ai-arena/

# Option 2: Use Kestra UI to import flows
# Navigate to http://localhost:8080 and import each flow
```

## Available Flows

### 1. Match Orchestration

**Flow ID:** `match-orchestration`

Orchestrates a complete match with real-time monitoring.

**Trigger via API:**
```bash
POST /api/kestra/trigger/match
{
  "redAgentId": "uuid",
  "blueAgentId": "uuid",
  "targetAgentId": "uuid",
  "mode": "standard"
}
```

**Direct Kestra API:**
```bash
curl -X POST http://localhost:8080/api/v1/executions \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "ai-arena",
    "flowId": "match-orchestration",
    "inputs": {
      "red_agent_id": "uuid",
      "blue_agent_id": "uuid",
      "target_agent_id": "uuid",
      "match_mode": "standard"
    }
  }'
```

### 2. Scheduled Matches

**Flow ID:** `scheduled-matches`

Runs matches automatically on a schedule.

**Configuration:**
- Default: Every 6 hours
- Customize via cron expression in flow inputs

**Trigger:**
```bash
POST /api/kestra/trigger/scheduled
{
  "cronExpression": "0 */6 * * *"  # Optional
}
```

### 3. Continuous Monitoring

**Flow ID:** `continuous-monitoring`

24/7 monitoring with automated alerting.

**Trigger:**
```bash
POST /api/kestra/trigger/monitoring
{
  "targetAgentId": "uuid",
  "intervalMinutes": 60
}
```

### 4. Dataset Generation

**Flow ID:** `dataset-generation`

Generates training datasets from match results.

**Trigger:**
```bash
POST /api/kestra/trigger/dataset
{
  "matchIds": ["match-id-1", "match-id-2"],  # Optional
  "minSeverity": 5.0
}
```

### 5. Agent Fine-tuning

**Flow ID:** `agent-fine-tuning`

Complete fine-tuning pipeline.

**Trigger:**
```bash
POST /api/kestra/trigger/fine-tune
{
  "agentId": "uuid",
  "agentType": "red",
  "trainingMatchesCount": 50
}
```

### 6. Batch Evaluation

**Flow ID:** `batch-evaluation`

Parallel evaluation of multiple agent combinations.

**Trigger:**
```bash
POST /api/kestra/trigger/batch-evaluation
{
  "agentCombinations": [
    {
      "redAgentId": "uuid",
      "blueAgentId": "uuid",
      "targetAgentId": "uuid"
    }
  ],
  "matchesPerCombination": 3
}
```

## Monitoring Executions

### Get Execution Status

```bash
GET /api/kestra/executions/:id
```

### List Executions

```bash
GET /api/kestra/executions?namespace=ai-arena&flowId=match-orchestration&limit=100
```

### Via Kestra UI

Navigate to http://localhost:8080/executions to view all executions.

## Webhook Integration

Kestra can trigger flows via webhook:

```bash
POST /api/kestra/webhook/:flowId
{
  "input1": "value1",
  "input2": "value2"
}
```

## Flow Architecture

```
match-orchestration (core flow)
  ├── scheduled-matches (uses match-orchestration)
  ├── continuous-monitoring (uses match-orchestration)
  └── batch-evaluation (uses match-orchestration)

dataset-generation
  └── agent-fine-tuning (uses dataset-generation + match-orchestration)
```

## Environment Variables

### Kestra Configuration

Set in Kestra environment or flow inputs:

```env
ARENA_API_URL=http://localhost:3001
OUMI_API_URL=http://localhost:3002  # Optional
```

### Backend Configuration

```env
KESTRA_URL=http://localhost:8080
KESTRA_API_KEY=your_key  # Optional, for authentication
```

## Best Practices

1. **Start Small**: Test individual flows before scheduling
2. **Monitor Resources**: Batch evaluations can be intensive
3. **Use Appropriate Modes**: Quick for testing, standard for production
4. **Set Alerts**: Configure monitoring thresholds appropriately
5. **Regular Exports**: Export datasets regularly for training
6. **Version Control**: Keep flow files in version control

## Troubleshooting

### Flows Not Executing

1. Verify Kestra is running: `curl http://localhost:8080/api/v1/configs`
2. Check environment variables are set
3. Verify flow files are in correct namespace
4. Check Kestra logs: `docker-compose logs kestra`

### API Connection Errors

1. Ensure backend API is running
2. Check CORS settings
3. Verify API URLs in environment
4. Check network connectivity

### Execution Failures

1. Check Kestra execution logs in UI
2. Verify agent IDs exist in database
3. Ensure sufficient resources
4. Check flow input validation

## Advanced Usage

### Custom Flow Variables

Edit flow YAML files to customize:
- Retry policies
- Timeout values
- Parallel execution limits
- Resource requirements

### Integration Examples

**Slack Notifications:**
Add to flow tasks:
```yaml
- id: notify_slack
  type: io.kestra.plugin.core.http.Request
  uri: https://hooks.slack.com/services/YOUR/WEBHOOK
  method: POST
  body: |
    {
      "text": "Match {{ outputs.create_match.body.id }} completed"
    }
```

**Database Storage:**
Add to flow tasks:
```yaml
- id: store_results
  type: io.kestra.plugin.jdbc.postgresql.Query
  connectionString: postgresql://...
  sql: |
    INSERT INTO match_results (match_id, winner, metrics)
    VALUES (?, ?, ?)
```

## Production Deployment

1. **Use Kestra Enterprise** for production workloads
2. **Configure Authentication** with API keys
3. **Set up Monitoring** for flow execution
4. **Use Persistent Storage** for Kestra data
5. **Configure Backups** for flow definitions
6. **Set Resource Limits** for parallel executions

## Support

- Kestra Documentation: https://kestra.io/docs
- Kestra Community: https://github.com/kestra-io/kestra
- Arena Documentation: See README.md and Plan.md


