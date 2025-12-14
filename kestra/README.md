# Kestra Integration for AI Arena

This directory contains Kestra flow definitions for advanced orchestration of the AI Red vs Blue Arena.

## Overview

Kestra provides workflow orchestration capabilities for:
- **Match Orchestration**: Automated match execution with monitoring
- **Scheduled Matches**: Periodic evaluation runs
- **Continuous Monitoring**: 24/7 security monitoring
- **Dataset Generation**: Training data export for Oumi
- **Agent Fine-tuning**: Complete fine-tuning pipeline
- **Batch Evaluation**: Parallel testing of multiple agent combinations

## Setup

### 1. Install Kestra

Follow the [Kestra installation guide](https://kestra.io/docs/getting-started/installation) for your environment.

### 2. Configure Environment Variables

Set these environment variables in Kestra:

```bash
ARENA_API_URL=http://localhost:3001
```

Optional:
```bash
OUMI_API_URL=http://localhost:3002
KESTRA_API_KEY=your_api_key
```

### 3. Deploy Flows

Copy all flow files from `kestra/flows/` to your Kestra flows directory, or use the Kestra UI to import them.

## Available Flows

### 1. Match Orchestration (`match-orchestration.yml`)

Orchestrates a complete Red vs Blue match.

**Inputs:**
- `red_agent_id`: Red agent ID
- `blue_agent_id`: Blue agent ID
- `target_agent_id`: Target agent ID
- `match_mode`: quick/standard/deep/continuous
- `max_rounds`: Optional round limit

**Usage:**
```bash
curl -X POST http://localhost:8080/api/v1/executions \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "ai-arena",
    "flowId": "match-orchestration",
    "inputs": {
      "red_agent_id": "agent-uuid",
      "blue_agent_id": "agent-uuid",
      "target_agent_id": "agent-uuid",
      "match_mode": "standard"
    }
  }'
```

### 2. Scheduled Matches (`scheduled-matches.yml`)

Runs matches on a schedule for continuous evaluation.

**Inputs:**
- `schedule_cron`: Cron expression (default: every 6 hours)
- `agent_combinations`: List of agent combinations to test

**Triggers:**
- Schedule trigger based on cron expression

### 3. Continuous Monitoring (`continuous-monitoring.yml`)

24/7 monitoring of target agents with automated alerting.

**Inputs:**
- `target_agent_id`: Agent to monitor
- `monitoring_interval_minutes`: Minutes between checks
- `alert_threshold_severity`: Severity threshold for alerts

**Triggers:**
- Schedule trigger
- Flow trigger

### 4. Dataset Generation (`dataset-generation.yml`)

Generates training datasets from match results.

**Inputs:**
- `match_ids`: Specific match IDs (optional)
- `date_range_start`: Start date (optional)
- `date_range_end`: End date (optional)
- `min_severity`: Minimum severity to include
- `export_format`: json/jsonl/parquet

### 5. Agent Fine-tuning (`agent-fine-tuning.yml`)

Complete pipeline from dataset generation to model deployment.

**Inputs:**
- `agent_id`: Agent to fine-tune
- `agent_type`: red/blue/target
- `training_matches_count`: Number of matches for training
- `fine_tuning_config`: Fine-tuning configuration

### 6. Batch Evaluation (`batch-evaluation.yml`)

Evaluates multiple agent combinations in parallel.

**Inputs:**
- `agent_combinations`: List of combinations to test
- `matches_per_combination`: Number of matches per combo

## Integration with Backend

The backend provides API endpoints to trigger Kestra flows:

### Trigger Match
```bash
POST /api/kestra/trigger/match
{
  "redAgentId": "uuid",
  "blueAgentId": "uuid",
  "targetAgentId": "uuid",
  "mode": "standard"
}
```

### Trigger Monitoring
```bash
POST /api/kestra/trigger/monitoring
{
  "targetAgentId": "uuid",
  "intervalMinutes": 60
}
```

### Trigger Dataset Generation
```bash
POST /api/kestra/trigger/dataset
{
  "matchIds": ["match-id-1", "match-id-2"],
  "minSeverity": 5.0
}
```

### Trigger Fine-tuning
```bash
POST /api/kestra/trigger/fine-tune
{
  "agentId": "uuid",
  "agentType": "red",
  "trainingMatchesCount": 50
}
```

### Get Execution Status
```bash
GET /api/kestra/executions/:id
```

### List Executions
```bash
GET /api/kestra/executions?namespace=ai-arena&flowId=match-orchestration
```

## Webhook Integration

Kestra can trigger flows via webhook:

```bash
POST /api/kestra/webhook/:flowId
{
  "input1": "value1",
  "input2": "value2"
}
```

## Flow Dependencies

Flows use subflows for modularity:
- `match-orchestration` is used by `scheduled-matches`, `continuous-monitoring`, and `batch-evaluation`
- `dataset-generation` is used by `agent-fine-tuning`

## Monitoring

All flows log execution details and can be monitored via:
- Kestra UI: http://localhost:8080
- Backend API: `/api/kestra/executions`
- Execution outputs are stored in Kestra

## Best Practices

1. **Start with Match Orchestration**: Test individual matches before scheduling
2. **Monitor Resource Usage**: Batch evaluations can be resource-intensive
3. **Use Appropriate Match Modes**: Quick mode for testing, standard for production
4. **Set Alert Thresholds**: Configure monitoring alerts appropriately
5. **Regular Dataset Exports**: Export datasets regularly for training

## Troubleshooting

### Flows Not Executing

- Verify Kestra is running: `curl http://localhost:8080/api/v1/configs`
- Check environment variables are set
- Verify flow files are in correct namespace

### API Connection Errors

- Ensure backend API is running on configured URL
- Check CORS settings if accessing from different origin
- Verify API keys if authentication is enabled

### Execution Failures

- Check Kestra execution logs
- Verify agent IDs exist in database
- Ensure sufficient resources for parallel executions

## Advanced Configuration

### Custom Flow Variables

Edit flow files to customize:
- Retry policies
- Timeout values
- Parallel execution limits
- Resource requirements

### Integration with External Systems

Flows can be extended to:
- Send notifications (Slack, email, etc.)
- Store results in external databases
- Trigger downstream processes
- Integrate with CI/CD pipelines

## License

MIT


