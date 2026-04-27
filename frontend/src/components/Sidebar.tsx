import type { Session, Project } from '../types/index.ts'
import { Icon } from './Icon.tsx'

interface SidebarProps {
  sessions: Session[]
  projects: Project[]
  activeSessionId: string | null
  onNewBR: () => void
  onSelectSession: (session: Session) => void
  onSelectProject: (projectName: string) => void
}

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return m <= 1 ? 'только что' : `${m} мин`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}ч`
  const d = Math.floor(h / 24)
  if (d === 1) return 'вчера'
  if (d < 7) return `${d} дн`
  return new Date(isoStr).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

export function Sidebar({
  sessions,
  projects,
  activeSessionId,
  onNewBR,
  onSelectSession,
  onSelectProject,
}: SidebarProps) {
  const pinned = sessions.filter(s => s.pinned)
  const recent = sessions.filter(s => !s.pinned).slice(0, 8)

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-head">
        <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12 L12 3 L21 12 L12 21 Z" opacity="0.9" /></svg>
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>talk2data</span>
        <button className="btn ghost" style={{ padding: '3px 5px' }}>
          <Icon name="search" size={12} color="var(--fg-2)" />
        </button>
      </div>

      {/* New BR button */}
      <div style={{ padding: 8 }}>
        <button className="btn primary sidebar-new-btn" onClick={onNewBR} type="button">
          <Icon name="plus" size={11} color="#fff" />
          Новый BR
        </button>
      </div>

      {/* Tree */}
      <div className="sidebar-tree">
        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <div className="sidebar-section-label">
              <Icon name="pin" size={10} color="var(--fg-3)" />
              Закреплено
            </div>
            {pinned.map(s => (
              <SessionTreeRow
                key={s.id}
                session={s}
                active={s.id === activeSessionId}
                indent={0}
                onClick={() => onSelectSession(s)}
              />
            ))}
          </>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 14 }}>
              <span style={{ flex: 1 }}>Проекты</span>
              <button>
                <Icon name="plus" size={11} color="var(--fg-3)" />
              </button>
            </div>
            {projects.map(proj => {
              const projSessions = sessions.filter(s => s.project_name === proj.name)
              return (
                <ProjectTreeBlock
                  key={proj.name}
                  project={proj}
                  sessions={projSessions}
                  activeSessionId={activeSessionId}
                  onSelectProject={() => onSelectProject(proj.name)}
                  onSelectSession={onSelectSession}
                />
              )
            })}
          </>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 14 }}>
              <Icon name="clock" size={11} color="var(--fg-3)" />
              Недавнее
            </div>
            {recent.map(s => (
              <SessionTreeRow
                key={s.id}
                session={s}
                active={s.id === activeSessionId}
                indent={0}
                onClick={() => onSelectSession(s)}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {sessions.length === 0 && projects.length === 0 && (
          <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--fg-4)', fontSize: 12 }}>
            Загрузите файл чтобы начать
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">АК</div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">Аэроклуб AI</div>
          <div className="sidebar-footer-meta">talk2data BR</div>
        </div>
        <button className="btn ghost" style={{ padding: '3px 5px' }}>
          <Icon name="more" size={12} color="var(--fg-2)" />
        </button>
      </div>
    </aside>
  )
}

function ProjectTreeBlock({
  project,
  sessions,
  activeSessionId,
  onSelectProject,
  onSelectSession,
}: {
  project: Project
  sessions: Session[]
  activeSessionId: string | null
  onSelectProject: () => void
  onSelectSession: (s: Session) => void
}) {
  const isActive = sessions.some(s => s.id === activeSessionId)

  // Group sessions by file_name
  const byFile = new Map<string | null, Session[]>()
  for (const s of sessions) {
    const key = s.file_name ?? null
    if (!byFile.has(key)) byFile.set(key, [])
    byFile.get(key)!.push(s)
  }

  return (
    <>
      <div
        className={`folder-row${isActive ? ' active' : ''}`}
        onClick={onSelectProject}
      >
        <Icon name="chevron-down" size={11} color="var(--fg-3)" />
        <Icon name="folder-open" size={13} color={isActive ? 'var(--accent)' : 'var(--fg-2)'} />
        <span className="folder-row-name">{project.name}</span>
        <span className="folder-row-count">{sessions.length}</span>
      </div>

      {/* Sessions grouped by file */}
      {Array.from(byFile.entries()).map(([fileName, fileSessions]) => (
        <div key={fileName ?? '__none__'}>
          {fileName && (
            <div className="file-row" style={{ cursor: 'default' }}>
              <div className="file-row-icon">XLS</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="file-row-name">{fileName}</div>
              </div>
            </div>
          )}
          {fileSessions.slice(0, 5).map(s => (
            <SessionTreeRow
              key={s.id}
              session={s}
              active={s.id === activeSessionId}
              indent={fileName ? 2 : 1}
              onClick={() => onSelectSession(s)}
            />
          ))}
        </div>
      ))}
    </>
  )
}

function SessionTreeRow({
  session,
  active,
  indent,
  onClick,
}: {
  session: Session
  active: boolean
  indent: number
  onClick: () => void
}) {
  const icon = session.state === 'готов' ? 'slides' : 'message'
  const time = relativeTime(session.updated_at)

  return (
    <div
      className={`session-row${active ? ' active' : ''}`}
      style={{ paddingLeft: 12 + indent * 14 }}
      onClick={onClick}
    >
      <Icon name={icon} size={11} color={active ? 'var(--accent)' : 'var(--fg-3)'} />
      <span className="session-row-title">{session.title}</span>
      {session.state === 'готов' && (
        <span className="session-row-badge">готов</span>
      )}
      <span className="session-row-time">{time}</span>
    </div>
  )
}
