import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'
import type { InterviewAnswers } from '../types/index.ts'

interface InterviewViewProps {
  onComplete: (answers: InterviewAnswers) => void
}

type StepKind = 'single' | 'multi' | 'text'

interface Step {
  id: keyof InterviewAnswers
  question: string
  hint?: string
  kind: StepKind
  options?: string[]
  optional?: boolean
}

const STEPS: Step[] = [
  {
    id: 'audience',
    question: 'Кто будет смотреть BR?',
    hint: 'Под аудиторию подстроится Executive Summary.',
    kind: 'single',
    options: ['CFO', 'COO', 'Travel-менеджеры', 'Клиент', 'Совет директоров'],
  },
  {
    id: 'focus',
    question: 'Главные акценты',
    hint: 'Можно выбрать несколько.',
    kind: 'multi',
    options: ['Финансы', 'Операционка', 'Compliance', 'Аномалии'],
  },
  {
    id: 'detail_level',
    question: 'Уровень детализации',
    kind: 'single',
    options: ['Высокий обзор', 'Стандарт', 'Детальный'],
  },
  {
    id: 'comparison',
    question: 'База сравнения',
    kind: 'single',
    options: ['Прошлый квартал', 'Прошлый год', 'Без сравнения'],
  },
  {
    id: 'segmentation',
    question: 'Сегментация',
    hint: 'Можно выбрать несколько или ничего.',
    kind: 'multi',
    options: ['По компаниям', 'По филиалам', 'По департаментам', 'Без сегментации'],
    optional: true,
  },
  {
    id: 'must_include',
    question: 'Что обязательно включить?',
    hint: 'Свободный текст — например «штрафы и возвраты», «динамика по неделям». Можно пропустить.',
    kind: 'text',
    optional: true,
  },
  {
    id: 'must_skip',
    question: 'Что НЕ показывать?',
    hint: 'Чувствительные данные, ненужные срезы. Можно пропустить.',
    kind: 'text',
    optional: true,
  },
]

const EMPTY: InterviewAnswers = {
  audience: '',
  focus: [],
  detail_level: '',
  comparison: '',
  segmentation: [],
  must_include: '',
  must_skip: '',
}

export function InterviewView({ onComplete }: InterviewViewProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<InterviewAnswers>(EMPTY)
  const [textValue, setTextValue] = useState('')

  const cur = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step) / STEPS.length) * 100

  const setSingle = (val: string) => {
    setAnswers(a => ({ ...a, [cur.id]: val } as InterviewAnswers))
  }

  const toggleMulti = (val: string) => {
    setAnswers(a => {
      const list = (a[cur.id] as string[]) ?? []
      const has = list.includes(val)
      const next = has ? list.filter(x => x !== val) : [...list, val]
      return { ...a, [cur.id]: next } as InterviewAnswers
    })
  }

  const isStepDone = (): boolean => {
    if (cur.optional) return true
    if (cur.kind === 'single') return Boolean(answers[cur.id])
    if (cur.kind === 'multi') return ((answers[cur.id] as string[]) ?? []).length > 0
    return true
  }

  const next = () => {
    let updated = answers
    if (cur.kind === 'text') {
      updated = { ...answers, [cur.id]: textValue }
      setAnswers(updated)
      setTextValue('')
    }
    if (isLast) {
      onComplete(updated)
    } else {
      setStep(s => s + 1)
    }
  }

  const back = () => {
    if (step === 0) return
    if (cur.kind === 'text') setTextValue('')
    setStep(s => s - 1)
  }

  return (
    <div>
      <div className="interview-progress">
        <div className="interview-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ color: 'var(--fg-3)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
        Шаг {step + 1} из {STEPS.length}
      </p>

      <div className="interview-step">
        <p style={{ color: 'var(--fg)', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
          {cur.question}
        </p>
        {cur.hint && (
          <p className="dim" style={{ fontSize: 12, marginBottom: 12 }}>{cur.hint}</p>
        )}

        {cur.kind === 'single' && (
          <div className="chips-row">
            {cur.options?.map(opt => {
              const active = answers[cur.id] === opt
              return (
                <button
                  key={opt}
                  type="button"
                  className={`chip${active ? ' active' : ''}`}
                  onClick={() => setSingle(opt)}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {cur.kind === 'multi' && (
          <div className="chips-row">
            {cur.options?.map(opt => {
              const list = (answers[cur.id] as string[]) ?? []
              const active = list.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  className={`chip${active ? ' active' : ''}`}
                  onClick={() => toggleMulti(opt)}
                >
                  <Icon name={active ? 'square-check' : 'square'} size={12} />
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {cur.kind === 'text' && (
          <textarea
            className="interview-textarea"
            placeholder="Введите ответ или нажмите «Дальше»…"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            rows={3}
          />
        )}
      </div>

      <div className="interview-actions">
        <button
          type="button"
          className="btn ghost"
          onClick={back}
          disabled={step === 0}
        >
          <Icon name="chevron-left" size={12} /> Назад
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={next}
          disabled={!isStepDone()}
        >
          {isLast ? 'Готово, собираем BR' : 'Дальше'}
          <Icon name="chevron-right" size={12} color="#fff" />
        </button>
      </div>
    </div>
  )
}
