import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../store/app_state.dart';
import '../../theme.dart';
import '../../widgets/module_card.dart';

const _lootTable = [
  ('Insight Desbloqueado', 'Você ativou plasticidade suficiente para absorver um novo modelo mental hoje.', kAccentBlue, 'comum'),
  ('Estado de Fluxo', 'Dopamina calibrada. Você está no pico do desempenho cognitivo agora.', kAccentGreen, 'incomum'),
  ('Ciclo Composto', 'Seu streak está gerando retornos exponenciais na arquitetura neural.', kAccentPurple, 'raro'),
  ('Rede Ventral Dominante', 'PFC e ACC em sincronia máxima. Janela de decisão de elite ativa.', kAccentAmber, 'épico'),
  ('Modo Musk/Bezos', 'Convergência de todos os módulos. Estado de pensamento sistêmico de elite ativado.', kAccentRed, 'lendário'),
];

(String, String, Color, String) _getLoot() {
  final r = Random().nextDouble();
  if (r < 0.40) return _lootTable[0];
  if (r < 0.65) return _lootTable[1];
  if (r < 0.82) return _lootTable[2];
  if (r < 0.94) return _lootTable[3];
  return _lootTable[4];
}

class Module5Screen extends StatefulWidget {
  const Module5Screen({super.key});

  @override
  State<Module5Screen> createState() => _Module5ScreenState();
}

class _Module5ScreenState extends State<Module5Screen> {
  (String, String, Color, String)? _loot;
  bool _lootClaimed = false;
  bool _showRespawn = false;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    const totalActivities = 6;
    final completedToday = state.completedToday.length;
    final progress = (completedToday / totalActivities).clamp(0.0, 1.0);
    final pts = state.currentScoreInt;

    return Scaffold(
      backgroundColor: kBgPrimary,
      appBar: AppBar(
        title: const Text('Gamificação Ética'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Score cards
            Row(children: [
              _StatCard('${state.totalPoints}', 'Pts Totais', kTextPrimary),
              const SizedBox(width: 10),
              _StatCard('${state.consecutiveCycles}🔥', 'Streak', kAccentBlue),
              const SizedBox(width: 10),
              _StatCard('+$pts', 'Pts/Ciclo', kAccentAmber),
            ]),
            const SizedBox(height: 20),

            // Daily progress
            const SectionTitle('Progresso Diário'),
            Row(children: [
              Expanded(child: ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: kSlate800,
                  color: progress >= 1.0 ? kAccentGreen : kAccentBlue,
                  minHeight: 8,
                ),
              )),
              const SizedBox(width: 12),
              Text('$completedToday/$totalActivities', style: const TextStyle(color: kSlate500, fontSize: 12)),
            ]),
            if (progress >= 1.0) ...[
              const SizedBox(height: 6),
              const Text('Todos os módulos completos hoje!', style: TextStyle(color: kAccentGreen, fontSize: 12)),
            ],
            const SizedBox(height: 20),

            // Fogg B=MAP
            const SectionTitle('Modelo Fogg — B = MAP'),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                _FoggIndicator('Motivation', min(100, 60 + state.consecutiveCycles * 3)),
                _FoggIndicator('Ability', max(10, 80 - state.failureIndex * 5)),
                _FoggIndicator('Prompt', completedToday > 0 ? 90 : 40),
              ]),
            ),
            const SizedBox(height: 20),

            // Score formula
            const SectionTitle('Fórmula de Pontuação'),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Pₜ = Pbase × (1 + α·Sₜ) · e^(−β·Fₜ)', style: TextStyle(color: kTextPrimary, fontSize: 14, fontFamily: 'monospace')),
                const SizedBox(height: 10),
                Wrap(spacing: 16, runSpacing: 6, children: [
                  _FormulaItem('Pbase', '100'),
                  _FormulaItem('Sₜ (streak)', '${state.consecutiveCycles}'),
                  _FormulaItem('α', '0.15'),
                  _FormulaItem('Fₜ (falhas)', '${state.failureIndex}'),
                  _FormulaItem('β', '0.08'),
                  _FormulaItem('Pₜ resultado', '$pts pts', highlight: true),
                ]),
              ]),
            ),
            const SizedBox(height: 20),

            // Actions
            Row(children: [
              Expanded(child: GestureDetector(
                onTap: () => setState(() { _loot = _getLoot(); _lootClaimed = false; }),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: kAccentPurple.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: kAccentPurple.withAlpha(50))),
                  child: const Column(children: [
                    Text('🎲 Loot Table', style: TextStyle(color: kAccentPurple, fontWeight: FontWeight.bold, fontSize: 13)),
                    SizedBox(height: 2),
                    Text('Recompensa aleatória', style: TextStyle(color: kSlate500, fontSize: 11)),
                  ]),
                ),
              )),
              const SizedBox(width: 10),
              Expanded(child: GestureDetector(
                onTap: () => setState(() => _showRespawn = !_showRespawn),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: kAccentAmber.withAlpha(15), borderRadius: BorderRadius.circular(14), border: Border.all(color: kAccentAmber.withAlpha(50))),
                  child: const Column(children: [
                    Text('↺ Respawn', style: TextStyle(color: kAccentAmber, fontWeight: FontWeight.bold, fontSize: 13)),
                    SizedBox(height: 2),
                    Text('Quebrou o streak?', style: TextStyle(color: kSlate500, fontSize: 11)),
                  ]),
                ),
              )),
            ]),

            // Loot reveal
            if (_loot != null && !_lootClaimed) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: _loot!.$3.withAlpha(15), borderRadius: BorderRadius.circular(20), border: Border.all(color: _loot!.$3.withAlpha(60))),
                child: Column(children: [
                  Text(_loot!.$4.toUpperCase(), style: TextStyle(color: _loot!.$3, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.6)),
                  const SizedBox(height: 8),
                  Text(_loot!.$1, style: const TextStyle(color: kTextPrimary, fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                  const SizedBox(height: 6),
                  Text(_loot!.$2, style: const TextStyle(color: kSlate400, fontSize: 13, height: 1.5), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  PrimaryButton(label: 'Reivindicar Recompensa', onTap: () => setState(() => _lootClaimed = true), color: _loot!.$3),
                ]),
              ),
            ],
            if (_lootClaimed) ...[
              const SizedBox(height: 12),
              const Center(child: Text('Recompensa reivindicada!', style: TextStyle(color: kAccentGreen, fontSize: 14, fontWeight: FontWeight.w600))),
            ],

            // Respawn Protocol
            if (_showRespawn) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Respawn Protocol — Dados de Recalibração', style: TextStyle(color: kTextPrimary, fontSize: 15, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('A quebra de sequência não é falha — é dado frio de estratégia. Seu sistema nervoso aprendeu o que não funciona.', style: TextStyle(color: kSlate400, fontSize: 13, height: 1.5)),
                  const SizedBox(height: 12),
                  const SectionTitle('Diagnóstico Rápido'),
                  ...['Carga cognitiva excessiva?', 'Barreira de fricção muito alta?', 'Motivação intrínseca fraca?', 'Contexto ambiental desfavorável?'].map((q) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(children: [
                      Container(width: 18, height: 18, decoration: BoxDecoration(borderRadius: BorderRadius.circular(4), border: Border.all(color: kSlate600))),
                      const SizedBox(width: 10),
                      Text(q, style: const TextStyle(color: kSlate300, fontSize: 13)),
                    ]),
                  )),
                  const SizedBox(height: 12),
                  PrimaryButton(label: '↺ Recomeço Tático Imediato', onTap: () {
                    context.read<AppState>().recordFailure();
                    setState(() => _showRespawn = false);
                  }),
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

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  const _StatCard(this.value, this.label, this.color);

  @override
  Widget build(BuildContext context) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 12),
    decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
    alignment: Alignment.center,
    child: Column(children: [
      Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 2),
      Text(label, style: const TextStyle(color: kSlate500, fontSize: 11)),
    ]),
  ));
}

class _FoggIndicator extends StatelessWidget {
  final String label;
  final int value;
  const _FoggIndicator(this.label, this.value);

  @override
  Widget build(BuildContext context) => Column(children: [
    SizedBox(
      width: 50, height: 50,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: value / 100,
            backgroundColor: kSlate800,
            color: kAccentBlue,
            strokeWidth: 4,
          ),
          Text('$value%', style: const TextStyle(color: kTextPrimary, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    ),
    const SizedBox(height: 6),
    Text(label, style: const TextStyle(color: kSlate400, fontSize: 11)),
  ]);
}

class _FormulaItem extends StatelessWidget {
  final String name;
  final String value;
  final bool highlight;
  const _FormulaItem(this.name, this.value, {this.highlight = false});

  @override
  Widget build(BuildContext context) => RichText(text: TextSpan(children: [
    TextSpan(text: '$name = ', style: const TextStyle(color: kSlate500, fontSize: 12, fontFamily: 'monospace')),
    TextSpan(text: value, style: TextStyle(color: highlight ? kAccentBlue : kTextPrimary, fontSize: 12, fontWeight: highlight ? FontWeight.bold : FontWeight.normal, fontFamily: 'monospace')),
  ]));
}
