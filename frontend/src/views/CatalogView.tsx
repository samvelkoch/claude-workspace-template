import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../components/Icon.tsx'
import type {
  CatalogPayload,
  CatalogCategory,
  CatalogQuestion,
  BRPeriod,
} from '../types/index.ts'

interface CatalogViewProps {
  onConfirm: (questionIds: string[], period: BRPeriod) => void
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PERIOD_PRESETS: BRPeriod[] = [
  { start: '2025-01-01', end: '2025-03-31', label: 'Q1 2025' },
  { start: '2025-04-01', end: '2025-06-30', label: 'Q2 2025' },
  { start: '2025-07-01', end: '2025-09-30', label: 'Q3 2025' },
  { start: '2025-10-01', end: '2025-12-31', label: 'Q4 2025' },
  { start: '2025-01-01', end: '2025-12-31', label: '2025 целиком' },
]

const DEFAULT_PERIOD_LABEL = 'Q3 2025'

export function CatalogView({ onConfirm }: CatalogViewProps) {
  const [data, setData] = useState<CatalogPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [period, setPeriod] = useState<BRPeriod>(
    PERIOD_PRESETS.find(p => p.label === DEFAULT_PERIOD_LABEL) ?? PERIOD_PRESETS[2],
  )
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`${API_BASE}/catalog/questions`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<CatalogPayload>
      })
      .then(d => {
        setData(d)
        // По дефолту выбираем рекомендованные категории (первые 4)
        setActiveCats(new Set(d.categories.slice(0, 4).map(c => c.id)))
      })
      .catch((e: unknown) => setLoadError(String(e)))
  }, [])

  const filteredQuestions = useMemo(() => {
    if (!data) return [] as CatalogQuestion[]
    if (activeCats.size === 0) return data.questions
    return data.questions.filter(q => activeCats.has(q.category))
  }, [data, activeCats])

  const grouped = useMemo(() => {
    if (!data) return [] as { cat: CatalogCategory; items: CatalogQuestion[] }[]
    const byCat: Record<string, CatalogQuestion[]> = {}
    for (const q of filteredQuestions) {
      ;(byCat[q.category] = byCat[q.category] ?? []).push(q)
    }
    const out: { cat: CatalogCategory; items: CatalogQuestion[] }[] = []
    for (const c of data.categories) {
      const items = byCat[c.id]
      if (items && items.length) out.push({ cat: c, items })
    }
    return out
  }, [data, filteredQuestions])

  const toggleCat = (id: string) => {
    setActiveCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleQ = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectCategoryAll = (_catId: string, items: CatalogQuestion[]) => {
    const ids = items.map(q => q.id)
    setSelected(prev => {
      const next = new Set(prev)
      const allSelected = ids.every(i => next.has(i))
      if (allSelected) {
        ids.forEach(i => next.delete(i))
      } else {
        ids.forEach(i => next.add(i))
      }
      return next
    })
  }

  if (loadError) {
    return <p style={{ color: 'var(--accent)' }}>Не удалось загрузить каталог: {loadError}</p>
  }
  if (!data) {
    return <p className="dim" style={{ fontSize: 12 }}>Загружаю каталог вопросов…</p>
  }

  const N = selected.size
  const eta = Math.max(5, N * 5)

  return (
    <div className="catalog-wizard">
      <p style={{ fontSize: 14, marginBottom: 6 }}>
        Соберу <strong>BR</strong> прямо из источника.
      </p>
      <p style={{ color: 'var(--fg-2)', fontSize: 13, marginBottom: 14 }}>
        Выберите темы — модель напишет запросы сама.
      </p>

      {/* Period chips */}
      <div className="catalog-row">
        <span className="catalog-label">Период</span>
        <div className="chips-row">
          {PERIOD_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              className={`chip${p.label === period.label ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="catalog-row">
        <span className="catalog-label">Категории</span>
        <div className="chips-row">
          {data.categories.map(c => {
            const active = activeCats.has(c.id)
            const count = data.questions.filter(q => q.category === c.id).length
            return (
              <button
                key={c.id}
                type="button"
                className={`chip${active ? ' active' : ''}`}
                onClick={() => toggleCat(c.id)}
                title={c.title}
              >
                <Icon name={c.icon} size={12} />
                {c.title}
                <span className="dim" style={{ fontSize: 10, marginLeft: 4 }}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Questions, grouped by category */}
      <div className="catalog-list">
        {grouped.length === 0 && (
          <p className="dim" style={{ fontSize: 12 }}>Нет вопросов. Выберите хотя бы одну категорию.</p>
        )}
        {grouped.map(g => {
          const all = g.items.length
          const sel = g.items.filter(q => selected.has(q.id)).length
          return (
            <div key={g.cat.id} className="catalog-group">
              <div className="catalog-group-head">
                <Icon name={g.cat.icon} size={13} color="var(--fg-2)" />
                <span className="catalog-group-title">{g.cat.title}</span>
                <span className="mono dim catalog-group-count">{sel} / {all}</span>
                <button
                  type="button"
                  className="btn ghost catalog-group-all"
                  onClick={() => selectCategoryAll(g.cat.id, g.items)}
                >
                  {sel === all ? 'снять' : 'все'}
                </button>
              </div>
              <div className="catalog-group-items">
                {g.items.map(q => {
                  const checked = selected.has(q.id)
                  return (
                    <label key={q.id} className={`catalog-question-row${checked ? ' checked' : ''}`}>
                      <Icon
                        name={checked ? 'square-check' : 'square'}
                        size={14}
                        color={checked ? 'var(--accent)' : 'var(--fg-3)'}
                      />
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQ(q.id)}
                        style={{ display: 'none' }}
                      />
                      <span className="catalog-q-title" onClick={() => toggleQ(q.id)}>
                        {q.title}
                      </span>
                      <span className="catalog-q-desc dim mono" onClick={() => toggleQ(q.id)}>
                        {q.desc}
                      </span>
                      <span className="catalog-q-chart mono dim">{q.chart}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom bar */}
      <div className="catalog-bottom-bar">
        <span className="dim" style={{ fontSize: 11.5 }}>
          {N === 0 ? 'Выберите хотя бы один вопрос' : `Выбрано ${N} · период ${period.label} · ~${eta} сек`}
        </span>
        <button
          type="button"
          className="btn primary"
          disabled={N === 0}
          onClick={() => onConfirm(Array.from(selected), period)}
        >
          <Icon name="bolt" size={12} color="#fff" />
          Собрать BR
        </button>
      </div>
    </div>
  )
}
