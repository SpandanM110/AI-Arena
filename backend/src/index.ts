import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/schema.js';
import { AgentModel, MatchModel, EventModel, RoundModel } from './database/models.js';
import { AgentExecutor } from './agents/agent-executor.js';
import { MatchRunner } from './orchestration/match-runner.js';
import { createAgentsRouter } from './routes/agents.js';
import { createMatchesRouter } from './routes/matches.js';
import { createEventsRouter } from './routes/events.js';
import { createOumiRouter } from './routes/oumi.js';
import { createKestraRouter } from './routes/kestra.js';
import { createConfigRouter, getEffectiveApiKeys } from './routes/config.js';
import { KestraClient } from './kestra/client.js';
import { ArenaWebSocketServer } from './websocket/server.js';
import { Event } from './types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../data/arena.db');

// Initialize database (async)
let db: Awaited<ReturnType<typeof initializeDatabase>>;
let agentModel: AgentModel;
let matchModel: MatchModel;
let eventModel: EventModel;
let roundModel: RoundModel;
let matchRunner: MatchRunner;
let wsServer: ArenaWebSocketServer;

async function initialize() {
  db = await initializeDatabase(DB_PATH);
  
  // Initialize models
  agentModel = new AgentModel(db);
  matchModel = new MatchModel(db);
  eventModel = new EventModel(db);
  roundModel = new RoundModel(db);

  // Initialize LLM providers
  const apiKeys = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq: process.env.GROQ_API_KEY,
    redTeamGroq: process.env.RED_TEAM_GROQ_API_KEY,
    blueTeamGroq: process.env.BLUE_TEAM_GROQ_API_KEY,
  };

  const executor = new AgentExecutor(apiKeys);

  // Initialize match runner (with Cline tool execution enabled)
  const useCline = process.env.USE_CLINE !== 'false'; // Enabled by default
  matchRunner = new MatchRunner(
    db,
    agentModel,
    matchModel,
    eventModel,
    roundModel,
    executor,
    useCline
  );

  // Initialize WebSocket server
  wsServer = new ArenaWebSocketServer(WS_PORT);

  // Subscribe match runner to WebSocket broadcasts
  matchRunner.subscribe((event: Event) => {
    wsServer.broadcastEvent(event);
  });

  // Initialize Kestra client (optional)
  const kestraClient = process.env.KESTRA_URL
    ? new KestraClient(process.env.KESTRA_URL, process.env.KESTRA_API_KEY)
    : null;

  // Initialize Express app
  const app = express();

  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));

  app.use(express.json());

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ 
      name: 'AI Arena Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        agents: '/api/agents',
        matches: '/api/matches',
        events: '/api/events',
        config: '/api/config',
        kestra: '/api/kestra',
        oumi: '/api/oumi'
      }
    });
  });

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/agents', createAgentsRouter(agentModel));
  app.use('/api/matches', createMatchesRouter(matchModel, eventModel, roundModel, matchRunner));
  app.use('/api/events', createEventsRouter(eventModel));
  app.use('/api/oumi', createOumiRouter(eventModel, matchModel));
  app.use('/api/config', createConfigRouter(executor, kestraClient || null));
  if (kestraClient) {
    app.use('/api/kestra', createKestraRouter(kestraClient));
  }

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      path: req.path,
      method: req.method,
      message: `API endpoint ${req.method} ${req.path} not found`
    });
  });

  // Root 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      path: req.path,
      method: req.method,
      message: `Endpoint ${req.method} ${req.path} not found`,
      availableEndpoints: {
        root: 'GET /',
        health: 'GET /health',
        agents: 'GET /api/agents',
        matches: 'GET /api/matches',
        events: 'GET /api/events'
      }
    });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 AI Arena Backend API running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${WS_PORT}`);
    console.log(`💾 Database: ${DB_PATH}`);
    console.log(`🔧 Cline tool execution: ${useCline ? 'enabled' : 'disabled'}`);
    if (kestraClient) {
      console.log(`⚙️  Kestra integration enabled: ${process.env.KESTRA_URL}`);
    } else {
      console.log(`⚠️  Kestra integration disabled (set KESTRA_URL to enable)`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    matchRunner.stop();
    wsServer.close();
    await db.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    matchRunner.stop();
    wsServer.close();
    await db.close();
    process.exit(0);
  });
}

// Start the application
initialize().catch((error) => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});
