import { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import AmbiancePlayer from '../components/AmbiancePlayer'
import { useAmbiance } from '../store/useStore'

export default function StudySpace() {
  const { sounds, setVolume, toggleSound, stopAll } = useAmbiance()
  const [totalSec, setTotalSec] = useState(25 * 60)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const toggle = () => setRunning(r => !r)
  const reset = () => { setRunning(false); setRemaining(totalSec) }
  const pick = (m: number) => { setRunning(false); setTotalSec(m * 60); setRemaining(m * 60) }

  const min = Math.floor(remaining / 60)
  const sec = remaining % 60
  const progress = totalSec > 0 ? ((totalSec - remaining) / totalSec) : 0
  const circumference = 2 * Math.PI * 90

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex gap-5 h-full flex-col">
        {/* Top: Timer + Mixer side by side */}
        <div className="flex gap-5 flex-1 min-h-0">
          {/* Timer */}
          <div className="w-[380px] shrink-0 card flex flex-col items-center justify-center p-8 anim-fade-in relative overflow-hidden">
            {/* Subtle BG glow when running */}
            {running && <div className="absolute inset-0 bg-purple/[0.03] rounded-2xl" />}

            <div className="relative w-[220px] h-[220px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                <circle cx="100" cy="100" r="90" fill="none"
                  stroke="url(#ring)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className="transition-all duration-1000 ease-linear" />
                <defs>
                  <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c5bf0" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-mono font-bold tracking-wider text-lite select-none">
                  {String(min).padStart(2, '0')}
                  <span className={`text-purple/60 ${running ? 'animate-pulse' : ''}`}>:</span>
                  {String(sec).padStart(2, '0')}
                </div>
                <p className="text-[10px] text-mute font-medium mt-1 uppercase tracking-widest">
                  {running ? 'Focusing' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 relative z-10">
              <button onClick={toggle} className="btn-primary">
                {running ? <Pause size={14} /> : <Play size={14} />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /></button>
            </div>
            <div className="flex gap-1 mt-4 relative z-10">
              {[15, 25, 45, 60].map(m => (
                <button key={m} onClick={() => pick(m)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    totalSec === m * 60 ? 'bg-purple/15 text-purplehi' : 'text-mute hover:text-dim'
                  }`}>
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Ambiance Mixer — takes remaining space */}
          <div className="flex-1 min-w-0 anim-fade-in anim-stagger-1">
            <AmbiancePlayer sounds={sounds} onVolumeChange={setVolume} onToggle={toggleSound} onStopAll={stopAll} />
          </div>
        </div>
      </div>
    </div>
  )
}
