import { Router } from 'express';
import { EventModel, MatchModel } from '../database/models.js';
import fetch from 'node-fetch';

export function createOumiRouter(eventModel: EventModel, matchModel: MatchModel): Router {
  const router = Router();

  // Export training dataset from matches
  router.post('/export-dataset', async (req, res) => {
    try {
      const { matchIds, format = 'json' } = req.body;
      
      if (!matchIds || !Array.isArray(matchIds)) {
        return res.status(400).json({ error: 'matchIds array required' });
      }

      const dataset: any[] = [];
      
      for (const matchId of matchIds) {
        const match = await matchModel.getById(matchId);
        if (!match) continue;

        const events = await eventModel.getByMatchId(matchId);
        const attackEvents = events.filter(e => e.type === 'attack');
        const defenseEvents = events.filter(e => e.type === 'defense');
        const targetEvents = events.filter(e => e.type === 'target');

        // Pair up attack-defense-target triplets
        for (let i = 0; i < attackEvents.length; i++) {
          const attack = attackEvents[i];
          const defense = defenseEvents[i];
          const target = targetEvents[i];

          if (attack && target) {
            // Format data for Oumi supervised fine-tuning (SFT) format
            // Oumi expects chat format: https://oumi.ai/docs/en/latest/resources/datasets/chat_formats.html
            dataset.push({
              messages: [
                {
                  role: 'user',
                  content: attack.prompt,
                },
                {
                  role: 'assistant',
                  content: target.prompt,
                },
              ],
              metadata: {
                matchId,
                round: i + 1,
                attackType: attack.attackType,
                severity: attack.severity,
                outcome: target.outcome,
                defense: defense ? {
                  prompt: defense.prompt,
                  outcome: defense.outcome,
                } : null,
                timestamp: attack.timestamp,
              },
            });
          }
        }
      }

      res.json({
        format,
        count: dataset.length,
        dataset,
        // Oumi-compatible format
        oumi_format: 'sft', // Supervised Fine-Tuning
        instructions: 'This dataset contains Red vs Blue Arena match data formatted for Oumi fine-tuning',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger fine-tuning using Oumi
  // Based on: https://oumi.ai/docs/en/latest/user_guides/train/train.html
  router.post('/fine-tune', async (req, res) => {
    try {
      const { agentId, datasetId, config } = req.body;
      
      // Oumi API integration
      // Oumi can be used via Python SDK or REST API
      // For now, we'll provide a structured response that can be used with Oumi CLI/SDK
      
      const oumiConfig = {
        // Oumi training configuration
        // See: https://oumi.ai/docs/en/latest/user_guides/train/training_configuration.html
        model: config?.baseModel || 'llama-3.3-70b-versatile',
        dataset: datasetId || 'arena-dataset',
        method: config?.method || 'lora', // LoRA, QLoRA, or full fine-tuning
        training: {
          num_epochs: config?.epochs || 3,
          learning_rate: config?.learning_rate || 0.0001,
          batch_size: config?.batch_size || 8,
          gradient_accumulation_steps: config?.gradient_accumulation_steps || 1,
        },
        // Oumi supports distributed training
        // See: https://oumi.ai/docs/en/latest/user_guides/train/training_environments.html
        launcher: {
          type: config?.launcher || 'local', // local, kubernetes, aws, azure, gcp, lambda
        },
      };

      // If OUMI_API_URL is configured, attempt to call Oumi API
      // Otherwise, return configuration for manual Oumi CLI usage
      if (process.env.OUMI_API_URL) {
        try {
          const oumiResponse = await fetch(`${process.env.OUMI_API_URL}/api/v1/jobs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.OUMI_API_KEY && { 'Authorization': `Bearer ${process.env.OUMI_API_KEY}` }),
            },
            body: JSON.stringify({
              type: 'training',
              config: oumiConfig,
              metadata: {
                agentId,
                source: 'ai-arena',
              },
            }),
          });

          if (!oumiResponse.ok) {
            throw new Error(`Oumi API error: ${oumiResponse.statusText}`);
          }

          const jobData = await oumiResponse.json();
          
          res.json({
            jobId: jobData.id || `ft-job-${Date.now()}`,
            agentId,
            status: 'queued',
            oumiJobId: jobData.id,
            config: oumiConfig,
            message: 'Fine-tuning job submitted to Oumi',
          });
        } catch (apiError: any) {
          // Fall back to returning config for manual execution
          console.warn('Oumi API call failed, returning config for manual execution:', apiError.message);
          res.json({
            jobId: `ft-job-${Date.now()}`,
            agentId,
            status: 'pending',
            config: oumiConfig,
            message: 'Oumi API not available. Use provided config with Oumi CLI: oumi train --config <config>',
            instructions: [
              '1. Export dataset using POST /api/oumi/export-dataset',
              '2. Save dataset to file (e.g., arena_dataset.jsonl)',
              '3. Run: oumi train --config <provided_config>',
              '4. Monitor job status via Oumi dashboard or CLI',
            ],
          });
        }
      } else {
        // No Oumi API configured - return config for manual usage
        res.json({
          jobId: `ft-job-${Date.now()}`,
          agentId,
          status: 'pending',
          config: oumiConfig,
          message: 'Oumi API not configured. Use provided config with Oumi CLI',
          instructions: [
            '1. Install Oumi: pip install oumi',
            '2. Export dataset: POST /api/oumi/export-dataset',
            '3. Save dataset to JSONL format',
            '4. Run: oumi train --config <provided_config>',
            '5. See: https://oumi.ai/docs/en/latest/get_started/quickstart.html',
          ],
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get fine-tuning job status
  router.get('/fine-tune/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;

      // If Oumi API is configured, check job status
      if (process.env.OUMI_API_URL) {
        try {
          const oumiResponse = await fetch(`${process.env.OUMI_API_URL}/api/v1/jobs/${jobId}`, {
            headers: {
              ...(process.env.OUMI_API_KEY && { 'Authorization': `Bearer ${process.env.OUMI_API_KEY}` }),
            },
          });

          if (oumiResponse.ok) {
            const jobData = await oumiResponse.json();
            res.json({
              jobId,
              status: jobData.status || 'unknown',
              modelId: jobData.model_id,
              progress: jobData.progress || 0,
              message: `Job status from Oumi: ${jobData.status}`,
              oumiData: jobData,
            });
            return;
          }
        } catch (apiError: any) {
          console.warn('Oumi API status check failed:', apiError.message);
        }
      }

      // Fallback: return mock/unknown status
      res.json({
        jobId,
        status: 'unknown',
        message: 'Oumi API not configured. Check job status manually via Oumi CLI or dashboard',
        instructions: [
          'Use Oumi CLI: oumi jobs status <jobId>',
          'Or check Oumi dashboard if deployed',
          'See: https://oumi.ai/docs/en/latest/user_guides/train/train.html',
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
