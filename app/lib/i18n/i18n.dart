import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../data/app_state.dart';

/// App languages. Same list as the website. Ghanaian languages fall back to English
/// for any phrase that has no translation yet; Dagbani and Gonja are coming soon.
class Lang {
  const Lang(this.code, this.name, {this.soon = false});
  final String code;
  final String name;
  final bool soon;

  static const all = [
    Lang('en', 'English'),
    Lang('tw', 'Twi (Asante)'),
    Lang('ak', 'Akuapem Twi'),
    Lang('fat', 'Fante'),
    Lang('gaa', 'Ga'),
    Lang('ee', 'Ewe'),
    Lang('fr', 'Français'),
    Lang('dag', 'Dagbani', soon: true),
    Lang('gjn', 'Gonja', soon: true),
  ];

  static Lang byCode(String c) => all.firstWhere((l) => l.code == c, orElse: () => all.first);
}

/// Loads `assets/i18n/<code>.json` (English phrase → translated phrase).
class Dictionary {
  static final Map<String, Map<String, String>> _cache = {};

  static Future<void> load(String code) async {
    if (code == 'en' || _cache.containsKey(code)) return;
    try {
      final raw = await rootBundle.loadString('assets/i18n/$code.json');
      _cache[code] = Map<String, String>.from(jsonDecode(raw) as Map);
    } catch (_) {
      _cache[code] = {};
    }
  }

  static String lookup(String code, String en) => _cache[code]?[en] ?? en;
}

/// `context.t('Log a harvest')` translates a phrase into the chosen language.
/// Numbers can be passed in with `{}` placeholders: `context.t('{} of 3', [2])`.
extension Translate on BuildContext {
  String t(String en, [List<Object?> args = const []]) {
    final code = AppScope.of(this).lang;
    var s = Dictionary.lookup(code, en);
    for (final a in args) {
      s = s.replaceFirst('{}', '$a');
    }
    return s;
  }
}
