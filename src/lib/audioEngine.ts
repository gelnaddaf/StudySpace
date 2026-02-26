/**
 * Procedural Audio Engine for StudySpace Ambiance
 * Generates all ambient sounds in real-time using Web Audio API.
 * No audio files needed — everything is synthesized.
 */

let audioCtx: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// ── Noise generator (white noise buffer) ──
function createNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

function createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const source = ctx.createBufferSource()
  source.buffer = createNoiseBuffer(ctx)
  source.loop = true
  return source
}

// ── Sound Generators ──

interface SoundNode {
  gain: GainNode
  start: () => void
  stop: () => void
}

function createBrownNoise(ctx: AudioContext): SoundNode {
  const source = createNoiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  filter.Q.value = 0.5

  const gain = ctx.createGain()
  gain.gain.value = 0

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  return {
    gain,
    start: () => source.start(),
    stop: () => { try { source.stop() } catch {} },
  }
}

function createRain(ctx: AudioContext): SoundNode {
  // Rain = high-passed noise + bandpass layer for patter
  const source1 = createNoiseSource(ctx)
  const source2 = createNoiseSource(ctx)

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 4000
  highpass.Q.value = 0.3

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 8000
  bandpass.Q.value = 0.8

  const gain1 = ctx.createGain()
  gain1.gain.value = 0.7
  const gain2 = ctx.createGain()
  gain2.gain.value = 0.3

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0

  source1.connect(highpass)
  highpass.connect(gain1)
  gain1.connect(masterGain)

  source2.connect(bandpass)
  bandpass.connect(gain2)
  gain2.connect(masterGain)

  masterGain.connect(ctx.destination)

  return {
    gain: masterGain,
    start: () => { source1.start(); source2.start() },
    stop: () => { try { source1.stop(); source2.stop() } catch {} },
  }
}

function createFireplace(ctx: AudioContext): SoundNode {
  // Crackle = bandpassed noise with amplitude modulation
  const source = createNoiseSource(ctx)

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 3000
  bandpass.Q.value = 2.0

  // LFO for crackling effect
  const lfo = ctx.createOscillator()
  lfo.type = 'square'
  lfo.frequency.value = 6
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.4

  const modulatedGain = ctx.createGain()
  modulatedGain.gain.value = 0.6

  lfo.connect(lfoGain)
  lfoGain.connect(modulatedGain.gain)

  // Low rumble layer
  const rumbleSource = createNoiseSource(ctx)
  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 300
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.value = 0.4

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0

  source.connect(bandpass)
  bandpass.connect(modulatedGain)
  modulatedGain.connect(masterGain)

  rumbleSource.connect(lowpass)
  lowpass.connect(rumbleGain)
  rumbleGain.connect(masterGain)

  masterGain.connect(ctx.destination)

  return {
    gain: masterGain,
    start: () => { source.start(); lfo.start(); rumbleSource.start() },
    stop: () => { try { source.stop(); lfo.stop(); rumbleSource.stop() } catch {} },
  }
}

function createWind(ctx: AudioContext): SoundNode {
  // Wind = filtered noise with slow LFO modulating the filter frequency
  const source = createNoiseSource(ctx)

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 600
  filter.Q.value = 0.5

  // Slow modulation for wind gusts
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.15
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 400

  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)

  const gain = ctx.createGain()
  gain.gain.value = 0

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  return {
    gain,
    start: () => { source.start(); lfo.start() },
    stop: () => { try { source.stop(); lfo.stop() } catch {} },
  }
}

function createThunder(ctx: AudioContext): SoundNode {
  // Deep rumble = very low-passed noise with slow amplitude variation
  const source = createNoiseSource(ctx)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 120
  lowpass.Q.value = 1.0

  // Very slow LFO for rumble variation
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.08
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.5

  const modulatedGain = ctx.createGain()
  modulatedGain.gain.value = 0.5

  lfo.connect(lfoGain)
  lfoGain.connect(modulatedGain.gain)

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0

  source.connect(lowpass)
  lowpass.connect(modulatedGain)
  modulatedGain.connect(masterGain)
  masterGain.connect(ctx.destination)

  return {
    gain: masterGain,
    start: () => { source.start(); lfo.start() },
    stop: () => { try { source.stop(); lfo.stop() } catch {} },
  }
}

function createBirds(ctx: AudioContext): SoundNode {
  // Bird chirps = multiple sine oscillators with random frequency modulation
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0

  const oscillators: OscillatorNode[] = []
  const startFns: (() => void)[] = []
  const stopFns: (() => void)[] = []

  // Create 3 "bird" voices with different base frequencies
  const birdFreqs = [2400, 3200, 4000]

  for (const baseFreq of birdFreqs) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = baseFreq

    // Frequency modulation for chirp effect
    const freqLfo = ctx.createOscillator()
    freqLfo.type = 'sine'
    freqLfo.frequency.value = 4 + Math.random() * 6
    const freqLfoGain = ctx.createGain()
    freqLfoGain.gain.value = baseFreq * 0.15

    freqLfo.connect(freqLfoGain)
    freqLfoGain.connect(osc.frequency)

    // Amplitude modulation for intermittent chirps
    const ampLfo = ctx.createOscillator()
    ampLfo.type = 'sine'
    ampLfo.frequency.value = 0.3 + Math.random() * 0.5
    const ampLfoGain = ctx.createGain()
    ampLfoGain.gain.value = 0.15

    const birdGain = ctx.createGain()
    birdGain.gain.value = 0

    ampLfo.connect(ampLfoGain)
    ampLfoGain.connect(birdGain.gain)

    osc.connect(birdGain)
    birdGain.connect(masterGain)

    oscillators.push(osc)
    startFns.push(() => { osc.start(); freqLfo.start(); ampLfo.start() })
    stopFns.push(() => { try { osc.stop(); freqLfo.stop(); ampLfo.stop() } catch {} })
  }

  masterGain.connect(ctx.destination)

  return {
    gain: masterGain,
    start: () => startFns.forEach(fn => fn()),
    stop: () => stopFns.forEach(fn => fn()),
  }
}

// ── Sound Factory ──
const GENERATORS: Record<string, (ctx: AudioContext) => SoundNode> = {
  'brown-noise': createBrownNoise,
  'rain': createRain,
  'fireplace': createFireplace,
  'wind': createWind,
  'thunder': createThunder,
  'birds': createBirds,
}

// ── Active sounds management ──
const activeSounds = new Map<string, SoundNode>()

export function startSound(id: string, volume: number): void {
  if (activeSounds.has(id)) {
    // Just update volume
    setVolume(id, volume)
    return
  }

  const generator = GENERATORS[id]
  if (!generator) return

  const ctx = getContext()
  const node = generator(ctx)
  node.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.1)
  node.start()
  activeSounds.set(id, node)
}

export function stopSound(id: string): void {
  const node = activeSounds.get(id)
  if (!node) return

  const ctx = getContext()
  // Fade out to avoid clicks
  node.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
  setTimeout(() => {
    node.stop()
    activeSounds.delete(id)
  }, 300)
}

export function setVolume(id: string, volume: number): void {
  const node = activeSounds.get(id)
  if (!node) return
  const ctx = getContext()
  node.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05)
}

export function stopAll(): void {
  for (const id of activeSounds.keys()) {
    stopSound(id)
  }
}

export function isPlaying(id: string): boolean {
  return activeSounds.has(id)
}
