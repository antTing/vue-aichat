import type { ChatSession } from '@/types/models'

const STORAGE_KEY = 'vue-aichat-history'
const MAX_SESSIONS = 50

export const historyStorage = {
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveSessions(sessions: ChatSession[]): void {
    try {
      const limitedSessions = sessions.slice(-MAX_SESSIONS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  },

  addSession(session: ChatSession): void {
    const sessions = this.getSessions()
    sessions.push(session)
    this.saveSessions(sessions)
  },

  updateSession(id: string, updates: Partial<ChatSession>): void {
    const sessions = this.getSessions()
    const index = sessions.findIndex(session => session.id === id)
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates, updatedAt: Date.now() }
      this.saveSessions(sessions)
    }
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions()
    const filtered = sessions.filter(session => session.id !== id)
    this.saveSessions(filtered)
  },

  clearSessions(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
