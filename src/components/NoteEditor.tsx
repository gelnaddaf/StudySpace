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
    <div className="flex flex-col h-full bg-dark relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-purple/[0.03] blur-[80px] animate-float1" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 glass-strong border-b border-white/[0.04] z-10">
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
              showLOPanel ? 'bg-gradient-to-r from-purple/20 to-cyan/10 text-purple' : 'text-mute hover:text-dim hover:bg-surface'
            }`}
            title="Link Learning Outcomes"
          >
            <Link2 size={16} />
            {linkedLOs.length > 0 && (
              <span className="text-[10px] font-bold bg-purple text-white w-4 h-4 rounded-full flex items-center justify-center">{linkedLOs.length}</span>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple to-cyan text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple/20 hover:shadow-purple/40 hover:scale-[1.02]"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-mute hover:text-lite hover:bg-surface rounded-xl transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
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
          <div className="w-72 glass-strong border-l border-white/[0.04] p-4 overflow-y-auto animate-slide-up">
            <h4 className="text-[9px] font-semibold text-mute mb-3 uppercase tracking-[0.2em]">Link to LOs</h4>
            {outcomes.length === 0 ? (
              <p className="text-xs text-mute">No learning outcomes added yet.</p>
            ) : (
              <div className="space-y-2">
                {outcomes.map(lo => (
                  <button
                    key={lo.id}
                    onClick={() => toggleLO(lo.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all duration-300 ${
                      linkedLOs.includes(lo.id)
                        ? 'glass text-lite ring-1 ring-purple/30'
                        : 'text-dim hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className={`font-semibold ${linkedLOs.includes(lo.id) ? 'text-purple' : ''}`}>{lo.code}</span>
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
