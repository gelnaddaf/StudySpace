import { useState, useCallback, useEffect, useRef } from 'react'
import type { Note, LearningOutcome, SoundChannel } from '../types'
import * as api from '../lib/api'

const generateId = () => crypto.randomUUID()

// Check if the D1 API is available (running under wrangler pages dev or deployed)
let _apiAvailable: boolean | null = null
async function isApiAvailable(): Promise<boolean> {
  if (_apiAvailable !== null) return _apiAvailable
  try {
    const res = await fetch('/api/notes', { method: 'GET' })
    _apiAvailable = res.ok
  } catch {
    _apiAvailable = false
  }
  return _apiAvailable
}

// ── localStorage helpers (fallback) ──
function lsGet<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}
function lsSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ──────────────────────────────────────────────
// NOTES
// ──────────────────────────────────────────────
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => lsGet('studyspace-notes', []))
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  // On mount, try to load from API; fall back to localStorage
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    ;(async () => {
      if (await isApiAvailable()) {
        try {
          const data = await api.fetchNotes()
          setNotes(data)
        } catch { /* keep localStorage data */ }
      }
      setLoading(false)
    })()
  }, [])

  // Persist to localStorage as cache
  useEffect(() => {
    if (!loading) lsSet('studyspace-notes', notes)
  }, [notes, loading])

  const addNote = useCallback(async (title: string, content: string, linkedLOs: string[] = []) => {
    if (await isApiAvailable()) {
      try {
        const note = await api.createNote(title, content, linkedLOs)
        setNotes(prev => [note, ...prev])
        return note
      } catch { /* fall through to local */ }
    }
    const note: Note = { id: generateId(), title, content, linkedLOs, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setNotes(prev => [note, ...prev])
    return note
  }, [])

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    if (await isApiAvailable()) {
      try {
        await api.updateNote(id, { title: updates.title, content: updates.content, linkedLOs: updates.linkedLOs })
      } catch { /* local-only */ }
    }
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (await isApiAvailable()) {
      try { await api.deleteNote(id) } catch { /* local-only */ }
    }
  }, [])

  return { notes, loading, addNote, updateNote, deleteNote }
}

// ──────────────────────────────────────────────
// LEARNING OUTCOMES
// ──────────────────────────────────────────────
export function useLearningOutcomes() {
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>(() => lsGet('studyspace-los', []))
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    ;(async () => {
      if (await isApiAvailable()) {
        try {
          const data = await api.fetchLearningOutcomes()
          setOutcomes(data)
        } catch { /* keep localStorage */ }
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!loading) lsSet('studyspace-los', outcomes)
  }, [outcomes, loading])

  const addLO = useCallback(async (code: string, description: string, subjectName: string) => {
    if (await isApiAvailable()) {
      try {
        const lo = await api.createLearningOutcome(code, description, subjectName)
        setOutcomes(prev => [...prev, lo])
        return lo
      } catch { /* fall through */ }
    }
    const lo: LearningOutcome = { id: generateId(), code, description, subjectName, linkedNoteIds: [], createdAt: new Date().toISOString() }
    setOutcomes(prev => [...prev, lo])
    return lo
  }, [])

  const deleteLO = useCallback(async (id: string) => {
    setOutcomes(prev => prev.filter(lo => lo.id !== id))
    if (await isApiAvailable()) {
      try { await api.deleteLearningOutcome(id) } catch { /* local-only */ }
    }
  }, [])

  const importLOs = useCallback(async (items: { code: string; description: string; subjectName: string }[]) => {
    if (await isApiAvailable()) {
      try {
        const newLOs = await api.importLearningOutcomes(items)
        setOutcomes(prev => [...prev, ...newLOs])
        return
      } catch { /* fall through */ }
    }
    const newLOs: LearningOutcome[] = items.map(item => ({
      id: generateId(), ...item, linkedNoteIds: [], createdAt: new Date().toISOString(),
    }))
    setOutcomes(prev => [...prev, ...newLOs])
  }, [])

  return { outcomes, loading, addLO, deleteLO, importLOs }
}

// ──────────────────────────────────────────────
// AMBIANCE (always client-only, localStorage)
// ──────────────────────────────────────────────
const DEFAULT_SOUNDS: SoundChannel[] = [
  { id: 'brown-noise', name: 'Brown Noise', src: '/audio/brown-noise.mp3', volume: 0, icon: 'Waves', isPlaying: false },
  { id: 'rain', name: 'Rain', src: '/audio/rain.mp3', volume: 0, icon: 'CloudRain', isPlaying: false },
  { id: 'fireplace', name: 'Fireplace', src: '/audio/fireplace.mp3', volume: 0, icon: 'Flame', isPlaying: false },
  { id: 'wind', name: 'Wind', src: '/audio/wind.mp3', volume: 0, icon: 'Wind', isPlaying: false },
  { id: 'thunder', name: 'Thunder', src: '/audio/thunder.mp3', volume: 0, icon: 'CloudLightning', isPlaying: false },
  { id: 'birds', name: 'Birds', src: '/audio/birds.mp3', volume: 0, icon: 'Bird', isPlaying: false },
]

export function useAmbiance() {
  const [sounds, setSounds] = useState<SoundChannel[]>(() => lsGet('studyspace-ambiance', DEFAULT_SOUNDS))

  useEffect(() => {
    lsSet('studyspace-ambiance', sounds)
  }, [sounds])

  const setVolume = useCallback((id: string, volume: number) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, volume, isPlaying: volume > 0 } : s))
  }, [])

  const toggleSound = useCallback((id: string) => {
    setSounds(prev => prev.map(s =>
      s.id === id ? { ...s, isPlaying: !s.isPlaying, volume: !s.isPlaying ? (s.volume || 0.5) : 0 } : s
    ))
  }, [])

  const stopAll = useCallback(() => {
    setSounds(prev => prev.map(s => ({ ...s, isPlaying: false, volume: 0 })))
  }, [])

  return { sounds, setVolume, toggleSound, stopAll }
}
