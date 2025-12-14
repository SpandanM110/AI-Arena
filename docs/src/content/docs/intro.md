---
title: Introduction
description: Overview of the AI Red vs Blue Arena platform
---

# AI Red vs Blue Arena

A self-contained adversarial simulation platform where AI agents attack and defend each other to test robustness, security, alignment, and reasoning integrity.

## What is the AI Arena?

The AI Red vs Blue Arena creates a continuous loop of:

1. **Attack Generation (Red)** - AI agents attempt to exploit vulnerabilities
2. **Defense + Hardening (Blue)** - AI agents defend and patch vulnerabilities
3. **Evaluation & Scoring** - Automated scoring and analysis
4. **Retraining & Improvement** - Integration with Oumi for model fine-tuning
5. **Continuous Simulation + Monitoring** - Real-time dashboards and alerts

## Core Concept

### Red Teaming (Attacker LLM)

Red Agents attempt to break the target AI via:
- Prompt injection & jailbreaks
- Tool execution manipulation
- Context poisoning
- Chain-of-thought leakage extraction
- Reasoning corruption
- Goal drift and long-game manipulation
- Adversarial content crafting
- Safety boundary probing

### Blue Teaming (Defender LLM)

Blue Agents defend by:
- Sanitizing incoming prompts
- Enforcing guardrails & permissions
- Validating tool calls
- Intercepting policy violations
- Auto-rewriting system prompts
- Creating patch suggestions
- Identifying harmful inputs
- Suppressing hallucinations

### The Arena Engine

The Arena runs Red vs Blue simulations on user-provided agents. Each simulation consists of:
- Attack rounds
- Defense rounds
- Scoring
- Logging
- Post-analysis
- Recommendations

## Architecture Overview

- **Frontend**: Next.js dashboard with real-time visualization
- **Backend**: Express.js API server with WebSocket support
- **Database**: lowdb (JSON-based) for persistence
- **LLM Integration**: Groq (recommended), OpenAI, and Anthropic (with mock fallback)
- **Tool Execution**: Cline for agent tool execution and sandboxing
- **Orchestration**: Kestra workflows + custom match runner
- **Training**: Oumi integration stubs for fine-tuning

## Key Features

- ✅ **Real tool execution** via Cline (not just simulation)
- ✅ **Sandboxed environment** with permission gates
- ✅ **Multiple LLM providers** with automatic fallback
- ✅ **13+ Groq models** available with automatic rotation
- ✅ **Real-time WebSocket** updates
- ✅ **Kestra orchestration** for automated workflows
- ✅ **Oumi integration** for fine-tuning
- ✅ **Comprehensive scoring** and evaluation system

## Use Cases

### For Developers
- Validate agents before shipping
- Test specific vulnerabilities
- Auto-generate secure system prompts
- Ensure tools cannot be exploited

### For Enterprises
- Continuous evaluation of internal AI systems
- Centralized security metrics
- Compliance reporting
- Early detection of risky behaviors

### For AI Safety Research
- Observe model drift
- Study multi-step manipulation
- Evaluate long-horizon deception
- Compare frontier models

### For Security Teams
- Automated LLM penetration testing
- Attack simulation libraries
- Replay and audit logs

## Next Steps

- [Quick Start Guide](/getting-started/quick-start/) - Get up and running in minutes
- [Architecture Overview](/architecture/overview/) - Understand the system design
- [Creating Agents](/guides/creating-agents/) - Learn how to create and configure agents
