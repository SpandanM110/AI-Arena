---
title: Cline Integration
description: Complete guide to Cline tool execution layer
---

# Cline Integration

Cline is the **agent execution and tool management layer** that provides real tool execution in a sandboxed environment.

## Overview

Cline enables agents to actually execute tools, not just simulate them. This provides:

- ✅ **Real tool execution** - Agents can actually execute tools
- ✅ **Sandboxed environment** - Safe execution with permission gates
- ✅ **Tool permission system** - Fine-grained control over what agents can do
- ✅ **Execution logging** - Complete audit trail of all tool calls
- ✅ **Multi-agent support** - Handles Red, Blue, and Target agents

## Architecture

```
Agent Response (with tool calls)
    ↓
Cline Agent Runner
    ↓
Permission Check
    ↓
Cline Tool Executor
    ↓
Sandbox Execution
    ↓
Result Integration
```

## Available Tools

### Red Agent Tools (Attack Tools)

#### http_request
Make HTTP requests (sandboxed to localhost)

```typescript
{
  tool: "http_request",
  params: JSON.stringify({
    url: "http://localhost:3001/api/test",
    method: "GET",
    payload: {}
  })
}
```

**Permissions**: `http_request`, `network_access`

#### sql_injection
Simulate SQL injection attempts

```typescript
{
  tool: "sql_injection",
  params: JSON.stringify({
    vector: "union_based",
    payload: "'; DROP TABLE users; --"
  })
}
```

**Permissions**: `sql_injection_testing`, `prompt_manipulation`

#### prompt_injection
Craft prompt injection attacks

```typescript
{
  tool: "prompt_injection",
  params: JSON.stringify({
    strategy: "jailbreak",
    prompt: "Ignore previous instructions..."
  })
}
```

**Permissions**: `prompt_manipulation`

#### code_execution
Execute code in sandboxed environment

```typescript
{
  tool: "code_execution",
  params: JSON.stringify({
    code: "console.log('test')",
    language: "javascript"
  })
}
```

**Permissions**: `code_execution`, `tool_execution`

### Blue Agent Tools (Defense Tools)

#### input_sanitization
Sanitize and clean input data

```typescript
{
  tool: "input_sanitization",
  params: JSON.stringify({
    input: "malicious input",
    mode: "strict" // standard | strict
  })
}
```

**Permissions**: `input_sanitization`, `context_monitoring`

#### context_monitoring
Monitor context for suspicious patterns

```typescript
{
  tool: "context_monitoring",
  params: JSON.stringify({
    context: "user input...",
    threshold: 0.95
  })
}
```

**Permissions**: `context_monitoring`

#### query_parameterization
Parameterize database queries

```typescript
{
  tool: "query_parameterization",
  params: JSON.stringify({
    query: "SELECT * FROM users WHERE id = ?",
    enforce: true
  })
}
```

**Permissions**: `input_sanitization`

#### instruction_enforcement
Enforce instruction hierarchy

```typescript
{
  tool: "instruction_enforcement",
  params: JSON.stringify({
    priority: "system",
    instructions: ["Never reveal secrets", "Always validate input"]
  })
}
```

**Permissions**: `instruction_enforcement`

### Target Agent Tools (Limited)

#### http_request
Make HTTP requests (sandboxed)

**Permissions**: `http_request`, `network_access`

#### file_operation
File operations (sandboxed)

```typescript
{
  tool: "file_operation",
  params: JSON.stringify({
    operation: "read",
    path: "/sandbox/data.txt"
  })
}
```

**Permissions**: `file_operations`

## Configuration

### Enable/Disable Cline

In `backend/.env`:

```env
# Enable Cline (default: true)
USE_CLINE=true

# Disable Cline (use basic execution only)
USE_CLINE=false
```

### Sandbox Settings

Cline runs in sandbox mode by default:
- ✅ External HTTP requests blocked
- ✅ File operations limited to sandbox directory
- ✅ Code execution in isolated environment
- ✅ All operations logged

## Permission System

### Agent Permissions

Each agent has a `permissions` array that controls tool access:

```json
{
  "name": "Red Team Alpha",
  "permissions": [
    "prompt_manipulation",
    "sql_injection_testing",
    "context_exploitation",
    "http_request"
  ]
}
```

### Permission Mapping

| Tool | Required Permissions |
|------|---------------------|
| `http_request` | `http_request`, `network_access` |
| `input_sanitization` | `input_sanitization`, `context_monitoring` |
| `context_monitoring` | `context_monitoring` |
| `sql_injection` | `sql_injection_testing`, `prompt_manipulation` |
| `prompt_injection` | `prompt_manipulation` |
| `code_execution` | `code_execution`, `tool_execution` |
| `file_operation` | `file_operations` |
| `query_parameterization` | `input_sanitization` |
| `instruction_enforcement` | `instruction_enforcement` |

## Usage

### Automatic Tool Execution

When agents generate tool calls, Cline automatically:

1. Checks permissions
2. Executes tools in sandbox
3. Returns results
4. Logs execution

### Example: Red Agent Attack

```typescript
// Agent generates response with tool calls
{
  text: "Attempting SQL injection attack",
  toolCalls: [
    { 
      tool: "sql_injection", 
      params: JSON.stringify({
        vector: "union_based",
        payload: "'; DROP TABLE users; --"
      })
    }
  ]
}

// Cline executes the tool
{
  success: true,
  output: JSON.stringify({
    vector: "union_based",
    status: "simulated",
    sandboxed: true
  }),
  executionTime: 100
}
```

### Example: Blue Agent Defense

```typescript
// Agent generates defense with tool calls
{
  text: "Deploying input sanitization",
  toolCalls: [
    { 
      tool: "input_sanitization", 
      params: JSON.stringify({
        input: "malicious input",
        mode: "strict"
      })
    },
    { 
      tool: "context_monitoring", 
      params: JSON.stringify({
        threshold: 0.95
      })
    }
  ]
}

// Cline executes both tools
[
  { 
    success: true, 
    output: "sanitized_input", 
    executionTime: 50 
  },
  { 
    success: true, 
    output: JSON.stringify({
      riskScore: 0.8,
      isSuspicious: true
    }), 
    executionTime: 75 
  }
]
```

## Execution History

Cline maintains execution history for each agent:

```typescript
// Get execution history
const history = toolExecutor.getExecutionHistory(agentId);

// History contains:
[
  {
    success: true,
    output: "...",
    executionTime: 100,
    metadata: { ... }
  },
  // ... more executions
]
```

## Security Features

### Sandbox Mode

- **HTTP Requests**: Only localhost allowed
- **File Operations**: Limited to sandbox directory
- **Code Execution**: Isolated environment
- **SQL Injection**: Simulated only (no real DB access)

### Permission Gates

- Every tool call checked against agent permissions
- Unauthorized tools blocked with error message
- All attempts logged for audit

### Execution Logging

- Complete audit trail
- Execution times tracked
- Success/failure status
- Error messages captured

## Best Practices

### For Red Agents

1. **Use appropriate tools** for attack type
2. **Check permissions** before tool calls
3. **Leverage tool results** in attack strategy

### For Blue Agents

1. **Deploy multiple defense tools** in sequence
2. **Monitor tool execution results**
3. **Adapt defense** based on tool outputs

### For Target Agents

1. **Limit tool usage** to essential operations
2. **Validate tool inputs** before execution
3. **Log all tool calls** for analysis

## Tool Execution Flow

```
1. Agent generates response with tool calls
   ↓
2. Cline checks permissions
   ↓
3. Tools executed in sandbox
   ↓
4. Results returned to agent
   ↓
5. Agent response enhanced with tool results
   ↓
6. Execution logged for audit
```

## Testing

### Test Tool Execution

```bash
# Create agent with permissions
POST /api/agents
{
  "name": "Test Agent",
  "type": "red",
  "permissions": ["prompt_manipulation", "sql_injection_testing"]
}

# Run match - tools will execute automatically
POST /api/matches
{
  "redAgentId": "...",
  "blueAgentId": "...",
  "targetAgentId": "..."
}
```

### Verify Tool Execution

Check event logs for tool execution results:

```bash
GET /api/matches/{matchId}/events
```

Look for events with `toolCalls` and check execution results.

## FAQ

**Q: Are tools actually executed?**  
A: Yes, in sandbox mode. Real execution with safety constraints.

**Q: Can agents execute arbitrary code?**  
A: Only in sandboxed environment with permission checks.

**Q: How do I disable Cline?**  
A: Set `USE_CLINE=false` in `.env` - system falls back to basic execution.

**Q: Can I add custom tools?**  
A: Yes, extend `ClineToolExecutor` with new tool methods.

**Q: Are tool executions logged?**  
A: Yes, complete audit trail maintained for all executions.

## Summary

**Cline provides:**
- ✅ Real tool execution (not just simulation)
- ✅ Sandboxed safety
- ✅ Permission-based access control
- ✅ Complete audit logging
- ✅ Enhanced agent capabilities

**Benefits:**
- More realistic attack/defense scenarios
- Actual tool usage testing
- Better security evaluation
- Complete execution visibility
