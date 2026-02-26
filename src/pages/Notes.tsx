import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Search, FileText, Trash2, Edit3, Link2, Paperclip, Download, X, Upload } from 'lucide-react'
import { useNotes, useLearningOutcomes } from '../store/useStore'
import NoteEditor from '../components/NoteEditor'
import ReactMarkdown from 'react-markdown'
import * as api from '../lib/api'
import type { Note, FileAttachment } from '../types'

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes()
  const { outcomes } = useLearningOutcomes()
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async (noteId: string) => {
    try { const f = await api.fetchFiles(noteId); setFiles(f) } catch { setFiles([]) }
  }, [])

  useEffect(() => {
    if (selectedNote) loadFiles(selectedNote.id)
    else setFiles([])
  }, [selectedNote, loadFiles])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedNote) return
    setUploading(true)
    try {
      const f = await api.uploadFile(selectedNote.id, file)
      setFiles(prev => [f, ...prev])
    } catch { /* API not available */ }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteFile = async (fileId: string) => {
    try { await api.deleteFile(fileId); setFiles(prev => prev.filter(f => f.id !== fileId)) } catch {}
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = async (title: string, content: string, linkedLOs: string[]) => {
    if (editingNote) {
      await updateNote(editingNote.id, { title, content, linkedLOs })
    } else {
      await addNote(title, content, linkedLOs)
    }
    setEditingNote(null)
    setIsCreating(false)
  }

  if (isCreating || editingNote) {
    return (
      <div className="h-full flex flex-col">
        <NoteEditor
          note={editingNote}
          outcomes={outcomes}
          onSave={handleSave}
          onCancel={() => { setEditingNote(null); setIsCreating(false) }}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-lite">Notes</h2>
          <p className="text-[11px] text-mute">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={14} /> New Note
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar list */}
        <div className="w-[300px] shrink-0 border-r border-white/[0.03] flex flex-col overflow-hidden bg-dark2/40">
          <div className="p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="input !pl-9 !py-2 !text-[12px]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center">
                <FileText size={20} className="mx-auto text-mute/40 mb-2" />
                <p className="text-[11px] text-mute">No notes yet</p>
              </div>
            ) : filteredNotes.map(note => (
              <button key={note.id} onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selectedNote?.id === note.id ? 'bg-purple/[0.08] border border-purple/15' : 'hover:bg-white/[0.025] border border-transparent'
                }`}>
                <h4 className={`text-[13px] font-semibold truncate ${selectedNote?.id === note.id ? 'text-lite' : 'text-dim'}`}>{note.title}</h4>
                <p className="text-[11px] text-mute mt-1 line-clamp-2 leading-relaxed">{note.content || 'Empty note'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-mute">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.linkedLOs.length > 0 && (
                    <span className="badge !text-[9px] !py-0 !px-1.5"><Link2 size={8} />{note.linkedLOs.length}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <div className="p-8 max-w-3xl anim-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-lite">{selectedNote.title}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingNote(selectedNote)} className="p-2 text-mute hover:text-purple hover:bg-purple/10 rounded-lg transition-colors"><Edit3 size={15} /></button>
                  <button onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null) }} className="p-2 text-mute hover:text-red hover:bg-red/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>

              {selectedNote.linkedLOs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedNote.linkedLOs.map(loId => {
                    const lo = outcomes.find(o => o.id === loId)
                    return lo ? <span key={loId} className="badge">{lo.code}</span> : null
                  })}
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none text-dim leading-relaxed">
                <ReactMarkdown>{selectedNote.content || '*No content*'}</ReactMarkdown>
              </div>

              {/* File Attachments */}
              <div className="mt-6 pt-5 border-t border-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip size={13} className="text-mute" />
                    <span className="text-[12px] font-semibold text-dim">Attachments</span>
                    {files.length > 0 && <span className="badge !text-[9px]">{files.length}</span>}
                  </div>
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf,.csv,.txt,.md,.doc,.docx,.png,.jpg" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="btn-ghost !text-[11px] !py-1.5 !px-3">
                      <Upload size={11} /> {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
                {files.length > 0 ? (
                  <div className="space-y-1">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-2.5 card !rounded-lg group">
                        <FileText size={14} className="text-purple shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-dim font-medium truncate">{f.filename}</p>
                          <p className="text-[10px] text-mute">{formatSize(f.sizeBytes)}</p>
                        </div>
                        <a href={api.getFileDownloadUrl(f.id)} target="_blank" rel="noreferrer"
                          className="p-1.5 text-mute hover:text-cyan rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Download size={12} />
                        </a>
                        <button onClick={() => handleDeleteFile(f.id)}
                          className="p-1.5 text-mute hover:text-red rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-mute">No files attached. Upload PDFs, CSVs, or documents.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={24} className="mx-auto text-mute/30 mb-3" />
                <p className="text-[13px] text-dim">Select a note to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
