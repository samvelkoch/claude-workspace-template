import type { ReactNode } from 'react'

export type Phase =
  | 'home'
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

export type SessionState = 'диалог' | 'готов' | 'черновик'

export interface Session {
  id: string
  title: string
  project_name: string | null
  file_id: string | null
  file_name: string | null
  state: SessionState
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  name: string
  color: string
  session_ids: string[]
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
  | 'folder'
  | 'folder-open'
  | 'clock'
  | 'message'
  | 'pin'
  | 'more'
