import { useState, useMemo } from 'react'
import { Clock, Play, Pause, RotateCcw, Palette } from 'lucide-react'
import AmbiancePlayer from '../components/AmbiancePlayer'
import { useAmbiance, useNotes, useLearningOutcomes } from '../store/useStore'

const THEMES = [
  { id: 'midnight', name: 'Midnight', gradient: 'from-[#0a0a18] via-[#0e0e20] to-[#12101f]', orb1: 'bg-purple/[0.06]', orb2: 'bg-indigo-500/[0.04]' },
  { id: 'warm', name: 'Warm Glow', gradient: 'from-[#140e04] via-[#1a1008] to-[#0f0a04]', orb1: 'bg-amber/[0.06]', orb2: 'bg-orange-500/[0.04]' },
  { id: 'forest', name: 'Forest', gradient: 'from-[#040e08] via-[#0a120a] to-[#061008]', orb1: 'bg-green/[0.06]', orb2: 'bg-emerald-500/[0.04]' },
  { id: 'ocean', name: 'Deep Ocean', gradient: 'from-[#040810] via-[#0a0f1a] to-[#060c18]', orb1: 'bg-cyan/[0.06]', orb2: 'bg-blue-500/[0.04]' },
]

export default function StudySpace() {
  const { sounds, setVolume, toggleSound, stopAll } = useAmbiance()
  const { notes } = useNotes()
  const { outcomes } = useLearningOutcomes()
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerInterval, setTimerIntervalState] = useState<ReturnType<typeof setInterval> | null>(null)

  const activeSounds = sounds.filter(s => s.isPlaying).length
  const totalMinutes = minutes
  const progress = timerRunning ? ((totalMinutes * 60 - (minutes * 60 + seconds)) / (totalMinutes * 60)) * 100 : 0

  const coveragePercent = useMemo(() => {
    if (outcomes.length === 0) return 0
    const covered = outcomes.filter(lo => notes.filter(n => n.linkedLOs.includes(lo.id)).length >= 2).length
    return Math.round((covered / outcomes.length) * 100)
  }, [notes, outcomes])

  const startTimer = () => {
    if (timerRunning) {
      if (timerInterval) clearInterval(timerInterval)
      setTimerRunning(false)
      setTimerIntervalState(null)
      return
    }
    setTimerRunning(true)
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          setMinutes(m => {
            if (m === 0) { clearInterval(interval); setTimerRunning(false); setTimerIntervalState(null); return 0 }
            return m - 1
          })
          return 59
        }
        return prev - 1
      })
    }, 1000)
    setTimerIntervalState(interval)
  }

  const resetTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    setTimerRunning(false); setTimerIntervalState(null); setMinutes(25); setSeconds(0)
  }

  return (
    <div className={`h-full bg-gradient-to-br ${activeTheme.gradient} overflow-y-auto relative`}>
      {/* Theme-specific animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full ${activeTheme.orb1} blur-[100px] animate-float1`} />
        <div className={`absolute bottom-[10%] right-[15%] w-[350px] h-[350px] rounded-full ${activeTheme.orb2} blur-[80px] animate-float2`} />
      </div>

      <div className="relative z-10 p-6 h-full flex flex-col gap-5">
        {/* Top row: Timer + Quick Stats */}
        <div className="flex gap-5 flex-1 min-h-0">
          {/* Timer — large, central, dominant */}
          <div className="flex-1 glass rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Timer ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="2" />
              {timerRunning && (
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#timerGrad)" strokeWidth="2.5"
                  strokeLinecap="round" strokeDasharray={`${progress * 5.34} ${534 - progress * 5.34}`}
                  transform="rotate(-90 100 100)" className="transition-all duration-1000" />
              )}
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10 text-center space-y-4">
              <p className="text-[10px] font-semibold text-mute uppercase tracking-[0.25em]">
                <Clock size={12} className="inline mr-1.5 -mt-0.5" />Focus Timer
              </p>
              <div className="text-7xl font-mono font-bold tracking-wider select-none">
                <span className="bg-gradient-to-b from-lite to-dim bg-clip-text text-transparent">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className={`text-purple ${timerRunning ? 'animate-pulse' : ''}`}>:</span>
                <span className="bg-gradient-to-b from-lite to-dim bg-clip-text text-transparent">
                  {String(seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <button onClick={startTimer}
                  className={`flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    timerRunning
                      ? 'bg-surface text-lite hover:bg-edgelit border border-edge'
                      : 'bg-gradient-to-r from-purple to-cyan text-white shadow-lg shadow-purple/25 hover:shadow-purple/40 hover:scale-[1.02]'
                  }`}>
                  {timerRunning ? <Pause size={15} /> : <Play size={15} />}
                  {timerRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button onClick={resetTimer}
                  className="p-2.5 rounded-xl border border-edge text-mute hover:text-lite hover:bg-surface transition-all duration-200">
                  <RotateCcw size={15} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {[15, 25, 45, 60].map(m => (
                  <button key={m} onClick={() => { resetTimer(); setMinutes(m) }}
                    className={`px-3.5 py-1 text-[11px] font-medium rounded-lg transition-all duration-200 ${
                      minutes === m && !timerRunning
                        ? 'bg-gradient-to-r from-purple/20 to-cyan/10 text-purple border border-purple/20'
                        : 'text-mute hover:text-dim hover:bg-surface'
                    }`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Quick stats + Theme */}
          <div className="w-[280px] flex flex-col gap-5 shrink-0">
            {/* Quick Stats */}
            <div className="glass rounded-2xl p-5 space-y-3 animate-slide-up">
              <p className="text-[9px] font-semibold text-mute uppercase tracking-[0.2em]">Quick Stats</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim">Notes</span>
                  <span className="text-sm font-bold text-lite">{notes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim">Learning Outcomes</span>
                  <span className="text-sm font-bold text-lite">{outcomes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim">Coverage</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-green to-cyan bg-clip-text text-transparent">{coveragePercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-green to-cyan rounded-full transition-all duration-500"
                    style={{ width: `${coveragePercent}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim">Active Sounds</span>
                  <div className="flex items-center gap-1.5">
                    {activeSounds > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />}
                    <span className="text-sm font-bold text-lite">{activeSounds}/{sounds.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="glass rounded-2xl p-5 flex-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-[9px] font-semibold text-mute uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                <Palette size={12} /> Ambiance Theme
              </p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(theme => (
                  <button key={theme.id} onClick={() => setActiveTheme(theme)}
                    className={`group relative py-4 px-3 rounded-xl text-xs font-medium transition-all duration-300 overflow-hidden ${
                      activeTheme.id === theme.id
                        ? 'ring-1 ring-purple/40 text-lite'
                        : 'text-mute hover:text-dim'
                    }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} ${
                      activeTheme.id === theme.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                    } transition-opacity duration-300`} />
                    <div className={`absolute inset-0 ${activeTheme.id === theme.id ? 'glass' : ''}`} />
                    <span className="relative z-10">{theme.name}</span>
                    {activeTheme.id === theme.id && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple animate-breathe" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Ambiance Mixer — full width */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <AmbiancePlayer
            sounds={sounds}
            onVolumeChange={setVolume}
            onToggle={toggleSound}
            onStopAll={stopAll}
          />
        </div>
      </div>
    </div>
  )
}
