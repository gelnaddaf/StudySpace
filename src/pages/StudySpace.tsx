import { useState } from 'react'
import { Clock, Moon, Sun, Play, Pause, RotateCcw } from 'lucide-react'
import AmbiancePlayer from '../components/AmbiancePlayer'
import { useAmbiance } from '../store/useStore'

const THEMES = [
  { id: 'midnight', name: 'Midnight', bg: 'from-[#0a0a12] to-[#12121f]', icon: '🌙' },
  { id: 'warm', name: 'Warm Glow', bg: 'from-[#1a1008] to-[#0f0a04]', icon: '🕯️' },
  { id: 'forest', name: 'Forest', bg: 'from-[#0a120a] to-[#061008]', icon: '🌲' },
  { id: 'ocean', name: 'Deep Ocean', bg: 'from-[#0a0f1a] to-[#040810]', icon: '🌊' },
]

export default function StudySpace() {
  const { sounds, setVolume, toggleSound, stopAll } = useAmbiance()
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerInterval, setTimerIntervalState] = useState<ReturnType<typeof setInterval> | null>(null)

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
            if (m === 0) {
              clearInterval(interval)
              setTimerRunning(false)
              setTimerIntervalState(null)
              return 0
            }
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
    setTimerRunning(false)
    setTimerIntervalState(null)
    setMinutes(25)
    setSeconds(0)
  }

  return (
    <div className={`h-full bg-gradient-to-br ${activeTheme.bg} p-8 overflow-y-auto`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h2 className="text-3xl font-bold text-lite tracking-tight">Your Study Space</h2>
          <p className="text-dim text-sm mt-2">Set the mood and focus on what matters</p>
        </div>

        {/* Focus Timer — always visible, centered, prominent */}
        <div className="bg-card/50 backdrop-blur-md border border-edge rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-dim">
              <Clock size={16} />
              <span className="text-xs font-medium uppercase tracking-widest">Focus Timer</span>
            </div>
            <div className="text-7xl font-mono font-bold text-lite tracking-wider select-none">
              {String(minutes).padStart(2, '0')}
              <span className="text-purple animate-pulse">:</span>
              {String(seconds).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={startTimer}
                className="flex items-center gap-2 px-8 py-2.5 bg-purple hover:bg-purplehi text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple/20"
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-5 py-2.5 border border-edge text-dim hover:text-lite hover:bg-surface text-sm font-medium rounded-xl transition-all duration-200"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[15, 25, 45, 60].map(m => (
                <button
                  key={m}
                  onClick={() => { resetTimer(); setMinutes(m) }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    minutes === m && !timerRunning
                      ? 'bg-purple/15 text-purple'
                      : 'text-mute hover:text-dim hover:bg-surface'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-card/50 backdrop-blur-md border border-edge rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-dim mb-3 flex items-center gap-2 uppercase tracking-widest">
            {activeTheme.id === 'midnight' || activeTheme.id === 'ocean' ? <Moon size={14} /> : <Sun size={14} />}
            Lighting Theme
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  activeTheme.id === theme.id
                    ? 'border-purple bg-purple/10 text-purple shadow-sm shadow-purple/10'
                    : 'border-edge text-dim hover:border-edgelit hover:bg-surface'
                }`}
              >
                <span className="text-xl">{theme.icon}</span>
                <span className="text-xs">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ambiance Mixer */}
        <AmbiancePlayer
          sounds={sounds}
          onVolumeChange={setVolume}
          onToggle={toggleSound}
          onStopAll={stopAll}
        />
      </div>
    </div>
  )
}
