import { Outlet, NavLink } from 'react-router-dom'
import { BookOpen, StickyNote, Target, LayoutDashboard, Sparkles } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Study Space', icon: BookOpen },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/learning-outcomes', label: 'Learning Outcomes', icon: Target },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-dark2 border-r border-edge flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-edge">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple/20 flex items-center justify-center">
              <Sparkles size={16} className="text-purple" />
            </div>
            <div>
              <h1 className="text-base font-bold text-lite tracking-tight">StudySpace</h1>
              <p className="text-[10px] text-mute leading-none mt-0.5">Personal study environment</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple/15 text-purple shadow-sm shadow-purple/5'
                    : 'text-dim hover:text-lite hover:bg-surface'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-edge">
          <p className="text-[10px] text-mute text-center">v1.0 — Built on Cloudflare</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full bg-dark">
        <Outlet />
      </main>
    </div>
  )
}
