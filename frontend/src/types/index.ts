import type { ReactNode } from 'react'

export type Phase =
  | 'upload'
  | 'entry'
  | 'free_chat'
  | 'template'
  | 'interview'
  | 'catalog'
  | 'presentation'

export interface FileInfo {
  fileId: string
  fileName: string
  rowCount: number
  columnCount: number
}

export interface ChatMessage {
  id: string
  from: 'user' | 'assistant'
  stamp: string
  content: ReactNode
}

export type IconName =
  | 'paperclip'
  | 'arrow-up'
  | 'bolt'
  | 'sparkle'
  | 'doc'
  | 'spark'
  | 'eye'
  | 'briefcase'
  | 'check'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'search'
  | 'external'
  | 'copy'
  | 'download'
  | 'slides'
  | 'x'
  | 'users'
  | 'gauge'
  | 'flag'
  | 'square'
  | 'square-check'
  | 'list'
  | 'chart'
  | 'plus'
