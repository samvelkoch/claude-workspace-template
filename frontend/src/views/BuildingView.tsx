import { useEffect, useState } from 'react'

interface BuildingViewProps {
  totalQuestions: number
  periodLabel: string
}

export function BuildingView({ totalQuestions, periodLabel }: BuildingViewProps) {
  // Cosmetic progress: server doesn't stream progress, so we tick up
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => Math.min(t + 1, Math.max(1, totalQuestions - 1)))
    }, 1500)
    return () => clearInterval(id)
  }, [totalQuestions])

  const progress = Math.min(100, Math.round((tick / Math.max(1, totalQuestions)) * 100))

  return (
    <div className="building-view">
      <div className="building-card">
        <p className="mono" style={{
          fontSize: 11,
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          Сборка Business Review · {periodLabel}
        </p>
        <p style={{ fontSize: 14, marginBottom: 14 }}>
          Выполняю запросы · {tick} / {totalQuestions}
        </p>
        <div className="interview-progress" style={{ marginBottom: 10 }}>
          <div className="interview-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="dim" style={{ fontSize: 11.5 }}>
          Подключение к SM, рендер таблиц и графиков, генерация Executive Summary.
        </p>
      </div>
    </div>
  )
}
