import { Icon } from '../components/Icon.tsx'
import { DBChip, type DBStatus } from '../components/DBChip.tsx'

interface SourcePickerViewProps {
  onPickDB: () => void
  onPickFile: () => void
  onPickTopic: (topic: string) => void
}

const DB_SOURCES: { name: string; status: DBStatus }[] = [
  { name: 'sm.transactions', status: 'ok' },
  { name: 'sm.clients', status: 'ok' },
  { name: 'sm.routes', status: 'ok' },
  { name: 'sm.invoices', status: 'syncing' },
]

const TOPICS: { t: string; s: string }[] = [
  { t: 'Топ-направления по объёму', s: 'avia + rail · 2026' },
  { t: 'Динамика расходов мес/мес', s: 'все клиенты' },
  { t: 'Аномалии в платежах', s: 'last 30d · alerts' },
  { t: 'Сравнение клиентов по SM', s: 'top-20 ARR' },
  { t: 'Воронка возвратов', s: 'returns · refunds' },
  { t: 'Pricing — отклонения от тарифа', s: 'flagged · 412' },
]

export function SourcePickerView({ onPickDB, onPickFile, onPickTopic }: SourcePickerViewProps) {
  return (
    <div>
      <p>
        Здравствуйте. Я аналитический ассистент по SM-отчёту и данным из SM. Могу отвечать на вопросы напрямую — без загрузки файлов.
      </p>

      {/* DB sources status */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, marginBottom: 14 }}>
        {DB_SOURCES.map(s => (
          <DBChip key={s.name} name={s.name} status={s.status} />
        ))}
      </div>

      {/* Two source cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={onPickDB}
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-line)',
            borderRadius: 6,
            padding: '14px 14px 12px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--fg)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: 4,
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="dataset" size={14} color="#fff" />
            </div>
            <span
              className="mono"
              style={{
                fontSize: 9, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              SM Live
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Спросить базу SM</div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.45 }}>
            Я напишу SQL, схожу в источник и верну таблицу + график.
          </div>
        </button>

        <button
          type="button"
          onClick={onPickFile}
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '14px 14px 12px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--fg)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: 4,
                background: 'var(--bg-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="paperclip" size={14} color="var(--fg-2)" />
            </div>
            <span
              className="mono"
              style={{
                fontSize: 9, color: 'var(--fg-3)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              Excel / CSV
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Загрузить свой файл</div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.45 }}>
            Если данные не в SM — присоедините xlsx/csv.
          </div>
        </button>
      </div>

      {/* Topic catalog */}
      <div
        style={{
          fontSize: 11, color: 'var(--fg-3)',
          marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >
        Каталог · ad-hoc темы по SM
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {TOPICS.map(t => (
          <button
            key={t.t}
            type="button"
            className="chip"
            onClick={() => onPickTopic(t.t)}
            style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '8px 10px' }}
          >
            <Icon name="sparkle" size={11} color="var(--accent)" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 11.5, color: 'var(--fg)' }}>{t.t}</span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)' }}>{t.s}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="dim" style={{ fontSize: 11.5, marginTop: 12, marginBottom: 0 }}>
        Или просто задайте вопрос — я разберусь, в какую таблицу идти.
      </p>
    </div>
  )
}
