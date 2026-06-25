import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../../store/useStore'

// ─── N-Back Engine ───────────────────────────────────────────────────────────
const GRID_SIZE = 9
const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']

interface NBackStimulus {
  position: number
  letter: string
}

function generateStimulus(history: NBackStimulus[], n: number): NBackStimulus {
  const isTarget = history.length >= n && Math.random() < 0.33
  if (isTarget) {
    return { ...history[history.length - n] }
  }
  // Generate non-target, avoiding N-1 and N+1 traps (anti-strategy)
  let pos, letter
  let attempts = 0
  do {
    pos = Math.floor(Math.random() * GRID_SIZE)
    letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
    attempts++
  } while (
    attempts < 20 && (
      (history.length >= n && pos === history[history.length - n].position && letter === history[history.length - n].letter) ||
      (history.length >= 1 && pos === history[history.length - 1].position) ||
      (history.length >= n + 1 && pos === history[history.length - n - 1].position && letter === history[history.length - n - 1].letter)
    )
  )
  return { position: pos, letter }
}

interface Trial {
  stimulus: NBackStimulus
  userResponse: boolean | null
  isTarget: boolean
  correct: boolean | null
}

function NBackGame({ n, onFinish }: { n: number; onFinish: (score: number, trials: Trial[]) => void }) {
  const [history, setHistory] = useState<NBackStimulus[]>([])
  const [trials, setTrials] = useState<Trial[]>([])
  const [current, setCurrent] = useState<NBackStimulus | null>(null)
  const [showing, setShowing] = useState(false)
  const [_trialNum, setTrialNum] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [waitingResponse, setWaitingResponse] = useState(false)
  const responded = useRef(false)
  const TOTAL_TRIALS = 20 + n
  const SHOW_MS = 600
  const INTERVAL_MS = 2500

  const runTrial = useCallback((trialIdx: number, hist: NBackStimulus[]) => {
    if (trialIdx >= TOTAL_TRIALS) return
    const stim = generateStimulus(hist, n)
    const isTarget = hist.length >= n &&
      stim.position === hist[hist.length - n].position &&
      stim.letter === hist[hist.length - n].letter

    responded.current = false
    setCurrent(stim)
    setShowing(true)
    setWaitingResponse(true)
    setFeedback(null)

    const newHist = [...hist, stim]
    setHistory(newHist)

    setTimeout(() => setShowing(false), SHOW_MS)

    const timeout = setTimeout(() => {
      if (!responded.current) {
        const trial: Trial = { stimulus: stim, userResponse: null, isTarget, correct: !isTarget }
        setTrials(prev => {
          const updated = [...prev, trial]
          if (trialIdx + 1 >= TOTAL_TRIALS) {
            const score = Math.round((updated.filter(t => t.correct).length / updated.length) * 100)
            onFinish(score, updated)
          }
          return updated
        })
        setWaitingResponse(false)
        setTimeout(() => runTrial(trialIdx + 1, newHist), 400)
      }
    }, INTERVAL_MS)

    return () => clearTimeout(timeout)
  }, [n, TOTAL_TRIALS, onFinish])

  useEffect(() => {
    const cleanup = runTrial(0, [])
    setTrialNum(0)
    return cleanup
  }, [])

  const respond = useCallback(() => {
    if (!waitingResponse || responded.current || !current) return
    responded.current = true
    setWaitingResponse(false)

    const hist = history
    const isTarget = hist.length > n &&
      current.position === hist[hist.length - n - 1].position &&
      current.letter === hist[hist.length - n - 1].letter

    const isCorrect = isTarget
    setFeedback(isCorrect ? 'correct' : 'wrong')

    const trial: Trial = { stimulus: current, userResponse: true, isTarget, correct: isCorrect }
    setTrials(prev => {
      const updated = [...prev, trial]
      const idx = updated.length - 1
      if (idx + 1 >= TOTAL_TRIALS) {
        const score = Math.round((updated.filter(t => t.correct).length / updated.length) * 100)
        setTimeout(() => onFinish(score, updated), 600)
      }
      return updated
    })

    setTimeout(() => {
      setFeedback(null)
      runTrial(trials.length + 1, history)
    }, 500)
  }, [waitingResponse, current, history, n, trials.length, runTrial, onFinish])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.code === 'Space') respond() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [respond])

  const accuracy = trials.length > 0
    ? Math.round((trials.filter(t => t.correct).length / trials.length) * 100)
    : 0

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="text-blue-400 font-bold">{n}-Back</span>
        <span>Ensaio {Math.min(trials.length + 1, TOTAL_TRIALS)}/{TOTAL_TRIALS}</span>
        <span className={`font-medium ${accuracy >= 75 ? 'text-green-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
          {accuracy}% precisão
        </span>
      </div>

      {/* Grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', width: 210 }}>
        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const isActive = showing && current?.position === i
          return (
            <div
              key={i}
              className="w-16 h-16 rounded-xl border flex items-center justify-center text-xl font-bold transition-all duration-150"
              style={{
                background: isActive ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.03)',
                borderColor: isActive ? '#3b82f6' : '#1e2d45',
                color: isActive ? '#93c5fd' : 'transparent',
                animation: isActive ? 'nback-flash 0.6s ease' : undefined,
              }}
            >
              {isActive ? current?.letter : ''}
            </div>
          )
        })}
      </div>

      {/* Feedback */}
      <div className="h-6 flex items-center">
        {feedback === 'correct' && <span className="text-green-400 text-sm font-medium animate-countup">✓ Correto!</span>}
        {feedback === 'wrong' && <span className="text-red-400 text-sm font-medium animate-countup">✗ Falso positivo</span>}
      </div>

      <button
        onClick={respond}
        className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${waitingResponse ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
      >
        MATCH! (Espaço)
      </button>

      <p className="text-xs text-slate-600 text-center">
        Pressione quando posição E letra forem iguais às de {n} ensaio(s) atrás
      </p>
    </div>
  )
}

// ─── Huberman Protocol ────────────────────────────────────────────────────────
function HubermanProtocol() {
  const { incrementFocusBlock } = useStore()
  const [step, setStep] = useState(0)
  const [focusTime, setFocusTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [blockDone, setBlockDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = [
    { id: 'alert', label: '1. ALERTA', desc: 'Faça 25–30 respirações de hiperventilação cíclica para ativar o alerta mental, ou tome cafeína.', color: '#f59e0b', action: 'Estou alerta — próximo passo' },
    { id: 'focus', label: '2. FOCO VISUAL', desc: 'Fixe os olhos em um ponto específico da tela por 30–60 segundos sem desviar. Isso ativa o circuito de foco do cérebro.', color: '#3b82f6', action: 'Olhos fixos — começar bloco' },
    { id: 'reps', label: '3. REPETIÇÕES', desc: 'Gere repetições cognitivas em alta velocidade. Mire 15% de erros — esse é o sinal ideal de plasticidade.', color: '#10b981', action: null },
    { id: 'gaps', label: '5. GAP EFFECTS', desc: 'Pausas aleatórias de 10s em completo silêncio. O cérebro reprisa padrões aprendidos 10x mais rápido.', color: '#8b5cf6', action: null },
    { id: 'nsdr', label: '8. NSDR', desc: 'Relaxamento profundo pós-bloco: Yoga Nidra, hipnose autorregulada ou sesta de 20 minutos. Consolida a aprendizagem.', color: '#06b6d4', action: 'Bloco completo!' },
  ]

  const startFocusTimer = () => {
    setRunning(true)
    timerRef.current = setInterval(() => {
      setFocusTime(t => {
        if (t >= 5400) {
          clearInterval(timerRef.current!)
          setBlockDone(true)
          setRunning(false)
          return t
        }
        return t + 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const progress = (focusTime / 5400) * 100

  const handleAction = (s: typeof steps[number]) => {
    if (s.id === 'focus') {
      startFocusTimer()
      setStep(2)
    } else if (s.id === 'nsdr') {
      incrementFocusBlock()
    } else {
      setStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  return (
    <div className="space-y-4">
      {/* Timer during focus block */}
      {running && (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
          <p className="text-xs text-slate-500 mb-1">Bloco de Foco Ativo</p>
          <p className="text-3xl font-mono text-white">{formatTime(focusTime)}</p>
          <p className="text-xs text-slate-500 mt-1">/ 90:00</p>
          <div className="mt-3 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {blockDone && (
            <div className="mt-3 p-2 bg-green-950/30 border border-green-700/30 rounded-xl text-xs text-green-300 animate-fadeInUp">
              90 minutos atingidos — finalize o bloco e vá para NSDR
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((s, i) => {
          const isActive = step === i
          const isDone = step > i
          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl border transition-all ${isActive ? 'border-opacity-50 bg-opacity-10' : isDone ? 'opacity-40' : 'opacity-60'}`}
              style={{
                borderColor: isActive ? s.color + '50' : '#1e2d45',
                background: isActive ? s.color + '08' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isDone ? '#10b981' : isActive ? s.color : '#1e2d45' }} />
                  <p className="text-xs font-bold tracking-widest" style={{ color: isActive ? s.color : '#64748b' }}>{s.label}</p>
                </div>
                {isDone && <span className="text-xs text-green-400">✓</span>}
              </div>
              {isActive && (
                <div className="mt-2 animate-fadeInUp">
                  <p className="text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                  {s.action && (
                    <button
                      onClick={() => handleAction(s)}
                      className="mt-3 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: s.color + '30', color: s.color, border: `1px solid ${s.color}50` }}
                    >
                      {s.action} →
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {step === 2 && !running && (
        <button onClick={startFocusTimer} className="w-full py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-medium transition-colors">
          Iniciar Timer de 90 Minutos
        </button>
      )}
    </div>
  )
}

// ─── aMCC Friction Sprints ─────────────────────────────────────────────────
function FrictionSprints() {
  const { state, toggleHabit, completeActivity } = useStore()
  const [newHabit, setNewHabit] = useState('')

  const handleToggle = (id: string, completed: boolean) => {
    toggleHabit(id)
    if (!completed) completeActivity('habit_' + id)
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <p className="text-xs text-slate-400 leading-relaxed">
          A <span className="text-white font-medium">aMCC (anterior midcingulate cortex)</span> aumenta de volume apenas quando executamos tarefas sob fricção de resistência voluntária — fazer o que NÃO queremos. Cada micro-tarefa resistida expande fisicamente seu hub de força de vontade.
        </p>
      </div>

      <div className="space-y-2">
        {state.habits.map(h => (
          <button
            key={h.id}
            onClick={() => handleToggle(h.id, h.completed)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${h.completed ? 'border-green-700/30 bg-green-950/15' : 'border-slate-700/50 hover:border-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${h.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
              {h.completed && <span className="text-white text-xs">✓</span>}
            </div>
            <span className={`text-sm ${h.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{h.label}</span>
            {!h.completed && <span className="ml-auto text-xs text-slate-600">Resistência ativa</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && newHabit.trim() && setNewHabit('')}
          placeholder="Adicionar tarefa de fricção (< 5 min)"
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button className="px-3 py-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-xl text-sm transition-colors">+</button>
      </div>
    </div>
  )
}

// ─── Module 4 Root ────────────────────────────────────────────────────────────
export default function Module4() {
  const { state, updateNback, completeActivity } = useStore()
  const [view, setView] = useState<'nback' | 'huberman' | 'friction' | null>(null)
  const [nbackDone, setNbackDone] = useState(false)
  const [nbackScore, setNbackScore] = useState(0)
  const [nbackLevel, setNbackLevel] = useState(state.nbackLevel)

  const handleNbackFinish = (score: number) => {
    setNbackScore(score)
    setNbackDone(true)
    let newLevel = nbackLevel
    if (score >= 85) newLevel = Math.min(nbackLevel + 1, 6)
    else if (score < 75) newLevel = Math.max(nbackLevel - 1, 1)
    updateNback(newLevel, score)
    completeActivity('nback')
  }

  const tools = [
    { id: 'nback', label: 'Executive N-Back', sub: `Nível ${nbackLevel}-Back · Melhor: ${state.nbackBestScore}%`, color: '#3b82f6', glyph: '◆' },
    { id: 'huberman', label: 'Super-Protocolo Huberman', sub: 'Bloco de foco de 90 minutos', color: '#10b981', glyph: '◎' },
    { id: 'friction', label: 'Friction Sprints / aMCC', sub: 'Expansão do hub de força de vontade', color: '#8b5cf6', glyph: '▲' },
  ] as const

  return (
    <div className="space-y-4">
      {!view ? (
        <div className="space-y-2.5">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => { setView(t.id as 'nback' | 'huberman' | 'friction'); setNbackDone(false) }}
              className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: `${t.color}14`, border: `1px solid ${t.color}33` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${t.color}22`, color: t.color }}>
                <span className="text-lg">{t.glyph}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white leading-snug">{t.label}</p>
                <p className="text-sm text-slate-400 mt-1">{t.sub}</p>
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke={t.color} strokeWidth="2.2" opacity="0.6">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fadeInUp">
          <button onClick={() => setView(null)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 mb-4 transition-colors">
            ← Voltar
          </button>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            {tools.find(t => t.id === view)?.label}
          </h3>

          {view === 'nback' && !nbackDone && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Nível:</span>
                {[1, 2, 3, 4, 5, 6].map(l => (
                  <button
                    key={l}
                    onClick={() => setNbackLevel(l)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${l === nbackLevel ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <NBackGame key={nbackLevel} n={nbackLevel} onFinish={handleNbackFinish} />
            </div>
          )}

          {view === 'nback' && nbackDone && (
            <div className="text-center space-y-4 animate-fadeInUp">
              <div className={`text-5xl font-bold ${nbackScore >= 75 ? 'text-green-400' : 'text-amber-400'}`}>
                {nbackScore}%
              </div>
              <div>
                {nbackScore >= 85 && <p className="text-green-400 text-sm">Avançando para {Math.min(nbackLevel + 1, 6)}-Back</p>}
                {nbackScore >= 75 && nbackScore < 85 && <p className="text-blue-400 text-sm">Mantendo {nbackLevel}-Back</p>}
                {nbackScore < 75 && <p className="text-amber-400 text-sm">Ajustando para {Math.max(nbackLevel - 1, 1)}-Back</p>}
              </div>
              <p className="text-xs text-slate-500">Precisão necessária para avançar: 85%</p>
              <div className="p-3 bg-purple-950/20 border border-purple-700/30 rounded-xl text-xs text-purple-300">
                Sinergy Capacity: Aplique uma decisão estratégica agora — sua plasticidade e RAM mental estão expandidos.
              </div>
              <button onClick={() => { setNbackDone(false); setNbackLevel(state.nbackLevel) }} className="px-5 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm transition-colors">
                Jogar novamente
              </button>
            </div>
          )}

          {view === 'huberman' && <HubermanProtocol />}
          {view === 'friction' && <FrictionSprints />}
        </div>
      )}
    </div>
  )
}
