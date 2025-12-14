---
title: Oumi API
description: Oumi fine-tuning API reference
---

# Oumi API

API endpoints for Oumi fine-tuning integration.

## Base URL

```
http://localhost:3001/api/oumi
```

## Export Dataset

Export training dataset in Oumi-compatible format.

### Request

```http
POST /api/oumi/export-dataset
Content-Type: application/json
```

```json
{
  "matchIds": ["AR-2024-0142", "AR-2024-0143"],
  "format": "sft"
}
```

### Response

```json
{
  "datasetId": "dataset-123",
  "format": "sft",
  "records": 100,
  "downloadUrl": "https://..."
}
```

## Trigger Fine-tuning

Submit a fine-tuning job.

### Request

```http
POST /api/oumi/fine-tune
Content-Type: application/json
```

```json
{
  "datasetId": "dataset-123",
  "model": "llama-3.3-70b-versatile",
  "method": "lora",
  "config": {
    "epochs": 3,
    "learningRate": 0.0001
  }
}
```

### Response

```json
{
  "jobId": "job-123",
  "status": "submitted"
}
```

## Get Fine-tuning Job Status

Get status of a fine-tuning job.

### Request

```http
GET /api/oumi/fine-tune/:jobId
```

### Response

```json
{
  "jobId": "job-123",
  "status": "training",
  "progress": 65,
  "startedAt": "2024-12-14T10:00:00Z",
  "estimatedCompletion": "2024-12-14T12:00:00Z"
}
```

## Next Steps

- [Oumi Integration](/integrations/oumi/) - Integration guide
- [Fine-tuning Guide](/guides/fine-tuning/) - Fine-tuning workflow
