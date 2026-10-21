<template>
  <div class="chat-history">
    <div class="history-header">
      <h3>聊天历史</h3>
      <el-button
        type="danger"
        size="small"
        @click="clearAll"
        :disabled="sessions.length === 0"
      >
        清空
      </el-button>
    </div>
    <div v-if="sortedSessions.length === 0" class="history-empty">暂无历史</div>
    <div v-else class="history-list">
      <div
        v-for="session in sortedSessions"
        :key="session.id"
        class="history-item"
        :class="{ active: currentSessionId === session.id }"
        @click="openSession(session.id)"
      >
        <div class="item-header">
          <span class="item-title">{{ session.title }}</span>
          <el-button
            type="danger"
            size="small"
            text
            @click.stop="deleteSession(session.id)"
          >
            删除
          </el-button>
        </div>
        <div class="item-info">
          <span class="model">{{ session.model }}</span>
          <span class="time">{{ formatTime(session.updatedAt) }}</span>
        </div>
        <div class="item-preview">
          {{ getPreview(session.messages) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { currentSessionId, isConnected, sessions } = storeToRefs(chatStore)

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt)
})

const openSession = (id: string) => {
  if (isConnected.value) {
    ElMessage.warning('请等待当前回复结束')
    return
  }
  chatStore.loadSession(id)
}

const deleteSession = (id: string) => {
  if (isConnected.value && currentSessionId.value === id) {
    ElMessage.warning('请等待当前回复结束')
    return
  }
  chatStore.deleteSession(id)
}

const clearAll = () => {
  if (isConnected.value) {
    ElMessage.warning('请等待当前回复结束')
    return
  }
  chatStore.clearAllSessions()
}

const getPreview = (messages: Message[]) => {
  if (messages.length === 0) return '空对话'
  const lastMessage = messages[messages.length - 1]
  return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.chat-history {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.history-empty {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.history-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  flex: 1;
  margin-right: 8px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.model {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.item-preview {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
