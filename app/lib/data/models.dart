/// Plain data models. These mirror what the Verdant backend sends; the app keeps a copy
/// on the phone so everything works without signal.
library;

enum SyncState { saved, sending, sent, failed }

class Crop {
  const Crop(this.id, this.name, this.code, {this.crateKg = 25, this.marketLow = 8.5, this.marketHigh = 10});
  final String id;
  final String name;
  final String code; // used in trace numbers, e.g. VF-TOM-00048
  final int crateKg;
  final double marketLow;
  final double marketHigh;
  String get image => 'assets/images/crops/$id.jpg';
}

enum HarvestStatus { waiting, sold, collected }

class Harvest {
  Harvest({required this.id, required this.crop, required this.kg, required this.when, required this.trace, this.grade = 'Grade A', this.price = 9, this.status = HarvestStatus.waiting, this.sync = SyncState.sent, this.hasPhoto = true});
  final String id;
  final Crop crop;
  final int kg;
  final String when;
  final String trace;
  final String grade;
  final double price;
  HarvestStatus status;
  SyncState sync;
  bool hasPhoto;

  Map<String, Object?> toJson() => {'id': id, 'crop': crop.id, 'kg': kg, 'when': when, 'trace': trace, 'grade': grade, 'price': price, 'status': status.index, 'sync': sync.index, 'photo': hasPhoto};
}

enum OfferState { open, accepted, countered, declined }

class Offer {
  Offer({required this.id, required this.buyer, required this.crop, required this.kg, required this.theirPrice, required this.yourPrice, required this.trace, required this.collection, required this.hoursLeft, this.state = OfferState.open});
  final String id;
  final String buyer;
  final Crop crop;
  final int kg;
  final double theirPrice;
  final double yourPrice;
  final String trace;
  final String collection;
  final int hoursLeft;
  OfferState state;
}

enum OrderStage { open, collected, paid }

class Order {
  Order({required this.id, required this.buyer, required this.crop, required this.kg, required this.note, required this.tag, required this.stage, this.needsReply = false});
  final String id;
  final String buyer;
  final Crop crop;
  final int kg;
  final String note;
  final String tag;
  final OrderStage stage;
  final bool needsReply;
}

class Payment {
  const Payment(this.title, this.date, this.amount, this.onTheWay);
  final String title;
  final String date;
  final int amount;
  final bool onTheWay;
}

class Member {
  Member({required this.name, required this.note, required this.saved, required this.shares, this.present = true, this.apology = false, this.late = false, this.onLoan = false, this.todayShares = 0});
  final String name;
  final String note;
  final int saved;
  final int shares;
  bool present;
  final bool apology;
  final bool late;
  final bool onLoan;
  int todayShares;
  String get initials => name.split(' ').map((p) => p[0]).take(2).join();
}

enum LoanState { late, due, onTime, newLoan, paid, part }

class Loan {
  Loan({required this.member, required this.amount, required this.note, required this.state, this.left = 0});
  final String member;
  final int amount;
  final String note;
  LoanState state;
  int left;
}

class Visit {
  const Visit(this.place, this.time, this.task, this.tag, {this.icon = 'sprout', this.route = '/officer/check'});
  final String place;
  final String time;
  final String task;
  final String tag;
  final String icon;
  final String route;
}

class FarmerRow {
  const FarmerRow(this.name, this.farm, this.tag);
  final String name;
  final String farm;
  final String tag;
  String get initials => name.split(' ').map((p) => p[0]).take(2).join();
}

class QueueItem {
  QueueItem(this.title, this.note, this.icon, this.state);
  final String title;
  final String note;
  final String icon;
  SyncState state;
}
