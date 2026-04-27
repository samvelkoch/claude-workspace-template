import { useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from 'react'
import type { ChatMessage, FileInfo } from '../types/index.ts'
import { Message } from './Message.tsx'
import { Icon } from './Icon.tsx'

interface ChatShellProps {
  messages: ChatMessage[]
  fileInfo: FileInfo | null
  onUploadFile: (file: File) => Promise<void>
  onSendMessage: (text: string) => Promise<void>
  inputDisabled?: boolean
  inputPlaceholder?: string
  loading?: boolean
  sessionTitle?: string
  sessionProject?: string | null
  sessionFileMeta?: string | null
}

export function ChatShell({
  messages,
  fileInfo: _fileInfo,
  onUploadFile,
  onSendMessage,
  inputDisabled = false,
  inputPlaceholder = 'Напишите вопрос...',
  loading = false,
  sessionTitle,
  sessionProject,
  sessionFileMeta,
}: ChatShellProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await onUploadFile(file)
  }, [onUploadFile])

  const handleSend = useCallback(async () => {
    const text = textRef.current?.value.trim()
    if (!text || inputDisabled) return
    if (textRef.current) textRef.current.value = ''
    await onSendMessage(text)
  }, [onSendMessage, inputDisabled])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }, [handleSend])

  return (
    <div className="chat">
      {/* Header */}
      <header className="chat-head">
        {sessionTitle ? (
          <div>
            <div className="session-breadcrumb">
              {sessionProject && (
                <>
                  <Icon name="folder" size={13} color="var(--fg-3)" />
                  <span className="bc-project">{sessionProject}</span>
                  <Icon name="chevron-right" size={10} color="var(--fg-4)" />
                </>
              )}
              <strong className="bc-title">{sessionTitle}</strong>
            </div>
            {sessionFileMeta && (
              <div className="chat-head-meta">{sessionFileMeta}</div>
            )}
          </div>
        ) : (
          <div className="brand">
            <svg className="brand-logo" viewBox="0 0 100 100" fill="currentColor" aria-label="Аэроклуб AI">
              <path d="M63.23,80.25L52.26,58.71l-7.89,8.44l15.54,30.48h9.03L80.91,61.3L70.6,57.91L63.23,80.25z"/>
              <path d="M39.03,19.42L2.69,31.39v9.03l30.48,15.54l8.44-7.89L20.08,37.1l22.34-7.36L39.03,19.42z"/>
              <path d="M84.47,15.87L72.66,51.68l10.31,3.4L97.85,9.9l-7.41-7.41L45.26,17.37l3.4,10.31L84.47,15.87L84.47,15.87z"/>
            </svg>
            <div className="brand-text">
              <span className="brand-name">Аэроклуб AI</span>
              <span className="brand-sep">|</span>
              <span className="brand-service">talk2data</span>
              <span className="brand-sep">|</span>
              <span className="brand-product">Business Review Studio</span>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>
          {loading ? 'обработка...' : (sessionFileMeta ? '' : 'demo')}
        </div>
      </header>

      {/* Progress bar */}
      {loading && <div className="progress-bar" />}

      {/* Body */}
      <div className="chat-body" ref={bodyRef}>
        <div className="chat-feed">
          {messages.map(msg => (
            <Message
              key={msg.id}
              from={msg.from}
              stamp={msg.stamp}
              content={msg.content}
            />
          ))}
        </div>
      </div>

      {/* Composer */}
      <footer className="chat-foot">
        <div className="composer">
          <button
            className="composer-btn"
            type="button"
            aria-label="Прикрепить файл"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="paperclip" size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            ref={textRef}
            className="composer-input"
            type="text"
            placeholder={inputPlaceholder}
            disabled={inputDisabled}
            onKeyDown={handleKeyDown}
          />
          <button
            className="composer-btn send"
            type="button"
            aria-label="Отправить"
            onClick={() => void handleSend()}
            disabled={inputDisabled}
          >
            <Icon name="arrow-up" size={16} />
          </button>
        </div>
      </footer>
    </div>
  )
}
