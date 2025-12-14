---
title: Oumi Integration
description: Oumi fine-tuning integration
---

# Oumi Integration

Oumi integration enables fine-tuning of agents based on match results.

## Overview

Oumi provides:
- Training dataset export
- Fine-tuning job submission
- Model improvement pipeline

## Setup

Configure Oumi in `backend/.env`:

```env
OUMI_API_URL=https://api.oumi.ai
OUMI_API_KEY=your_oumi_api_key
```

## Dataset Export

Export training datasets in Oumi-compatible format (SFT chat format):

```bash
POST /api/oumi/export-dataset
{
  "matchIds": ["AR-2024-0142"],
  "format": "sft"
}
```

## Fine-tuning

Submit fine-tuning jobs:

```bash
POST /api/oumi/fine-tune
{
  "datasetId": "dataset-123",
  "model": "llama-3.3-70b-versatile",
  "method": "lora"
}
```

## Supported Methods

- LoRA
- QLoRA
- Full fine-tuning

## Next Steps

- [Oumi API](/api/oumi/) - Complete API reference
- [Fine-tuning Guide](/guides/fine-tuning/) - Fine-tuning workflow
