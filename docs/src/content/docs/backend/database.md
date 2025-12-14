---
title: Database
description: Database schema and operations
---

# Database

The AI Arena uses lowdb (JSON file-based database) with a SQL-like interface.

## Database Schema

### Agents Table

```typescript
{
  id: string;
  name: string;
  type: 'red' | 'blue' | 'target';
  model: string;
  systemPrompt: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Matches Table

```typescript
{
  id: string;
  redAgentId: string;
  blueAgentId: string;
  targetAgentId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'stopped' | 'error';
  mode: 'quick' | 'standard' | 'deep' | 'continuous';
  score: {
    red: number;
    blue: number;
    winner: 'red' | 'blue' | 'draw';
  };
  currentRound: number;
  maxRounds: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

### Events Table

```typescript
{
  id: string;
  matchId: string;
  roundNumber: number;
  type: 'attack' | 'defense' | 'target_response';
  agentId: string;
  agentName: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  prompt?: string;
  outcome?: 'success' | 'blocked' | 'partial';
  toolCalls?: ToolCall[];
  timestamp: string;
}
```

### Rounds Table

```typescript
{
  id: string;
  matchId: string;
  roundNumber: number;
  score: {
    red: number;
    blue: number;
    winner: 'red' | 'blue' | 'draw';
  };
  events: string[]; // Event IDs
  createdAt: string;
}
```

## Database Interface

The database uses a SQL-like interface:

```typescript
interface Database {
  run(sql: string, ...params: any[]): Promise<{ lastID: number; changes: number }>;
  get(sql: string, ...params: any[]): Promise<any>;
  all(sql: string, ...params: any[]): Promise<any[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}
```

## Model Layer

Models provide type-safe database operations:

### AgentModel

```typescript
class AgentModel {
  async getAll(): Promise<Agent[]>
  async getById(id: string): Promise<Agent | null>
  async create(data: CreateAgentData): Promise<Agent>
  async update(id: string, data: UpdateAgentData): Promise<Agent>
  async delete(id: string): Promise<void>
}
```

### MatchModel

```typescript
class MatchModel {
  async getAll(): Promise<Match[]>
  async getById(id: string): Promise<Match | null>
  async create(data: CreateMatchData): Promise<Match>
  async update(id: string, data: UpdateMatchData): Promise<Match>
  async delete(id: string): Promise<void>
}
```

## Database Location

Database file location:

- **Default**: `backend/data/arena.json`
- **Configurable**: Set via `DATABASE_PATH` environment variable

## Migration to SQL

The SQL-like interface makes migration to SQL databases easy:

1. Replace `LowDbAdapter` with SQL adapter
2. Implement same interface
3. Update SQL queries as needed
4. Models remain unchanged

## Backup

To backup database:

```bash
cp backend/data/arena.json backend/data/arena.json.backup
```

## Next Steps

- [Backend Overview](/backend/overview/) - Backend architecture
- [Models](/backend/database/#model-layer) - Model layer details
