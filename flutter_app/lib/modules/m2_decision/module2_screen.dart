import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../store/app_state.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/module_card.dart';

const List<String> kBiases = [
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
];

// ─── Decision Classifier ──────────────────────────────────────────────────────
class DecisionClassifierWidget extends StatefulWidget {
  const DecisionClassifierWidget({super.key});

  @override
  State<DecisionClassifierWidget> createState() => _DecisionClassifierWidgetState();
}

class _DecisionClassifierWidgetState extends State<DecisionClassifierWidget> {
  final _ctrl = TextEditingController();
  String? _type;
  List<bool> _biases = List.filled(25, false);
  int _step = 0; // 0=input 1=classify 2=biases 3=done

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  List<int> get _activeBiases => _biases.asMap().entries.where((e) => e.value).map((e) => e.key).toList();

  void _save() {
    context.read<AppState>().addDecision(Decision(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _ctrl.text,
      type: _type,
      biases: _activeBiases,
      createdAt: DateTime.now(),
    ));
    context.read<AppState>().completeActivity('decision');
    setState(() => _step = 3);
  }

  @override
  Widget build(BuildContext context) {
    return switch (_step) {
      0 => Column(children: [
          TextField(
            controller: _ctrl,
            maxLines: 3,
            style: const TextStyle(color: kTextPrimary, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Descreva a decisão que você precisa tomar...',
              hintStyle: const TextStyle(color: kSlate600),
              fillColor: kBgCard,
              filled: true,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kAccentBlue)),
            ),
          ),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Classificar Decisão', onTap: _ctrl.text.trim().isEmpty ? null : () => setState(() => _step = 1)),
        ]),
      1 => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('"${_ctrl.text}"', style: const TextStyle(color: kSlate300, fontSize: 14, fontStyle: FontStyle.italic)),
          const SizedBox(height: 12),
          const Text('É irreversível e consequente?', style: TextStyle(color: kSlate400, fontSize: 13)),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _type = 'type1'),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _type == 'type1' ? kAccentRed.withAlpha(25) : kBgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _type == 'type1' ? kAccentRed.withAlpha(100) : kBorder),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('TIPO 1', style: TextStyle(color: kAccentRed, fontWeight: FontWeight.bold, fontSize: 14)),
                  const Text('One-Way Door', style: TextStyle(color: kSlate400, fontSize: 12)),
                  const SizedBox(height: 8),
                  ...['Decisão lenta e deliberada', 'Análise profunda + dados', 'Memorando narrativo']
                    .map((s) => Text('• $s', style: const TextStyle(color: kSlate500, fontSize: 11))),
                ]),
              ),
            )),
            const SizedBox(width: 8),
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _type = 'type2'),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _type == 'type2' ? kAccentGreen.withAlpha(25) : kBgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _type == 'type2' ? kAccentGreen.withAlpha(100) : kBorder),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('TIPO 2', style: TextStyle(color: kAccentGreen, fontWeight: FontWeight.bold, fontSize: 14)),
                  const Text('Two-Way Door', style: TextStyle(color: kSlate400, fontSize: 12)),
                  const SizedBox(height: 8),
                  ...['Bias de ação imediato', '70% info é suficiente', 'Permita pivots rápidos']
                    .map((s) => Text('• $s', style: const TextStyle(color: kSlate500, fontSize: 11))),
                ]),
              ),
            )),
          ]),
          if (_type == 'type2') ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: kAccentAmber.withAlpha(20), borderRadius: BorderRadius.circular(12), border: Border.all(color: kAccentAmber.withAlpha(60))),
              child: const Text('⚡ Custo de lentidão é maior que custo de erro. Decida agora com as informações disponíveis.', style: TextStyle(color: kAccentAmber, fontSize: 12, height: 1.5)),
            ),
            const SizedBox(height: 12),
            PrimaryButton(label: 'Registrar Decisão Tipo 2', onTap: _save, color: kAccentGreen),
          ],
          if (_type == 'type1') ...[
            const SizedBox(height: 12),
            PrimaryButton(label: 'Verificar Vieses de Munger →', onTap: () => setState(() => _step = 2), color: kSlate700),
          ],
        ]),
      2 => Column(children: [
          if (_activeBiases.length >= 3)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: kAccentRed.withAlpha(20), borderRadius: BorderRadius.circular(12), border: Border.all(color: kAccentRed.withAlpha(60))),
              child: Text('⚠ ${_activeBiases.length} vieses identificados — risco de Lollapalooza.', style: const TextStyle(color: kAccentRed, fontSize: 12)),
            ),
          ...kBiases.asMap().entries.map((e) => GestureDetector(
            onTap: () => setState(() { final b = List<bool>.from(_biases); b[e.key] = !b[e.key]; _biases = b; }),
            child: Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: _biases[e.key] ? kAccentRed.withAlpha(20) : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _biases[e.key] ? kAccentRed.withAlpha(80) : Colors.transparent),
              ),
              child: Row(children: [
                Container(
                  width: 18, height: 18,
                  decoration: BoxDecoration(
                    color: _biases[e.key] ? kAccentRed : Colors.transparent,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: _biases[e.key] ? kAccentRed : kSlate600),
                  ),
                  child: _biases[e.key] ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                ),
                const SizedBox(width: 10),
                Expanded(child: Text('${e.key + 1}. ${e.value}', style: const TextStyle(color: kSlate300, fontSize: 12))),
              ]),
            ),
          )),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Registrar Decisão (${_activeBiases.length} vieses)', onTap: _save),
        ]),
      _ => Column(children: [
          const Icon(Icons.check_circle, color: kAccentGreen, size: 48),
          const SizedBox(height: 12),
          const Text('Decisão registrada!', style: TextStyle(color: kAccentGreen, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          PrimaryButton(label: 'Nova Decisão', onTap: () => setState(() { _ctrl.clear(); _type = null; _biases = List.filled(25, false); _step = 0; }), color: kSlate700, outline: true),
        ]),
    };
  }
}

const kSlate300 = Color(0xFFCBD5E1);

// ─── First Principles ─────────────────────────────────────────────────────────
class FirstPrinciplesWidget extends StatefulWidget {
  const FirstPrinciplesWidget({super.key});

  @override
  State<FirstPrinciplesWidget> createState() => _FirstPrinciplesWidgetState();
}

class _FirstPrinciplesWidgetState extends State<FirstPrinciplesWidget> {
  final _beliefCtrl = TextEditingController();
  final _rebuiltCtrl = TextEditingController();
  final List<TextEditingController> _decomposed = List.generate(4, (_) => TextEditingController());
  bool _saved = false;

  @override
  void dispose() {
    _beliefCtrl.dispose(); _rebuiltCtrl.dispose();
    for (final c in _decomposed) c.dispose();
    super.dispose();
  }

  void _save() {
    context.read<AppState>().addDecision(Decision(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _beliefCtrl.text,
      belief: _beliefCtrl.text,
      decomposed: _decomposed.map((c) => c.text).where((t) => t.isNotEmpty).toList(),
      rebuilt: _rebuiltCtrl.text,
      biases: [],
      createdAt: DateTime.now(),
    ));
    context.read<AppState>().completeActivity('first_principles');
    setState(() => _saved = true);
  }

  Widget _field(TextEditingController ctrl, String hint, {int maxLines = 1, Color? borderColor}) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      style: const TextStyle(color: kTextPrimary, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
        fillColor: kBgCard,
        filled: true,
        contentPadding: const EdgeInsets.all(12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: borderColor ?? kAccentBlue)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_saved) {
      return Column(children: [
        const Icon(Icons.check_circle, color: kAccentGreen, size: 48),
        const SizedBox(height: 12),
        const Text('Análise salva!', style: TextStyle(color: kAccentGreen, fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 16),
        PrimaryButton(label: 'Nova Análise', onTap: () => setState(() { _beliefCtrl.clear(); _rebuiltCtrl.clear(); for (final c in _decomposed) c.clear(); _saved = false; }), color: kSlate700, outline: true),
      ]);
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const SectionTitle('1. Crença / Analogia Tradicional'),
      _field(_beliefCtrl, '"Foguetes são caros de construir"'),
      const SizedBox(height: 16),
      const SectionTitle('2. Ingredientes Fundamentais'),
      ..._decomposed.asMap().entries.map((e) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: _field(e.value, 'Componente fundamental ${e.key + 1}', borderColor: kAccentCyan),
      )),
      const SizedBox(height: 8),
      const Text('Qual o custo real dos materiais? Qual a lacuna de eficiência?', style: TextStyle(color: kSlate500, fontSize: 12)),
      const SizedBox(height: 16),
      const SectionTitle('3. Reconstrução — Solução Inédita'),
      _field(_rebuiltCtrl, 'Como construir a solução otimizando diretamente a partir dos fundamentos...', maxLines: 3, borderColor: kAccentPurple),
      const SizedBox(height: 20),
      PrimaryButton(label: 'Salvar Análise', onTap: _beliefCtrl.text.isNotEmpty && _rebuiltCtrl.text.isNotEmpty ? _save : null, color: kAccentPurple),
    ]);
  }
}

// ─── Munger Latticework ────────────────────────────────────────────────────────
class MungerWidget extends StatefulWidget {
  const MungerWidget({super.key});

  @override
  State<MungerWidget> createState() => _MungerWidgetState();
}

class _MungerWidgetState extends State<MungerWidget> {
  int _tab = 0;
  final _goalCtrl = TextEditingController();
  final _circleCtrl = TextEditingController();
  String? _circleCategory;
  int _margin = 30;
  final _estimateCtrl = TextEditingController();
  final List<TextEditingController> _failures = [TextEditingController()];

  @override
  void dispose() {
    _goalCtrl.dispose(); _circleCtrl.dispose(); _estimateCtrl.dispose();
    for (final c in _failures) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Row(children: [
        for (final (i, label) in [('Inversão', 0), ('Círculo', 1), ('Margem', 2)])
          Expanded(child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: GestureDetector(
              onTap: () => setState(() => _tab = i),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: _tab == i ? kAccentAmber.withAlpha(60) : kBgCard,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _tab == i ? kAccentAmber.withAlpha(100) : kBorder),
                ),
                alignment: Alignment.center,
                child: Text(label, style: TextStyle(color: _tab == i ? kAccentAmber : kSlate400, fontSize: 12, fontWeight: FontWeight.w500)),
              ),
            ),
          )),
      ].expand((w) => [w]).toList()),
      const SizedBox(height: 16),
      if (_tab == 0) ...[
        const Text('Invert, Always Invert — Charlie Munger', style: TextStyle(color: kSlate400, fontSize: 13)),
        const SizedBox(height: 12),
        TextField(
          controller: _goalCtrl,
          onChanged: (_) => setState(() {}),
          style: const TextStyle(color: kTextPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: '"Como expandir minha startup"',
            hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
            fillColor: kBgCard, filled: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kAccentAmber)),
          ),
        ),
        if (_goalCtrl.text.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: kAccentAmber.withAlpha(20), borderRadius: BorderRadius.circular(14), border: Border.all(color: kAccentAmber.withAlpha(60))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Problema Invertido:', style: TextStyle(color: kAccentAmber, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('Como garantir que "${_goalCtrl.text.toLowerCase()}" falhe completamente?', style: const TextStyle(color: kSlate300, fontSize: 13, height: 1.5)),
            ]),
          ),
        ],
        const SizedBox(height: 12),
        ..._failures.asMap().entries.map((e) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: TextField(
            controller: e.value,
            style: const TextStyle(color: kTextPrimary, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Forma de falhar ${e.key + 1}',
              hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
              fillColor: kBgCard, filled: true, contentPadding: const EdgeInsets.all(12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kAccentAmber)),
            ),
          ),
        )),
        GestureDetector(
          onTap: () => setState(() => _failures.add(TextEditingController())),
          child: const Text('+ Adicionar forma de falhar', style: TextStyle(color: kAccentAmber, fontSize: 13)),
        ),
      ],
      if (_tab == 1) ...[
        const Text('Triagem do Círculo de Competência', style: TextStyle(color: kSlate400, fontSize: 13)),
        const SizedBox(height: 12),
        TextField(
          controller: _circleCtrl,
          style: const TextStyle(color: kTextPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Descreva o problema ou oportunidade...',
            hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
            fillColor: kBgCard, filled: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kAccentAmber)),
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          for (final (cat, label, color) in [('sim', 'SIM — Sei operar', kAccentGreen), ('nao', 'NÃO — Sem vantagem', kAccentRed), ('dificil', 'DIFÍCIL', kAccentAmber)])
            Expanded(child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: GestureDetector(
                onTap: () => setState(() => _circleCategory = cat),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                  decoration: BoxDecoration(
                    color: _circleCategory == cat ? color.withAlpha(25) : kBgCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _circleCategory == cat ? color.withAlpha(100) : kBorder),
                  ),
                  alignment: Alignment.center,
                  child: Text(label, style: TextStyle(color: _circleCategory == cat ? color : kSlate400, fontSize: 10, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
                ),
              ),
            )),
        ]),
        if (_circleCategory != null) ...[
          const SizedBox(height: 12),
          InfoCard(
            text: _circleCategory == 'sim'
              ? '🟢 Dentro do Círculo — Você tem vantagem. Avance com confiança calibrada.'
              : _circleCategory == 'nao'
                ? '🔴 Fora do Círculo — Delegar imediatamente. Não arrisque capital onde você não tem vantagem informacional.'
                : '🟡 Muito Difícil — Avalie se vale expandir o círculo ou buscar parceria.',
            color: _circleCategory == 'sim' ? kAccentGreen : _circleCategory == 'nao' ? kAccentRed : kAccentAmber,
            bgColor: (_circleCategory == 'sim' ? kAccentGreen : _circleCategory == 'nao' ? kAccentRed : kAccentAmber).withAlpha(15),
          ),
        ],
      ],
      if (_tab == 2) ...[
        const Text('Margem de Segurança — Buffer de Erro de Cálculo', style: TextStyle(color: kSlate400, fontSize: 13)),
        const SizedBox(height: 12),
        TextField(
          controller: _estimateCtrl,
          onChanged: (_) => setState(() {}),
          style: const TextStyle(color: kTextPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Ex: R\$ 100.000 ou 90 dias',
            hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
            fillColor: kBgCard, filled: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kAccentAmber)),
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          const Text('Estável (10%)', style: TextStyle(color: kSlate500, fontSize: 11)),
          Expanded(child: SliderTheme(
            data: SliderThemeData(thumbColor: kAccentAmber, activeTrackColor: kAccentAmber, inactiveTrackColor: kSlate700),
            child: Slider(value: _margin.toDouble(), min: 10, max: 60, divisions: 10, onChanged: (v) => setState(() => _margin = v.round())),
          )),
          const Text('Incerto (60%)', style: TextStyle(color: kSlate500, fontSize: 11)),
        ]),
        Text('$_margin% de margem de segurança', style: const TextStyle(color: kAccentAmber, fontWeight: FontWeight.bold, fontSize: 13), textAlign: TextAlign.center),
        if (_estimateCtrl.text.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: kAccentAmber.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: kAccentAmber.withAlpha(60))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Com margem de segurança:', style: TextStyle(color: kSlate400, fontSize: 12)),
              Text('${_estimateCtrl.text} + $_margin% de buffer', style: const TextStyle(color: kAccentAmber, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              const Text('Planeje para o pior cenário dentro do buffer.', style: TextStyle(color: kSlate500, fontSize: 12)),
            ]),
          ),
        ],
      ],
    ]);
  }
}

const kSlate300 = Color(0xFFCBD5E1);

// ─── Regret Minimization ──────────────────────────────────────────────────────
class RegretWidget extends StatefulWidget {
  const RegretWidget({super.key});

  @override
  State<RegretWidget> createState() => _RegretWidgetState();
}

class _RegretWidgetState extends State<RegretWidget> {
  final _ctrl = TextEditingController();
  bool _saved = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
        child: const Text(
          'Você tem 80 anos. Está sentado em uma cadeira de balanço, olhando para trás. Os ruídos e medos de hoje são invisíveis daqui.\n\nA única pergunta que importa: você se arrependerá de não ter tentado?',
          style: TextStyle(color: kSlate400, fontSize: 13, height: 1.6),
        ),
      ),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: kAccentGreen.withAlpha(15), borderRadius: BorderRadius.circular(12), border: Border.all(color: kAccentGreen.withAlpha(50))),
          child: const Column(children: [
            Text('Se tentar e falhar', style: TextStyle(color: kAccentGreen, fontSize: 12, fontWeight: FontWeight.w600)),
            SizedBox(height: 4),
            Text('Aprendizado, ajuste, pivot.', style: TextStyle(color: kSlate400, fontSize: 11), textAlign: TextAlign.center),
          ]),
        )),
        const SizedBox(width: 8),
        Expanded(child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: kAccentRed.withAlpha(15), borderRadius: BorderRadius.circular(12), border: Border.all(color: kAccentRed.withAlpha(50))),
          child: const Column(children: [
            Text('Se não tentar', style: TextStyle(color: kAccentRed, fontSize: 12, fontWeight: FontWeight.w600)),
            SizedBox(height: 4),
            Text('Arrependimento permanente.', style: TextStyle(color: kSlate400, fontSize: 11), textAlign: TextAlign.center),
          ]),
        )),
      ]),
      const SizedBox(height: 12),
      if (!_saved) ...[
        TextField(
          controller: _ctrl,
          maxLines: 4,
          style: const TextStyle(color: kTextPrimary, fontSize: 13),
          decoration: InputDecoration(
            hintText: 'O que o seu eu de 80 anos diria sobre esta decisão...',
            hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
            fillColor: kBgCard, filled: true, contentPadding: const EdgeInsets.all(12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kAccentAmber)),
          ),
        ),
        const SizedBox(height: 12),
        PrimaryButton(label: 'Salvar Perspectiva dos 80 Anos', onTap: () => setState(() => _saved = true), color: kAccentAmber),
      ] else ...[
        const Icon(Icons.check_circle, color: kAccentGreen, size: 40),
        const SizedBox(height: 8),
        const Text('Reflexão salva.', style: TextStyle(color: kAccentGreen, fontSize: 15, fontWeight: FontWeight.w600)),
      ],
    ]);
  }
}

// ─── Module 2 Main Screen ─────────────────────────────────────────────────────
class Module2Screen extends StatefulWidget {
  const Module2Screen({super.key});

  @override
  State<Module2Screen> createState() => _Module2ScreenState();
}

class _Module2ScreenState extends State<Module2Screen> {
  String? _view;

  final _tools = [
    ('classify', 'Classificador Tipo 1 / Tipo 2', 'Bezos — One-Way vs Two-Way Door', kAccentBlue),
    ('munger', 'Latticework de Munger', 'Inversão · Círculo · Margem de Segurança', kAccentAmber),
    ('first', 'Primeiros Princípios', 'Musk — Deconstrução e Reconstrução', kAccentPurple),
    ('regret', 'Regret Minimization', 'Bezos — Perspectiva dos 80 anos', kAccentGreen),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgPrimary,
      appBar: AppBar(
        title: Text(_view == null ? 'Decisão Estratégica' : _tools.firstWhere((t) => t.$1 == _view).$2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => _view == null ? Navigator.pop(context) : setState(() => _view = null),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _view == null
          ? Column(children: _tools.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ModuleCard(id: 0, icon: '◈', label: t.$2, sub: t.$1, desc: t.$3, color: t.$4, onTap: () => setState(() => _view = t.$1)),
            )).toList())
          : switch (_view) {
              'classify' => const DecisionClassifierWidget(),
              'munger' => const MungerWidget(),
              'first' => const FirstPrinciplesWidget(),
              _ => const RegretWidget(),
            },
      ),
    );
  }
}
