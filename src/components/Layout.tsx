import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, StickyNote, Target, LayoutDashboard, Zap } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Study Space', icon: BookOpen, color: 'from-purple to-cyan' },
  { to: '/notes', label: 'Notes', icon: StickyNote, color: 'from-purple to-pink' },
  { to: '/learning-outcomes', label: 'Learning Outcomes', icon: Target, color: 'from-cyan to-green' },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-amber to-pink' },
]

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <div className="text-center">
      <div className="text-lg font-mono font-bold text-lite tracking-wider">{time}</div>
      <div className="text-[10px] text-mute mt-0.5">{date}</div>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple/[0.03] blur-[100px] animate-float1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan/[0.03] blur-[120px] animate-float2" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-pink/[0.02] blur-[80px] animate-float1" />
      </div>

      {/* Sidebar */}
      <aside className="w-[240px] glass-strong flex flex-col shrink-0 h-full z-10 border-r border-white/[0.04]">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center shadow-lg shadow-purple/20">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-lite tracking-tight">StudySpace</h1>
              <p className="text-[10px] text-mute leading-none mt-0.5">Focus · Learn · Track</p>
            </div>
          </div>
        </div>

        {/* Clock */}
        <div className="px-5 pb-4">
          <div className="glass rounded-xl px-4 py-3">
            <LiveClock />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 mb-2 text-[9px] font-semibold text-mute uppercase tracking-[0.2em]">Navigation</p>
          {navItems.map(({ to, label, icon: Icon, color }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'text-white'
                    : 'text-mute hover:text-lite'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-15 rounded-xl`} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${color} shadow-lg shadow-purple/20`
                    : 'bg-surface group-hover:bg-edgelit'
                }`}>
                  <Icon size={15} className={isActive ? 'text-white' : ''} />
                </div>
                <span className="relative z-10">{label}</span>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white/50 animate-breathe" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Quick Stats Footer */}
        <div className="px-4 py-4 mt-auto">
          <div className="glass rounded-xl px-4 py-3 space-y-2">
            <p className="text-[9px] font-semibold text-mute uppercase tracking-[0.2em]">Session</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-dim">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[10px] text-green font-medium">Active</span>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-mute text-center mt-3">v1.0 · Cloudflare Edge</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full z-10 relative">
        <Outlet />
      </main>
    </div>
  )
}
