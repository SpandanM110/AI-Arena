const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';

export interface Agent {
  id: string;
  name: string;
  type: 'red' | 'blue' | 'target';
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
  status: 'pending' | 'running' | 'paused' | 'complete' | 'cancelled';
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
  type: 'attack' | 'defense' | 'target' | 'system';
  agentId: string;
  agentName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attackType?: string;
  prompt: string;
  reasoning?: string;
  toolCalls: Array<{ tool: string; params: string }>;
  outcome: string;
  description: string;
  metadata?: Record<string, any>;
}

// Models API
export interface GroqModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  tier: 'fast' | 'balanced' | 'powerful';
}

export interface ModelsResponse {
  models: GroqModel[];
  recommended: GroqModel[];
  byTier: {
    fast: GroqModel[];
    balanced: GroqModel[];
    powerful: GroqModel[];
  };
}

export const modelsApi = {
  getAll: async (type?: 'red' | 'blue' | 'target'): Promise<ModelsResponse> => {
    const url = type ? `${API_BASE_URL}/agents/models?type=${type}` : `${API_BASE_URL}/agents/models`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },
};

// Agents API
export const agentsApi = {
  getAll: async (type?: 'red' | 'blue' | 'target'): Promise<Agent[]> => {
    const url = type ? `${API_BASE_URL}/agents?type=${type}` : `${API_BASE_URL}/agents`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  getById: async (id: string): Promise<Agent> => {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch agent');
    return res.json();
  },

  create: async (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> => {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    if (!res.ok) throw new Error('Failed to create agent');
    return res.json();
  },

  update: async (id: string, agent: Partial<Agent>): Promise<Agent> => {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    if (!res.ok) throw new Error('Failed to update agent');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete agent');
  },
};

// Matches API
export const matchesApi = {
  getAll: async (limit = 100, offset = 0): Promise<Match[]> => {
    const res = await fetch(`${API_BASE_URL}/matches?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  getById: async (id: string): Promise<Match> => {
    const res = await fetch(`${API_BASE_URL}/matches/${id}`);
    if (!res.ok) throw new Error('Failed to fetch match');
    return res.json();
  },

  create: async (match: {
    redAgentId: string;
    blueAgentId: string;
    targetAgentId: string;
    mode?: 'quick' | 'standard' | 'deep' | 'continuous';
  }): Promise<Match> => {
    const res = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    if (!res.ok) throw new Error('Failed to create match');
    return res.json();
  },

  getEvents: async (matchId: string, limit = 1000): Promise<Event[]> => {
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/events?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  getTranscript: async (matchId: string): Promise<{ events: Event[]; rounds: any[] }> => {
    const res = await fetch(`${API_BASE_URL}/matches/${matchId}/transcript`);
    if (!res.ok) throw new Error('Failed to fetch transcript');
    return res.json();
  },

  pause: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/matches/${id}/pause`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to pause match');
  },

  resume: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/matches/${id}/resume`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resume match');
  },
};

// Events API
export const eventsApi = {
  getRecent: async (limit = 100): Promise<Event[]> => {
    const res = await fetch(`${API_BASE_URL}/events?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  getById: async (id: string): Promise<Event> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    return res.json();
  },
};

// WebSocket client
export class ArenaWebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
      }
    };
  }

  private handleMessage(message: any) {
    if (message.type === 'event') {
      this.emit('event', message.data);
    } else if (message.type === 'match_update') {
      this.emit('match_update', { matchId: message.matchId, data: message.data });
    }
  }

  subscribe(matchId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', matchId }));
    }
  }

  unsubscribe(matchId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', matchId }));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.listeners.clear();
  }
}

export const wsClient = new ArenaWebSocketClient();


