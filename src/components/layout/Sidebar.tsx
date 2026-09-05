import { LayoutDashboard, Trophy, Users, PlusCircle, Settings2, LogOut, UserRound, ShieldCheck } from 'lucide-react'
import { storage } from '../../services/api'

interface Props {
  active: string
  onNavigate: (page: string) => void
  onLogout?: () => void
}

export function Sidebar({ active, onNavigate, onLogout }: Props) {
  const isAdmin = storage.user?.role === 'ADMIN'
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tournament-list', label: 'My Tournaments', icon: Trophy },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'settings', label: 'Settings', icon: Settings2 },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]
  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 bg-bg-el border-r border-border flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 bg-purple rounded-sm flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          PT
        </div>
        <div>
          <div className="text-[13px] font-semibold tracking-wider uppercase">Punish</div>
          <div className="text-[11px] text-soft">Tournament Ops</div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-sm transition-colors border-l-2 border-transparent text-left ${
                active === link.id
                  ? 'bg-purple-bg text-text border-l-purple'
                  : 'text-muted hover:bg-bg-hover hover:text-text'
              }`}
            >
              <Icon size={15} />
              {link.label}
            </button>
          )
        })}
      </nav>

      <div className="px-3.5 py-3 border-t border-border">
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-sm text-muted hover:bg-bg-hover hover:text-text w-full text-left transition-colors mb-3 cursor-pointer"
          >
            <LogOut size={15} />
            Log out
          </button>
        )}
        <div className="text-[11px] text-soft leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green mr-1.5 align-middle" />
          12 stations online
          <br />
          <span className="text-[10px] pl-[11px]">Queue updated 14s ago</span>
        </div>
      </div>
    </aside>
  )
}
