<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <div class="flex-1 overflow-y-auto relative">
      <el-row
        class="top-0 bg-[#fff] w-full h-[50px] z-10 justify-between items-center"
        style="position: sticky"
      >
        <el-dropdown @command="handleCommand" :max-height="200">
          <span
            class="el-dropdown-link ml-4 text-lg font-semibold text-[#213547]"
          >
            {{ model }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in modelList"
                :key="item.id"
                :command="item.id"
                >{{ item.id }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-radio-group v-model="modelOptions.stream" size="small" class="mr-4">
          <el-radio-button label="流式返回" :value="true" />
          <el-radio-button label="非流式" :value="false" />
        </el-radio-group>
      </el-row>
      <div class="w-[60%] m-[0_auto]" id="scrollId">
        <div
          v-for="(item, index) in messages"
          :key="index"
          :class="index !== 0 ? 'mt-5' : ''"
        >
          <div
            class="flex items-center"
            :class="{ 'flex-row-reverse': item.role === 'user' }"
          >
            <el-icon>
              <UserFilled v-if="item.role === 'assistant'" />
              <Avatar v-else />
            </el-icon>
            <span
              class="font-bold"
              :class="item.role === 'user' ? 'mr-2' : 'ml-2'"
            >
              {{ item.role === 'user' ? 'You' : model }}
            </span>
          </div>
          <p
            class="pl-6"
            :class="{ 'flex justify-end mt-2': item.role === 'user' }"
          >
            <span
              v-if="item.role === 'user'"
              v-html="item.content"
              class="whitespace-pre-wrap"
              :class="item.role === 'user' ? 'bg-[#f0f0f0] p-2 rounded' : ''"
            ></span>
            <MdPreview
              v-else
              editorId="preview-only"
              :modelValue="item.content"
            />
          </p>
        </div>
      </div>
    </div>
    <div class="mb-5 mt-2">
      <div class="w-[60%] m-[0_auto] relative">
        <el-input
          v-model="inputVal"
          type="textarea"
          :autosize="{
            minRows: 2,
            maxRows: 5,
          }"
          resize="none"
          style="max-width: 100%"
          @keydown="Keydown"
        />
        <el-button
          type="primary"
          :icon="Position"
          :disabled="btnDisabled"
          class="absolute right-6 bottom-2"
          @click="send"
        />
      </div>
    </div>
    <div class="text-xs text-[#999] text-center mb-2">
      这玩意 也可能会犯错。请核查重要信息。
    </div>
  </div>
</template>

<script setup lang="ts">
import { listModels } from '@/api/chatApi'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ArrowDown,
  Position,
  UserFilled,
  Avatar,
} from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

import { useMakeAutosuggestion } from '@/hooks/useMakeAutosuggestion'
import { useChatStore } from '@/stores/chat'

const model = ref<string>('deepseek-chat')
const modelList = ref<Model[]>([])
const { messages } = storeToRefs(useChatStore())
const { clearMessages } = useChatStore()
const handleCommand = (command: string | number | object) => {
  clearMessages()
  model.value = command as string
}

const inputVal = ref<string>('')
const btnDisabled = ref<boolean>(false)
const modelOptions = ref<ModelOptions>({
  stream: true,
})
const scrollFn = () => {
  setTimeout(() => {
    const scrollId = document.getElementById('scrollId')
    scrollId?.scrollIntoView({ block: 'end' })
  }, 0)
}
const { makeAutosuggestion } = useMakeAutosuggestion(modelOptions, scrollFn)
const send = async () => {
  if (inputVal.value.trim() === '') {
    return
  }
  btnDisabled.value = true
  const message = {
    role: 'user',
    content: inputVal.value,
  }
  inputVal.value = ''
  try {
    await makeAutosuggestion(model.value, message)
  } catch (error) {
    console.log(error)
  } finally {
    btnDisabled.value = false
  }
}
const Keydown = ($event: Event) => {
  const event = $event as KeyboardEvent
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

const init = async () => {
  const res = await listModels()
  if (!!res.data?.length) {
    modelList.value = res.data
    model.value = modelList.value[0].id
  }
}
init()
</script>

<style scoped>
@import 'md-editor-v3/lib/style.css';

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.el-textarea :deep(.el-textarea__inner) {
  padding-right: 90px;
}
</style>
