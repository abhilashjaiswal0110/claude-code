import { v4 as uuidv4 } from 'uuid';
import type { Session, ChatMessage } from '../types.js';

class SessionService {
  private sessions: Map<string, Session> = new Map();

  create(agentId: string, mode: string): Session {
    const session: Session = {
      id: uuidv4(),
      agentId,
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      context: {},
    };

    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    Object.assign(session, updates, { updatedAt: new Date() });
    return session;
  }

  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const chatMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    session.messages.push(chatMessage);
    session.updatedAt = new Date();

    return chatMessage;
  }

  getMessages(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Cleanup old sessions (older than 24 hours)
  cleanup(): number {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let count = 0;

    for (const [id, session] of this.sessions) {
      if (session.updatedAt < cutoff) {
        this.sessions.delete(id);
        count++;
      }
    }

    return count;
  }
}

export const sessionService = new SessionService();
