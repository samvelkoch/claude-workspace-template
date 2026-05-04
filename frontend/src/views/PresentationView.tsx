import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'
import { MessageContent } from '../components/MessageContent.tsx'

interface PresentationViewProps {
  markdown: string
  periodLabel: string
  onClose?: () => void
}

export function PresentationView({ markdown, periodLabel, onClose }: PresentationViewProps) {
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    void navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="presentation-doc">
      <div className="presentation-toolbar">
        <span className="mono dim" style={{ fontSize: 11 }}>BR · {periodLabel}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn" onClick={handleCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Скопировано' : 'Копировать markdown'}
          </button>
          <button type="button" className="btn" onClick={handlePrint}>
            <Icon name="download" size={13} />
            Печать
          </button>
          {onClose && (
            <button type="button" className="btn ghost" onClick={onClose}>
              <Icon name="x" size={13} />
              Закрыть
            </button>
          )}
        </div>
      </div>
      <div className="presentation-body">
        <MessageContent text={markdown} />
      </div>
    </div>
  )
}
