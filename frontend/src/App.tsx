import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  Phase, FileInfo, ChatMessage, Session, Project,
  BRPeriod, InterviewAnswers,
} from './types/index.ts'
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
import { BuildingView } from './views/BuildingView.tsx'
import { PresentationView } from './views/PresentationView.tsx'
import { HomeView } from './views/HomeView.tsx'
import { SourcePickerView } from './views/SourcePickerView.tsx'
import { MessageContent } from './components/MessageContent.tsx'

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

function mockDBResponse(_question: string) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-3)', marginBottom: 8 }}>
        <span className="mono" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intent</span>
        <span>агрегация по периоду</span>
      </div>
      <div className="mono" style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--line)',
        borderRadius: 4,
        padding: '10px 12px',
        fontSize: 11.5,
        lineHeight: 1.55,
        marginBottom: 10,
        whiteSpace: 'pre',
      }}>
        <span style={{ color: 'var(--fg-3)' }}>{`-- sm.transactions`}</span>{'\n'}
        <span style={{ color: 'var(--accent)' }}>SELECT</span>{` date_trunc(`}<span style={{ color: 'var(--green)' }}>{`'month'`}</span>{`, t.issued_at) `}<span style={{ color: 'var(--accent)' }}>AS</span>{` month,`}{'\n'}
        {`       count(*) `}<span style={{ color: 'var(--accent)' }}>AS</span>{` trips`}{'\n'}
        <span style={{ color: 'var(--accent)' }}>FROM</span>{` sm.transactions t`}{'\n'}
        <span style={{ color: 'var(--accent)' }}>WHERE</span>{` t.issued_at >= `}<span style={{ color: 'var(--green)' }}>{`'2026-07-01'`}</span>{'\n'}
        <span style={{ color: 'var(--accent)' }}>GROUP BY</span>{` 1 `}<span style={{ color: 'var(--accent)' }}>ORDER BY</span>{` 1;`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-3)', marginBottom: 10 }}>
        <span className="mono">3 строки · 118 мс · sm.transactions (live)</span>
      </div>
      <p>Q3 2026 — <strong>4 218</strong> командировок, рост <strong style={{ color: 'var(--green)' }}>+11.4%</strong> к Q2.</p>
      <DataTable
        columns={[
          { key: 'month', label: 'Месяц' },
          { key: 'trips', label: 'Командировок', numeric: true },
          { key: 'delta', label: 'Δ м/м', numeric: true },
        ]}
        rows={[
          { month: 'Июль', trips: '1 248', delta: '—' },
          { month: 'Август', trips: '1 392', delta: '+11.5%' },
          { month: 'Сентябрь', trips: '1 578', delta: '+13.4%' },
        ]}
      />
      <FakeLine title="Командировки, шт./месяц" />
      <p className="dim" style={{ fontSize: 11, marginTop: 10 }}>
        Это демо-ответ — бэкенд для запросов к SM ещё не готов.
      </p>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [, setSelectedTemplate] = useState<string>('executive')
  const [loading, setLoading] = useState(false)

  // Session state
  const [sessions, setSessions] = useState<Session[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  // BR build state
  const [brSelectedIds, setBrSelectedIds] = useState<string[]>([])
  const [brPeriod, setBrPeriod] = useState<BRPeriod | null>(null)
  const [, setBrMarkdown] = useState<string | null>(null)
  const [, setBrError] = useState<string | null>(null)

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const fileInfoRef = useRef(fileInfo)
  fileInfoRef.current = fileInfo
  const activeSessionRef = useRef(activeSession)
  activeSessionRef.current = activeSession

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

  // Refs for stable callbacks (used by JSX in messages)
  const handleSourcePickRef = useRef<(scenario: 'db' | 'file' | 'topic', payload?: string) => void>(() => {})
  const handleScenarioPickRef = useRef<(scenario: 'free_chat' | 'template' | 'preview') => void>(() => {})
  const handleSendMessageRef = useRef<(text: string) => Promise<void>>(async () => {})

  // ── Start new BR (go to source picker) ───────────────────
  const handleNewBR = useCallback(() => {
    setActiveSession(null)
    setFileInfo(null)
    setMessages([{
      id: uid(),
      from: 'assistant',
      stamp: now(),
      content: (
        <SourcePickerView
          onPickDB={() => handleSourcePickRef.current('db')}
          onPickFile={() => handleSourcePickRef.current('file')}
          onPickTopic={(topic) => handleSourcePickRef.current('topic', topic)}
        />
      ),
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

  // ── Source pick (DB / File / Topic) ──────────────────────
  const handleSourcePick = useCallback((scenario: 'db' | 'file' | 'topic', payload?: string) => {
    if (scenario === 'db') {
      setPhase('db_chat')
      void createSession('Запрос к SM', null)
      append({ from: 'user', content: <p>Спросить базу SM</p> })
      append({
        from: 'assistant',
        content: (
          <p style={{ color: 'var(--fg-2)' }}>
            Подключён к источникам SM. Задайте вопрос — я разберусь, в какую таблицу идти, напишу SQL и верну результат.
          </p>
        ),
      })
    } else if (scenario === 'file') {
      // Trigger file picker via composer paperclip — fileInputRef lives in ChatShell.
      // The cleanest UX: show hint message; user clicks paperclip button below.
      append({
        from: 'assistant',
        content: (
          <p style={{ color: 'var(--fg-3)' }}>
            Нажмите на скрепку в строке ввода ниже и выберите Excel-файл.
          </p>
        ),
      })
    } else if (scenario === 'topic' && payload) {
      // Pre-fill chat with the topic question
      setPhase('db_chat')
      void createSession(payload, null)
      void handleSendMessageRef.current(payload)
    }
  }, [append, createSession])

  // ── Scenario pick ────────────────────────────────────────
  const handleScenarioPick = useCallback((scenario: 'free_chat' | 'template' | 'preview') => {
    const fi = fileInfoRef.current
    if (scenario === 'free_chat') {
      setPhase('free_chat')
      void createSession('Свободный чат', fi)
      append({ from: 'user', content: <p>Спросить данные</p> })
      append({ from: 'assistant', content: <FreeChatViewWrapper onSuggestion={handleSuggestion} /> })
    } else if (scenario === 'template') {
      setPhase('template')
      append({ from: 'user', content: <p>Собрать Business Review</p> })
      append({ from: 'assistant', content: <TemplateViewWrapper onPick={handleTemplatePick} /> })
    } else {
      setPhase('free_chat')
      void createSession('Быстрый обзор', fi)
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
  }, [append, createSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Free chat ────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    append({ from: 'user', content: <p>{text}</p> })

    try {
      const sessionId = activeSessionRef.current?.id
      if (sessionId) {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        })
        if (!res.ok) throw new Error('API unavailable')
        const data = await res.json() as { content: string }
        append({ from: 'assistant', content: <MessageContent text={data.content} /> })
      } else {
        // Fallback: legacy endpoint
        const res = await fetch(`${API_BASE}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'talk2data',
            messages: [{ role: 'user', content: text }],
            file_id: fileInfoRef.current?.fileId ?? null,
          }),
        })
        if (!res.ok) throw new Error('API unavailable')
        const data = await res.json() as { choices: { message: { content: string } }[] }
        append({ from: 'assistant', content: <MessageContent text={data.choices[0]?.message?.content ?? ''} /> })
      }
    } catch {
      const isDB = phaseRef.current === 'db_chat'
      append({ from: 'assistant', content: isDB ? mockDBResponse(text) : mockChatResponse(text) })
    }

    setLoading(false)
  }, [append])

  const handleSuggestion = useCallback((text: string) => {
    void handleSendMessage(text)
  }, [handleSendMessage])

  // ── Template flow ────────────────────────────────────────
  const handleTemplatePick = useCallback((template: string) => {
    setSelectedTemplate(template)
    setPhase('catalog')
    const name = template === 'executive' ? 'Executive Summary' : template === 'operational' ? 'Operational Review' : 'Client Presentation'
    void createSession(name, fileInfoRef.current)
    append({ from: 'user', content: <p>{name}</p> })
    append({ from: 'assistant', content: <CatalogViewWrapper onConfirm={handleCatalogConfirmRef.current} /> })
  }, [append, createSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── BR Catalog → Interview → Build → Presentation ────────
  const handleBuildBR = useCallback(() => {
    setBrSelectedIds([])
    setBrPeriod(null)
    setBrMarkdown(null)
    setBrError(null)
    setPhase('catalog')
    append({ from: 'user', content: <p>Собрать BR</p> })
    append({
      from: 'assistant',
      content: <CatalogViewWrapper onConfirm={handleCatalogConfirmRef.current} />,
    })
  }, [append])

  const handleCatalogConfirm = useCallback((ids: string[], period: BRPeriod) => {
    setBrSelectedIds(ids)
    setBrPeriod(period)
    setPhase('interview')
    append({
      from: 'user',
      content: <p>Выбрано {ids.length} вопросов · период {period.label}</p>,
    })
    append({
      from: 'assistant',
      content: <InterviewViewWrapper onComplete={handleInterviewCompleteRef.current} />,
    })
  }, [append])

  const handleInterviewComplete = useCallback(async (answers: InterviewAnswers) => {
    const ids = brSelectedIds
    const period = brPeriod
    if (!ids.length || !period) return

    setPhase('building')
    append({
      from: 'user',
      content: <p>Готово, собираем BR.</p>,
    })
    append({
      from: 'assistant',
      content: <BuildingView totalQuestions={ids.length} periodLabel={period.label} />,
    })

    // Ensure we have a session
    let session = activeSessionRef.current
    if (!session) {
      session = await createSession(`BR · ${period.label}`, null)
    }
    if (!session) {
      setBrError('Не удалось создать сессию')
      setPhase('catalog')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/sessions/${session.id}/build_br`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_ids: ids,
          period,
          interview: answers,
        }),
      })
      if (!res.ok) {
        let detail = `HTTP ${res.status}`
        try {
          const err = await res.json() as { detail?: string | Record<string, unknown> }
          if (err.detail) detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
        } catch { /* ignore */ }
        throw new Error(detail)
      }
      const data = await res.json() as { markdown: string; stats: { questions_run: number; errors: number } }
      setBrMarkdown(data.markdown)
      setPhase('presentation')
      append({
        from: 'assistant',
        content: (
          <PresentationView
            markdown={data.markdown}
            periodLabel={period.label}
            onClose={() => { /* no-op for now, history stays */ }}
          />
        ),
      })
      // Mark session as ready locally
      setActiveSession(prev => prev ? { ...prev, state: 'готов' } : null)
      setSessions(prev => prev.map(s => s.id === session!.id ? { ...s, state: 'готов' } : s))
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      setBrError(msg)
      append({
        from: 'assistant',
        content: <p style={{ color: 'var(--accent)' }}>Ошибка сборки BR: {msg}</p>,
      })
      setPhase('catalog')
    }
  }, [append, brSelectedIds, brPeriod, createSession])

  // Refs for stable closures used inside JSX in messages
  const handleCatalogConfirmRef = useRef<(ids: string[], p: BRPeriod) => void>(() => {})
  const handleInterviewCompleteRef = useRef<(a: InterviewAnswers) => Promise<void>>(async () => {})
  handleCatalogConfirmRef.current = handleCatalogConfirm
  handleInterviewCompleteRef.current = handleInterviewComplete

  // Sync refs with latest callbacks
  handleSourcePickRef.current = handleSourcePick
  handleScenarioPickRef.current = handleScenarioPick
  handleSendMessageRef.current = handleSendMessage

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
          inputDisabled={loading}
          inputPlaceholder={
            phase === 'upload'
              ? 'Задайте вопрос или выберите источник выше...'
              : phase === 'db_chat'
              ? 'Спросите что-нибудь о данных SM...'
              : 'Напишите вопрос...'
          }
          loading={loading}
          sessionTitle={activeSession?.title}
          sessionProject={activeSession?.project_name ?? null}
          sessionFileMeta={sessionFileMeta}
          onBuildBR={
            phase === 'db_chat' || phase === 'free_chat'
              ? handleBuildBR
              : undefined
          }
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

interface InterviewViewWrapperProps { onComplete: (a: InterviewAnswers) => void }
function InterviewViewWrapper({ onComplete }: InterviewViewWrapperProps) { return <InterviewView onComplete={onComplete} /> }

interface CatalogViewWrapperProps { onConfirm: (ids: string[], period: BRPeriod) => void }
function CatalogViewWrapper({ onConfirm }: CatalogViewWrapperProps) { return <CatalogView onConfirm={onConfirm} /> }
