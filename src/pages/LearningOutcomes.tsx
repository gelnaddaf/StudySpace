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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-edge bg-dark2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-lite">Learning Outcomes</h2>
            <p className="text-xs text-mute mt-1">{outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCSVUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-edge text-dim hover:text-lite hover:bg-surface text-sm font-medium rounded-xl transition-all duration-200"
            >
              <Upload size={16} />
              Import CSV
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple hover:bg-purplehi text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm shadow-purple/20"
            >
              <Plus size={16} />
              Add LO
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="text"
            placeholder="Search learning outcomes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-dark border border-edge rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:border-purple/50 transition-colors"
          />
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-6 py-5 border-b border-edge bg-dark3">
          <h3 className="text-xs font-semibold text-dim mb-3 uppercase tracking-widest">Add Learning Outcome</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Code (e.g. LO1.1)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="px-3 py-2.5 bg-dark border border-edge rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:border-purple/50"
            />
            <input
              type="text"
              placeholder="Subject name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="px-3 py-2.5 bg-dark border border-edge rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:border-purple/50"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2.5 bg-purple hover:bg-purplehi text-white text-sm font-medium rounded-xl transition-all duration-200"
            >
              Add
            </button>
          </div>
          <textarea
            placeholder="Description of the learning outcome..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-dark border border-edge rounded-xl text-sm text-lite placeholder:text-mute outline-none focus:border-purple/50 resize-none"
          />
          <p className="text-[10px] text-mute mt-2">CSV format: code, description, subject_name (one per line)</p>
        </div>
      )}

      {/* Outcomes List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredOutcomes.length === 0 ? (
          <div className="text-center py-16">
            <Target size={48} className="mx-auto text-mute mb-3 opacity-30" />
            <p className="text-sm text-mute">No learning outcomes yet</p>
            <p className="text-xs text-mute mt-1">Add them manually or import from CSV</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl">
            {filteredOutcomes.map(lo => {
              const noteCount = getLinkedNotesCount(lo.id)
              return (
                <div
                  key={lo.id}
                  className="flex items-start gap-4 p-4 bg-card border border-edge rounded-xl hover:border-edgelit transition-all duration-200"
                >
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                    noteCount >= 2 ? 'bg-green' : noteCount === 1 ? 'bg-amber' : 'bg-red'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-purple">{lo.code}</span>
                      {lo.subjectName && (
                        <span className="text-[10px] px-2 py-0.5 bg-surface text-mute rounded-md">{lo.subjectName}</span>
                      )}
                    </div>
                    <p className="text-sm text-dim leading-relaxed">{lo.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-mute">
                      <FileText size={11} />
                      {noteCount} linked note{noteCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLO(lo.id)}
                    className="p-2 text-mute hover:text-red hover:bg-surface rounded-lg transition-colors shrink-0"
                  >
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
