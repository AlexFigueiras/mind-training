import 'package:flutter/material.dart';
import '../theme.dart';

enum BreathPhase { inhale, inhale2, exhale, holdFull, holdEmpty, inactive }

class BreathingCircle extends StatefulWidget {
  final BreathPhase phase;
  final String label;
  final double progress;

  const BreathingCircle({
    super.key,
    required this.phase,
    required this.label,
    this.progress = 0,
  });

  @override
  State<BreathingCircle> createState() => _BreathingCircleState();
}

class _BreathingCircleState extends State<BreathingCircle> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 4));
    _scaleAnim = Tween<double>(begin: 0.7, end: 1.25).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _updateAnimation();
  }

  @override
  void didUpdateWidget(BreathingCircle old) {
    super.didUpdateWidget(old);
    if (old.phase != widget.phase) _updateAnimation();
  }

  void _updateAnimation() {
    switch (widget.phase) {
      case BreathPhase.inhale:
      case BreathPhase.inhale2:
        _ctrl.forward(from: 0);
        break;
      case BreathPhase.exhale:
        _ctrl.reverse(from: 1);
        break;
      case BreathPhase.holdFull:
        _ctrl.value = 1.0;
        break;
      case BreathPhase.holdEmpty:
        _ctrl.value = 0.0;
        break;
      case BreathPhase.inactive:
        _ctrl.value = 0.5;
        break;
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AnimatedBuilder(
          animation: _scaleAnim,
          builder: (_, __) => Transform.scale(
            scale: _scaleAnim.value,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: kAccentBlue.withAlpha(180), width: 2),
                gradient: RadialGradient(colors: [
                  kAccentBlue.withAlpha(60),
                  kAccentBlue.withAlpha(10),
                ]),
              ),
              alignment: Alignment.center,
              child: Text(
                widget.label,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ),
        if (widget.progress > 0) ...[
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: widget.progress,
              backgroundColor: kSlate800,
              color: kAccentBlue,
              minHeight: 4,
            ),
          ),
        ],
      ],
    );
  }
}
