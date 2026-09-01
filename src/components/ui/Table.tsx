interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props<T> {
  columns: Column<T>[]
  data: T[]
}

export function Table<T>({ columns, data }: Props<T>) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-bg-el">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3.5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-soft border-b border-border whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="bg-bg even:bg-white/[0.012] hover:bg-bg-el transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-3.5 py-2.5 text-sm border-b border-border last:border-b-0 align-middle ${col.className || ''}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
