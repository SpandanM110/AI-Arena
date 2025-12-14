import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { LLMProvider } from '../types/index.js';
import { GROQ_MODELS, getFallbackModels } from './groq-models.js';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(prompt: string, systemPrompt?: string, options?: any): Promise<string> {
    const model = options?.model || 'gpt-4-turbo-preview';
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 2000;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }
}

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string, systemPrompt?: string, options?: any): Promise<string> {
    const model = options?.model || 'claude-3-opus-20240229';
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 2000;

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content.find((c: any) => c.type === 'text');
    return content?.text || '';
  }
}

export class GroqProvider implements LLMProvider {
  name = 'groq';
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async generate(prompt: string, systemPrompt?: string, options?: any): Promise<string> {
    const primaryModel = options?.model || 'llama-3.3-70b-versatile';
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 2000;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    // Try primary model first, then fallbacks
    const modelsToTry = [primaryModel, ...getFallbackModels(primaryModel)];
    const triedModels = new Set<string>();
    
    for (const model of modelsToTry) {
      // Skip if we've already tried this model in this request
      if (triedModels.has(model)) {
        continue;
      }

      try {
        triedModels.add(model);
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        });

        const content = response.choices[0]?.message?.content || '';
        
        // If we used a fallback model, log it
        if (model !== primaryModel) {
          console.log(`✓ Used fallback model: ${model} (primary: ${primaryModel} was rate limited)`);
        }
        
        return content;
      } catch (error: any) {
        // Handle rate limit errors - try next model
        if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded') {
          console.warn(`⚠ Model ${model} rate limited, trying next model...`);
          // Continue to next model in the loop
          continue;
        }
        // Handle decommissioned models - try next model
        if (error?.status === 400 && error?.error?.code === 'model_decommissioned') {
          console.warn(`⚠ Model ${model} has been decommissioned, trying next model...`);
          // Continue to next model in the loop
          continue;
        }
        // For other errors, throw immediately
        throw error;
      }
    }

    // If all models failed, throw rate limit error
    console.warn(`❌ All Groq models exhausted. Primary: ${primaryModel}, tried: ${Array.from(triedModels).join(', ')}`);
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
}

export class MockProvider implements LLMProvider {
  name = 'mock';
  
  async generate(prompt: string, systemPrompt?: string, options?: any): Promise<string> {
    // Mock responses for testing without API keys
    if (systemPrompt?.includes('RED_AGENT')) {
      return `[Red Attack] Attempting prompt injection: "${prompt.substring(0, 50)}..."`;
    }
    if (systemPrompt?.includes('BLUE_AGENT')) {
      return `[Blue Defense] Detected suspicious pattern. Deploying input sanitization and context monitoring.`;
    }
    return `[Target Response] Processing request: "${prompt.substring(0, 50)}..."`;
  }
}

export function createLLMProvider(model: string, apiKeys: { openai?: string; anthropic?: string; groq?: string }): LLMProvider {
  // Groq models (check first as it supports many models)
  const groqModels = [
    'llama', 'mixtral', 'gemma', 'gemini', 'qwen', 'deepseek',
    'llama-3', 'llama-3.1', 'mixtral-8x7b', 'gemma-7b'
  ];
  
  if (groqModels.some(gm => model.toLowerCase().includes(gm))) {
    if (!apiKeys.groq) {
      console.warn('Groq API key not found, using mock provider');
      return new MockProvider();
    }
    return new GroqProvider(apiKeys.groq);
  }
  
  // Determine provider from model name
  if (model.includes('gpt') || model.includes('openai')) {
    if (!apiKeys.openai) {
      console.warn('OpenAI API key not found, using mock provider');
      return new MockProvider();
    }
    return new OpenAIProvider(apiKeys.openai);
  }
  
  if (model.includes('claude') || model.includes('anthropic')) {
    if (!apiKeys.anthropic) {
      console.warn('Anthropic API key not found, using mock provider');
      return new MockProvider();
    }
    return new AnthropicProvider(apiKeys.anthropic);
  }

  // Default to Groq if available, otherwise mock
  if (apiKeys.groq) {
    return new GroqProvider(apiKeys.groq);
  }

  // Default to mock for unknown models
  console.warn(`Unknown model ${model}, using mock provider`);
  return new MockProvider();
}


