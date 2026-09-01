import { type LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-purple text-white border-purple hover:bg-purple-dk hover:border-purple-dk',
  secondary: 'bg-bg-surf text-text border-border-md hover:bg-bg-hover',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-bg-surf hover:text-text',
  danger: 'bg-red-bg text-red border-red/25 hover:bg-red/18',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium rounded border transition-colors whitespace-nowrap cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 14} />}
      {children}
    </button>
  )
}
