export const useReceiveStreamData = (
  handleProcessMessage: (json: any) => void,
  beforeSend?: () => void,
) => {
  function processMessage(msg: string) {
    const trimmed = msg.trim()
    if (!trimmed || trimmed.startsWith(':')) return true

    const jsonString = trimmed.startsWith('data:')
      ? trimmed.slice(5).trim()
      : trimmed
    if (jsonString === '[DONE]') return false
    if (!jsonString) return true

    try {
      handleProcessMessage(JSON.parse(jsonString))
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
    return true
  }

  async function handleStreamResponse(response: Response) {
    const reader = response.body?.getReader()
    if (!reader) {
      console.error('Reader is not available.')
      return
    }

    const decoder = new TextDecoder('utf-8')
    beforeSend?.()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
        const lines = buffer.split('\n')
        // 半行留到下一次 read，避免 chunk 切断 JSON
        buffer = done ? '' : (lines.pop() ?? '')

        for (const line of lines) {
          if (!processMessage(line)) return
        }
        if (done) break
      }
    } finally {
      reader.releaseLock()
    }
  }

  return { handleStreamResponse }
}
