import type { ReactNode } from 'react'
import type { IconName } from '../types/index.ts'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
}

type SvgProps = { stroke: string; fill: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round' }

const ICONS: Record<IconName, (p: SvgProps) => ReactNode> = {
  'paperclip': () => <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
  'arrow-up': () => <path d="M12 19V5M5 12l7-7 7 7" />,
  'bolt': () => <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  'sparkle': () => <path d="M12 3l1.88 5.12L19 10l-5.12 1.88L12 17l-1.88-5.12L5 10l5.12-1.88L12 3zM5 3l.94 2.56L8.5 6.5l-2.56.94L5 10l-.94-2.56L1.5 6.5l2.56-.94L5 3z" />,
  'doc': () => <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  'spark': () => <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
  'eye': () => <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  'briefcase': () => <path d="M22 7H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />,
  'check': () => <path d="M20 6L9 17l-5-5" />,
  'chevron-right': () => <path d="M9 18l6-6-6-6" />,
  'chevron-down': () => <path d="M6 9l6 6 6-6" />,
  'chevron-left': () => <path d="M15 18l-6-6 6-6" />,
  'search': () => <path d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35" />,
  'external': () => <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />,
  'copy': () => <path d="M20 9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
  'download': () => <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  'slides': () => <path d="M22 3H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 21h8M12 17v4" />,
  'x': () => <path d="M18 6L6 18M6 6l12 12" />,
  'users': () => <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  'gauge': () => <path d="M12 2a10 10 0 0 1 10 10M12 2A10 10 0 0 0 2 12M19.07 19.07A10 10 0 0 0 12 22M4.93 19.07A10 10 0 0 1 12 22M12 12l4.24-4.24M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />,
  'flag': () => <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />,
  'square': () => <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />,
  'square-check': () => <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  'list': () => <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  'chart': () => <path d="M18 20V10M12 20V4M6 20v-6" />,
  'plus': () => <path d="M12 5v14M5 12h14" />,
  'folder': () => <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
  'folder-open': () => (
    <>
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1H3V7z" />
      <path d="M3 9h18l-2.2 8.4a2 2 0 01-1.94 1.6H5.14a2 2 0 01-1.94-1.6L3 9z" />
    </>
  ),
  'clock': () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </>
  ),
  'message': () => <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  'pin': () => <path d="M12 2l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 9l6-1 3-6z" />,
  'more': ({ fill }: SvgProps) => (
    <>
      <circle cx="5" cy="12" r="1.5" fill={fill} stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill={fill} stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill={fill} stroke="none" />
    </>
  ),
}

export function Icon({ name, size = 16, color = 'currentColor', className }: IconProps) {
  const svgProps: SvgProps = {
    stroke: color,
    fill: 'none',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {ICONS[name](svgProps)}
    </svg>
  )
}
