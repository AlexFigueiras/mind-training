import { useState } from 'react'
import Module1 from './modules/m1-physio/Module1'
import Module2 from './modules/m2-decision/Module2'
import Module3 from './modules/m3-systemic/Module3'
import Module4 from './modules/m4-cognitive/Module4'
import Module5 from './modules/m5-gamification/Module5'
import { useStore } from './store/useStore'

const MODULES = [
  {
    id: 1,
    short: 'M1',
    label: 'Regulação Fisiológica',
    sub: 'Base do Sistema',
    desc: 'Teoria Polivagal · Respiração · Tônus Vagal',
    color: '#10b981',
    icon: '◎',
  },
  {
    id: 2,
    short: 'M2',
    label: 'Decisão Estratégica',
    sub: 'Elite Framework',
    desc: 'Bezos · Munger · Primeiros Princípios',
    color: '#3b82f6',
    icon: '◈',
  },
  {
    id: 3,
    short: 'M3',
    label: 'Pensamento Sistêmico',
    sub: 'Motor de Loops',
    desc: 'Iceberg · BOT Graphs · Connection Circles',
    color: '#06b6d4',
    icon: '◐',
  },
  {
    id: 4,
    short: 'M4',
    label: 'Neuroplasticidade',
    sub: 'Treinamento Cognitivo',
    desc: 'N-Back · Huberman · aMCC Sprints',
    color: '#8b5cf6',
    icon: '◆',
  },
  {
    id: 5,
    short: 'M5',
    label: 'Gamificação Ética',
    sub: 'Motor de Hábitos',
    desc: 'Fogg B=MAP · Streaks · Loot Tables',
    color: '#f59e0b',
    icon: '◇',
  },
]

function Header({ state }: { state: ReturnType<typeof useStore>['state'] }) {
  const vagalColors = { ventral: '#10b981', sympathetic: '#f59e0b', dorsal: '#ef4444' }
  const vagalLabels = { ventral: 'Ventral', sympathetic: 'Simpático', dorsal: 'Dorsal' }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 sticky top-0 z-10"
      style={{ background: 'rgba(7,11,20,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-slate-400">SINC</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: vagalColors[state.vagalState] }}
          />
          <span className="text-xs text-slate-500">{vagalLabels[state.vagalState]}</span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-xs text-amber-400 font-bold">{state.consecutiveCycles}🔥</span>
        <div className="h-4 w-px bg-slate-700" />
        <div className="px-2 py-0.5 rounded-lg bg-blue-900/30 border border-blue-800/30">
          <span className="text-xs font-bold text-blue-300">{state.totalPoints.toLocaleString()} pts</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeModule, setActiveModule] = useState<number | null>(null)
  const { state } = useStore()

  const active = MODULES.find(m => m.id === activeModule)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070b14' }}>
      <Header state={state} />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {!activeModule ? (
          <div className="space-y-6 animate-fadeInUp">
            {/* Hero */}
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Sistema Integrado de<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Neuroengenharia Cognitiva
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                Replica os modelos de pensamento de executivos de elite. Base fisiológica primeiro.
              </p>
            </div>

            {/* Architecture diagram */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 text-center">Arquitetura</p>
              <div className="space-y-1.5">
                {[...MODULES].reverse().map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-8 text-right text-xs font-mono text-slate-700">M{m.id}</div>
                    <div
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium"
                      style={{ background: m.color + '12', color: m.color, border: `1px solid ${m.color}20` }}
                    >
                      {m.label}
                    </div>
                    {i < MODULES.length - 1 && <span className="text-slate-700 text-xs">↑</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Module list */}
            <div className="grid grid-cols-1 gap-3">
              {MODULES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 transition-all text-left group"
                >
                  <span className="text-2xl" style={{ color: m.color }}>{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{m.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{m.desc}</p>
                  </div>
                  <span className="text-slate-700 group-hover:text-slate-500 transition-colors text-xs">→</span>
                </button>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30 text-center">
                <p className="text-lg font-bold text-white">{state.completedToday.length}</p>
                <p className="text-xs text-slate-600">Atividades hoje</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30 text-center">
                <p className="text-lg font-bold text-purple-400">{state.nbackLevel}-Back</p>
                <p className="text-xs text-slate-600">Nível cognitivo</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeInUp">
            {/* Module header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveModule(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700 hover:border-slate-600 transition-colors text-slate-400 hover:text-white"
              >
                ←
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ color: active?.color }} className="text-lg">{active?.icon}</span>
                  <h2 className="text-sm font-bold text-white">{active?.label}</h2>
                </div>
                <p className="text-xs text-slate-500 ml-6">{active?.desc}</p>
              </div>
            </div>

            {/* Content */}
            {activeModule === 1 && <Module1 />}
            {activeModule === 2 && <Module2 />}
            {activeModule === 3 && <Module3 />}
            {activeModule === 4 && <Module4 />}
            {activeModule === 5 && <Module5 />}

            {/* Bottom nav */}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-700 mb-3">Outros módulos</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {MODULES.filter(m => m.id !== activeModule).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all hover:opacity-80"
                    style={{ borderColor: m.color + '30', color: m.color, background: m.color + '0a' }}
                  >
                    {m.short} · {m.sub}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
