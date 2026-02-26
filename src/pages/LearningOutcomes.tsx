import { useState, useRef } from 'react'
import { Plus, Upload, Trash2, Search, Target, FileText } from 'lucide-react'
import { useLearningOutcomes, useNotes } from '../store/useStore'

export default function LearningOutcomes() {
  const { outcomes, addLO, deleteLO, importLOs } = useLearningOutcomes()
  const { notes } = useNotes()
  const [showAddForm, setShowAddForm] = useState(false)
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredOutcomes = outcomes.filter(lo =>
    lo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lo.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!code.trim() || !description.trim()) return
    addLO(code.trim(), description.trim(), subjectName.trim())
    setCode('')
    setDescription('')
    setSubjectName('')
    setShowAddForm(false)
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const items: { code: string; description: string; subjectName: string }[] = []
      const startIdx = lines[0]?.toLowerCase().includes('code') ? 1 : 0
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''))
        if (parts.length >= 2) {
          items.push({ code: parts[0], description: parts[1], subjectName: parts[2] || '' })
        }
      }
      if (items.length > 0) importLOs(items)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getLinkedNotesCount = (loId: string) => {
    return notes.filter(n => n.linkedLOs.includes(loId)).length
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-cyan/[0.03] blur-[90px] animate-float1" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 glass-strong border-b border-white/[0.04] z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-green flex items-center justify-center shadow-lg shadow-cyan/20">
              <Target size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-lite">Learning Outcomes</h2>
              <p className="text-[10px] text-mute">{outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''} tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCSVUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 glass text-dim hover:text-lite text-sm font-medium rounded-xl transition-all duration-200 hover:bg-white/[0.04]">
              <Upload size={14} /> Import CSV
            </button>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan to-green text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan/20 hover:shadow-cyan/40 hover:scale-[1.02]">
              <Plus size={15} /> Add LO
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input type="text" placeholder="Search learning outcomes..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:ring-1 focus:ring-cyan/30 transition-all" />
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-6 py-5 glass-strong border-b border-white/[0.04] z-10 animate-slide-up">
          <p className="text-[9px] font-semibold text-mute mb-3 uppercase tracking-[0.2em]">Add Learning Outcome</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input type="text" placeholder="Code (e.g. LO1.1)" value={code} onChange={(e) => setCode(e.target.value)}
              className="px-3 py-2.5 glass rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:ring-1 focus:ring-cyan/30" />
            <input type="text" placeholder="Subject name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)}
              className="px-3 py-2.5 glass rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:ring-1 focus:ring-cyan/30" />
            <button onClick={handleAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan to-green text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]">
              Add
            </button>
          </div>
          <textarea placeholder="Description of the learning outcome..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2.5 glass rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:ring-1 focus:ring-cyan/30 resize-none" />
          <p className="text-[10px] text-mute mt-2">CSV format: code, description, subject_name (one per line)</p>
        </div>
      )}

      {/* Outcomes List */}
      <div className="flex-1 overflow-y-auto p-6 z-10">
        {filteredOutcomes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface mx-auto flex items-center justify-center mb-4">
              <Target size={28} className="text-mute opacity-30" />
            </div>
            <p className="text-sm text-dim">No learning outcomes yet</p>
            <p className="text-[10px] text-mute mt-1">Add them manually or import from CSV</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl">
            {filteredOutcomes.map((lo, i) => {
              const noteCount = getLinkedNotesCount(lo.id)
              const statusColor = noteCount >= 2 ? 'bg-green' : noteCount === 1 ? 'bg-amber' : 'bg-red'
              const statusGlow = noteCount >= 2 ? 'shadow-green/40' : noteCount === 1 ? 'shadow-amber/40' : 'shadow-red/40'
              return (
                <div key={lo.id}
                  className="group flex items-start gap-4 p-4 glass rounded-xl hover:bg-white/[0.03] transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${statusColor} shadow-md ${statusGlow}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold bg-gradient-to-r from-purple to-cyan bg-clip-text text-transparent">{lo.code}</span>
                      {lo.subjectName && (
                        <span className="text-[10px] px-2 py-0.5 glass text-mute rounded-md">{lo.subjectName}</span>
                      )}
                    </div>
                    <p className="text-sm text-dim leading-relaxed">{lo.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-mute">
                      <FileText size={11} />
                      {noteCount} linked note{noteCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button onClick={() => deleteLO(lo.id)}
                    className="p-2 text-mute hover:text-red hover:bg-red/10 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
