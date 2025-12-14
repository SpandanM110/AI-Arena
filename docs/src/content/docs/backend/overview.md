---
title: Backend Overview
description: Complete overview of the backend architecture
---

# Backend Overview

The backend is built with Express.js and provides the core API, orchestration, and agent execution capabilities.

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point, server setup
│   ├── agents/               # Agent execution layer
│   │   ├── agent-executor.ts # Main executor class
│   │   ├── groq-models.ts    # Groq model definitions
│   │   └── llm-providers.ts  # LLM provider abstraction
│   ├── cline/                # Cline tool execution
│   │   ├── agent-runner.ts   # Cline agent runner
│   │   └── tool-executor.ts  # Tool execution logic
│   ├── database/             # Database layer
│   │   ├── schema.ts         # Database initialization
│   │   └── models.ts         # Data models (Agent, Match, Event, Round)
│   ├── kestra/               # Kestra integration
│   │   └── client.ts         # Kestra API client
│   ├── orchestration/        # Match orchestration
│   │   └── match-runner.ts   # Match execution engine
│   ├── routes/               # API routes
│   │   ├── agents.ts         # Agent CRUD operations
│   │   ├── matches.ts        # Match management
│   │   ├── events.ts         # Event queries
│   │   ├── config.ts         # Configuration management
│   │   ├── kestra.ts         # Kestra API proxy
│   │   └── oumi.ts           # Oumi integration
│   ├── scoring/              # Evaluation system
│   │   └── evaluator.ts      # Scoring algorithms
│   ├── types/                # TypeScript types
│   │   └── index.ts          # Shared type definitions
│   ├── websocket/            # WebSocket server
│   │   └── server.ts         # WebSocket implementation
│   └── scripts/              # Utility scripts
│       └── seed.ts           # Database seeding
├── data/                     # Database files (created at runtime)
├── package.json
└── tsconfig.json
```

## Core Components

### Agent Executor

The `AgentExecutor` class manages LLM interactions:

- **Provider Management**: Handles multiple LLM providers (Groq, OpenAI, Anthropic, Mock)
- **Model Fallback**: Automatically tries fallback models on rate limits
- **Per-Team Keys**: Supports different API keys for Red/Blue teams
- **Response Generation**: Generates agent responses with tool calls

**Key Methods:**
- `executeRedAgent()` - Execute red team agent
- `executeBlueAgent()` - Execute blue team agent
- `executeTargetAgent()` - Execute target agent
- `updateApiKeys()` - Update API keys at runtime

### Match Runner

The `MatchRunner` class orchestrates match execution:

- **Round Management**: Executes attack/defense rounds
- **State Tracking**: Maintains match state and history
- **Event Generation**: Creates events for each action
- **Scoring**: Calculates scores for each round
- **Cline Integration**: Optionally uses Cline for tool execution

**Key Methods:**
- `runMatch()` - Start a match
- `pauseMatch()` - Pause running match
- `resumeMatch()` - Resume paused match
- `stopMatch()` - Stop match execution
- `subscribe()` - Subscribe to match events

### Database Models

Four main models:

1. **AgentModel**: Agent CRUD operations
2. **MatchModel**: Match management
3. **EventModel**: Event storage and queries
4. **RoundModel**: Round tracking

All models use a SQL-like interface over lowdb (JSON file storage).

### API Routes

- **`/api/agents`**: Agent management
- **`/api/matches`**: Match operations
- **`/api/events`**: Event queries
- **`/api/config`**: Configuration (API keys, Kestra settings)
- **`/api/kestra`**: Kestra workflow triggers
- **`/api/oumi`**: Oumi integration (dataset export, fine-tuning)

### WebSocket Server

Real-time event broadcasting:

- **Event Broadcasting**: Sends events to subscribed clients
- **Match Updates**: Broadcasts match status changes
- **Subscription Management**: Handles client subscriptions

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: lowdb (JSON file-based)
- **WebSocket**: ws library
- **TypeScript**: Full type safety
- **LLM SDKs**: Groq, OpenAI, Anthropic

## Key Features

- ✅ RESTful API design
- ✅ Real-time WebSocket updates
- ✅ Multiple LLM provider support
- ✅ Automatic model fallback
- ✅ Tool execution via Cline
- ✅ Permission-based access control
- ✅ Comprehensive error handling
- ✅ Type-safe codebase

## Next Steps

- [Agents](/backend/agents/) - Agent execution details
- [Routes & API](/backend/routes/) - API endpoint documentation
- [Database](/backend/database/) - Database schema and operations
- [Orchestration](/backend/orchestration/) - Match runner details
