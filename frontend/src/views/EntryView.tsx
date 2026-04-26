import { Icon } from '../components/Icon.tsx'

type Scenario = 'free_chat' | 'template' | 'preview'

interface EntryViewProps {
  onPick: (scenario: Scenario) => void
}

const SCENARIOS: { id: Scenario; icon: Parameters<typeof Icon>[0]['name']; title: string; sub: string; primary?: boolean }[] = [
  {
    id: 'free_chat',
    icon: 'bolt',
    title: 'Спросить данные',
    sub: 'Talk2Data — задайте любой вопрос по загруженному файлу',
    primary: true,
  },
  {
    id: 'template',
    icon: 'briefcase',
    title: 'Собрать Business Review',
    sub: 'Выберите шаблон и сгенерируйте презентацию за 60 секунд',
  },
  {
    id: 'preview',
    icon: 'eye',
    title: 'Просто посмотреть',
    sub: 'Быстрый обзор файла: структура, ключевые метрики, аномалии',
  },
]

export function EntryView({ onPick }: EntryViewProps) {
  return (
    <div>
      <p style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
        Файл загружен. Что хотите сделать?
      </p>
      <div className="scenario-cards">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            className={`scenario-card${s.primary ? ' primary' : ''}`}
            type="button"
            onClick={() => onPick(s.id)}
          >
            <div className="sc-icon">
              <Icon name={s.icon} size={18} />
            </div>
            <div className="sc-body">
              <div className="sc-title">{s.title}</div>
              <div className="sc-sub">{s.sub}</div>
            </div>
            <Icon name="chevron-right" size={16} />
          </button>
        ))}
      </div>
    </div>
  )
}
