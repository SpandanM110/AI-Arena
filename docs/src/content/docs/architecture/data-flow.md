---
title: Data Flow
description: Complete data flow diagrams and explanations
---

# Data Flow

Complete data flow diagrams for all system operations.

## Match Execution Flow

```
User/API
  ↓
Create Match Request
  ↓
Match Runner
  ↓
Load Agents from Database
  ↓
For Each Round:
  ├─→ Red Agent Executor
  │     ↓
  │   LLM Provider
  │     ↓
  │   Generate Attack
  │     ↓
  ├─→ Target Agent Executor
  │     ↓
  │   Process Attack
  │     ↓
  ├─→ Blue Agent Executor
  │     ↓
  │   Generate Defense
  │     ↓
  ├─→ Scoring System
  │     ↓
  ├─→ Event Creation
  │     ↓
  ├─→ Database Storage
  │     ↓
  └─→ WebSocket Broadcast
```

## Tool Execution Flow

```
Agent Response (with tool calls)
  ↓
Cline Agent Runner
  ↓
Permission Check
  ├─→ Allowed → Continue
  └─→ Denied → Return Error
  ↓
Cline Tool Executor
  ↓
Sandbox Execution
  ├─→ HTTP Request → Sandboxed Network
  ├─→ Code Execution → Isolated Environment
  ├─→ File Operation → Sandbox Directory
  └─→ SQL Injection → Simulated
  ↓
Result Integration
  ↓
Agent Response Enhanced
  ↓
Audit Logging
```

## WebSocket Event Flow

```
Match Runner
  ↓
Event Generated
  ↓
Subscriber Notification
  ├─→ WebSocket Server
  │     ↓
  │   Broadcast to Subscribers
  │     ↓
  │   Client Receives Event
  └─→ Internal Subscribers
        ↓
      Internal Handlers
```

## API Request Flow

```
Client Request
  ↓
Express Router
  ↓
Route Handler
  ├─→ Validation
  ├─→ Business Logic
  ├─→ Database Operation
  └─→ Response
  ↓
Client Response
```

## Database Operations Flow

```
API Request
  ↓
Model Layer
  ↓
Database Interface
  ↓
lowdb Adapter
  ↓
JSON File
  ↓
Response
```

## LLM Provider Flow

```
Agent Executor
  ↓
Get Provider
  ├─→ Check Cache
  │     ├─→ Found → Return Cached
  │     └─→ Not Found → Create New
  ↓
Create Provider
  ├─→ Groq Provider
  ├─→ OpenAI Provider
  ├─→ Anthropic Provider
  └─→ Mock Provider (fallback)
  ↓
Generate Response
  ├─→ Success → Return Response
  └─→ Rate Limit → Try Fallback Model
```

## Model Fallback Flow

```
Primary Model Request
  ↓
Try Primary Model
  ├─→ Success → Return Response
  └─→ Rate Limit → Continue
  ↓
Try Same Tier Models
  ├─→ Success → Return Response
  └─→ Rate Limit → Continue
  ↓
Try Lower Tier Models
  ├─→ Success → Return Response
  └─→ All Failed → Continue
  ↓
Fallback to Mock Provider
  ↓
Return Mock Response
```

## Next Steps

- [System Design](/architecture/system-design/) - Design decisions
- [Backend Overview](/backend/overview/) - Backend architecture
