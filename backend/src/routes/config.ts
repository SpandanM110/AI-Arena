import { Router } from 'express';
import { AgentExecutor } from '../agents/agent-executor.js';
import { KestraClient } from '../kestra/client.js';
import { z } from 'zod';

// In-memory key storage (for BYOK)
// In production, use secure storage (encrypted DB, secrets manager, etc.)
let runtimeApiKeys: {
  groq?: string;
  openai?: string;
  anthropic?: string;
  redTeamGroq?: string;
  blueTeamGroq?: string;
} = {};

let runtimeKestraConfig: {
  url?: string;
  apiKey?: string;
} = {};

const updateKeysSchema = z.object({
  groq: z.string().optional(),
  openai: z.string().optional(),
  anthropic: z.string().optional(),
  redTeamGroq: z.string().optional(),
  blueTeamGroq: z.string().optional(),
});

const updateKestraSchema = z.object({
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
});

export function createConfigRouter(
  executor: AgentExecutor,
  kestraClient: KestraClient | null
): Router {
  const router = Router();

  // Get current configuration
  router.get('/config', (req, res) => {
    res.json({
      apiKeys: {
        groq: runtimeApiKeys.groq ? '***configured***' : undefined,
        openai: runtimeApiKeys.openai ? '***configured***' : undefined,
        anthropic: runtimeApiKeys.anthropic ? '***configured***' : undefined,
        redTeamGroq: runtimeApiKeys.redTeamGroq ? '***configured***' : undefined,
        blueTeamGroq: runtimeApiKeys.blueTeamGroq ? '***configured***' : undefined,
      },
      kestra: {
        url: runtimeKestraConfig.url || process.env.KESTRA_URL || undefined,
        configured: !!(runtimeKestraConfig.url || process.env.KESTRA_URL),
      },
      useCline: process.env.USE_CLINE !== 'false',
      defaults: {
        port: process.env.PORT || '3001',
        wsPort: process.env.WS_PORT || '3002',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      },
    });
  });

  // Update API keys (BYOK)
  router.post('/keys', (req, res) => {
    try {
      const validated = updateKeysSchema.parse(req.body);
      
      if (validated.groq) {
        runtimeApiKeys.groq = validated.groq;
      }
      if (validated.openai) {
        runtimeApiKeys.openai = validated.openai;
      }
      if (validated.anthropic) {
        runtimeApiKeys.anthropic = validated.anthropic;
      }
      if (validated.redTeamGroq) {
        runtimeApiKeys.redTeamGroq = validated.redTeamGroq;
      }
      if (validated.blueTeamGroq) {
        runtimeApiKeys.blueTeamGroq = validated.blueTeamGroq;
      }

      // Update executor with new keys
      executor.updateApiKeys(validated);

      res.json({
        success: true,
        message: 'API keys updated',
        configured: {
          groq: !!runtimeApiKeys.groq,
          openai: !!runtimeApiKeys.openai,
          anthropic: !!runtimeApiKeys.anthropic,
          redTeamGroq: !!runtimeApiKeys.redTeamGroq,
          blueTeamGroq: !!runtimeApiKeys.blueTeamGroq,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update Kestra configuration
  router.post('/kestra', (req, res) => {
    try {
      const validated = updateKestraSchema.parse(req.body);
      
      if (validated.url) {
        runtimeKestraConfig.url = validated.url;
      }
      if (validated.apiKey) {
        runtimeKestraConfig.apiKey = validated.apiKey;
      }

      res.json({
        success: true,
        message: 'Kestra configuration updated',
        url: runtimeKestraConfig.url,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Clear API keys
  router.delete('/keys', (req, res) => {
    runtimeApiKeys = {};
    res.json({
      success: true,
      message: 'API keys cleared',
    });
  });

  // Get effective API keys (for internal use)
  router.get('/keys/effective', (req, res) => {
    res.json({
      groq: runtimeApiKeys.groq || process.env.GROQ_API_KEY || undefined,
      openai: runtimeApiKeys.openai || process.env.OPENAI_API_KEY || undefined,
      anthropic: runtimeApiKeys.anthropic || process.env.ANTHROPIC_API_KEY || undefined,
      redTeamGroq: runtimeApiKeys.redTeamGroq || undefined,
      blueTeamGroq: runtimeApiKeys.blueTeamGroq || undefined,
    });
  });

  return router;
}

// Export function to get effective keys
export function getEffectiveApiKeys(): {
  groq?: string;
  openai?: string;
  anthropic?: string;
  redTeamGroq?: string;
  blueTeamGroq?: string;
} {
  return {
    groq: runtimeApiKeys.groq || process.env.GROQ_API_KEY,
    openai: runtimeApiKeys.openai || process.env.OPENAI_API_KEY,
    anthropic: runtimeApiKeys.anthropic || process.env.ANTHROPIC_API_KEY,
    redTeamGroq: runtimeApiKeys.redTeamGroq,
    blueTeamGroq: runtimeApiKeys.blueTeamGroq,
  };
}

