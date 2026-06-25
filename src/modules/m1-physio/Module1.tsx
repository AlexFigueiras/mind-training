import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../../store/useStore'

type Protocol = 'sigh' | 'box' | 'hyper' | null
type BreathPhase = 'inhale1' | 'inhale2' | 'exhale' | 'hold_full' | 'hold_empty' | 'inhale_fast' | 'exhale_passive'
type VagalState = 'ventral' | 'sympathetic' | 'dorsal'

const VAGAL_INFO = {
  ventral: {
    label: 'Vagal Ventral — Segurança / Alto Desempenho',
    desc: 'Córtex pré-frontal e ACC operando em máxima capacidade. Estado ideal para decisão estratégica e pensamento sistêmico.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
  },
  sympathetic: {
    label: 'Simpático — Luta ou Fuga',
    desc: 'Foco estreito, reatividade elevada. PFC parcialmente desativado. Active um protocolo respiratório para recalibrar.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  dorsal: {
    label: 'Vagal Dorsal — Paralisia / Burnout',
    desc: 'Retraimento e desengajamento. Comportamento automático. Protocolo de ativação necessário.',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
}

function CO2Test({ onResult }: { onResult: (secs: number) => void }) {
  const [phase, setPhase] = useState<'idle' | 'breathe' | 'timing' | 'done'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTest = () => {
    setPhase('breathe')
    setTimeout(() => setPhase('timing'), 4000)
  }

  useEffect(() => {
    if (phase === 'timing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const stopTest = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('done')
    onResult(elapsed)
  }

  const getBoxSeconds = (secs: number) => {
    if (secs <= 20) return '3–4'
    if (secs <= 45) return '5–6'
    return '8–10'
  }

  if (phase === 'idle') return (
    <div className="text-center space-y-3">
      <p className="text-sm text-slate-400">Faça 4–5 respirações normais. Em seguida, inspire ao máximo e segure para iniciar.</p>
      <button onClick={startTest} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors">
        Iniciar Teste CO₂
      </button>
    </div>
  )

  if (phase === 'breathe') return (
    <p className="text-center text-cyan-400 animate-pulse">Fazendo 4–5 respirações normais... expire devagar pelo nariz</p>
  )

  if (phase === 'timing') return (
    <div className="text-center space-y-3">
      <div className="text-4xl font-mono text-cyan-300">{elapsed}s</div>
      <p className="text-slate-400 text-sm">Expire pelo nariz o mais devagar possível</p>
      <button onClick={stopTest} className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors">
        Parei de expirar
      </button>
    </div>
  )

  return (
    <div className="text-center space-y-2">
      <p className="text-green-400 font-semibold">CO₂ Discard Duration: {elapsed}s</p>
      <p className="text-slate-300 text-sm">
        Use <span className="text-cyan-300 font-mono font-bold">{getBoxSeconds(elapsed)}s</span> por fase no Box Breathing
      </p>
    </div>
  )
}

function BreathingCircle({ phase, progress }: { phase: BreathPhase | null; progress: number }) {
  const labels: Record<BreathPhase, string> = {
    inhale1: 'Inspire profundo', inhale2: 'Gole extra de ar',
    exhale: 'Expire lentamente', hold_full: 'Retenha cheio',
    hold_empty: 'Retenha vazio', inhale_fast: 'Inspire rápido',
    exhale_passive: 'Expire passivo',
  }

  const circleStyle = (): React.CSSProperties => {
    if (!phase) return { transform: 'scale(0.9)', opacity: 0.4 }
    if (phase === 'inhale1' || phase === 'inhale2' || phase === 'inhale_fast')
      return { animation: `breathe-expand ${phase === 'inhale_fast' ? '0.4s' : '4s'} ease-in-out forwards` }
    if (phase === 'exhale' || phase === 'exhale_passive')
      return { animation: 'breathe-contract 8s ease-in-out forwards' }
    if (phase === 'hold_full')
      return { animation: 'breathe-hold 2s ease-in-out infinite', transform: 'scale(1.2)' }
    return { animation: 'breathe-hold-empty 2s ease-in-out infinite', transform: 'scale(0.7)' }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-blue-500/20" style={{ animation: 'pulse-ring 3s ease-out infinite' }} />
        <div
          className="w-32 h-32 rounded-full border-2 border-blue-400 flex items-center justify-center transition-all"
          style={{ ...circleStyle(), background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 70%)' }}
        >
          <div className="text-blue-300 text-xs text-center font-medium px-2">
            {phase ? labels[phase] : 'Pronto'}
          </div>
        </div>
      </div>
      {phase && (
        <div className="w-40 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function SighTimer({ onComplete }: { onComplete: () => void }) {
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<BreathPhase | null>(null)
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('Pronto para o suspiro fisiológico')

  const ROUNDS = 5

  const runCycle = useCallback(async () => {
    const delay = (ms: number, phaseName: BreathPhase, prog: number) =>
      new Promise<void>(res => {
        setPhase(phaseName)
        setProgress(prog)
        setTimeout(res, ms)
      })

    for (let r = 0; r < ROUNDS; r++) {
      setRound(r + 1)
      setLabel('Inspire profundo pelo nariz')
      await delay(2000, 'inhale1', 20)
      setLabel('Gole de ar extra (infle ao máximo)')
      await delay(1000, 'inhale2', 40)
      setLabel('Expire lentamente pela boca (6–8s)')
      await delay(7000, 'exhale', 100)
      setProgress(0)
    }

    setPhase(null)
    setRunning(false)
    setLabel('Ciclo completo!')
    onComplete()
  }, [onComplete])

  const start = () => {
    setRunning(true)
    runCycle()
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <BreathingCircle phase={phase} progress={progress} />
      <p className="text-slate-300 text-sm text-center">{label}</p>
      {running && <p className="text-slate-500 text-xs">Ciclo {round}/{ROUNDS}</p>}
      {!running && (
        <button onClick={start} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          Iniciar Suspiro Fisiológico
        </button>
      )}
    </div>
  )
}

function BoxTimer({ onComplete }: { onComplete: () => void }) {
  const [co2Result, setCO2Result] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<BreathPhase | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [progress, setProgress] = useState(0)
  const [round, setRound] = useState(0)
  const ROUNDS = 4

  const getPhaseDuration = (secs: number) => {
    if (secs <= 20) return 3
    if (secs <= 45) return 5
    return 8
  }

  const phaseDuration = co2Result ? getPhaseDuration(co2Result) : 4

  const runCycle = useCallback(async () => {
    const phases: Array<[BreathPhase, string]> = [
      ['inhale1', 'Inspire'],
      ['hold_full', 'Retenha Cheio'],
      ['exhale', 'Expire'],
      ['hold_empty', 'Retenha Vazio'],
    ]

    for (let r = 0; r < ROUNDS; r++) {
      setRound(r + 1)
      for (const [ph] of phases) {
        setPhase(ph)
        for (let t = phaseDuration; t >= 0; t--) {
          setCountdown(t)
          setProgress(((phaseDuration - t) / phaseDuration) * 100)
          await new Promise(res => setTimeout(res, 1000))
        }
      }
    }

    setPhase(null)
    setRunning(false)
    onComplete()
  }, [phaseDuration, onComplete])

  const start = () => {
    setRunning(true)
    runCycle()
  }

  const phaseLabels: Partial<Record<BreathPhase, string>> = {
    inhale1: 'INSPIRE', hold_full: 'RETENHA CHEIO', exhale: 'EXPIRE', hold_empty: 'RETENHA VAZIO'
  }

  if (!co2Result) return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 text-center">Primeiro, faça o Teste de Tolerância ao CO₂ para calibrar seu Box Breathing.</p>
      <CO2Test onResult={setCO2Result} />
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800">
        {phaseDuration}s por fase · CO₂ Discard: {co2Result}s
      </div>
      <BreathingCircle phase={phase} progress={progress} />
      {phase && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-white font-bold text-lg tracking-widest">{phaseLabels[phase]}</p>
          <p className="text-slate-400 text-3xl font-mono">{countdown}</p>
        </div>
      )}
      {!phase && <p className="text-slate-400 text-sm">Ciclo completo!</p>}
      {running && <p className="text-slate-500 text-xs">Ciclo {round}/{ROUNDS}</p>}
      {!running && (
        <button onClick={start} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          Iniciar Box Breathing
        </button>
      )}
    </div>
  )
}

function HyperTimer({ onComplete }: { onComplete: () => void }) {
  const [accepted, setAccepted] = useState(false)
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(0)
  const [breathCount, setBreathCount] = useState(0)
  const [phase, setPhase] = useState<BreathPhase | null>(null)
  const [holdSecs, setHoldSecs] = useState(0)
  const ROUNDS = 3

  const runCycle = useCallback(async () => {
    for (let r = 0; r < ROUNDS; r++) {
      setRound(r + 1)
      setPhase('inhale_fast')
      for (let b = 1; b <= 25; b++) {
        setBreathCount(b)
        await new Promise(res => setTimeout(res, 800))
        setPhase('exhale_passive')
        await new Promise(res => setTimeout(res, 400))
        setPhase('inhale_fast')
      }
      setPhase('hold_empty')
      for (let h = 0; h <= 30; h++) {
        setHoldSecs(h)
        await new Promise(res => setTimeout(res, 1000))
      }
    }
    setPhase(null)
    setRunning(false)
    onComplete()
  }, [onComplete])

  if (!accepted) return (
    <div className="space-y-4">
      <div className="p-4 border border-red-700/50 bg-red-950/30 rounded-xl text-sm text-red-300">
        <p className="font-bold text-red-400 mb-2">⚠ ALERTA DE SEGURANÇA</p>
        <p>PROIBIDO realizar este exercício perto da água ou dirigindo devido ao risco de desmaio (apagão em águas rasas). Use com extrema cautela se for propenso a ataques de pânico.</p>
      </div>
      <button onClick={() => setAccepted(true)} className="w-full px-5 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors">
        Entendi os riscos — Continuar
      </button>
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-5">
      <BreathingCircle phase={phase} progress={(breathCount / 25) * 100} />
      {phase === 'inhale_fast' && <p className="text-blue-300 font-bold text-sm">Respiração {breathCount}/25 — inspire rápido pelo nariz</p>}
      {phase === 'exhale_passive' && <p className="text-slate-400 text-sm">Expire passivamente pela boca</p>}
      {phase === 'hold_empty' && (
        <div className="text-center">
          <p className="text-amber-400 font-bold">RETENÇÃO COM PULMÕES VAZIOS</p>
          <p className="text-2xl font-mono text-amber-300">{holdSecs}s</p>
        </div>
      )}
      {!phase && round > 0 && <p className="text-green-400">Protocolo completo!</p>}
      {running && <p className="text-slate-500 text-xs">Rodada {round}/{ROUNDS}</p>}
      {!running && (
        <button onClick={() => { setRunning(true); runCycle() }} className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors">
          Iniciar Hiperventilação Cíclica
        </button>
      )}
    </div>
  )
}

export default function Module1() {
  const { state, setVagalState, completeActivity } = useStore()
  const [activeProtocol, setActiveProtocol] = useState<Protocol>(null)
  const [showSomatic, setShowSomatic] = useState(false)
  const [panoramicActive, setPanoramicActive] = useState(false)
  const [oculoStep, setOculoStep] = useState(0)

  const current = VAGAL_INFO[state.vagalState]

  const handleComplete = (id: string) => {
    completeActivity(id)
    setActiveProtocol(null)
  }

  const panoramicSteps = [
    'Olhe diretamente para frente, sem fixar em nada específico.',
    'Relaxe os músculos ao redor dos olhos. Deixe sua visão "amolecer".',
    'Expanda sua consciência para a visão periférica — perceba as bordas do campo visual.',
    'Mantenha esse "olhar panorâmico" por 30 segundos. A amígdala desativa.',
  ]

  const oculoSteps = [
    'Mantenha a cabeça reta. Mova ambos os olhos para o extremo direito.',
    'Aguarde até bocejar, suspirar ou engolir (sinais de ativação vagal).',
    'Retorne ao centro. Agora mova os olhos para o extremo esquerdo.',
    'Aguarde novamente até bocejar, suspirar ou engolir.',
    'Retorne ao centro. Reset autonômico completo.',
  ]

  return (
    <div className="space-y-6">
      {/* Vagal State Selector */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Estado do SNA Agora</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(VAGAL_INFO) as VagalState[]).map(vs => {
            const info = VAGAL_INFO[vs]
            const active = state.vagalState === vs
            return (
              <button
                key={vs}
                onClick={() => setVagalState(vs)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  background: active ? info.bg : 'rgba(255,255,255,0.02)',
                  borderColor: active ? info.border : '#1e2d45',
                }}
              >
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: info.color }} />
                <p className="text-xs font-medium text-slate-200 leading-tight">
                  {vs === 'ventral' ? 'Vagal Ventral' : vs === 'sympathetic' ? 'Simpático' : 'Vagal Dorsal'}
                </p>
              </button>
            )
          })}
        </div>
        <div
          className="mt-3 p-3 rounded-xl border text-sm"
          style={{ background: current.bg, borderColor: current.border }}
        >
          <p className="font-semibold mb-1" style={{ color: current.color }}>{current.label}</p>
          <p className="text-slate-400 text-xs leading-relaxed">{current.desc}</p>
        </div>
      </div>

      {/* Protocol Selection */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Protocolos Respiratórios</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'sigh' as Protocol, label: 'Suspiro Fisiológico Cíclico', trigger: 'Pico de estresse / pré-decisão', color: '#3b82f6' },
            { id: 'box' as Protocol, label: 'Box Breathing', trigger: 'Pressão extrema / ansiedade aguda', color: '#06b6d4' },
            { id: 'hyper' as Protocol, label: 'Hiperventilação Cíclica', trigger: 'Aumento de alerta mental / foco', color: '#8b5cf6' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProtocol(activeProtocol === p.id ? null : p.id)}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-700/50 hover:border-slate-600 bg-slate-900/40 transition-all text-left"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{p.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.trigger}</p>
              </div>
              <div className="w-2 h-2 rounded-full ml-3 flex-shrink-0" style={{ background: p.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Active Protocol */}
      {activeProtocol && (
        <div className="p-5 rounded-2xl border border-blue-800/30 bg-slate-900/60 animate-fadeInUp">
          {activeProtocol === 'sigh' && <SighTimer onComplete={() => handleComplete('sigh')} />}
          {activeProtocol === 'box' && <BoxTimer onComplete={() => handleComplete('box')} />}
          {activeProtocol === 'hyper' && <HyperTimer onComplete={() => handleComplete('hyper')} />}
        </div>
      )}

      {/* Somatic techniques */}
      <div>
        <button
          onClick={() => setShowSomatic(!showSomatic)}
          className="text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2"
        >
          Técnicas Somáticas Auxiliares
          <span className="text-slate-600">{showSomatic ? '▲' : '▼'}</span>
        </button>
        {showSomatic && (
          <div className="mt-3 grid grid-cols-1 gap-3 animate-fadeInUp">
            {/* Panoramic Soften */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-200">Suavização Panorâmica</p>
                <button
                  onClick={() => setPanoramicActive(!panoramicActive)}
                  className="text-xs px-3 py-1 bg-blue-800/50 hover:bg-blue-700/50 rounded-md transition-colors"
                >
                  {panoramicActive ? 'Pausar' : 'Iniciar'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">Desativa resposta simpática de visão de túnel</p>
              {panoramicActive && (
                <div className="space-y-1.5 mt-2">
                  {panoramicSteps.map((step, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-300">
                      <span className="text-blue-400 flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Oculocardiac Vagus Reset */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-200">Reset Oculocardíaco Vago</p>
                <button
                  onClick={() => setOculoStep(s => (s + 1) % (oculoSteps.length + 1))}
                  className="text-xs px-3 py-1 bg-cyan-800/50 hover:bg-cyan-700/50 rounded-md transition-colors"
                >
                  {oculoStep === 0 ? 'Iniciar' : oculoStep >= oculoSteps.length ? 'Reset' : 'Próximo'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">Ativação vagal via movimentos oculares</p>
              {oculoStep > 0 && oculoStep <= oculoSteps.length && (
                <div className="p-3 bg-slate-800/50 rounded-lg animate-fadeInUp">
                  <p className="text-sm text-slate-300">
                    <span className="text-cyan-400 font-bold">Passo {oculoStep}: </span>
                    {oculoSteps[oculoStep - 1]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
