import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'

interface InterviewViewProps {
  onComplete: (answers: Record<string, string>) => void
}

interface Question {
  id: string
  text: string
  options?: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 'period',
    text: 'Какой период охватывает данный обзор?',
    options: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Весь 2025', 'Весь 2026'],
  },
  {
    id: 'audience',
    text: 'Для кого готовится презентация?',
    options: ['Топ-менеджмент', 'Финансовый отдел', 'HR', 'Клиент', 'Внутренняя команда'],
  },
  {
    id: 'focus',
    text: 'На что сделать акцент?',
    options: ['Расходы и экономия', 'Комплаенс', 'Тренды и прогноз', 'Сравнение с бенчмарком'],
  },
]

export function InterviewView({ onComplete }: InterviewViewProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = QUESTIONS[step]
  const progress = ((step) / QUESTIONS.length) * 100

  const pick = (value: string) => {
    const next = { ...answers, [current.id]: value }
    setAnswers(next)
    if (step + 1 < QUESTIONS.length) {
      setStep(s => s + 1)
    } else {
      onComplete(next)
    }
  }

  return (
    <div>
      <div className="interview-progress">
        <div className="interview-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ color: 'var(--fg-3)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
        Шаг {step + 1} из {QUESTIONS.length}
      </p>
      <p style={{ color: 'var(--fg)', marginBottom: 12, fontWeight: 500 }}>
        {current.text}
      </p>
      <div className="chips-row">
        {current.options?.map(opt => (
          <button
            key={opt}
            className="chip"
            type="button"
            onClick={() => pick(opt)}
          >
            <Icon name="chevron-right" size={12} />
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
