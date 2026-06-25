import { useState } from 'react'
import Module1 from './modules/m1-physio/Module1'
import Module2 from './modules/m2-decision/Module2'
import Module3 from './modules/m3-systemic/Module3'
import Module4 from './modules/m4-cognitive/Module4'
import Module5 from './modules/m5-gamification/Module5'
import { useStore } from './store/useStore'

type View = 'home' | 1 | 2 | 3 | 4 | 5

// ─── Module metadata ──────────────────────────────────────────────────────────
const MODULES: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Regulação Fisiológica', desc: 'Teoria Polivagal · Respiração', color: '#10b981' },
  2: { label: 'Decisão Estratégica',   desc: 'Bezos · Munger · Primeiros Princípios', color: '#3b82f6' },
  3: { label: 'Pensamento Sistêmico',  desc: 'Iceberg · BOT Graphs · Loops', color: '#06b6d4' },
  4: { label: 'Neuroplasticidade',     desc: 'N-Back · Huberman · aMCC', color: '#8b5cf6' },
  5: { label: 'Gamificação Ética',     desc: 'Fogg B=MAP · Streaks · Loot', color: '#f59e0b' },
}

// ─── Bottom nav: 5 slots (center = home) ────────────────────────────────────────
const NAV: Array<{ view: View; label: string; icon: typeof TabPhysio; color: string }> = [
  { view: 1,      label: 'Base',    icon: TabPhysio, color: '#10b981' },
  { view: 2,      label: 'Decisão', icon: TabDecide, color: '#3b82f6' },
  { view: 'home', label: 'Início',  icon: TabHome,   color: '#8b5cf6' },
  { view: 4,      label: 'Neuro',   icon: TabNeuro,  color: '#a855f7' },
  { view: 5,      label: 'Hábitos', icon: TabGame,   color: '#f59e0b' },
]

// ─── Tab Icons (SVG inline) ────────────────────────────────────────────────────
function TabPhysio({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}
      stroke={active ? color : '#475569'} className="w-6 h-6 transition-all">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
    </svg>
  )
}
function TabDecide({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}
      stroke={active ? color : '#475569'} className="w-6 h-6 transition-all">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TabHome({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? color : 'none'}
      stroke={active ? color : '#475569'} strokeWidth={active ? 0 : 1.8} className="w-7 h-7 transition-all">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TabNeuro({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}
      stroke={active ? color : '#475569'} className="w-6 h-6 transition-all">
      <circle cx="9" cy="5" r="2.6" />
      <circle cx="15" cy="19" r="2.6" />
      <path d="M9 7.6C9 10 11 10.5 12 11.5s1.5 3 1.5 5" strokeLinecap="round" />
    </svg>
  )
}
function TabGame({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? color : 'none'} strokeWidth={active ? 0 : 1.8}
      stroke={active ? color : '#475569'} className="w-6 h-6 transition-all">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const VAGAL_COLOR = { ventral: '#10b981', sympathetic: '#f59e0b', dorsal: '#ef4444' }
const VAGAL_LABEL = { ventral: 'Ventral', sympathetic: 'Simpático', dorsal: 'Dorsal' }

// ─── Home / Dashboard ─────────────────────────────────────────────────────────
function HomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useStore()
  const vagalColor = VAGAL_COLOR[state.vagalState]
  const score = Math.round(100 * (1 + 0.15 * state.consecutiveCycles) * Math.exp(-0.08 * state.failureIndex))
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6 pb-4">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.12) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 capitalize">{today}</p>
        <h1 className="text-[26px] font-bold text-white leading-[1.15]">
          Treine seu<br />
          <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            cérebro de elite.
          </span>
        </h1>

        <div className="flex gap-2.5 mt-5">
          <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <p className="text-xl font-bold text-white">{state.totalPoints.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pontos</p>
          </div>
          <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <p className="text-xl font-bold text-amber-400">{state.consecutiveCycles}<span className="text-sm ml-0.5">🔥</span></p>
            <p className="text-[11px] text-slate-400 mt-0.5">Streak</p>
          </div>
          <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <p className="text-xl font-bold flex items-center gap-1" style={{ color: vagalColor }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: vagalColor }} />
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{VAGAL_LABEL[state.vagalState]}</p>
          </div>
        </div>
      </div>

      {/* Daily progress */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Progresso hoje</p>
          <p className="text-xs text-slate-500">{state.completedToday.length} / 6</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (state.completedToday.length / 6) * 100)}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
        </div>
      </div>

      {/* Module cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Módulos</p>
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map(id => {
            const m = MODULES[id]
            return (
              <button
                key={id}
                onClick={() => onNavigate(id as View)}
                className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{ background: `${m.color}14`, border: `1px solid ${m.color}33` }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}22` }}>
                  <span className="text-base font-bold" style={{ color: m.color }}>{id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white leading-snug">{m.label}</p>
                  <p className="text-sm text-slate-400 mt-1">{m.desc}</p>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke={m.color} strokeWidth="2.2" opacity="0.6">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      {/* Score formula */}
      <div className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)' }}>
        <p className="text-xs text-slate-400 mb-1">Pontos por ciclo (fórmula SINC)</p>
        <p className="text-3xl font-bold text-purple-300">{score}</p>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">
          Pₜ = 100 × (1 + 0.15·{state.consecutiveCycles}) · e^(−0.08·{state.failureIndex})
        </p>
      </div>
    </div>
  )
}

// ─── Module screen wrapper ────────────────────────────────────────────────────
function ModuleView({ id, onBack, children }: { id: number; onBack: () => void; children: React.ReactNode }) {
  const m = MODULES[id]
  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#94a3b8" strokeWidth="2.2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: `${m.color}1e`, border: `1px solid ${m.color}33` }}>
          <span className="text-sm font-bold" style={{ color: m.color }}>{id}</span>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest">Módulo {id}</p>
          <h2 className="text-lg font-bold text-white leading-tight">{m.label}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function BottomNav({ active, onChange }: { active: View; onChange: (v: View) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(7,11,20,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-lg mx-auto">
        {NAV.map(t => {
          const isActive = active === t.view
          const isHome = t.view === 'home'
          const Icon = t.icon
          return (
            <button key={String(t.view)} onClick={() => onChange(t.view)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all active:scale-95">
              {isHome
                ? <div className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-6 shadow-lg"
                    style={{ background: isActive ? '#8b5cf6' : '#312e81', border: '3px solid #070b14' }}>
                    <Icon active={isActive} color="#fff" />
                  </div>
                : <Icon active={isActive} color={t.color} />}
              <span className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? (isHome ? '#a78bfa' : t.color) : '#475569' }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StatusPill() {
  const { state } = useStore()
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: VAGAL_COLOR[state.vagalState] }} />
        <span className="text-xs text-slate-600">{VAGAL_LABEL[state.vagalState]}</span>
      </div>
      <span className="text-xs text-amber-500 font-bold">{state.consecutiveCycles}🔥</span>
    </div>
  )
}

// ─── App root ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>('home')

  const renderContent = () => {
    if (view === 'home') return <HomeView onNavigate={setView} />
    const back = () => setView('home')
    switch (view) {
      case 1: return <ModuleView id={1} onBack={back}><Module1 /></ModuleView>
      case 2: return <ModuleView id={2} onBack={back}><Module2 /></ModuleView>
      case 3: return <ModuleView id={3} onBack={back}><Module3 /></ModuleView>
      case 4: return <ModuleView id={4} onBack={back}><Module4 /></ModuleView>
      case 5: return <ModuleView id={5} onBack={back}><Module5 /></ModuleView>
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      {view !== 'home' && (
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
          style={{ background: 'rgba(7,11,20,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-xs font-bold tracking-[0.2em] text-slate-600">SINC</span>
          <StatusPill />
        </div>
      )}

      <main className="max-w-lg mx-auto px-5 pt-5" style={{ paddingBottom: '100px' }}>
        <div key={String(view)} className="animate-in">
          {renderContent()}
        </div>
      </main>

      <BottomNav active={view} onChange={setView} />
    </div>
  )
}
