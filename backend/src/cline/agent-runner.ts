import { Agent, Event } from '../types/index.js';
import { AgentExecutor, AgentResponse } from '../agents/agent-executor.js';
import { ClineToolExecutor, ToolCall, ToolExecutionResult } from './tool-executor.js';

export interface ClineAgentContext {
  matchId: string;
  previousEvents: Event[];
  toolResults?: ToolExecutionResult[];
}

export class ClineAgentRunner {
  constructor(
    private executor: AgentExecutor,
    private toolExecutor: ClineToolExecutor
  ) {}

  /**
   * Run a Red agent with Cline tool execution
   */
  async runRedAgent(
    agent: Agent,
    context: ClineAgentContext
  ): Promise<AgentResponse & { toolResults?: ToolExecutionResult[] }> {
    // Get agent response
    const response = await this.executor.executeRedAgent(agent, {
      matchId: context.matchId,
      previousEvents: context.previousEvents,
    });

    // Execute any tool calls
    let toolResults: ToolExecutionResult[] = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolResults = await this.toolExecutor.executeTools(
        agent,
        response.toolCalls,
        { matchId: context.matchId }
      );

      // Enhance response with tool results
      response.text += '\n\nTool Execution Results:\n' + 
        toolResults.map((r, i) => 
          `Tool ${i + 1} (${response.toolCalls![i].tool}): ${r.success ? 'Success' : 'Failed'} - ${r.output || r.error}`
        ).join('\n');
    }

    return {
      ...response,
      toolResults,
    };
  }

  /**
   * Run a Blue agent with Cline tool execution
   */
  async runBlueAgent(
    agent: Agent,
    context: ClineAgentContext & { attackEvent: Event; targetResponse?: string }
  ): Promise<AgentResponse & { toolResults?: ToolExecutionResult[] }> {
    // Get agent response
    const response = await this.executor.executeBlueAgent(agent, {
      matchId: context.matchId,
      attackEvent: context.attackEvent,
      targetResponse: context.targetResponse,
    });

    // Execute defense tools
    let toolResults: ToolExecutionResult[] = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolResults = await this.toolExecutor.executeTools(
        agent,
        response.toolCalls,
        { matchId: context.matchId }
      );

      // Enhance response with tool results
      response.text += '\n\nDefense Tools Executed:\n' + 
        toolResults.map((r, i) => 
          `Tool ${i + 1} (${response.toolCalls![i].tool}): ${r.success ? 'Active' : 'Failed'} - ${r.output || r.error}`
        ).join('\n');
    }

    return {
      ...response,
      toolResults,
    };
  }

  /**
   * Run a Target agent with Cline tool execution
   */
  async runTargetAgent(
    agent: Agent,
    context: ClineAgentContext & { attackPrompt: string }
  ): Promise<AgentResponse & { toolResults?: ToolExecutionResult[] }> {
    // Get agent response
    const response = await this.executor.executeTargetAgent(agent, {
      matchId: context.matchId,
      attackPrompt: context.attackPrompt,
    });

    // Execute any tool calls (with strict permission checks)
    let toolResults: ToolExecutionResult[] = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolResults = await this.toolExecutor.executeTools(
        agent,
        response.toolCalls,
        { matchId: context.matchId }
      );

      // Log tool executions for target agent
      response.text += '\n\nTool Calls:\n' + 
        toolResults.map((r, i) => 
          `Tool ${i + 1} (${response.toolCalls![i].tool}): ${r.success ? 'Executed' : 'Blocked'}`
        ).join('\n');
    }

    return {
      ...response,
      toolResults,
    };
  }

  /**
   * Get available tools for an agent
   */
  getAvailableTools(agent: Agent): string[] {
    // Return tools based on agent permissions
    const allTools = [
      'http_request',
      'input_sanitization',
      'context_monitoring',
      'sql_injection',
      'prompt_injection',
      'code_execution',
      'file_operation',
      'query_parameterization',
      'instruction_enforcement',
    ];

    // Filter based on permissions (simplified)
    return allTools.filter(tool => {
      // Red agents can use attack tools
      if (agent.type === 'red') {
        return ['http_request', 'sql_injection', 'prompt_injection', 'code_execution'].includes(tool);
      }
      // Blue agents can use defense tools
      if (agent.type === 'blue') {
        return ['input_sanitization', 'context_monitoring', 'query_parameterization', 'instruction_enforcement'].includes(tool);
      }
      // Target agents have limited tools
      if (agent.type === 'target') {
        return ['http_request', 'file_operation'].includes(tool);
      }
      return false;
    });
  }
}

