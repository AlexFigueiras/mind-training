import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

const double kAlpha = 0.15;
const double kBeta = 0.08;
const double kPBase = 100.0;

enum VagalState { ventral, sympathetic, dorsal }

class AppState extends ChangeNotifier {
  // Vagal state
  VagalState vagalState = VagalState.ventral;

  // Gamification
  int totalPoints = 0;
  int failureIndex = 0;
  int consecutiveCycles = 0;
  List<String> completedToday = [];

  // N-Back
  int nbackLevel = 2;
  int nbackBestScore = 0;

  // Focus blocks
  int focusBlocksToday = 0;

  // Habits
  List<Habit> habits = [
    Habit(id: 'cold', label: 'Ducha fria 30s'),
    Habit(id: 'desk', label: 'Organizar mesa de trabalho'),
    Habit(id: 'walk', label: 'Caminhada 5 min sem celular'),
  ];

  // Data
  List<Decision> decisions = [];
  List<SystemicProblem> systemicProblems = [];

  SharedPreferences? _prefs;

  double get currentScore {
    return kPBase * (1 + kAlpha * consecutiveCycles) * exp(-kBeta * failureIndex);
  }

  int get currentScoreInt => currentScore.round();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _load();
  }

  void _load() {
    final raw = _prefs?.getString('sinc_state');
    if (raw == null) return;
    try {
      final j = jsonDecode(raw) as Map<String, dynamic>;
      vagalState = VagalState.values.firstWhere(
        (v) => v.name == (j['vagalState'] ?? 'ventral'),
        orElse: () => VagalState.ventral,
      );
      totalPoints = j['totalPoints'] ?? 0;
      failureIndex = j['failureIndex'] ?? 0;
      consecutiveCycles = j['consecutiveCycles'] ?? 0;
      completedToday = List<String>.from(j['completedToday'] ?? []);
      nbackLevel = j['nbackLevel'] ?? 2;
      nbackBestScore = j['nbackBestScore'] ?? 0;
      focusBlocksToday = j['focusBlocksToday'] ?? 0;
      if (j['habits'] != null) {
        habits = (j['habits'] as List).map((h) => Habit.fromJson(h)).toList();
      }
      if (j['decisions'] != null) {
        decisions = (j['decisions'] as List).map((d) => Decision.fromJson(d)).toList();
      }
      if (j['systemicProblems'] != null) {
        systemicProblems = (j['systemicProblems'] as List).map((p) => SystemicProblem.fromJson(p)).toList();
      }
    } catch (_) {}
  }

  void _save() {
    final j = {
      'vagalState': vagalState.name,
      'totalPoints': totalPoints,
      'failureIndex': failureIndex,
      'consecutiveCycles': consecutiveCycles,
      'completedToday': completedToday,
      'nbackLevel': nbackLevel,
      'nbackBestScore': nbackBestScore,
      'focusBlocksToday': focusBlocksToday,
      'habits': habits.map((h) => h.toJson()).toList(),
      'decisions': decisions.map((d) => d.toJson()).toList(),
      'systemicProblems': systemicProblems.map((p) => p.toJson()).toList(),
    };
    _prefs?.setString('sinc_state', jsonEncode(j));
  }

  void setVagalState(VagalState vs) {
    vagalState = vs;
    notifyListeners();
    _save();
  }

  void completeActivity(String id) {
    if (completedToday.contains(id)) return;
    completedToday = [...completedToday, id];
    consecutiveCycles++;
    totalPoints += currentScoreInt;
    notifyListeners();
    _save();
  }

  void recordFailure() {
    failureIndex++;
    consecutiveCycles = 0;
    notifyListeners();
    _save();
  }

  void addDecision(Decision d) {
    decisions = [d, ...decisions];
    notifyListeners();
    _save();
  }

  void addSystemicProblem(SystemicProblem p) {
    systemicProblems = [p, ...systemicProblems];
    notifyListeners();
    _save();
  }

  void toggleHabit(String id) {
    habits = habits.map((h) {
      if (h.id == id) return Habit(id: h.id, label: h.label, completed: !h.completed);
      return h;
    }).toList();
    notifyListeners();
    _save();
  }

  void updateNback(int level, int score) {
    nbackLevel = level;
    if (score > nbackBestScore) nbackBestScore = score;
    notifyListeners();
    _save();
  }

  void incrementFocusBlock() {
    focusBlocksToday++;
    completeActivity('focus_block');
  }
}
