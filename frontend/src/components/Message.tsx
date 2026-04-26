import type { ReactNode } from 'react'
import { Avatar } from './Avatar.tsx'

interface MessageProps {
  from: 'user' | 'assistant'
  stamp: string
  content: ReactNode
}

export function Message({ from, stamp, content }: MessageProps) {
  const name = from === 'assistant' ? 'Talk2Data' : 'Вы'
  return (
    <div className="msg">
      <Avatar type={from} />
      <div className="body">
        <div className="name">
          <strong>{name}</strong>
          <span className="stamp">{stamp}</span>
        </div>
        <div className="content">{content}</div>
      </div>
    </div>
  )
}
