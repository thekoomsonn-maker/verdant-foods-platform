import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/models.dart';
import '../../data/seed.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/language_sheet.dart';
import '../../widgets/ui.dart';
import 'farm_home.dart';

/// 14 · My harvests
class HarvestsScreen extends StatefulWidget {
  const HarvestsScreen({super.key});
  @override
  State<HarvestsScreen> createState() => _HarvestsScreenState();
}

class _HarvestsScreenState extends State<HarvestsScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final list = s.harvests.where((h) => switch (tab) { 1 => h.status == HarvestStatus.waiting, 2 => h.status == HarvestStatus.sold, 3 => h.status == HarvestStatus.collected, _ => true }).toList();
    return VPage(
      header: VHeader('My harvests', back: false, trailing: RoundIcon(LucideIcons.search, label: context.t('Search'), onTap: () => toast(context, 'Search by crop or trace number'))),
      children: [
        PillTabs(items: const ['All', 'Waiting', 'Sold', 'Collected'], selected: tab, onSelect: (i) => setState(() => tab = i)),
        Row(children: [
          Expanded(child: StatCard(kg(s.monthKg + 280), 'This month')),
          const SizedBox(width: 12),
          Expanded(child: StatCard('${s.harvests.length}', 'Harvests')),
        ]),
        for (final (i, h) in list.indexed) Rise(index: i, child: HarvestRow(h)),
        if (list.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Text(context.t('Nothing here yet.'), textAlign: TextAlign.center, style: VT.body.copyWith(color: VC.muted))),
      ],
    );
  }
}

/// A single harvest (opened from a list row).
class HarvestDetailScreen extends StatelessWidget {
  const HarvestDetailScreen(this.id, {super.key});
  final String id;
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final h = s.harvests.firstWhere((x) => x.id == id, orElse: () => s.harvests.first);
    return VPage(
      header: VHeader(h.trace),
      bottom: [if (h.status == HarvestStatus.waiting) VButton('Log a spray on this plot', kind: BtnKind.soft, icon: LucideIcons.sprayCan, onTap: () => context.push('/farm/spray'))],
      children: [
        ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.asset(h.crop.image, height: 190, fit: BoxFit.cover)),
        Text('${context.t(h.crop.name)} · ${kg(h.kg)}', style: VT.title),
        VCard(child: Column(children: [
          KV('Picked', context.t(h.when)),
          KV('Quality', context.t(h.grade)),
          KV('Your price', '${cedi(h.price, decimals: true)} ${context.t('a kg')}'),
          KV('Trace number', h.trace),
          KV('Status', context.t(h.sync == SyncState.sent ? 'Seen by buyers' : 'Saved on your phone')),
        ])),
      ],
    );
  }
}

/// 15 · Reply to an offer
class OfferScreen extends StatelessWidget {
  const OfferScreen(this.id, {super.key});
  final String id;
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final o = s.offers.firstWhere((x) => x.id == id, orElse: () => s.offers.first);
    void done(OfferState st, String msg) {
      s.update(() => o.state = st);
      toast(context, msg);
      context.go('/farm/orders');
    }

    return VPage(
      header: const VHeader('Offer to buy'),
      bottom: [
        VButton(context.t('Accept {}', [cedi(o.theirPrice, decimals: true)]), icon: LucideIcons.check, onTap: () => done(OfferState.accepted, 'Offer accepted. The truck comes on Thursday.')),
        VButton('Counter', kind: BtnKind.soft, icon: LucideIcons.pencil, compact: true, onTap: () => _counter(context, o)),
        VButton('Decline', kind: BtnKind.white, icon: LucideIcons.x, compact: true, onTap: () => done(OfferState.declined, 'Offer declined. Other buyers can still see your harvest.')),
      ],
      children: [
        VCard(
          child: Column(children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(14)),
              child: Row(children: [
                CropThumb(o.crop.image),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('${context.t(o.crop.name)} · ${kg(o.kg)}', style: VT.bodyStrong.copyWith(fontSize: 17, fontWeight: FontWeight.w500)), Text(o.trace, style: VT.small)])),
              ]),
            ),
            const SizedBox(height: 10),
            KV('Buyer', o.buyer),
            KV('Their price', '${cedi(o.theirPrice, decimals: true)} ${context.t('a kg')}'),
            KV('Your price', '${cedi(o.yourPrice, decimals: true)} ${context.t('a kg')}'),
            KV('Total to you', cedi(o.kg * o.theirPrice), valueColor: VC.leaf, strong: true),
            KV('Collection', o.collection),
          ]),
        ),
        Notice(context.t('Reply within {} hours or the offer ends', [o.hoursLeft]), tone: Tone.warning, icon: LucideIcons.clock),
        Text(context.t('You can make one counter offer.'), style: VT.small),
      ],
    );
  }

  void _counter(BuildContext context, Offer o) {
    var price = 10.0;
    showModalBottomSheet(
      context: context,
      builder: (c) => StatefulBuilder(
        builder: (c, set) => Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text(context.t('Your counter offer'), style: VT.heading),
            const SizedBox(height: 16),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              RoundIcon(LucideIcons.minus, onTap: () => set(() => price = (price - .5).clamp(1, 99))),
              const SizedBox(width: 20),
              Text('${cedi(price, decimals: true)} ${context.t('a kg')}', style: VT.title.copyWith(color: VC.deep)),
              const SizedBox(width: 20),
              RoundIcon(LucideIcons.plus, onTap: () => set(() => price += .5)),
            ]),
            const SizedBox(height: 8),
            Text(context.t('Total to you: {}', [cedi(o.kg * price)]), textAlign: TextAlign.center, style: VT.label.copyWith(color: VC.muted)),
            const SizedBox(height: 20),
            VButton('Send counter offer', onTap: () {
              AppScope.read(context).update(() => o.state = OfferState.countered);
              Navigator.pop(c);
              toast(context, 'Counter offer sent. The buyer has 24 hours to reply.');
              context.go('/farm/orders');
            }),
          ]),
        ),
      ),
    );
  }
}

/// 16 · Hand over at collection
class HandoverScreen extends StatefulWidget {
  const HandoverScreen({super.key});
  @override
  State<HandoverScreen> createState() => _HandoverScreenState();
}

class _HandoverScreenState extends State<HandoverScreen> {
  final checks = [true, true, false];
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Hand over'),
        bottom: [VButton('Confirm hand over', icon: LucideIcons.truck, onTap: checks.every((c) => c) ? () {
          toast(context, 'Hand over confirmed. Payment is on the way.');
          context.go('/farm/orders');
        } : null)],
        children: [
          ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.asset('assets/images/photos/truck-loading.jpg', height: 150, fit: BoxFit.cover)),
          const VCard(child: Column(children: [KV('Order', 'VF-ORD-2291'), KV('Crop', 'Tomatoes · 400 kg'), KV('Driver', 'Kwame · GT 4471-22'), KV('Trace number', 'VF-TOM-00048')])),
          const SectionLabel('Before the truck leaves', big: true),
          for (final (i, t) in ['Weighed together with the driver', '16 crates loaded', 'Driver scanned the QR code'].indexed)
            _TickLine(t, checks[i], () => setState(() => checks[i] = !checks[i])),
        ],
      );
}

class _TickLine extends StatelessWidget {
  const _TickLine(this.text, this.on, this.onTap);
  final String text;
  final bool on;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => VCard(onTap: onTap, child: Row(children: [TickBox(on), const SizedBox(width: 14), Expanded(child: Text(context.t(text), style: VT.body.copyWith(fontSize: 17)))]));
}

/// 17 · Orders
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final orders = AppScope.of(context).orders.where((o) => o.stage.index == tab).toList();
    return VPage(
      header: const VHeader('Orders', back: false),
      children: [
        PillTabs(items: const ['Open', 'Collected', 'Paid'], selected: tab, onSelect: (i) => setState(() => tab = i)),
        for (final (i, o) in orders.indexed)
          Rise(
            index: i,
            child: VCard(
              onTap: () => context.push(o.needsReply ? '/farm/offer/o1' : '/farm/handover'),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  CropThumb(o.crop.image),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(o.buyer, style: VT.bodyStrong.copyWith(fontSize: 17)),
                    Text('${context.t(o.crop.name)} ${kg(o.kg)} · ${context.t(o.note)}', style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
                  ])),
                ]),
                const SizedBox(height: 12),
                Row(children: [Tag(o.tag, Tag.toneFor(o.tag)), const Spacer(), Text(context.t('View'), style: VT.label.copyWith(color: VC.leaf, fontWeight: FontWeight.w600))]),
              ]),
            ),
          ),
      ],
    );
  }
}

/// 18 · Money
class MoneyScreen extends StatelessWidget {
  const MoneyScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    return VPage(
      header: const VHeader('Money', back: false),
      children: [
        Rise(child: MoneyCard(label: 'Paid to you this season', amount: cedi(s.paidSeason), note: 'MoMo · 024 ••• 4471')),
        Rise(index: 1, child: Row(children: [
          Expanded(child: StatCard(cedi(s.moneyComing), 'On the way')),
          const SizedBox(width: 12),
          Expanded(child: StatCard(cedi(3800), 'After collection')),
        ])),
        const SectionLabel('Payments', big: true),
        for (final (i, p) in Seed.payments.indexed)
          Rise(
            index: 2 + i,
            child: RowTile(
              leading: const IconChip(LucideIcons.banknote, size: 42),
              title: p.title,
              subtitle: p.date,
              trailing: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(cedi(p.amount), style: VT.bodyStrong.copyWith(color: VC.deep, fontSize: 17)),
                Text(context.t(p.onTheWay ? 'On the way' : 'Paid'), style: VT.small.copyWith(color: p.onTheWay ? VC.info : VC.leaf)),
              ]),
            ),
          ),
      ],
    );
  }
}

/// 19 · Profile and sync
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final pending = s.pending.length;
    return VPage(
      header: const VHeader('My farm'),
      children: [
        VCard(
          padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
          child: Column(children: [
            const CircleAvatar(radius: 40, backgroundImage: AssetImage('assets/images/photos/farmer-amina.jpg')),
            const SizedBox(height: 12),
            Text(s.farmerName, style: VT.heading.copyWith(fontSize: 22)),
            const SizedBox(height: 4),
            Text('${s.farmName} · ${s.place} · ${context.t('{} acres', [4])}', style: VT.small),
            const SizedBox(height: 10),
            const Tag('Verified farm', Tone.success),
          ]),
        ),
        GestureDetector(
          onTap: () => context.push('/farm/sync'),
          child: pending == 0
              ? Notice(context.t('Last sent {} minutes ago', [2]), tone: Tone.success, icon: LucideIcons.circleCheck)
              : Notice(context.t('{} records waiting to send', [pending]), tone: Tone.warning, icon: LucideIcons.cloudUpload),
        ),
        _Row(LucideIcons.languages, 'Language', Lang.byCode(s.lang).name, () => showLanguageSheet(context)),
        _Row(LucideIcons.mapPin, 'Farm location', 'Techiman North, Bono East', () => toast(context, 'Your field officer updates the farm map')),
        _Row(LucideIcons.wallet, 'Payment', 'MoMo · 024 ••• 4471', () => toast(context, 'Payment changes are checked by Verdant for your safety')),
        _Row(LucideIcons.users, 'Savings group', 'Nkwanta Women VSLA', () => context.go('/group')),
        _Row(LucideIcons.circleHelp, 'Get help', 'Call your field officer', () => toast(context, 'Calling Issah Mahama · 024 318 7720')),
        _Row(LucideIcons.repeat, 'Switch space', 'Farmer, savings group or field officer', () => showSpaceSheet(context)),
      ],
    );
  }
}

class _Row extends StatelessWidget {
  const _Row(this.icon, this.title, this.sub, this.onTap);
  final IconData icon;
  final String title;
  final String sub;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => RowTile(leading: IconChip(icon, size: 42), title: title, subtitle: sub, trailing: const Icon(LucideIcons.chevronRight, size: 20, color: VC.muted), onTap: onTap);
}

/// 20 · Notifications
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    Widget n(IconData i, String t, String s, {Color bg = VC.mist, Color fg = VC.deep, String? go}) => RowTile(leading: IconChip(i, size: 42, bg: bg, fg: fg), title: t, subtitle: s, onTap: go == null ? null : () => context.push(go));
    return VPage(
      header: const VHeader('Notifications'),
      children: [
        const SectionLabel('Today'),
        n(LucideIcons.gavel, 'New offer for your tomatoes', 'Accra Fresh Market · GH₵ 9.50 a kg', bg: VC.warningBg, fg: VC.orange, go: '/farm/offer/o1'),
        n(LucideIcons.banknote, 'Payment on the way', 'GH₵ 2,480 for pepper · Friday', go: '/farm/money'),
        n(LucideIcons.truck, 'Truck coming Thursday', 'Kwame will collect at 9 am', go: '/farm/handover'),
        const SectionLabel('This week'),
        n(LucideIcons.circleCheck, 'Okra collected', '60 kg · VF-OKR-00019', go: '/farm/harvests'),
        n(LucideIcons.sprout, 'Field visit booked', 'Officer Yaw · Wednesday'),
        n(LucideIcons.cloudUpload, 'Records sent', '3 harvests saved online'),
      ],
    );
  }
}

/// 08 · Sending and could not send
class SendingScreen extends StatelessWidget {
  const SendingScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final items = [
      ...s.pending.map((h) => ('${context.t('Harvest')} · ${context.t(h.crop.name)} ${kg(h.kg)}', h.sync)),
      if (s.pending.isEmpty) ...[('${context.t('Harvest')} · ${context.t('Tomatoes')} 480 kg', SyncState.sent), ('${context.t('Harvest')} · ${context.t('Okra')} 90 kg', SyncState.sending)],
      (context.t('Photo · {} of {}', [2, 2]), SyncState.failed),
    ];
    final sending = items.where((i) => i.$2 != SyncState.sent).length;
    return VPage(
      header: const VHeader('Sending to Verdant'),
      bottom: [
        VButton('Try again now', icon: LucideIcons.refreshCw, onTap: () {
          if (!s.online) return toast(context, 'No signal yet. We will try again by ourselves.');
          s.syncNow();
          toast(context, 'Sending now');
        }),
        VButton('Send later', kind: BtnKind.soft, onTap: () => context.pop()),
      ],
      children: [
        Notice(context.t(s.online ? 'Sending {} records to Verdant…' : '{} records will send when you have signal', [sending]), tone: s.online ? Tone.info : Tone.warning, icon: LucideIcons.refreshCw),
        VCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Column(children: [
            for (final (t, st) in items)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(children: [
                  Expanded(child: Text(t, style: VT.body)),
                  Tag(switch (st) { SyncState.sent => 'Sent', SyncState.sending => 'Sending', SyncState.failed => 'Could not send', SyncState.saved => 'Waiting' }, switch (st) { SyncState.sent => Tone.success, SyncState.sending => Tone.info, SyncState.failed => Tone.danger, SyncState.saved => Tone.warning }),
                ]),
              ),
          ]),
        ),
        const Notice('The photo could not send. We will try again when signal is better.', tone: Tone.danger, icon: LucideIcons.circleAlert),
      ],
    );
  }
}

/// 37 · Log a spray
class SprayScreen extends StatefulWidget {
  const SprayScreen({super.key});
  @override
  State<SprayScreen> createState() => _SprayScreenState();
}

class _SprayScreenState extends State<SprayScreen> {
  int plot = 0;
  int product = 0;
  int amount = 2;
  static const products = [(LucideIcons.sprout, 'Copper fungicide', 'Approved · wait 14 days', 14), (LucideIcons.leaf, 'Neem spray', 'Natural · wait 7 days', 7), (LucideIcons.tractor, 'Compost or manure', 'No wait', 0)];

  @override
  Widget build(BuildContext context) {
    final wait = products[product].$4;
    final safe = DateTime.now().add(Duration(days: wait));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final safeText = '${safe.day} ${months[safe.month - 1]}';
    final plotName = ['Plot A', 'Plot B', 'Plot C'][plot];
    return VPage(
      header: const VHeader('Log a spray', trailingText: 'Step 1 of 1'),
      bottom: [
        VButton('Label photo', kind: BtnKind.soft, icon: LucideIcons.camera, compact: true, onTap: () => toast(context, 'Take a photo of the product label')),
        VButton('Save', icon: LucideIcons.check, compact: true, onTap: () {
          if (wait == 0) {
            toast(context, 'Spray saved');
            context.go('/farm');
            return;
          }
          context.push(Uri(path: '/farm/spray/wait', queryParameters: {'plot': plotName, 'days': '$wait', 'safe': safeText, 'product': products[product].$2}).toString());
        }),
      ],
      children: [
        const SectionLabel('Which plot?'),
        Wrap(spacing: 8, children: [for (final (i, p) in ['Plot A', 'Plot B', 'Plot C'].indexed) Pill(p, on: plot == i, onTap: () => setState(() => plot = i))]),
        const SectionLabel('What did you use?'),
        for (final (i, p) in products.indexed) CheckRow(leading: IconChip(p.$1, size: 42, bg: VC.white), title: p.$2, sub: p.$3, on: product == i, highlight: true, onTap: () => setState(() => product = i)),
        VCard(child: Row(children: [Expanded(child: Text(context.t('How much'), style: VT.bodyStrong.copyWith(fontSize: 17, fontWeight: FontWeight.w500))), Counter(value: amount, min: 1, suffix: ' ${context.t('sachets')}', onChanged: (v) => setState(() => amount = v))])),
        if (wait > 0) Notice(context.t('Do not pick {} before {}', [context.t(plotName), safeText]), sub: 'We will remind you the day it is safe.', tone: Tone.warning, icon: LucideIcons.clock),
      ],
    );
  }
}

/// 38 · Not safe to pick yet
class NotSafeScreen extends StatelessWidget {
  const NotSafeScreen({super.key, required this.plot, required this.days, required this.safe, required this.product});
  final String plot;
  final int days;
  final String safe;
  final String product;

  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Log harvest', close: true),
        bottom: [
          VButton(context.t('Remind me on {}', [safe]), icon: LucideIcons.bell, onTap: () {
            toast(context, 'Reminder set');
            context.go('/farm');
          }),
          VButton('Log another plot', kind: BtnKind.white, onTap: () => context.pushReplacement('/farm/spray')),
        ],
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 22),
            decoration: BoxDecoration(color: VC.dangerBg, borderRadius: BorderRadius.circular(20)),
            child: Column(children: [
              Container(width: 70, height: 70, decoration: const BoxDecoration(color: VC.white, shape: BoxShape.circle), child: const Icon(LucideIcons.shieldAlert, size: 30, color: VC.danger)),
              const SizedBox(height: 14),
              Text(context.t('Wait {} more days', [days]), style: VT.title.copyWith(color: VC.danger)),
              const SizedBox(height: 8),
              Text(context.t('{} was sprayed today. {} are safe to pick from {}.', [context.t(plot), context.t('Tomatoes'), safe]), textAlign: TextAlign.center, style: VT.body.copyWith(fontSize: 17)),
            ]),
          ),
          Row(children: [for (var i = 0; i < 14; i++) ...[if (i > 0) const SizedBox(width: 4), Expanded(child: Container(height: 12, decoration: BoxDecoration(color: i < 14 - days ? VC.danger : VC.line, borderRadius: BorderRadius.circular(4))))]]),
          Row(children: [Text(context.t('Sprayed today'), style: VT.small), const Spacer(), Text(context.t('Safe {}', [safe]), style: VT.small.copyWith(color: VC.deep, fontWeight: FontWeight.w600))]),
          VCard(child: Column(children: [KV('Last spray', context.t(product)), KV('Safe gap', context.t('{} days', [days])), KV('Logged by', context.t('You, checked by Yaw'))])),
          Text(context.t('Picking early can make people sick, and the harvest cannot be sold.'), style: VT.small),
        ],
      );
}
