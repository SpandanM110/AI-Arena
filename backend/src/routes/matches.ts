import { Router } from 'express';
import { MatchModel, EventModel, RoundModel } from '../database/models.js';
import { MatchRunner } from '../orchestration/match-runner.js';
import { CreateMatchRequest } from '../types/index.js';
import { z } from 'zod';

const createMatchSchema = z.object({
  redAgentId: z.string().uuid(),
  blueAgentId: z.string().uuid(),
  targetAgentId: z.string().uuid(),
  mode: z.enum(['quick', 'standard', 'deep', 'continuous']).optional(),
  metadata: z.record(z.any()).optional(),
});

export function createMatchesRouter(
  matchModel: MatchModel,
  eventModel: EventModel,
  roundModel: RoundModel,
  matchRunner: MatchRunner
): Router {
  const router = Router();

  // Get all matches
  router.get('/', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const matches = await matchModel.getAll(limit, offset);
      res.json(matches);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get match by ID
  router.get('/:id', async (req, res) => {
    try {
      const match = await matchModel.getById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create and start match
  router.post('/', async (req, res) => {
    try {
      const validated = createMatchSchema.parse(req.body);
      const match = await matchModel.create(validated);
      
      // Start match asynchronously
      matchRunner.runMatch(match.id, {
        mode: validated.mode || 'standard',
      }).catch(async (err) => {
        console.error(`Error running match ${match.id}:`, err);
        await matchModel.update(match.id, { status: 'cancelled' });
      });

      res.status(201).json(match);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get match events
  router.get('/:id/events', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 1000;
      const events = await eventModel.getByMatchId(req.params.id, limit);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get match rounds
  router.get('/:id/rounds', async (req, res) => {
    try {
      const rounds = await roundModel.getByMatchId(req.params.id);
      res.json(rounds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get match transcript (events + rounds combined)
  router.get('/:id/transcript', async (req, res) => {
    try {
      const events = await eventModel.getByMatchId(req.params.id, 10000);
      const rounds = await roundModel.getByMatchId(req.params.id);
      res.json({ events, rounds });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pause match
  router.post('/:id/pause', async (req, res) => {
    try {
      const match = await matchModel.getById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      if (match.status !== 'running') {
        return res.status(400).json({ error: 'Match is not running' });
      }
      matchRunner.stop();
      await matchModel.update(req.params.id, { status: 'paused' });
      res.json({ message: 'Match paused' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resume match
  router.post('/:id/resume', async (req, res) => {
    try {
      const match = await matchModel.getById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      if (match.status !== 'paused') {
        return res.status(400).json({ error: 'Match is not paused' });
      }
      
      matchRunner.runMatch(match.id).catch(async (err) => {
        console.error(`Error resuming match ${match.id}:`, err);
        await matchModel.update(match.id, { status: 'cancelled' });
      });
      
      res.json({ message: 'Match resumed' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
