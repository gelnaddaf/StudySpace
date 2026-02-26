import { useEffect, useRef } from 'react'
import { Waves, CloudRain, Flame, Wind, CloudLightning, Bird, VolumeX, Music } from 'lucide-react'
import type { SoundChannel } from '../types'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
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
    <div className="flex items-center gap-3 group">
      <button
        onClick={() => onToggle(sound.id)}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
          sound.isPlaying
            ? 'bg-purple/15 text-purple shadow-sm shadow-purple/10'
            : 'text-mute hover:text-dim hover:bg-surface'
        }`}
      >
        <Icon size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-dim">{sound.name}</span>
          <span className="text-[10px] text-mute tabular-nums">{Math.round(sound.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sound.volume}
          onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple
            [&::-webkit-slider-thumb]:hover:bg-purplehi [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-purple/30"
          style={{
            background: `linear-gradient(to right, var(--color-purple) ${sound.volume * 100}%, var(--color-edge) ${sound.volume * 100}%)`
          }}
        />
      </div>
    </div>
  )
}

export default function AmbiancePlayer({ sounds, onVolumeChange, onToggle, onStopAll }: Props) {
  const isAnyPlaying = sounds.some(s => s.isPlaying)

  return (
    <div className="bg-card/50 backdrop-blur-md border border-edge rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-dim flex items-center gap-2 uppercase tracking-widest">
          <Music size={14} />
          Ambiance Mixer
        </h3>
        {isAnyPlaying && (
          <button
            onClick={onStopAll}
            className="flex items-center gap-1.5 text-xs text-mute hover:text-red transition-colors"
          >
            <VolumeX size={14} />
            Stop All
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {sounds.map(sound => (
          <SoundSlider
            key={sound.id}
            sound={sound}
            onVolumeChange={onVolumeChange}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
