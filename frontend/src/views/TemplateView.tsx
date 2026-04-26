import { Icon } from '../components/Icon.tsx'

type TemplateId = 'executive' | 'operational' | 'client'

interface TemplateViewProps {
  onPick: (template: TemplateId) => void
}

interface TemplateCard {
  id: TemplateId
  badge: string
  name: string
  meta: string
  featured?: boolean
}

const TEMPLATES: TemplateCard[] = [
  { id: 'executive', badge: 'EXEC', name: 'Executive Summary', meta: '8 слайдов · ~30 сек', featured: true },
  { id: 'operational', badge: 'OPS', name: 'Operational Review', meta: '18 слайдов · ~1 мин' },
  { id: 'client', badge: 'CLI', name: 'Client Presentation', meta: '12 слайдов · ~45 сек' },
]

export function TemplateView({ onPick }: TemplateViewProps) {
  return (
    <div>
      <p style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
        Выберите шаблон для Business Review:
      </p>
      <div className="template-cards">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`template-card${t.featured ? ' featured' : ''}`}
            type="button"
            onClick={() => onPick(t.id)}
          >
            <div className="tmpl-badge">{t.badge}</div>
            <div className="tmpl-body">
              <div className="tmpl-name">{t.name}</div>
              <div className="tmpl-meta">{t.meta}</div>
            </div>
            <div className="tmpl-action">
              <span className={`btn${t.featured ? ' primary' : ''}`} style={{ pointerEvents: 'none', fontSize: 12, padding: '6px 12px' }}>
                Выбрать
                <Icon name="chevron-right" size={14} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
