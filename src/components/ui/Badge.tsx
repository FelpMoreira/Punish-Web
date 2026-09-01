interface Props {
  variant: 'running' | 'waiting' | 'finished' | 'live' | 'next' | 'eliminated'
  children: React.ReactNode
}

const styles: Record<string, string> = {
  running: 'bg-cyan-bg text-cyan border-cyan/20',
  waiting: 'bg-yellow-bg text-yellow border-yellow/20',
  finished: 'bg-green-bg text-green border-green/20',
  live: 'bg-red-bg text-red border-red/25',
  next: 'bg-yellow-bg text-yellow border-yellow/20',
  eliminated: 'bg-red/8 text-red border-red/20',
}

export function Badge({ variant, children }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-sm border ${styles[variant]}`}>
      {variant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red" />}
      {children}
    </span>
  )
}
