import { useState } from 'react'
import { Save, X, Link2 } from 'lucide-react'
import type { Note, LearningOutcome } from '../types'

interface Props {
  note?: Note | null
  outcomes: LearningOutcome[]
  onSave: (title: string, content: string, linkedLOs: string[]) => void
  onCancel: () => void
}

export default function NoteEditor({ note, outcomes, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [linkedLOs, setLinkedLOs] = useState<string[]>(note?.linkedLOs || [])
  const [showLOPanel, setShowLOPanel] = useState(false)

  const handleSave = () => {
    if (!title.trim()) return
    onSave(title.trim(), content, linkedLOs)
  }

  const toggleLO = (loId: string) => {
    setLinkedLOs(prev =>
      prev.includes(loId) ? prev.filter(id => id !== loId) : [...prev, loId]
    )
  }

  return (
    <div className="flex flex-col h-full bg-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-edge bg-dark2">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none outline-none text-lite placeholder:text-mute flex-1"
          autoFocus
        />
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setShowLOPanel(!showLOPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              showLOPanel ? 'bg-purple/15 text-purple' : 'text-mute hover:text-dim hover:bg-surface'
            }`}
            title="Link Learning Outcomes"
          >
            <Link2 size={16} />
            {linkedLOs.length > 0 && (
              <span className="text-xs font-medium">{linkedLOs.length}</span>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple hover:bg-purplehi text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm shadow-purple/20"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-mute hover:text-dim hover:bg-surface rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notes here... (Markdown supported)"
            className="w-full h-full bg-transparent border-none outline-none text-lite placeholder:text-mute resize-none text-sm leading-relaxed font-mono"
          />
        </div>

        {/* LO Linking Panel */}
        {showLOPanel && (
          <div className="w-72 border-l border-edge bg-dark2 p-4 overflow-y-auto">
            <h4 className="text-xs font-semibold text-dim mb-3 uppercase tracking-widest">Link to LOs</h4>
            {outcomes.length === 0 ? (
              <p className="text-xs text-mute">No learning outcomes added yet.</p>
            ) : (
              <div className="space-y-2">
                {outcomes.map(lo => (
                  <button
                    key={lo.id}
                    onClick={() => toggleLO(lo.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-200 ${
                      linkedLOs.includes(lo.id)
                        ? 'border-purple bg-purple/10 text-purple'
                        : 'border-edge text-dim hover:border-edgelit hover:bg-surface'
                    }`}
                  >
                    <span className="font-semibold">{lo.code}</span>
                    <p className="mt-1 text-mute line-clamp-2">{lo.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
