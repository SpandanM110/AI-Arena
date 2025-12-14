import { Router } from 'express';
import { EventModel } from '../database/models.js';

export function createEventsRouter(eventModel: EventModel): Router {
  const router = Router();

  // Get recent events
  router.get('/', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const events = await eventModel.getRecent(limit);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get event by ID
  router.get('/:id', async (req, res) => {
    try {
      const event = await eventModel.getById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
