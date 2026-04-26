import { useState, useCallback, useRef } from 'react'
import type { Phase, FileInfo, ChatMessage } from './types/index.ts'
import { ChatShell } from './components/ChatShell.tsx'
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function now() {
  return new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

let idCounter = 0
function uid() {
  return String(++idCounter)
}

// ── Mock data for demo mode ───────────────────────────────
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
          <button key={s} className="chip" type="button" style={{ fontSize: 12 }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      from: 'assistant',
      stamp: now(),
      content: <UploadViewWrapper />,
    },
  ])
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive')
  const [loading, setLoading] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const append = useCallback((msg: Omit<ChatMessage, 'id' | 'stamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: uid(), stamp: now() }])
  }, [])

  // ── File upload ──────────────────────────────────────────
  const handleUploadFile = useCallback(async (file: File) => {
    setLoading(true)

    // Show user message with file chip
    append({
      from: 'user',
      content: (
        <FileChip fileName={file.name} />
      ),
    })

    let info: FileInfo
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/excel/upload`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { file_id: string; filename: string; row_count: number; column_count: number }
      info = { fileId: data.file_id, fileName: data.filename, rowCount: data.row_count, columnCount: data.column_count }
    } catch {
      // Demo mode fallback
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

    // Delay entry cards slightly for natural feel
    setTimeout(() => {
      append({
        from: 'assistant',
        content: <EntryViewWrapper onPick={handleScenarioPick} />,
      })
    }, 400)
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scenario pick ────────────────────────────────────────
  const handleScenarioPick = useCallback((scenario: 'free_chat' | 'template' | 'preview') => {
    if (scenario === 'free_chat') {
      setPhase('free_chat')
      append({
        from: 'user',
        content: <p>Спросить данные</p>,
      })
      append({
        from: 'assistant',
        content: <FreeChatViewWrapper onSuggestion={handleSuggestion} />,
      })
    } else if (scenario === 'template') {
      setPhase('template')
      append({
        from: 'user',
        content: <p>Собрать Business Review</p>,
      })
      append({
        from: 'assistant',
        content: <TemplateViewWrapper onPick={handleTemplatePick} />,
      })
    } else {
      setPhase('free_chat')
      append({
        from: 'user',
        content: <p>Просто посмотреть</p>,
      })
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
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Free chat ────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    setLoading(true)

    append({ from: 'user', content: <p>{text}</p> })

    try {
      const res = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          messages: [{ role: 'user', content: text }],
        }),
      })
      if (!res.ok) throw new Error('API unavailable')
      const data = await res.json() as { choices: { message: { content: string } }[] }
      const reply = data.choices[0]?.message?.content ?? ''
      append({ from: 'assistant', content: <p>{reply}</p> })
    } catch {
      // Demo mode
      append({ from: 'assistant', content: mockChatResponse(text) })
    }

    setLoading(false)
  }, [append])

  const handleSuggestion = useCallback((text: string) => {
    void handleSendMessage(text)
  }, [handleSendMessage])

  // ── Template flow ────────────────────────────────────────
  const handleTemplatePick = useCallback((template: string) => {
    setSelectedTemplate(template)
    setPhase('interview')
    append({
      from: 'user',
      content: <p>{template === 'executive' ? 'Executive Summary' : template === 'operational' ? 'Operational Review' : 'Client Presentation'}</p>,
    })
    append({
      from: 'assistant',
      content: <InterviewViewWrapper onComplete={handleInterviewComplete} />,
    })
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInterviewComplete = useCallback((_answers: Record<string, string>) => {
    setPhase('catalog')
    append({
      from: 'assistant',
      content: <CatalogViewWrapper onConfirm={handleCatalogConfirm} />,
    })
  }, [append]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCatalogConfirm = useCallback((_selected: string[]) => {
    setPhase('presentation')
    append({
      from: 'user',
      content: <p>Генерирую презентацию...</p>,
    })

    // Simulate generation delay
    setTimeout(() => {
      append({
        from: 'assistant',
        content: (
          <div>
            <p style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
              Презентация готова:
            </p>
            <PresentationViewWrapper fi={fileInfo} template={selectedTemplate} />
          </div>
        ),
      })
    }, 800)
  }, [append, fileInfo, selectedTemplate])

  return (
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
    />
  )
}

// ── Wrapper stubs (capture callbacks at render time) ──────
// These are stable render wrappers so we don't embed callbacks directly
// in the persisted message content nodes.

function UploadViewWrapper() {
  return <p style={{ color: 'var(--fg-3)' }}>Загрузите Excel-файл через кнопку скрепки в строке ввода или перетащите файл ниже.</p>
}

interface EntryViewWrapperProps {
  onPick: (s: 'free_chat' | 'template' | 'preview') => void
}
function EntryViewWrapper({ onPick }: EntryViewWrapperProps) {
  return <EntryView onPick={onPick} />
}

interface FreeChatViewWrapperProps {
  onSuggestion: (text: string) => void
}
function FreeChatViewWrapper({ onSuggestion }: FreeChatViewWrapperProps) {
  return <FreeChatView onSuggestion={onSuggestion} />
}

interface TemplateViewWrapperProps {
  onPick: (t: string) => void
}
function TemplateViewWrapper({ onPick }: TemplateViewWrapperProps) {
  return <TemplateView onPick={onPick} />
}

interface InterviewViewWrapperProps {
  onComplete: (a: Record<string, string>) => void
}
function InterviewViewWrapper({ onComplete }: InterviewViewWrapperProps) {
  return <InterviewView onComplete={onComplete} />
}

interface CatalogViewWrapperProps {
  onConfirm: (s: string[]) => void
}
function CatalogViewWrapper({ onConfirm }: CatalogViewWrapperProps) {
  return <CatalogView onConfirm={onConfirm} />
}

interface PresentationViewWrapperProps {
  fi: FileInfo | null
  template: string
}
function PresentationViewWrapper({ fi, template }: PresentationViewWrapperProps) {
  return <PresentationView fileInfo={fi} template={template} />
}
