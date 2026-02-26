import { useState } from 'react'
import { Save, X, Link2, Check } from 'lucide-react'
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
    setLinkedLOs(prev => prev.includes(loId) ? prev.filter(id => id !== loId) : [...prev, loId])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.03] shrink-0">
        <input type="text" placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-lg font-semibold bg-transparent outline-none text-lite placeholder:text-mute" autoFocus />
        <button onClick={() => setShowLOPanel(!showLOPanel)}
          className={`btn-ghost !text-[11px] ${showLOPanel ? '!border-purple/20 !text-purplehi' : ''}`}>
          <Link2 size={13} />
          {linkedLOs.length > 0 ? `${linkedLOs.length} linked` : 'Link LOs'}
        </button>
        <button onClick={handleSave} className="btn-primary"><Save size={13} /> Save</button>
        <button onClick={onCancel} className="p-2 text-mute hover:text-lite rounded-lg transition-colors"><X size={16} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 p-6">
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (Markdown supported)"
            className="w-full h-full bg-transparent outline-none text-dim placeholder:text-mute resize-none text-sm leading-relaxed font-mono" />
        </div>

        {/* LO panel */}
        {showLOPanel && (
          <div className="w-[260px] border-l border-white/[0.03] p-3 overflow-y-auto bg-dark2/40 anim-fade-in">
            <p className="text-[10px] font-semibold text-mute uppercase tracking-wider mb-2 px-1">Link Outcomes</p>
            {outcomes.length === 0 ? (
              <p className="text-[11px] text-mute px-1">No outcomes yet.</p>
            ) : (
              <div className="space-y-1">
                {outcomes.map(lo => {
                  const linked = linkedLOs.includes(lo.id)
                  return (
                    <button key={lo.id} onClick={() => toggleLO(lo.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-[12px] transition-all duration-200 flex items-start gap-2 ${
                        linked ? 'bg-purple/[0.08] border border-purple/15' : 'hover:bg-white/[0.025] border border-transparent'
                      }`}>
                      <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        linked ? 'bg-purple text-white' : 'border border-edge'
                      }`}>
                        {linked && <Check size={10} />}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-semibold ${linked ? 'text-purplehi' : 'text-dim'}`}>{lo.code}</span>
                        <p className="text-mute text-[10px] line-clamp-2 mt-0.5">{lo.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
