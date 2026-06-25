import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../store/app_state.dart';
import '../../theme.dart';
import '../../widgets/breathing_circle.dart';
import '../../widgets/module_card.dart';

enum Protocol { sigh, box, hyper }

// ─── Physiological Sigh ──────────────────────────────────────────────────────
class SighScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const SighScreen({super.key, required this.onComplete});

  @override
  State<SighScreen> createState() => _SighScreenState();
}

class _SighScreenState extends State<SighScreen> {
  bool _running = false;
  int _round = 0;
  BreathPhase _phase = BreathPhase.inactive;
  String _label = 'Pronto para o Suspiro Fisiológico';
  double _progress = 0;
  static const int rounds = 5;

  Future<void> _run() async {
    setState(() { _running = true; });
    for (int r = 0; r < rounds; r++) {
      if (!mounted) return;
      setState(() { _round = r + 1; _phase = BreathPhase.inhale; _label = 'Inspire profundo pelo nariz'; _progress = 0.2; });
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;
      setState(() { _phase = BreathPhase.inhale2; _label = 'Gole de ar extra — infle ao máximo'; _progress = 0.5; });
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      setState(() { _phase = BreathPhase.exhale; _label = 'Expire lentamente pela boca (7s)'; _progress = 0.9; });
      await Future.delayed(const Duration(seconds: 7));
      if (!mounted) return;
      setState(() { _progress = 0; });
    }
    if (!mounted) return;
    setState(() { _phase = BreathPhase.inactive; _running = false; _label = 'Ciclo completo!'; });
    widget.onComplete();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        BreathingCircle(phase: _phase, label: _label, progress: _progress),
        const SizedBox(height: 12),
        if (_running) Text('Ciclo $_round/$rounds', style: const TextStyle(color: kSlate500, fontSize: 12)),
        const SizedBox(height: 16),
        if (!_running)
          PrimaryButton(label: 'Iniciar Suspiro Fisiológico', onTap: _run),
      ],
    );
  }
}

// ─── CO2 Test ────────────────────────────────────────────────────────────────
class CO2TestWidget extends StatefulWidget {
  final ValueChanged<int> onResult;
  const CO2TestWidget({super.key, required this.onResult});

  @override
  State<CO2TestWidget> createState() => _CO2TestWidgetState();
}

class _CO2TestWidgetState extends State<CO2TestWidget> {
  String _phase = 'idle'; // idle | breathe | timing | done
  int _elapsed = 0;
  Timer? _timer;

  void _startTest() {
    setState(() { _phase = 'breathe'; });
    Future.delayed(const Duration(seconds: 4), () {
      if (!mounted) return;
      setState(() { _phase = 'timing'; _elapsed = 0; });
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted) { _timer?.cancel(); return; }
        setState(() { _elapsed++; });
      });
    });
  }

  void _stop() {
    _timer?.cancel();
    setState(() { _phase = 'done'; });
    widget.onResult(_elapsed);
  }

  String _boxSecs(int s) {
    if (s <= 20) return '3–4s';
    if (s <= 45) return '5–6s';
    return '8–10s';
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return switch (_phase) {
      'idle' => Column(children: [
          const Text('Faça 4–5 respirações normais. Depois inspire ao máximo.', style: TextStyle(color: kSlate400, fontSize: 13), textAlign: TextAlign.center),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Iniciar Teste CO₂', onTap: _startTest, color: kAccentCyan),
        ]),
      'breathe' => const Text('Fazendo respirações normais... expire pelo nariz devagar', style: TextStyle(color: kAccentCyan, fontSize: 13), textAlign: TextAlign.center),
      'timing' => Column(children: [
          Text('$_elapsed s', style: const TextStyle(color: kAccentCyan, fontSize: 40, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
          const SizedBox(height: 8),
          const Text('Expire pelo nariz o mais devagar possível', style: TextStyle(color: kSlate400, fontSize: 13)),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Parei de expirar', onTap: _stop, color: kAccentRed),
        ]),
      _ => Column(children: [
          Text('CO₂ Discard Duration: $_elapsed s', style: const TextStyle(color: kAccentGreen, fontSize: 15, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text('Use ${_boxSecs(_elapsed)} por fase no Box Breathing', style: const TextStyle(color: kSlate400, fontSize: 13)),
        ]),
    };
  }
}

// ─── Box Breathing ───────────────────────────────────────────────────────────
class BoxScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const BoxScreen({super.key, required this.onComplete});

  @override
  State<BoxScreen> createState() => _BoxScreenState();
}

class _BoxScreenState extends State<BoxScreen> {
  int? _co2Result;
  bool _running = false;
  int _round = 0;
  BreathPhase _phase = BreathPhase.inactive;
  String _phaseLabel = '';
  int _countdown = 0;
  Timer? _timer;
  static const int rounds = 4;

  int get _duration => _co2Result == null ? 4 : (_co2Result! <= 20 ? 3 : _co2Result! <= 45 ? 5 : 8);

  Future<void> _run() async {
    setState(() { _running = true; });
    final phases = [
      (BreathPhase.inhale, 'INSPIRE'),
      (BreathPhase.holdFull, 'RETENHA CHEIO'),
      (BreathPhase.exhale, 'EXPIRE'),
      (BreathPhase.holdEmpty, 'RETENHA VAZIO'),
    ];

    for (int r = 0; r < rounds; r++) {
      if (!mounted) return;
      setState(() { _round = r + 1; });
      for (final (ph, name) in phases) {
        for (int t = _duration; t >= 0; t--) {
          if (!mounted) return;
          setState(() { _phase = ph; _phaseLabel = name; _countdown = t; });
          await Future.delayed(const Duration(seconds: 1));
        }
      }
    }
    if (!mounted) return;
    setState(() { _running = false; _phase = BreathPhase.inactive; });
    widget.onComplete();
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    if (_co2Result == null) {
      return Column(children: [
        const Text('Primeiro, calibre seu Box Breathing com o Teste CO₂.', style: TextStyle(color: kSlate400, fontSize: 13), textAlign: TextAlign.center),
        const SizedBox(height: 16),
        CO2TestWidget(onResult: (s) => setState(() { _co2Result = s; })),
      ]);
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: kAccentCyan.withAlpha(20),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: kAccentCyan.withAlpha(60)),
          ),
          child: Text('$_duration s por fase · CO₂: $_co2Result s', style: const TextStyle(color: kAccentCyan, fontSize: 11)),
        ),
        const SizedBox(height: 20),
        BreathingCircle(phase: _phase, label: _running ? _phaseLabel : 'Pronto', progress: 0),
        if (_running) ...[
          const SizedBox(height: 16),
          Text(_phaseLabel, style: const TextStyle(color: kTextPrimary, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 3)),
          const SizedBox(height: 4),
          Text('$_countdown', style: const TextStyle(color: kSlate400, fontSize: 32, fontFamily: 'monospace')),
          Text('Ciclo $_round/$rounds', style: const TextStyle(color: kSlate500, fontSize: 12)),
        ],
        const SizedBox(height: 20),
        if (!_running) PrimaryButton(label: 'Iniciar Box Breathing', onTap: _run),
      ],
    );
  }
}

// ─── Cyclic Hyperventilation ─────────────────────────────────────────────────
class HyperScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const HyperScreen({super.key, required this.onComplete});

  @override
  State<HyperScreen> createState() => _HyperScreenState();
}

class _HyperScreenState extends State<HyperScreen> {
  bool _accepted = false;
  bool _running = false;
  int _round = 0;
  int _breathCount = 0;
  int _holdSecs = 0;
  String _phase = 'idle';
  static const int rounds = 3;

  Future<void> _run() async {
    setState(() { _running = true; });
    for (int r = 0; r < rounds; r++) {
      if (!mounted) return;
      setState(() { _round = r + 1; _breathCount = 0; });
      for (int b = 1; b <= 25; b++) {
        if (!mounted) return;
        setState(() { _phase = 'inhale'; _breathCount = b; });
        await Future.delayed(const Duration(milliseconds: 700));
        if (!mounted) return;
        setState(() { _phase = 'exhale'; });
        await Future.delayed(const Duration(milliseconds: 400));
      }
      if (!mounted) return;
      setState(() { _phase = 'hold'; _holdSecs = 0; });
      for (int h = 0; h <= 30; h++) {
        if (!mounted) return;
        setState(() { _holdSecs = h; });
        await Future.delayed(const Duration(seconds: 1));
      }
    }
    if (!mounted) return;
    setState(() { _running = false; _phase = 'done'; });
    widget.onComplete();
  }

  @override
  Widget build(BuildContext context) {
    if (!_accepted) {
      return Column(children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kAccentRed.withAlpha(20),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kAccentRed.withAlpha(80)),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('⚠ ALERTA DE SEGURANÇA', style: TextStyle(color: kAccentRed, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            const Text('PROIBIDO realizar este exercício perto da água ou dirigindo — risco de desmaio. Use com extrema cautela se for propenso a ataques de pânico.', style: TextStyle(color: Color(0xFFFCA5A5), fontSize: 13, height: 1.5)),
          ]),
        ),
        const SizedBox(height: 16),
        PrimaryButton(label: 'Entendi os riscos — Continuar', onTap: () => setState(() => _accepted = true), color: kAccentAmber),
      ]);
    }

    return Column(
      children: [
        if (_phase == 'inhale') ...[
          BreathingCircle(phase: BreathPhase.inhale, label: 'Inspire rápido', progress: _breathCount / 25),
          const SizedBox(height: 12),
          Text('Respiração $_breathCount/25', style: const TextStyle(color: kAccentCyan, fontWeight: FontWeight.bold)),
        ] else if (_phase == 'exhale') ...[
          BreathingCircle(phase: BreathPhase.exhale, label: 'Expire passivo', progress: 0),
        ] else if (_phase == 'hold') ...[
          BreathingCircle(phase: BreathPhase.holdEmpty, label: 'RETENÇÃO\nPULMÕES VAZIOS', progress: _holdSecs / 30),
          const SizedBox(height: 8),
          Text('$_holdSecs s', style: const TextStyle(color: kAccentAmber, fontSize: 32, fontWeight: FontWeight.bold)),
        ] else ...[
          BreathingCircle(phase: BreathPhase.inactive, label: 'Pronto', progress: 0),
        ],
        if (_running) ...[
          const SizedBox(height: 8),
          Text('Rodada $_round/$rounds', style: const TextStyle(color: kSlate500, fontSize: 12)),
        ],
        if (!_running && _phase != 'done') ...[
          const SizedBox(height: 20),
          PrimaryButton(label: 'Iniciar Hiperventilação Cíclica', onTap: _run, color: kAccentPurple),
        ],
        if (_phase == 'done') ...[
          const SizedBox(height: 12),
          const Text('Protocolo completo!', style: TextStyle(color: kAccentGreen, fontSize: 15, fontWeight: FontWeight.w600)),
        ],
      ],
    );
  }
}

// ─── Module 1 Main Screen ────────────────────────────────────────────────────
class Module1Screen extends StatefulWidget {
  const Module1Screen({super.key});

  @override
  State<Module1Screen> createState() => _Module1ScreenState();
}

class _Module1ScreenState extends State<Module1Screen> {
  Protocol? _activeProtocol;
  bool _showSomatic = false;
  int _oculoStep = 0;
  bool _panoramicActive = false;

  static const vagalInfo = {
    VagalState.ventral: ('Vagal Ventral — Segurança', 'PFC e ACC operando em máxima capacidade. Estado ideal para decisão estratégica.', kAccentGreen),
    VagalState.sympathetic: ('Simpático — Luta ou Fuga', 'Foco estreito, reatividade. PFC parcialmente desativado. Ative um protocolo respiratório.', kAccentAmber),
    VagalState.dorsal: ('Vagal Dorsal — Paralisia', 'Retraimento e desengajamento. Protocolo de ativação necessário.', kAccentRed),
  };

  final oculoSteps = [
    'Mantenha a cabeça reta. Mova ambos os olhos para o extremo direito.',
    'Aguarde até bocejar, suspirar ou engolir (sinais de ativação vagal).',
    'Retorne ao centro. Agora mova para o extremo esquerdo.',
    'Aguarde novamente até bocejar, suspirar ou engolir.',
    'Retorne ao centro. Reset autonômico completo.',
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final (vagalLabel, vagalDesc, vagalColor) = vagalInfo[state.vagalState]!;

    return Scaffold(
      backgroundColor: kBgPrimary,
      appBar: AppBar(
        title: const Text('Regulação Fisiológica'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vagal state selector
            const SectionTitle('Estado do SNA Agora'),
            Row(
              children: VagalState.values.map((vs) {
                final (l, _, c) = vagalInfo[vs]!;
                final active = state.vagalState == vs;
                final shortLabel = vs == VagalState.ventral ? 'Ventral' : vs == VagalState.sympathetic ? 'Simpático' : 'Dorsal';
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: GestureDetector(
                      onTap: () => context.read<AppState>().setVagalState(vs),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                        decoration: BoxDecoration(
                          color: active ? c.withAlpha(25) : kBgCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: active ? c.withAlpha(100) : kBorder),
                        ),
                        child: Column(children: [
                          Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: c)),
                          const SizedBox(height: 6),
                          Text(shortLabel, style: TextStyle(fontSize: 11, color: active ? kTextPrimary : kSlate500, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
                        ]),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: vagalColor.withAlpha(20),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: vagalColor.withAlpha(60)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(vagalLabel, style: TextStyle(color: vagalColor, fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(vagalDesc, style: const TextStyle(color: kSlate400, fontSize: 12, height: 1.5)),
              ]),
            ),
            const SizedBox(height: 24),

            // Protocol selection
            const SectionTitle('Protocolos Respiratórios'),
            ...[
              (Protocol.sigh, 'Suspiro Fisiológico Cíclico', 'Pico de estresse / pré-decisão', kAccentBlue),
              (Protocol.box, 'Box Breathing', 'Pressão extrema / ansiedade aguda', kAccentCyan),
              (Protocol.hyper, 'Hiperventilação Cíclica', 'Aumento de alerta mental / foco', kAccentPurple),
            ].map((t) {
              final (p, label, trigger, color) = t;
              return GestureDetector(
                onTap: () => setState(() => _activeProtocol = _activeProtocol == p ? null : p),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: kBgCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _activeProtocol == p ? color.withAlpha(100) : kBorder),
                  ),
                  child: Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(label, style: const TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 2),
                      Text(trigger, style: const TextStyle(color: kSlate500, fontSize: 12)),
                    ])),
                    Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
                  ]),
                ),
              );
            }),

            // Active protocol
            if (_activeProtocol != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: kBgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: kBorder),
                ),
                child: switch (_activeProtocol!) {
                  Protocol.sigh => SighScreen(onComplete: () {
                    context.read<AppState>().completeActivity('sigh');
                    setState(() => _activeProtocol = null);
                  }),
                  Protocol.box => BoxScreen(onComplete: () {
                    context.read<AppState>().completeActivity('box');
                    setState(() => _activeProtocol = null);
                  }),
                  Protocol.hyper => HyperScreen(onComplete: () {
                    context.read<AppState>().completeActivity('hyper');
                    setState(() => _activeProtocol = null);
                  }),
                },
              ),
            ],
            const SizedBox(height: 24),

            // Somatic techniques
            GestureDetector(
              onTap: () => setState(() => _showSomatic = !_showSomatic),
              child: Row(children: [
                const Text('TÉCNICAS SOMÁTICAS AUXILIARES', style: TextStyle(color: kSlate500, fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w600)),
                const Spacer(),
                Icon(_showSomatic ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: kSlate600, size: 18),
              ]),
            ),
            if (_showSomatic) ...[
              const SizedBox(height: 12),
              // Panoramic Soften
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Expanded(child: Text('Suavização Panorâmica', style: TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w500))),
                    GestureDetector(
                      onTap: () => setState(() => _panoramicActive = !_panoramicActive),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: kAccentBlue.withAlpha(40), borderRadius: BorderRadius.circular(8)),
                        child: Text(_panoramicActive ? 'Pausar' : 'Iniciar', style: const TextStyle(color: kAccentBlue, fontSize: 12)),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 4),
                  const Text('Desativa resposta simpática de visão de túnel', style: TextStyle(color: kSlate500, fontSize: 12)),
                  if (_panoramicActive) ...[
                    const SizedBox(height: 12),
                    ...['Olhe para frente, sem fixar em nada específico.', 'Relaxe os músculos ao redor dos olhos.', 'Expanda para a visão periférica — perceba as bordas.', 'Mantenha o olhar panorâmico por 30 segundos. A amígdala desativa.']
                      .asMap().entries.map((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('${e.key + 1}.  ', style: const TextStyle(color: kAccentBlue, fontSize: 12)),
                          Expanded(child: Text(e.value, style: const TextStyle(color: kSlate300, fontSize: 12, height: 1.4))),
                        ]),
                      )),
                  ],
                ]),
              ),
              const SizedBox(height: 8),
              // Oculocardiac Reset
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Expanded(child: Text('Reset Oculocardíaco Vago', style: TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w500))),
                    GestureDetector(
                      onTap: () => setState(() => _oculoStep = (_oculoStep + 1) % (oculoSteps.length + 1)),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: kAccentCyan.withAlpha(40), borderRadius: BorderRadius.circular(8)),
                        child: Text(_oculoStep == 0 ? 'Iniciar' : _oculoStep >= oculoSteps.length ? 'Reset' : 'Próximo', style: const TextStyle(color: kAccentCyan, fontSize: 12)),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 4),
                  const Text('Ativação vagal via movimentos oculares', style: TextStyle(color: kSlate500, fontSize: 12)),
                  if (_oculoStep > 0 && _oculoStep <= oculoSteps.length) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: kSlate800, borderRadius: BorderRadius.circular(10)),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Passo $_oculoStep:  ', style: const TextStyle(color: kAccentCyan, fontSize: 13, fontWeight: FontWeight.bold)),
                        Expanded(child: Text(oculoSteps[_oculoStep - 1], style: const TextStyle(color: kSlate300, fontSize: 13, height: 1.4))),
                      ]),
                    ),
                  ],
                ]),
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

const kSlate300 = Color(0xFFCBD5E1);
