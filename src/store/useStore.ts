import { useState, useCallback } from 'react'
import type { Note, LearningOutcome, SoundChannel } from '../types'

const generateId = () => crypto.randomUUID()

const DEFAULT_SOUNDS: SoundChannel[] = [
  { id: 'brown-noise', name: 'Brown Noise', src: '/audio/brown-noise.mp3', volume: 0, icon: 'Waves', isPlaying: false },
  { id: 'rain', name: 'Rain', src: '/audio/rain.mp3', volume: 0, icon: 'CloudRain', isPlaying: false },
  { id: 'fireplace', name: 'Fireplace', src: '/audio/fireplace.mp3', volume: 0, icon: 'Flame', isPlaying: false },
  { id: 'wind', name: 'Wind', src: '/audio/wind.mp3', volume: 0, icon: 'Wind', isPlaying: false },
  { id: 'thunder', name: 'Thunder', src: '/audio/thunder.mp3', volume: 0, icon: 'CloudLightning', isPlaying: false },
  { id: 'birds', name: 'Birds', src: '/audio/birds.mp3', volume: 0, icon: 'Bird', isPlaying: false },
]

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('studyspace-notes')
    return saved ? JSON.parse(saved) : []
  })

  const save = (updated: Note[]) => {
    setNotes(updated)
    localStorage.setItem('studyspace-notes', JSON.stringify(updated))
  }

  const addNote = useCallback((title: string, content: string) => {
    const note: Note = {
      id: generateId(),
      title,
      content,
      linkedLOs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    save([...notes, note])
    return note
  }, [notes])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    )
    save(updated)
  }, [notes])

  const deleteNote = useCallback((id: string) => {
    save(notes.filter(n => n.id !== id))
  }, [notes])

  const linkNoteToLO = useCallback((noteId: string, loId: string) => {
    const updated = notes.map(n =>
      n.id === noteId && !n.linkedLOs.includes(loId)
        ? { ...n, linkedLOs: [...n.linkedLOs, loId], updatedAt: new Date().toISOString() }
        : n
    )
    save(updated)
  }, [notes])

  const unlinkNoteFromLO = useCallback((noteId: string, loId: string) => {
    const updated = notes.map(n =>
      n.id === noteId
        ? { ...n, linkedLOs: n.linkedLOs.filter(l => l !== loId), updatedAt: new Date().toISOString() }
        : n
    )
    save(updated)
  }, [notes])

  return { notes, addNote, updateNote, deleteNote, linkNoteToLO, unlinkNoteFromLO }
}

export function useLearningOutcomes() {
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>(() => {
    const saved = localStorage.getItem('studyspace-los')
    return saved ? JSON.parse(saved) : []
  })

  const save = (updated: LearningOutcome[]) => {
    setOutcomes(updated)
    localStorage.setItem('studyspace-los', JSON.stringify(updated))
  }

  const addLO = useCallback((code: string, description: string, subjectName: string) => {
    const lo: LearningOutcome = {
      id: generateId(),
      code,
      description,
      subjectName,
      linkedNoteIds: [],
      createdAt: new Date().toISOString(),
    }
    save([...outcomes, lo])
    return lo
  }, [outcomes])

  const deleteLO = useCallback((id: string) => {
    save(outcomes.filter(lo => lo.id !== id))
  }, [outcomes])

  const importLOs = useCallback((items: { code: string; description: string; subjectName: string }[]) => {
    const newLOs: LearningOutcome[] = items.map(item => ({
      id: generateId(),
      ...item,
      linkedNoteIds: [],
      createdAt: new Date().toISOString(),
    }))
    save([...outcomes, ...newLOs])
  }, [outcomes])

  return { outcomes, addLO, deleteLO, importLOs }
}

export function useAmbiance() {
  const [sounds, setSounds] = useState<SoundChannel[]>(() => {
    const saved = localStorage.getItem('studyspace-ambiance')
    return saved ? JSON.parse(saved) : DEFAULT_SOUNDS
  })

  const save = (updated: SoundChannel[]) => {
    setSounds(updated)
    localStorage.setItem('studyspace-ambiance', JSON.stringify(updated))
  }

  const setVolume = useCallback((id: string, volume: number) => {
    const updated = sounds.map(s =>
      s.id === id ? { ...s, volume, isPlaying: volume > 0 } : s
    )
    save(updated)
  }, [sounds])

  const toggleSound = useCallback((id: string) => {
    const updated = sounds.map(s =>
      s.id === id ? { ...s, isPlaying: !s.isPlaying, volume: !s.isPlaying ? (s.volume || 0.5) : 0 } : s
    )
    save(updated)
  }, [sounds])

  const stopAll = useCallback(() => {
    const updated = sounds.map(s => ({ ...s, isPlaying: false, volume: 0 }))
    save(updated)
  }, [sounds])

  return { sounds, setVolume, toggleSound, stopAll }
}
