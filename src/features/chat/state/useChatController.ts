import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { sendChatStream } from '../api'
import type { ChatBlock, ChatMessage, ChatStreamEvent } from '../types'
import { makeId } from '../utils'

type State = {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  activeAssistantId: string | null
}

type Action =
  | { type: 'send_start'; payload: { user: ChatMessage; assistant: ChatMessage } }
  | { type: 'delta'; payload: { assistantId: string; delta: string } }
  | { type: 'blocks'; payload: { assistantId: string; blocks: ChatBlock[] } }
  | { type: 'done'; payload: { assistantId: string } }
  | { type: 'error'; payload: { assistantId: string; error: string } }
  | { type: 'reset_error' }
  | { type: 'set_loading'; payload: { loading: boolean } }

const initialState: State = {
  messages: [],
  loading: false,
  error: null,
  activeAssistantId: null,
}

function updateMessageById(messages: ChatMessage[], id: string, updater: (m: ChatMessage) => ChatMessage) {
  const idx = messages.findIndex((m) => m.id === id)
  if (idx === -1) return messages
  const next = [...messages]
  next[idx] = updater(next[idx])
  return next
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset_error':
      return { ...state, error: null }

    case 'set_loading':
      return { ...state, loading: action.payload.loading }

    case 'send_start': {
      const { user, assistant } = action.payload
      return {
        ...state,
        error: null,
        loading: true,
        activeAssistantId: assistant.id,
        messages: [...state.messages, user, assistant],
      }
    }

    case 'delta': {
      const { assistantId, delta } = action.payload
      return {
        ...state,
        messages: updateMessageById(state.messages, assistantId, (m) =>
          m.role === 'assistant' ? { ...m, content: m.content + delta } : m
        ),
      }
    }

    case 'blocks': {
      const { assistantId, blocks } = action.payload
      if (!blocks || blocks.length === 0) return state
      return {
        ...state,
        messages: updateMessageById(state.messages, assistantId, (m) =>
          m.role === 'assistant' ? { ...m, blocks } : m
        ),
      }
    }

    case 'done': {
      const { assistantId } = action.payload
      return {
        ...state,
        loading: false,
        activeAssistantId: state.activeAssistantId === assistantId ? null : state.activeAssistantId,
        messages: updateMessageById(state.messages, assistantId, (m) =>
          m.role === 'assistant' ? { ...m, status: 'done' } : m
        ),
      }
    }

    case 'error': {
      const { assistantId, error } = action.payload
      const messages = updateMessageById(state.messages, assistantId, (m) => {
        if (m.role !== 'assistant') return m
        const content = m.content ? m.content : `Error: ${error}`
        return { ...m, content, status: 'error' }
      })
      return {
        ...state,
        loading: false,
        activeAssistantId: state.activeAssistantId === assistantId ? null : state.activeAssistantId,
        error,
        messages,
      }
    }

    default:
      return state
  }
}

type UseChatControllerResult = {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  hasMessages: boolean
  showSuggestions: boolean
  sendUserText: (text: string) => Promise<void>
  resetError: () => void
}

export function useChatController(): UseChatControllerResult {
  const [state, dispatch] = useReducer(reducer, initialState)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const resetError = useCallback(() => dispatch({ type: 'reset_error' }), [])

  const hasMessages = state.messages.length > 0
  const showSuggestions = !hasMessages && !state.loading

  const sendUserText = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || state.loading) return

      // Cancel any in-flight stream (e.g., user re-sends quickly, or UI toggles).
      abortRef.current?.abort()
      const abortController = new AbortController()
      abortRef.current = abortController

      dispatch({ type: 'reset_error' })
      dispatch({ type: 'set_loading', payload: { loading: true } })

      const userMessage: ChatMessage = {
        id: makeId('user'),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
        status: 'done',
      }

      const assistantId = makeId('assistant')
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        status: 'streaming',
      }

      // Update UI first, then stream into this assistant message.
      dispatch({ type: 'send_start', payload: { user: userMessage, assistant: assistantPlaceholder } })

      const requestMessages = [...state.messages, userMessage, assistantPlaceholder].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      await sendChatStream(
        requestMessages,
        {
          onEvent(event: ChatStreamEvent) {
            if (event.type === 'delta') {
              dispatch({ type: 'delta', payload: { assistantId, delta: event.content } })
              return
            }
            if (event.type === 'blocks') {
              dispatch({ type: 'blocks', payload: { assistantId, blocks: event.blocks } })
              return
            }
            if (event.type === 'error') {
              dispatch({ type: 'error', payload: { assistantId, error: event.error } })
              return
            }
            if (event.type === 'done') {
              dispatch({ type: 'done', payload: { assistantId } })
            }
          },
          onComplete() {
            // Legacy servers: treat completion as done.
            dispatch({ type: 'done', payload: { assistantId } })
          },
          onError(message) {
            dispatch({ type: 'error', payload: { assistantId, error: message } })
          },
        },
        { signal: abortController.signal }
      )
    },
    [state.loading, state.messages]
  )

  return useMemo(
    () => ({
      messages: state.messages,
      loading: state.loading,
      error: state.error,
      hasMessages,
      showSuggestions,
      sendUserText,
      resetError,
    }),
    [hasMessages, resetError, sendUserText, showSuggestions, state.error, state.loading, state.messages]
  )
}

