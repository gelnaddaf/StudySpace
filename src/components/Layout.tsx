import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Headphones, StickyNote, Target, BarChart3, Sparkles } from 'lucide-react'

const nav = [
  { to: '/', label: 'Study', icon: Headphones },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/learning-outcomes', label: 'Outcomes', icon: Target },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
]

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  return (
    <div className="px-4 py-3">
      <div className="text-[22px] font-mono font-bold text-lite tracking-widest leading-none">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-[10px] text-mute mt-1 font-medium">
        {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark">
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple/[0.035] blur-[120px] anim-float1" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo/[0.03] blur-[100px] anim-float2" />
      </div>

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 h-full z-10 flex flex-col bg-dark2/80 border-r border-white/[0.03]">
        {/* Brand */}
        <div className="px-5 pt-5 pb-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple via-indigo to-cyan flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-lite tracking-tight">StudySpace</span>
        </div>

        {/* Clock */}
        <Clock />

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.04] mb-2" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} end={to === '/'} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-purple/[0.12] text-purplehi'
                  : 'text-mute hover:text-dim hover:bg-white/[0.03]'
              }`}>
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] text-mute font-medium">Online · v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-full z-10 relative">
        <Outlet />
      </main>
    </div>
  )
}
