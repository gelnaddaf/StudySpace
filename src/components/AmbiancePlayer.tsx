import { useEffect, useRef } from 'react'
import { Waves, CloudRain, Flame, Wind, CloudLightning, Bird, VolumeX, Headphones } from 'lucide-react'
import type { SoundChannel } from '../types'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Waves, CloudRain, Flame, Wind, CloudLightning, Bird,
}

interface Props {
  sounds: SoundChannel[]
  onVolumeChange: (id: string, volume: number) => void
  onToggle: (id: string) => void
  onStopAll: () => void
}

function SoundSlider({ sound, onVolumeChange, onToggle }: {
  sound: SoundChannel
  onVolumeChange: (id: string, volume: number) => void
  onToggle: (id: string) => void
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const Icon = iconMap[sound.icon] || Waves

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(sound.src)
      audioRef.current.loop = true
    }
    const audio = audioRef.current
    audio.volume = sound.volume
    if (sound.isPlaying && sound.volume > 0) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
    return () => { audio.pause() }
  }, [sound.isPlaying, sound.volume, sound.src])

  return (
    <div className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
      sound.isPlaying ? 'bg-purple/[0.06]' : 'hover:bg-white/[0.02]'
    }`}>
      <button
        onClick={() => onToggle(sound.id)}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0 ${
          sound.isPlaying
            ? 'bg-gradient-to-br from-purple to-cyan text-white shadow-lg shadow-purple/20'
            : 'bg-surface text-mute group-hover:text-dim group-hover:bg-edgelit'
        }`}
      >
        <Icon size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium transition-colors ${sound.isPlaying ? 'text-lite' : 'text-dim'}`}>{sound.name}</span>
          <span className="text-[10px] text-mute tabular-nums font-mono">{Math.round(sound.volume * 100)}%</span>
        </div>
        <div className="relative">
          <input
            type="range" min="0" max="1" step="0.01"
            value={sound.volume}
            onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-purple/40
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
            style={{
              background: sound.isPlaying
                ? `linear-gradient(to right, #8b5cf6 ${sound.volume * 100}%, rgba(139,92,246,0.1) ${sound.volume * 100}%)`
                : `linear-gradient(to right, rgba(160,160,180,0.3) ${sound.volume * 100}%, rgba(30,30,42,0.5) ${sound.volume * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AmbiancePlayer({ sounds, onVolumeChange, onToggle, onStopAll }: Props) {
  const isAnyPlaying = sounds.some(s => s.isPlaying)
  const activeCount = sounds.filter(s => s.isPlaying).length

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isAnyPlaying ? 'bg-gradient-to-br from-purple to-cyan shadow-md shadow-purple/20' : 'bg-surface'
          }`}>
            <Headphones size={14} className={isAnyPlaying ? 'text-white' : 'text-mute'} />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-mute uppercase tracking-[0.2em]">Ambiance Mixer</p>
            <p className="text-[10px] text-mute mt-0.5">{activeCount} of {sounds.length} active</p>
          </div>
        </div>
        {isAnyPlaying && (
          <button onClick={onStopAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-mute hover:text-red hover:bg-red/10 transition-all duration-200">
            <VolumeX size={12} />
            Stop All
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {sounds.map(sound => (
          <SoundSlider key={sound.id} sound={sound} onVolumeChange={onVolumeChange} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}
