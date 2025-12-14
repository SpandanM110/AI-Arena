// Using native fetch (Node.js 18+)
// For older versions, uncomment: import fetch from 'node-fetch';

export interface KestraFlow {
  id: string;
  namespace: string;
  inputs?: Record<string, any>;
}

export interface KestraExecution {
  id: string;
  flowId: string;
  namespace: string;
  state: string;
  outputs?: Record<string, any>;
}

export class KestraClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: any = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Use native fetch (Node.js 18+) or node-fetch for older versions
    const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
    
    const response = await fetchFn(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kestra API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createExecution(flow: KestraFlow): Promise<KestraExecution> {
    return this.request('/api/v1/executions', {
      method: 'POST',
      body: JSON.stringify({
        namespace: flow.namespace,
        flowId: flow.id,
        inputs: flow.inputs || {},
      }),
    });
  }

  async getExecution(executionId: string): Promise<KestraExecution> {
    return this.request(`/api/v1/executions/${executionId}`);
  }

  async listExecutions(namespace?: string, flowId?: string, limit = 100): Promise<KestraExecution[]> {
    const params = new URLSearchParams();
    if (namespace) params.append('namespace', namespace);
    if (flowId) params.append('flowId', flowId);
    params.append('limit', limit.toString());

    return this.request(`/api/v1/executions?${params.toString()}`);
  }

  async triggerMatch(redAgentId: string, blueAgentId: string, targetAgentId: string, mode = 'standard'): Promise<KestraExecution> {
    return this.createExecution({
      id: 'match-orchestration',
      namespace: '',
      inputs: {
        red_agent_id: redAgentId,
        blue_agent_id: blueAgentId,
        target_agent_id: targetAgentId,
        match_mode: mode,
      },
    });
  }

  async triggerScheduledMatches(cronExpression?: string): Promise<KestraExecution> {
    return this.createExecution({
      id: 'scheduled-matches',
      namespace: '',
      inputs: {
        schedule_cron: cronExpression || '0 */6 * * *',
      },
    });
  }

  async triggerContinuousMonitoring(targetAgentId: string, intervalMinutes = 60): Promise<KestraExecution> {
    return this.createExecution({
      id: 'continuous-monitoring',
      namespace: '',
      inputs: {
        target_agent_id: targetAgentId,
        monitoring_interval_minutes: intervalMinutes,
      },
    });
  }

  async triggerDatasetGeneration(matchIds?: string[], minSeverity = 5.0): Promise<KestraExecution> {
    return this.createExecution({
      id: 'dataset-generation',
      namespace: '',
      inputs: {
        match_ids: matchIds,
        min_severity: minSeverity,
        export_format: 'jsonl',
      },
    });
  }

  async triggerAgentFineTuning(agentId: string, agentType: 'red' | 'blue' | 'target', trainingMatchesCount = 50): Promise<KestraExecution> {
    return this.createExecution({
      id: 'agent-fine-tuning',
      namespace: '',
      inputs: {
        agent_id: agentId,
        agent_type: agentType,
        training_matches_count: trainingMatchesCount,
      },
    });
  }

  async triggerBatchEvaluation(agentCombinations: Array<{ red_agent_id: string; blue_agent_id: string; target_agent_id: string }>, matchesPerCombination = 3): Promise<KestraExecution> {
    return this.createExecution({
      id: 'batch-evaluation',
      namespace: '',
      inputs: {
        agent_combinations: agentCombinations,
        matches_per_combination: matchesPerCombination,
      },
    });
  }
}

