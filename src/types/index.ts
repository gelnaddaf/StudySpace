export interface Note {
  id: string
  title: string
  content: string
  linkedLOs: string[]
  createdAt: string
  updatedAt: string
}

export interface LearningOutcome {
  id: string
  code: string
  description: string
  subjectName: string
  linkedNoteIds: string[]
  createdAt: string
}

export interface AmbiancePreset {
  id: string
  name: string
  sounds: SoundChannel[]
}

export interface SoundChannel {
  id: string
  name: string
  src: string
  volume: number
  icon: string
  isPlaying: boolean
}

export interface CoverageStatus {
  loId: string
  loCode: string
  loDescription: string
  noteCount: number
  status: 'covered' | 'partial' | 'uncovered'
}
