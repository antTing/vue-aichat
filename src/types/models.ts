type Model = {
  id: string // 模型的标识符
  object: string // 模型的类型，固定为 "model"
  owned_by: string // 模型的所有者
  name: string
}

interface Message {
  role: string // 消息的角色，可以是 "system"、"user" 或 "assistant"
  content: string // 消息的内容
  name?: string // 可以选填的参与者的名称，为模型提供信息以区分相同角色的参与者。
}
interface response_format {
  type: 'text' | 'json_object'
}
interface tool {
  type: string
  function: {
    name: string
    description?: string
    parameters?: any
  }
}
interface ChatCompletionNamedToolChoice {
  tool: string
  function: {
    name: string
  }
}

interface ModelOptions {
  temperature?: number // 生成文本的温度，值越高，生成的文本越随机。默认值为 1。
  top_p?: number // 生成文本的 top_p 值，值越高，生成的文本越随机。默认值为 1。
  frequency_penalty?: number // -2.0 到 2.0 之间的数字，用于惩罚模型生成重复的词汇。默认值为 0。
  max_tokens?: number // 生成文本的最大长度。
  presence_penalty?: number // -2.0 到 2.0 之间的数字，用于惩罚模型生成不常见的词汇。默认值为 0。
  response_format?: response_format // 响应格式，可以是 "text" 或 "json"。
  stop?: string | string[] // 停止生成文本的标记列表。一个 string 或最多包含 16 个 string 的 list，在遇到这些词时，API 将停止生成更多的 token。
  stream?: boolean // 是否流式传输响应。默认值为 false。
  stream_options?: {
    include_usage?: boolean // 是否在流式传输响应中包含使用情况。默认值为 false。
  }
  tools?: tool[] // 工具列表，用于指定模型可以使用的工具。
  tool_choice?: string | ChatCompletionNamedToolChoice // 工具选择，用于指定模型可以使用的工具。
  logprobs?: boolean
  top_logprobs?: number
}

// 继承自 ModelOptions 的接口
interface CompletionRequest extends ModelOptions {
  model: string // 模型的标识符
  messages: Message[] // 消息列表
}

interface tool_call {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}
interface logprobs_content {
  token: string
  logprob: number
  bytes: number
  top_logprobs: {
    token: string
    logprob: number
    bytes: number
  }[]
}

interface CompletionResponse {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string
  choices: {
    index: number
    message: {
      role: string
      content: string
      tool_calls?: tool_call[]
    }
    logprobs?: {
      content: logprobs_content[]
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    prompt_cache_hit_tokens: number
    prompt_cache_miss_tokens: number
  }
}

interface streamChoice {
  index: number
  delta: {
    role: string
    content: string
  }
  finish_reason: string
  logprobs?: {
    content: logprobs_content[]
  }
}
