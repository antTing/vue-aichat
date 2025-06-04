import { ref, onBeforeUnmount, toValue } from 'vue'
import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { chatCompletion, streamChatCompletion } from '@/api/chatApi'
import { useChatStore } from '@/stores'
import { useReceiveStreamData } from './useReceiveStreamData'

const defaultModelOptions: ModelOptions = {
  stream: false,
  temperature: 0.9,
  top_p: 1,
  max_tokens: 2048,
  presence_penalty: 0,
  frequency_penalty: 0,
}
export const useMakeAutosuggestion = (
  modelOptions: Ref<ModelOptions>,
  scrollFn?: () => void,
) => {
  const chatStore = useChatStore()
  const abortController = ref<AbortController | null>(null)
  // 组装参数
  const makeRequestData = (
    model: string,
    message: Message,
  ): CompletionRequest | null => {
    if (!model) {
      ElMessage.error('请选择模型')
      return null
    }
    chatStore.addMessage(message)
    scrollFn && scrollFn()
    return {
      ...defaultModelOptions,
      ...toValue(modelOptions),
      model,
      messages: chatStore.messages,
    }
  }

  const handleProcessMessage = (json: any) => {
    const choices = json.choices
    choices.forEach((choice: streamChoice) => {
      chatStore.messages[chatStore.messages.length - 1].content +=
        choice.delta?.content ?? ''
    })
    scrollFn && scrollFn()
  }
  const beforeSend = () => {
    const message = { role: 'assistant', content: '' }
    chatStore.addMessage(message)
  }
  const { handleStreamResponse } = useReceiveStreamData(
    handleProcessMessage,
    beforeSend,
  )

  const makeAutosuggestion = async (model: string, message: Message) => {
    const requestData = makeRequestData(model, message)
    if (!requestData) return
    try {
      if (modelOptions.value.stream) {
        abortController.value = new AbortController()
        const signal = abortController.value.signal
        const response = await streamChatCompletion(signal, requestData)
        if (!response.ok) {
          throw new Error(
            `API请求失败: ${response.status} ${response.statusText}`,
          )
        }
        chatStore.isConnected = true
        await handleStreamResponse(response)
      } else {
        const response = await chatCompletion(requestData)
        response.choices.forEach(choice => {
          chatStore.addMessage(choice.message)
        })
        scrollFn && scrollFn()
        return response
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('请求被取消')
        return
      }
      console.error('Error during chatCompletion:', error)
      ElMessage.error('生成建议失败')
    } finally {
      chatStore.isConnected = false
    }
  }

  const cancelRequest = () => {
    if (!chatStore.isConnected) return
    chatStore.isConnected = false
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  onBeforeUnmount(() => {
    cancelRequest()
  })

  return {
    makeAutosuggestion,
    cancelRequest,
  }
}
