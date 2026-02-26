import { useState, useRef } from 'react'
import { Plus, Upload, Trash2, Search, Target, FileText, Sparkles, Loader2 } from 'lucide-react'
import { useLearningOutcomes, useNotes } from '../store/useStore'
import * as api from '../lib/api'
import type { AIExtractedLO } from '../types'

export default function LearningOutcomes() {
  const { outcomes, addLO, deleteLO, importLOs } = useLearningOutcomes()
  const { notes } = useNotes()
  const [showAddForm, setShowAddForm] = useState(false)
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAIExtract, setShowAIExtract] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiSubject, setAiSubject] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<AIExtractedLO[]>([])
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

  const runAIExtract = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    try {
      const results = await api.aiExtractLOs(aiText, aiSubject)
      setAiResults(results)
    } catch {
      setAiResults([])
    }
    setAiLoading(false)
  }

  const importAIResults = () => {
    if (aiResults.length === 0) return
    importLOs(aiResults.map(r => ({ code: r.code, description: r.description, subjectName: r.subjectName || aiSubject })))
    setAiResults([])
    setAiText('')
    setShowAIExtract(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.03] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-lite">Learning Outcomes</h2>
            <p className="text-[11px] text-mute">{outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCSVUpload} className="hidden" />
            <button onClick={() => setShowAIExtract(!showAIExtract)} className="btn-ghost"><Sparkles size={13} /> AI Extract</button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-ghost"><Upload size={13} /> CSV</button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary"><Plus size={14} /> Add</button>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input type="text" placeholder="Search outcomes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="input !pl-9 !py-2 !text-[12px]" />
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-6 py-4 border-b border-white/[0.03] bg-dark2/40 anim-fade-in">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input type="text" placeholder="Code (e.g. LO1.1)" value={code} onChange={(e) => setCode(e.target.value)} className="input" />
            <input type="text" placeholder="Subject name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="input" />
            <button onClick={handleAdd} className="btn-primary justify-center">Add Outcome</button>
          </div>
          <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="input resize-none" />
        </div>
      )}

      {/* AI Extract Panel */}
      {showAIExtract && (
        <div className="px-6 py-4 border-b border-white/[0.03] bg-dark2/40 anim-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-purple" />
            <span className="text-[12px] font-semibold text-lite">AI Extract Learning Outcomes</span>
          </div>
          <div className="flex gap-3 mb-3">
            <input type="text" placeholder="Subject name (optional)" value={aiSubject} onChange={(e) => setAiSubject(e.target.value)} className="input !w-48" />
            <button onClick={runAIExtract} disabled={aiLoading || !aiText.trim()} className="btn-primary">
              {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {aiLoading ? 'Extracting...' : 'Extract'}
            </button>
          </div>
          <textarea placeholder="Paste syllabus, course outline, or any text containing learning outcomes..." value={aiText}
            onChange={(e) => setAiText(e.target.value)} rows={4} className="input resize-none mb-3" />
          {aiResults.length > 0 && (
            <div className="space-y-2 anim-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-dim font-semibold">{aiResults.length} outcomes extracted</p>
                <button onClick={importAIResults} className="btn-primary !text-[11px] !py-1.5">Import All</button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {aiResults.map((r, i) => (
                  <div key={i} className="card !rounded-lg p-2.5 flex items-start gap-2">
                    <span className="text-[11px] font-bold text-purplehi shrink-0">{r.code}</span>
                    <p className="text-[11px] text-dim">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] text-mute mt-2">Powered by Cloudflare Workers AI. Available after deployment.</p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredOutcomes.length === 0 ? (
          <div className="text-center py-16">
            <Target size={24} className="mx-auto text-mute/30 mb-3" />
            <p className="text-[13px] text-dim">No learning outcomes yet</p>
            <p className="text-[11px] text-mute mt-1">Add manually or import from CSV</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-w-4xl">
            {filteredOutcomes.map(lo => {
              const noteCount = getLinkedNotesCount(lo.id)
              const dotColor = noteCount >= 2 ? 'bg-green' : noteCount === 1 ? 'bg-amber' : 'bg-edge'
              return (
                <div key={lo.id} className="group card !rounded-xl p-4 flex items-start gap-3 anim-fade-in">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-purplehi">{lo.code}</span>
                      {lo.subjectName && <span className="badge !text-[9px]">{lo.subjectName}</span>}
                    </div>
                    <p className="text-[12px] text-dim mt-1 leading-relaxed">{lo.description}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-mute">
                      <FileText size={10} /> {noteCount} note{noteCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button onClick={() => deleteLO(lo.id)}
                    className="p-1.5 text-mute hover:text-red hover:bg-red/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={13} />
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
