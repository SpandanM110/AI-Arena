import { Router } from 'express';
import { AgentModel } from '../database/models.js';
import { CreateAgentRequest } from '../types/index.js';
import { z } from 'zod';
import { GROQ_MODELS } from '../agents/groq-models.js';

const agentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['red', 'blue', 'target']),
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  permissions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export function createAgentsRouter(agentModel: AgentModel): Router {
  const router = Router();

  // Get available models
  router.get('/models', async (req, res) => {
    try {
      const type = req.query.type as 'red' | 'blue' | 'target' | undefined;
      
      // Filter models by recommended tier for agent type
      let recommendedModels = GROQ_MODELS;
      if (type === 'red') {
        // Red agents: prefer powerful and balanced models
        recommendedModels = GROQ_MODELS.filter(m => m.tier === 'powerful' || m.tier === 'balanced');
      } else if (type === 'blue') {
        // Blue agents: prefer balanced and powerful models
        recommendedModels = GROQ_MODELS.filter(m => m.tier === 'balanced' || m.tier === 'powerful');
      } else if (type === 'target') {
        // Target agents: prefer fast and balanced models
        recommendedModels = GROQ_MODELS.filter(m => m.tier === 'fast' || m.tier === 'balanced');
      }
      
      res.json({
        models: GROQ_MODELS,
        recommended: recommendedModels,
        byTier: {
          fast: GROQ_MODELS.filter(m => m.tier === 'fast'),
          balanced: GROQ_MODELS.filter(m => m.tier === 'balanced'),
          powerful: GROQ_MODELS.filter(m => m.tier === 'powerful'),
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all agents
  router.get('/', async (req, res) => {
    try {
      const type = req.query.type as 'red' | 'blue' | 'target' | undefined;
      const agents = type 
        ? await agentModel.getByType(type)
        : await agentModel.getAll();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get agent by ID
  router.get('/:id', async (req, res) => {
    try {
      const agent = await agentModel.getById(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create agent
  router.post('/', async (req, res) => {
    try {
      const validated = agentSchema.parse(req.body);
      const agent = await agentModel.create(validated);
      res.status(201).json(agent);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update agent
  router.patch('/:id', async (req, res) => {
    try {
      const validated = agentSchema.partial().parse(req.body);
      const agent = await agentModel.update(req.params.id, validated);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(agent);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete agent
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await agentModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
