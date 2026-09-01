interface Props extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  multiline?: boolean
  select?: boolean
}

export function Input({ multiline, select, className = '', ...props }: Props) {
  const base = 'bg-bg-surf border border-border-md text-text rounded-sm px-2.5 py-1.5 text-sm outline-none w-full placeholder:text-soft focus:border-purple focus:shadow-[0_0_0_2px_rgba(139,92,246,0.1)]'
  if (multiline) {
    return <textarea className={`${base} resize-y ${className}`} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
  }
  if (select) {
    return <select className={`${base} cursor-pointer ${className}`} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)} />
  }
  return <input className={`${base} ${className}`} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
}
