import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'

interface CatalogViewProps {
  onConfirm: (selected: string[]) => void
}

interface CatalogSection {
  title: string
  icon: Parameters<typeof Icon>[0]['name']
  questions: string[]
}

const CATALOG: CatalogSection[] = [
  {
    title: 'Финансы',
    icon: 'gauge',
    questions: [
      'Общий объём расходов на командировки',
      'Расходы по статьям (перелёт, отель, такси)',
      'Динамика расходов квартал к кварталу',
      'Средний чек на командировку',
    ],
  },
  {
    title: 'Направления',
    icon: 'flag',
    questions: [
      'Топ-10 направлений по количеству поездок',
      'Топ-10 направлений по расходам',
      'Новые направления за период',
    ],
  },
  {
    title: 'Сотрудники',
    icon: 'users',
    questions: [
      'Топ командирующихся сотрудников',
      'Расходы по департаментам',
      'Среднее кол-во поездок на сотрудника',
    ],
  },
  {
    title: 'Эффективность',
    icon: 'chart',
    questions: [
      'Экономия vs рыночные цены',
      'Доля ранних бронирований',
      'Нарушения тревел-политики',
    ],
  },
]

export function CatalogView({ onConfirm }: CatalogViewProps) {
  const allQ = CATALOG.flatMap(s => s.questions)
  const [selected, setSelected] = useState<Set<string>>(new Set(allQ))

  const toggle = (q: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(q)) next.delete(q)
      else next.add(q)
      return next
    })
  }

  return (
    <div>
      <p style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
        Выберите вопросы для включения в презентацию:
      </p>
      {CATALOG.map(section => (
        <div key={section.title} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--fg-2)', fontSize: 12, fontWeight: 600 }}>
            <Icon name={section.icon} size={13} />
            {section.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {section.questions.map(q => {
              const checked = selected.has(q)
              return (
                <button
                  key={q}
                  type="button"
                  className="btn"
                  style={{ justifyContent: 'flex-start', gap: 8, fontSize: 12, padding: '6px 10px', background: checked ? 'var(--accent-soft)' : undefined, borderColor: checked ? 'var(--accent-line)' : undefined }}
                  onClick={() => toggle(q)}
                >
                  <Icon name={checked ? 'square-check' : 'square'} size={14} />
                  {q}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn primary"
          onClick={() => onConfirm(Array.from(selected))}
          disabled={selected.size === 0}
        >
          <Icon name="slides" size={14} />
          Сгенерировать презентацию ({selected.size} вопросов)
        </button>
      </div>
    </div>
  )
}
