---
title: Groq Models
description: Complete reference for Groq model integration
---

# Groq Models Reference

Complete list of available Groq models with their IDs, capabilities, and recommended use cases.

## Available Models

### Llama Models

| Model ID | Name | Tier | Context Window | Best For |
|----------|------|------|----------------|----------|
| `llama-3.3-70b-versatile` | Llama 3.3 70B Versatile | powerful | 131,072 | Complex reasoning, creative attacks |
| `llama-3.1-70b-versatile` | Llama 3.1 70B Versatile | powerful | 131,072 | High-quality responses, analysis |
| `llama-3.1-8b-instant` | Llama 3.1 8B Instant | fast | 131,072 | Quick responses, high throughput |
| `llama-3.1-405b-reasoning` | Llama 3.1 405B Reasoning | powerful | 131,072 | Ultra-powerful reasoning (if available) |

### Mixtral Models

| Model ID | Name | Tier | Context Window | Best For |
|----------|------|------|----------------|----------|
| `mixtral-8x7b-32768` | Mixtral 8x7B | balanced | 32,768 | Balanced performance, large context |
| `mixtral-8x22b-instruct` | Mixtral 8x22B Instruct | powerful | 65,536 | Complex tasks, high quality |

### Gemma Models

| Model ID | Name | Tier | Context Window | Best For |
|----------|------|------|----------------|----------|
| `gemma-7b-it` | Gemma 7B Instruct | fast | 8,192 | Fast responses, efficient |
| `gemma2-9b-it` | Gemma 2 9B Instruct | balanced | 8,192 | Balanced performance |

### Qwen Models

| Model ID | Name | Tier | Context Window | Best For |
|----------|------|------|----------------|----------|
| `qwen-2.5-72b-instruct` | Qwen 2.5 72B Instruct | powerful | 32,768 | Large model, high quality |
| `qwen-2.5-32b-instruct` | Qwen 2.5 32B Instruct | balanced | 32,768 | Medium model, balanced |
| `qwen-2.5-14b-instruct` | Qwen 2.5 14B Instruct | balanced | 32,768 | Small-medium model |
| `qwen-2.5-7b-instruct` | Qwen 2.5 7B Instruct | fast | 32,768 | Compact, fast model |

### DeepSeek Models

| Model ID | Name | Tier | Context Window | Best For |
|----------|------|------|----------------|----------|
| `deepseek-r1-distill-llama-8b` | DeepSeek R1 Distill Llama 8B | balanced | 131,072 | Reasoning tasks |
| `deepseek-chat` | DeepSeek Chat | balanced | 32,768 | General chat |

## Recommended Model Selection

### For Red Agents (Attackers)

**Primary**: `llama-3.3-70b-versatile` - Best creativity

**Fallback**: `llama-3.1-70b-versatile`, `mixtral-8x7b-32768`, `qwen-2.5-72b-instruct`

### For Blue Agents (Defenders)

**Primary**: `mixtral-8x7b-32768` - Excellent analysis

**Fallback**: `llama-3.1-70b-versatile`, `qwen-2.5-32b-instruct`, `gemma2-9b-it`

### For Target Agents

**Primary**: `llama-3.1-8b-instant` - Fast responses

**Fallback**: `gemma-7b-it`, `qwen-2.5-7b-instruct`, `deepseek-chat`

## Automatic Model Fallback

The system automatically tries fallback models when the primary model is rate limited:

1. **Primary model** is tried first
2. If rate limited, **same-tier models** are tried
3. If still rate limited, **lower-tier models** are tried
4. Only falls back to **mock provider** if ALL models fail

### Example Fallback Chain

For `llama-3.3-70b-versatile` (powerful tier):

1. `llama-3.3-70b-versatile` (primary)
2. `llama-3.1-70b-versatile` (same tier)
3. `llama-3.1-405b-reasoning` (same tier)
4. `mixtral-8x22b-instruct` (same tier)
5. `qwen-2.5-72b-instruct` (same tier)
6. `mixtral-8x7b-32768` (balanced tier)
7. `qwen-2.5-32b-instruct` (balanced tier)
8. ... and more

## Model Tiers

- **Fast**: Quick responses, lower resource usage, good for high throughput
- **Balanced**: Good balance of speed and quality
- **Powerful**: Best quality, higher resource usage, best for complex tasks

## Using Models in Code

```typescript
// In agent creation
{
  "name": "My Agent",
  "type": "red",
  "model": "llama-3.3-70b-versatile",  // Will auto-fallback if rate limited
  "systemPrompt": "..."
}
```

The system will automatically try fallback models if the primary is rate limited!

## Why Mock Data?

Mock data is used when:
- **All Groq models are rate limited** (daily token limit exceeded)
- **No API keys are configured**
- **Testing without API costs**

The system will automatically use real models once:
- Rate limits reset (usually daily)
- Different models become available
- API keys are configured

## API Key Configuration

### Single API Key

```env
GROQ_API_KEY=your_key_here
```

### Per-Team API Keys

```env
GROQ_API_KEY=general_key
RED_TEAM_GROQ_API_KEY=red_team_key
BLUE_TEAM_GROQ_API_KEY=blue_team_key
```

This allows better rate limit management by distributing requests across multiple keys.

## Model Selection Best Practices

1. **Match model to task**: Use powerful models for complex reasoning, fast models for high throughput
2. **Consider rate limits**: Have fallback models ready
3. **Use per-team keys**: Distribute load across multiple API keys
4. **Monitor usage**: Track which models are being used most
5. **Test fallback**: Ensure fallback chain works correctly

## Troubleshooting

### Rate Limit Errors

If you see rate limit errors:

1. Wait for rate limit reset (usually daily)
2. Use different API keys for different teams
3. Upgrade Groq plan for higher limits
4. System will automatically try fallback models

### Model Not Found

If a model ID is not found:

1. Check model ID spelling
2. Verify model is available in your Groq account
3. System will fallback to available models

### Slow Responses

If responses are slow:

1. Try faster tier models (`llama-3.1-8b-instant`, `gemma-7b-it`)
2. Check network connection
3. Monitor Groq API status

## Next Steps

- [Agent Configuration](/backend/agents/) - How to configure agents with models
- [API Keys](/getting-started/configuration/) - Setting up API keys
- [Model Fallback](/backend/agents/#model-fallback-system) - Understanding fallback system
