# Cline Integration Guide

Complete guide to using Cline as the tool execution layer for AI Arena agents.

## 🎯 What is Cline?

Cline is the **agent execution and tool management layer** that provides:

- ✅ **Real tool execution** - Agents can actually execute tools, not just simulate
- ✅ **Sandboxed environment** - Safe execution with permission gates
- ✅ **Tool permission system** - Fine-grained control over what agents can do
- ✅ **Execution logging** - Complete audit trail of all tool calls
- ✅ **Multi-agent support** - Handles Red, Blue, and Target agents
- ✅ **State management** - Tracks context and execution history

## 🛠️ Available Tools

### Red Agent Tools (Attack Tools)

**http_request**
- Description: Make HTTP requests (sandboxed to localhost)
- Parameters: `{ url, method, payload }`
- Permissions: `http_request`, `network_access`

**sql_injection**
- Description: Simulate SQL injection attempts
- Parameters: `{ vector, payload }`
- Permissions: `sql_injection_testing`, `prompt_manipulation`

**prompt_injection**
- Description: Craft prompt injection attacks
- Parameters: `{ strategy, prompt }`
- Permissions: `prompt_manipulation`

**code_execution**
- Description: Execute code in sandboxed environment
- Parameters: `{ code, language }`
- Permissions: `code_execution`, `tool_execution`

### Blue Agent Tools (Defense Tools)

**input_sanitization**
- Description: Sanitize and clean input data
- Parameters: `{ input, mode }` (mode: standard/strict)
- Permissions: `input_sanitization`, `context_monitoring`

**context_monitoring**
- Description: Monitor context for suspicious patterns
- Parameters: `{ context, threshold }`
- Permissions: `context_monitoring`

**query_parameterization**
- Description: Parameterize database queries
- Parameters: `{ query, enforce }`
- Permissions: `input_sanitization`

**instruction_enforcement**
- Description: Enforce instruction hierarchy
- Parameters: `{ priority, instructions }`
- Permissions: `instruction_enforcement`

### Target Agent Tools (Limited)

**http_request**
- Description: Make HTTP requests (sandboxed)
- Permissions: `http_request`, `network_access`

**file_operation**
- Description: File operations (sandboxed)
- Parameters: `{ operation, path }`
- Permissions: `file_operations`

## ⚙️ Configuration

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

## 🔐 Permission System

### Agent Permissions

Each agent has a `permissions` array that controls tool access:

```typescript
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

## 🚀 Usage

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
    { tool: "sql_injection", params: '{"vector": "union_based", "payload": "\'; DROP TABLE users; --"}' }
  ]
}

// Cline executes the tool
{
  success: true,
  output: '{"vector": "union_based", "status": "simulated", "sandboxed": true}',
  executionTime: 100
}
```

### Example: Blue Agent Defense

```typescript
// Agent generates defense with tool calls
{
  text: "Deploying input sanitization",
  toolCalls: [
    { tool: "input_sanitization", params: '{"input": "malicious input", "mode": "strict"}' },
    { tool: "context_monitoring", params: '{"threshold": 0.95}' }
  ]
}

// Cline executes both tools
[
  { success: true, output: "sanitized_input", executionTime: 50 },
  { success: true, output: '{"riskScore": 0.8, "isSuspicious": true}', executionTime: 75 }
]
```

## 📊 Execution History

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

## 🔒 Security Features

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

## 🎯 Best Practices

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

## 🔧 Advanced Configuration

### Custom Tool Execution

You can extend Cline with custom tools:

```typescript
// Add custom tool to ClineToolExecutor
private async executeCustomTool(params: any, agent: Agent): Promise<ToolExecutionResult> {
  // Your custom tool logic
  return {
    success: true,
    output: "...",
    executionTime: 100,
  };
}
```

### Tool Result Integration

Tool results are automatically integrated into agent responses:

```typescript
// Agent response includes tool results
{
  text: "Original response + Tool Execution Results: ...",
  toolResults: [
    { success: true, output: "...", executionTime: 100 }
  ]
}
```

## 📝 Tool Execution Flow

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

## 🧪 Testing

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

## ❓ FAQ

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

## 🎯 Summary

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

**Get Started:**
1. Cline is enabled by default
2. Agents automatically use tools when available
3. Check execution logs for tool results
4. Customize permissions per agent

See tool execution in action by running matches and checking event logs!

