interface FakeBarsProps {
  title?: string
  labels?: string[]
  values?: number[]
  height?: number
}

const DEFAULT_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг']
const DEFAULT_VALUES = [42, 67, 55, 78, 91, 63, 84, 70]

export function FakeBars({ title, labels = DEFAULT_LABELS, values = DEFAULT_VALUES, height = 120 }: FakeBarsProps) {
  const max = Math.max(...values)
  const barWidth = 20
  const gap = 8
  const paddingLeft = 36
  const paddingBottom = 22
  const paddingTop = 12
  const chartH = height - paddingBottom - paddingTop
  const totalW = paddingLeft + labels.length * (barWidth + gap) - gap + 8
  const gridLines = 4

  return (
    <div className="plot">
      {title && (
        <div className="plot-head">
          <span className="plot-title">{title}</span>
          <span className="plot-meta">demo</span>
        </div>
      )}
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${height}`}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = paddingTop + (chartH / gridLines) * i
          const val = Math.round((max * (gridLines - i)) / gridLines)
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={totalW} y2={y} stroke="var(--line)" strokeWidth="1" />
              {i < gridLines && (
                <text x={paddingLeft - 4} y={y + 4} textAnchor="end" fill="var(--fg-4)" fontSize="9" fontFamily="var(--font-mono)">
                  {val}
                </text>
              )}
            </g>
          )
        })}

        {/* Bars */}
        {values.map((v, i) => {
          const barH = (v / max) * chartH
          const x = paddingLeft + i * (barWidth + gap)
          const y = paddingTop + chartH - barH
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="2"
                fill="var(--accent)"
                opacity="0.75"
              />
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                fill="var(--fg-4)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
