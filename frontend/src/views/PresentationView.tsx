import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'
import type { FileInfo } from '../types/index.ts'

interface PresentationViewProps {
  fileInfo: FileInfo | null
  template: string
  period?: string
}

const SLIDE_COUNT = 8

const TEMPLATE_LABELS: Record<string, string> = {
  executive: 'EXECUTIVE SUMMARY',
  operational: 'OPERATIONAL REVIEW',
  client: 'CLIENT PRESENTATION',
}

export function PresentationView({ fileInfo, template, period = 'Q3 2026' }: PresentationViewProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [copied, setCopied] = useState(false)

  const templateLabel = TEMPLATE_LABELS[template] ?? 'BUSINESS REVIEW'

  const handleCopy = () => {
    void navigator.clipboard.writeText(`${templateLabel} · ${period}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="pres-card">
      {/* Hero */}
      <div className="pres-hero">
        <div className="pres-eyebrow">
          {templateLabel} · {period}
        </div>
        <p className="pres-title">
          Travel-расходы выросли на 14%, экономия 3.2M ₽
        </p>
        <div className="pres-kpis">
          <div className="pres-kpi">
            <span className="pres-kpi-val">184.2M ₽</span>
            <span className="pres-kpi-label">Объём</span>
          </div>
          <div className="pres-kpi">
            <span className="pres-kpi-val up">+14.1%</span>
            <span className="pres-kpi-label">vs Q2</span>
          </div>
          <div className="pres-kpi">
            <span className="pres-kpi-val">
              {fileInfo?.rowCount.toLocaleString('ru') ?? '34 218'}
            </span>
            <span className="pres-kpi-label">Транзакций</span>
          </div>
        </div>
      </div>

      {/* Slide strip */}
      <div className="pres-slides">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <div
            key={i}
            className={`slide-thumb${activeSlide === i ? ' active' : ''}`}
            onClick={() => setActiveSlide(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveSlide(i)}
            aria-label={`Слайд ${i + 1}`}
          >
            {String(i + 1).padStart(2, '0')}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pres-actions">
        <span className="pres-file">
          {fileInfo?.fileName ?? 'report.xlsx'}
        </span>
        <div className="pres-btns">
          <button type="button" className="btn" onClick={handleCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <button type="button" className="btn primary">
            <Icon name="external" size={14} />
            Открыть →
          </button>
        </div>
      </div>
    </div>
  )
}
