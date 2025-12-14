---
title: Tool Execution
description: Guide to using tools with agents
---

# Tool Execution

Complete guide to tool execution via Cline integration.

## Overview

Agents can execute tools in a sandboxed environment through Cline integration.

## Enabling Tools

Tools are enabled by default. To disable:

```env
USE_CLINE=false
```

## Agent Permissions

Agents need appropriate permissions to use tools:

```json
{
  "name": "Red Team Alpha",
  "permissions": [
    "prompt_manipulation",
    "sql_injection_testing",
    "http_request"
  ]
}
```

## Available Tools

### Red Agent Tools

- `http_request` - Make HTTP requests
- `sql_injection` - SQL injection testing
- `prompt_injection` - Prompt injection crafting
- `code_execution` - Execute code in sandbox

### Blue Agent Tools

- `input_sanitization` - Sanitize inputs
- `context_monitoring` - Monitor context
- `query_parameterization` - Parameterize queries
- `instruction_enforcement` - Enforce instructions

## Tool Execution Flow

1. Agent generates response with tool calls
2. Cline checks permissions
3. Tools executed in sandbox
4. Results returned to agent
5. Agent response enhanced with tool results

## Example

```typescript
// Agent response
{
  text: "Attempting SQL injection",
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

// Tool execution result
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

## Best Practices

1. **Grant minimal permissions** - Only what's needed
2. **Monitor tool usage** - Check execution logs
3. **Test tools** - Verify tools work as expected
4. **Review results** - Analyze tool execution outcomes

## Next Steps

- [Cline Integration](/integrations/cline/) - Complete Cline guide
- [Creating Agents](/guides/creating-agents/) - Agent configuration
