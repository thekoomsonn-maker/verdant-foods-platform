import 'dart:async';
import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../i18n/i18n.dart';
import 'models.dart';
import 'seed.dart';

/// Everything the app shows lives here and is saved on the phone, so the app keeps
/// working without signal. Records wait in [pending] until the phone is online.
class AppState extends ChangeNotifier {
  AppState._(this._prefs);
  final SharedPreferences _prefs;

  static Future<AppState> load() async {
    final s = AppState._(await SharedPreferences.getInstance());
    s._restore();
    await Dictionary.load(s.lang);
    return s;
  }

  // ---- Settings ----
  String lang = 'en';
  bool onboarded = false;
  bool online = true;
  String phone = '24 555 0182';

  // ---- Farmer ----
  String farmerName = 'Amina Agyeman';
  String farmName = 'Agyeman Farms';
  String place = 'Techiman';
  List<String> growing = ['tomatoes', 'pepper', 'okra'];
  List<Harvest> harvests = Seed.harvests();
  final List<Offer> offers = Seed.offers();
  final List<Order> orders = Seed.orders();
  int moneyComing = 2480;
  int paidSeason = 14920;

  // ---- Savings group ----
  final List<Member> members = Seed.members();
  final List<Loan> loans = Seed.loans();
  int meetingNo = 14;
  int unsentMeetings = 2;
  int groupSavings = 18640;
  int outOnLoan = 9200;
  int socialFund = 1150;

  // ---- Field officer ----
  final List<QueueItem> officerQueue = Seed.officerQueue();

  // ---- Harvest being logged ----
  HarvestDraft draft = HarvestDraft();

  void startHarvest() {
    draft = HarvestDraft();
    notifyListeners();
  }

  void update(VoidCallback f) {
    f();
    notifyListeners();
  }

  Future<void> setLang(String code) async {
    await Dictionary.load(code);
    lang = code;
    _prefs.setString('lang', code);
    notifyListeners();
  }

  void finishOnboarding() {
    onboarded = true;
    _prefs.setBool('onboarded', true);
    notifyListeners();
  }

  void resetDemo() {
    _prefs.clear();
    lang = 'en';
    onboarded = false;
    online = true;
    harvests = Seed.harvests();
    notifyListeners();
  }

  /// Saves the harvest on the phone and queues it for Verdant.
  Harvest saveHarvest() {
    final c = draft.crop;
    final n = 49 + harvests.where((h) => h.id.startsWith('n')).length;
    final h = Harvest(
      id: 'n$n',
      crop: c,
      kg: draft.kg,
      when: 'Today',
      trace: 'VF-${c.code}-${n.toString().padLeft(5, '0')}',
      grade: draft.grade,
      price: draft.price,
      sync: online ? SyncState.sending : SyncState.saved,
    );
    harvests.insert(0, h);
    _persist();
    notifyListeners();
    if (online) _send([h]);
    return h;
  }

  List<Harvest> get pending => harvests.where((h) => h.sync != SyncState.sent).toList();

  void setOnline(bool v) {
    online = v;
    notifyListeners();
    if (v && pending.isNotEmpty) syncNow();
  }

  void syncNow() {
    final items = pending;
    if (!online || items.isEmpty) return;
    for (final h in items) {
      h.sync = SyncState.sending;
    }
    notifyListeners();
    _send(items);
  }

  void _send(List<Harvest> items) {
    Timer(const Duration(milliseconds: 1600), () {
      for (final h in items) {
        h.sync = online ? SyncState.sent : SyncState.saved;
      }
      _persist();
      notifyListeners();
    });
  }

  int get monthKg => harvests.take(4).fold(0, (a, h) => a + h.kg);

  // ---- Persistence ----
  void _persist() {
    final mine = harvests.where((h) => h.id.startsWith('n')).map((h) => h.toJson()).toList();
    _prefs.setString('harvests', jsonEncode(mine));
  }

  void _restore() {
    lang = _prefs.getString('lang') ?? 'en';
    onboarded = _prefs.getBool('onboarded') ?? false;
    final raw = _prefs.getString('harvests');
    if (raw == null) return;
    try {
      final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      final mine = list.map((j) => Harvest(
            id: j['id'] as String,
            crop: Seed.crop(j['crop'] as String),
            kg: j['kg'] as int,
            when: j['when'] as String,
            trace: j['trace'] as String,
            grade: j['grade'] as String,
            price: (j['price'] as num).toDouble(),
            status: HarvestStatus.values[j['status'] as int],
            sync: SyncState.values[j['sync'] as int] == SyncState.sending ? SyncState.saved : SyncState.values[j['sync'] as int],
            hasPhoto: j['photo'] as bool,
          ));
      harvests = [...mine, ...Seed.harvests()];
    } catch (_) {}
  }
}

class HarvestDraft {
  Crop crop = Seed.crops.first;
  int kg = 400;
  String grade = 'Grade A';
  double price = 9;
  bool photo = true;
  int get crates => (kg / crop.crateKg).round();
}

/// Makes [AppState] available to every screen and rebuilds them when it changes.
class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child}) : super(notifier: state);

  static AppState of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;
  static AppState read(BuildContext context) => context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}
