import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface Database {
  run: (sql: string, ...params: any[]) => Promise<{ lastID: number; changes: number }>;
  get: (sql: string, ...params: any[]) => Promise<any>;
  all: (sql: string, ...params: any[]) => Promise<any[]>;
  exec: (sql: string) => Promise<void>;
  close: () => Promise<void>;
}

interface DatabaseSchema {
  agents: any[];
  matches: any[];
  events: any[];
  rounds: any[];
}

// Simple adapter that converts SQL-like calls to lowdb operations
class LowDbAdapter implements Database {
  private db: LowSync<DatabaseSchema>;
  private lastInsertId = 0;

  constructor(db: LowSync<DatabaseSchema>) {
    this.db = db;
  }

  async run(sql: string, ...params: any[]): Promise<{ lastID: number; changes: number }> {
    const sqlUpper = sql.trim().toUpperCase();
    
    if (sqlUpper.startsWith('INSERT INTO')) {
      return this.handleInsert(sql, params);
    } else if (sqlUpper.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (sqlUpper.startsWith('DELETE FROM')) {
      return this.handleDelete(sql, params);
    }
    
    return { lastID: 0, changes: 0 };
  }

  private handleInsert(sql: string, params: any[]): { lastID: number; changes: number } {
    // Match INSERT with VALUES containing ? placeholders and literals
    const match = sql.match(/INSERT\s+INTO\s+(\w+)\s+\(([^)]+)\)\s+VALUES\s+\(([^)]+)\)/i);
    if (!match) return { lastID: 0, changes: 0 };
    
    const [, table, fields, values] = match;
    const fieldList = fields.split(',').map(f => f.trim());
    const valueList = values.split(',').map(v => v.trim());
    const record: any = {};
    
    let paramIndex = 0;
    fieldList.forEach((field, i) => {
      const value = valueList[i];
      // If value is '?' placeholder, use param; otherwise use literal
      if (value === '?') {
        record[field] = params[paramIndex++];
      } else {
        // Remove quotes from literal strings
        const unquoted = value.replace(/^['"]|['"]$/g, '');
        // Try to parse as number/boolean, otherwise keep as string
        if (unquoted === 'true') record[field] = true;
        else if (unquoted === 'false') record[field] = false;
        else if (!isNaN(Number(unquoted)) && unquoted !== '') record[field] = Number(unquoted);
        else record[field] = unquoted;
      }
    });
    
    // Ensure id exists
    if (!record.id) {
      record.id = `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const tableData = this.db.data[table as keyof DatabaseSchema] as any[];
    if (Array.isArray(tableData)) {
      tableData.push(record);
      this.db.write();
      this.lastInsertId = 0; // lowdb doesn't track lastID, but we can use the id
      return { lastID: 0, changes: 1 };
    }
    
    return { lastID: 0, changes: 0 };
  }

  private handleUpdate(sql: string, params: any[]): { lastID: number; changes: number } {
    const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?/i);
    if (!match) return { lastID: 0, changes: 0 };
    
    const [, table, setClause, whereField] = match;
    const tableData = this.db.data[table as keyof DatabaseSchema] as any[];
    
    if (!Array.isArray(tableData)) return { lastID: 0, changes: 0 };
    
    // Parse SET clause
    const updates: any = {};
    const setParts = setClause.split(',').map(s => s.trim());
    let paramIndex = 0;
    
    setParts.forEach(part => {
      const [field, value] = part.split('=').map(s => s.trim());
      if (!field || !value) return; // Skip invalid parts
      
      if (value === '?') {
        const paramValue = params[paramIndex++];
        if (paramValue !== undefined) {
          updates[field] = paramValue;
        }
      } else {
        // Remove quotes from literal values
        updates[field] = value ? value.replace(/^['"]|['"]$/g, '') : value;
      }
    });
    
    // Find and update record
    if (whereField && params[paramIndex] !== undefined) {
      const index = tableData.findIndex((r: any) => r[whereField] === params[paramIndex]);
      if (index !== -1) {
        tableData[index] = { ...tableData[index], ...updates };
        this.db.write();
        return { lastID: 0, changes: 1 };
      }
    }
    
    return { lastID: 0, changes: 0 };
  }

  private handleDelete(sql: string, params: any[]): { lastID: number; changes: number } {
    const match = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?/i);
    if (!match) return { lastID: 0, changes: 0 };
    
    const [, table, whereField] = match;
    const tableData = this.db.data[table as keyof DatabaseSchema] as any[];
    
    if (!Array.isArray(tableData)) return { lastID: 0, changes: 0 };
    
    if (whereField && params[0] !== undefined) {
      const index = tableData.findIndex((r: any) => r[whereField] === params[0]);
      if (index !== -1) {
        tableData.splice(index, 1);
        this.db.write();
        return { lastID: 0, changes: 1 };
      }
    }
    
    return { lastID: 0, changes: 0 };
  }

  async get(sql: string, ...params: any[]): Promise<any> {
    const match = sql.match(/SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?/i);
    if (!match) return null;
    
    const [, table, whereField] = match;
    const tableData = this.db.data[table as keyof DatabaseSchema] as any[];
    
    if (!Array.isArray(tableData)) return null;
    
    if (whereField && params[0] !== undefined) {
      return tableData.find((r: any) => r[whereField] === params[0]) || null;
    }
    
    return tableData[0] || null;
  }

  async all(sql: string, ...params: any[]): Promise<any[]> {
    // More flexible regex that handles LIMIT ? and OFFSET ? placeholders
    const match = sql.match(/SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*\?)?(?:\s+ORDER\s+BY\s+([^\s]+)\s+(ASC|DESC))?(?:\s+LIMIT\s+(\d+|\?))?(?:\s+OFFSET\s+(\d+|\?))?/i);
    if (!match) {
      console.warn('SQL parse failed:', sql, 'params:', params);
      return [];
    }
    
    const [, table, whereField, orderField, orderDir, limitStr, offsetStr] = match;
    const tableData = this.db.data[table as keyof DatabaseSchema] as any[];
    
    if (!Array.isArray(tableData)) {
      console.warn(`Table ${table} not found or not an array`);
      return [];
    }
    
    let results = [...tableData];
    let paramIndex = 0;
    
    // Filter
    if (whereField && params[paramIndex] !== undefined) {
      // Handle both snake_case and camelCase field names
      const fieldVariants = [whereField, whereField.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
      results = results.filter((r: any) => {
        return fieldVariants.some(field => r[field] === params[paramIndex]);
      });
      paramIndex++;
    }
    
    // Sort
    if (orderField) {
      const direction = orderDir?.toUpperCase() === 'DESC' ? -1 : 1;
      // Handle both snake_case and camelCase field names
      const sortField = orderField.includes('_') 
        ? orderField 
        : orderField.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      results.sort((a: any, b: any) => {
        const aVal = a[orderField] || a[sortField];
        const bVal = b[orderField] || b[sortField];
        if (aVal > bVal) return direction;
        if (aVal < bVal) return -direction;
        return 0;
      });
    }
    
    // Limit/Offset - handle both literal numbers and ? placeholders
    let offset = 0;
    let limit: number | undefined = undefined;
    
    // Process LIMIT first (appears before OFFSET in SQL)
    if (limitStr) {
      if (limitStr === '?') {
        // LIMIT is the first param after WHERE
        limit = params[paramIndex++] || undefined;
      } else {
        limit = parseInt(limitStr);
      }
    }
    
    if (offsetStr) {
      if (offsetStr === '?') {
        offset = params[paramIndex++] || 0;
      } else {
        offset = parseInt(offsetStr);
      }
    }
    
    if (limit !== undefined) {
      results = results.slice(offset, offset + limit);
    } else if (offset > 0) {
      results = results.slice(offset);
    }
    
    return results;
  }

  async exec(sql: string): Promise<void> {
    // For CREATE TABLE, INDEX - lowdb handles this automatically
    // Just ensure structure exists
    this.db.write();
  }

  async close(): Promise<void> {
    this.db.write();
  }
}

export async function initializeDatabase(dbPath: string): Promise<Database> {
  // Ensure data directory exists
  const dataDir = dirname(dbPath);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Use .json extension for lowdb (convert .db to .json if needed)
  const jsonPath = dbPath.endsWith('.db') ? dbPath.replace(/\.db$/, '.json') : dbPath.endsWith('.json') ? dbPath : `${dbPath}.json`;

  // Use JSON file adapter
  const adapter = new JSONFileSync<DatabaseSchema>(jsonPath);
  const db = new LowSync(adapter, {
    agents: [],
    matches: [],
    events: [],
    rounds: [],
  });

  // Read existing data or initialize
  db.read();

  // Ensure all tables exist
  if (!db.data.agents) db.data.agents = [];
  if (!db.data.matches) db.data.matches = [];
  if (!db.data.events) db.data.events = [];
  if (!db.data.rounds) db.data.rounds = [];

  db.write();

  return new LowDbAdapter(db);
}
