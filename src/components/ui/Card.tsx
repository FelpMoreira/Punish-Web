interface CardProps {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <div className={`bg-bg-el border border-border rounded-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-2.5">
          {title && <span className="text-sm font-semibold">{title}</span>}
          {action}
        </div>
      )}
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
