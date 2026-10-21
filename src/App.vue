<script setup lang="ts">
import Chat from '@/views/chat.vue'
import ChatHistory from '@/components/ChatHistory.vue'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore()
const { isConnected } = storeToRefs(chatStore)

const newChat = () => {
  if (isConnected.value) {
    ElMessage.warning('请等待当前回复结束')
    return
  }
  chatStore.clearMessages()
}
</script>

<template>
  <div class="w-full h-full flex">
    <div class="w-[17%] min-w-[220px] bg-[#f9f9f9] flex flex-col">
      <div class="p-4">
        <el-button class="w-full" @click="newChat">New Chat</el-button>
      </div>
      <ChatHistory class="flex-1 min-h-0" />
    </div>
    <Chat class="flex-1 min-w-0" />
  </div>
</template>
