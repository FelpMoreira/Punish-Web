import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  componentStack: string
  copied: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: '', copied: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ componentStack: info.componentStack ?? '' })
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null, componentStack: '', copied: false })
  }

  copy = (): void => {
    const { error, componentStack } = this.state
    navigator.clipboard
      .writeText([error?.stack ?? error?.message ?? '', componentStack].filter(Boolean).join('\n\n'))
      .then(() => {
        this.setState({ copied: true })
        setTimeout(() => this.setState({ copied: false }), 2000)
      })
      .catch(() => {})
  }

  componentDidMount(): void {
    window.addEventListener('hashchange', this.reset)
  }

  componentWillUnmount(): void {
    window.removeEventListener('hashchange', this.reset)
  }

  render(): ReactNode {
    const { error, componentStack, copied } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-screen items-center justify-center bg-bg p-4">
        <div className="w-full max-w-2xl rounded-lg border border-border bg-bg-el p-6 shadow-xl">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red" />
            <h1 className="text-lg font-semibold text-text">Algo quebrou</h1>
          </div>
          <p className="mb-4 text-sm text-muted">
            A tela falhou ao renderizar. Esse erro não é esperado — recarregue e, se voltar a
            acontecer, copie o detalhe abaixo.
          </p>

          <div className="mb-4 rounded-md border border-border bg-bg p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-soft">
              {error.name}
            </div>
            <div className="break-words text-sm text-red">{error.message}</div>
          </div>

          {componentStack && (
            <details className="mb-4">
              <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-soft">
                Stack trace
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-bg p-3 text-[11px] leading-relaxed text-muted">
                {componentStack}
              </pre>
            </details>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={this.copy}
              className="cursor-pointer rounded-sm border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-md hover:text-text"
            >
              {copied ? 'Copiado!' : 'Copiar erro'}
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="cursor-pointer rounded-sm border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-md hover:text-text"
            >
              Tentar de novo
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-sm bg-purple px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-dk"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    )
  }
}
