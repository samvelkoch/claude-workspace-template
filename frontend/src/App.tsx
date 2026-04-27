import { useState, useCallback, useRef, useEffect } from 'react'
import type { Phase, FileInfo, ChatMessage, Session, Project } from './types/index.ts'
import { ChatShell } from './components/ChatShell.tsx'
import { Sidebar } from './components/Sidebar.tsx'
import { FileChip } from './components/FileChip.tsx'
import { ToolCallBadge } from './components/ToolCallBadge.tsx'
import { DataTable } from './components/DataTable.tsx'
import { FakeBars } from './components/FakeBars.tsx'
import { FakeLine } from './components/FakeLine.tsx'
import { EntryView } from './views/EntryView.tsx'
import { FreeChatView } from './views/FreeChatView.tsx'
import { TemplateView } from './views/TemplateView.tsx'
import { InterviewView } from './views/InterviewView.tsx'
import { CatalogView } from './views/CatalogView.tsx'
import { PresentationView } from './views/PresentationView.tsx'
import { HomeView } from './views/HomeView.tsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function now() {
  return new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

let idCounter = 0
function uid() { return String(++idCounter) }

// ── Mock data ─────────────────────────────────────────────
const MOCK_TABLE_COLS = [
  { key: 'direction', label: 'Направление' },
  { key: 'trips', label: 'Поездок', numeric: true },
  { key: 'total', label: 'Сумма, ₽', numeric: true },
  { key: 'avg', label: 'Средний чек, ₽', numeric: true },
]
const MOCK_TABLE_ROWS = [
  { direction: 'Москва — Санкт-Петербург', trips: '1 847', total: '18 234 800', avg: '9 872' },
  { direction: 'Москва — Алматы', trips: '934', total: '24 800 000', avg: '26 551' },
  { direction: 'Москва — Дубай', trips: '712', total: '38 400 000', avg: '53 933' },
  { direction: 'Москва — Берлин', trips: '601', total: '31 200 000', avg: '51 913' },
  { direction: 'СПб — Сочи', trips: '543', total: '9 800 000', avg: '18 048' },
]

function mockChatResponse(question: string) {
  const lower = question.toLowerCase()
  const isTimeSeries = lower.includes('динамик') || lower.includes('месяц') || lower.includes('тренд')
  return (
    <div>
      <ToolCallBadge tool="excel_aggregate" durationSec={1.2} rowsIn={34218} rowsOut={10} />
      <p style={{ color: 'var(--fg-2)', marginBottom: 8 }}>
        По данным за период: {isTimeSeries ? 'динамика расходов по месяцам' : 'топ-10 направлений по расходам'}.
      </p>
      {isTimeSeries ? (
        <FakeLine title="Расходы на командировки, M ₽" />
      ) : (
        <>
          <DataTable columns={MOCK_TABLE_COLS} rows={MOCK_TABLE_ROWS} />
          <FakeBars title="Расходы по направлениям, M ₽" />
        </>
      )}
      <div className="chips-row" style={{ marginTop: 10 }}>
        {['Показать по месяцам', 'Разбить по департаментам', 'Сравнить с прошлым кварталом'].map(s => (
          <button key={s} className="chip" type="button" style={{ fontSize: 12 }}>{s}</button>
        ))}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive')
  const [loading, setLoading] = useState(false)

  // Session state
  const [sessions, setSessions] = useState<Session[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  // Load sessions on startup
  useEffect(() => {
    void loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const [sessRes, projRes] = await Promise.all([
        fetch(`${API_BASE}/sessions`),
        fetch(`${API_BASE}/projects`),
      ])
      if (sessRes.ok) setSessions(await sessRes.json() as Session[])
      if (projRes.ok) setProjects(await projRes.json() as Project[])
    } catch {
      // Demo mode: no sessions yet
    }
  }

  const append = useCallback((msg: Omit<ChatMessage, 'id' | 'stamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: uid(), stamp: now() }])
  }, [])

  // ── Start new BR (go to upload) ──────────────────────────
  const handleNewBR = useCallback(() => {
    setActiveSession(null)
    setFileInfo(null)
    setMessages([{
      id: uid(),
      from: 'assistant',
      stamp: now(),
      content: <p style={{ color: 'var(--fg-3)' }}>Загрузите Excel-файл через кнопку скрепки в строке ввода или перетащите файл ниже.</p>,
    }])
    setPhase('upload')
  }, [])

  // ── Open existing session ────────────────────────────────
  const handleSelectSession = useCallback((session: Session) => {
    setActiveSession(session)
    setFileInfo(session.file_id ? {
      fileId: session.file_id,
      fileName: session.file_name ?? '',
      rowCount: 0,
      columnCount: 0,
    } : null)
    setMessages([{
      id: uid(),
      from: 'assistant',
      stamp: now(),
      content: (
        <div>
          <p>Открыл сессию <strong>{session.title}</strong>{session.project_name ? ` из проекта ${session.project_name}` : ''}.</p>
          {session.file_name && (
            <p style={{ color: 'var(--fg-3)', marginTop: 4 }}>
              Файл <strong>{session.file_name}</strong> уже загружен. Контекст диалога восстановлен.
            </p>
          )}
        </div>
      ),
    }])
    setPhase('free_chat')
  }, [])

  const handleSelectProject = useCallback((_projectName: string) => {
    // TODO: show project view (HistoryC)
  }, [])

  // ── File upload ──────────────────────────────────────────
  const handleUploadFile = useCallback(async (file: File) => {
    setLoading(true)
    append({ from: 'user', content: <FileChip fileName={file.name} /> })

    let info: FileInfo
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/excel/upload`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { file_id: string; filename: string; row_count: number; column_count: number }
      info = { fileId: data.file_id, fileName: data.filename, rowCount: data.row_count, columnCount: data.column_count }
    } catch {
      info = { fileId: 'demo1234', fileName: file.name, rowCount: 34218, columnCount: 127 }
    }

    setFileInfo(info)
    setPhase('entry')
    setLoading(false)

    append({
      from: 'assistant',
      content: (
        <div>
          <FileChip fileName={info.fileName} rowCount={info.rowCount} columnCount={info.columnCount} />
          <p style={{ color: 'var(--fg-2)', marginBottom: 0 }}>
            Файл принят: <strong style={{ color: 'var(--fg)' }}>{info.rowCount.toLocaleString('ru')}</strong> строк,{' '}
            <strong style={{ color: 'var(--fg)' }}>{info.columnCount}</strong> колонок.
          </p>
        </div>
      ),
    })

    setTimeout(() => {
      append({
        from: 'assistant',
        content: <EntryViewWrapper onPick={handleScenarioPick} />,
      })
    }, 400)
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create session on backend ────────────────────────────
  const createSession = useCallback(async (title: string, fi: FileInfo | null): Promise<Session | null> => {
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          file_id: fi?.fileId ?? null,
          file_name: fi?.fileName ?? null,
        }),
      })
      if (!res.ok) return null
      const session = await res.json() as Session
      setSessions(prev => [session, ...prev])
      setActiveSession(session)
      return session
    } catch {
      return null
    }
  }, [])

  // ── Scenario pick ────────────────────────────────────────
  const handleScenarioPick = useCallback((scenario: 'free_chat' | 'template' | 'preview') => {
    if (scenario === 'free_chat') {
      setPhase('free_chat')
      void createSession('Свободный чат', fileInfo)
      append({ from: 'user', content: <p>Спросить данные</p> })
      append({ from: 'assistant', content: <FreeChatViewWrapper onSuggestion={handleSuggestion} /> })
    } else if (scenario === 'template') {
      setPhase('template')
      append({ from: 'user', content: <p>Собрать Business Review</p> })
      append({ from: 'assistant', content: <TemplateViewWrapper onPick={handleTemplatePick} /> })
    } else {
      setPhase('free_chat')
      void createSession('Быстрый обзор', fileInfo)
      append({ from: 'user', content: <p>Просто посмотреть</p> })
      append({
        from: 'assistant',
        content: (
          <div>
            <p style={{ marginBottom: 10 }}>Быстрый обзор данных:</p>
            <DataTable columns={MOCK_TABLE_COLS} rows={MOCK_TABLE_ROWS} />
            <FakeLine title="Динамика расходов" />
          </div>
        ),
      })
    }
  }, [append, fileInfo, createSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Free chat ────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    append({ from: 'user', content: <p>{text}</p> })

    try {
      const sessionId = activeSession?.id
      if (sessionId) {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        })
        if (!res.ok) throw new Error('API unavailable')
        const data = await res.json() as { content: string }
        append({ from: 'assistant', content: <p>{data.content}</p> })
      } else {
        // Fallback: legacy endpoint
        const res = await fetch(`${API_BASE}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'talk2data',
            messages: [{ role: 'user', content: text }],
            file_id: fileInfo?.fileId ?? null,
          }),
        })
        if (!res.ok) throw new Error('API unavailable')
        const data = await res.json() as { choices: { message: { content: string } }[] }
        append({ from: 'assistant', content: <p>{data.choices[0]?.message?.content ?? ''}</p> })
      }
    } catch {
      append({ from: 'assistant', content: mockChatResponse(text) })
    }

    setLoading(false)
  }, [append, activeSession, fileInfo])

  const handleSuggestion = useCallback((text: string) => {
    void handleSendMessage(text)
  }, [handleSendMessage])

  // ── Template flow ────────────────────────────────────────
  const handleTemplatePick = useCallback((template: string) => {
    setSelectedTemplate(template)
    setPhase('interview')
    const name = template === 'executive' ? 'Executive Summary' : template === 'operational' ? 'Operational Review' : 'Client Presentation'
    void createSession(name, fileInfo)
    append({ from: 'user', content: <p>{name}</p> })
    append({ from: 'assistant', content: <InterviewViewWrapper onComplete={handleInterviewComplete} /> })
  }, [append, fileInfo, createSession]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInterviewComplete = useCallback((_answers: Record<string, string>) => {
    setPhase('catalog')
    append({ from: 'assistant', content: <CatalogViewWrapper onConfirm={handleCatalogConfirm} /> })
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCatalogConfirm = useCallback((_selected: string[]) => {
    setPhase('presentation')
    append({ from: 'user', content: <p>Генерирую презентацию...</p> })
    setTimeout(() => {
      append({
        from: 'assistant',
        content: (
          <div>
            <p style={{ color: 'var(--fg-2)', marginBottom: 12 }}>Презентация готова:</p>
            <PresentationViewWrapper fi={fileInfo} template={selectedTemplate} />
          </div>
        ),
      })
      // Mark session as done
      if (activeSession?.id) {
        void fetch(`${API_BASE}/sessions/${activeSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: 'готов' }),
        })
        setActiveSession(prev => prev ? { ...prev, state: 'готов' } : null)
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, state: 'готов' } : s))
      }
    }, 800)
  }, [append, fileInfo, selectedTemplate, activeSession])

  // ── Render ───────────────────────────────────────────────
  const sessionFileMeta = activeSession?.file_name
    ? `из ${activeSession.file_name}${messages.length > 1 ? ` · ${messages.length - 1} сообщ.` : ''}`
    : null

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        projects={projects}
        activeSessionId={activeSession?.id ?? null}
        onNewBR={handleNewBR}
        onSelectSession={handleSelectSession}
        onSelectProject={handleSelectProject}
      />

      {phase === 'home' ? (
        <HomeView
          sessions={sessions}
          projects={projects}
          onNewBR={handleNewBR}
          onSelectSession={handleSelectSession}
          onSelectProject={handleSelectProject}
        />
      ) : (
        <ChatShell
          messages={messages}
          fileInfo={fileInfo}
          onUploadFile={handleUploadFile}
          onSendMessage={handleSendMessage}
          inputDisabled={loading || phase === 'upload'}
          inputPlaceholder={
            phase === 'upload'
              ? 'Загрузите файл через кнопку скрепки или перетащите выше...'
              : 'Напишите вопрос...'
          }
          loading={loading}
          sessionTitle={activeSession?.title}
          sessionProject={activeSession?.project_name ?? null}
          sessionFileMeta={sessionFileMeta}
        />
      )}
    </div>
  )
}

// ── Wrapper stubs ─────────────────────────────────────────
interface EntryViewWrapperProps { onPick: (s: 'free_chat' | 'template' | 'preview') => void }
function EntryViewWrapper({ onPick }: EntryViewWrapperProps) { return <EntryView onPick={onPick} /> }

interface FreeChatViewWrapperProps { onSuggestion: (text: string) => void }
function FreeChatViewWrapper({ onSuggestion }: FreeChatViewWrapperProps) { return <FreeChatView onSuggestion={onSuggestion} /> }

interface TemplateViewWrapperProps { onPick: (t: string) => void }
function TemplateViewWrapper({ onPick }: TemplateViewWrapperProps) { return <TemplateView onPick={onPick} /> }

interface InterviewViewWrapperProps { onComplete: (a: Record<string, string>) => void }
function InterviewViewWrapper({ onComplete }: InterviewViewWrapperProps) { return <InterviewView onComplete={onComplete} /> }

interface CatalogViewWrapperProps { onConfirm: (s: string[]) => void }
function CatalogViewWrapper({ onConfirm }: CatalogViewWrapperProps) { return <CatalogView onConfirm={onConfirm} /> }

interface PresentationViewWrapperProps { fi: FileInfo | null; template: string }
function PresentationViewWrapper({ fi, template }: PresentationViewWrapperProps) { return <PresentationView fileInfo={fi} template={template} /> }
