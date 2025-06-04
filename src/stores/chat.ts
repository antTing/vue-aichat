import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // state
  const messages = ref<Message[]>([])
  const isConnected = ref(false)

  // actions
  function addMessage(message: Message) {
    messages.value.push(message)
  }
  function clearMessages() {
    messages.value = []
  }

  return {
    messages,
    isConnected,
    addMessage,
    clearMessages,
  }
})
