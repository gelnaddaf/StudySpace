import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, FileText, Target, TrendingUp, Sparkles, Link2, Brain, Loader2 } from 'lucide-react'
import { useNotes, useLearningOutcomes } from '../store/useStore'
import * as api from '../lib/api'
import type { CoverageStatus, AISuggestion } from '../types'

export default function Dashboard() {
  const { notes, updateNote } = useNotes()
  const { outcomes } = useLearningOutcomes()
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [gapResult, setGapResult] = useState<{ summary: string; gaps: { loCode: string; suggestion: string }[]; strengths: string[] } | null>(null)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])

  const runGapAnalysis = async () => {
    setAiLoading('gap')
    try { const r = await api.aiGapAnalysis(); setGapResult(r) } catch { setGapResult({ summary: 'AI not available. Deploy to Cloudflare to use Workers AI.', gaps: [], strengths: [] }) }
    setAiLoading(null)
  }

  const runSuggestLinks = async () => {
    setAiLoading('links')
    try { const r = await api.aiSuggestLinks(); setSuggestions(r) } catch { setSuggestions([]) }
    setAiLoading(null)
  }

  const acceptSuggestion = async (s: AISuggestion) => {
    const note = notes.find(n => n.id === s.noteId)
    if (!note) return
    const updated = [...new Set([...note.linkedLOs, s.loId])]
    await updateNote(note.id, { linkedLOs: updated })
    setSuggestions(prev => prev.filter(p => !(p.noteId === s.noteId && p.loId === s.loId)))
  }

  const coverage = useMemo<CoverageStatus[]>(() => {
    return outcomes.map(lo => {
      const noteCount = notes.filter(n => n.linkedLOs.includes(lo.id)).length
      let status: CoverageStatus['status'] = 'uncovered'
      if (noteCount >= 2) status = 'covered'
      else if (noteCount === 1) status = 'partial'
      return { loId: lo.id, loCode: lo.code, loDescription: lo.description, noteCount, status }
    })
  }, [notes, outcomes])

  const stats = useMemo(() => {
    const covered = coverage.filter(c => c.status === 'covered').length
    const partial = coverage.filter(c => c.status === 'partial').length
    const uncovered = coverage.filter(c => c.status === 'uncovered').length
    const totalNotes = notes.length
    const coveragePercent = outcomes.length > 0 ? Math.round((covered / outcomes.length) * 100) : 0
    return { covered, partial, uncovered, totalNotes, coveragePercent }
  }, [coverage, notes, outcomes])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-lite">Dashboard</h2>
          <p className="text-[11px] text-mute">Study progress and coverage overview</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Notes', value: stats.totalNotes, icon: FileText, color: 'text-purple' },
            { label: 'Outcomes', value: outcomes.length, icon: Target, color: 'text-cyan' },
            { label: 'Coverage', value: `${stats.coveragePercent}%`, icon: TrendingUp, color: 'text-green' },
            { label: 'Gaps', value: stats.uncovered, icon: AlertTriangle, color: 'text-red' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 anim-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-mute font-medium uppercase tracking-wider">{stat.label}</span>
                <stat.icon size={14} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-lite">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main content: Coverage + Breakdown */}
        <div className="flex gap-4">
          {/* Coverage + Alerts */}
          <div className="flex-1 space-y-4">
            <div className="card p-5 anim-fade-in">
              <h3 className="text-sm font-bold text-lite mb-4">Coverage Overview</h3>
              {outcomes.length > 0 ? (
                <>
                  <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden flex">
                    <div className="bg-green h-full transition-all duration-700" style={{ width: `${(stats.covered / outcomes.length) * 100}%` }} />
                    <div className="bg-amber h-full transition-all duration-700" style={{ width: `${(stats.partial / outcomes.length) * 100}%` }} />
                    <div className="bg-edge h-full transition-all duration-700" style={{ width: `${(stats.uncovered / outcomes.length) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-5 mt-3">
                    {[
                      { label: 'Covered', count: stats.covered, color: 'bg-green' },
                      { label: 'Partial', count: stats.partial, color: 'bg-amber' },
                      { label: 'Uncovered', count: stats.uncovered, color: 'bg-edge' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-[11px] text-dim">{item.label} ({item.count})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-mute">Add learning outcomes to see coverage</p>
              )}
            </div>

            {/* Alerts */}
            {stats.uncovered > 0 && (
              <div className="card !border-red/10 p-4 anim-fade-in">
                <p className="text-[11px] font-semibold text-red mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> {stats.uncovered} uncovered outcome{stats.uncovered !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {coverage.filter(c => c.status === 'uncovered').map(item => (
                    <p key={item.loId} className="text-[12px] text-dim">
                      <span className="text-red font-semibold">{item.loCode}</span> — {item.loDescription}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {stats.partial > 0 && (
              <div className="card !border-amber/10 p-4 anim-fade-in">
                <p className="text-[11px] font-semibold text-amber mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> {stats.partial} partially covered
                </p>
                <div className="space-y-1">
                  {coverage.filter(c => c.status === 'partial').map(item => (
                    <p key={item.loId} className="text-[12px] text-dim">
                      <span className="text-amber font-semibold">{item.loCode}</span> — {item.loDescription}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown list */}
          <div className="w-[380px] shrink-0 card p-5 anim-fade-in">
            <h3 className="text-sm font-bold text-lite mb-3">Outcome Breakdown</h3>
            {coverage.length === 0 ? (
              <div className="text-center py-10">
                <Target size={20} className="mx-auto text-mute/30 mb-2" />
                <p className="text-[11px] text-mute">Add LOs and link notes</p>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
                {coverage.map(item => (
                  <div key={item.loId} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'covered' ? 'bg-green' : item.status === 'partial' ? 'bg-amber' : 'bg-edge'
                    }`} />
                    <span className="text-[12px] font-bold text-purplehi w-14 shrink-0">{item.loCode}</span>
                    <p className="text-[11px] text-dim flex-1 truncate">{item.loDescription}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === 'covered' ? (
                        <CheckCircle2 size={12} className="text-green" />
                      ) : (
                        <span className="text-[10px] text-mute font-mono">{item.noteCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Section */}
        <div className="flex gap-4">
          {/* AI Gap Analysis */}
          <div className="flex-1 card p-5 anim-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={15} className="text-purple" />
                <h3 className="text-sm font-bold text-lite">AI Gap Analysis</h3>
              </div>
              <button onClick={runGapAnalysis} disabled={aiLoading === 'gap'}
                className="btn-primary !text-[11px] !py-1.5">
                {aiLoading === 'gap' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading === 'gap' ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {gapResult ? (
              <div className="space-y-3 anim-fade-in">
                <p className="text-[12px] text-dim leading-relaxed">{gapResult.summary}</p>
                {gapResult.gaps.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-mute uppercase tracking-wider">Gaps</p>
                    {gapResult.gaps.map((g, i) => (
                      <div key={i} className="flex gap-2 text-[12px]">
                        <span className="text-red font-semibold shrink-0">{g.loCode}</span>
                        <span className="text-dim">{g.suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
                {gapResult.strengths.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-mute uppercase tracking-wider mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gapResult.strengths.map(s => <span key={s} className="badge">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-mute">Run AI analysis to get personalized study recommendations. Requires Cloudflare Workers AI (available after deployment).</p>
            )}
          </div>

          {/* AI Link Suggestions */}
          <div className="w-[380px] shrink-0 card p-5 anim-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 size={15} className="text-cyan" />
                <h3 className="text-sm font-bold text-lite">AI Link Suggestions</h3>
              </div>
              <button onClick={runSuggestLinks} disabled={aiLoading === 'links'}
                className="btn-primary !text-[11px] !py-1.5">
                {aiLoading === 'links' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading === 'links' ? 'Thinking...' : 'Suggest'}
              </button>
            </div>
            {suggestions.length > 0 ? (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {suggestions.map((s, i) => (
                  <div key={i} className="card !rounded-lg p-3 anim-fade-in">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-lite truncate">{s.noteTitle}</span>
                      <span className="badge !text-[9px]">{s.loCode}</span>
                    </div>
                    <p className="text-[10px] text-mute mb-2">{s.reason}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-cyan rounded-full" style={{ width: `${s.confidence * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-mute">{Math.round(s.confidence * 100)}%</span>
                      </div>
                      <button onClick={() => acceptSuggestion(s)}
                        className="text-[10px] font-semibold text-cyan hover:text-white transition-colors">
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-mute">AI will suggest note-to-outcome links you may have missed. Requires Workers AI.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
