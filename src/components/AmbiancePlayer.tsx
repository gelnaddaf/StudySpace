import { useEffect } from 'react'
import { Waves, CloudRain, Flame, Wind, CloudLightning, Bird, VolumeX } from 'lucide-react'
import { startSound, stopSound, setVolume as setAudioVolume } from '../lib/audioEngine'
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

function Channel({ sound, onVolumeChange, onToggle }: {
  sound: SoundChannel
  onVolumeChange: (id: string, volume: number) => void
  onToggle: (id: string) => void
}) {
  const Icon = iconMap[sound.icon] || Waves

  useEffect(() => {
    if (sound.isPlaying && sound.volume > 0) {
      startSound(sound.id, sound.volume)
    } else {
      stopSound(sound.id)
    }
    return () => { stopSound(sound.id) }
  }, [sound.isPlaying, sound.id])

  useEffect(() => {
    if (sound.isPlaying) setAudioVolume(sound.id, sound.volume)
  }, [sound.volume, sound.isPlaying, sound.id])

  const pct = Math.round(sound.volume * 100)

  return (
    <div className={`card p-4 flex flex-col items-center gap-3 cursor-pointer select-none transition-all duration-300 ${
      sound.isPlaying ? '!border-purple/20 !bg-purple/[0.05]' : ''
    }`} onClick={() => onToggle(sound.id)}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
        sound.isPlaying
          ? 'bg-gradient-to-br from-purple to-indigo text-white shadow-lg shadow-purple/25'
          : 'bg-surface text-mute'
      }`}>
        <Icon size={18} />
      </div>
      <span className={`text-[12px] font-semibold ${sound.isPlaying ? 'text-lite' : 'text-mute'}`}>{sound.name}</span>
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <input type="range" min="0" max="1" step="0.01" value={sound.volume}
          onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, ${sound.isPlaying ? '#7c5bf0' : '#555568'} ${pct}%, rgba(255,255,255,0.04) ${pct}%)`
          }}
        />
      </div>
      <span className="text-[10px] text-mute font-mono">{pct}%</span>
    </div>
  )
}

export default function AmbiancePlayer({ sounds, onVolumeChange, onToggle, onStopAll }: Props) {
  const active = sounds.filter(s => s.isPlaying).length

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-lite">Ambiance Mixer</h3>
          <p className="text-[11px] text-mute mt-0.5">{active} of {sounds.length} channels active</p>
        </div>
        {active > 0 && (
          <button onClick={onStopAll} className="btn-ghost text-[11px] !py-1.5 !px-3">
            <VolumeX size={12} /> Mute All
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 flex-1">
        {sounds.map(sound => (
          <Channel key={sound.id} sound={sound} onVolumeChange={onVolumeChange} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}
