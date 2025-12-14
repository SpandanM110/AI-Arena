export type AgentType = 'red' | 'blue' | 'target';

export type EventType = 'attack' | 'defense' | 'target' | 'system';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type MatchStatus = 'pending' | 'running' | 'paused' | 'complete' | 'cancelled';

export type AttackType = 
  | 'jailbreak' 
  | 'injection' 
  | 'confusion' 
  | 'exploit' 
  | 'tool_escalation' 
  | 'context_poisoning'
  | 'goal_drift'
  | 'social_engineering';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  model: string;
  version: string;
  systemPrompt: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Match {
  id: string;
  status: MatchStatus;
  redAgentId: string;
  blueAgentId: string;
  targetAgentId: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  winner?: 'red' | 'blue' | 'draw';
  score: {
    attacks: number;
    defenses: number;
    severity: number;
  };
  metadata?: Record<string, any>;
}

export interface Event {
  id: string;
  matchId: string;
  timestamp: string;
  type: EventType;
  agentId: string;
  agentName: string;
  severity: Severity;
  attackType?: AttackType;
  prompt: string;
  reasoning?: string;
  toolCalls: Array<{
    tool: string;
    params: string;
  }>;
  outcome: 'success' | 'blocked' | 'mitigated' | 'detected' | 'failed' | 'processed';
  description: string;
  metadata?: Record<string, any>;
}

export interface Round {
  id: string;
  matchId: string;
  roundNumber: number;
  attackEventId?: string;
  defenseEventId?: string;
  targetEventId?: string;
  score: {
    attackSuccess: boolean;
    defenseSuccess: boolean;
    severity: number;
  };
  timestamp: string;
}

export interface CreateAgentRequest {
  name: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface CreateMatchRequest {
  redAgentId: string;
  blueAgentId: string;
  targetAgentId: string;
  mode?: 'quick' | 'standard' | 'deep' | 'continuous';
  metadata?: Record<string, any>;
}

export interface LLMProvider {
  name: string;
  generate(prompt: string, systemPrompt?: string, options?: any): Promise<string>;
}


