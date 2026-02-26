import type { Note, LearningOutcome, FileAttachment, AIExtractedLO, AISuggestion } from '../types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  return res.json()
}

// ── Notes ──

export async function fetchNotes(): Promise<Note[]> {
  return request<Note[]>('/notes')
}

export async function createNote(title: string, content: string, linkedLOs: string[] = []): Promise<Note> {
  return request<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content, linkedLOs }),
  })
}

export async function updateNote(id: string, updates: { title?: string; content?: string; linkedLOs?: string[] }): Promise<void> {
  await request(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteNote(id: string): Promise<void> {
  await request(`/notes/${id}`, { method: 'DELETE' })
}

// ── Learning Outcomes ──

export async function fetchLearningOutcomes(): Promise<LearningOutcome[]> {
  return request<LearningOutcome[]>('/learning-outcomes')
}

export async function createLearningOutcome(code: string, description: string, subjectName: string): Promise<LearningOutcome> {
  return request<LearningOutcome>('/learning-outcomes', {
    method: 'POST',
    body: JSON.stringify({ code, description, subjectName }),
  })
}

export async function importLearningOutcomes(items: { code: string; description: string; subjectName: string }[]): Promise<LearningOutcome[]> {
  return request<LearningOutcome[]>('/learning-outcomes/import', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

export async function deleteLearningOutcome(id: string): Promise<void> {
  await request(`/learning-outcomes/${id}`, { method: 'DELETE' })
}

// ── Files ──

export async function fetchFiles(noteId: string): Promise<FileAttachment[]> {
  return request<FileAttachment[]>(`/notes/${noteId}/files`)
}

export async function uploadFile(noteId: string, file: File): Promise<FileAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/notes/${noteId}/files`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function deleteFile(fileId: string): Promise<void> {
  await request(`/files/${fileId}`, { method: 'DELETE' })
}

export function getFileDownloadUrl(fileId: string): string {
  return `${BASE}/files/${fileId}/download`
}

// ── AI ──

export async function aiExtractLOs(text: string, subjectName?: string): Promise<AIExtractedLO[]> {
  return request<AIExtractedLO[]>('/ai/extract-los', {
    method: 'POST',
    body: JSON.stringify({ text, subjectName }),
  })
}

export async function aiSuggestLinks(): Promise<AISuggestion[]> {
  return request<AISuggestion[]>('/ai/suggest-links', { method: 'POST', body: '{}' })
}

export async function aiGapAnalysis(): Promise<{ summary: string; gaps: { loCode: string; suggestion: string }[]; strengths: string[] }> {
  return request('/ai/gap-analysis', { method: 'POST', body: '{}' })
}
