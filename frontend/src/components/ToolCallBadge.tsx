import { Icon } from './Icon.tsx'

interface ToolCallBadgeProps {
  tool: string
  durationSec?: number
  rowsIn?: number
  rowsOut?: number
}

export function ToolCallBadge({ tool, durationSec, rowsIn, rowsOut }: ToolCallBadgeProps) {
  return (
    <div className="tool-badge">
      <Icon name="bolt" size={12} />
      <span>tool:</span>
      <span className="tool-name">{tool}</span>
      {durationSec !== undefined && (
        <span className="tool-time">· {durationSec.toFixed(1)}с</span>
      )}
      {rowsIn !== undefined && rowsOut !== undefined && (
        <span className="tool-rows">· {rowsIn.toLocaleString('ru')}→{rowsOut.toLocaleString('ru')} строк</span>
      )}
    </div>
  )
}
