import { useMemo } from 'react'
import { BarChart3, AlertTriangle, CheckCircle2, FileText, Target, TrendingUp } from 'lucide-react'
import { useNotes, useLearningOutcomes } from '../store/useStore'
import type { CoverageStatus } from '../types'

export default function Dashboard() {
  const { notes } = useNotes()
  const { outcomes } = useLearningOutcomes()

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
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-lite">Dashboard</h2>
          <p className="text-xs text-mute mt-1">Track your study progress and coverage</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-edge rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple/15 flex items-center justify-center">
                <FileText size={14} className="text-purple" />
              </div>
              <span className="text-[10px] text-mute uppercase tracking-widest">Notes</span>
            </div>
            <p className="text-3xl font-bold text-lite">{stats.totalNotes}</p>
          </div>
          <div className="bg-card border border-edge rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple/15 flex items-center justify-center">
                <Target size={14} className="text-purple" />
              </div>
              <span className="text-[10px] text-mute uppercase tracking-widest">LOs</span>
            </div>
            <p className="text-3xl font-bold text-lite">{outcomes.length}</p>
          </div>
          <div className="bg-card border border-edge rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-green/15 flex items-center justify-center">
                <TrendingUp size={14} className="text-green" />
              </div>
              <span className="text-[10px] text-mute uppercase tracking-widest">Coverage</span>
            </div>
            <p className="text-3xl font-bold text-lite">{stats.coveragePercent}%</p>
          </div>
          <div className="bg-card border border-edge rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red/15 flex items-center justify-center">
                <AlertTriangle size={14} className="text-red" />
              </div>
              <span className="text-[10px] text-mute uppercase tracking-widest">Gaps</span>
            </div>
            <p className="text-3xl font-bold text-lite">{stats.uncovered}</p>
          </div>
        </div>

        {/* Coverage Bar */}
        {outcomes.length > 0 && (
          <div className="bg-card border border-edge rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-dim mb-4 flex items-center gap-2 uppercase tracking-widest">
              <BarChart3 size={14} />
              Overall Coverage
            </h3>
            <div className="w-full h-3 bg-surface rounded-full overflow-hidden flex">
              <div
                className="bg-green h-full transition-all duration-500"
                style={{ width: `${outcomes.length > 0 ? (stats.covered / outcomes.length) * 100 : 0}%` }}
              />
              <div
                className="bg-amber h-full transition-all duration-500"
                style={{ width: `${outcomes.length > 0 ? (stats.partial / outcomes.length) * 100 : 0}%` }}
              />
              <div
                className="bg-red/40 h-full transition-all duration-500"
                style={{ width: `${outcomes.length > 0 ? (stats.uncovered / outcomes.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green" />
                <span className="text-xs text-dim">Covered ({stats.covered})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber" />
                <span className="text-xs text-dim">Partial ({stats.partial})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red/50" />
                <span className="text-xs text-dim">Uncovered ({stats.uncovered})</span>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Breakdown */}
        <div className="bg-card border border-edge rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-dim mb-4 uppercase tracking-widest">LO Coverage Breakdown</h3>
          {coverage.length === 0 ? (
            <div className="text-center py-10">
              <Target size={40} className="mx-auto text-mute mb-3 opacity-30" />
              <p className="text-sm text-mute">Add learning outcomes and link notes to see coverage</p>
            </div>
          ) : (
            <div className="space-y-1">
              {coverage.map(item => (
                <div key={item.loId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface transition-all duration-200">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'covered' ? 'bg-green' :
                    item.status === 'partial' ? 'bg-amber' : 'bg-red'
                  }`} />
                  <span className="text-sm font-semibold text-purple w-16 shrink-0">{item.loCode}</span>
                  <p className="text-sm text-dim flex-1 truncate">{item.loDescription}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.status === 'covered' ? (
                      <CheckCircle2 size={13} className="text-green" />
                    ) : (
                      <AlertTriangle size={13} className={item.status === 'partial' ? 'text-amber' : 'text-red'} />
                    )}
                    <span className="text-[10px] text-mute tabular-nums">{item.noteCount} note{item.noteCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {stats.uncovered > 0 && (
          <div className="bg-red/5 border border-red/15 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-red mb-2 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle size={14} />
              Attention Needed
            </h3>
            <p className="text-sm text-dim mb-3">
              {stats.uncovered} learning outcome{stats.uncovered !== 1 ? 's' : ''} with no linked notes:
            </p>
            <div className="space-y-1.5">
              {coverage.filter(c => c.status === 'uncovered').map(item => (
                <div key={item.loId} className="text-sm text-dim">
                  <span className="text-red font-semibold">{item.loCode}</span>
                  <span className="text-mute"> — </span>{item.loDescription}
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.partial > 0 && (
          <div className="bg-amber/5 border border-amber/15 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-amber mb-2 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle size={14} />
              Needs More Coverage
            </h3>
            <p className="text-sm text-dim mb-3">
              These LOs only have 1 linked note — consider expanding:
            </p>
            <div className="space-y-1.5">
              {coverage.filter(c => c.status === 'partial').map(item => (
                <div key={item.loId} className="text-sm text-dim">
                  <span className="text-amber font-semibold">{item.loCode}</span>
                  <span className="text-mute"> — </span>{item.loDescription}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
