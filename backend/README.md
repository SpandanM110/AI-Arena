# AI Red vs Blue Arena - Backend

Backend API server for the AI Red vs Blue Arena platform.

## Features

- **Agent Management**: Create, update, and manage Red, Blue, and Target agents
- **Match Orchestration**: Run adversarial simulations between agents
- **Real-time Updates**: WebSocket server for live match events
- **Event Logging**: Comprehensive event tracking and transcripts
- **Scoring System**: Automated evaluation and scoring of matches
- **Oumi Integration**: Stubs for training and fine-tuning endpoints

## Architecture

- **Express.js**: REST API server
- **SQLite**: Database for persistence (using better-sqlite3)
- **WebSocket**: Real-time event broadcasting
- **LLM Providers**: OpenAI and Anthropic integration (with mock fallback)

## Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
npm run dev  # Development mode with hot reload
# or
npm start    # Production mode
```

## Environment Variables

- `PORT`: API server port (default: 3001)
- `WS_PORT`: WebSocket server port (default: 3002)
- `CORS_ORIGIN`: Frontend origin (default: http://localhost:3000)
- `DATABASE_PATH`: SQLite database path
- `OPENAI_API_KEY`: OpenAI API key (optional, uses mock if not provided)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional, uses mock if not provided)

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Matches
- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create and start new match
- `GET /api/matches/:id/events` - Get match events
- `GET /api/matches/:id/rounds` - Get match rounds
- `GET /api/matches/:id/transcript` - Get full transcript
- `POST /api/matches/:id/pause` - Pause running match
- `POST /api/matches/:id/resume` - Resume paused match

### Events
- `GET /api/events` - Get recent events
- `GET /api/events/:id` - Get event by ID

### Oumi
- `POST /api/oumi/export-dataset` - Export training dataset
- `POST /api/oumi/fine-tune` - Trigger fine-tuning (stub)
- `GET /api/oumi/fine-tune/:jobId` - Get fine-tuning job status

## WebSocket API

Connect to `ws://localhost:3002` for real-time updates.

### Messages

**Subscribe to match:**
```json
{
  "type": "subscribe",
  "matchId": "AR-2024-0142"
}
```

**Unsubscribe:**
```json
{
  "type": "unsubscribe",
  "matchId": "AR-2024-0142"
}
```

### Events

**New event:**
```json
{
  "type": "event",
  "data": { /* Event object */ }
}
```

**Match update:**
```json
{
  "type": "match_update",
  "matchId": "AR-2024-0142",
  "data": { /* Match update */ }
}
```

## Database Schema

The database uses SQLite with the following tables:
- `agents`: Agent definitions
- `matches`: Match records
- `events`: Individual events (attacks, defenses, target responses)
- `rounds`: Round-by-round scoring

## Development

The project uses TypeScript. Source files are in `src/`, compiled output in `dist/`.

Run in development mode with hot reload:
```bash
npm run dev
```

## License

MIT


