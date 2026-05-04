import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ComponentPropsWithoutRef } from 'react'

interface MessageContentProps {
  text: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Rewrite legacy localhost:8000 URLs (T2D_PUBLIC_URL default) to current API base.
function rewriteUrl(url: string): string {
  return url.replace(/^https?:\/\/localhost:8000/, API_BASE)
}

function isChartUrl(url: string): boolean {
  return /\/charts\/[a-f0-9-]+\.(html|png)$/i.test(url)
}

export function MessageContent({ text }: MessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Tables
        table: (props) => <table className="md-table" {...props} />,
        // Numeric cells right-aligned (heuristic: cells matching a number)
        td: ({ children, ...rest }: ComponentPropsWithoutRef<'td'>) => {
          const txt = String(children ?? '').trim()
          const isNumeric = /^[-+]?\d[\d\s.,]*\s*[%₽$]?$/.test(txt)
          return (
            <td className={isNumeric ? 'num' : undefined} {...rest}>
              {children}
            </td>
          )
        },
        // Inline code
        code: (props) => <code className="md-code" {...props} />,
        // Links — embed Plotly chart inline; otherwise normal link
        a: ({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) => {
          const url = href ? rewriteUrl(href) : ''
          if (url && isChartUrl(url)) {
            return (
              <span className="chart-embed">
                <iframe src={url} title="Plotly chart" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-embed-link"
                >
                  ↗ открыть график в новой вкладке
                </a>
              </span>
            )
          }
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          )
        },
        // Paragraphs — match existing message style (no extra margin on last)
        p: (props) => <p {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  )
}
