interface FakeLineProps {
  title?: string
  labels?: string[]
  values?: number[]
  height?: number
}

const DEFAULT_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const DEFAULT_VALUES = [38, 52, 48, 65, 72, 60, 80, 75, 90, 85, 95, 102]

export function FakeLine({ title, labels = DEFAULT_LABELS, values = DEFAULT_VALUES, height = 120 }: FakeLineProps) {
  const max = Math.max(...values) * 1.1
  const min = Math.min(...values) * 0.9
  const range = max - min
  const paddingLeft = 36
  const paddingBottom = 22
  const paddingTop = 12
  const paddingRight = 8
  const chartH = height - paddingBottom - paddingTop
  const totalW = 480

  const chartW = totalW - paddingLeft - paddingRight
  const stepX = chartW / (labels.length - 1)

  const pts = values.map((v, i) => ({
    x: paddingLeft + i * stepX,
    y: paddingTop + chartH - ((v - min) / range) * chartH,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `${pts[0].x},${paddingTop + chartH}`,
    ...pts.map(p => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${paddingTop + chartH}`,
  ].join(' ')

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
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = paddingTop + (chartH / gridLines) * i
          const val = Math.round(max - (range / gridLines) * i * 0.9)
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={totalW - paddingRight} y2={y} stroke="var(--line)" strokeWidth="1" />
              {i < gridLines && (
                <text x={paddingLeft - 4} y={y + 4} textAnchor="end" fill="var(--fg-4)" fontSize="9" fontFamily="var(--font-mono)">
                  {val}
                </text>
              )}
            </g>
          )
        })}

        {/* Area fill */}
        <polygon points={area} fill="url(#area-grad)" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={paddingLeft + i * stepX}
            y={height - 6}
            textAnchor="middle"
            fill="var(--fg-4)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
