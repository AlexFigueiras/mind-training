import { useState } from 'react'
import { useStore } from '../../store/useStore'

const BIASES = [
  'Superresposta a Recompensas/Punições (Incentivo)',
  'Simpatia/Amor (Liking/Loving)',
  'Antipatia/Ódio (Disliking/Hating)',
  'Evitação de Dúvida (Doubt-Avoidance)',
  'Evitação de Incoerência (Inconsistency-Avoidance)',
  'Curiosidade Desregrada',
  'Justiça Kantiana (Expectativa de tratamento justo)',
  'Inveja e Ciúme',
  'Reciprocidade Explorada',
  'Influência por Mera Associação (Pavloviana)',
  'Negação Psicológica Simples de Dor',
  'Autoestima Excessiva (Overconfidence)',
  'Superotimismo',
  'Super-reação à Perda (Deprival-Superreaction)',
  'Prova Social (Efeito Manada)',
  'Contraste-Misreaction',
  'Estresse Acoplado',
  'Disponibilidade de Memória (Availability-Misweighing)',
  'Desuso de Habilidades (Use-It-or-Lose-It)',
  'Maus Hábitos e Influência de Drogas',
  'Senescência-Misinfluence (Declínio cognitivo)',
  'Autoridade Excessiva (Authority-Misinfluence)',
  'Twaddle Tendency (Distração com informações inúteis)',
  'Reason-Respecting (Exigir explicações sem pensar)',
  'Efeito Lollapalooza (Confluência de múltiplos vieses)',
]

type DecisionView = 'classify' | 'munger' | 'first-principles' | 'matrices' | null

function DecisionClassifier() {
  const { addDecision, completeActivity } = useStore()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'type1' | 'type2' | null>(null)
  const [biasesChecked, setBiasesChecked] = useState<boolean[]>(new Array(25).fill(false))
  const [step, setStep] = useState<'input' | 'classify' | 'biases' | 'saved'>('input')
  const [savedId, setSavedId] = useState<string | null>(null)

  const toggleBias = (i: number) => {
    setBiasesChecked(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const activeBiases = biasesChecked.map((v, i) => v ? i : -1).filter(i => i >= 0)
  const hasDanger = activeBiases.length >= 3

  const save = () => {
    const id = addDecision({
      title,
      type,
      biases: activeBiases,
      firstPrinciples: { belief: '', decomposed: [], rebuilt: '' },
      regretScore: 0,
    })
    setSavedId(id)
    completeActivity('decision')
    setStep('saved')
  }

  if (step === 'input') return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Qual é a decisão?</label>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Descreva a decisão que você precisa tomar..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          rows={3}
        />
      </div>
      <button
        onClick={() => setStep('classify')}
        disabled={!title.trim()}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-xl text-sm font-medium transition-colors"
      >
        Classificar Decisão
      </button>
    </div>
  )

  if (step === 'classify') return (
    <div className="space-y-4 animate-fadeInUp">
      <h4 className="text-sm text-slate-300 font-medium">"{title}"</h4>
      <p className="text-xs text-slate-500">É irreversível e consequente?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setType('type1')}
          className={`p-4 rounded-xl border text-left transition-all ${type === 'type1' ? 'border-red-500/50 bg-red-950/30' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <p className="text-sm font-bold text-red-400">TIPO 1</p>
          <p className="text-xs text-slate-400 mt-1">One-Way Door — Irreversível</p>
          <ul className="text-xs text-slate-500 mt-2 space-y-0.5">
            <li>• Decisão lenta e deliberada</li>
            <li>• Análise profunda + dados</li>
            <li>• Memorando narrativo</li>
          </ul>
        </button>
        <button
          onClick={() => setType('type2')}
          className={`p-4 rounded-xl border text-left transition-all ${type === 'type2' ? 'border-green-500/50 bg-green-950/30' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <p className="text-sm font-bold text-green-400">TIPO 2</p>
          <p className="text-xs text-slate-400 mt-1">Two-Way Door — Reversível</p>
          <ul className="text-xs text-slate-500 mt-2 space-y-0.5">
            <li>• Bias de ação imediato</li>
            <li>• 70% info é suficiente</li>
            <li>• Permita pivots rápidos</li>
          </ul>
        </button>
      </div>
      {type === 'type2' && (
        <div className="p-3 bg-amber-950/30 border border-amber-700/30 rounded-xl text-xs text-amber-300 animate-fadeInUp">
          ⚡ Custo de lentidão é maior que custo de erro. Decida agora com as informações disponíveis.
        </div>
      )}
      {type === 'type1' && (
        <button onClick={() => setStep('biases')} className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors">
          Verificar Vieses de Munger →
        </button>
      )}
      {type === 'type2' && (
        <button onClick={save} className="w-full py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-medium transition-colors">
          Registrar Decisão Tipo 2
        </button>
      )}
    </div>
  )

  if (step === 'biases') return (
    <div className="space-y-4 animate-fadeInUp">
      <p className="text-xs text-slate-400">Verifique os 25 Erros de Julgamento de Munger. Marque os que podem estar influenciando sua decisão:</p>
      {hasDanger && (
        <div className="p-3 bg-red-950/30 border border-red-700/30 rounded-xl text-xs text-red-300">
          ⚠ {activeBiases.length} vieses identificados. Risco de Lollapalooza — reavalie antes de decidir.
        </div>
      )}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {BIASES.map((bias, i) => (
          <label key={i} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${biasesChecked[i] ? 'bg-red-950/20 border border-red-800/30' : 'hover:bg-slate-800/30'}`}>
            <input
              type="checkbox"
              checked={biasesChecked[i]}
              onChange={() => toggleBias(i)}
              className="mt-0.5 accent-red-500"
            />
            <span className="text-xs text-slate-300">{i + 1}. {bias}</span>
          </label>
        ))}
      </div>
      <button onClick={save} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
        Registrar Decisão ({activeBiases.length} vieses marcados)
      </button>
    </div>
  )

  return (
    <div className="text-center space-y-3 py-4 animate-fadeInUp">
      <div className="text-3xl">✓</div>
      <p className="text-green-400 font-medium">Decisão registrada</p>
      <p className="text-xs text-slate-500">ID: {savedId?.slice(0, 8)}</p>
      <button onClick={() => { setTitle(''); setType(null); setBiasesChecked(new Array(25).fill(false)); setStep('input') }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
        Nova Decisão
      </button>
    </div>
  )
}

function FirstPrinciples() {
  const { addDecision, completeActivity } = useStore()
  const [belief, setBelief] = useState('')
  const [decomposed, setDecomposed] = useState(['', '', '', ''])
  const [rebuilt, setRebuilt] = useState('')
  const [saved, setSaved] = useState(false)

  const updateDecomposed = (i: number, val: string) => {
    setDecomposed(prev => prev.map((v, idx) => idx === i ? val : v))
  }

  const save = () => {
    addDecision({
      title: belief,
      type: null,
      biases: [],
      firstPrinciples: { belief, decomposed: decomposed.filter(Boolean), rebuilt },
      regretScore: 0,
    })
    completeActivity('first_principles')
    setSaved(true)
  }

  if (saved) return (
    <div className="text-center py-4 space-y-2 animate-fadeInUp">
      <p className="text-green-400 font-medium">Análise salva!</p>
      <button onClick={() => { setBelief(''); setDecomposed(['','','','']); setRebuilt(''); setSaved(false) }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">
        Nova Análise
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
          1. Crença / Analogia Tradicional
        </label>
        <input
          value={belief}
          onChange={e => setBelief(e.target.value)}
          placeholder='Ex: "Foguetes são caros de construir"'
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
          2. Decompor em Ingredientes Fundamentais
        </label>
        <div className="space-y-2">
          {decomposed.map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={e => updateDecomposed(i, e.target.value)}
              placeholder={`Componente fundamental ${i + 1}`}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-1">Qual o custo real dos materiais no mercado? Qual a lacuna de eficiência?</p>
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">
          3. Reconstrução — Solução Inédita
        </label>
        <textarea
          value={rebuilt}
          onChange={e => setRebuilt(e.target.value)}
          placeholder="Como construir a solução otimizando diretamente a partir dos fundamentos..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-purple-500 transition-colors"
          rows={3}
        />
      </div>

      <button
        onClick={save}
        disabled={!belief.trim() || !rebuilt.trim()}
        className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-30 rounded-xl text-sm font-medium transition-colors"
      >
        Salvar Análise de Primeiros Princípios
      </button>
    </div>
  )
}

function MungerLatticework() {
  const [mode, setMode] = useState<'inversion' | 'circle' | 'margin'>('inversion')
  const [goal, setGoal] = useState('')
  const [failures, setFailures] = useState<string[]>([''])
  const [circleInput, setCircleInput] = useState('')
  const [circleCategory, setCircleCategory] = useState<'sim' | 'nao' | 'dificil' | null>(null)
  const [margin, setMargin] = useState(30)
  const [estimate, setEstimate] = useState('')

  const addFailure = () => setFailures(prev => [...prev, ''])
  const updateFailure = (i: number, val: string) => setFailures(prev => prev.map((v, idx) => idx === i ? val : v))

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['inversion', 'circle', 'margin'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-amber-700/60 text-amber-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {m === 'inversion' ? 'Inversão' : m === 'circle' ? 'Círculo' : 'Margem'}
          </button>
        ))}
      </div>

      {mode === 'inversion' && (
        <div className="space-y-3 animate-fadeInUp">
          <p className="text-xs text-slate-400">Invert, Always Invert — Charlie Munger</p>
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder='Ex: "Como expandir minha startup"'
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {goal && (
            <div className="p-3 bg-amber-950/20 border border-amber-700/30 rounded-xl animate-fadeInUp">
              <p className="text-xs text-amber-400 font-medium mb-1">Problema Invertido:</p>
              <p className="text-sm text-slate-300">Como garantir que "{goal.toLowerCase()}" falhe completamente?</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Liste as formas de falhar (checklist de prevenção):</label>
            {failures.map((f, i) => (
              <input
                key={i}
                value={f}
                onChange={e => updateFailure(i, e.target.value)}
                placeholder={`Forma de falhar ${i + 1}`}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            ))}
            <button onClick={addFailure} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              + Adicionar forma de falhar
            </button>
          </div>
        </div>
      )}

      {mode === 'circle' && (
        <div className="space-y-3 animate-fadeInUp">
          <p className="text-xs text-slate-400">Triagem do Círculo de Competência</p>
          <input
            value={circleInput}
            onChange={e => setCircleInput(e.target.value)}
            placeholder="Descreva o problema ou oportunidade..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <div className="grid grid-cols-3 gap-2">
            {(['sim', 'nao', 'dificil'] as const).map(cat => {
              const labels = { sim: 'SIM — Sei operar', nao: 'NÃO — Sem vantagem', dificil: 'DIFÍCIL — Fora do domínio' }
              const colors = { sim: 'green', nao: 'red', dificil: 'amber' }
              const c = colors[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setCircleCategory(cat)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${circleCategory === cat ? `bg-${c}-950/40 border-${c}-500/50 text-${c}-300` : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  {labels[cat]}
                </button>
              )
            })}
          </div>
          {circleCategory === 'nao' && (
            <div className="p-3 bg-red-950/20 border border-red-700/30 rounded-xl text-xs text-red-300 animate-fadeInUp">
              🔴 Fora do Círculo de Competência — Delegar imediatamente. Não arrisque capital onde você não tem vantagem informacional.
            </div>
          )}
          {circleCategory === 'dificil' && (
            <div className="p-3 bg-amber-950/20 border border-amber-700/30 rounded-xl text-xs text-amber-300 animate-fadeInUp">
              🟡 Muito Difícil — Avalie se vale expandir o círculo ou buscar parceria com quem tem expertise.
            </div>
          )}
          {circleCategory === 'sim' && (
            <div className="p-3 bg-green-950/20 border border-green-700/30 rounded-xl text-xs text-green-300 animate-fadeInUp">
              🟢 Dentro do Círculo — Você tem vantagem. Avance com confiança calibrada.
            </div>
          )}
        </div>
      )}

      {mode === 'margin' && (
        <div className="space-y-3 animate-fadeInUp">
          <p className="text-xs text-slate-400">Margem de Segurança — Buffer de Erro de Cálculo</p>
          <input
            value={estimate}
            onChange={e => setEstimate(e.target.value)}
            placeholder="Ex: R$ 100.000 ou 90 dias"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Estável (10%)</span>
              <span className="text-amber-400 font-bold">{margin}%</span>
              <span>Incerto (60%)</span>
            </div>
            <input
              type="range" min={10} max={60} value={margin}
              onChange={e => setMargin(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          {estimate && (
            <div className="p-3 bg-amber-950/20 border border-amber-700/30 rounded-xl text-sm animate-fadeInUp">
              <p className="text-xs text-slate-400 mb-1">Estimativa com margem de segurança ({margin}%):</p>
              <p className="text-amber-300 font-mono font-bold">{estimate} + {margin}% de buffer</p>
              <p className="text-xs text-slate-500 mt-1">Planeje para o pior cenário dentro do buffer.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegretMatrix() {
  const [reflection, setReflection] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <p className="text-xs text-slate-400 leading-relaxed">
          Você tem <span className="text-white font-semibold">80 anos</span>. Está sentado em uma cadeira de balanço, olhando para trás. Os ruídos e medos de hoje são invisíveis daqui.
        </p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          A única pergunta que importa: <span className="text-amber-300 font-medium">você se arrependerá de não ter tentado?</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-green-700/30 bg-green-950/10">
          <p className="text-xs text-green-400 font-medium mb-1">Se eu tentar e falhar</p>
          <p className="text-xs text-slate-400">Aprendizado, ajuste, pivot. Erro como dado de recalibração.</p>
        </div>
        <div className="p-3 rounded-xl border border-red-700/30 bg-red-950/10">
          <p className="text-xs text-red-400 font-medium mb-1">Se eu não tentar</p>
          <p className="text-xs text-slate-400">Arrependimento permanente. A omissão dói mais que o erro.</p>
        </div>
      </div>

      <textarea
        value={reflection}
        onChange={e => setReflection(e.target.value)}
        placeholder="Descreva a decisão e o que o seu eu de 80 anos diria sobre ela..."
        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-amber-500 transition-colors"
        rows={4}
      />
      {saved ? (
        <p className="text-green-400 text-sm text-center">Reflexão salva.</p>
      ) : (
        <button
          onClick={() => { setSaved(true) }}
          disabled={!reflection.trim()}
          className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-30 rounded-xl text-sm font-medium transition-colors"
        >
          Salvar Perspectiva dos 80 Anos
        </button>
      )}
    </div>
  )
}

export default function Module2() {
  const [view, setView] = useState<DecisionView>(null)

  const tools = [
    { id: 'classify', label: 'Classificador Tipo 1 / Tipo 2', sub: 'Bezos — One-Way vs Two-Way Door', color: '#3b82f6', glyph: '◈' },
    { id: 'munger', label: 'Latticework de Munger', sub: 'Inversão · Círculo · Margem', color: '#f59e0b', glyph: '◆' },
    { id: 'first-principles', label: 'Primeiros Princípios', sub: 'Musk — Deconstrução e Reconstrução', color: '#8b5cf6', glyph: '▣' },
    { id: 'matrices', label: 'Regret Minimization', sub: 'Bezos — Perspectiva dos 80 anos', color: '#10b981', glyph: '◷' },
  ] as const

  return (
    <div className="space-y-4">
      {!view ? (
        <div className="space-y-2.5">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id as DecisionView)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: `${t.color}14`, border: `1px solid ${t.color}33` }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${t.color}22`, color: t.color }}>
                <span className="text-base">{t.glyph}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{t.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{t.sub}</p>
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
          {view === 'classify' && <DecisionClassifier />}
          {view === 'munger' && <MungerLatticework />}
          {view === 'first-principles' && <FirstPrinciples />}
          {view === 'matrices' && <RegretMatrix />}
        </div>
      )}
    </div>
  )
}
