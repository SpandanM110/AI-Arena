import { Database } from './schema.js';
import { Agent, Match, Event, Round, CreateAgentRequest, CreateMatchRequest } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentModel {
  constructor(private db: Database) {}

  async create(data: CreateAgentRequest): Promise<Agent> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.db.run(
      `INSERT INTO agents (id, name, type, model, system_prompt, permissions, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      data.name,
      data.type,
      data.model,
      data.systemPrompt,
      JSON.stringify(data.permissions || []),
      JSON.stringify(data.metadata || {}),
      now,
      now
    );

    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<Agent | null> {
    const row = await this.db.get('SELECT * FROM agents WHERE id = ?', id) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      model: row.model,
      version: row.version,
      systemPrompt: row.system_prompt,
      permissions: JSON.parse(row.permissions || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}'),
    };
  }

  async getAll(): Promise<Agent[]> {
    const rows = await this.db.all('SELECT * FROM agents ORDER BY created_at DESC') as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      model: row.model,
      version: row.version,
      systemPrompt: row.system_prompt,
      permissions: JSON.parse(row.permissions || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  async getByType(type: 'red' | 'blue' | 'target'): Promise<Agent[]> {
    const rows = await this.db.all('SELECT * FROM agents WHERE type = ? ORDER BY created_at DESC', type) as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      model: row.model,
      version: row.version,
      systemPrompt: row.system_prompt,
      permissions: JSON.parse(row.permissions || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  async update(id: string, data: Partial<CreateAgentRequest>): Promise<Agent | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model);
    }
    if (data.systemPrompt !== undefined) {
      updates.push('system_prompt = ?');
      values.push(data.systemPrompt);
    }
    if (data.permissions !== undefined) {
      updates.push('permissions = ?');
      values.push(JSON.stringify(data.permissions));
    }
    if (data.metadata !== undefined) {
      updates.push('metadata = ?');
      values.push(JSON.stringify(data.metadata));
    }

    if (updates.length === 0) return await this.getById(id);

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, ...values);
    return await this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM agents WHERE id = ?', id);
    return result.changes > 0;
  }
}

export class MatchModel {
  constructor(private db: Database) {}

  async create(data: CreateMatchRequest): Promise<Match> {
    const id = `AR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const now = new Date().toISOString();
    
    await this.db.run(
      `INSERT INTO matches (id, status, red_agent_id, blue_agent_id, target_agent_id, metadata, created_at, updated_at)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`,
      id,
      data.redAgentId,
      data.blueAgentId,
      data.targetAgentId,
      JSON.stringify(data.metadata || {}),
      now,
      now
    );

    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<Match | null> {
    const row = await this.db.get('SELECT * FROM matches WHERE id = ?', id) as any;
    if (!row) return null;

    return {
      id: row.id,
      status: row.status || 'pending',
      redAgentId: row.red_agent_id || row.redAgentId,
      blueAgentId: row.blue_agent_id || row.blueAgentId,
      targetAgentId: row.target_agent_id || row.targetAgentId,
      startedAt: row.started_at || row.startedAt,
      completedAt: row.completed_at || row.completedAt,
      duration: row.duration,
      winner: row.winner,
      score: {
        attacks: row.score_attacks || row.score?.attacks || 0,
        defenses: row.score_defenses || row.score?.defenses || 0,
        severity: row.score_severity || row.score?.severity || 0,
      },
      metadata: (() => {
        try {
          if (typeof row.metadata === 'string') {
            // Check if it's already valid JSON
            if (row.metadata.trim().startsWith('{') || row.metadata.trim().startsWith('[')) {
              return JSON.parse(row.metadata);
            }
            // If it's not JSON, it might be corrupted - return empty object
            return {};
          }
          return row.metadata || {};
        } catch (e) {
          console.warn('Failed to parse metadata for match', row.id, ':', e);
          return {};
        }
      })(),
    };
  }

  async getAll(limit = 100, offset = 0): Promise<Match[]> {
    const rows = await this.db.all('SELECT * FROM matches ORDER BY created_at DESC LIMIT ? OFFSET ?', limit, offset) as any[];
    return rows.map(row => ({
      id: row.id,
      status: row.status || 'pending',
      redAgentId: row.red_agent_id || row.redAgentId,
      blueAgentId: row.blue_agent_id || row.blueAgentId,
      targetAgentId: row.target_agent_id || row.targetAgentId,
      startedAt: row.started_at || row.startedAt,
      completedAt: row.completed_at || row.completedAt,
      duration: row.duration,
      winner: row.winner,
      score: {
        attacks: row.score_attacks || row.score?.attacks || 0,
        defenses: row.score_defenses || row.score?.defenses || 0,
        severity: row.score_severity || row.score?.severity || 0,
      },
      metadata: (() => {
        try {
          if (typeof row.metadata === 'string') {
            // Check if it's already valid JSON
            if (row.metadata.trim().startsWith('{') || row.metadata.trim().startsWith('[')) {
              return JSON.parse(row.metadata);
            }
            // If it's not JSON, it might be corrupted - return empty object
            return {};
          }
          return row.metadata || {};
        } catch (e) {
          console.warn('Failed to parse metadata for match', row.id, ':', e);
          return {};
        }
      })(),
    }));
  }

  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.startedAt !== undefined) {
      updates.push('started_at = ?');
      values.push(data.startedAt);
    }
    if (data.completedAt !== undefined) {
      updates.push('completed_at = ?');
      values.push(data.completedAt);
    }
    if (data.duration !== undefined) {
      updates.push('duration = ?');
      values.push(data.duration);
    }
    if (data.winner !== undefined) {
      updates.push('winner = ?');
      values.push(data.winner);
    }
    if (data.score !== undefined) {
      updates.push('score_attacks = ?');
      values.push(data.score.attacks);
      updates.push('score_defenses = ?');
      values.push(data.score.defenses);
      updates.push('score_severity = ?');
      values.push(data.score.severity);
    }
    if (data.metadata !== undefined) {
      updates.push('metadata = ?');
      values.push(JSON.stringify(data.metadata));
    }

    if (updates.length === 0) return await this.getById(id);

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.run(`UPDATE matches SET ${updates.join(', ')} WHERE id = ?`, ...values);
    return await this.getById(id);
  }
}

export class EventModel {
  constructor(private db: Database) {}

  async create(data: Omit<Event, 'id'>): Promise<Event> {
    const id = uuidv4();
    
    await this.db.run(
      `INSERT INTO events (id, match_id, timestamp, type, agent_id, agent_name, severity, attack_type, prompt, reasoning, tool_calls, outcome, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      data.matchId,
      data.timestamp,
      data.type,
      data.agentId,
      data.agentName,
      data.severity,
      data.attackType || null,
      data.prompt,
      data.reasoning || null,
      JSON.stringify(data.toolCalls || []),
      data.outcome,
      data.description,
      JSON.stringify(data.metadata || {})
    );

    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<Event | null> {
    const row = await this.db.get('SELECT * FROM events WHERE id = ?', id) as any;
    if (!row) return null;

    return {
      id: row.id,
      matchId: row.match_id,
      timestamp: row.timestamp,
      type: row.type,
      agentId: row.agent_id,
      agentName: row.agent_name,
      severity: row.severity,
      attackType: row.attack_type,
      prompt: row.prompt,
      reasoning: row.reasoning,
      toolCalls: JSON.parse(row.tool_calls || '[]'),
      outcome: row.outcome,
      description: row.description,
      metadata: JSON.parse(row.metadata || '{}'),
    };
  }

  async getByMatchId(matchId: string, limit = 1000): Promise<Event[]> {
    const rows = await this.db.all('SELECT * FROM events WHERE match_id = ? ORDER BY timestamp DESC LIMIT ?', matchId, limit) as any[];
    return rows.map(row => ({
      id: row.id,
      matchId: row.match_id,
      timestamp: row.timestamp,
      type: row.type,
      agentId: row.agent_id,
      agentName: row.agent_name,
      severity: row.severity,
      attackType: row.attack_type,
      prompt: row.prompt,
      reasoning: row.reasoning,
      toolCalls: JSON.parse(row.tool_calls || '[]'),
      outcome: row.outcome,
      description: row.description,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  async getRecent(limit = 100): Promise<Event[]> {
    const rows = await this.db.all('SELECT * FROM events ORDER BY timestamp DESC LIMIT ?', limit) as any[];
    return rows.map(row => ({
      id: row.id,
      matchId: row.match_id,
      timestamp: row.timestamp,
      type: row.type,
      agentId: row.agent_id,
      agentName: row.agent_name,
      severity: row.severity,
      attackType: row.attack_type,
      prompt: row.prompt,
      reasoning: row.reasoning,
      toolCalls: JSON.parse(row.tool_calls || '[]'),
      outcome: row.outcome,
      description: row.description,
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }
}

export class RoundModel {
  constructor(private db: Database) {}

  async create(data: Omit<Round, 'id'>): Promise<Round> {
    const id = uuidv4();
    
    await this.db.run(
      `INSERT INTO rounds (id, match_id, round_number, attack_event_id, defense_event_id, target_event_id, score_attack_success, score_defense_success, score_severity, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      data.matchId,
      data.roundNumber,
      data.attackEventId || null,
      data.defenseEventId || null,
      data.targetEventId || null,
      data.score.attackSuccess ? 1 : 0,
      data.score.defenseSuccess ? 1 : 0,
      data.score.severity,
      data.timestamp
    );

    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<Round | null> {
    const row = await this.db.get('SELECT * FROM rounds WHERE id = ?', id) as any;
    if (!row) return null;

    return {
      id: row.id,
      matchId: row.match_id,
      roundNumber: row.round_number,
      attackEventId: row.attack_event_id,
      defenseEventId: row.defense_event_id,
      targetEventId: row.target_event_id,
      score: {
        attackSuccess: row.score_attack_success === 1,
        defenseSuccess: row.score_defense_success === 1,
        severity: row.score_severity,
      },
      timestamp: row.timestamp,
    };
  }

  async getByMatchId(matchId: string): Promise<Round[]> {
    const rows = await this.db.all('SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC', matchId) as any[];
    return rows.map(row => ({
      id: row.id,
      matchId: row.match_id,
      roundNumber: row.round_number,
      attackEventId: row.attack_event_id,
      defenseEventId: row.defense_event_id,
      targetEventId: row.target_event_id,
      score: {
        attackSuccess: row.score_attack_success === 1,
        defenseSuccess: row.score_defense_success === 1,
        severity: row.score_severity,
      },
      timestamp: row.timestamp,
    }));
  }
}
