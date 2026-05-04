import { Icon } from './Icon.tsx'

export type DBStatus = 'ok' | 'syncing' | 'offline'

interface DBChipProps {
  name: string
  status?: DBStatus
}

const STATUS_COLORS: Record<DBStatus, string> = {
  ok: 'var(--green)',
  syncing: 'var(--amber)',
  offline: 'var(--fg-3)',
}

export function DBChip({ name, status = 'ok' }: DBChipProps) {
  return (
    <span className="chip" style={{ pointerEvents: 'none', padding: '3px 8px', fontSize: 10.5 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: STATUS_COLORS[status],
          display: 'inline-block',
        }}
      />
      <Icon name="dataset" size={11} color="var(--fg-2)" />
      {name}
    </span>
  )
}
