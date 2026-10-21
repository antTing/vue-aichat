import { defineStore } from 'pinia'
import { ref } from 'vue'
import { historyStorage } from '@/utils/historyStorage'

const createId = () =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`

const sessionTitle = (list: Message[]) => {
  const text =
    list
      .find(item => item.role === 'user')
      ?.content.trim()
      .replace(/\s+/g, ' ') || '新对话'
  return text.length > 24 ? `${text.slice(0, 24)}...` : text
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isConnected = ref(false)
  const currentSessionId = ref<string | null>(null)
  const currentModel = ref('')
  const sessions = ref<ChatSession[]>(historyStorage.getSessions())

  function commitSessions() {
    historyStorage.saveSessions(sessions.value)
    sessions.value = historyStorage.getSessions()
  }

  function upsertCurrentSession(snapshot: Message[]) {
    const id = currentSessionId.value
    if (!id || snapshot.length === 0) return

    const now = Date.now()
    const index = sessions.value.findIndex(session => session.id === id)
    if (index === -1) {
      sessions.value.push({
        id,
        title: sessionTitle(snapshot),
        model: currentModel.value,
        messages: snapshot,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      const prev = sessions.value[index]
      sessions.value[index] = {
        ...prev,
        title: sessionTitle(snapshot),
        model: currentModel.value || prev.model,
        messages: snapshot,
        updatedAt: now,
      }
    }
  }

  function persistCurrentSession() {
    const snapshot = messages.value.map(item => ({ ...item }))
    upsertCurrentSession(snapshot)
    commitSessions()
  }

  function setModel(model: string) {
    currentModel.value = model
  }

  function addMessage(message: Message, persist = true) {
    if (!currentSessionId.value) {
      currentSessionId.value = createId()
    }
    messages.value.push(message)
    const snapshot = messages.value.map(item => ({ ...item }))
    upsertCurrentSession(snapshot)
    if (persist) commitSessions()
  }

  function clearMessages() {
    if (isConnected.value) return
    messages.value = []
    currentSessionId.value = null
  }

  function loadSession(id: string) {
    if (isConnected.value) return
    const session = sessions.value.find(item => item.id === id)
    if (!session) return
    currentSessionId.value = session.id
    currentModel.value = session.model
    messages.value = session.messages.map(item => ({ ...item }))
  }

  function deleteSession(id: string) {
    if (isConnected.value && currentSessionId.value === id) return
    sessions.value = sessions.value.filter(session => session.id !== id)
    commitSessions()
    if (currentSessionId.value === id) {
      messages.value = []
      currentSessionId.value = null
    }
  }

  function clearAllSessions() {
    if (isConnected.value) return
    sessions.value = []
    historyStorage.clearSessions()
    messages.value = []
    currentSessionId.value = null
  }

  return {
    messages,
    isConnected,
    currentSessionId,
    currentModel,
    sessions,
    setModel,
    addMessage,
    clearMessages,
    loadSession,
    deleteSession,
    clearAllSessions,
    persistCurrentSession,
  }
})
