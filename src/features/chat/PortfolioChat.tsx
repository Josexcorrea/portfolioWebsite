import { ChatPanel } from './ChatPanel'

type PortfolioChatProps = {
  /** When true, used inside floating panel: no card chrome, no hint line */
  embedded?: boolean
  autoFocus?: boolean
}

export function PortfolioChat({ embedded = false, autoFocus }: PortfolioChatProps) {
  return <ChatPanel embedded={embedded} autoFocus={autoFocus} />
}
