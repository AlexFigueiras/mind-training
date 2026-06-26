import { useState } from 'react'
import { useStore, calcScore } from '../../store/useStore'

const LOOT_REWARDS = [
  { label: 'Insight Desbloqueado', desc: 'Você ativou plasticidade suficiente para absorver um novo modelo mental hoje.', rarity: 'comum', color: '#3b82f6' },
  { label: 'Estado de Fluxo', desc: 'Dopamina calibrada. Você está no pico do desempenho cognitivo agora.', rarity: 'incomum', color: '#10b981' },
  { label: 'Ciclo Composto', desc: 'Seu streak está gerando retornos exponenciais na arquitetura neural.', rarity: 'raro', color: '#8b5cf6' },
  { label: 'Rede Ventral Dominante', desc: 'PFC e ACC em sincronia máxima. Janela de decisão de elite ativa.', rarity: 'épico', color: '#f59e0b' },
  { label: 'Modo Musk/Bezos', desc: 'Convergência de todos os módulos. Estado de pensamento sistêmico de elite ativado.', rarity: 'lendário', color: '#ef4444' },
]

function getLoot() {
  const rand = Math.random()
  if (rand < 0.40) return LOOT_REWARDS[0]
  if (rand < 0.65) return LOOT_REWARDS[1]
  if (rand < 0.82) return LOOT_REWARDS[2]
  if (rand < 0.94) return LOOT_REWARDS[3]
  return LOOT_REWARDS[4]
}

const ALPHA = 0.15
const BETA = 0.08
const P_BASE = 100

function LootTable({ onClaim }: { onClaim: () => void }) {
  const [loot] = useState(getLoot)
  return (
    <div className="animate-fadeInUp space-y-4">
      <div className="p-5 rounded-2xl border text-center"
        style={{ background: loot.color + '12', borderColor: loot.color + '40' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: loot.color }}>{loot.rarity}</p>
        <p className="text-xl font-bold text-white mb-2">{loot.label}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{loot.desc}</p>
      </div>
      <button onClick={onClaim}
        className="w-full py-4 rounded-2xl text-base font-semibold transition-colors"
        style={{ background: loot.color + '25', color: loot.color, border: `1px solid ${loot.color}50` }}>
        Reivindicar Recompensa
      </button>
    </div>
  )
}

function RespawnProtocol({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-4 animate-fadeInUp">
      <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
        <p className="text-base font-bold text-white mb-2">Respawn Protocol</p>
        <p className="text-sm text-slate-400 leading-relaxed">
          A quebra de sequência não é falha — é <span className="text-white">dado frio de estratégia</span>. Seu sistema nervoso aprendeu o que não funciona.
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Diagnóstico rápido</p>
        {['Carga cognitiva excessiva?', 'Barreira de fricção muito alta?', 'Motivação intrínseca fraca?', 'Contexto ambiental desfavorável?'].map((q, i) => (
          <label key={i} className="flex items-center gap-3 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors">
            <input type="checkbox" className="accent-blue-500 w-4 h-4" />
            <span className="text-sm text-slate-300">{q}</span>
          </label>
        ))}
      </div>
      <button onClick={onReset}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-base font-bold transition-colors">
        ↺ Recomeço Tático Imediato
      </button>
    </div>
  )
}

export default function Module5() {
  const { state, recordFailure } = useStore()
  const [showLoot, setShowLoot] = useState(false)
  const [showRespawn, setShowRespawn] = useState(false)
  const [lootClaimed, setLootClaimed] = useState(false)
  const [showFormula, setShowFormula] = useState(false)

  const totalActivities = 6
  const completedToday = state.completedToday.length
  const progressPct = Math.min((completedToday / totalActivities) * 100, 100)
  const pts = calcScore(state)

  return (
    <div className="space-y-5">

      {/* Score tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: state.totalPoints.toLocaleString(), label: 'Pontos', color: '#e2e8f0' },
          { value: `${state.consecutiveCycles}🔥`, label: 'Streak', color: '#60a5fa' },
          { value: `+${pts}`, label: 'Pts/Ciclo', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border border-slate-700/50 bg-slate-900/50 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Progress */}
      <div className="p-5 rounded-2xl border border-slate-700/50 bg-slate-900/30">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-slate-300">Progresso do dia</p>
          <p className="text-sm font-bold text-slate-400">{completedToday}/{totalActivities}</p>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: progressPct >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            }} />
        </div>
        {progressPct >= 100 && (
          <p className="text-sm text-green-400 mt-3 font-medium">✓ Todos os módulos completos hoje!</p>
        )}
      </div>

      {/* Fogg B=MAP */}
      <div className="p-5 rounded-2xl border border-slate-700/50 bg-slate-900/30">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Modelo Fogg — B = MAP</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Motivation', value: Math.min(100, 60 + state.consecutiveCycles * 3), color: '#3b82f6' },
            { label: 'Ability', value: Math.max(10, 80 - state.failureIndex * 5), color: '#10b981' },
            { label: 'Prompt', value: completedToday > 0 ? 90 : 40, color: '#8b5cf6' },
          ].map(f => (
            <div key={f.label} className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d45" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={f.color} strokeWidth="3"
                    strokeDasharray={`${f.value} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{f.value}%</span>
              </div>
              <p className="text-sm text-slate-400">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Score formula — collapsed by default */}
      <button
        onClick={() => setShowFormula(f => !f)}
        className="w-full p-4 rounded-2xl border border-purple-700/25 bg-purple-950/15 text-left flex items-center justify-between transition-colors hover:bg-purple-950/25"
      >
        <div>
          <p className="text-sm font-semibold text-purple-300">Fórmula de Pontuação</p>
          <p className="text-sm text-slate-500 mt-0.5">Pt = Pbase × (1 + α·S) · e^(−β·F) = <span className="text-purple-300 font-bold">{pts} pts</span></p>
        </div>
        <span className="text-slate-500 text-lg">{showFormula ? '▲' : '▼'}</span>
      </button>
      {showFormula && (
        <div className="p-5 rounded-2xl border border-slate-700/50 bg-slate-900/40 animate-fadeInUp">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { k: 'Pbase', v: `${P_BASE}` },
              { k: 'Streak (S)', v: `${state.consecutiveCycles}` },
              { k: 'α (escala)', v: `${ALPHA}` },
              { k: 'Falhas (F)', v: `${state.failureIndex}` },
              { k: 'β (decaimento)', v: `${BETA}` },
              { k: 'Pt atual', v: `${pts} pts`, bold: true, color: '#93c5fd' },
            ].map(r => (
              <div key={r.k}>
                <p className="text-xs text-slate-500">{r.k}</p>
                <p className="text-base font-semibold mt-0.5" style={{ color: r.color ?? '#e2e8f0' }}>{r.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setShowLoot(true); setLootClaimed(false) }}
          className="p-5 rounded-2xl border border-purple-600/40 bg-purple-950/25 hover:bg-purple-950/40 transition-colors text-left"
        >
          <p className="text-2xl mb-2">🎁</p>
          <p className="text-base font-bold text-purple-300">Loot Table</p>
          <p className="text-sm text-slate-500 mt-1">Recompensa aleatória</p>
        </button>
        <button
          onClick={() => setShowRespawn(!showRespawn)}
          className="p-5 rounded-2xl border border-amber-600/40 bg-amber-950/20 hover:bg-amber-950/35 transition-colors text-left"
        >
          <p className="text-2xl mb-2">↺</p>
          <p className="text-base font-bold text-amber-300">Respawn</p>
          <p className="text-sm text-slate-500 mt-1">Quebrou o streak?</p>
        </button>
      </div>

      {showLoot && !lootClaimed && <LootTable onClaim={() => setLootClaimed(true)} />}
      {lootClaimed && <p className="text-green-400 text-base text-center animate-fadeInUp">✓ Recompensa reivindicada!</p>}
      {showRespawn && <RespawnProtocol onReset={() => { recordFailure(); setShowRespawn(false) }} />}
    </div>
  )
}
