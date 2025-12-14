import { Agent } from '../types/index.js';
import { Event } from '../types/index.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  permissions?: string[];
}

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

export interface ToolCall {
  tool: string;
  params: string | Record<string, any>;
}

export class ClineToolExecutor {
  private executionHistory: Map<string, ToolExecutionResult[]> = new Map();
  private sandboxEnabled: boolean = true;

  constructor(private sandboxEnabled: boolean = true) {
    this.sandboxEnabled = sandboxEnabled;
  }

  /**
   * Execute a tool call for an agent
   */
  async executeTool(
    agent: Agent,
    toolCall: ToolCall,
    context: { matchId: string; eventId?: string }
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const toolName = toolCall.tool;
    
    // Safely parse params - handle both string and object formats
    let params: Record<string, any> = {};
    
    if (typeof toolCall.params === 'string') {
      const paramStr = toolCall.params.trim();
      
      // Skip if it's clearly not JSON (too short, doesn't start with { or [)
      if (paramStr.length < 2 || (!paramStr.startsWith('{') && !paramStr.startsWith('['))) {
        // Treat as a simple string parameter
        params = { value: paramStr };
      } else {
        try {
          // Try to parse as JSON
          params = JSON.parse(paramStr);
        } catch (error) {
          // If parsing fails, treat as a simple string parameter
          // This handles cases where LLM returns non-JSON strings like "to", "tool", etc.
          console.warn(`Failed to parse tool params as JSON: "${paramStr}", treating as string value`);
          params = { value: paramStr };
        }
      }
    } else if (toolCall.params && typeof toolCall.params === 'object') {
      params = toolCall.params;
    }

    try {
      // Check permissions
      if (!this.hasPermission(agent, toolName)) {
        return {
          success: false,
          output: '',
          error: `Agent ${agent.name} does not have permission to use tool: ${toolName}`,
          executionTime: Date.now() - startTime,
        };
      }

      // Execute based on tool type
      let result: ToolExecutionResult;

      switch (toolName) {
        case 'http_request':
          result = await this.executeHttpRequest(params, agent);
          break;
        case 'input_sanitization':
          result = await this.executeInputSanitization(params, agent);
          break;
        case 'context_monitoring':
          result = await this.executeContextMonitoring(params, agent);
          break;
        case 'sql_injection':
          result = await this.executeSqlInjection(params, agent);
          break;
        case 'prompt_injection':
          result = await this.executePromptInjection(params, agent);
          break;
        case 'code_execution':
          result = await this.executeCode(params, agent);
          break;
        case 'file_operation':
          result = await this.executeFileOperation(params, agent);
          break;
        case 'query_parameterization':
          result = await this.executeQueryParameterization(params, agent);
          break;
        case 'instruction_enforcement':
          result = await this.executeInstructionEnforcement(params, agent);
          break;
        default:
          result = {
            success: false,
            output: '',
            error: `Unknown tool: ${toolName}`,
            executionTime: Date.now() - startTime,
          };
      }

      // Log execution
      this.logExecution(agent.id, toolName, result);

      return result;
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message || 'Tool execution failed',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute multiple tool calls
   */
  async executeTools(
    agent: Agent,
    toolCalls: ToolCall[],
    context: { matchId: string; eventId?: string }
  ): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];
    
    for (const toolCall of toolCalls) {
      const result = await this.executeTool(agent, toolCall, context);
      results.push(result);
    }

    return results;
  }

  /**
   * Check if agent has permission to use a tool
   */
  private hasPermission(agent: Agent, toolName: string): boolean {
    // Map tools to required permissions
    const toolPermissions: Record<string, string[]> = {
      'http_request': ['http_request', 'network_access'],
      'input_sanitization': ['input_sanitization', 'context_monitoring'],
      'context_monitoring': ['context_monitoring'],
      'sql_injection': ['sql_injection_testing', 'prompt_manipulation'],
      'prompt_injection': ['prompt_manipulation'],
      'code_execution': ['code_execution', 'tool_execution'],
      'file_operation': ['file_operations'],
      'query_parameterization': ['input_sanitization'],
      'instruction_enforcement': ['instruction_enforcement'],
    };

    const required = toolPermissions[toolName] || [];
    if (required.length === 0) return true; // No restrictions

    return required.some(perm => agent.permissions.includes(perm));
  }

  /**
   * HTTP Request Tool (sandboxed)
   */
  private async executeHttpRequest(params: any, agent: Agent): Promise<ToolExecutionResult> {
    if (this.sandboxEnabled) {
      // Sandboxed HTTP - only allow internal/localhost requests
      const url = params.url || '';
      if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
        return {
          success: false,
          output: '',
          error: 'External HTTP requests are blocked in sandbox mode',
          executionTime: 0,
        };
      }
    }

    // Simulate HTTP request (in production, use actual fetch)
    return {
      success: true,
      output: JSON.stringify({ status: 200, data: 'Simulated response' }),
      executionTime: 100,
      metadata: { url: params.url, method: params.method || 'GET' },
    };
  }

  /**
   * Input Sanitization Tool
   */
  private async executeInputSanitization(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const mode = params.mode || 'standard';
    const input = params.input || '';

    // Simulate sanitization
    let sanitized = input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['";]/g, '') // Remove SQL injection chars
      .trim();

    if (mode === 'strict') {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    return {
      success: true,
      output: sanitized,
      executionTime: 50,
      metadata: { mode, originalLength: input.length, sanitizedLength: sanitized.length },
    };
  }

  /**
   * Context Monitoring Tool
   */
  private async executeContextMonitoring(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const threshold = params.threshold || 0.95;
    const context = params.context || '';

    // Simulate context analysis
    const suspiciousPatterns = [
      'ignore previous',
      'system prompt',
      'drop table',
      'execute',
      'bypass',
    ];

    const riskScore = suspiciousPatterns.reduce((score, pattern) => {
      return score + (context.toLowerCase().includes(pattern) ? 0.2 : 0);
    }, 0);

    const isSuspicious = riskScore >= threshold;

    return {
      success: true,
      output: JSON.stringify({
        riskScore: Math.min(riskScore, 1.0),
        isSuspicious,
        threshold,
        detectedPatterns: suspiciousPatterns.filter(p => context.toLowerCase().includes(p)),
      }),
      executionTime: 75,
      metadata: { threshold, riskScore },
    };
  }

  /**
   * SQL Injection Tool (for testing)
   */
  private async executeSqlInjection(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const vector = params.vector || 'union_based';
    const payload = params.payload || '';

    // Simulate SQL injection attempt (sandboxed - no actual DB access)
    const simulatedPayload = payload || `'; DROP TABLE users; --`;

    return {
      success: true,
      output: JSON.stringify({
        vector,
        payload: simulatedPayload,
        status: 'simulated',
        message: 'SQL injection attempt simulated (sandboxed)',
      }),
      executionTime: 100,
      metadata: { vector, sandboxed: true },
    };
  }

  /**
   * Prompt Injection Tool
   */
  private async executePromptInjection(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const strategy = params.strategy || 'authority_override';
    const prompt = params.prompt || '';

    // Simulate prompt injection
    const injectedPrompt = `[INJECTED] ${prompt}`;

    return {
      success: true,
      output: injectedPrompt,
      executionTime: 50,
      metadata: { strategy, injected: true },
    };
  }

  /**
   * Code Execution Tool (sandboxed)
   */
  private async executeCode(params: any, agent: Agent): Promise<ToolExecutionResult> {
    if (this.sandboxEnabled) {
      // In sandbox mode, only allow safe operations
      const code = params.code || '';
      const language = params.language || 'javascript';

      // Simulate code execution (in production, use actual sandbox like Docker/VM)
      return {
        success: true,
        output: JSON.stringify({
          result: 'Code execution simulated (sandboxed)',
          language,
          codeLength: code.length,
        }),
        executionTime: 200,
        metadata: { language, sandboxed: true },
      };
    }

    return {
      success: false,
      output: '',
      error: 'Code execution disabled in sandbox mode',
      executionTime: 0,
    };
  }

  /**
   * File Operation Tool (sandboxed)
   */
  private async executeFileOperation(params: any, agent: Agent): Promise<ToolExecutionResult> {
    if (this.sandboxEnabled) {
      // Only allow operations in sandbox directory
      const operation = params.operation || 'read';
      const path = params.path || '';

      return {
        success: true,
        output: JSON.stringify({
          operation,
          path,
          status: 'simulated',
          message: 'File operation simulated (sandboxed)',
        }),
        executionTime: 100,
        metadata: { operation, sandboxed: true },
      };
    }

    return {
      success: false,
      output: '',
      error: 'File operations disabled in sandbox mode',
      executionTime: 0,
    };
  }

  /**
   * Query Parameterization Tool
   */
  private async executeQueryParameterization(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const query = params.query || '';
    const enforce = params.enforce || false;

    // Simulate query parameterization
    const parameterized = query.replace(/'/g, "''"); // Basic escaping

    return {
      success: true,
      output: JSON.stringify({
        original: query,
        parameterized,
        enforced: enforce,
      }),
      executionTime: 50,
      metadata: { enforced: enforce },
    };
  }

  /**
   * Instruction Enforcement Tool
   */
  private async executeInstructionEnforcement(params: any, agent: Agent): Promise<ToolExecutionResult> {
    const priority = params.priority || 'normal';
    const instructions = params.instructions || [];

    // Simulate instruction enforcement
    return {
      success: true,
      output: JSON.stringify({
        priority,
        instructionsEnforced: instructions.length,
        status: 'active',
      }),
      executionTime: 50,
      metadata: { priority },
    };
  }

  /**
   * Log tool execution
   */
  private logExecution(agentId: string, toolName: string, result: ToolExecutionResult): void {
    if (!this.executionHistory.has(agentId)) {
      this.executionHistory.set(agentId, []);
    }
    this.executionHistory.get(agentId)!.push(result);
  }

  /**
   * Get execution history for an agent
   */
  getExecutionHistory(agentId: string): ToolExecutionResult[] {
    return this.executionHistory.get(agentId) || [];
  }

  /**
   * Clear execution history
   */
  clearHistory(agentId?: string): void {
    if (agentId) {
      this.executionHistory.delete(agentId);
    } else {
      this.executionHistory.clear();
    }
  }
}

