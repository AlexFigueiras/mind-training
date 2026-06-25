import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../store/app_state.dart';
import '../../theme.dart';
import '../../widgets/module_card.dart';

// ─── N-Back Engine ────────────────────────────────────────────────────────────
const _letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

class NBackStimulus {
  final int position;
  final String letter;
  NBackStimulus(this.position, this.letter);
}

class NBackTrial {
  final NBackStimulus stimulus;
  final bool isTarget;
  final bool? userResponse;
  bool get correct => isTarget ? userResponse == true : userResponse != true;
  NBackTrial({required this.stimulus, required this.isTarget, this.userResponse});
  NBackTrial withResponse(bool resp) => NBackTrial(stimulus: stimulus, isTarget: isTarget, userResponse: resp);
}

NBackStimulus _generateStimulus(List<NBackStimulus> history, int n) {
  final rng = Random();
  final isTarget = history.length >= n && rng.nextDouble() < 0.33;
  if (isTarget) return NBackStimulus(history[history.length - n].position, history[history.length - n].letter);
  int pos, attempts = 0;
  String letter;
  do {
    pos = rng.nextInt(9);
    letter = _letters[rng.nextInt(_letters.length)];
    attempts++;
  } while (attempts < 20 && history.length >= n &&
    pos == history[history.length - n].position &&
    letter == history[history.length - n].letter);
  return NBackStimulus(pos, letter);
}

class NBackGame extends StatefulWidget {
  final int n;
  final void Function(int score) onFinish;
  const NBackGame({super.key, required this.n, required this.onFinish});

  @override
  State<NBackGame> createState() => _NBackGameState();
}

class _NBackGameState extends State<NBackGame> {
  List<NBackStimulus> _history = [];
  List<NBackTrial> _trials = [];
  NBackStimulus? _current;
  bool _showing = false;
  bool _waitingResponse = false;
  String? _feedback;
  bool _responded = false;
  Timer? _timer;
  static const int _total = 22;

  @override
  void initState() {
    super.initState();
    _nextTrial();
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  void _nextTrial() {
    if (_trials.length >= _total) {
      final score = ((_trials.where((t) => t.correct).length / _total) * 100).round();
      widget.onFinish(score);
      return;
    }
    _responded = false;
    final stim = _generateStimulus(_history, widget.n);
    final isTarget = _history.length >= widget.n &&
      stim.position == _history[_history.length - widget.n].position &&
      stim.letter == _history[_history.length - widget.n].letter;
    _history = [..._history, stim];
    setState(() { _current = stim; _showing = true; _waitingResponse = true; _feedback = null; });
    _timer = Timer(const Duration(milliseconds: 600), () { if (mounted) setState(() => _showing = false); });
    Timer(const Duration(milliseconds: 2500), () {
      if (!_responded && mounted) {
        final trial = NBackTrial(stimulus: stim, isTarget: isTarget);
        setState(() { _trials = [..._trials, trial]; _waitingResponse = false; });
        _nextTrial();
      }
    });
  }

  void _respond() {
    if (!_waitingResponse || _responded || _current == null) return;
    _responded = true;
    _timer?.cancel();
    final isTarget = _history.length > widget.n &&
      _current!.position == _history[_history.length - widget.n - 1].position &&
      _current!.letter == _history[_history.length - widget.n - 1].letter;
    final correct = isTarget;
    setState(() {
      _trials = [..._trials, NBackTrial(stimulus: _current!, isTarget: isTarget, userResponse: true)];
      _feedback = correct ? 'correct' : 'wrong';
      _waitingResponse = false;
    });
    Future.delayed(const Duration(milliseconds: 500), () { if (mounted) _nextTrial(); });
  }

  int get _accuracy => _trials.isEmpty ? 0 : ((_trials.where((t) => t.correct).length / _trials.length) * 100).round();

  @override
  Widget build(BuildContext context) {
    return Focus(
      autofocus: true,
      onKeyEvent: (_, event) {
        if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.space) {
          _respond();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
          Text('${widget.n}-Back', style: const TextStyle(color: kAccentBlue, fontWeight: FontWeight.bold, fontSize: 13)),
          Text('${_trials.length}/$_total', style: const TextStyle(color: kSlate500, fontSize: 12)),
          Text('$_accuracy%', style: TextStyle(color: _accuracy >= 75 ? kAccentGreen : _accuracy >= 50 ? kAccentAmber : kAccentRed, fontWeight: FontWeight.w600, fontSize: 13)),
        ]),
        const SizedBox(height: 16),
        // 3x3 Grid
        GridView.builder(
          shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 1),
          itemCount: 9,
          itemBuilder: (_, i) {
            final active = _showing && _current?.position == i;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 120),
              decoration: BoxDecoration(
                color: active ? kAccentBlue.withAlpha(70) : kBgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: active ? kAccentBlue : kBorder, width: active ? 2 : 1),
              ),
              alignment: Alignment.center,
              child: Text(
                active ? (_current?.letter ?? '') : '',
                style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 22, fontWeight: FontWeight.bold),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 24,
          child: _feedback == 'correct'
            ? const Text('✓ Correto!', style: TextStyle(color: kAccentGreen, fontWeight: FontWeight.w600))
            : _feedback == 'wrong'
              ? const Text('✗ Falso positivo', style: TextStyle(color: kAccentRed, fontWeight: FontWeight.w600))
              : null,
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: _respond,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 40),
            decoration: BoxDecoration(
              color: _waitingResponse ? kAccentBlue : kSlate700,
              borderRadius: BorderRadius.circular(20),
              boxShadow: _waitingResponse ? [BoxShadow(color: kAccentBlue.withAlpha(80), blurRadius: 16, spreadRadius: 2)] : null,
            ),
            child: const Text('MATCH!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 2)),
          ),
        ),
        const SizedBox(height: 8),
        Text('Toque quando posição E letra = ${widget.n} ensaio(s) atrás', style: const TextStyle(color: kSlate600, fontSize: 11), textAlign: TextAlign.center),
      ]),
    );
  }
}

// ─── Huberman Protocol ────────────────────────────────────────────────────────
class HubermanProtocol extends StatefulWidget {
  const HubermanProtocol({super.key});

  @override
  State<HubermanProtocol> createState() => _HubermanProtocolState();
}

class _HubermanProtocolState extends State<HubermanProtocol> {
  int _step = 0;
  bool _timerRunning = false;
  int _focusSecs = 0;
  Timer? _focusTimer;

  static const _steps = [
    ('alert', '1. ALERTA', 'Faça 25–30 respirações de hiperventilação cíclica ou tome cafeína para ativar o alerta mental.', kAccentAmber, 'Estou alerta — próximo passo'),
    ('focus', '2. FOCO VISUAL', 'Fixe os olhos em um ponto específico da tela por 30–60 segundos sem desviar. Ativa o circuito de foco.', kAccentBlue, 'Olhos fixos — começar bloco'),
    ('reps', '3. REPETIÇÕES', 'Gere repetições cognitivas em alta velocidade. Mire 15% de erros — sinal ideal de plasticidade.', kAccentGreen, null),
    ('gaps', '5. GAP EFFECTS', 'Insira pausas aleatórias de 10s em silêncio total. O cérebro reprisa padrões aprendidos 10x mais rápido.', kAccentPurple, null),
    ('nsdr', '8. NSDR', 'Relaxamento profundo: Yoga Nidra, hipnose autorregulada ou sesta de 20 minutos. Consolida a aprendizagem.', kAccentCyan, 'Bloco completo!'),
  ];

  void _startFocusTimer() {
    setState(() { _timerRunning = true; });
    _focusTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() { _focusSecs++; });
      if (_focusSecs >= 5400) { _focusTimer?.cancel(); setState(() => _timerRunning = false); }
    });
  }

  void _handleStep(String id) {
    if (id == 'focus') {
      _startFocusTimer();
      setState(() => _step = 2);
    } else if (id == 'nsdr') {
      context.read<AppState>().incrementFocusBlock();
      setState(() => _step++);
    } else {
      setState(() => _step = (_step + 1).clamp(0, _steps.length - 1));
    }
  }

  String _formatTime(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() { _focusTimer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      if (_timerRunning) ...[
        Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
          child: Column(children: [
            const Text('Bloco de Foco Ativo', style: TextStyle(color: kSlate500, fontSize: 12)),
            const SizedBox(height: 4),
            Text(_formatTime(_focusSecs), style: const TextStyle(color: kTextPrimary, fontSize: 36, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
            const Text('/ 90:00', style: TextStyle(color: kSlate500, fontSize: 12)),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (_focusSecs / 5400).clamp(0.0, 1.0),
                backgroundColor: kSlate800, color: kAccentBlue, minHeight: 4,
              ),
            ),
          ]),
        ),
      ],
      ..._steps.asMap().entries.map((e) {
        final (id, label, desc, color, action) = e.value;
        final isActive = _step == e.key;
        final isDone = _step > e.key;
        return Opacity(
          opacity: isDone ? 0.4 : 1.0,
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isActive ? color.withAlpha(15) : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isActive ? color.withAlpha(60) : kBorder),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: isDone ? kAccentGreen : isActive ? color : kSlate700)),
                const SizedBox(width: 8),
                Text(label, style: TextStyle(color: isActive ? color : kSlate600, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                const Spacer(),
                if (isDone) const Icon(Icons.check, color: kAccentGreen, size: 14),
              ]),
              if (isActive) ...[
                const SizedBox(height: 8),
                Text(desc, style: const TextStyle(color: kSlate300, fontSize: 13, height: 1.5)),
                if (action != null) ...[
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => _handleStep(id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(color: color.withAlpha(40), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withAlpha(100))),
                      child: Text('$action →', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ],
            ]),
          ),
        );
      }),
      if (_step == 2 && !_timerRunning) ...[
        const SizedBox(height: 8),
        PrimaryButton(label: 'Iniciar Timer 90 Minutos', onTap: _startFocusTimer, color: kAccentGreen),
      ],
    ]);
  }
}

const kSlate300 = Color(0xFFCBD5E1);

// ─── Friction Sprints ─────────────────────────────────────────────────────────
class FrictionSprints extends StatelessWidget {
  const FrictionSprints({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
        child: const Text(
          'A aMCC (anterior midcingulate cortex) aumenta de volume apenas quando executamos tarefas sob fricção de resistência voluntária — fazer o que NÃO queremos. Cada micro-tarefa resistida expande fisicamente seu hub de força de vontade.',
          style: TextStyle(color: kSlate400, fontSize: 13, height: 1.6),
        ),
      ),
      const SizedBox(height: 16),
      ...state.habits.map((h) => GestureDetector(
        onTap: () {
          context.read<AppState>().toggleHabit(h.id);
          if (!h.completed) context.read<AppState>().completeActivity('habit_${h.id}');
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: h.completed ? kAccentGreen.withAlpha(15) : kBgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: h.completed ? kAccentGreen.withAlpha(60) : kBorder),
          ),
          child: Row(children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 22, height: 22,
              decoration: BoxDecoration(
                color: h.completed ? kAccentGreen : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: h.completed ? kAccentGreen : kSlate600, width: 2),
              ),
              child: h.completed ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(h.label, style: TextStyle(color: h.completed ? kSlate500 : kTextPrimary, fontSize: 14, decoration: h.completed ? TextDecoration.lineThrough : null))),
            if (!h.completed) const Text('Resistência ativa', style: TextStyle(color: kSlate600, fontSize: 11)),
          ]),
        ),
      )),
    ]);
  }
}

// ─── Module 4 Main ────────────────────────────────────────────────────────────
class Module4Screen extends StatefulWidget {
  const Module4Screen({super.key});

  @override
  State<Module4Screen> createState() => _Module4ScreenState();
}

class _Module4ScreenState extends State<Module4Screen> {
  String? _view;
  bool _nbackDone = false;
  int _nbackScore = 0;
  late int _nbackLevel;

  @override
  void initState() {
    super.initState();
    _nbackLevel = context.read<AppState>().nbackLevel;
  }

  void _handleNbackFinish(int score) {
    final state = context.read<AppState>();
    int newLevel = _nbackLevel;
    if (score >= 85) newLevel = min(_nbackLevel + 1, 6);
    else if (score < 75) newLevel = max(_nbackLevel - 1, 1);
    state.updateNback(newLevel, score);
    state.completeActivity('nback');
    setState(() { _nbackScore = score; _nbackDone = true; _nbackLevel = newLevel; });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final tools = [
      ('nback', 'Executive N-Back', 'Nível ${state.nbackLevel}-Back · Melhor: ${state.nbackBestScore}%', kAccentBlue),
      ('huberman', 'Super-Protocolo Huberman', 'Bloco de 90 minutos + NSDR', kAccentGreen),
      ('friction', 'Friction Sprints / aMCC', 'Expansão do hub de força de vontade', kAccentPurple),
    ];

    return Scaffold(
      backgroundColor: kBgPrimary,
      appBar: AppBar(
        title: Text(_view == null ? 'Neuroplasticidade' : tools.firstWhere((t) => t.$1 == _view).$2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => _view == null ? Navigator.pop(context) : setState(() { _view = null; _nbackDone = false; }),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _view == null
          ? Column(children: tools.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ModuleCard(id: 0, icon: '◆', label: t.$2, sub: t.$1, desc: t.$3, color: t.$4,
                onTap: () => setState(() { _view = t.$1; _nbackDone = false; })),
            )).toList())
          : _view == 'nback'
            ? _nbackDone
              ? Column(children: [
                  Text('$_nbackScore%', style: TextStyle(
                    color: _nbackScore >= 75 ? kAccentGreen : kAccentAmber,
                    fontSize: 56, fontWeight: FontWeight.bold,
                  )),
                  const SizedBox(height: 8),
                  Text(
                    _nbackScore >= 85 ? 'Avançando para ${min(_nbackLevel + 1, 6)}-Back' :
                    _nbackScore >= 75 ? 'Mantendo $_nbackLevel-Back' :
                    'Ajustando para ${max(_nbackLevel - 1, 1)}-Back',
                    style: const TextStyle(color: kSlate400, fontSize: 15),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: kAccentPurple.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: kAccentPurple.withAlpha(50))),
                    child: const Text('Sinergy Capacity: Aplique uma decisão estratégica agora — sua plasticidade e RAM mental estão expandidos.', style: TextStyle(color: kAccentPurple, fontSize: 13, height: 1.5)),
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(label: 'Jogar novamente', onTap: () => setState(() { _nbackDone = false; _nbackLevel = state.nbackLevel; })),
                ])
              : Column(children: [
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Text('Nível: ', style: TextStyle(color: kSlate500, fontSize: 13)),
                    ...List.generate(6, (i) => GestureDetector(
                      onTap: () => setState(() => _nbackLevel = i + 1),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 32, height: 32,
                        decoration: BoxDecoration(
                          color: _nbackLevel == i + 1 ? kAccentBlue : kBgCard,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _nbackLevel == i + 1 ? kAccentBlue : kBorder),
                        ),
                        alignment: Alignment.center,
                        child: Text('${i + 1}', style: TextStyle(color: _nbackLevel == i + 1 ? Colors.white : kSlate500, fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    )),
                  ]),
                  const SizedBox(height: 20),
                  NBackGame(key: ValueKey(_nbackLevel), n: _nbackLevel, onFinish: _handleNbackFinish),
                ])
            : _view == 'huberman'
              ? const HubermanProtocol()
              : const FrictionSprints(),
      ),
    );
  }
}
