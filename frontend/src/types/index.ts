import type { ReactNode } from 'react'

export type Phase =
  | 'home'
  | 'upload'
  | 'entry'
  | 'free_chat'
  | 'db_chat'
  | 'template'
  | 'interview'
  | 'catalog'
  | 'building'
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

export interface CatalogQuestion {
  id: string
  category: string
  title: string
  desc: string
  chart: string
  sql?: string
}

export interface CatalogCategory {
  id: string
  title: string
  icon: IconName
  color: string
}

export interface CatalogPayload {
  categories: CatalogCategory[]
  questions: CatalogQuestion[]
}

export interface InterviewAnswers {
  audience: string
  focus: string[]
  detail_level: string
  comparison: string
  segmentation: string[]
  must_include: string
  must_skip: string
}

export interface BRPeriod {
  start: string
  end: string
  label: string
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
  | 'dataset'
