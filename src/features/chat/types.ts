export type ChatRole = 'user' | 'assistant'

export type ChatLink = {
  label: string
  url: string
}

export type ChatCodeBlock = {
  language?: string
  text: string
}

export type ExampleCardBlock = {
  type: 'example'
  title?: string
  summary?: string
  steps?: string[]
  code?: ChatCodeBlock
  links?: ChatLink[]
}

export type CalloutBlock = {
  type: 'callout'
  tone: 'info' | 'warning'
  text: string
}

export type LinkCardBlock = {
  type: 'linkCard'
  title: string
  url: string
  description?: string
}

export type ChatBlock = ExampleCardBlock | CalloutBlock | LinkCardBlock

export type ChatMessageStatus = 'streaming' | 'done' | 'error'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  blocks?: ChatBlock[]
  createdAt: number
  status?: ChatMessageStatus
}

export type ChatStreamDeltaEvent = {
  type: 'delta'
  content: string
}

export type ChatStreamBlocksEvent = {
  type: 'blocks'
  blocks: ChatBlock[]
}

export type ChatStreamDoneEvent = {
  type: 'done'
}

export type ChatStreamErrorEvent = {
  type: 'error'
  error: string
}

export type ChatStreamEvent =
  | ChatStreamDeltaEvent
  | ChatStreamBlocksEvent
  | ChatStreamDoneEvent
  | ChatStreamErrorEvent

