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

function ScoreFormula({ state }: { state: ReturnType<typeof useStore>['state'] }) {
  const pts = calcScore(state)
  return (
    <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3">
      <p className="text-xs uppercase tracking-widest text-slate-500">Fórmula de Pontuação Ativa</p>
      <div className="font-mono text-xs text-slate-400 space-y-1">
        <p className="text-slate-300">
          P<sub>t</sub> = P<sub>base</sub> × (1 + α·S<sub>t</sub>) · e<sup>−β·F<sub>t</sub></sup>
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-slate-500">
          <p>P<sub>base</sub> = {P_BASE}</p>
          <p>S<sub>t</sub> (streak) = {state.consecutiveCycles}</p>
          <p>α = {ALPHA}</p>
          <p>F<sub>t</sub> (falhas) = {state.failureIndex}</p>
          <p>β = {BETA}</p>
          <p className="text-blue-300 font-bold">P<sub>t</sub> = {pts} pts</p>
        </div>
      </div>
    </div>
  )
}

function LootTable({ onClaim }: { onClaim: () => void }) {
  const [loot] = useState(getLoot)
  return (
    <div className="animate-fadeInUp space-y-4">
      <div
        className="p-5 rounded-2xl border text-center"
        style={{ background: loot.color + '10', borderColor: loot.color + '40' }}
      >
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: loot.color }}>{loot.rarity}</p>
        <p className="text-lg font-bold text-white mb-2">{loot.label}</p>
        <p className="text-sm text-slate-400">{loot.desc}</p>
      </div>
      <button
        onClick={onClaim}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
        style={{ background: loot.color + '30', color: loot.color, border: `1px solid ${loot.color}50` }}
      >
        Reivindicar Recompensa
      </button>
    </div>
  )
}

function RespawnProtocol({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-4 animate-fadeInUp">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
        <p className="text-sm font-bold text-white mb-2">Respawn Protocol — Dados de Recalibração</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          A quebra de sequência não é falha — é <span className="text-white">dado frio de estratégia</span>. Seu sistema nervoso aprendeu o que não funciona. Isso é informação valiosa.
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-widest">Diagnóstico rápido:</p>
        {['Carga cognitiva excessiva?', 'Barreira de fricção muito alta?', 'Motivação intrínseca fraca?', 'Contexto ambiental desfavorável?'].map((q, i) => (
          <label key={i} className="flex items-center gap-3 p-2.5 hover:bg-slate-800/30 rounded-lg cursor-pointer">
            <input type="checkbox" className="accent-blue-500" />
            <span className="text-sm text-slate-300">{q}</span>
          </label>
        ))}
      </div>
      <button
        onClick={onReset}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-colors"
      >
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

  const totalActivities = 6
  const completedToday = state.completedToday.length
  const progressPct = Math.min((completedToday / totalActivities) * 100, 100)
  const pts = calcScore(state)

  return (
    <div className="space-y-5">
      {/* Score Display */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-center">
          <p className="text-2xl font-bold text-white">{state.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pontos Totais</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-center">
          <p className="text-2xl font-bold text-blue-400">{state.consecutiveCycles}</p>
          <p className="text-xs text-slate-500 mt-0.5">Streak</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-center">
          <p className="text-2xl font-bold text-amber-400">+{pts}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pts/Ciclo</p>
        </div>
      </div>

      {/* Daily Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progresso Diário</span>
          <span>{completedToday}/{totalActivities} atividades</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: progressPct >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            }}
          />
        </div>
        {progressPct >= 100 && (
          <p className="text-xs text-green-400 mt-1.5 animate-fadeInUp">Todos os módulos completos hoje!</p>
        )}
      </div>

      {/* Fogg B=MAP */}
      <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/30">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Modelo Fogg — B = MAP</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Motivation', value: Math.min(100, 60 + state.consecutiveCycles * 3) },
            { label: 'Ability', value: Math.max(10, 80 - state.failureIndex * 5) },
            { label: 'Prompt', value: completedToday > 0 ? 90 : 40 },
          ].map(f => (
            <div key={f.label} className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d45" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.5"
                    strokeDasharray={`${f.value} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{f.value}%</span>
              </div>
              <p className="text-xs text-slate-400">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      <ScoreFormula state={state} />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setShowLoot(true); setLootClaimed(false) }}
          className="p-3 rounded-xl border border-purple-700/30 bg-purple-950/20 hover:bg-purple-950/30 transition-colors text-left"
        >
          <p className="text-xs font-bold text-purple-400 mb-0.5">Loot Table</p>
          <p className="text-xs text-slate-500">Recompensa aleatória</p>
        </button>
        <button
          onClick={() => setShowRespawn(!showRespawn)}
          className="p-3 rounded-xl border border-amber-700/30 bg-amber-950/15 hover:bg-amber-950/25 transition-colors text-left"
        >
          <p className="text-xs font-bold text-amber-400 mb-0.5">Respawn Protocol</p>
          <p className="text-xs text-slate-500">Quebrou o streak?</p>
        </button>
      </div>

      {showLoot && !lootClaimed && <LootTable onClaim={() => setLootClaimed(true)} />}
      {lootClaimed && <p className="text-green-400 text-sm text-center animate-fadeInUp">Recompensa reivindicada!</p>}
      {showRespawn && <RespawnProtocol onReset={() => { recordFailure(); setShowRespawn(false) }} />}
    </div>
  )
}
