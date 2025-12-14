/**
 * Available Groq Models with their IDs
 * Updated: December 2024
 * 
 * Reference: https://console.groq.com/docs/models
 */

export interface GroqModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  tier: 'fast' | 'balanced' | 'powerful';
}

export const GROQ_MODELS: GroqModel[] = [
  // Llama 3.3 Models (Latest)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    description: 'Most capable Llama 3.3 model, best for complex reasoning',
    contextWindow: 131072,
    tier: 'powerful',
  },
  // Note: llama-3.1-70b-versatile has been decommissioned - removed
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    description: 'Fast 8B model for quick responses',
    contextWindow: 131072,
    tier: 'fast',
  },
  {
    id: 'llama-3.1-405b-reasoning',
    name: 'Llama 3.1 405B Reasoning',
    description: 'Ultra-powerful reasoning model (if available)',
    contextWindow: 131072,
    tier: 'powerful',
  },

  // Mixtral Models
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    description: 'High-quality mixture of experts model',
    contextWindow: 32768,
    tier: 'balanced',
  },
  {
    id: 'mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    description: 'Larger Mixtral model for complex tasks',
    contextWindow: 65536,
    tier: 'powerful',
  },

  // Gemma Models
  {
    id: 'gemma-7b-it',
    name: 'Gemma 7B Instruct',
    description: 'Google Gemma 7B instruction-tuned model',
    contextWindow: 8192,
    tier: 'fast',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B Instruct',
    description: 'Google Gemma 2 9B model',
    contextWindow: 8192,
    tier: 'balanced',
  },

  // Qwen Models
  {
    id: 'qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    description: 'Alibaba Qwen 2.5 large model',
    contextWindow: 32768,
    tier: 'powerful',
  },
  {
    id: 'qwen-2.5-32b-instruct',
    name: 'Qwen 2.5 32B Instruct',
    description: 'Alibaba Qwen 2.5 medium model',
    contextWindow: 32768,
    tier: 'balanced',
  },
  {
    id: 'qwen-2.5-14b-instruct',
    name: 'Qwen 2.5 14B Instruct',
    description: 'Alibaba Qwen 2.5 small model',
    contextWindow: 32768,
    tier: 'balanced',
  },
  {
    id: 'qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    description: 'Alibaba Qwen 2.5 compact model',
    contextWindow: 32768,
    tier: 'fast',
  },

  // DeepSeek Models
  {
    id: 'deepseek-r1-distill-llama-8b',
    name: 'DeepSeek R1 Distill Llama 8B',
    description: 'DeepSeek reasoning model',
    contextWindow: 131072,
    tier: 'balanced',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek chat model',
    contextWindow: 32768,
    tier: 'balanced',
  },
];

/**
 * Get models by tier
 */
export function getModelsByTier(tier: 'fast' | 'balanced' | 'powerful'): GroqModel[] {
  return GROQ_MODELS.filter(m => m.tier === tier);
}

/**
 * Get fallback models for rotation (ordered by preference)
 */
export function getFallbackModels(primaryModelId: string): string[] {
  const primary = GROQ_MODELS.find(m => m.id === primaryModelId);
  if (!primary) {
    // If model not found, return default fallback list (no decommissioned models)
    return [
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'qwen-2.5-7b-instruct',
      'gemma-7b-it',
      'qwen-2.5-32b-instruct',
      'gemma2-9b-it',
    ];
  }

  // Get models of same or lower tier (to avoid rate limits)
  const fallbacks: string[] = [];
  
  // Same tier models (excluding primary)
  GROQ_MODELS
    .filter(m => m.tier === primary.tier && m.id !== primaryModelId)
    .forEach(m => fallbacks.push(m.id));

  // Lower tier models (faster, less likely to be rate limited)
  if (primary.tier === 'powerful') {
    GROQ_MODELS
      .filter(m => m.tier === 'balanced' || m.tier === 'fast')
      .forEach(m => fallbacks.push(m.id));
  } else if (primary.tier === 'balanced') {
    GROQ_MODELS
      .filter(m => m.tier === 'fast')
      .forEach(m => fallbacks.push(m.id));
  }

  return fallbacks;
}

