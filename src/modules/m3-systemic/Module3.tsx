import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type M3View = 'iceberg' | 'bot' | 'circle' | 'group' | null

function IcebergMapper() {
  const { addSystemicProblem, completeActivity } = useStore()
  const [fields, setFields] = useState({ event: '', pattern: '', structure: '', mentalModel: '' })
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)

  const layers = [
    {
      key: 'event',
      label: 'EVENTO',
      question: 'O que aconteceu de forma imediata?',
      example: 'Ex: Atraso na entrega do produto',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
    },
    {
      key: 'pattern',
      label: 'PADRÃO',
      question: 'Quais são as tendências e comportamentos ao longo do tempo?',
      example: 'Ex: Atrasos recorrentes todo trimestre',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      key: 'structure',
      label: 'ESTRUTURA',
      question: 'Que políticas, regras ou conexões físicas influenciam isso?',
      example: 'Ex: Processo de aprovação em cascata com 5 níveis',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      key: 'mentalModel',
      label: 'MODELO MENTAL',
      question: 'Quais premissas, crenças e valores os stakeholders sustentam?',
      example: 'Ex: "Velocidade é imprudência" — cultura de excesso de cautela',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
  ] as const

  const current = layers[step]

  const save = () => {
    addSystemicProblem(fields)
    completeActivity('iceberg')
    setSaved(true)
  }

  if (saved) return (
    <div className="space-y-4 animate-fadeInUp">
      <p className="text-green-400 text-center font-medium">Problema mapeado!</p>
      <div className="space-y-2">
        {layers.map(l => (
          <div key={l.key} className="p-3 rounded-xl border text-sm" style={{ background: l.bg, borderColor: l.color + '30' }}>
            <p className="text-xs font-bold mb-1" style={{ color: l.color }}>{l.label}</p>
            <p className="text-slate-300">{fields[l.key] || '—'}</p>
          </div>
        ))}
      </div>
      <button onClick={() => { setFields({ event: '', pattern: '', structure: '', mentalModel: '' }); setStep(0); setSaved(false) }} className="w-full py-2 bg-slate-700 rounded-xl text-sm">
        Novo Problema
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {layers.map((l, i) => (
          <div
            key={l.key}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= step ? l.color : '#1e2d45' }}
          />
        ))}
      </div>

      <div className="p-4 rounded-xl border" style={{ background: current.bg, borderColor: current.color + '30' }}>
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: current.color }}>{current.label}</p>
        <p className="text-sm text-slate-200 font-medium">{current.question}</p>
      </div>

      <textarea
        key={step}
        value={fields[current.key]}
        onChange={e => setFields(prev => ({ ...prev, [current.key]: e.target.value }))}
        placeholder={current.example}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none transition-colors"
        style={{ '--tw-ring-color': current.color } as React.CSSProperties}
        rows={3}
      />

      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors">
            ← Anterior
          </button>
        )}
        {step < layers.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: current.color + 'cc' }}
          >
            Próxima Camada →
          </button>
        ) : (
          <button
            onClick={save}
            disabled={!fields.event.trim()}
            className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-30 rounded-xl text-sm font-medium transition-colors"
          >
            Salvar Análise
          </button>
        )}
      </div>
    </div>
  )
}

const SAMPLE_DATA = [
  { t: 'Jan', value: 45 }, { t: 'Fev', value: 52 }, { t: 'Mar', value: 38 },
  { t: 'Abr', value: 61 }, { t: 'Mai', value: 55 }, { t: 'Jun', value: 72 },
  { t: 'Jul', value: 48 }, { t: 'Ago', value: 65 }, { t: 'Set', value: 80 },
]

function BOTGraph() {
  const [variable, setVariable] = useState('')
  const [variables, setVariables] = useState<{ name: string; color: string; data: { t: string; value: number }[] }[]>([])
  const [focus, setFocus] = useState('')
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const addVariable = () => {
    if (!variable.trim()) return
    setVariables(prev => [
      ...prev,
      { name: variable.trim(), color: COLORS[prev.length % COLORS.length], data: SAMPLE_DATA.map(d => ({ ...d, value: Math.round(d.value * (0.7 + Math.random() * 0.6)) })) }
    ])
    setVariable('')
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">Gráfico BOT (Behavior Over Time) — Revela padrões cíclicos ao longo do tempo</p>
      <div className="flex gap-2">
        <input
          value={variable}
          onChange={e => setVariable(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addVariable()}
          placeholder="Nome da variável (ex: satisfação clientes)"
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button onClick={addVariable} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm transition-colors">
          +
        </button>
      </div>

      {variables.length > 0 && (
        <div className="animate-fadeInUp">
          <div className="flex gap-3 flex-wrap mb-3">
            {variables.map(v => (
              <span key={v.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                {v.name}
              </span>
            ))}
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SAMPLE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }} />
                {variables.map(v => (
                  <Line key={v.name} type="monotone" data={v.data} dataKey="value" stroke={v.color} strokeWidth={2} dot={false} name={v.name} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Declaração de Foco</label>
        <input
          value={focus}
          onChange={e => setFocus(e.target.value)}
          placeholder="Por que este problema recorre com mais intensidade?"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  )
}

function ConnectionCircle() {
  const [vars, setVars] = useState<string[]>([''])
  const [connections, setConnections] = useState<{ from: string; to: string; type: 'S' | 'O' }[]>([])
  const [fromVar, setFromVar] = useState('')
  const [toVar, setToVar] = useState('')
  const [connType, setConnType] = useState<'S' | 'O'>('S')

  const addVar = () => setVars(prev => [...prev, ''])
  const updateVar = (i: number, val: string) => setVars(prev => prev.map((v, idx) => idx === i ? val : v))

  const addConnection = () => {
    if (!fromVar || !toVar || fromVar === toVar) return
    setConnections(prev => [...prev, { from: fromVar, to: toVar, type: connType }])
    setFromVar('')
    setToVar('')
  }

  const filledVars = vars.filter(Boolean)

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">Canvas de Connection Circles — S/+ efeito mesma direção, O/- direção oposta</p>

      <div className="space-y-2">
        <label className="text-xs text-slate-500">Variáveis do sistema:</label>
        {vars.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={e => updateVar(i, e.target.value)}
            placeholder={`Variável ${i + 1}`}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        ))}
        <button onClick={addVar} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">+ Adicionar variável</button>
      </div>

      {filledVars.length >= 2 && (
        <div className="space-y-2 animate-fadeInUp">
          <label className="text-xs text-slate-500">Adicionar conexão:</label>
          <div className="flex gap-2">
            <select value={fromVar} onChange={e => setFromVar(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none">
              <option value="">De...</option>
              {filledVars.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button
              onClick={() => setConnType(t => t === 'S' ? 'O' : 'S')}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${connType === 'S' ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-red-900/50 border-red-700 text-red-300'}`}
            >
              {connType}
            </button>
            <select value={toVar} onChange={e => setToVar(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none">
              <option value="">Para...</option>
              {filledVars.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button onClick={addConnection} className="w-full py-2 bg-cyan-800/50 hover:bg-cyan-700/50 rounded-lg text-sm transition-colors">
            Conectar
          </button>
        </div>
      )}

      {connections.length > 0 && (
        <div className="space-y-1.5 animate-fadeInUp">
          <label className="text-xs text-slate-500">Loops identificados:</label>
          {connections.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300 p-2 bg-slate-800/30 rounded-lg">
              <span className="text-slate-400">{c.from}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${c.type === 'S' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{c.type}</span>
              <span className="text-slate-400">→ {c.to}</span>
            </div>
          ))}
          {connections.length >= 3 && (
            <p className="text-xs text-amber-400 p-2 bg-amber-950/20 rounded-lg border border-amber-800/30">
              ⚠ Loops múltiplos detectados — verifique se há Shifting the Burden (soluções paliativas atrofiando melhorias estruturais).
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function GroupListening() {
  const [participants, setParticipants] = useState(2)
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState<'speak' | 'breathe' | 'idle'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [_silenceCount, setSilenceCount] = useState(0)
  const timerRef = { current: null as ReturnType<typeof setInterval> | null }

  const startTurn = () => {
    setPhase('speak')
    setElapsed(0)
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    timerRef.current = iv
    setTimeout(() => {
      clearInterval(iv)
      setPhase('breathe')
      setSilenceCount(0)
      setTimeout(() => {
        setPhase('idle')
        setCurrent(c => (c + 1) % participants)
      }, 6000)
    }, 90000)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">Dinâmica de escuta atenta em grupo — cada pessoa fala sem interrupção, seguida de pausa respiratória</p>
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500">Participantes:</label>
        <div className="flex items-center gap-2">
          <button onClick={() => setParticipants(p => Math.max(2, p - 1))} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors">−</button>
          <span className="text-slate-200 w-5 text-center">{participants}</span>
          <button onClick={() => setParticipants(p => Math.min(8, p + 1))} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors">+</button>
        </div>
      </div>

      <div className="grid gap-2">
        {Array.from({ length: participants }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${i === current ? 'border-blue-500/50 bg-blue-950/20' : 'border-slate-700/50 bg-slate-900/20'}`}
          >
            <span className="text-sm text-slate-300">Participante {i + 1}</span>
            {i === current && phase === 'speak' && (
              <span className="text-xs text-blue-400 font-mono">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
            )}
            {i === current && phase === 'breathe' && (
              <span className="text-xs text-cyan-400 animate-pulse">2 respirações profundas...</span>
            )}
          </div>
        ))}
      </div>

      {phase === 'idle' && (
        <button onClick={startTurn} className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-medium transition-colors">
          ▶ Turno: Participante {current + 1} (90s)
        </button>
      )}
    </div>
  )
}

export default function Module3() {
  const [view, setView] = useState<M3View>(null)

  const tools = [
    { id: 'iceberg', label: 'Iceberg Organizacional', sub: 'Evento → Padrão → Estrutura → M. Mental', color: '#3b82f6', glyph: '◭' },
    { id: 'bot', label: 'Gráficos BOT', sub: 'Behavior Over Time — Padrões', color: '#10b981', glyph: '◠' },
    { id: 'circle', label: 'Connection Circles', sub: 'Loops de reforço e balanceamento', color: '#06b6d4', glyph: '◌' },
    { id: 'group', label: 'Escuta Atenta em Grupo', sub: 'Timer de rodada com pausa autonômica', color: '#8b5cf6', glyph: '◍' },
  ] as const

  return (
    <div className="space-y-4">
      {!view ? (
        <div className="space-y-2.5">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id as M3View)}
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
          {view === 'iceberg' && <IcebergMapper />}
          {view === 'bot' && <BOTGraph />}
          {view === 'circle' && <ConnectionCircle />}
          {view === 'group' && <GroupListening />}
        </div>
      )}
    </div>
  )
}
