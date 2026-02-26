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
    <div className="h-full overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-amber/[0.03] blur-[100px] animate-float1" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-pink/[0.03] blur-[80px] animate-float2" />
      </div>

      <div className="relative z-10 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber to-pink flex items-center justify-center shadow-lg shadow-amber/20">
            <BarChart3 size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-lite">Dashboard</h2>
            <p className="text-[10px] text-mute">Track your study progress and coverage</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Notes', value: stats.totalNotes, icon: FileText, gradient: 'from-purple to-cyan' },
            { label: 'LOs', value: outcomes.length, icon: Target, gradient: 'from-cyan to-green' },
            { label: 'Coverage', value: `${stats.coveragePercent}%`, icon: TrendingUp, gradient: 'from-green to-cyan' },
            { label: 'Gaps', value: stats.uncovered, icon: AlertTriangle, gradient: 'from-red to-amber' },
          ].map((stat, i) => (
            <div key={stat.label} className="glass rounded-2xl p-5 animate-slide-up group hover:bg-white/[0.03] transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md shadow-purple/10 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={14} className="text-white" />
                </div>
                <span className="text-[9px] text-mute uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-b from-lite to-dim bg-clip-text text-transparent">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Coverage Bar + Breakdown side by side */}
        <div className="flex gap-5">
          {/* Coverage Bar */}
          <div className="flex-1 glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-[9px] font-semibold text-mute mb-4 uppercase tracking-[0.2em]">Overall Coverage</p>
            {outcomes.length > 0 ? (
              <>
                <div className="w-full h-3 bg-surface rounded-full overflow-hidden flex">
                  <div className="bg-gradient-to-r from-green to-cyan h-full transition-all duration-700"
                    style={{ width: `${(stats.covered / outcomes.length) * 100}%` }} />
                  <div className="bg-amber h-full transition-all duration-700"
                    style={{ width: `${(stats.partial / outcomes.length) * 100}%` }} />
                  <div className="bg-red/40 h-full transition-all duration-700"
                    style={{ width: `${(stats.uncovered / outcomes.length) * 100}%` }} />
                </div>
                <div className="flex items-center gap-5 mt-3">
                  {[
                    { label: 'Covered', count: stats.covered, color: 'bg-green', glow: 'shadow-green/40' },
                    { label: 'Partial', count: stats.partial, color: 'bg-amber', glow: 'shadow-amber/40' },
                    { label: 'Uncovered', count: stats.uncovered, color: 'bg-red', glow: 'shadow-red/40' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm ${item.glow}`} />
                      <span className="text-[11px] text-dim">{item.label} ({item.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-mute">Add learning outcomes to see coverage</p>
            )}

            {/* Alerts inline */}
            {stats.uncovered > 0 && (
              <div className="mt-5 p-4 bg-red/[0.05] rounded-xl border border-red/10">
                <p className="text-[9px] font-semibold text-red mb-2 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <AlertTriangle size={11} /> Attention Needed
                </p>
                <div className="space-y-1">
                  {coverage.filter(c => c.status === 'uncovered').map(item => (
                    <p key={item.loId} className="text-xs text-dim">
                      <span className="text-red font-semibold">{item.loCode}</span>
                      <span className="text-mute"> — </span>{item.loDescription}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {stats.partial > 0 && (
              <div className="mt-3 p-4 bg-amber/[0.05] rounded-xl border border-amber/10">
                <p className="text-[9px] font-semibold text-amber mb-2 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <AlertTriangle size={11} /> Needs More Coverage
                </p>
                <div className="space-y-1">
                  {coverage.filter(c => c.status === 'partial').map(item => (
                    <p key={item.loId} className="text-xs text-dim">
                      <span className="text-amber font-semibold">{item.loCode}</span>
                      <span className="text-mute"> — </span>{item.loDescription}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LO Breakdown */}
          <div className="w-[380px] shrink-0 glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <p className="text-[9px] font-semibold text-mute mb-3 uppercase tracking-[0.2em]">LO Breakdown</p>
            {coverage.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-surface mx-auto flex items-center justify-center mb-3">
                  <Target size={20} className="text-mute opacity-30" />
                </div>
                <p className="text-xs text-mute">Add LOs and link notes</p>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
                {coverage.map((item, i) => (
                  <div key={item.loId}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${0.3 + i * 0.03}s` }}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'covered' ? 'bg-green shadow-sm shadow-green/40' :
                      item.status === 'partial' ? 'bg-amber shadow-sm shadow-amber/40' : 'bg-red shadow-sm shadow-red/40'
                    }`} />
                    <span className="text-xs font-bold bg-gradient-to-r from-purple to-cyan bg-clip-text text-transparent w-14 shrink-0">{item.loCode}</span>
                    <p className="text-xs text-dim flex-1 truncate">{item.loDescription}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === 'covered' ? (
                        <CheckCircle2 size={12} className="text-green" />
                      ) : (
                        <AlertTriangle size={12} className={item.status === 'partial' ? 'text-amber' : 'text-red'} />
                      )}
                      <span className="text-[10px] text-mute tabular-nums font-mono">{item.noteCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
