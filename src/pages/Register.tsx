import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { api } from '../services/api'

interface Props {
  onNavigate: (page: string) => void
}

export function Register({ onNavigate }: Props) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !email.trim() || !password) { setError('Preencha todos os campos'); return }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return }
    setLoading(true)
    setError('')
    try {
      await api.auth.register(nickname.trim(), email.trim(), password)
      setSuccess('Conta criada! Faça login para continuar.')
    } catch (err: any) {
      setError(err?.message?.replace(/^.*?"error"/, '').replace(/".*$/, '') || 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[340px]">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-7 h-7 bg-purple rounded-sm flex items-center justify-center text-[11px] font-bold text-white">PT</div>
          <span className="text-sm font-semibold tracking-wider uppercase">Punish</span>
        </div>
        <div className="bg-bg-el border border-border rounded-md p-5">
          <div className="text-sm font-semibold mb-4">Create account</div>
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">Nickname</label>
              <Input placeholder="Your nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            {success && <div className="text-xs text-green-500">{success}</div>}
            <Button type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Criando...' : 'Create account'}
            </Button>
            <div className="text-center text-xs text-muted mt-1">
              Already registered?{' '}
              <button onClick={() => onNavigate('login')} className="text-purple hover:underline cursor-pointer">
                Log in
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-4">
          <button onClick={() => onNavigate('home')} className="text-xs text-muted hover:text-text cursor-pointer">
            ← Back to homepage
          </button>
        </div>
      </div>
    </div>
  )
}
