import { WebSocketServer, WebSocket } from 'ws';
import { Event } from '../types/index.js';

export class ArenaWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private matchSubscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        // Remove from all match subscriptions
        this.matchSubscriptions.forEach((clients, matchId) => {
          clients.delete(ws);
          if (clients.size === 0) {
            this.matchSubscriptions.delete(matchId);
          }
        });
        console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, data: any) {
    if (data.type === 'subscribe') {
      const { matchId } = data;
      if (matchId) {
        if (!this.matchSubscriptions.has(matchId)) {
          this.matchSubscriptions.set(matchId, new Set());
        }
        this.matchSubscriptions.get(matchId)!.add(ws);
        ws.send(JSON.stringify({ type: 'subscribed', matchId }));
      }
    } else if (data.type === 'unsubscribe') {
      const { matchId } = data;
      if (matchId && this.matchSubscriptions.has(matchId)) {
        this.matchSubscriptions.get(matchId)!.delete(ws);
        if (this.matchSubscriptions.get(matchId)!.size === 0) {
          this.matchSubscriptions.delete(matchId);
        }
        ws.send(JSON.stringify({ type: 'unsubscribed', matchId }));
      }
    }
  }

  broadcastEvent(event: Event) {
    const message = JSON.stringify({
      type: 'event',
      data: event,
    });

    // Broadcast to all clients subscribed to this match
    const subscribers = this.matchSubscriptions.get(event.matchId);
    if (subscribers) {
      subscribers.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    // Also broadcast to all general clients
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastMatchUpdate(matchId: string, update: any) {
    const message = JSON.stringify({
      type: 'match_update',
      matchId,
      data: update,
    });

    const subscribers = this.matchSubscriptions.get(matchId);
    if (subscribers) {
      subscribers.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  close() {
    this.wss.close();
  }
}


