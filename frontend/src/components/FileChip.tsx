interface FileChipProps {
  fileName: string
  rowCount?: number
  columnCount?: number
}

export function FileChip({ fileName, rowCount, columnCount }: FileChipProps) {
  return (
    <div className="file-chip">
      <div className="icon">XLS</div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 13 }}>{fileName}</div>
        {(rowCount !== undefined || columnCount !== undefined) && (
          <div className="meta">
            {rowCount !== undefined && `${rowCount.toLocaleString('ru')} строк`}
            {rowCount !== undefined && columnCount !== undefined && ' · '}
            {columnCount !== undefined && `${columnCount} колонок`}
          </div>
        )}
      </div>
    </div>
  )
}
