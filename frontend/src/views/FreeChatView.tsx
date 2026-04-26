import { Icon } from '../components/Icon.tsx'

type Suggestion = string

interface FreeChatViewProps {
  onSuggestion: (text: string) => void
}

const SUGGESTIONS: Suggestion[] = [
  'Топ-10 направлений по расходам',
  'Динамика расходов по месяцам',
  'Средний чек по авиабилетам',
  'Кто летит чаще всего?',
  'Экономия за квартал',
]

export function FreeChatView({ onSuggestion }: FreeChatViewProps) {
  return (
    <div>
      <p style={{ color: 'var(--fg-2)', marginBottom: 8 }}>
        Готов отвечать на вопросы по данным. Начните с предложений ниже или задайте свой вопрос.
      </p>
      <div className="chips-row">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            className="chip"
            type="button"
            onClick={() => onSuggestion(s)}
          >
            <Icon name="spark" size={12} />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
