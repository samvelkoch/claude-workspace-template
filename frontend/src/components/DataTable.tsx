interface Column {
  key: string
  label: string
  numeric?: boolean
}

interface DataTableProps {
  columns: Column[]
  rows: Record<string, string | number>[]
}

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <table className="md-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={col.numeric ? { textAlign: 'right' } : undefined}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.key} className={col.numeric ? 'num' : undefined}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
