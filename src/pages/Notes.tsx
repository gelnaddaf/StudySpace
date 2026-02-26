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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-edge bg-dark2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-lite">Notes</h2>
            <p className="text-xs text-mute mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple hover:bg-purplehi text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm shadow-purple/20"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-dark border border-edge rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:border-purple/50 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List */}
        <div className="w-80 border-r border-edge overflow-y-auto bg-dark2/50">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={40} className="mx-auto text-mute mb-3 opacity-40" />
              <p className="text-sm text-mute">No notes yet</p>
              <p className="text-xs text-mute mt-1">Create your first note to get started</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? 'bg-purple/10 border border-purple/20'
                      : 'hover:bg-surface border border-transparent'
                  }`}
                >
                  <h4 className="text-sm font-medium text-lite truncate">{note.title}</h4>
                  <p className="text-xs text-mute mt-1.5 line-clamp-2">{note.content || 'Empty note'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-mute">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    {note.linkedLOs.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-purple">
                        <Link2 size={10} />
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
            <div className="p-8 max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-lite">{selectedNote.title}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingNote(selectedNote)}
                    className="p-2 text-mute hover:text-purple hover:bg-surface rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null) }}
                    className="p-2 text-mute hover:text-red hover:bg-surface rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Linked LOs */}
              {selectedNote.linkedLOs.length > 0 && (
                <div className="mb-6 p-4 bg-dark2 rounded-xl border border-edge">
                  <p className="text-[10px] font-semibold text-mute mb-2 uppercase tracking-widest">Linked Learning Outcomes</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.linkedLOs.map(loId => {
                      const lo = outcomes.find(o => o.id === loId)
                      return lo ? (
                        <span key={loId} className="px-2.5 py-1 bg-purple/10 text-purple text-xs font-medium rounded-lg">
                          {lo.code}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose prose-invert prose-sm max-w-none text-dim leading-relaxed">
                <ReactMarkdown>{selectedNote.content || '*No content*'}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 text-mute opacity-30" />
                <p className="text-sm text-mute">Select a note to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
