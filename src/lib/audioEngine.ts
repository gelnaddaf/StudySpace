/**
 * File-based Audio Engine for StudySpace Ambiance
 * Uses real recorded ambient audio files for high-quality sound.
 * Smooth fade-in/out transitions, looping, and volume control.
 */

const FADE_MS = 400

const audioElements = new Map<string, HTMLAudioElement>()

function getOrCreateAudio(id: string, src: string): HTMLAudioElement {
  let audio = audioElements.get(id)
  if (!audio) {
    audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audioElements.set(id, audio)
  }
  return audio
}

function fadeVolume(audio: HTMLAudioElement, target: number, durationMs = FADE_MS) {
  const start = audio.volume
  const diff = target - start
  if (Math.abs(diff) < 0.01) { audio.volume = target; return }
  const steps = 20
  const stepMs = durationMs / steps
  let step = 0
  const interval = setInterval(() => {
    step++
    const t = step / steps
    const eased = t * t * (3 - 2 * t) // smoothstep
    audio.volume = Math.max(0, Math.min(1, start + diff * eased))
    if (step >= steps) {
      clearInterval(interval)
      audio.volume = Math.max(0, Math.min(1, target))
    }
  }, stepMs)
}

// Sound source mapping
const SOUND_SOURCES: Record<string, string> = {
  'brown-noise': '/audio/brown-noise.mp3',
  'rain': '/audio/rain.mp3',
  'fireplace': '/audio/fireplace.mp3',
  'wind': '/audio/wind.mp3',
  'thunder': '/audio/thunder.mp3',
  'birds': '/audio/birds.mp3',
}

export function startSound(id: string, volume: number): void {
  const src = SOUND_SOURCES[id]
  if (!src) return

  const audio = getOrCreateAudio(id, src)
  if (audio.paused) {
    audio.volume = 0
    audio.play().catch(() => {})
    fadeVolume(audio, volume)
  } else {
    fadeVolume(audio, volume)
  }
}

export function stopSound(id: string): void {
  const audio = audioElements.get(id)
  if (!audio || audio.paused) return

  fadeVolume(audio, 0)
  setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, FADE_MS + 50)
}

export function setVolume(id: string, volume: number): void {
  const audio = audioElements.get(id)
  if (!audio || audio.paused) return
  audio.volume = Math.max(0, Math.min(1, volume))
}

export function stopAll(): void {
  for (const id of audioElements.keys()) {
    stopSound(id)
  }
}

export function isPlaying(id: string): boolean {
  const audio = audioElements.get(id)
  return !!audio && !audio.paused
}
