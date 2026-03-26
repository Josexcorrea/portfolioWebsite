/* Context + hook in one module; Fast Refresh expects components-only exports. */
/* eslint-disable react-refresh/only-export-components -- co-located useChatGlobe hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ChatGlobeContextValue = {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  /** While chat is open, Space starts the skills game only if true (user clicked the globe area). */
  skillsGameSpaceArmed: boolean
  armSkillsGameSpace: () => void
  disarmSkillsGameSpace: () => void
}

const ChatGlobeContext = createContext<ChatGlobeContextValue | null>(null)

export function ChatGlobeProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [skillsGameSpaceArmed, setSkillsGameSpaceArmed] = useState(false)

  useEffect(() => {
    if (chatOpen) setSkillsGameSpaceArmed(false)
  }, [chatOpen])

  const armSkillsGameSpace = useCallback(() => {
    setSkillsGameSpaceArmed(true)
  }, [])

  const disarmSkillsGameSpace = useCallback(() => {
    setSkillsGameSpaceArmed(false)
  }, [])

  const value = useMemo(
    () => ({
      chatOpen,
      setChatOpen,
      skillsGameSpaceArmed,
      armSkillsGameSpace,
      disarmSkillsGameSpace,
    }),
    [chatOpen, skillsGameSpaceArmed, armSkillsGameSpace, disarmSkillsGameSpace],
  )

  return <ChatGlobeContext.Provider value={value}>{children}</ChatGlobeContext.Provider>
}

export function useChatGlobe() {
  const ctx = useContext(ChatGlobeContext)
  if (!ctx) throw new Error('useChatGlobe must be used within ChatGlobeProvider')
  return ctx
}
