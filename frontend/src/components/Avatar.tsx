interface AvatarProps {
  type: 'assistant' | 'user'
}

export function Avatar({ type }: AvatarProps) {
  if (type === 'assistant') {
    return (
      <div className="avatar assistant">
        <svg viewBox="0 0 100 100" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M63.23,80.25L52.26,58.71l-7.89,8.44l15.54,30.48h9.03L80.91,61.3L70.6,57.91L63.23,80.25z"/>
          <path d="M39.03,19.42L2.69,31.39v9.03l30.48,15.54l8.44-7.89L20.08,37.1l22.34-7.36L39.03,19.42z"/>
          <path d="M84.47,15.87L72.66,51.68l10.31,3.4L97.85,9.9l-7.41-7.41L45.26,17.37l3.4,10.31L84.47,15.87L84.47,15.87z"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="avatar user">
      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-ui)' }}>Я</span>
    </div>
  )
}
