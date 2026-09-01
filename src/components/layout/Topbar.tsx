interface Props {
  breadcrumb?: { label: string; page?: string }[]
  title?: string
  actions?: React.ReactNode
  onNavigate?: (page: string) => void
}

export function Topbar({ breadcrumb, title, actions, onNavigate }: Props) {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-bg-el gap-3">
      <div className="flex items-center gap-1.5">
        {breadcrumb ? (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-soft">›</span>}
                {crumb.page ? (
                  <button
                    onClick={() => onNavigate?.(crumb.page!)}
                    className="hover:text-text transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span style={{ color: crumb.page ? undefined : 'var(--color-text)' }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : title ? (
          <span className="text-sm font-medium">{title}</span>
        ) : null}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
