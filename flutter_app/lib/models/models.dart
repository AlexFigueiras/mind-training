class Decision {
  final String id;
  final String title;
  final String? type; // 'type1' | 'type2' | null
  final List<int> biases;
  final String belief;
  final List<String> decomposed;
  final String rebuilt;
  final DateTime createdAt;

  Decision({
    required this.id,
    required this.title,
    this.type,
    required this.biases,
    this.belief = '',
    this.decomposed = const [],
    this.rebuilt = '',
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id, 'title': title, 'type': type,
    'biases': biases, 'belief': belief,
    'decomposed': decomposed, 'rebuilt': rebuilt,
    'createdAt': createdAt.toIso8601String(),
  };

  factory Decision.fromJson(Map<String, dynamic> j) => Decision(
    id: j['id'], title: j['title'], type: j['type'],
    biases: List<int>.from(j['biases'] ?? []),
    belief: j['belief'] ?? '', decomposed: List<String>.from(j['decomposed'] ?? []),
    rebuilt: j['rebuilt'] ?? '',
    createdAt: DateTime.parse(j['createdAt']),
  );
}

class SystemicProblem {
  final String id;
  final String event;
  final String pattern;
  final String structure;
  final String mentalModel;
  final DateTime createdAt;

  SystemicProblem({
    required this.id, required this.event, required this.pattern,
    required this.structure, required this.mentalModel, required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id, 'event': event, 'pattern': pattern,
    'structure': structure, 'mentalModel': mentalModel,
    'createdAt': createdAt.toIso8601String(),
  };

  factory SystemicProblem.fromJson(Map<String, dynamic> j) => SystemicProblem(
    id: j['id'], event: j['event'], pattern: j['pattern'],
    structure: j['structure'], mentalModel: j['mentalModel'],
    createdAt: DateTime.parse(j['createdAt']),
  );
}

class Habit {
  final String id;
  final String label;
  bool completed;

  Habit({required this.id, required this.label, this.completed = false});

  Map<String, dynamic> toJson() => {'id': id, 'label': label, 'completed': completed};
  factory Habit.fromJson(Map<String, dynamic> j) =>
      Habit(id: j['id'], label: j['label'], completed: j['completed'] ?? false);
}
