import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../../store/app_state.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/module_card.dart';

// ─── Iceberg Mapper ───────────────────────────────────────────────────────────
class IcebergMapper extends StatefulWidget {
  const IcebergMapper({super.key});

  @override
  State<IcebergMapper> createState() => _IcebergMapperState();
}

class _IcebergMapperState extends State<IcebergMapper> {
  int _step = 0;
  bool _saved = false;
  final controllers = {
    'event': TextEditingController(),
    'pattern': TextEditingController(),
    'structure': TextEditingController(),
    'mentalModel': TextEditingController(),
  };

  static const _layers = [
    ('event', 'EVENTO', 'O que aconteceu de forma imediata?', 'Ex: Atraso na entrega', kAccentRed),
    ('pattern', 'PADRÃO', 'Quais são as tendências ao longo do tempo?', 'Ex: Atrasos recorrentes todo trimestre', kAccentAmber),
    ('structure', 'ESTRUTURA', 'Que políticas ou conexões influenciam isso?', 'Ex: Processo de aprovação em cascata', kAccentBlue),
    ('mentalModel', 'MODELO MENTAL', 'Quais premissas os stakeholders sustentam?', 'Ex: "Velocidade é imprudência"', kAccentPurple),
  ];

  @override
  void dispose() {
    for (final c in controllers.values) c.dispose();
    super.dispose();
  }

  void _save() {
    context.read<AppState>().addSystemicProblem(SystemicProblem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      event: controllers['event']!.text,
      pattern: controllers['pattern']!.text,
      structure: controllers['structure']!.text,
      mentalModel: controllers['mentalModel']!.text,
      createdAt: DateTime.now(),
    ));
    context.read<AppState>().completeActivity('iceberg');
    setState(() => _saved = true);
  }

  @override
  Widget build(BuildContext context) {
    if (_saved) {
      return Column(children: [
        ..._layers.map((l) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: l.$5.withAlpha(15),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: l.$5.withAlpha(50)),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(l.$2, style: TextStyle(color: l.$5, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            const SizedBox(height: 4),
            Text(controllers[l.$1]!.text.isEmpty ? '—' : controllers[l.$1]!.text, style: const TextStyle(color: kSlate300, fontSize: 13, height: 1.4)),
          ]),
        )),
        const SizedBox(height: 12),
        PrimaryButton(label: 'Novo Problema', onTap: () { for (final c in controllers.values) c.clear(); setState(() { _step = 0; _saved = false; }); }, color: kSlate700, outline: true),
      ]);
    }

    final (key, label, question, example, color) = _layers[_step];

    return Column(children: [
      // Progress
      Row(children: _layers.asMap().entries.map((e) => Expanded(
        child: Container(
          height: 4, margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: e.key <= _step ? e.value.$5 : kSlate800,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      )).toList()),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: color.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: color.withAlpha(50))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.4)),
          const SizedBox(height: 4),
          Text(question, style: const TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w500)),
        ]),
      ),
      const SizedBox(height: 12),
      TextField(
        key: ValueKey(_step),
        controller: controllers[key],
        maxLines: 3,
        style: const TextStyle(color: kTextPrimary, fontSize: 14),
        decoration: InputDecoration(
          hintText: example,
          hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
          fillColor: kBgCard, filled: true, contentPadding: const EdgeInsets.all(14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kBorder)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: color)),
        ),
      ),
      const SizedBox(height: 16),
      Row(children: [
        if (_step > 0) Expanded(child: Padding(
          padding: const EdgeInsets.only(right: 6),
          child: PrimaryButton(label: '← Anterior', onTap: () => setState(() => _step--), color: kSlate700, outline: true),
        )),
        Expanded(child: PrimaryButton(
          label: _step < 3 ? 'Próxima Camada →' : 'Salvar Análise',
          onTap: () => _step < 3 ? setState(() => _step++) : _save(),
          color: _step < 3 ? color : kAccentPurple,
        )),
      ]),
    ]);
  }
}

const kSlate300 = Color(0xFFCBD5E1);

// ─── BOT Graph ────────────────────────────────────────────────────────────────
class BOTGraph extends StatefulWidget {
  const BOTGraph({super.key});

  @override
  State<BOTGraph> createState() => _BOTGraphState();
}

class _BOTGraphState extends State<BOTGraph> {
  final _varCtrl = TextEditingController();
  final List<({String name, Color color, List<double> data})> _variables = [];
  final _focusCtrl = TextEditingController();

  static const _colors = [kAccentBlue, kAccentGreen, kAccentAmber, kAccentRed, kAccentPurple];
  static const _months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];

  @override
  void dispose() { _varCtrl.dispose(); _focusCtrl.dispose(); super.dispose(); }

  void _addVar() {
    if (_varCtrl.text.trim().isEmpty) return;
    final base = [45.0, 52, 38, 61, 55, 72, 48, 65, 80];
    final r = DateTime.now().millisecond / 1000;
    setState(() {
      _variables.add((
        name: _varCtrl.text.trim(),
        color: _colors[_variables.length % _colors.length],
        data: base.map((v) => v * (0.7 + r * 0.6)).toList(),
      ));
      _varCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Row(children: [
        Expanded(child: TextField(
          controller: _varCtrl,
          style: const TextStyle(color: kTextPrimary, fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Variável (ex: satisfação clientes)',
            hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
            fillColor: kBgCard, filled: true, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kAccentBlue)),
          ),
          onSubmitted: (_) => _addVar(),
        )),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: _addVar,
          child: Container(
            width: 42, height: 42,
            decoration: BoxDecoration(color: kAccentBlue, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.add, color: Colors.white, size: 20),
          ),
        ),
      ]),
      if (_variables.isNotEmpty) ...[
        const SizedBox(height: 12),
        Wrap(
          spacing: 12, runSpacing: 6,
          children: _variables.map((v) => Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(shape: BoxShape.circle, color: v.color)),
            const SizedBox(width: 4),
            Text(v.name, style: const TextStyle(color: kSlate400, fontSize: 12)),
          ])).toList(),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 180,
          child: LineChart(LineChartData(
            backgroundColor: kBgCard,
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              getDrawingHorizontalLine: (_) => FlLine(color: kBorder, strokeWidth: 1),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(sideTitles: SideTitles(
                showTitles: true, reservedSize: 22,
                getTitlesWidget: (v, _) {
                  final i = v.toInt();
                  if (i < 0 || i >= _months.length) return const SizedBox();
                  return Text(_months[i], style: const TextStyle(color: kSlate500, fontSize: 10));
                },
              )),
            ),
            borderData: FlBorderData(show: false),
            lineBarsData: _variables.map((v) => LineChartBarData(
              spots: v.data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
              isCurved: true, color: v.color, barWidth: 2, dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(show: true, color: v.color.withAlpha(20)),
            )).toList(),
          )),
        ),
      ],
      const SizedBox(height: 12),
      TextField(
        controller: _focusCtrl,
        style: const TextStyle(color: kTextPrimary, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'Declaração de Foco: Por que este problema recorre?',
          hintStyle: const TextStyle(color: kSlate600, fontSize: 13),
          fillColor: kBgCard, filled: true, contentPadding: const EdgeInsets.all(12),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kAccentBlue)),
        ),
      ),
    ]);
  }
}

// ─── Module 3 Main ────────────────────────────────────────────────────────────
class Module3Screen extends StatefulWidget {
  const Module3Screen({super.key});

  @override
  State<Module3Screen> createState() => _Module3ScreenState();
}

class _Module3ScreenState extends State<Module3Screen> {
  String? _view;

  final _tools = [
    ('iceberg', 'Iceberg Organizacional', 'Evento → Padrão → Estrutura → Modelo Mental', kAccentBlue),
    ('bot', 'Gráficos BOT', 'Behavior Over Time — Padrões temporais', kAccentGreen),
    ('circle', 'Connection Circles', 'Loops de reforço (S) e balanceamento (O)', kAccentCyan),
    ('group', 'Escuta Atenta em Grupo', 'Timer de rodada com pausa autonômica', kAccentPurple),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgPrimary,
      appBar: AppBar(
        title: Text(_view == null ? 'Pensamento Sistêmico' : _tools.firstWhere((t) => t.$1 == _view).$2),
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
              child: ModuleCard(id: 0, icon: '◐', label: t.$2, sub: t.$1, desc: t.$3, color: t.$4, onTap: () => setState(() => _view = t.$1)),
            )).toList())
          : switch (_view) {
              'iceberg' => const IcebergMapper(),
              'bot' => const BOTGraph(),
              _ => const Center(child: Text('Em breve', style: TextStyle(color: kSlate500))),
            },
      ),
    );
  }
}
