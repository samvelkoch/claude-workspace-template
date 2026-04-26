import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Icon } from '../components/Icon.tsx'

interface UploadViewProps {
  onFile: (file: File) => void
}

export function UploadView({ onFile }: UploadViewProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }, [onFile])

  return (
    <div>
      <p style={{ color: 'var(--fg-2)', marginBottom: 16 }}>
        Загрузите Excel-файл с данными о командировках, чтобы начать анализ.
      </p>
      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <div
          className={`upload-zone${dragging ? ' drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Icon name="doc" size={32} />
          <h3>Перетащите .xlsx файл сюда</h3>
          <p>или нажмите для выбора</p>
        </div>
      </label>
    </div>
  )
}
