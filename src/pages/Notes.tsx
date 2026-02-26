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
