import { v4 as uuidv4 } from 'uuid';
import type { Session, ChatMessage } from '../types.js';

/**
 * Session management service for chat sessions.
 * 
 * NOTE: Sessions are stored in-memory. This means:
 * - Session data will be lost when the server restarts
 * - Not suitable for multi-instance deployments without sticky sessions
 * 
 * For production use, consider implementing persistence (Redis, database, etc.)
 */
class SessionService {
  private sessions: Map<string, Session> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

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

  /**
   * Cleanup old sessions (older than specified hours, default 24).
   * Called automatically every hour when startCleanupScheduler is called.
   */
  cleanup(maxAgeHours: number = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let count = 0;

    for (const [id, session] of this.sessions) {
      if (session.updatedAt < cutoff) {
        this.sessions.delete(id);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[SessionService] Cleaned up ${count} expired session(s)`);
    }

    return count;
  }

  /**
   * Start automatic session cleanup scheduler.
   * Runs every hour to remove sessions older than 24 hours.
   */
  startCleanupScheduler(): void {
    if (this.cleanupInterval) return;
    
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);

    console.log('[SessionService] Cleanup scheduler started (runs hourly)');
  }

  /**
   * Stop the automatic cleanup scheduler.
   */
  stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[SessionService] Cleanup scheduler stopped');
    }
  }

  /**
   * Get count of active sessions.
   */
  getActiveCount(): number {
    return this.sessions.size;
  }
}

export const sessionService = new SessionService();
