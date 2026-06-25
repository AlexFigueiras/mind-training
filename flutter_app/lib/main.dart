import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'store/app_state.dart';
import 'theme.dart';
import 'modules/m1_physio/module1_screen.dart';
import 'modules/m2_decision/module2_screen.dart';
import 'modules/m3_systemic/module3_screen.dart';
import 'modules/m4_cognitive/module4_screen.dart';
import 'modules/m5_gamification/module5_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final state = AppState();
  await state.init();
  runApp(
    ChangeNotifierProvider.value(value: state, child: const SincApp()),
  );
}

class SincApp extends StatelessWidget {
  const SincApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SINC — Neuroengenharia Cognitiva',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const HomeScreen(),
    );
  }
}

// ─── Module metadata ─────────────────────────────────────────────────────────
class ModuleMeta {
  final int id;
  final String icon;
  final String label;
  final String sub;
  final String desc;
  final Color color;
  final Widget Function() builder;

  const ModuleMeta({
    required this.id, required this.icon, required this.label,
    required this.sub, required this.desc, required this.color,
    required this.builder,
  });
}

final kModules = [
  ModuleMeta(id: 1, icon: '◎', label: 'Regulação Fisiológica', sub: 'Base do Sistema',
    desc: 'Teoria Polivagal · Respiração · Tônus Vagal', color: kAccentGreen,
    builder: () => const Module1Screen()),
  ModuleMeta(id: 2, icon: '◈', label: 'Decisão Estratégica', sub: 'Elite Framework',
    desc: 'Bezos · Munger · Primeiros Princípios', color: kAccentBlue,
    builder: () => const Module2Screen()),
  ModuleMeta(id: 3, icon: '◐', label: 'Pensamento Sistêmico', sub: 'Motor de Loops',
    desc: 'Iceberg · BOT Graphs · Connection Circles', color: kAccentCyan,
    builder: () => const Module3Screen()),
  ModuleMeta(id: 4, icon: '◆', label: 'Neuroplasticidade', sub: 'Treinamento Cognitivo',
    desc: 'N-Back · Huberman · aMCC Sprints', color: kAccentPurple,
    builder: () => const Module4Screen()),
  ModuleMeta(id: 5, icon: '◇', label: 'Gamificação Ética', sub: 'Motor de Hábitos',
    desc: 'Fogg B=MAP · Streaks · Loot Tables', color: kAccentAmber,
    builder: () => const Module5Screen()),
];

// ─── Home Screen ─────────────────────────────────────────────────────────────
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final vagalColor = state.vagalState == VagalState.ventral
      ? kAccentGreen : state.vagalState == VagalState.sympathetic
        ? kAccentAmber : kAccentRed;
    final vagalLabel = state.vagalState == VagalState.ventral
      ? 'Ventral' : state.vagalState == VagalState.sympathetic
        ? 'Simpático' : 'Dorsal';

    return Scaffold(
      backgroundColor: kBgPrimary,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            pinned: true,
            backgroundColor: kBgPrimary.withAlpha(245),
            elevation: 0,
            expandedHeight: 120,
            flexibleSpace: FlexibleSpaceBar(
              background: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      const Text('SINC', style: TextStyle(color: kSlate400, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 3)),
                      const SizedBox(height: 4),
                      ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [kAccentBlue, kAccentCyan, kAccentPurple],
                        ).createShader(bounds),
                        child: const Text(
                          'Neuroengenharia\nCognitiva',
                          style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, height: 1.2),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            title: Row(children: [
              Container(width: 7, height: 7, decoration: BoxDecoration(shape: BoxShape.circle, color: vagalColor)),
              const SizedBox(width: 6),
              Text(vagalLabel, style: const TextStyle(color: kSlate500, fontSize: 12)),
              const Spacer(),
              Text('${state.consecutiveCycles}🔥', style: const TextStyle(color: kAccentAmber, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: kAccentBlue.withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: kAccentBlue.withAlpha(60)),
                ),
                child: Text('${state.totalPoints} pts', style: const TextStyle(color: kAccentBlue, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ]),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(delegate: SliverChildListDelegate([
              // Architecture diagram
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
                child: Column(children: [
                  const Text('ARQUITETURA DO SISTEMA', style: TextStyle(color: kSlate600, fontSize: 9, letterSpacing: 1.8, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  ...kModules.reversed.map((m) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(children: [
                      SizedBox(width: 28, child: Text('M${m.id}', style: const TextStyle(color: kSlate700, fontSize: 10, fontFamily: 'monospace'), textAlign: TextAlign.right)),
                      const SizedBox(width: 8),
                      Expanded(child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                        decoration: BoxDecoration(color: m.color.withAlpha(18), borderRadius: BorderRadius.circular(8), border: Border.all(color: m.color.withAlpha(35))),
                        child: Text(m.label, style: TextStyle(color: m.color, fontSize: 11, fontWeight: FontWeight.w500)),
                      )),
                    ]),
                  )),
                  const SizedBox(height: 4),
                  const Text('M1 alimenta M2–M5 · Base fisiológica primeiro', style: TextStyle(color: kSlate700, fontSize: 10)),
                ]),
              ),
              const SizedBox(height: 20),

              // Modules
              const Text('MÓDULOS', style: TextStyle(color: kSlate500, fontSize: 10, letterSpacing: 1.6, fontWeight: FontWeight.w600)),
              const SizedBox(height: 10),
              ...kModules.map((m) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChangeNotifierProvider.value(value: state, child: m.builder()))),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: kBgCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: kBorder),
                    ),
                    child: Row(children: [
                      Text(m.icon, style: TextStyle(fontSize: 24, color: m.color)),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(m.label, style: const TextStyle(color: kTextPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Text(m.desc, style: const TextStyle(color: kSlate500, fontSize: 12)),
                      ])),
                      const Icon(Icons.arrow_forward_ios, size: 13, color: kSlate700),
                    ]),
                  ),
                ),
              )),
              const SizedBox(height: 10),

              // Stats
              Row(children: [
                Expanded(child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
                  child: Column(children: [
                    Text('${state.completedToday.length}', style: const TextStyle(color: kTextPrimary, fontSize: 22, fontWeight: FontWeight.bold)),
                    const Text('Atividades hoje', style: TextStyle(color: kSlate500, fontSize: 11)),
                  ]),
                )),
                const SizedBox(width: 10),
                Expanded(child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: kBgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
                  child: Column(children: [
                    Text('${state.nbackLevel}-Back', style: const TextStyle(color: kAccentPurple, fontSize: 22, fontWeight: FontWeight.bold)),
                    const Text('Nível cognitivo', style: TextStyle(color: kSlate500, fontSize: 11)),
                  ]),
                )),
              ]),
              const SizedBox(height: 40),
            ])),
          ),
        ],
      ),
    );
  }
}
