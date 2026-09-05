import { LayoutDashboard, Trophy, PlusCircle, Users, UserRound, LogOut } from 'lucide-react'

interface Props {
  active: string
  onNavigate: (page: string) => void
  onLogout?: () => void
}

const links = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'tournament-list', label: 'Torneios', icon: Trophy },
  { id: 'create', label: 'Criar', icon: PlusCircle },
  { id: 'players', label: 'Jogadores', icon: Users },
  { id: 'profile', label: 'Perfil', icon: UserRound },
]

export function MobileNav({ active, onNavigate, onLogout }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-el border-t border-border">
      <div className="flex items-stretch">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] transition-colors cursor-pointer ${
                active === link.id ? 'text-purple' : 'text-muted hover:text-text'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </button>
          )
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] text-muted hover:text-red transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        )}
      </div>
    </nav>
  )
}