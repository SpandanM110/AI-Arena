---
title: Fine-tuning
description: Guide to fine-tuning agents with Oumi
---

# Fine-tuning

Complete guide to fine-tuning agents using Oumi integration.

## Overview

Fine-tuning improves agent performance based on match results and discovered vulnerabilities.

## Workflow

1. **Run Matches** - Generate training data
2. **Export Dataset** - Export in Oumi format
3. **Submit Fine-tuning** - Start training job
4. **Deploy Model** - Use improved model
5. **Test** - Verify improvements

## Exporting Datasets

Export training datasets from matches:

```bash
POST /api/oumi/export-dataset
{
  "matchIds": ["AR-2024-0142"],
  "format": "sft"
}
```

## Fine-tuning Methods

### LoRA

Low-Rank Adaptation for efficient fine-tuning:

```json
{
  "method": "lora",
  "config": {
    "rank": 16,
    "alpha": 32
  }
}
```

### QLoRA

Quantized LoRA for memory efficiency:

```json
{
  "method": "qlora",
  "config": {
    "bits": 4,
    "rank": 16
  }
}
```

### Full Fine-tuning

Complete model fine-tuning:

```json
{
  "method": "full",
  "config": {
    "epochs": 3,
    "learningRate": 0.0001
  }
}
```

## Submitting Jobs

```bash
POST /api/oumi/fine-tune
{
  "datasetId": "dataset-123",
  "model": "llama-3.3-70b-versatile",
  "method": "lora"
}
```

## Monitoring Jobs

Check job status:

```bash
GET /api/oumi/fine-tune/job-123
```

## Best Practices

1. **Quality Data** - Use high-quality match data
2. **Balanced Datasets** - Include diverse scenarios
3. **Iterative Improvement** - Fine-tune multiple times
4. **Test Thoroughly** - Validate improvements

## Next Steps

- [Oumi Integration](/integrations/oumi/) - Integration details
- [Oumi API](/api/oumi/) - API reference
