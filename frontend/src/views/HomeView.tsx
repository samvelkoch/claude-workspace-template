import type { Session, Project } from '../types/index.ts'
import { Icon } from '../components/Icon.tsx'

interface HomeViewProps {
  sessions: Session[]
  projects: Project[]
  onNewBR: () => void
  onSelectSession: (session: Session) => void
  onSelectProject: (name: string) => void
}

function relativeStamp(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return new Date(isoStr).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
  if (d === 1) return 'вчера'
  if (d < 7) return new Date(isoStr).toLocaleDateString('ru', { weekday: 'short' })
  return new Date(isoStr).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

const PROJECT_COLORS = [
  'var(--accent)',
  'var(--blue)',
  'var(--green)',
  'var(--amber)',
]

export function HomeView({ sessions, projects, onNewBR, onSelectSession, onSelectProject }: HomeViewProps) {
  const recent = sessions.slice(0, 8)
  const totalSessions = sessions.length

  return (
    <div className="home-view">
      <div className="home-feed">
        {/* Greeting */}
        <h1 className="home-greeting-title">С возвращением</h1>
        <p className="home-greeting-sub">
          Продолжите работу над BR — все ваши файлы и диалоги уже на месте.
        </p>

        {/* Action buttons */}
        <div className="home-actions">
          <button className="btn primary home-action-btn" onClick={onNewBR} type="button">
            <Icon name="plus" size={13} color="#fff" />
            <div>
              <span className="home-action-title">Новый BR</span>
              <span className="home-action-meta">загрузить файл или взять из проекта</span>
            </div>
          </button>
          <button className="btn home-action-btn" type="button">
            <Icon name="search" size={13} color="var(--fg-2)" />
            <div>
              <span className="home-action-title">Найти в истории</span>
              <span className="home-action-meta dim">{totalSessions} сессий</span>
            </div>
          </button>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <div className="home-section-header">
              <span className="home-section-label">Проекты</span>
              <div className="home-section-line" />
              <button className="btn ghost" style={{ padding: '2px 6px', fontSize: 11 }} type="button">
                <Icon name="plus" size={10} color="var(--fg-2)" />
                Новый
              </button>
            </div>
            <div className="home-projects-grid" style={{ gridTemplateColumns: `repeat(${Math.min(projects.length, 4)}, 1fr)` }}>
              {projects.map((p, i) => {
                const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
                const projSessions = sessions.filter(s => s.project_name === p.name)
                const fileIds = [...new Set(projSessions.map(s => s.file_id).filter(Boolean))]
                const lastUpdated = projSessions[0]
                  ? relativeStamp(projSessions[0].updated_at)
                  : '—'
                return (
                  <button
                    key={p.name}
                    className="home-project-card"
                    onClick={() => onSelectProject(p.name)}
                    type="button"
                  >
                    <div className="home-project-card-head">
                      <Icon name="folder" size={14} color={color} />
                      <span className="home-project-name">{p.name}</span>
                    </div>
                    <div className="home-project-stats">
                      <span className="home-project-meta">
                        {fileIds.length} {fileIds.length === 1 ? 'файл' : 'файла'} · {projSessions.length} сессий
                      </span>
                      <span className="home-project-time">{lastUpdated}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Recent sessions */}
        {recent.length > 0 && (
          <>
            <div className="home-section-header">
              <span className="home-section-label">Недавние сессии</span>
              <div className="home-section-line" />
              {totalSessions > 8 && (
                <button className="btn ghost" style={{ padding: '2px 6px', fontSize: 11 }} type="button">
                  Все {totalSessions} →
                </button>
              )}
            </div>
            <div className="home-sessions-table">
              {recent.map((s, i) => (
                <div
                  key={s.id}
                  className="home-sessions-row"
                  style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--line)' : 'none' }}
                  onClick={() => onSelectSession(s)}
                >
                  <div className="home-sessions-proj">
                    <Icon name="folder" size={11} color="var(--fg-3)" />
                    <span className="home-sessions-proj-name">{s.project_name ?? '—'}</span>
                  </div>
                  <div className="home-sessions-title">{s.title}</div>
                  <div className="home-sessions-file">{s.file_name ?? '—'}</div>
                  <div className="home-sessions-stamp">{relativeStamp(s.updated_at)}</div>
                  <div className="home-sessions-state">
                    <span className={`chip${s.state === 'готов' ? ' ready' : ''}`}>{s.state}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty first-time state */}
        {sessions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: 'var(--fg-3)',
          }}>
            <Icon name="folder-open" size={32} color="var(--fg-4)" />
            <p style={{ marginTop: 16, fontSize: 14 }}>Пока нет сессий</p>
            <p style={{ fontSize: 12.5, color: 'var(--fg-4)' }}>Загрузите Excel-файл чтобы начать</p>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={onNewBR} type="button">
              <Icon name="plus" size={12} color="#fff" />
              Новый BR
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
