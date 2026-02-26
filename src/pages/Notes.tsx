import { useState } from 'react'
import { Plus, Search, FileText, Trash2, Edit3, Link2 } from 'lucide-react'
import { useNotes, useLearningOutcomes } from '../store/useStore'
import NoteEditor from '../components/NoteEditor'
import ReactMarkdown from 'react-markdown'
import type { Note } from '../types'

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes()
  const { outcomes } = useLearningOutcomes()
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = (title: string, content: string, linkedLOs: string[]) => {
    if (editingNote) {
      updateNote(editingNote.id, { title, content, linkedLOs })
    } else {
      addNote(title, content)
      const newNote = notes[notes.length - 1]
      if (newNote && linkedLOs.length > 0) {
        updateNote(newNote.id, { linkedLOs })
      }
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
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full bg-pink/[0.03] blur-[80px] animate-float2" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 glass-strong border-b border-white/[0.04] z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center shadow-lg shadow-purple/20">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-lite">Notes</h2>
              <p className="text-[10px] text-mute">{notes.length} note{notes.length !== 1 ? 's' : ''} created</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple to-pink text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple/20 hover:shadow-purple/40 hover:scale-[1.02]"
          >
            <Plus size={15} />
            New Note
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:ring-1 focus:ring-purple/30 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Notes List */}
        <div className="w-80 border-r border-white/[0.04] overflow-y-auto glass-strong">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface mx-auto flex items-center justify-center mb-3">
                <FileText size={24} className="text-mute opacity-50" />
              </div>
              <p className="text-sm text-dim">No notes yet</p>
              <p className="text-[10px] text-mute mt-1">Create your first note to get started</p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredNotes.map((note, i) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 animate-slide-up ${
                    selectedNote?.id === note.id
                      ? 'glass ring-1 ring-purple/20'
                      : 'hover:bg-white/[0.03]'
                  }`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <h4 className={`text-sm font-medium truncate ${selectedNote?.id === note.id ? 'text-lite' : 'text-dim'}`}>{note.title}</h4>
                  <p className="text-[11px] text-mute mt-1 line-clamp-2 leading-relaxed">{note.content || 'Empty note'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-mute">{new Date(note.updatedAt).toLocaleDateString()}</span>
                    {note.linkedLOs.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-purple font-medium">
                        <Link2 size={9} />
                        {note.linkedLOs.length} LO{note.linkedLOs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Note Preview */}
        <div className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <div className="p-8 max-w-3xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-lite to-dim bg-clip-text text-transparent">{selectedNote.title}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingNote(selectedNote)}
                    className="p-2.5 text-mute hover:text-purple hover:bg-purple/10 rounded-xl transition-all duration-200">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null) }}
                    className="p-2.5 text-mute hover:text-red hover:bg-red/10 rounded-xl transition-all duration-200">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {selectedNote.linkedLOs.length > 0 && (
                <div className="mb-6 glass rounded-xl p-4">
                  <p className="text-[9px] font-semibold text-mute mb-2 uppercase tracking-[0.2em]">Linked Learning Outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.linkedLOs.map(loId => {
                      const lo = outcomes.find(o => o.id === loId)
                      return lo ? (
                        <span key={loId} className="px-2.5 py-1 bg-gradient-to-r from-purple/15 to-cyan/10 text-purple text-[11px] font-medium rounded-lg border border-purple/10">
                          {lo.code}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none text-dim leading-relaxed">
                <ReactMarkdown>{selectedNote.content || '*No content*'}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface mx-auto flex items-center justify-center mb-4">
                  <FileText size={28} className="text-mute opacity-30" />
                </div>
                <p className="text-sm text-dim">Select a note to view</p>
                <p className="text-[10px] text-mute mt-1">Or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
