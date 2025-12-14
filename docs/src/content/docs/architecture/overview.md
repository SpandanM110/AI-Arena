---
title: Architecture Overview
description: High-level architecture of the AI Arena platform
---

# Architecture Overview

The AI Red vs Blue Arena is built on a modular architecture with clear separation of concerns.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │  Agents  │  │  Matches │  │ Settings │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                         │ HTTP/WS
        ┌────────────────┴────────────────┐
        │      Backend (Express.js)        │
        │  ┌──────────────────────────┐   │
        │  │      API Routes          │   │
        │  │  - Agents               │   │
        │  │  - Matches               │   │
        │  │  - Events                │   │
        │  │  - Config                │   │
        │  └──────────┬───────────────┘   │
        │             │                   │
        │  ┌──────────▼───────────────┐   │
        │  │   Match Runner           │   │
        │  │  - Orchestrates rounds   │   │
        │  │  - Manages state          │   │
        │  └──────────┬───────────────┘   │
        │             │                   │
        │  ┌──────────▼───────────────┐   │
        │  │   Agent Executor          │   │
        │  │  - LLM provider management│   │
        │  │  - Response generation     │   │
        │  └──────────┬───────────────┘   │
        │             │                   │
        │  ┌──────────▼───────────────┐   │
        │  │   Cline Integration       │   │
        │  │  - Tool execution         │   │
        │  │  - Sandboxing             │   │
        │  └──────────┬───────────────┘   │
        │             │                   │
        │  ┌──────────▼───────────────┐   │
        │  │   WebSocket Server        │   │
        │  │  - Real-time updates      │   │
        │  └──────────────────────────┘   │
        └────────────┬────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Database (lowdb)      │
        │  - Agents               │
        │  - Matches              │
        │  - Events               │
        │  - Rounds                │
        └─────────────────────────┘
```

## Data Flow

### Match Execution Flow

1. **User creates match** via Frontend/API
2. **Match Runner** loads agents from database
3. **For each round:**
   - Red Agent generates attack via Agent Executor
   - Target Agent processes attack
   - Blue Agent generates defense
   - Scoring system evaluates round
   - Events stored in database
   - WebSocket broadcasts updates
4. **Match completes** with final scores

### Tool Execution Flow

1. **Agent generates response** with tool calls
2. **Cline checks permissions**
3. **Tools executed in sandbox**
4. **Results returned to agent**
5. **Agent response enhanced** with tool results
6. **Execution logged** for audit

## Component Responsibilities

### Frontend
- User interface and visualization
- Real-time event display
- Agent and match management
- Settings configuration

### Backend API
- RESTful API endpoints
- Request validation
- Business logic orchestration
- Database operations

### Match Runner
- Round orchestration
- Agent coordination
- State management
- Event generation

### Agent Executor
- LLM provider management
- Response generation
- Model fallback handling
- API key management

### Cline Integration
- Tool execution
- Permission checking
- Sandboxing
- Audit logging

### Database
- Data persistence
- Query operations
- Schema management

### WebSocket Server
- Real-time event broadcasting
- Client subscription management
- Match updates

## Integration Points

### Kestra
- Workflow orchestration
- Scheduled matches
- Batch processing
- Dataset generation

### Oumi
- Training dataset export
- Fine-tuning job submission
- Model improvement pipeline

### LLM Providers
- Groq (primary)
- OpenAI
- Anthropic
- Mock (fallback)

## Security Architecture

- **Sandboxed execution** for all tool calls
- **Permission-based access control**
- **Input validation** at all layers
- **Audit logging** for all operations
- **CORS protection** for API
- **Rate limiting** via model fallback

## Scalability Considerations

- **Stateless API** design
- **File-based database** (can be migrated to SQL)
- **WebSocket** for real-time updates
- **Modular architecture** for easy extension

## Next Steps

- [System Design](/architecture/system-design/) - Detailed design decisions
- [Data Flow](/architecture/data-flow/) - Complete data flow diagrams
