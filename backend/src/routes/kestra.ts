import { Router } from 'express';
import { KestraClient } from '../kestra/client.js';
import { z } from 'zod';

const triggerMatchSchema = z.object({
  redAgentId: z.string().uuid(),
  blueAgentId: z.string().uuid(),
  targetAgentId: z.string().uuid(),
  mode: z.enum(['quick', 'standard', 'deep', 'continuous']).optional(),
});

const triggerMonitoringSchema = z.object({
  targetAgentId: z.string().uuid(),
  intervalMinutes: z.number().int().min(1).max(1440).optional(),
});

const triggerDatasetSchema = z.object({
  matchIds: z.array(z.string()).optional(),
  minSeverity: z.number().min(0).max(10).optional(),
});

const triggerFineTuningSchema = z.object({
  agentId: z.string().uuid(),
  agentType: z.enum(['red', 'blue', 'target']),
  trainingMatchesCount: z.number().int().min(1).max(1000).optional(),
});

const triggerBatchEvaluationSchema = z.object({
  agentCombinations: z.array(z.object({
    redAgentId: z.string().uuid(),
    blueAgentId: z.string().uuid(),
    targetAgentId: z.string().uuid(),
  })),
  matchesPerCombination: z.number().int().min(1).max(10).optional(),
});

export function createKestraRouter(kestraClient: KestraClient): Router {
  const router = Router();

  // Trigger match orchestration
  router.post('/trigger/match', async (req, res) => {
    try {
      const validated = triggerMatchSchema.parse(req.body);
      const execution = await kestraClient.triggerMatch(
        validated.redAgentId,
        validated.blueAgentId,
        validated.targetAgentId,
        validated.mode
      );
      res.json(execution);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger scheduled matches
  router.post('/trigger/scheduled', async (req, res) => {
    try {
      const cronExpression = req.body.cronExpression;
      const execution = await kestraClient.triggerScheduledMatches(cronExpression);
      res.json(execution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger continuous monitoring
  router.post('/trigger/monitoring', async (req, res) => {
    try {
      const validated = triggerMonitoringSchema.parse(req.body);
      const execution = await kestraClient.triggerContinuousMonitoring(
        validated.targetAgentId,
        validated.intervalMinutes
      );
      res.json(execution);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger dataset generation
  router.post('/trigger/dataset', async (req, res) => {
    try {
      const validated = triggerDatasetSchema.parse(req.body);
      const execution = await kestraClient.triggerDatasetGeneration(
        validated.matchIds,
        validated.minSeverity
      );
      res.json(execution);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger agent fine-tuning
  router.post('/trigger/fine-tune', async (req, res) => {
    try {
      const validated = triggerFineTuningSchema.parse(req.body);
      const execution = await kestraClient.triggerAgentFineTuning(
        validated.agentId,
        validated.agentType,
        validated.trainingMatchesCount
      );
      res.json(execution);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger batch evaluation
  router.post('/trigger/batch-evaluation', async (req, res) => {
    try {
      const validated = triggerBatchEvaluationSchema.parse(req.body);
      const execution = await kestraClient.triggerBatchEvaluation(
        validated.agentCombinations,
        validated.matchesPerCombination
      );
      res.json(execution);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get execution status
  router.get('/executions/:id', async (req, res) => {
    try {
      const execution = await kestraClient.getExecution(req.params.id);
      res.json(execution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List executions
  router.get('/executions', async (req, res) => {
    try {
      const namespace = req.query.namespace as string;
      const flowId = req.query.flowId as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const executions = await kestraClient.listExecutions(namespace, flowId, limit);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook endpoint for Kestra to trigger flows
  router.post('/webhook/:flowId', async (req, res) => {
    try {
      const { flowId } = req.params;
      const inputs = req.body;

      const execution = await kestraClient.createExecution({
        id: flowId,
        namespace: '',
        inputs,
      });

      res.json({ success: true, executionId: execution.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}


